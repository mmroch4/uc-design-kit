/**
 * Size budgets and built outputs, shared by the kit build (build.mjs), the
 * widgets build (build-widgets.mjs) and the "nothing changed" check
 * (check-dom.mjs, which keeps the gzip size of every built file).
 *
 * Every budget lives here, next to the section of the contract that sets it:
 * raise one there first, then here.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { gzipSync } from "node:zlib";
import { ROOT } from "./server.mjs";

export const KB = 1024;

/** Gzip budgets of the kit's bundles in kit/v1/. */
export const KIT_BUDGETS = [
  { name: "uc-kit.js", budget: 48 * KB, where: "docs/architecture/blocks-api.md 1.5" },
  { name: "uc-grading.js", budget: 8 * KB, where: "docs/architecture/grading-api.md 2.3" },
  { name: "uc-search.js", budget: 6 * KB, where: "docs/architecture/search-api.md 11.1" },
];

/** Gzip budgets of the widget library in widgets/v1/ (docs/architecture/widgets-api.md 18.2). */
export const WIDGET_BUDGETS = { core: 12 * KB, widget: 8 * KB, css: 4 * KB };

/** Size in bytes of `content` gzipped at the highest level (as the budgets and the record measure it). */
export const gzipSize = (content) => gzipSync(content, { level: 9 }).length;

/** "12.3 KB". */
export const kb = (bytes) => `${(bytes / KB).toFixed(1)} KB`;

/**
 * Prints the gzip size of every item ({ name, content, budget, advice }) and
 * fails the ones over budget, with their advice. Returns the number over budget.
 */
export function checkBudgets(items) {
  let over = 0;
  for (const { name, content, budget, advice } of items) {
    const size = gzipSize(content);
    const line = `${name}: ${kb(size)} gzipped (budget ${budget / KB} KB)`;
    if (size > budget) {
      console.error(`${line}: over budget. ${advice}`);
      over += 1;
    } else {
      console.log(line);
    }
  }
  return over;
}

/**
 * Writes the built files `outputs` ({ name: content }) into `dir` (relative
 * to the repository), skipping the ones that did not change. With `check`
 * nothing is written: each changed file is reported as out of date. Returns
 * the number of out-of-date files.
 */
export async function writeOutputs(outputs, dir, { check = false } = {}) {
  let stale = 0;
  await mkdir(path.join(ROOT, dir), { recursive: true });
  for (const [name, content] of Object.entries(outputs)) {
    const target = path.join(ROOT, dir, name);
    const previous = await readFile(target, "utf8").catch(() => "");
    if (previous === content) continue;
    if (check) {
      console.error(`${dir}/${name} is out of date. Run: npm run build`);
      stale += 1;
    } else {
      await writeFile(target, content);
      console.log(`wrote ${dir}/${name} (${kb(content.length)})`);
    }
  }
  return stale;
}
