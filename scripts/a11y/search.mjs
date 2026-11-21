/** The site search: the dialog and <uc-search> (docs/architecture/search-api.md 10). */
import { focusedMatches, liveText, open, openSearchDialog, runAxe } from "./helpers.mjs";

/**
 * The site search (docs/architecture/search-api.md 10), on pages whose site has an
 * index: the dialog (modal, combobox and listbox, arrows, Esc and focus
 * back, the count in a status region, 44 px options, axe while open, no
 * horizontal scroll at 320 px) and <uc-search> (label, 44 px field, the count
 * announced, Esc clears, axe with results).
 */
export async function checkSearch(browser, origin, relative, axeSource) {
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
