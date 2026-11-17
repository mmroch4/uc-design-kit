#!/usr/bin/env node
/**
 * Accessibility regression checks for the kit's components (WCAG 2.1 AA).
 *
 * scripts/check-pages.mjs already runs axe-core on every page in its first,
 * untouched state. This script covers what axe cannot see there: states that
 * only exist after a key press, and behaviour. On every component demo, the
 * EDados example and the template it verifies:
 *
 *   - axe-core, WCAG 2.1 A/AA rules of any impact, also with every disclosure
 *     open, and the best-practice rule "landmark-unique"
 *   - keyboard: Tab reaches every control, each one shows a focus indicator
 *     (:focus-visible outline or box-shadow, its own, its <label>'s or the
 *     code editor's), nothing traps focus (the editor is left with Esc, Tab),
 *     and nothing focusable sits inside aria-hidden
 *   - label in name (2.5.3): an aria-label contains the control's visible text
 *   - reflow (1.4.10): no horizontal scroll at 320 px wide
 *   - text resize (1.4.4): no horizontal scroll with text at 200 %
 *     (1280 px wide, as browser text zoom or a larger default font gives)
 *   - the root font size follows the reader's browser setting (no px)
 *   - reduced motion: no transition or animation longer than 0.01 ms
 *
 * and these behaviours of the components:
 *
 *   - copy buttons keep focus and announce "Copiado" in a live region
 *   - disclosure buttons flip aria-expanded and keep focus
 *   - <uc-question> announces its feedback in a live region
 *   - "Mark as done" flips aria-pressed and keeps focus
 *   - the phone menu opens, closes with Escape and gives focus back
 *   - the language switch updates <html lang> and keeps focus on the switch
 *   - links with data-auth have a hidden "requires login" text and a decorative lock
 *   - "My class" of <uc-timetable>: keeps focus, announces the class, hides the
 *     other classes, is followed by the other timetables and survives a reload
 *   - the search of <uc-summaries>: keeps focus while typing, announces the
 *     count, highlights matches, hides the breaks and is cleared with Escape
 *   - the filters of <uc-problems>: buttons 44 px tall, Enter flips
 *     aria-pressed and keeps focus, the count is announced, only matching
 *     problems stay; "Resolvido" is 44 px tall, named after the problem and
 *     kept after a reload
 *   - sortable tables: the header buttons are 44 px tall, Enter sorts,
 *     flips aria-sort, keeps focus and announces the order
 *   - "Outros anos" of <uc-page>: Enter opens the list (aria-expanded),
 *     Escape closes it and gives focus back to the button
 *   - the site search: the dialog (modal, combobox + listbox, arrows, the
 *     count in a status region, 44 px results, Esc gives focus back, axe
 *     while open, 320 px) and <uc-search> (label, 44 px, count announced,
 *     Esc clears, axe with results)
 *   - widgets (uc-widget-*): from the stage, the keyboard walks from the first
 *     to the last step (answering predict questions with Enter), each move is
 *     announced; axe passes at step 0, at the last step, with the text view
 *     open and with a predict question open; the language switch keeps the
 *     step; with JavaScript off the teacher's fallback is visible
 *
 * Accessibility-tree snapshots (Playwright ariaSnapshot) of the blocks' test
 * pages, stored next to them (tests/pages/*.aria.yml), fail the check when a
 * role, name or state text changes. After an intended change, run
 * `node scripts/check-a11y.mjs --update-snapshots` and review the diff.
 *
 * Usage: node scripts/check-a11y.mjs [--shard=i/n] [--concurrency=n] [--update-snapshots] [filter ...]
 *
 * --shard=i/n checks the i-th of n parts of the pages and of the snapshots (CI
 * runs the parts in parallel jobs); --concurrency=n checks n pages at the same
 * time (default: CPU count, max 4).
 */
import { createServer } from "node:http";
import { readFile, readdir, stat, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { filterArgs, parseConcurrency, parseShard, runPool, shardOf } from "./check-runner.mjs";

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TODAY = process.env.TEST_TODAY || "2025-11-27";
const PUBLIC_KIT = "https://uc-design-kit.miguelrocha.dev/kit/";
const AXE_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];
const AXE_EXTRA_RULES = ["landmark-unique"];
const MAX_TABS = 400;
const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".woff2": "font/woff2",
  ".map": "application/json",
  ".java": "text/plain; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
};

/**
 * Accessibility-tree snapshots: one block of one test page, at TODAY.
 * Add a line per new block (docs/plan/blocks-api.md 11.4).
 */
const ARIA_SNAPSHOTS = [
  { page: "tests/pages/uc-timetable.html", selector: "#all", file: "tests/pages/uc-timetable.aria.yml" },
  { page: "tests/pages/uc-timetable.html", selector: "#days", file: "tests/pages/uc-timetable-days.aria.yml" },
  { page: "tests/pages/uc-grading.html", selector: "#pc", file: "tests/pages/uc-grading.aria.yml" },
  { page: "tests/pages/uc-assessment-info.html", selector: "#full", file: "tests/pages/uc-assessment-info.aria.yml" },
  { page: "tests/pages/uc-summaries.html", selector: "#main", file: "tests/pages/uc-summaries.aria.yml" },
  { page: "tests/pages/uc-materials.html", selector: "#main", file: "tests/pages/uc-materials.aria.yml" },
  { page: "tests/pages/uc-problems.html", selector: "#series", file: "tests/pages/uc-problems.aria.yml" },
  { page: "tests/pages/uc-problems.html", selector: "#cards", file: "tests/pages/uc-problems-cards.aria.yml" },
  { page: "tests/pages/uc-weeks-compact.html", selector: "#compact .uc-weeks__table", file: "tests/pages/uc-weeks-compact.aria.yml" },
  { page: "tests/pages/extras.html", selector: "#ranking-table", file: "tests/pages/sortable-table.aria.yml" },
  { page: "tests/pages/editions/2425/index.html", selector: "uc-page", file: "tests/pages/editions.aria.yml" },
  // The site search: the dialog with results, and <uc-search> with results.
  { page: "tests/pages/search/index.html", selector: ".uc-search-dialog", file: "tests/pages/search/dialog.aria.yml", prepare: (page) => openSearchDialog(page, "arvores") },
  {
    page: "tests/pages/search/index.html",
    selector: "uc-search",
    file: "tests/pages/search/uc-search.aria.yml",
    prepare: async (page) => {
      await page.fill("uc-search input", "arvore");
      await page.waitForSelector("uc-search [role='option']", { timeout: 4000 });
    },
  },
];

/** Component demos, the sortable table demo, the EDados example (top level and one lab guide), the template and the search test page. */
async function findPages() {
  const pages = [];
  const demos = path.join(ROOT, "docs", "demos");
  for (const entry of await readdir(demos, { withFileTypes: true })) {
    if (!entry.isDirectory() || !entry.name.startsWith("uc-")) continue;
    for (const file of await readdir(path.join(demos, entry.name))) {
      if (file.endsWith(".html")) pages.push(`docs/demos/${entry.name}/${file}`);
    }
  }
  for (const dir of ["examples/edados-2526", "template"]) {
    for (const file of await readdir(path.join(ROOT, dir))) {
      if (file.endsWith(".html")) pages.push(`${dir}/${file}`);
    }
  }
  pages.push("examples/edados-2526/guioes/aula10.html");
  // The widget test page (several widgets, predict, editable, bilingual).
  pages.push("tests/pages/uc-widget-sort.html", "tests/pages/uc-widget-w2.html");
  // The header search button (a site with search on and an index).
  pages.push("tests/pages/search/index.html");
  // The one CSS-block demo with behaviour (sortable headers).
  pages.push("docs/demos/blocks/table-sortable.html");
  return pages.sort();
}

function startServer() {
  const server = createServer(async (request, response) => {
    const url = new URL(request.url, "http://localhost");
    let file = path.join(ROOT, decodeURIComponent(url.pathname));
    if (!file.startsWith(ROOT)) return response.writeHead(403).end();
    try {
      if ((await stat(file)).isDirectory()) file = path.join(file, "index.html");
      const type = MIME_TYPES[path.extname(file).toLowerCase()] || "application/octet-stream";
      response.writeHead(200, { "Content-Type": type }).end(await readFile(file));
    } catch {
      response.writeHead(404).end("Not found");
    }
  });
  return new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve(server)));
}

async function open(browser, origin, relative, options = {}) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, ...options });
  await context.route(`${PUBLIC_KIT}**`, async (route) => {
    const file = path.join(ROOT, decodeURIComponent(new URL(route.request().url()).pathname));
    try {
      const type = MIME_TYPES[path.extname(file).toLowerCase()] || "application/octet-stream";
      await route.fulfill({ status: 200, body: await readFile(file), headers: { "Content-Type": type } });
    } catch {
      await route.fulfill({ status: 404 });
    }
  });
  // Code highlighting comes from a CDN: not needed here, and it may be offline.
  await context.route("https://cdnjs.cloudflare.com/**", (route) => route.abort());
  const page = await context.newPage();
  await page.goto(`${origin}/${relative}?today=${TODAY}`, { waitUntil: "load" });
  await page
    .waitForFunction(() => !document.querySelector("uc-page") || document.documentElement.classList.contains("uc-visible"), null, { timeout: 4000 })
    .catch(() => {});
  // A site with `search` asks whether its index exists when idle: wait for the answer.
  await page.waitForFunction(() => !document.querySelector(".uc-search-button--pending"), null, { timeout: 7000 }).catch(() => {});
  await page.waitForTimeout(200);
  return { context, page };
}

async function runAxe(page, axeSource) {
  if (!(await page.evaluate(() => Boolean(window.axe)))) await page.addScriptTag({ content: axeSource });
  return page.evaluate(
    async ({ tags, extra }) => {
      // eslint-disable-next-line no-undef
      const wcag = await axe.run(document, { runOnly: { type: "tag", values: tags } });
      // eslint-disable-next-line no-undef
      const more = await axe.run(document, { runOnly: { type: "rule", values: extra } });
      return [...wcag.violations, ...more.violations].map((v) => `${v.impact}: ${v.id} (${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(", ")})`);
    },
    { tags: AXE_TAGS, extra: AXE_EXTRA_RULES },
  );
}

/** Walks the page with Tab and checks every stop. */
async function checkKeyboard(page) {
  const problems = [];
  await page.evaluate(() => {
    document.activeElement?.blur();
    window.scrollTo(0, 0);
  });
  let first = null;
  let previous = null;
  for (let i = 0; i < MAX_TABS; i += 1) {
    await page.keyboard.press("Tab");
    let stop = await page.evaluate(describeFocus);
    if (!stop) break; // Focus left the document: the walk is complete.
    if (stop.key === previous) {
      // The code editor keeps Tab for indentation; Esc then Tab must leave it.
      await page.keyboard.press("Escape");
      await page.keyboard.press("Tab");
      stop = await page.evaluate(describeFocus);
      if (!stop) break;
      if (stop.key === previous) {
        problems.push(`keyboard trap at ${stop.label}`);
        break;
      }
    }
    if (stop.key === first) break;
    if (first === null) first = stop.key;
    previous = stop.key;
    if (!stop.indicator) problems.push(`no visible focus indicator on ${stop.label}`);
    if (stop.hidden) problems.push(`focusable element inside aria-hidden: ${stop.label}`);
    if (stop.empty) problems.push(`focused element has no size: ${stop.label}`);
  }
  return problems;
}

// Runs in the page: describes document.activeElement.
function describeFocus() {
  const element = document.activeElement;
  if (!element || element === document.body || element === document.documentElement) return null;
  const visible = (style) =>
    (style.outlineStyle !== "none" && parseFloat(style.outlineWidth) > 0) || (style.boxShadow && style.boxShadow !== "none");
  let indicator = visible(getComputedStyle(element));
  // Radio buttons and checkboxes show the ring on their <label>, the editor on its frame.
  for (let node = element.parentElement; !indicator && node && node !== document.body; node = node.parentElement) {
    if ((node.localName === "label" || node.matches(".uc-code__editor")) && visible(getComputedStyle(node))) indicator = true;
  }
  const box = element.getBoundingClientRect();
  const label = `${element.localName}${element.className && typeof element.className === "string" ? "." + element.className.trim().split(/\s+/).join(".") : ""} "${(element.getAttribute("aria-label") || element.textContent || "").replace(/\s+/g, " ").trim().slice(0, 40)}"`;
  // An iframe holds its own document: it is checked as a page of its own.
  return {
    key: `${label}@${Math.round(box.top + window.scrollY)}:${Math.round(box.left)}`,
    label,
    indicator: indicator || element.localName === "iframe",
    hidden: Boolean(element.closest("[aria-hidden='true']")),
    empty: box.width === 0 || box.height === 0,
  };
}

/** WCAG 2.5.3: the accessible name set with aria-label includes the visible text. */
async function checkLabelInName(page) {
  return page.evaluate(() => {
    const problems = [];
    for (const element of document.querySelectorAll("a[aria-label], button[aria-label], summary[aria-label]")) {
      if (element.closest("[hidden], [aria-hidden='true']")) continue;
      const visible = element.innerText.replace(/\s+/g, " ").trim().toLowerCase();
      const name = element.getAttribute("aria-label").replace(/\s+/g, " ").trim().toLowerCase();
      // Whole words: "Switch to English" does not contain the visible "EN".
      const escaped = visible.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      if (visible && !new RegExp(`(^|[^\\p{L}\\p{N}])${escaped}($|[^\\p{L}\\p{N}])`, "u").test(name)) problems.push(`label in name: "${name}" does not contain the visible text "${visible}"`);
    }
    return problems;
  });
}

async function horizontalScroll(page) {
  return page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
}

async function checkReflowAndZoom(browser, origin, relative) {
  const problems = [];
  {
    const { context, page } = await open(browser, origin, relative, { viewport: { width: 320, height: 640 } });
    const overflow = await horizontalScroll(page);
    if (overflow > 1) problems.push(`reflow: horizontal scroll of ${overflow}px at 320px wide`);
    await context.close();
  }
  {
    const { context, page } = await open(browser, origin, relative, { viewport: { width: 1280, height: 900 } });
    await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
    await page.waitForTimeout(150);
    const overflow = await horizontalScroll(page);
    if (overflow > 1) problems.push(`text at 200%: horizontal scroll of ${overflow}px`);
    await context.close();
  }
  return problems;
}

async function checkMotion(browser, origin, relative) {
  const { context, page } = await open(browser, origin, relative, { reducedMotion: "reduce" });
  const moving = await page.evaluate(() => {
    const ms = (value) => Math.max(...value.split(",").map((part) => parseFloat(part) * (part.trim().endsWith("ms") ? 1 : 1000)));
    return Array.from(document.querySelectorAll("body *"))
      .filter((element) => {
        const style = getComputedStyle(element);
        return ms(style.transitionDuration) > 1 || (style.animationName !== "none" && ms(style.animationDuration) > 1);
      })
      .slice(0, 3)
      .map((element) => `${element.localName}.${element.className}`);
  });
  await context.close();
  return moving.length ? [`reduced motion: still animated: ${moving.join(", ")}`] : [];
}

const liveText = (page) =>
  page.evaluate(() =>
    Array.from(document.querySelectorAll("[aria-live], [role='status'], [role='alert']"))
      .map((node) => node.textContent.trim())
      .join(" | "),
  );
const focusedMatches = (page, selector) => page.evaluate((s) => Boolean(document.activeElement && document.activeElement.matches(s)), selector);

async function firstVisible(page, selector) {
  for (const handle of await page.$$(selector)) if (await handle.isVisible()) return handle;
  return null;
}

/** Component behaviours, each checked where the page has the component. */
async function checkBehaviour(browser, origin, relative) {
  const problems = [];
  const { context, page } = await open(browser, origin, relative);

  const copy = await firstVisible(page, ".uc-code__button--copy, .uc-copy-block__button");
  if (copy) {
    await copy.focus();
    await page.keyboard.press("Enter");
    await page.waitForTimeout(250);
    if (!(await focusedMatches(page, ".uc-code__button--copy, .uc-copy-block__button"))) problems.push("copy: the button lost focus after copying");
    if (!/Copiado|Copied/.test(await liveText(page))) problems.push("copy: no 'Copiado' announcement in a live region");
  }

  const toggle = await firstVisible(page, ".uc-code__toggle");
  if (toggle) {
    const before = await toggle.getAttribute("aria-expanded");
    await toggle.focus();
    await page.keyboard.press("Enter");
    await page.waitForTimeout(100);
    const after = await page.evaluate(() => document.activeElement && document.activeElement.getAttribute("aria-expanded"));
    if (after === null) problems.push("collapsible code: the toggle lost focus");
    else if (after === before) problems.push("collapsible code: aria-expanded did not change");
  }

  const question = await firstVisible(page, "uc-question");
  if (question) {
    const check = await question.$(".uc-question__check");
    await check.focus();
    await page.keyboard.press("Enter");
    await page.waitForTimeout(150);
    const feedback = await question.$eval(".uc-question__feedback", (node) => ({ live: node.getAttribute("aria-live"), text: node.textContent.trim() }));
    if (feedback.live !== "polite" || !feedback.text) problems.push("question: feedback is not announced in a polite live region");
  }

  // In-page JavaScript runs in a Web Worker, with no network: its end must be announced.
  const run = await firstVisible(page, 'uc-code[data-lang="js"] button.uc-code__run');
  if (run) {
    await run.focus();
    await page.keyboard.press("Enter");
    await page.waitForFunction(() => !document.querySelector(".uc-code__run[aria-disabled='true']"), null, { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(150);
    if (!/Execução terminada|testes passaram|Run finished|tests passed/.test(await liveText(page))) problems.push("run: the end of the run is not announced");
    if (!(await focusedMatches(page, ".uc-code__run"))) problems.push("run: the run button lost focus");
  }

  const done = await page.$(".uc-exercise__toggle");
  if (done) {
    await page.evaluate(() => document.querySelectorAll("uc-exercise details").forEach((details) => (details.open = true)));
    const before = await done.getAttribute("aria-pressed");
    await done.focus();
    await page.keyboard.press("Enter");
    await page.waitForTimeout(100);
    const state = await page.evaluate(() => document.activeElement && document.activeElement.getAttribute("aria-pressed"));
    if (state === null) problems.push("exercise: 'Mark as done' lost focus");
    else if (state === before) problems.push("exercise: aria-pressed did not change");
  }

  const language = await page.$(".uc-lang-switch__button");
  if (language) {
    const target = await language.getAttribute("lang");
    await language.focus();
    await page.keyboard.press("Enter");
    await page.waitForTimeout(200);
    const lang = await page.evaluate(() => document.documentElement.lang);
    if (lang !== target) problems.push(`language switch: <html lang> is "${lang}", expected "${target}"`);
    if (!(await focusedMatches(page, ".uc-lang-switch__button"))) problems.push("language switch: focus was lost");
  }

  // a[data-auth]: the need to log in is text, the lock is decoration.
  const auth = await page.evaluate(() =>
    Array.from(document.querySelectorAll("a[data-auth]"))
      .filter((link) => !link.closest("[hidden]"))
      .map((link) => ({
        label: (link.querySelector(".uc-auth-label") || {}).textContent || "",
        icon: Boolean(link.querySelector("svg.uc-auth-icon[aria-hidden='true']")),
        count: link.querySelectorAll(".uc-auth-label").length,
      })),
  );
  for (const link of auth) {
    if (!/autenticação|login/i.test(link.label) || link.count !== 1) problems.push(`data-auth: a link has ${link.count} hidden labels ("${link.label.trim()}")`);
    if (!link.icon) problems.push("data-auth: the lock icon is missing or not aria-hidden");
  }
  await context.close();

  problems.push(...(await checkClassFilter(browser, origin, relative)));
  problems.push(...(await checkGradingCalculator(browser, origin, relative)));
  problems.push(...(await checkSummariesSearch(browser, origin, relative)));
  problems.push(...(await checkProblems(browser, origin, relative)));
  problems.push(...(await checkSortableAndEditions(browser, origin, relative)));

  if (relative.includes("uc-page") || relative.startsWith("examples/")) {
    const phone = await open(browser, origin, relative, { viewport: { width: 390, height: 844 } });
    const menu = await phone.page.$(".uc-nav-toggle");
    if (menu) {
      await menu.focus();
      await phone.page.keyboard.press("Enter");
      const opened = await menu.getAttribute("aria-expanded");
      await phone.page.keyboard.press("Tab");
      await phone.page.keyboard.press("Escape");
      const closed = await menu.getAttribute("aria-expanded");
      if (opened !== "true" || closed !== "false") problems.push(`phone menu: aria-expanded went ${opened} then ${closed}`);
      if (!(await focusedMatches(phone.page, ".uc-nav-toggle"))) problems.push("phone menu: Escape did not return focus to the menu button");
    }
    await phone.context.close();
  }
  return problems;
}

/** "My class" of <uc-timetable class-filter>, on pages that have one. */
async function checkClassFilter(browser, origin, relative) {
  const problems = [];
  const { context, page } = await open(browser, origin, relative);
  const select = await firstVisible(page, ".uc-timetable__filters select");
  if (!select) {
    await context.close();
    return problems;
  }
  const choice = await select.evaluate((node) => node.options[node.options.length - 1].value);
  const label = await select.evaluate((node) => (node.labels[0] ? node.labels[0].textContent.trim() : ""));
  if (!label) problems.push("class filter: the select has no visible <label>");
  const box = await select.boundingBox();
  if (box && box.height < 44) problems.push(`class filter: the select is ${Math.round(box.height)}px tall (44px minimum)`);
  await select.focus();
  // A closed select changes value with the arrow keys; End picks the last class.
  await page.keyboard.press("End");
  await page.waitForTimeout(250);
  const value = await select.evaluate((node) => node.value);
  if (value !== choice) problems.push(`class filter: End did not choose the last class (value "${value}")`);
  if (!(await focusedMatches(page, ".uc-timetable__filters select"))) problems.push("class filter: the select lost focus");
  if (!(await liveText(page)).includes(choice)) problems.push(`class filter: "${choice}" was not announced`);
  const state = await page.evaluate((code) => {
    const rows = Array.from(document.querySelectorAll("uc-timetable [data-class][data-type]"));
    const filtered = rows.filter((row) => row.closest("uc-timetable").querySelector(".uc-timetable__filters"));
    return {
      wrong: filtered.filter((row) => !row.hidden && row.dataset.class !== code && rows.some((other) => other.dataset.type === row.dataset.type && other.dataset.class === code)).length,
      shown: filtered.filter((row) => !row.hidden && row.dataset.class === code).length,
    };
  }, choice);
  if (state.wrong) problems.push(`class filter: ${state.wrong} rows of other classes are still shown`);
  if (!state.shown) problems.push(`class filter: no row of ${choice} is shown`);
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(300);
  const kept = await page.evaluate(() => document.querySelector(".uc-timetable__filters select")?.value);
  if (kept !== choice) problems.push(`class filter: the choice was not kept after a reload ("${kept}")`);
  await context.close();
  return problems;
}

/** The grade simulation of <uc-grading calculator>, on pages that have one. */
async function checkGradingCalculator(browser, origin, relative) {
  const problems = [];
  const { context, page } = await open(browser, origin, relative);
  const calculator = await firstVisible(page, ".uc-grading__calculator");
  if (!calculator) {
    await context.close();
    return problems;
  }
  const fields = await calculator.$$("input");
  const input = fields[0];
  const box = await input.boundingBox();
  if (box && box.height < 44) problems.push(`calculator: a field is ${Math.round(box.height)}px tall (44px minimum)`);
  if (!(await input.evaluate((node) => (node.labels[0] ? node.labels[0].textContent.trim() : "")))) problems.push("calculator: a field has no visible <label>");
  await input.focus();
  await page.keyboard.type("999");
  await page.waitForTimeout(100);
  const invalid = await input.evaluate((node) => ({
    state: node.getAttribute("aria-invalid"),
    error: (document.getElementById(node.getAttribute("aria-describedby") || "") || {}).textContent || "",
  }));
  if (invalid.state !== "true") problems.push("calculator: an out-of-range value does not set aria-invalid");
  if (!invalid.error.trim()) problems.push("calculator: the error is not linked with aria-describedby");
  // Every field set to 0 by keyboard: the field is valid again and the result is announced.
  for (const field of fields) {
    await field.focus();
    await page.keyboard.press("Control+A");
    await page.keyboard.type("0");
  }
  await page.waitForTimeout(450);
  if ((await input.getAttribute("aria-invalid")) !== "false") problems.push("calculator: aria-invalid stays set after a valid value");
  if (!/Nota final|Final grade/.test(await liveText(page))) problems.push("calculator: the simulated grade is not announced");
  if (!(await focusedMatches(page, ".uc-grading__calculator input"))) problems.push("calculator: focus left the field");
  await context.close();
  return problems;
}

/** The search field of <uc-summaries search>, on pages that have one. */
async function checkSummariesSearch(browser, origin, relative) {
  const problems = [];
  const { context, page } = await open(browser, origin, relative);
  const input = await firstVisible(page, ".uc-summaries__search input");
  if (!input) {
    await context.close();
    return problems;
  }
  const box = await input.boundingBox();
  if (box && box.height < 44) problems.push(`summaries search: the field is ${Math.round(box.height)}px tall (44px minimum)`);
  if (!(await input.evaluate((node) => (node.labels[0] ? node.labels[0].textContent.trim() : "")))) problems.push("summaries search: the field has no visible <label>");
  // The first word of the first summary, typed without its accents.
  const word = await page.evaluate(() => {
    const body = document.querySelector(".uc-summaries__item .uc-summaries__body strong, .uc-summaries__item .uc-summaries__body");
    return (body.textContent.match(/[\p{L}]{4,}/u) || [""])[0].normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  });
  await input.focus();
  await page.keyboard.type(word.toUpperCase());
  await page.waitForTimeout(500);
  if (!(await focusedMatches(page, ".uc-summaries__search input"))) problems.push("summaries search: focus left the field");
  if (!/\d+ (de|of) \d+/.test(await liveText(page))) problems.push("summaries search: the number of results is not announced");
  const state = await page.evaluate(() => {
    const root = document.querySelector(".uc-summaries__search").closest("uc-summaries");
    return {
      marks: root.querySelectorAll("mark").length,
      breaks: Array.from(root.querySelectorAll(".uc-summaries__break")).filter((node) => !node.hidden).length,
    };
  });
  if (!state.marks) problems.push(`summaries search: "${word}" is not highlighted`);
  if (state.breaks) problems.push("summaries search: breaks are still shown while searching");
  await page.keyboard.press("Escape");
  await page.waitForTimeout(100);
  if (await input.evaluate((node) => node.value)) problems.push("summaries search: Escape did not clear the field");
  await context.close();
  return problems;
}

/** The filters and "Resolvido" checkboxes of <uc-problems>, on pages that have them. */
async function checkProblems(browser, origin, relative) {
  const problems = [];
  const { context, page } = await open(browser, origin, relative);
  // The last button of the first group (a type): its tag must be on every problem left.
  const button = await firstVisible(page, ".uc-problems__filters .uc-filters__group:first-child .uc-filters__button:last-child");
  if (button) {
    const box = await button.boundingBox();
    if (box && box.height < 44) problems.push(`problem filters: a button is ${Math.round(box.height)}px tall (44px minimum)`);
    await button.focus();
    await page.keyboard.press("Enter");
    await page.waitForTimeout(200);
    if ((await button.getAttribute("aria-pressed")) !== "true") problems.push("problem filters: Enter did not set aria-pressed");
    if (!(await focusedMatches(page, ".uc-problems__filters .uc-filters__button"))) problems.push("problem filters: the button lost focus");
    if (!/\d+ (de|of) \d+/.test(await liveText(page))) problems.push("problem filters: the number of problems is not announced");
    const wrong = await button.evaluate((node) =>
      Array.from(node.closest("uc-problems").querySelectorAll(".uc-problems__item"))
        .filter((item) => !item.hidden)
        .filter((item) => !Array.from(item.querySelectorAll(".uc-problems__tags .uc-tag")).some((tag) => tag.textContent === node.textContent)).length,
    );
    if (wrong) problems.push(`problem filters: ${wrong} problems that do not match "${await button.textContent()}" are still shown`);
  }
  const checkbox = await firstVisible(page, ".uc-problems__solved input");
  if (checkbox) {
    const box = await page.locator(".uc-problems__solved").first().boundingBox();
    if (box && box.height < 44) problems.push(`problems: the "Resolvido" label is ${Math.round(box.height)}px tall (44px minimum)`);
    const name = await checkbox.getAttribute("aria-label");
    if (!/^(Resolvido|Solved): .+/.test(name || "")) problems.push(`problems: the checkbox name does not name the problem ("${name}")`);
    await checkbox.focus();
    await page.keyboard.press("Space");
    await page.waitForTimeout(100);
    if (!(await checkbox.isChecked())) problems.push("problems: Space did not check 'Resolvido'");
    await page.reload({ waitUntil: "load" });
    await page.waitForTimeout(300);
    const kept = await page.evaluate(() => Array.from(document.querySelectorAll(".uc-problems__solved input")).some((input) => input.checked));
    if (!kept) problems.push("problems: 'Resolvido' was not kept after a reload");
  }
  await context.close();
  return problems;
}

/** Sortable table headers and the "Outros anos" disclosure, on pages that have them. */
async function checkSortableAndEditions(browser, origin, relative) {
  const problems = [];
  const { context, page } = await open(browser, origin, relative);
  const sort = await firstVisible(page, ".uc-sort-button");
  if (sort) {
    const box = await sort.boundingBox();
    if (box && box.height < 44) problems.push(`sortable table: a header button is ${Math.round(box.height)}px tall (44px minimum)`);
    const state = () => sort.evaluate((node) => node.closest("th").getAttribute("aria-sort"));
    await sort.focus();
    await page.keyboard.press("Enter");
    await page.waitForTimeout(150);
    const first = await state();
    await page.keyboard.press("Enter");
    await page.waitForTimeout(150);
    const second = await state();
    if (!first || !second || first === second) problems.push(`sortable table: aria-sort went ${first} then ${second}`);
    if (!(await focusedMatches(page, ".uc-sort-button"))) problems.push("sortable table: the header button lost focus");
    if (!/Ordenado por|Sorted by/.test(await liveText(page))) problems.push("sortable table: the new order is not announced");
  }
  const editions = await firstVisible(page, ".uc-page__editions-button");
  if (editions) {
    await editions.focus();
    await page.keyboard.press("Enter");
    await page.waitForTimeout(100);
    const opened = await editions.getAttribute("aria-expanded");
    const shown = await page.locator(".uc-page__editions-menu a").first().isVisible();
    await page.keyboard.press("Escape");
    await page.waitForTimeout(100);
    const closed = await editions.getAttribute("aria-expanded");
    if (opened !== "true" || !shown || closed !== "false") problems.push(`editions: aria-expanded went ${opened} then ${closed} (list shown: ${shown})`);
    if (!(await focusedMatches(page, ".uc-page__editions-button"))) problems.push("editions: Escape did not return focus to the button");
  }
  await context.close();
  return problems;
}

async function checkPage(browser, origin, relative, axeSource) {
  const problems = [];
  const { context, page } = await open(browser, origin, relative);
  problems.push(...(await runAxe(page, axeSource)).map((line) => `[axe] ${line}`));
  const base = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--uc-font-size-base").trim());
  if (/px$/.test(base)) problems.push(`root font size is fixed (${base}): it ignores the reader's browser setting`);
  problems.push(...(await checkLabelInName(page)));
  problems.push(...(await checkKeyboard(page)));
  await page.evaluate(() => document.querySelectorAll("details").forEach((details) => (details.open = true)));
  await page.waitForTimeout(100);
  problems.push(...(await runAxe(page, axeSource)).map((line) => `[axe, disclosures open] ${line}`));
  await context.close();
  problems.push(...(await checkReflowAndZoom(browser, origin, relative)));
  problems.push(...(await checkMotion(browser, origin, relative)));
  problems.push(...(await checkBehaviour(browser, origin, relative)));
  problems.push(...(await checkWidgets(browser, origin, relative, axeSource)));
  problems.push(...(await checkSearch(browser, origin, relative, axeSource)));
  return [...new Set(problems)];
}

/** Opens the search dialog from the header button with the keyboard and types `query`. */
async function openSearchDialog(page, query) {
  await page.focus(".uc-search-button");
  await page.keyboard.press("Enter");
  await page.waitForSelector(".uc-search-dialog[open]", { timeout: 4000 });
  await page.waitForFunction(() => document.querySelector(".uc-search-dialog [role='status']").textContent !== UC.t("search.loading"), null, { timeout: 4000 });
  if (query) {
    await page.keyboard.type(query);
    await page.waitForTimeout(100);
  }
}

/**
 * The site search (docs/plan/search-api.md 10), on pages whose site has an
 * index: the dialog (modal, combobox and listbox, arrows, Esc and focus
 * back, the count in a status region, 44 px options, axe while open, no
 * horizontal scroll at 320 px) and <uc-search> (label, 44 px field, the count
 * announced, Esc clears, axe with results).
 */
async function checkSearch(browser, origin, relative, axeSource) {
  const problems = [];
  const { context, page } = await open(browser, origin, relative);
  if (!(await page.$(".uc-search-button:not(.uc-search-button--pending)"))) {
    await context.close();
    return problems;
  }
  // A word of the page's own <h1>: it is in the index whatever the site's
  // language, so the dialog always has results.
  const query = await page.evaluate(() => {
    const words = (document.querySelector("h1")?.textContent || "").match(/[\p{L}\p{N}]{4,}/gu) || [];
    return words.sort((a, b) => b.length - a.length)[0] || "arvores";
  });
  await openSearchDialog(page, query);
  const dialog = await page.evaluate(() => {
    const box = document.querySelector(".uc-search-dialog");
    const input = document.activeElement;
    const options = Array.from(box.querySelectorAll("[role='option']"));
    return {
      modal: box.matches(":modal"),
      named: Boolean(box.getAttribute("aria-labelledby") && document.getElementById(box.getAttribute("aria-labelledby")).textContent.trim()),
      combobox: input.getAttribute("role") === "combobox" && input.getAttribute("aria-expanded") === "true" && document.getElementById(input.getAttribute("aria-controls"))?.getAttribute("role") === "listbox",
      active: input.getAttribute("aria-activedescendant"),
      options: options.map((option) => option.id),
      short: options.filter((option) => option.getBoundingClientRect().height < 44).length,
      status: box.querySelector("[role='status']").textContent,
    };
  });
  if (!dialog.modal) problems.push("search: the dialog is not modal");
  if (!dialog.named) problems.push("search: the dialog has no accessible name");
  if (!dialog.combobox) problems.push("search: the field is not an expanded combobox controlling a listbox");
  if (!dialog.options.length) problems.push(`search: no results for '${query}'`);
  if (dialog.active !== dialog.options[0]) problems.push("search: the first result is not the active descendant");
  if (dialog.short) problems.push(`search: ${dialog.short} result(s) shorter than 44px`);
  if (!/\d+ (resultados?|results?)/.test(dialog.status)) problems.push(`search: the count is not in the status region ("${dialog.status}")`);
  if (dialog.options.length > 1) {
    await page.keyboard.press("ArrowDown");
    const active = await page.evaluate(() => document.activeElement.getAttribute("aria-activedescendant"));
    if (active !== dialog.options[1]) problems.push("search: ArrowDown did not move to the second result");
  }
  (await runAxe(page, axeSource)).forEach((line) => problems.push(`[search dialog] [axe] ${line}`));
  await page.keyboard.press("Escape");
  await page.waitForTimeout(100);
  if (await page.$(".uc-search-dialog[open]")) problems.push("search: Escape did not close the dialog");
  if (!(await focusedMatches(page, ".uc-search-button"))) problems.push("search: focus did not go back to the button");

  const field = await page.$("uc-search input");
  if (field) {
    const box = await field.boundingBox();
    if (box && box.height < 44) problems.push(`uc-search: the field is ${Math.round(box.height)}px tall (44px minimum)`);
    if (!(await field.evaluate((node) => (node.labels[0] ? node.labels[0].textContent.trim() : "")))) problems.push("uc-search: the field has no visible <label>");
    await field.focus();
    await page.keyboard.type(query);
    await page.waitForTimeout(1000);
    if (!/\d+ (resultados?|results?)/.test(await liveText(page))) problems.push("uc-search: the number of results is not announced");
    if (!(await focusedMatches(page, "uc-search input"))) problems.push("uc-search: focus left the field");
    (await runAxe(page, axeSource)).forEach((line) => problems.push(`[uc-search] [axe] ${line}`));
    await page.keyboard.press("Escape");
    if (await field.evaluate((node) => node.value)) problems.push("uc-search: Escape did not clear the field");
  }
  await context.close();

  const narrow = await open(browser, origin, relative, { viewport: { width: 320, height: 640 } });
  await openSearchDialog(narrow.page, query);
  const overflow = await narrow.page.evaluate(() => {
    const box = document.querySelector(".uc-search-dialog");
    return Math.max(box.scrollWidth - box.clientWidth, box.getBoundingClientRect().right - window.innerWidth);
  });
  if (overflow > 1) problems.push(`search: the dialog overflows by ${Math.round(overflow)}px at 320px wide`);
  await narrow.context.close();
  return problems;
}

/** Widgets (docs/plan/widgets-api.md 18.3 item 4), on pages that have one. */
async function checkWidgets(browser, origin, relative, axeSource) {
  const problems = [];
  const { context, page } = await open(browser, origin, relative);
  const found = await page.evaluate(() => {
    const widgets = Array.from(document.querySelectorAll("*")).filter((node) => node.localName.startsWith("uc-widget-"));
    widgets.forEach((widget) => widget.go && widget.go(0)); // builds the ones still off screen
    return widgets.filter((widget) => widget.total > 0).length;
  });
  if (!found) {
    await context.close();
    return problems;
  }
  const at = () => page.evaluate(() => {
    const widget = document.querySelector(".uc-widget[predict]") || document.querySelector(".uc-widget");
    return { step: widget.step, total: widget.total, live: widget.querySelector("[aria-live]").textContent };
  });
  const axeAt = async (label) => (await runAxe(page, axeSource)).forEach((line) => problems.push(`[widget, ${label}] [axe] ${line}`));
  await axeAt("step 0");

  // Keyboard: from the stage to the last step.
  await page.evaluate(() => (document.querySelector(".uc-widget[predict]") || document.querySelector(".uc-widget")).querySelector(".uc-widget__stage").focus());
  let state = await at();
  let asked = false;
  for (let i = 0; i < 2 * state.total + 4 && state.step < state.total - 1; i += 1) {
    const before = state.step;
    await page.keyboard.press("ArrowRight");
    const question = await page.$(".uc-widget__predict:not([hidden]) .uc-widget__option");
    if (question) {
      if (!asked) {
        asked = true;
        const focused = await page.evaluate(() => document.activeElement.classList.contains("uc-widget__option"));
        if (!focused) problems.push("[widget] predict: focus did not move to the first option");
        await axeAt("predict question open");
      }
      await page.keyboard.press("Enter");
      const back = await page.evaluate(() => document.activeElement.closest(".uc-widget__player") !== null);
      if (!back) problems.push("[widget] predict: after the answer, focus is not back on the player");
      await page.evaluate(() => (document.querySelector(".uc-widget[predict]") || document.querySelector(".uc-widget")).querySelector(".uc-widget__stage").focus());
    }
    state = await at();
    if (state.step === before) {
      problems.push(`[widget] keyboard: ArrowRight did not move from step ${before + 1}`);
      break;
    }
    if (!state.live.trim()) problems.push(`[widget] keyboard: step ${state.step + 1} was not announced`);
  }
  if (state.step !== state.total - 1) problems.push(`[widget] keyboard: stopped at step ${state.step + 1} of ${state.total}`);
  await axeAt("last step");
  await page.keyboard.press("Home");
  if ((await at()).step !== 0) problems.push("[widget] keyboard: Home did not go to step 1");
  await page.keyboard.press("End");

  // Text view.
  const toggle = await page.$(".uc-widget__text-toggle");
  await toggle.focus();
  await page.keyboard.press("Enter");
  if ((await toggle.getAttribute("aria-expanded")) !== "true") problems.push("[widget] text view: aria-expanded did not change");
  await axeAt("text view open");

  // Language switch keeps the step.
  const switched = await page.evaluate(() => {
    if (!window.UC || !UC.setLanguage || !(UC.course?.languages || []).includes("en")) return null;
    const widget = document.querySelector(".uc-widget");
    widget.go(2);
    UC.setLanguage("en");
    return widget.step;
  });
  if (switched !== null) {
    await page.waitForTimeout(100);
    const after = await page.evaluate(() => ({ step: document.querySelector(".uc-widget").step, say: document.querySelector(".uc-widget__say").textContent }));
    if (after.step !== switched) problems.push(`[widget] language switch moved from step ${switched + 1} to ${after.step + 1}`);
    await page.evaluate(() => UC.setLanguage("pt"));
  }
  await context.close();

  // Without JavaScript the teacher's fallback is there.
  {
    const { context: noJs, page: plain } = await open(browser, origin, relative, { javaScriptEnabled: false });
    const empty = await plain.evaluate(() =>
      Array.from(document.querySelectorAll("*")).filter((node) => node.localName.startsWith("uc-widget-") && !node.innerText.trim()).length,
    );
    if (empty) problems.push(`[widget] no-js: ${empty} widget(s) without fallback text`);
    await noJs.close();
  }
  return problems;
}

/** Compares (or, with --update-snapshots, writes) the accessibility-tree snapshots. */
async function checkAriaSnapshots(browser, origin, update, filters, shard) {
  let failed = 0;
  const snapshots = ARIA_SNAPSHOTS.filter(({ page }) => !filters.length || filters.some((filter) => page.includes(filter)));
  for (const { page: relative, selector, file, prepare } of shardOf(snapshots, shard)) {
    const { context, page } = await open(browser, origin, relative);
    if (prepare) await prepare(page);
    const actual = `${await page.locator(selector).first().ariaSnapshot()}\n`;
    await context.close();
    const target = path.join(ROOT, file);
    const expected = await readFile(target, "utf8").catch(() => null);
    if (update || expected === null) {
      await writeFile(target, actual);
      console.log(`${expected === null ? "new " : "upd "} ${file}`);
    } else if (expected !== actual) {
      failed += 1;
      console.log(`FAIL ${file} (accessibility tree of ${relative} ${selector} changed)`);
      const a = expected.split("\n");
      const b = actual.split("\n");
      for (let i = 0, shown = 0; i < Math.max(a.length, b.length) && shown < 8; i += 1) {
        if (a[i] === b[i]) continue;
        shown += 1;
        console.log(`       - ${a[i] ?? ""}\n       + ${b[i] ?? ""}`);
      }
      console.log("       Run node scripts/check-a11y.mjs --update-snapshots if the change is intended.");
    } else {
      console.log(`ok   ${file}`);
    }
  }
  return failed;
}

async function main() {
  const args = process.argv.slice(2);
  const update = args.includes("--update-snapshots");
  const filters = filterArgs(args);
  const shard = parseShard(args);
  const concurrency = parseConcurrency(args);
  const matching = (await findPages()).filter((page) => !filters.length || filters.some((filter) => page.includes(filter)));
  const pages = shardOf(matching, shard);
  if (shard.total > 1) console.log(`Shard ${shard.index}/${shard.total}: ${pages.length} of ${matching.length} pages.`);
  const axeSource = await readFile(require.resolve("axe-core/axe.min.js"), "utf8");
  const server = await startServer();
  const origin = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch();
  let failed = 0;
  let snapshotsFailed = 0;
  try {
    await runPool(
      pages,
      concurrency,
      (relative) => checkPage(browser, origin, relative, axeSource),
      (relative, result) => {
        const problems = result.error ? [`check crashed: ${result.error.stack || result.error}`] : result;
        console.log(`${problems.length ? "FAIL" : "ok  "} ${relative}`);
        problems.forEach((problem) => console.log(`       ✗ ${problem}`));
        if (problems.length) failed += 1;
      },
    );
    snapshotsFailed = await checkAriaSnapshots(browser, origin, update, filters, shard);
  } finally {
    await browser.close();
    server.close();
  }
  console.log(`\n${pages.length - failed}/${pages.length} pages passed the accessibility checks.`);
  if (snapshotsFailed) console.log(`${snapshotsFailed} accessibility-tree snapshot(s) changed.`);
  process.exitCode = failed || snapshotsFailed ? 1 : 0;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
