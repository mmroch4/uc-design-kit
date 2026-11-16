/**
 * Interface translations.
 * Dictionaries are flat objects keyed by dotted names, e.g. "nav.menu".
 * Values may contain {placeholders} replaced by `UC.t(key, params)`.
 */
(function (UC) {
  "use strict";
  if (UC.__duplicate) return;

  const dictionaries = Object.create(null);
  const FALLBACK_LANGUAGE = "en";

  function flatten(source, prefix, target) {
    for (const [key, value] of Object.entries(source)) {
      const name = prefix ? `${prefix}.${key}` : key;
      if (value && typeof value === "object" && !Array.isArray(value)) flatten(value, name, target);
      else target[name] = value;
    }
    return target;
  }

  /** Adds or overrides interface strings for a language. Nested objects are flattened. */
  UC.addTranslations = function addTranslations(lang, dictionary) {
    dictionaries[lang] = Object.assign(dictionaries[lang] || Object.create(null), flatten(dictionary, "", {}));
    // Strings for the active language added after components rendered (a script
    // loaded after the kit) must show at once, not on the next language change.
    const active = UC.lang;
    if (active && UC.internal.rerenderAll && (lang === active || lang === active.split("-")[0])) {
      UC.internal.rerenderAll();
    }
  };

  function lookup(lang, key) {
    const base = lang.split("-")[0];
    for (const candidate of [lang, base, FALLBACK_LANGUAGE]) {
      const dictionary = dictionaries[candidate];
      if (dictionary && key in dictionary) return dictionary[key];
    }
    return undefined;
  }

  /**
   * Translates an interface string in the active language.
   * Arrays (e.g. month names) are returned as they are.
   */
  UC.t = function t(key, params) {
    const value = lookup(UC.lang || FALLBACK_LANGUAGE, key);
    if (value === undefined) {
      console.warn(`[uc-kit] missing translation: ${key}`);
      return key;
    }
    if (typeof value !== "string" || !params) return value;
    return value.replace(/\{(\w+)\}/g, (match, name) => (name in params ? String(params[name]) : match));
  };

  /** Translates in a specific language, regardless of the active one. */
  UC.internal.tIn = function tIn(lang, key, params) {
    const saved = UC.lang;
    UC.lang = lang;
    try {
      return UC.t(key, params);
    } finally {
      UC.lang = saved;
    }
  };

  /**
   * Translates a string whose placeholders are DOM nodes, returning an array
   * of strings and nodes ready to append (e.g. "Updated {date}" with a <time>).
   */
  UC.internal.tNodes = function tNodes(key, nodes) {
    const pattern = UC.t(key);
    const result = [];
    let last = 0;
    pattern.replace(/\{(\w+)\}/g, (match, name, offset) => {
      result.push(pattern.slice(last, offset), name in nodes ? nodes[name] : match);
      last = offset + match.length;
      return match;
    });
    result.push(pattern.slice(last));
    return result.filter((part) => part !== "");
  };

  UC.internal.hasLanguage = (lang) => Boolean(dictionaries[lang] || dictionaries[lang.split("-")[0]]);
})(window.UC);
