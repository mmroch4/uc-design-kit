/** Resolution of LocalizedText values (string or { [lang]: string }). */
(function (UC) {
  "use strict";
  if (UC.__duplicate) return;

  /**
   * Returns the value of a LocalizedText in `lang` (default: active language),
   * falling back to the course's first language and then to any available value.
   */
  UC.text = function text(value, lang) {
    if (value === null || value === undefined) return "";
    if (typeof value !== "object") return String(value);
    const active = lang || UC.lang;
    const preferred = [active, active && active.split("-")[0], ...((UC.course && UC.course.languages) || [])];
    for (const candidate of preferred) {
      if (candidate && typeof value[candidate] === "string") return value[candidate];
    }
    const first = Object.values(value).find((entry) => typeof entry === "string");
    return first || "";
  };

  /** True when the LocalizedText has a value written specifically for `lang`. */
  UC.internal.hasText = (value, lang) =>
    value !== null && typeof value === "object" && typeof value[lang] === "string";
})(window.UC);
