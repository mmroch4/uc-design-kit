/** The grade simulation of <uc-grading calculator> (docs/architecture/grading-api.md 9 and 12). */
import { firstVisible, focusedMatches, liveText, open, runAxe } from "./helpers.mjs";

/**
 * The grade simulation of <uc-grading calculator>, on pages that have one: the first legacy
 * calculator and the first one with formulas and rules (docs/architecture/grading-api.md 9 and 12).
 */
export async function checkGradingCalculator(browser, origin, relative, axeSource) {
  const problems = [];
  for (const formulas of [false, true]) problems.push(...(await checkOneGradingCalculator(browser, origin, relative, axeSource, formulas)));
  return problems;
}

async function checkOneGradingCalculator(browser, origin, relative, axeSource, formulas) {
  const problems = [];
  const { context, page } = await open(browser, origin, relative);
  const calculator = await firstVisible(page, `uc-grading${formulas ? ":has(> [data-formulas])" : ":not(:has(> [data-formulas]))"} .uc-grading__calculator`);
  if (!calculator) {
    await context.close();
    return problems;
  }
  const label = formulas ? "calculator with formulas" : "calculator";
  const fields = await calculator.$$("input");
  const input = fields[0];
  const box = await input.boundingBox();
  if (box && box.height < 44) problems.push(`${label}: a field is ${Math.round(box.height)}px tall (44px minimum)`);
  if (!(await input.evaluate((node) => (node.labels[0] ? node.labels[0].textContent.trim() : "")))) problems.push(`${label}: a field has no visible <label>`);
  await input.focus();
  await page.keyboard.type("999");
  await page.waitForTimeout(100);
  const invalid = await input.evaluate((node) => ({
    state: node.getAttribute("aria-invalid"),
    error: (document.getElementById(node.getAttribute("aria-describedby") || "") || {}).textContent || "",
  }));
  if (invalid.state !== "true") problems.push(`${label}: an out-of-range value does not set aria-invalid`);
  if (!invalid.error.trim()) problems.push(`${label}: the error is not linked with aria-describedby`);
  // Every field set to 0 by keyboard: the field is valid again and the result is announced.
  for (const field of fields) {
    await field.focus();
    await page.keyboard.press("Control+A");
    await page.keyboard.type("0");
  }
  await page.waitForTimeout(450);
  if ((await input.getAttribute("aria-invalid")) !== "false") problems.push(`${label}: aria-invalid stays set after a valid value`);
  if (!/Nota final|Final grade/.test(await liveText(page))) problems.push(`${label}: the simulated grade is not announced`);
  if (!(await focusedMatches(page, ".uc-grading__calculator input"))) problems.push(`${label}: focus left the field`);
  if (formulas) {
    // One announcement with the result line and the state line; ✓ / ✗ always come with words (12).
    const ruled = await calculator.evaluate((node) => Boolean(node.querySelector(".uc-grading__checks li")));
    if (ruled && !/(?:Nota final|Final grade).*\. (?:Aprovado|Não aprovado|Pass|Not a pass)/.test(await liveText(page))) problems.push(`${label}: the result and state lines are not announced together`);
    const silent = await calculator.evaluate((node) => Array.from(node.querySelectorAll(".uc-grading__checks li")).filter((item) => /[✓✗]/.test(item.textContent) && !item.querySelector(".uc-visually-hidden")).length);
    if (silent) problems.push(`${label}: ${silent} check(s) show ✓ / ✗ without words`);
    problems.push(...(await runAxe(page, axeSource)).map((line) => `[${label}, after input] [axe] ${line}`));
  }
  await context.close();
  return problems;
}
