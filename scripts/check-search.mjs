#!/usr/bin/env node
/**
 * Checks of the site search foundations in uc-kit.js (docs/architecture/search-api.md
 * sections 6 to 8), in a real browser:
 *
 *   - automatic heading ids: every case of tests/search/slugs.json (shared
 *     with template/uc-site.py), with the kit loaded in <head> and with defer
 *   - the start-up jump to #hash and its .uc-target-flash
 *   - detecting search-index.js: no request without `search`; one HEAD per
 *     visit (sessionStorage), 2xx = yes, 404 or a 5 s timeout = no; the index
 *     path is relative to course.js; over file:// the index is loaded instead
 *   - the header button (placeholder while pending, removed on "no",
 *     search="off"), the shortcuts Ctrl K, ⌘K and "/", UC.search, the
 *     uc:searchready event, uc-search.js loaded on open, unknown index
 *     formats and the stale-index warnings
 *   - the documentation's search: the kit's dialog over docs/assets/search-index.js
 *
 * The pages are made up here and served from a fake origin by Playwright, so
 * each check can choose how the server answers (scripts/search/harness.mjs).
 * The checks are grouped by theme in scripts/search/: ids.mjs, detection.mjs,
 * dialog.mjs and docs.mjs.
 *
 * Usage: node scripts/check-search.mjs
 */
import { chromium } from "playwright";
import { detectionChecks, fileChecks, indexFormatChecks } from "./search/detection.mjs";
import { dialogChecks } from "./search/dialog.mjs";
import { docsChecks } from "./search/docs.mjs";
import { summary } from "./search/harness.mjs";
import { hashChecks, idChecks } from "./search/ids.mjs";

async function main() {
  const browser = await chromium.launch();
  try {
    await idChecks(browser);
    await hashChecks(browser);
    await detectionChecks(browser);
    await dialogChecks(browser);
    await indexFormatChecks(browser);
    await docsChecks(browser);
    await fileChecks(browser);
  } finally {
    await browser.close();
  }
  const { passed, failures } = summary();
  console.log(`\n${passed}/${passed + failures} search checks passed.`);
  process.exitCode = failures ? 1 : 0;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
