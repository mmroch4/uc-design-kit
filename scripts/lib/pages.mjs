/**
 * The pages the browser checks open (check-pages.mjs, check-dom.mjs): every
 * HTML page of tests/pages, examples, template, docs and the repository root,
 * without redirect stubs, plus tests/widgets/compat.html once for widgets/v1/
 * and once for every frozen widgets release.
 */
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { WIDGETS, listReleases } from "../releases.mjs";
import { ROOT } from "./server.mjs";

const PAGE_DIRS = ["tests/pages", "examples", "template", "docs"];
const IGNORED_DIRS = new Set(["node_modules", ".git", "screenshots"]);

/** Absolute paths, sorted; an item may carry a query ("compat.html?release=v1.0.0"). */
export async function findPages(root = ROOT) {
  const pages = [];
  const rootIndex = path.join(root, "index.html");
  if (await exists(rootIndex)) pages.push(rootIndex);
  for (const dir of PAGE_DIRS) {
    const absolute = path.join(root, dir);
    if (await exists(absolute)) pages.push(...(await walk(absolute)));
  }
  const html = pages.filter((file) => file.endsWith(".html")).sort();
  // Redirect stubs (<meta http-equiv="refresh">, e.g. docs/index.html) navigate
  // away while being checked; their target is checked on its own.
  const isRedirect = async (file) => /http-equiv="refresh"/i.test(await readFile(file, "utf8"));
  const flags = await Promise.all(html.map(isRedirect));
  const checked = html.filter((_, index) => !flags[index]);
  // The widgets compatibility page, against widgets/v1/ and every frozen release.
  const compat = path.join(root, "tests", "widgets", "compat.html");
  if (await exists(compat)) {
    checked.push(compat);
    for (const release of await listReleases(WIDGETS)) checked.push(`${compat}?release=${release}`);
  }
  return checked;
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

export async function exists(file) {
  try {
    await stat(file);
    return true;
  } catch {
    return false;
  }
}
