/**
 * Active language: resolution, persistence, switching and in-place
 * bilingual content (elements with a lang attribute in another configured
 * language are hidden).
 */
(function (UC) {
  "use strict";
  if (UC.__duplicate) return;

  /** The key every course shared before 1.1; still read once by a course with no choice of its own. */
  const LEGACY_KEY = "uc:lang";
  const STYLE_ID = "uc-language-visibility";
  const root = document.documentElement;
  const authoredLang = (root.getAttribute("lang") || "").trim();

  /* The choice is saved per course (core/storage.js); without storage it lasts for this page only. */
  const readStorage = () => UC.internal.storage.get("lang", null, { legacy: LEGACY_KEY, keepLegacy: true });
  const writeStorage = (value) => UC.internal.storage.set("lang", null, value);

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

  /**
   * The href of the current page in `code`, when pages have one file per language:
   * a <link rel="alternate" hreflang="…"> in the page's head (any page), else the
   * page's href in course.js (pages in the navigation).
   */
  function pageHrefFor(code) {
    const link = Array.from(document.querySelectorAll('link[rel~="alternate"][hreflang]')).find(
      (item) => item.getAttribute("hreflang") === code && item.getAttribute("href"),
    );
    if (link) return link.getAttribute("href");
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

  /**
   * True when `element` is written in a configured language other than the
   * active one, so the kit hides it (mirrors the CSS rule of updateVisibilityStyle).
   */
  UC.internal.otherLanguage = function otherLanguage(element) {
    const lang = element.getAttribute && element.getAttribute("lang");
    if (!lang || UC.course.languages.length < 2) return false;
    return UC.course.languages.some((code) => code !== UC.lang && (lang === code || lang.startsWith(`${code}-`)));
  };

  /**
   * True when `element` is hidden by in-place bilingual content (it or an
   * ancestor carries a lang attribute of another configured language).
   */
  function isHiddenByLanguage(element) {
    const languages = UC.course.languages;
    if (languages.length < 2) return false;
    for (let node = element; node && node !== document.documentElement; node = node.parentElement) {
      const lang = node.getAttribute("lang");
      if (!lang || node.hasAttribute("data-uc-keep-lang")) continue;
      const base = lang.split("-")[0];
      if (base !== UC.lang && languages.includes(base)) return true;
    }
    return false;
  }

  /** Visible text of an element in the active language (other-language parts removed). */
  function visibleText(element) {
    const clone = element.cloneNode(true);
    clone.querySelectorAll("[lang]").forEach((node) => {
      const base = node.getAttribute("lang").split("-")[0];
      if (base !== UC.lang && UC.course.languages.includes(base)) node.remove();
    });
    return clone.textContent.replace(/\s+/g, " ").trim();
  }

  Object.assign(UC.internal, { isHiddenByLanguage, visibleText });

  apply(resolve());
})(window.UC);
