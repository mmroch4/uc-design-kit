/**
 * Keyboard access for wide tables and preformatted text.
 *
 * A `.uc-table` wrapper scrolls sideways when its table is wider than the column.
 * Keyboard users can only scroll it if it can take focus, so while it overflows it
 * gets tabindex="0", role="region" and a label (from the table caption when there is one);
 * when it stops overflowing, the attributes the module added are removed again.
 */
(function (UC) {
  "use strict";
  if (UC.__duplicate) return;

  // Wide tables, and preformatted text in free-form content (.uc-content pre).
  const SELECTOR = ".uc-table, .uc-content pre";
  const MANAGED = "data-uc-scroll-focus";

  /** Text of the closest heading before `element` (in document order), or "". */
  function nearestHeading(element) {
    const headings = Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6"));
    let found = "";
    for (const heading of headings) {
      if (heading.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING) found = heading;
      else break;
    }
    return found ? found.textContent.replace(/\s+/g, " ").trim() : "";
  }

  function update(wrapper) {
    const overflows = wrapper.scrollWidth > wrapper.clientWidth + 1;
    if (overflows && !wrapper.hasAttribute("tabindex")) {
      // MANAGED lists the attributes this module added, so they can be undone.
      const added = ["tabindex"];
      wrapper.setAttribute("tabindex", "0");
      if (!wrapper.hasAttribute("role")) {
        wrapper.setAttribute("role", "region");
        added.push("role");
      }
      if (!wrapper.hasAttribute("aria-label") && !wrapper.hasAttribute("aria-labelledby")) {
        const caption = wrapper.querySelector("caption");
        const fallback = UC.t(wrapper.localName === "pre" ? "a11y.scrollableText" : "a11y.scrollableTable");
        // Without a caption, the nearest heading tells this region apart from
        // the other scrollable tables of the page (each landmark needs its own name).
        const heading = nearestHeading(wrapper);
        wrapper.setAttribute("aria-label", caption ? caption.textContent.trim() : heading ? `${heading}: ${fallback}` : fallback);
        added.push("aria-label");
      }
      wrapper.setAttribute(MANAGED, added.join(" "));
    } else if (!overflows && wrapper.hasAttribute(MANAGED)) {
      // Only undo what this module added; teacher-written attributes stay.
      for (const name of wrapper.getAttribute(MANAGED).split(" ")) if (name) wrapper.removeAttribute(name);
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
