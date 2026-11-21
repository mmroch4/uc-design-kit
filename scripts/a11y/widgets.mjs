/** Widgets (uc-widget-*): keyboard, announcements, axe at several steps, still figures and the no-JavaScript fallback. */
import { open, runAxe } from "./helpers.mjs";

/** Widgets (docs/architecture/widgets-api.md 18.3 item 4), on pages that have one. */
export async function checkWidgets(browser, origin, relative, axeSource) {
  const problems = [];
  const { context, page } = await open(browser, origin, relative);
  const found = await page.evaluate(() => {
    // Catalogue widgets, and teachers' own ones (any element built on UC.widgets.Widget gets .uc-widget).
    const widgets = Array.from(document.querySelectorAll("*")).filter((node) => node.localName.startsWith("uc-widget-") || node.classList.contains("uc-widget"));
    widgets.forEach((widget) => widget.go && widget.go(0)); // builds the ones still off screen
    return widgets.filter((widget) => widget.total > 0 && !widget.classList.contains("uc-widget--still")).length;
  });
  // Pages with only still figures (controls="none", 8.3) skip the player checks; the still check below covers them.
  if (!found && !(await page.evaluate(() => document.querySelector(".uc-widget--still")))) {
    await context.close();
    return problems;
  }
  const at = () => page.evaluate(() => {
    const widget = document.querySelector(".uc-widget[predict]:not(.uc-widget--still)") || document.querySelector(".uc-widget:not(.uc-widget--still)");
    return { step: widget.step, total: widget.total, live: widget.querySelector("[aria-live]").textContent };
  });
  const axeAt = async (label) => (await runAxe(page, axeSource)).forEach((line) => problems.push(`[widget, ${label}] [axe] ${line}`));
  await axeAt("step 0");

  if (found) {
    // Keyboard: from the stage to the last step.
    await page.evaluate(() => (document.querySelector(".uc-widget[predict]:not(.uc-widget--still)") || document.querySelector(".uc-widget:not(.uc-widget--still)")).querySelector(".uc-widget__stage").focus());
    let state = await at();
    let asked = false;
    for (let i = 0; i < 2 * state.total + 4 && state.step < state.total - 1; i += 1) {
      const before = state.step;
      await page.keyboard.press("ArrowRight");
      const question = await page.$(".uc-widget__predict:not([hidden]) .uc-widget__option");
      if (question) {
        if (!asked) {
          asked = true;
          const focused = await page.evaluate(() => document.activeElement.classList.contains("uc-widget__option"));
          if (!focused) problems.push("[widget] predict: focus did not move to the first option");
          await axeAt("predict question open");
        }
        await page.keyboard.press("Enter");
        const back = await page.evaluate(() => document.activeElement.closest(".uc-widget__player") !== null);
        if (!back) problems.push("[widget] predict: after the answer, focus is not back on the player");
        await page.evaluate(() => (document.querySelector(".uc-widget[predict]:not(.uc-widget--still)") || document.querySelector(".uc-widget:not(.uc-widget--still)")).querySelector(".uc-widget__stage").focus());
      }
      state = await at();
      if (state.step === before) {
        problems.push(`[widget] keyboard: ArrowRight did not move from step ${before + 1}`);
        break;
      }
      if (!state.live.trim()) problems.push(`[widget] keyboard: step ${state.step + 1} was not announced`);
    }
    if (state.step !== state.total - 1) problems.push(`[widget] keyboard: stopped at step ${state.step + 1} of ${state.total}`);
    await axeAt("last step");
    await page.keyboard.press("Home");
    if ((await at()).step !== 0) problems.push("[widget] keyboard: Home did not go to step 1");
    await page.keyboard.press("End");

    // Text view.
    const toggle = await page.$(".uc-widget__text-toggle");
    await toggle.focus();
    await page.keyboard.press("Enter");
    if ((await toggle.getAttribute("aria-expanded")) !== "true") problems.push("[widget] text view: aria-expanded did not change");
    await axeAt("text view open");

    // Language switch keeps the step.
    const switched = await page.evaluate(() => {
      if (!window.UC || !UC.setLanguage || !(UC.course?.languages || []).includes("en")) return null;
      const widget = document.querySelector(".uc-widget:not(.uc-widget--still)");
      widget.go(2);
      UC.setLanguage("en");
      return widget.step;
    });
    if (switched !== null) {
      await page.waitForTimeout(100);
      const after = await page.evaluate(() => ({ step: document.querySelector(".uc-widget:not(.uc-widget--still)").step, say: document.querySelector(".uc-widget:not(.uc-widget--still) .uc-widget__say").textContent }));
      if (after.step !== switched) problems.push(`[widget] language switch moved from step ${switched + 1} to ${after.step + 1}`);
      await page.evaluate(() => UC.setLanguage("pt"));
    }
  }
  await context.close();

  // controls="none" (8.3): a still figure of the last step, no player, not focusable, predict and editable ignored.
  {
    const { context: fresh, page: still } = await open(browser, origin, relative);
    const issues = await still.evaluate(() =>
      Array.from(document.querySelectorAll('.uc-widget[controls="none"]')).flatMap((widget) => {
        widget.build();
        const found = [];
        const shown = (selector) => {
          const node = widget.querySelector(selector);
          return node && getComputedStyle(node).display !== "none" && !node.hidden;
        };
        if (widget.step !== widget.total - 1) found.push(`shows step ${widget.step + 1} of ${widget.total}, not the last`);
        for (const part of [".uc-widget__player", ".uc-widget__say", ".uc-widget__side", ".uc-widget__predict", ".uc-widget__edit"]) if (shown(part)) found.push(`${part} is visible`);
        if (widget.querySelector(".uc-widget__stage").hasAttribute("tabindex")) found.push("the stage is focusable");
        if (!shown(".uc-widget__svg") || !widget.querySelector(".uc-widget__svg").getAttribute("aria-label")) found.push("the drawing or its description is missing");
        return found.map((text) => `[widget] still #${widget.id || widget.localName}: ${text}`);
      }),
    );
    problems.push(...issues);
    await fresh.close();
  }

  // Without JavaScript the teacher's fallback is there.
  {
    const { context: noJs, page: plain } = await open(browser, origin, relative, { javaScriptEnabled: false });
    const empty = await plain.evaluate(() =>
      Array.from(document.querySelectorAll("*")).filter((node) => /^[a-z]+-widget-/.test(node.localName) && !node.innerText.trim()).length,
    );
    if (empty) problems.push(`[widget] no-js: ${empty} widget(s) without fallback text`);
    await noJs.close();
  }
  return problems;
}
