#!/usr/bin/env node
/**
 * Page checker for the UC Design Kit.
 *
 * For every HTML page in tests/pages, examples, template, docs (documentation
 * and its demos) and the repository root, it verifies:
 *   - no console errors or uncaught exceptions (served over HTTP and from file://)
 *   - no missing local resources (HTTP 404)
 *   - no horizontal scrolling at a 360 px wide viewport
 *   - no serious or critical accessibility violations (axe-core, WCAG 2.1 A/AA)
 *   - content is still present with JavaScript disabled
 *
 * It also opens tests/widgets/compat.html once for widgets/v1/ and once for
 * every frozen widgets release (docs/architecture/widgets-api.md 18.3 item 6).
 *
 * Usage:
 *   node scripts/check-pages.mjs [--screenshots] [--shard=i/n] [--concurrency=n] [filter ...]
 *
 * Filters are substrings matched against the page path. --shard=i/n checks
 * the i-th of n parts of the pages (CI runs the parts in parallel jobs);
 * --concurrency=n checks n pages at the same time (default: CPU count, max 4).
 * Set TEST_TODAY=YYYY-MM-DD to change the frozen date (default 2025-11-27).
 */
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { AXE_TAGS, injectAxe, loadAxe, waitForGrading, waitForReveal, withBrowser, withToday } from "./lib/browser.mjs";
import { filterArgs, logShard, matchFilters, parseConcurrency, parseShard, reportPage, runPool, shardOf } from "./lib/runner.mjs";
import { findPages } from "./lib/pages.mjs";
import { ROOT, routePublicKit } from "./lib/server.mjs";

const SCREENSHOT_DIR = path.join(ROOT, "tests", "screenshots");
const VIEWPORTS = [
  { name: "desktop", width: 1280, height: 900 },
  { name: "phone", width: 390, height: 844 },
];
const NARROW_WIDTH = 360;
const BLOCKING_IMPACTS = new Set(["serious", "critical"]);

/**
 * A browser context whose requests to the public kit URL are answered from
 * kit/ on disk: pages that load the kit from its public URL (the template,
 * which must work when opened from disk) get the kit of this checkout, so the
 * check tests the code under review and needs no network.
 */
async function newContext(browser, options) {
  const context = await browser.newContext(options);
  await routePublicKit(context);
  return context;
}

/** Opens a page and records console errors, page errors and failed local requests. */
async function openPage(context, url, origin) {
  const page = await context.newPage();
  const problems = [];
  const warnings = [];
  page.on("console", (message) => {
    if (message.type() === "error") problems.push(`console error: ${message.text()}`);
  });
  page.on("pageerror", (error) => problems.push(`uncaught exception: ${error.message}`));
  page.on("response", (response) => {
    if (response.status() < 400) return;
    const target = response.url();
    const isLocal = origin ? target.startsWith(origin) : target.startsWith("file:");
    (isLocal ? problems : warnings).push(`HTTP ${response.status()}: ${target}`);
  });
  page.on("requestfailed", (request) => {
    warnings.push(`request failed: ${request.url()} (${request.failure()?.errorText})`);
  });
  await page.goto(url, { waitUntil: "load" });
  if (!(await waitForReveal(page))) problems.push("page was not revealed: <html> never got .uc-visible");
  if (!(await waitForGrading(page))) problems.push("<uc-grading> was never defined: uc-grading.js did not load");
  await page.waitForTimeout(300);
  return { page, problems, warnings };
}

async function checkPage(browser, item, origin, axeSource, options) {
  // An item may carry a query (the compatibility page: "compat.html?release=v1.0.0").
  const [file, query = ""] = item.split("?");
  const relative = path.relative(ROOT, file).split(path.sep).join("/");
  const httpUrl = withToday(`${origin}/${relative}${query ? `?${query}` : ""}`);
  const fileUrl = withToday(`${pathToFileURL(file)}${query ? `?${query}` : ""}`);
  const problems = [];
  const warnings = [];

  for (const viewport of VIEWPORTS) {
    const context = await newContext(browser, { viewport: { width: viewport.width, height: viewport.height } });
    const result = await openPage(context, httpUrl, origin);
    problems.push(...result.problems.map((p) => `[http ${viewport.name}] ${p}`));
    warnings.push(...result.warnings.map((w) => `[http ${viewport.name}] ${w}`));

    if (viewport.name === "desktop" && relative === "tests/widgets/compat.html") {
      const compat = await result.page
        .waitForFunction(() => document.documentElement.dataset.compat, null, { timeout: 10000 })
        .then((handle) => handle.jsonValue(), () => "no result");
      if (compat !== "ok") problems.push(`[compat ${query || "release=v1"}] ${compat} (see the console errors above)`);
    }

    if (viewport.name === "desktop") {
      await injectAxe(result.page, axeSource);
      const axe = await result.page.evaluate(async (tags) => {
        // eslint-disable-next-line no-undef
        const report = await axe.run(document, { runOnly: { type: "tag", values: tags } });
        return report.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, count: v.nodes.length }));
      }, AXE_TAGS);
      for (const violation of axe) {
        const line = `[axe] ${violation.impact}: ${violation.id} (${violation.count}) ${violation.help}`;
        (BLOCKING_IMPACTS.has(violation.impact) ? problems : warnings).push(line);
      }
    }

    if (options.screenshots) {
      const name = `${relative.replace(/\.html$/, "")}${query ? `-${query.replace(/\W+/g, "-")}` : ""}`.replace(/[\\/]/g, "__");
      await result.page.screenshot({ path: path.join(SCREENSHOT_DIR, `${name}--${viewport.name}.png`), fullPage: true });
    }
    await context.close();
  }

  {
    const context = await newContext(browser, { viewport: { width: NARROW_WIDTH, height: 800 } });
    const { page } = await openPage(context, httpUrl, origin);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (overflow > 1) problems.push(`[layout] horizontal scroll of ${overflow}px at ${NARROW_WIDTH}px wide`);
    await context.close();
  }

  {
    const context = await newContext(browser, { viewport: { width: 1280, height: 900 } });
    const result = await openPage(context, fileUrl, null);
    problems.push(...result.problems.map((p) => `[file://] ${p}`));
    await context.close();
  }

  if (relative === "tests/pages/uc-grading.html") {
    // uc-grading.js missing (a site that copied only uc-kit.js): one warning, the page shows, the list stays (docs/architecture/grading-api.md 2.2).
    const context = await newContext(browser, { viewport: { width: 1280, height: 900 } });
    await context.route("**/kit/v1/uc-grading.js", (route) => route.fulfill({ status: 404, body: "" }));
    const page = await context.newPage();
    const messages = [];
    page.on("console", (message) => messages.push(message.text()));
    await page.goto(httpUrl, { waitUntil: "load" });
    const revealed = await page
      .waitForFunction(() => document.documentElement.classList.contains("uc-visible"), null, { timeout: 3000 })
      .then(() => true, () => false);
    await page.waitForTimeout(200);
    const listShown = await page.evaluate(() => Array.from(document.querySelectorAll("uc-grading > ul, uc-grading > ol")).every((list) => list.offsetHeight > 0));
    const warned = messages.filter((text) => text.includes("could not load uc-grading.js next to uc-kit.js")).length;
    if (!revealed) problems.push("[no uc-grading.js] the page was not revealed");
    if (!listShown) problems.push("[no uc-grading.js] the teacher's list is not shown");
    if (warned !== 1) problems.push(`[no uc-grading.js] expected one console warning, got ${warned}`);
    await context.close();

    // A formula that does not parse (#broken): one warning naming it, the teacher's formulas list stays visible (grading-api.md 7.5, 10).
    const second = await newContext(browser, { viewport: { width: 1280, height: 900 } });
    const formulas = await second.newPage();
    const notes = [];
    formulas.on("console", (message) => message.type() === "warning" && notes.push(message.text()));
    await formulas.goto(httpUrl, { waitUntil: "load" });
    await formulas.waitForFunction(() => customElements.get("uc-grading"), null, { timeout: 4000 }).catch(() => {});
    await formulas.waitForTimeout(200);
    const fallback = await formulas.evaluate(() => {
      const broken = document.querySelector("#broken");
      return Boolean(broken && broken.querySelector("[data-formulas]").offsetHeight > 0 && !broken.querySelector(".uc-grading__bar") && !document.querySelector("#edados-2627 [data-formulas]").offsetHeight);
    });
    const expected = '[uc-kit] uc-grading: formula 1, column 18: unknown name "X". Known: P, E.';
    const gradingNotes = notes.filter((text) => text.includes("uc-grading:"));
    if (gradingNotes.length !== 1 || gradingNotes[0] !== expected) problems.push(`[formulas] expected one warning ${expected}, got ${JSON.stringify(gradingNotes)}`);
    if (!fallback) problems.push("[formulas] #broken does not show the teacher's formulas list, or #edados-2627 does");
    await second.close();
  }

  {
    const context = await newContext(browser, { javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto(httpUrl, { waitUntil: "load" });
    const length = await page.evaluate(() => document.body.innerText.trim().length);
    if (length === 0) problems.push("[no-js] the page has no visible text without JavaScript");
    await context.close();
  }

  return { relative, problems, warnings };
}

async function main() {
  const args = process.argv.slice(2);
  const options = { screenshots: args.includes("--screenshots") };
  const shard = parseShard(args);
  const concurrency = parseConcurrency(args);

  const matching = matchFilters(await findPages(), filterArgs(args));
  const pages = shardOf(matching, shard);
  if (pages.length === 0) {
    console.log("No pages to check.");
    return;
  }
  logShard(shard, pages.length, matching.length);
  if (options.screenshots) await mkdir(SCREENSHOT_DIR, { recursive: true });

  const axeSource = await loadAxe();
  let failed = 0;
  await withBrowser(({ browser, origin }) =>
    runPool(
      pages,
      concurrency,
      (file) => checkPage(browser, file, origin, axeSource, options),
      (file, result) => {
        const relative = path.relative(ROOT, file).split(path.sep).join("/");
        const problems = result.error ? [`check crashed: ${result.error.stack || result.error}`] : result.problems;
        if (reportPage(relative, problems, result.error ? [] : result.warnings)) failed += 1;
      },
    ),
  );

  console.log(`\n${pages.length - failed}/${pages.length} pages passed.`);
  if (options.screenshots) console.log(`Screenshots in ${path.relative(ROOT, SCREENSHOT_DIR)}/`);
  process.exitCode = failed ? 1 : 0;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
