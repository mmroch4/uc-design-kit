/**
 * Keyboard access for wide tables.
 *
 * A `.uc-table` wrapper scrolls sideways when its table is wider than the column.
 * Keyboard users can only scroll it if it can take focus, so while it overflows it
 * gets tabindex="0", role="region" and a label (from the table caption when there is one).
 */
(function (UC) {
  "use strict";
  if (UC.__duplicate) return;

  const SELECTOR = ".uc-table";
  const MANAGED = "data-uc-scroll-focus";

  function update(wrapper) {
    const overflows = wrapper.scrollWidth > wrapper.clientWidth + 1;
    if (overflows && !wrapper.hasAttribute("tabindex")) {
      wrapper.setAttribute("tabindex", "0");
      wrapper.setAttribute(MANAGED, "");
      if (!wrapper.hasAttribute("role")) wrapper.setAttribute("role", "region");
      if (!wrapper.hasAttribute("aria-label") && !wrapper.hasAttribute("aria-labelledby")) {
        const caption = wrapper.querySelector("caption");
        wrapper.setAttribute("aria-label", caption ? caption.textContent.trim() : UC.t("a11y.scrollableTable"));
      }
    } else if (!overflows && wrapper.hasAttribute(MANAGED)) {
      // Only undo what this module added; teacher-written attributes stay.
      wrapper.removeAttribute("tabindex");
      wrapper.removeAttribute(MANAGED);
    }
  }

  const resizeObserver = "ResizeObserver" in window ? new ResizeObserver((entries) => entries.forEach((entry) => update(entry.target))) : null;
  const watched = new WeakSet();

  function watch(root) {
    const wrappers = root.matches && root.matches(SELECTOR) ? [root] : [...root.querySelectorAll(SELECTOR)];
    for (const wrapper of wrappers) {
      if (watched.has(wrapper)) continue;
      watched.add(wrapper);
      if (resizeObserver) resizeObserver.observe(wrapper);
      update(wrapper);
    }
  }

  function start() {
    watch(document);
    // Components render their tables after the page loads (uc-deadlines, uc-team).
    new MutationObserver((records) => {
      for (const record of records) record.addedNodes.forEach((node) => node.nodeType === 1 && watch(node));
    }).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})(window.UC);
