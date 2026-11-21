/**
 * Accessibility-tree snapshots (Playwright ariaSnapshot) of the blocks' test
 * pages, stored next to them (tests/pages/*.aria.yml).
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { matchFilters, shardOf } from "../lib/runner.mjs";
import { ROOT } from "../lib/server.mjs";
import { open, openSearchDialog } from "./helpers.mjs";

/**
 * Accessibility-tree snapshots: one block of one test page, at TODAY.
 * Add a line per new block (docs/architecture/blocks-api.md 11.4).
 */
const ARIA_SNAPSHOTS = [
  { page: "tests/pages/uc-timetable.html", selector: "#all", file: "tests/pages/uc-timetable.aria.yml" },
  { page: "tests/pages/uc-timetable.html", selector: "#days", file: "tests/pages/uc-timetable-days.aria.yml" },
  { page: "tests/pages/uc-grading.html", selector: "#pc", file: "tests/pages/uc-grading.aria.yml" },
  { page: "tests/pages/uc-grading.html", selector: "#edados-2627", file: "tests/pages/uc-grading-formulas.aria.yml" },
  {
    page: "tests/pages/uc-grading.html",
    selector: "#edados-2627 .uc-grading__calculator",
    file: "tests/pages/uc-grading-simulation.aria.yml",
    // P 20, R 20, E 4 (grading-api.md 13.3): two branches, Fórmula 2 counts, E ≥ 4,9 fails.
    prepare: async (page) => {
      for (const [index, value] of ["20", "20", "4"].entries()) await page.locator("#edados-2627 .uc-grading__calculator input").nth(index).fill(value);
      await page.waitForTimeout(450);
    },
  },
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

/** Compares (or, with --update-snapshots, writes) the accessibility-tree snapshots. */
export async function checkAriaSnapshots(browser, origin, update, filters, shard) {
  let failed = 0;
  const snapshots = matchFilters(ARIA_SNAPSHOTS, filters, ({ page }) => page);
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
