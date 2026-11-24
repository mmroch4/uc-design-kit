/**
 * Scroll spy for the tables of contents: marks the section in view
 * (docs/architecture/themes-layouts.md 6.2). Used by the "On this page" list
 * of <uc-guide> and by the .uc-toc of the layout "docs" (and later the anchor
 * bar of "onepage"). IntersectionObserver only, no scroll listeners.
 */
(function (UC) {
  "use strict";
  if (UC.__duplicate) return;

  /** A heading is "current" once its top passes this fraction of the viewport height. */
  const ACTIVE_LINE = 0.3;

  /**
   * Watches `headings` (in document order) and calls `onChange(heading or
   * null)` with the last one whose top is above the active line, now and
   * whenever one crosses it. Returns { update, disconnect }.
   */
  function scrollspy(headings, onChange) {
    const update = () => {
      const line = window.innerHeight * ACTIVE_LINE;
      let active = null;
      for (const heading of headings) {
        if (heading.getBoundingClientRect().top <= line) active = heading;
        else break;
      }
      onChange(active);
    };
    let observer = null;
    if (headings.length && "IntersectionObserver" in window) {
      observer = new IntersectionObserver(update, { rootMargin: `0px 0px -${Math.round((1 - ACTIVE_LINE) * 100)}% 0px`, threshold: [0, 1] });
      headings.forEach((heading) => observer.observe(heading));
    }
    update();
    return { update, disconnect: () => observer && observer.disconnect() };
  }

  /** Sets aria-current="location" on the link of `links` that points at `heading`, and removes it from the others. */
  function markCurrent(links, heading) {
    const href = heading ? `#${heading.id}` : null;
    links.forEach((link) => {
      if (link.getAttribute("href") === href) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  }

  /** Click on a table-of-contents link: scrolls to the section (smoothly unless reduced motion is preferred) and moves focus to it. */
  function goTo(event, heading) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const reduced = Boolean(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    heading.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    if (!heading.hasAttribute("tabindex")) heading.setAttribute("tabindex", "-1");
    heading.focus({ preventScroll: true });
    try {
      window.history.pushState(null, "", `#${heading.id}`);
    } catch (error) {
      /* Some browsers refuse history changes on file:// URLs. */
    }
  }

  UC.internal.scrollspy = scrollspy;
  UC.internal.scrollspy.markCurrent = markCurrent;
  UC.internal.scrollspy.goTo = goTo;
})(window.UC);
