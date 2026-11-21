/**
 * The checks of a whole page: keyboard walk (focus indicator, no trap,
 * nothing focusable in aria-hidden), label in name (2.5.3), reflow at 320 px
 * (1.4.10), text at 200 % (1.4.4) and reduced motion.
 */
import { open } from "./helpers.mjs";

const MAX_TABS = 400;

/** Walks the page with Tab and checks every stop. */
export async function checkKeyboard(page) {
  const problems = [];
  await page.evaluate(() => {
    document.activeElement?.blur();
    window.scrollTo(0, 0);
  });
  let first = null;
  let previous = null;
  for (let i = 0; i < MAX_TABS; i += 1) {
    await page.keyboard.press("Tab");
    let stop = await page.evaluate(describeFocus);
    if (!stop) break; // Focus left the document: the walk is complete.
    if (stop.key === previous) {
      // The code editor keeps Tab for indentation; Esc then Tab must leave it.
      await page.keyboard.press("Escape");
      await page.keyboard.press("Tab");
      stop = await page.evaluate(describeFocus);
      if (!stop) break;
      if (stop.key === previous) {
        problems.push(`keyboard trap at ${stop.label}`);
        break;
      }
    }
    if (stop.key === first) break;
    if (first === null) first = stop.key;
    previous = stop.key;
    if (!stop.indicator) problems.push(`no visible focus indicator on ${stop.label}`);
    if (stop.hidden) problems.push(`focusable element inside aria-hidden: ${stop.label}`);
    if (stop.empty) problems.push(`focused element has no size: ${stop.label}`);
  }
  return problems;
}

// Runs in the page: describes document.activeElement.
function describeFocus() {
  const element = document.activeElement;
  if (!element || element === document.body || element === document.documentElement) return null;
  const visible = (style) =>
    (style.outlineStyle !== "none" && parseFloat(style.outlineWidth) > 0) || (style.boxShadow && style.boxShadow !== "none");
  let indicator = visible(getComputedStyle(element));
  // Radio buttons and checkboxes show the ring on their <label>, the editor on its frame.
  for (let node = element.parentElement; !indicator && node && node !== document.body; node = node.parentElement) {
    if ((node.localName === "label" || node.matches(".uc-code__editor")) && visible(getComputedStyle(node))) indicator = true;
  }
  const box = element.getBoundingClientRect();
  const label = `${element.localName}${element.className && typeof element.className === "string" ? "." + element.className.trim().split(/\s+/).join(".") : ""} "${(element.getAttribute("aria-label") || element.textContent || "").replace(/\s+/g, " ").trim().slice(0, 40)}"`;
  // An iframe holds its own document: it is checked as a page of its own.
  return {
    key: `${label}@${Math.round(box.top + window.scrollY)}:${Math.round(box.left)}`,
    label,
    indicator: indicator || element.localName === "iframe",
    hidden: Boolean(element.closest("[aria-hidden='true']")),
    empty: box.width === 0 || box.height === 0,
  };
}

/** WCAG 2.5.3: the accessible name set with aria-label includes the visible text. */
export async function checkLabelInName(page) {
  return page.evaluate(() => {
    const problems = [];
    for (const element of document.querySelectorAll("a[aria-label], button[aria-label], summary[aria-label]")) {
      if (element.closest("[hidden], [aria-hidden='true']")) continue;
      const visible = element.innerText.replace(/\s+/g, " ").trim().toLowerCase();
      const name = element.getAttribute("aria-label").replace(/\s+/g, " ").trim().toLowerCase();
      // Whole words: "Switch to English" does not contain the visible "EN".
      const escaped = visible.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      if (visible && !new RegExp(`(^|[^\\p{L}\\p{N}])${escaped}($|[^\\p{L}\\p{N}])`, "u").test(name)) problems.push(`label in name: "${name}" does not contain the visible text "${visible}"`);
    }
    return problems;
  });
}

async function horizontalScroll(page) {
  return page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
}

export async function checkReflowAndZoom(browser, origin, relative) {
  const problems = [];
  {
    const { context, page } = await open(browser, origin, relative, { viewport: { width: 320, height: 640 } });
    const overflow = await horizontalScroll(page);
    if (overflow > 1) problems.push(`reflow: horizontal scroll of ${overflow}px at 320px wide`);
    await context.close();
  }
  {
    const { context, page } = await open(browser, origin, relative, { viewport: { width: 1280, height: 900 } });
    await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
    await page.waitForTimeout(150);
    const overflow = await horizontalScroll(page);
    if (overflow > 1) problems.push(`text at 200%: horizontal scroll of ${overflow}px`);
    await context.close();
  }
  return problems;
}

export async function checkMotion(browser, origin, relative) {
  const { context, page } = await open(browser, origin, relative, { reducedMotion: "reduce" });
  const moving = await page.evaluate(() => {
    const ms = (value) => Math.max(...value.split(",").map((part) => parseFloat(part) * (part.trim().endsWith("ms") ? 1 : 1000)));
    return Array.from(document.querySelectorAll("body *"))
      .filter((element) => {
        const style = getComputedStyle(element);
        return ms(style.transitionDuration) > 1 || (style.animationName !== "none" && ms(style.animationDuration) > 1);
      })
      .slice(0, 3)
      .map((element) => `${element.localName}.${element.className}`);
  });
  await context.close();
  return moving.length ? [`reduced motion: still animated: ${moving.join(", ")}`] : [];
}
