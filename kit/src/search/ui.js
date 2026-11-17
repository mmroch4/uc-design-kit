/**
 * uc-search.js — loaded by core/search-loader.js the first time the search is
 * opened, together with the site's search-index.js. It registers the search
 * interface as UC.internal.searchUI = { open({ index, query, opener }) }.
 *
 * Phase S1 ships this placeholder so the loading path, the file and its size
 * budget exist; phase S4 replaces it with the engine, the dialog and
 * <uc-search> (docs/plan/search-api.md 8–10).
 */
(function (UC) {
  "use strict";
  if (!UC || UC.internal.searchUI) return;

  UC.internal.searchUI = {
    open({ index }) {
      console.warn(`[uc-kit] the search dialog is not available in this kit version yet (index with ${index.pages.length} pages loaded).`);
    },
  };
})(window.UC);
