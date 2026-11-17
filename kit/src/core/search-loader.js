/**
 * Site search, the part that lives in uc-kit.js (docs/plan/search-api.md 7–8):
 * whether search-index.js exists, the header button, the shortcuts and
 * UC.search. The engine and the dialog are in uc-search.js, loaded only when
 * the search is opened. Without `search` in course.js nothing here runs and
 * no request is made.
 */
(function (UC) {
  "use strict";
  if (UC.__duplicate) return;

  const TIMEOUT_MS = 5000;
  const IDLE_FALLBACK_MS = 1500;
  const INDEX_VERSION = 1;
  const config = UC.course.search;
  const local = window.location.protocol === "file:";
  const { h, icon } = UC.internal;

  /** uc-search.js sits next to uc-kit.js (core/modules.js). */
  const { loadScript, kitUrl } = UC.internal;
  const engineUrl = () => kitUrl("uc-search.js");
  /** The index path is relative to course.js, like page hrefs. */
  const indexUrl = () => new URL(UC.internal.resolvePageHref(config.index), document.baseURI).href;

  /* ---------- "Does the index exist?" (7.2), once per visit ---------- */

  const sessionKey = () => UC.internal.storage.key("search");
  function remembered() {
    try {
      return window.sessionStorage.getItem(sessionKey());
    } catch (error) {
      return null;
    }
  }
  function remember(available) {
    try {
      window.sessionStorage.setItem(sessionKey(), available ? "1" : "0");
    } catch (error) {
      /* Storage blocked: ask again on the next page. */
    }
  }

  /** "off" (no search in course.js), "unknown", "yes" or "no". */
  let state = !config ? "off" : local ? "unknown" : { 1: "yes", 0: "no" }[remembered()] || "unknown";
  let checking = state === "yes" || state === "no" ? Promise.resolve(state === "yes") : null;

  function settle(available) {
    state = available ? "yes" : "no";
    document.querySelectorAll(".uc-search-button").forEach((button) => {
      if (available) button.classList.remove("uc-search-button--pending");
      else button.remove();
    });
    if (available) document.dispatchEvent(new CustomEvent("uc:searchready"));
    return available;
  }

  /** HEAD request; any 2xx means yes. Network errors and the 5 s timeout mean no. */
  function probe() {
    if (local) return loadIndex().then(() => true, () => false);
    const controller = typeof AbortController === "function" ? new AbortController() : null;
    const timer = setTimeout(() => controller && controller.abort(), TIMEOUT_MS);
    return fetch(indexUrl(), { method: "HEAD", cache: "no-store", signal: controller ? controller.signal : undefined })
      .then((response) => response.ok, () => false)
      .then((available) => {
        clearTimeout(timer);
        remember(available);
        return available;
      });
  }

  function check() {
    if (!config) return Promise.resolve(false);
    if (!checking) checking = probe().then(settle);
    return checking;
  }

  /* ---------- Loading the index and uc-search.js (7.3) ---------- */

  /** Console warnings for the maintainer when the index looks stale (7.4). */
  function warnIfStale(index) {
    const generated = String(index.generated || "").slice(0, 10);
    const updated = UC.course.updated;
    if (typeof updated === "string" && generated && updated > generated) {
      console.warn(`[uc-kit] search-index.js is older than course.js (updated ${updated}). Run python3 uc-site.py.`);
    }
    if ((index.course || "") !== (UC.course.code || "")) {
      console.warn(`[uc-kit] search-index.js was made for "${index.course}", not for this course.js. Run python3 uc-site.py.`);
    }
  }

  /** Loads and returns the parsed index, once (a failed download can be retried). An unknown format version turns the search off. */
  let indexPromise = null;
  function loadIndex() {
    if (!indexPromise) {
      indexPromise = loadScript(indexUrl()).then(
        () => {
          const index = window.UC_SEARCH_INDEX;
          if (!index || index.v !== INDEX_VERSION || !Array.isArray(index.pages)) {
            console.warn(`[uc-kit] ${config.index} is not a search index this kit can read (format ${index && index.v}).`);
            if (state === "yes") settle(false);
            throw new Error("unknown search index format");
          }
          warnIfStale(index);
          return index;
        },
        (error) => {
          indexPromise = null;
          throw error;
        },
      );
    }
    return indexPromise;
  }

  /* ---------- Header button and shortcuts (8.1) ---------- */

  const APPLE = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

  /** The header button: a hidden placeholder while the answer is pending, null when there is no index. */
  function searchButton() {
    if (state !== "yes" && state !== "unknown") return null;
    return h(
      "button",
      {
        type: "button",
        class: `uc-search-button${state === "unknown" ? " uc-search-button--pending" : ""}`,
        "aria-haspopup": "dialog",
        "aria-keyshortcuts": "Control+K Meta+K /",
        onClick: () => UC.search.open(),
      },
      icon("search"),
      h("span", { class: "uc-search-button__label" }, UC.t("search.button")),
      h("kbd", { class: "uc-search-button__hint", "aria-hidden": "true" }, APPLE ? "⌘ K" : "Ctrl K"),
    );
  }

  /** True when "/" should type a slash: focus in a field, an editor or <uc-code>. */
  function typing(target) {
    return Boolean(target && target.closest && target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"]), uc-code'));
  }

  function onKeydown(event) {
    if (state !== "yes" || event.defaultPrevented || event.altKey || document.querySelector('uc-page[search="off"]')) return;
    const modified = event.ctrlKey || event.metaKey;
    const shortcut = modified ? !event.shiftKey && (event.key === "k" || event.key === "K") : event.key === "/" && !typing(event.target);
    if (!shortcut) return;
    event.preventDefault();
    UC.search.open();
  }

  /* ---------- Public API (8.4) ---------- */

  /** Loads uc-search.js once; the header buttons say they are busy meanwhile. A failure is announced and can be retried. */
  function loadEngine() {
    const buttons = document.querySelectorAll(".uc-search-button");
    buttons.forEach((button) => button.setAttribute("aria-busy", "true"));
    return loadScript(engineUrl()).then(
      () => buttons.forEach((button) => button.removeAttribute("aria-busy")),
      (error) => {
        buttons.forEach((button) => button.removeAttribute("aria-busy"));
        console.warn(`[uc-kit] ${error.message}`);
        UC.internal.announce(UC.t("search.failed"));
        throw error;
      },
    );
  }

  UC.search = {
    /** Promise<boolean>: whether the site has a search index. */
    available: check,
    /**
     * Opens the search, optionally with a query. Does nothing when there is no
     * index. The index downloads while uc-search.js loads; the dialog shows
     * "Loading…" until it arrives (and a retry button if it fails).
     */
    open(query) {
      const opener = document.activeElement;
      return check().then((available) => {
        if (!available) return;
        loadIndex().catch(() => {});
        return loadEngine().then(
          () => UC.internal.searchUI.open({ load: loadIndex, query: query || "", opener }),
          () => {},
        );
      });
    },
  };

  Object.assign(UC.internal, { searchButton, searchIndex: () => (config ? loadIndex() : Promise.reject(new Error("search is off"))) });

  if (!config) return;
  document.addEventListener("keydown", onKeydown);
  // <uc-search> is defined in uc-search.js: load it once the index is known to exist.
  document.addEventListener("uc:searchready", () => {
    if (document.querySelector("uc-search")) loadEngine().catch(() => {});
  });
  document.addEventListener("uc:ready", () => {
    if (checking) {
      // Answer known from earlier in this visit: no request.
      if (state === "yes") document.dispatchEvent(new CustomEvent("uc:searchready"));
    } else if (local) check();
    else if (window.requestIdleCallback) window.requestIdleCallback(() => check());
    else setTimeout(check, IDLE_FALLBACK_MS);
  });
})(window.UC);
