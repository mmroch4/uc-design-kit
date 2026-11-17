/**
 * Choices saved in the browser, scoped to the course.
 *
 * Every course on one server shares one origin (www.dcc.fc.up.pt), so keys
 * carry the course: uc:<course>:<feature>[:<detail>]. Storage may be missing
 * or blocked (private windows, site data off): every call is failure-safe and
 * the caller simply forgets the choice. See docs/plan/blocks-api.md 1.3.
 */
(function (UC) {
  "use strict";
  if (UC.__duplicate) return;

  /** The <course> part of the key: UC_COURSE.code, else the folder that holds course.js. */
  function courseKey() {
    const code = UC.course && typeof UC.course.code === "string" ? UC.course.code.trim() : "";
    if (code) return code;
    const script = Array.from(document.scripts).find((item) => /(^|\/)course\.js([?#]|$)/.test(item.getAttribute("src") || ""));
    try {
      return new URL(".", script ? script.src : window.location.href).pathname;
    } catch (error) {
      return window.location.pathname;
    }
  }

  const key = (feature, detail) => ["uc", courseKey(), feature, detail].filter((part) => part !== undefined && part !== null && part !== "").join(":");

  const storage = {
    key,
    get(feature, detail) {
      try {
        return window.localStorage.getItem(key(feature, detail));
      } catch (error) {
        return null;
      }
    },
    set(feature, detail, value) {
      try {
        window.localStorage.setItem(key(feature, detail), String(value));
        return true;
      } catch (error) {
        return false;
      }
    },
    remove(feature, detail) {
      try {
        window.localStorage.removeItem(key(feature, detail));
      } catch (error) {
        /* Storage blocked: nothing was saved. */
      }
    },
  };

  Object.assign(UC.internal, { courseKey, storage });
})(window.UC);
