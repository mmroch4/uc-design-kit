/**
 * Automatic heading ids and the start-up jump to the #hash target.
 *
 * Every <h2>/<h3> written inside <uc-page> without an id gets one, before any
 * component renders, with the same rule as template/uc-site.py, so that the
 * search index (and any shared link) can point at a section. The cases both
 * sides must agree on are in tests/search/slugs.json; the rule is in
 * docs/plan/search-api.md, section 6.
 */
(function (UC) {
  "use strict";
  if (UC.__duplicate) return;

  const FLASH_MS = 2000;

  /** NFD, accents (U+0300–U+036F) dropped, lowercase, other runs → "-". */
  function slugify(text) {
    return (
      String(text)
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "section"
    );
  }

  /** `base`, or `base-2`, `base-3`… — the first one not in `taken` (a Set, updated). */
  function uniqueId(base, taken) {
    let candidate = base;
    for (let suffix = 2; taken ? taken.has(candidate) : document.getElementById(candidate); suffix += 1) candidate = `${base}-${suffix}`;
    if (taken) taken.add(candidate);
    return candidate;
  }

  /** True when `lang` is a site language other than `keep` (`en-GB` counts as `en`). */
  function otherSiteLanguage(lang, keep) {
    return UC.course.languages.some((code) => code !== keep && (lang === code || lang.startsWith(`${code}-`)));
  }

  /**
   * The language the ids are made from: the file's own language when course.js
   * gives this file to one language (pages[].href as { pt, en }), else the
   * site's first language.
   */
  function idLanguage() {
    const name = (href) => decodeURIComponent(String(href).split(/[?#]/)[0].split("/").pop() || "index.html");
    const here = name(window.location.pathname);
    for (const page of UC.course.pages) {
      if (!page.href || typeof page.href !== "object") continue;
      const code = Object.keys(page.href).find((key) => name(page.href[key]) === here);
      if (code) return code;
    }
    return UC.course.languages[0];
  }

  /** The heading text the id is made from: without the other site languages. */
  function idText(heading, keep) {
    const clone = heading.cloneNode(true);
    if (UC.course.languages.length > 1) {
      clone.querySelectorAll("[lang]").forEach((node) => {
        if (!node.hasAttribute("data-uc-keep-lang") && otherSiteLanguage(node.getAttribute("lang"), keep)) node.remove();
      });
    }
    return clone.textContent.replace(/\s+/g, " ").trim();
  }

  /**
   * Gives an id to every <h2>/<h3> in `root`'s <uc-page> elements that has none.
   * Taken first: every id in the document and week-<n> of every <uc-week n>,
   * so a later teacher-written id still wins.
   */
  function assignIds(root) {
    const scope = root || document;
    const taken = new Set(Array.from(scope.querySelectorAll("[id]"), (node) => node.id));
    scope.querySelectorAll("uc-week[n]").forEach((week) => taken.add(`week-${week.getAttribute("n").trim()}`));
    const keep = idLanguage();
    scope.querySelectorAll("uc-page h2:not([id]), uc-page h3:not([id])").forEach((heading) => {
      heading.id = uniqueId(slugify(idText(heading, keep)), taken);
    });
  }

  /** The element the URL's #hash points at, if any. */
  function hashTarget() {
    const hash = window.location.hash.slice(1);
    if (!hash) return null;
    try {
      return document.getElementById(decodeURIComponent(hash));
    } catch (error) {
      return document.getElementById(hash);
    }
  }

  /**
   * The page is hidden until the components render, so the browser's own jump
   * to #hash happens too early: scroll again once it is visible, and mark the
   * target for 2 s (.uc-target-flash, still with prefers-reduced-motion).
   */
  function revisitHash() {
    const target = hashTarget();
    if (!target || target.id === "uc-main") return;
    target.scrollIntoView({ block: "start" });
    target.classList.add("uc-target-flash");
    setTimeout(() => target.classList.remove("uc-target-flash"), FLASH_MS);
  }

  UC.internal.anchors = { slugify, uniqueId, assignIds, revisitHash };

  // Before the components are defined (element.js registers them on
  // DOMContentLoaded too, after this listener, or right away when loaded late).
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => assignIds());
  else assignIds();
})(window.UC);
