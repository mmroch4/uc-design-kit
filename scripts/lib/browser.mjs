/**
 * The browser side shared by the checks that open the repository's pages
 * (check-pages, check-a11y, check-dom): the frozen date, Chromium with the
 * local server, waiting until the kit has rendered a page, and axe-core.
 */
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { chromium } from "playwright";
import { ROOT, startServer } from "./server.mjs";

const require = createRequire(import.meta.url);

/** The frozen date every page is opened with (?today=), so date-dependent output is stable. */
export const TODAY = process.env.TEST_TODAY || "2025-11-27";

/** axe-core rule tags: WCAG 2.1 A and AA. */
export const AXE_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

/** `url` with ?today=TODAY. */
export function withToday(url) {
  const parsed = new URL(url);
  parsed.searchParams.set("today", TODAY);
  return parsed.toString();
}

/**
 * Starts the local server for `root` and Chromium, runs task({ browser,
 * origin }) and always closes both. Resolves with what the task returns.
 */
export async function withBrowser(task, root = ROOT) {
  const server = await startServer(root);
  const origin = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch();
  try {
    return await task({ browser, origin });
  } finally {
    await browser.close();
    server.close();
  }
}

/** Waits for `predicate` in the page; resolves with whether it came true within `timeout` ms. */
const waitFor = (page, predicate, timeout) => page.waitForFunction(predicate, null, { timeout }).then(() => true, () => false);

/** Pages with <uc-page> stay hidden until the kit reveals them (.uc-visible on <html>). */
export const waitForReveal = (page, timeout = 3000) =>
  waitFor(page, () => !document.querySelector("uc-page") || document.documentElement.classList.contains("uc-visible"), timeout);

/** <uc-grading> comes from uc-grading.js, loaded next to uc-kit.js (core/modules.js). */
export const waitForGrading = (page, timeout = 4000) =>
  waitFor(page, () => !document.querySelector("uc-grading") || Boolean(customElements.get("uc-grading")), timeout);

/** A site with `search` asks whether its index exists when idle: the header button stays a placeholder until the answer. */
export const waitForSearchButton = (page, timeout) => waitFor(page, () => !document.querySelector(".uc-search-button--pending"), timeout);

/** The source of axe-core, to inject into pages. */
export const loadAxe = () => readFile(require.resolve("axe-core/axe.min.js"), "utf8");

/** Injects axe-core into the page once. */
export async function injectAxe(page, axeSource) {
  if (!(await page.evaluate(() => Boolean(window.axe)))) await page.addScriptTag({ content: axeSource });
}
