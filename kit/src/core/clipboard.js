/** Clipboard helper shared by <uc-code> and copyable preformatted blocks. */
(function (UC) {
  "use strict";
  if (UC.__duplicate) return;

  const { h } = UC.internal;

  /** Copies text to the clipboard. Resolves on success, rejects otherwise. */
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).catch(() => legacyCopy(text));
    }
    return legacyCopy(text);
  }

  // Pages opened from file:// or plain http have no async clipboard API.
  function legacyCopy(text) {
    return new Promise((resolve, reject) => {
      const area = h("textarea", { class: "uc-visually-hidden", readonly: true, "aria-hidden": "true", tabindex: "-1" });
      area.value = text;
      document.body.appendChild(area);
      area.select();
      let ok = false;
      try {
        ok = document.execCommand("copy");
      } catch (error) {
        ok = false;
      }
      area.remove();
      if (ok) resolve();
      else reject(new Error("copy failed"));
    });
  }

  Object.assign(UC.internal, { copyText });
})(window.UC);
