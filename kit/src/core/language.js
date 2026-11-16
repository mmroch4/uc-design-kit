/**
 * Active language: resolution, persistence, switching and in-place
 * bilingual content (elements with a lang attribute in another configured
 * language are hidden).
 */
(function (UC) {
  "use strict";
  if (UC.__duplicate) return;

  const STORAGE_KEY = "uc:lang";
  const STYLE_ID = "uc-language-visibility";
  const root = document.documentElement;
  const authoredLang = (root.getAttribute("lang") || "").trim();

  function readStorage() {
    try {
      return window.localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      return null;
    }
  }

  function writeStorage(value) {
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch (error) {
      /* Storage unavailable (private mode): the choice lasts for this page only. */
    }
  }

  function queryLanguage() {
    try {
      return new URLSearchParams(window.location.search).get("lang");
    } catch (error) {
      return null;
    }
  }

  function resolve() {
    const languages = UC.course.languages;
    const candidates = [queryLanguage(), readStorage(), authoredLang, languages[0]];
    return candidates.find((code) => code && languages.includes(code)) || languages[0];
  }

  function updateVisibilityStyle(active) {
    const others = UC.course.languages.filter((code) => code !== active);
    let style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement("style");
      style.id = STYLE_ID;
      document.head.appendChild(style);
    }
    style.textContent = others
      .map((code) => `body [lang|="${code}"]:not([data-uc-keep-lang]) { display: none !important; }`)
      .join("\n");
  }

  function apply(code) {
    UC.lang = code;
    root.setAttribute("lang", code);
    root.dataset.ucLang = code;
    if (UC.course.languages.length > 1) updateVisibilityStyle(code);
  }

  /** The href of the current page in `code`, when pages have one file per language. */
  function pageHrefFor(code) {
    const current = UC.internal.currentPage && UC.internal.currentPage();
    if (!current || typeof current.href !== "object") return null;
    const target = current.href[code];
    const here = current.href[UC.lang];
    return target && target !== here ? target : null;
  }

  /** Switches the active language. Navigates when the page has a file per language. */
  UC.setLanguage = function setLanguage(code) {
    if (!UC.course.languages.includes(code) || code === UC.lang) return;
    writeStorage(code);
    const href = pageHrefFor(code);
    if (href) {
      window.location.href = href;
      return;
    }
    apply(code);
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.has("lang")) {
        url.searchParams.set("lang", code);
        window.history.replaceState(null, "", url);
      }
    } catch (error) {
      /* file:// URLs in some browsers: nothing to update. */
    }
    document.dispatchEvent(new CustomEvent("uc:languagechange", { detail: { lang: code } }));
  };

  apply(resolve());
})(window.UC);
