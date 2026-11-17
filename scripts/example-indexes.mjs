/**
 * Search indexes of the examples (search plan, phase S3).
 *
 * For each folder of examples/ whose course.js turns `search` on, runs the
 * maintenance script teachers use, template/uc-site.py, and keeps the index
 * it prints next to course.js. The script is the only implementation of the
 * extraction rules (docs/plan/search-api.md sections 4 to 6): nothing here
 * reads HTML.
 *
 * The index holds the time it was generated, so two runs never give the same
 * bytes. The comparison leaves that field out: a file whose content did not
 * change is not rewritten, and --check only fails when the pages changed.
 *
 * Needs python3 (3.8 or newer) only when an example has `search`.
 */
import { spawnSync } from "node:child_process";
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const EXAMPLES = path.join(ROOT, "examples");
const SCRIPT = path.join(ROOT, "template", "uc-site.py");

/** `search` in an example's course.js: off, or the index file name. Examples keep course.js simple. */
function indexName(courseSource) {
  const field = courseSource.match(/^\s*search\s*:\s*(true|\{[^}]*\})/m);
  if (!field) return null;
  const custom = field[1].match(/\bindex\s*:\s*["']([^"']+)["']/);
  return custom ? custom[1] : "search-index.js";
}

const withoutDate = (source) => source.replace(/"generated":"[^"]*"/, '"generated":""');

/** Writes (or, with check, verifies) the examples' indexes. Returns the number of problems. */
export async function buildExampleIndexes({ check = false } = {}) {
  let problems = 0;
  for (const name of (await readdir(EXAMPLES)).sort()) {
    const folder = path.join(EXAMPLES, name);
    const course = await readFile(path.join(folder, "course.js"), "utf8").catch(() => null);
    const index = course && indexName(course);
    if (!index) continue;
    const run = spawnSync("python3", [SCRIPT, "index", "--stdout", "--site", folder], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
    if (run.error || run.status !== 0) {
      console.error(`examples/${name}: python3 template/uc-site.py index failed: ${run.error ? run.error.message : run.stderr.trim()}`);
      problems++;
      continue;
    }
    const target = path.join(folder, index);
    const previous = await readFile(target, "utf8").catch(() => "");
    if (withoutDate(previous) === withoutDate(run.stdout)) continue;
    if (check) {
      console.error(`examples/${name}/${index} is out of date. Run: npm run build`);
      problems++;
    } else {
      await writeFile(target, run.stdout);
      console.log(`wrote examples/${name}/${index} (${(Buffer.byteLength(run.stdout) / 1024).toFixed(1)} KB)`);
    }
  }
  return problems;
}
