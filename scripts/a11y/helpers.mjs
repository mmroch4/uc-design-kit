/**
 * Shared by the accessibility checks (scripts/check-a11y.mjs and scripts/a11y/):
 * opening a page, axe-core, live regions, focus and the search dialog.
 */
import { AXE_TAGS, injectAxe, waitForGrading, waitForReveal, waitForSearchButton, withToday } from "../lib/browser.mjs";
import { routePublicKit } from "../lib/server.mjs";

/** Best-practice rules checked on top of WCAG 2.1 A/AA. */
const AXE_EXTRA_RULES = ["landmark-unique"];

/**
 * Opens `relative` in a new context (1280 x 900 unless `options` says otherwise),
 * with the kit of this checkout and no CDN, once the kit has rendered it.
 * The caller closes the returned context.
 */
export async function open(browser, origin, relative, options = {}) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, ...options });
  await routePublicKit(context);
  // Code highlighting comes from a CDN: not needed here, and it may be offline.
  await context.route("https://cdnjs.cloudflare.com/**", (route) => route.abort());
  const page = await context.newPage();
  await page.goto(withToday(`${origin}/${relative}`), { waitUntil: "load" });
  await waitForReveal(page, 4000);
  await waitForGrading(page);
  await waitForSearchButton(page, 7000);
  await page.waitForTimeout(200);
  return { context, page };
}

/** axe-core with the WCAG 2.1 A/AA rules and AXE_EXTRA_RULES; one line per violation. */
export async function runAxe(page, axeSource) {
  await injectAxe(page, axeSource);
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

/** The text of every live region of the page, joined with " | ". */
export const liveText = (page) =>
  page.evaluate(() =>
    Array.from(document.querySelectorAll("[aria-live], [role='status'], [role='alert']"))
      .map((node) => node.textContent.trim())
      .join(" | "),
  );

/** Whether the focused element matches `selector`. */
export const focusedMatches = (page, selector) => page.evaluate((s) => Boolean(document.activeElement && document.activeElement.matches(s)), selector);

/** The first visible element that matches `selector`, or null. */
export async function firstVisible(page, selector) {
  for (const handle of await page.$$(selector)) if (await handle.isVisible()) return handle;
  return null;
}

/** Opens the search dialog from the header button with the keyboard and types `query`. */
export async function openSearchDialog(page, query) {
  await page.focus(".uc-search-button");
  await page.keyboard.press("Enter");
  await page.waitForSelector(".uc-search-dialog[open]", { timeout: 4000 });
  await page.waitForFunction(() => document.querySelector(".uc-search-dialog [role='status']").textContent !== UC.t("search.loading"), null, { timeout: 4000 });
  if (query) {
    await page.keyboard.type(query);
    await page.waitForTimeout(100);
  }
}
