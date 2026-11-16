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
 * Usage:
 *   node scripts/check-pages.mjs [--screenshots] [filter ...]
 *
 * Filters are substrings matched against the page path.
 * Set TEST_TODAY=YYYY-MM-DD to change the frozen date (default 2025-11-27).
 */
import { createServer } from "node:http";
import { readFile, readdir, mkdir, stat } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright";

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SCREENSHOT_DIR = path.join(ROOT, "tests", "screenshots");
const PAGE_DIRS = ["tests/pages", "examples", "template", "docs"];
const IGNORED_DIRS = new Set(["node_modules", ".git", "screenshots"]);
const TODAY = process.env.TEST_TODAY || "2025-11-27";
const VIEWPORTS = [
  { name: "desktop", width: 1280, height: 900 },
  { name: "phone", width: 390, height: 844 },
];
const NARROW_WIDTH = 360;
const AXE_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];
const BLOCKING_IMPACTS = new Set(["serious", "critical"]);

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".gif": "image/gif",
  ".pdf": "application/pdf",
  ".java": "text/plain; charset=utf-8",
  ".py": "text/plain; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
};

async function findPages() {
  const pages = [];
  const rootIndex = path.join(ROOT, "index.html");
  if (await exists(rootIndex)) pages.push(rootIndex);
  for (const dir of PAGE_DIRS) {
    const absolute = path.join(ROOT, dir);
    if (await exists(absolute)) pages.push(...(await walk(absolute)));
  }
  const html = pages.filter((file) => file.endsWith(".html")).sort();
  // Redirect stubs (<meta http-equiv="refresh">, e.g. docs/index.html) navigate
  // away while being checked; their target is checked on its own.
  const isRedirect = async (file) => /http-equiv="refresh"/i.test(await readFile(file, "utf8"));
  const flags = await Promise.all(html.map(isRedirect));
  return html.filter((_, index) => !flags[index]);
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return IGNORED_DIRS.has(entry.name) ? [] : walk(full);
      return [full];
    }),
  );
  return files.flat();
}

async function exists(file) {
  try {
    await stat(file);
    return true;
  } catch {
    return false;
  }
}

function startServer() {
  const server = createServer(async (request, response) => {
    const url = new URL(request.url, "http://localhost");
    let file = path.join(ROOT, decodeURIComponent(url.pathname));
    if (!file.startsWith(ROOT)) {
      response.writeHead(403).end();
      return;
    }
    try {
      if ((await stat(file)).isDirectory()) file = path.join(file, "index.html");
      const body = await readFile(file);
      const type = MIME_TYPES[path.extname(file).toLowerCase()] || "application/octet-stream";
      response.writeHead(200, { "Content-Type": type }).end(body);
    } catch {
      response.writeHead(404).end("Not found");
    }
  });
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve(server));
  });
}

function withToday(url) {
  const parsed = new URL(url);
  parsed.searchParams.set("today", TODAY);
  return parsed.toString();
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
  // Pages with <uc-page> stay hidden until the kit reveals them (.uc-visible on <html>).
  const revealed = await page
    .waitForFunction(() => !document.querySelector("uc-page") || document.documentElement.classList.contains("uc-visible"), null, { timeout: 3000 })
    .then(() => true, () => false);
  if (!revealed) problems.push("page was not revealed: <html> never got .uc-visible");
  await page.waitForTimeout(300);
  return { page, problems, warnings };
}

async function checkPage(browser, file, origin, axeSource, options) {
  const relative = path.relative(ROOT, file).split(path.sep).join("/");
  const httpUrl = withToday(`${origin}/${relative}`);
  const fileUrl = withToday(pathToFileURL(file).toString());
  const problems = [];
  const warnings = [];

  for (const viewport of VIEWPORTS) {
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
    const result = await openPage(context, httpUrl, origin);
    problems.push(...result.problems.map((p) => `[http ${viewport.name}] ${p}`));
    warnings.push(...result.warnings.map((w) => `[http ${viewport.name}] ${w}`));

    if (viewport.name === "desktop") {
      await result.page.addScriptTag({ content: axeSource });
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
      const name = relative.replace(/\.html$/, "").replace(/[\\/]/g, "__");
      await result.page.screenshot({ path: path.join(SCREENSHOT_DIR, `${name}--${viewport.name}.png`), fullPage: true });
    }
    await context.close();
  }

  {
    const context = await browser.newContext({ viewport: { width: NARROW_WIDTH, height: 800 } });
    const { page } = await openPage(context, httpUrl, origin);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (overflow > 1) problems.push(`[layout] horizontal scroll of ${overflow}px at ${NARROW_WIDTH}px wide`);
    await context.close();
  }

  {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const result = await openPage(context, fileUrl, null);
    problems.push(...result.problems.map((p) => `[file://] ${p}`));
    await context.close();
  }

  {
    const context = await browser.newContext({ javaScriptEnabled: false });
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
  const filters = args.filter((arg) => !arg.startsWith("--"));

  const pages = (await findPages()).filter(
    (file) => filters.length === 0 || filters.some((filter) => file.includes(filter)),
  );
  if (pages.length === 0) {
    console.log("No pages to check.");
    return;
  }
  if (options.screenshots) await mkdir(SCREENSHOT_DIR, { recursive: true });

  const axeSource = await readFile(require.resolve("axe-core/axe.min.js"), "utf8");
  const server = await startServer();
  const origin = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch();

  let failed = 0;
  try {
    for (const file of pages) {
      const { relative, problems, warnings } = await checkPage(browser, file, origin, axeSource, options);
      const status = problems.length ? "FAIL" : "ok  ";
      console.log(`${status} ${relative}`);
      for (const problem of problems) console.log(`       ✗ ${problem}`);
      for (const warning of warnings) console.log(`       ! ${warning}`);
      if (problems.length) failed += 1;
    }
  } finally {
    await browser.close();
    server.close();
  }

  console.log(`\n${pages.length - failed}/${pages.length} pages passed.`);
  if (options.screenshots) console.log(`Screenshots in ${path.relative(ROOT, SCREENSHOT_DIR)}/`);
  process.exitCode = failed ? 1 : 0;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
