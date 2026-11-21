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
 * The checks are grouped by theme in scripts/a11y/: page.mjs (keyboard,
 * label in name, reflow, text size, motion), components.mjs, grading.mjs,
 * search.mjs, widgets.mjs and snapshots.mjs; helpers.mjs opens the pages.
 *
 * Usage: node scripts/check-a11y.mjs [--shard=i/n] [--concurrency=n] [--update-snapshots] [filter ...]
 *
 * --shard=i/n checks the i-th of n parts of the pages and of the snapshots (CI
 * runs the parts in parallel jobs); --concurrency=n checks n pages at the same
 * time (default: CPU count, max 4).
 */
import { readdir } from "node:fs/promises";
import path from "node:path";
import { loadAxe, withBrowser } from "./lib/browser.mjs";
import { filterArgs, logShard, matchFilters, parseConcurrency, parseShard, reportPage, runPool, shardOf } from "./lib/runner.mjs";
import { ROOT } from "./lib/server.mjs";
import { checkBehaviour } from "./a11y/components.mjs";
import { checkGradingCalculator } from "./a11y/grading.mjs";
import { open, runAxe } from "./a11y/helpers.mjs";
import { checkKeyboard, checkLabelInName, checkMotion, checkReflowAndZoom } from "./a11y/page.mjs";
import { checkSearch } from "./a11y/search.mjs";
import { checkAriaSnapshots } from "./a11y/snapshots.mjs";
import { checkWidgets } from "./a11y/widgets.mjs";

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
  // The widget test pages (several widgets each, predict, editable, bilingual).
  pages.push("tests/pages/uc-widget-sort.html", "tests/pages/uc-widget-basics.html", "tests/pages/uc-widget-trees-hashing.html", "tests/pages/uc-widget-graphs.html", "tests/pages/uc-widget-design-techniques.html");
  // A teacher's own widget built from widgets/template/ (the "Criar um widget" guide).
  pages.push("docs/demos/widgets-criar/basic.html");
  // The header search button (a site with search on and an index).
  pages.push("tests/pages/search/index.html");
  // The one CSS-block demo with behaviour (sortable headers).
  pages.push("docs/demos/blocks/table-sortable.html");
  return pages.sort();
}

/** Every check of one page; one line per problem, without repeats. */
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
  problems.push(...(await checkGradingCalculator(browser, origin, relative, axeSource)));
  problems.push(...(await checkWidgets(browser, origin, relative, axeSource)));
  problems.push(...(await checkSearch(browser, origin, relative, axeSource)));
  return [...new Set(problems)];
}

async function main() {
  const args = process.argv.slice(2);
  const update = args.includes("--update-snapshots");
  const filters = filterArgs(args);
  const shard = parseShard(args);
  const concurrency = parseConcurrency(args);
  const matching = matchFilters(await findPages(), filters);
  const pages = shardOf(matching, shard);
  logShard(shard, pages.length, matching.length);
  const axeSource = await loadAxe();
  let failed = 0;
  let snapshotsFailed = 0;
  await withBrowser(async ({ browser, origin }) => {
    await runPool(
      pages,
      concurrency,
      (relative) => checkPage(browser, origin, relative, axeSource),
      (relative, result) => {
        if (reportPage(relative, result.error ? [`check crashed: ${result.error.stack || result.error}`] : result)) failed += 1;
      },
    );
    snapshotsFailed = await checkAriaSnapshots(browser, origin, update, filters, shard);
  });
  console.log(`\n${pages.length - failed}/${pages.length} pages passed the accessibility checks.`);
  if (snapshotsFailed) console.log(`${snapshotsFailed} accessibility-tree snapshot(s) changed.`);
  process.exitCode = failed || snapshotsFailed ? 1 : 0;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
