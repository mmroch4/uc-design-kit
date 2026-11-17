/**
 * One polite live region per page, shared by every component that needs to
 * tell screen-reader users about a change they did not cause by moving focus
 * (copied, filtered, a run finished). See docs/architecture/blocks-api.md 7.2.
 */
(function (UC) {
  "use strict";
  if (UC.__duplicate) return;

  const { h } = UC.internal;
  /** Default wait before the text is written: long enough for the cleared region to register. */
  const DEFAULT_DELAY_MS = 50;
  let region = null;
  let timer = null;

  function liveRegion() {
    if (!region || !region.isConnected) {
      region = h("div", { class: "uc-visually-hidden", role: "status", "aria-live": "polite", "data-uc-announcer": "" });
      document.body.append(region);
    }
    return region;
  }

  /**
   * Announces `message`. The region is cleared at once and the text written
   * after `delay` ms, so a repeated message is read again; a call made before
   * the text is written replaces it (the last message wins). Components that
   * announce while the reader types (search, calculator) pass a longer delay.
   */
  UC.internal.announce = function announce(message, delay = DEFAULT_DELAY_MS) {
    if (!document.body) return;
    const target = liveRegion();
    clearTimeout(timer);
    target.textContent = "";
    timer = setTimeout(() => {
      target.textContent = message;
    }, delay);
  };
})(window.UC);
