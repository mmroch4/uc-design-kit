/** Announces that the kit is ready. Loaded last. */
(function (UC) {
  "use strict";
  if (UC.__duplicate) {
    console.warn("[uc-kit] uc-kit.js was loaded more than once; the extra copy was ignored.");
    return;
  }

  function ready() {
    document.documentElement.classList.add("uc-ready");
    document.dispatchEvent(new CustomEvent("uc:ready", { detail: { version: UC.version } }));
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ready);
  else ready();
})(window.UC);
