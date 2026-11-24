#!/usr/bin/env node
/**
 * "Nothing changed" check, the safety net of every refactoring.
 *
 * Opens every page that check-pages.mjs opens (scripts/lib/pages.mjs), at
 * 1280 x 900 with the frozen date, once the kit has rendered it, and records:
 *   - the rendered DOM (document.documentElement.outerHTML, normalised), and
 *   - the accessibility tree of <body> (Playwright ariaSnapshot),
 * (see serialise() and forgetLayout()), plus the gzip size of every built file of kit/v1/ and widgets/v1/.
 *
 * tests/dom-record.json keeps a SHA-256 of each page's DOM and tree and the
 * sizes. The check fails when a page's DOM or tree differs from the record,
 * when a page is new or gone, or when a built file got bigger. A refactoring
 * must pass it unchanged; a change that is meant to alter pages updates the
 * record (--update) in the same pull request, so the diff of the record shows
 * which pages it changed.
 *
 * Usage:
 *   node scripts/check-dom.mjs [--shard=i/n] [--concurrency=n] [filter ...]
 *   node scripts/check-dom.mjs --update            rewrite the record (every page)
 *   node scripts/check-dom.mjs --save=DIR          also write each page's DOM and tree to DIR
 *   node scripts/check-dom.mjs --against=REF       for each changed page, print a diff
 *                                                  against the same page rendered at the
 *                                                  git commit REF (e.g. origin/main)
 *
 * Determinism: requests to other sites are aborted (CDN scripts such as the
 * syntax highlighter or Codapi never load), the public kit URL is answered
 * from kit/ on disk, the server's origin is replaced by "http://localhost",
 * and the date is frozen (TEST_TODAY, default 2025-11-27, as check-pages).
 */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { gzipSize } from "./lib/budgets.mjs";
import { TODAY, waitForGrading, waitForReveal, waitForSearchButton, withBrowser, withToday } from "./lib/browser.mjs";
import { exists, findPages } from "./lib/pages.mjs";
import { filterArgs, logShard, matchFilters, option, parseConcurrency, parseShard, runPool, shardOf } from "./lib/runner.mjs";
import { ROOT, routePublicKit } from "./lib/server.mjs";

const RECORD = path.join(ROOT, "tests", "dom-record.json");
const VIEWPORT = { width: 1280, height: 900 };
/** Built folders whose .js and .css files must not grow (refactoring rule). */
const BUILT_DIRS = ["kit/v1", "widgets/v1"];

const sha = (text) => createHash("sha256").update(text).digest("hex").slice(0, 16);
const toPosix = (file) => file.split(path.sep).join("/");

/** "examples/x/index.html" or "tests/widgets/compat.html?release=v1.0.0", relative to root. */
function pageKey(item, root) {
  const [file, query] = item.split("?");
  return toPosix(path.relative(root, file)) + (query ? `?${query}` : "");
}

/** Gzip sizes of the built .js and .css files (source maps excluded). */
async function builtSizes(root = ROOT) {
  const sizes = {};
  for (const dir of BUILT_DIRS) {
    const absolute = path.join(root, dir);
    if (!(await exists(absolute))) continue;
    for (const name of (await readdir(absolute)).sort()) {
      if (!/\.(js|css)$/.test(name)) continue;
      sizes[`${dir}/${name}`] = gzipSize(await readFile(path.join(absolute, name)));
    }
  }
  return sizes;
}

/** A context that serves the public kit from `root` and never reaches another site. */
async function newContext(browser, origin, root) {
  const context = await browser.newContext({ viewport: VIEWPORT, reducedMotion: "reduce" });
  await context.route(
    (url) => url.origin !== origin,
    (route) => route.abort(),
  );
  await routePublicKit(context, root); // registered last, so it is tried first
  return context;
}

/**
 * Removes what the kit decides from the layout, which depends on the fonts of
 * the machine (CI and a laptop measure text differently): the Tab stop, role
 * and label of a table or <pre> while it overflows (core/tables.js), the Tab
 * stop of a read-only <uc-code> that overflows, and the "Nesta página" link
 * of the section in view (<uc-guide>, and the layout "docs"). Runs in the page; returns whether it
 * removed anything.
 */
function forgetLayout() {
  let found = false;
  for (const wrapper of document.querySelectorAll("[data-uc-scroll-focus]")) {
    found = true;
    for (const name of wrapper.getAttribute("data-uc-scroll-focus").split(" ")) if (name) wrapper.removeAttribute(name);
    wrapper.removeAttribute("data-uc-scroll-focus");
  }
  for (const scroller of document.querySelectorAll(".uc-code__scroll:not(.uc-code__editor)[tabindex]")) {
    found = true;
    scroller.removeAttribute("tabindex");
  }
  for (const link of document.querySelectorAll(".uc-guide__toc-link[aria-current], .uc-toc__link[aria-current]")) {
    found = true;
    link.removeAttribute("aria-current");
  }
  // The documentation: demo frames take the height of their content, and the
  // "Nesta página" link of the section in view is .is-active (docs/assets/docs.js).
  for (const frame of document.querySelectorAll(".docs-demo__frame")) frame.style.removeProperty("height");
  for (const link of document.querySelectorAll("a.is-active[href^='#']")) {
    found = true;
    link.classList.remove("is-active");
  }
  return found;
}

/**
 * The page's DOM as text, with attributes and class names sorted and styles
 * written the browser's way: components render in parallel, so the order in
 * which they set attributes on shared elements such as <html> varies between
 * runs. Runs in the page (it rewrites the attributes in place).
 */
function serialise() {
  for (const element of document.querySelectorAll("*")) {
    const canonical = (name, value) => {
      if (name === "class") return value.split(/\s+/).filter(Boolean).sort().join(" ");
      // "height: 286px" (as written) and "height: 286px;" (as set by a script)
      // are the same style; class="" and style="" are no attribute at all.
      if (name === "style" && element.style) return element.style.cssText;
      return value;
    };
    const attributes = Array.from(element.attributes, ({ name, value }) => [name, canonical(name, value)]);
    for (const [name] of attributes) element.removeAttribute(name);
    const kept = attributes.filter(([name, value]) => value !== "" || (name !== "class" && name !== "style"));
    for (const [name, value] of kept.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))) element.setAttribute(name, value);
  }
  return `<!doctype html>\n${document.documentElement.outerHTML}\n`;
}

/** Renders one page and returns its normalised DOM and accessibility tree. */
async function capture(browser, key, origin, root) {
  const context = await newContext(browser, origin, root);
  try {
    const page = await context.newPage();
    await page.goto(withToday(`${origin}/${key}`), { waitUntil: "load" });
    await waitForReveal(page);
    await waitForGrading(page);
    if (key.startsWith("tests/widgets/compat.html")) {
      await page.waitForFunction(() => document.documentElement.dataset.compat, null, { timeout: 10000 }).catch(() => {});
    }
    await page.waitForLoadState("networkidle").catch(() => {});
    // Layout and theme test pages run their checks after the page shows (tests/pages/layouts/check.js).
    await page
      .waitForFunction(() => !document.querySelector('script[src$="layouts/check.js"]') || document.documentElement.dataset.layoutTests, null, { timeout: 5000 })
      .catch(() => {});
    // Widgets build when they come near the screen (widgets-api.md 2.4) and
    // every widget builds before printing: "beforeprint" builds them all, so
    // the record does not depend on how far the page scrolled or how fast.
    await page.evaluate(() => window.dispatchEvent(new Event("beforeprint")));
    await page
      .waitForFunction(() => !document.querySelector(":not(:defined)"), null, { timeout: 5000 })
      .catch(() => {});
    await page.waitForLoadState("networkidle").catch(() => {});
    // The header search button stays a hidden placeholder until the index answers.
    await waitForSearchButton(page, 3000);
    await page.waitForTimeout(300);
    // Let the last layout settle, so no resize observer runs after forgetLayout().
    await page.evaluate(() => document.fonts.ready.then(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))));
    // A resize observer of the kit can put the attributes back while the tree
    // is read: read it again until they stay away (forgetLayout returns false).
    let aria = "";
    for (let attempt = 0; attempt < 5; attempt += 1) {
      await page.evaluate(forgetLayout);
      aria = `${await page.locator("body").ariaSnapshot()}\n`;
      if (!(await page.evaluate(forgetLayout))) break;
    }
    // forgetLayout() again in the same task: a demo frame may have reported its height meanwhile.
    const html = await page.evaluate(`(${forgetLayout})(); (${serialise})()`);
    const normalise = (text) => text.split(origin).join("http://localhost");
    return { dom: normalise(html), aria: normalise(aria) };
  } finally {
    await context.close();
  }
}

/** Renders `keys` from `root`; resolves with { key: { dom, aria } | { error } }. */
async function renderAll(keys, root, concurrency, onPage = () => {}) {
  const results = {};
  await withBrowser(
    ({ browser, origin }) =>
      runPool(
        keys,
        concurrency,
        (key) => capture(browser, key, origin, root),
        (key, result) => {
          results[key] = result;
          onPage(key, result);
        },
      ),
    root,
  );
  return results;
}

async function saveCaptures(dir, results) {
  for (const [key, result] of Object.entries(results)) {
    if (result.error) continue;
    const base = path.join(dir, key.replace(/\?/g, "__").replace(/[=&]/g, "-"));
    await mkdir(path.dirname(base), { recursive: true });
    await writeFile(`${base}.dom.html`, result.dom);
    await writeFile(`${base}.aria.yml`, result.aria);
  }
}

/** Renders the changed pages at git commit `ref` and prints a diff for each. */
async function printDiffs(ref, keys, current, concurrency) {
  const worktree = await mkdtemp(path.join(os.tmpdir(), "uc-dom-"));
  execFileSync("git", ["worktree", "add", "--detach", "--quiet", worktree, ref], { cwd: ROOT, stdio: "inherit" });
  const before = await mkdtemp(path.join(os.tmpdir(), "uc-dom-before-"));
  const after = await mkdtemp(path.join(os.tmpdir(), "uc-dom-after-"));
  try {
    const existing = [];
    for (const key of keys) if (await exists(path.join(worktree, key.split("?")[0]))) existing.push(key);
    await saveCaptures(before, await renderAll(existing, worktree, concurrency));
    await saveCaptures(after, Object.fromEntries(keys.map((key) => [key, current[key]])));
    console.log(`\nDiff of the changed pages: ${ref} (a/) → this checkout (b/)\n`);
    try {
      execFileSync("git", ["diff", "--no-index", "--no-color", "--src-prefix=a/", "--dst-prefix=b/", before, after], { stdio: "inherit" });
    } catch {
      // git diff --no-index exits with 1 when the folders differ.
    }
  } finally {
    execFileSync("git", ["worktree", "remove", "--force", worktree], { cwd: ROOT });
    await rm(before, { recursive: true, force: true });
    await rm(after, { recursive: true, force: true });
  }
}

/** The record as JSON with one line per page and per file, so a diff lists the pages a change touched. */
function formatRecord({ pages, sizes, ...rest }) {
  const lines = (object) =>
    Object.entries(object)
      .map(([key, value]) => `  ${JSON.stringify(key)}: ${JSON.stringify(value)}`)
      .join(",\n");
  const head = Object.entries(rest).map(([key, value]) => ` ${JSON.stringify(key)}: ${JSON.stringify(value)},`);
  return `{\n${head.join("\n")}\n "pages": {\n${lines(pages)}\n },\n "sizes": {\n${lines(sizes)}\n }\n}\n`;
}

async function main() {
  const args = process.argv.slice(2);
  const update = args.includes("--update");
  const saveDir = option(args, "save");
  const against = option(args, "against");
  const filters = filterArgs(args);
  const shard = parseShard(args);
  const concurrency = parseConcurrency(args);
  if (update && (filters.length || shard.total > 1)) throw new Error("--update rewrites the whole record: run it without filters or --shard");

  const all = (await findPages()).map((item) => pageKey(item, ROOT));
  const matching = matchFilters(all, filters);
  const keys = shardOf(matching, shard);
  const record = JSON.parse(await readFile(RECORD, "utf8").catch(() => '{"pages":{},"sizes":{}}'));
  logShard(shard, keys.length, matching.length);

  const problems = [];
  const changed = [];
  const crashed = [];
  const results = await renderAll(keys, ROOT, concurrency, (key, result) => {
    if (result.error) {
      crashed.push(key);
      console.log(`FAIL ${key}\n       ✗ could not render: ${result.error.stack || result.error}`);
      return;
    }
    const expected = record.pages[key];
    const actual = { dom: sha(result.dom), aria: sha(result.aria) };
    if (update) return;
    if (!expected) {
      changed.push(key);
      console.log(`new  ${key} (not in the record)`);
    } else if (expected.dom !== actual.dom || expected.aria !== actual.aria) {
      changed.push(key);
      const what = [expected.dom !== actual.dom && "DOM", expected.aria !== actual.aria && "accessibility tree"].filter(Boolean).join(" and ");
      console.log(`FAIL ${key}: ${what} changed`);
    }
  });

  const sizes = await builtSizes();
  if (update) {
    if (crashed.length) throw new Error(`${crashed.length} pages could not be rendered; the record was not written`);
    const pages = {};
    for (const key of [...keys].sort()) pages[key] = { dom: sha(results[key].dom), aria: sha(results[key].aria) };
    const next = { today: TODAY, viewport: `${VIEWPORT.width}x${VIEWPORT.height}`, pages, sizes };
    await writeFile(RECORD, formatRecord(next));
    console.log(`Wrote ${toPosix(path.relative(ROOT, RECORD))}: ${keys.length} pages, ${Object.keys(sizes).length} built files.`);
  } else {
    if (!filters.length) {
      // Pages gone since the record (only the pages of this shard).
      const gone = shardOf(Object.keys(record.pages).filter((key) => !all.includes(key)).sort(), shard);
      for (const key of gone) console.log(`FAIL ${key}: in the record but not found`);
      problems.push(...gone);
    }
    if (shard.index === 1 && !filters.length) {
      for (const [file, bytes] of Object.entries(sizes)) {
        const before = record.sizes[file];
        if (before !== undefined && bytes > before) {
          console.log(`FAIL ${file}: ${bytes} B gzipped, was ${before} B`);
          problems.push(file);
        }
      }
    }
    problems.push(...changed);
  }
  if (saveDir) await saveCaptures(path.resolve(saveDir), results);
  if (against && changed.length) await printDiffs(against, changed, results, concurrency);

  if (!update) {
    const failed = problems.length + crashed.length;
    console.log(`\n${keys.length - changed.length - crashed.length}/${keys.length} pages unchanged.`);
    if (failed) {
      console.log(
        "\nIf the change is meant to alter these pages, update the record in the same pull request: npm run test:dom -- --update" +
          "\nTo see what changed: node scripts/check-dom.mjs --against=origin/main [filter ...]",
      );
      process.exitCode = 1;
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
