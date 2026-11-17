/** Announces that the kit is ready. Loaded last. */
(function (UC) {
  "use strict";
  if (UC.__duplicate) {
    console.warn("[uc-kit] uc-kit.js was loaded more than once; the extra copy was ignored.");
    return;
  }

  /** Longest wait for the web fonts before the page is shown anyway (first visit, slow network). */
  const FONT_WAIT_MS = 300;

  /**
   * Resolves once the page's body and code fonts are ready, or after FONT_WAIT_MS.
   * The families are read from the page, so a theme that changes --uc-font-sans
   * or --uc-font-mono waits for its own fonts (or for none, with system fonts).
   */
  function fontsReady() {
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    const root = getComputedStyle(document.documentElement);
    const families = [getComputedStyle(document.body).fontFamily, root.getPropertyValue("--uc-font-mono")]
      .map((family) => family.trim())
      .filter(Boolean);
    const loads = families.map((family) => document.fonts.load(`1em ${family}`).catch(() => null));
    const timeout = new Promise((resolve) => setTimeout(resolve, FONT_WAIT_MS));
    return Promise.race([Promise.all(loads), timeout]);
  }

  function ready() {
    document.documentElement.classList.add("uc-ready");
    document.dispatchEvent(new CustomEvent("uc:ready", { detail: { version: UC.version } }));
    // uc-page stays hidden until this class is set (see uc-page.css).
    fontsReady().then(() => {
      document.documentElement.classList.add("uc-visible");
      // The browser jumped to #hash while the page was hidden: jump again (core/anchors.js).
      requestAnimationFrame(UC.internal.anchors.revisitHash);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ready);
  else ready();
})(window.UC);
