/**
 * Interface strings of uc-search.js (docs/plan/search-api.md 8.5). Added
 * with UC.internal.addDefaults, so strings a site already set with
 * UC.addTranslations win. uc-kit.js itself only has search.button and
 * search.failed (shown when this file cannot load).
 */
(function (UC) {
  "use strict";
  if (!UC) return;

  UC.internal.addDefaults("pt", {
    search: {
      label: "Pesquisar no site",
      placeholder: "Pesquisar páginas, aulas, exercícios…",
      loading: "A carregar…",
      retry: "Tentar de novo",
      empty: "Sem resultados para «{query}».",
      countOne: "1 resultado",
      count: "{n} resultados",
      close: "Fechar",
      indexDate: "Índice de {date}",
      deadlines: "Prazos",
      notices: "Avisos",
      keys: "↑↓ para escolher · Enter para abrir · Esc para fechar",
    },
  });
  UC.internal.addDefaults("en", {
    search: {
      label: "Search the site",
      placeholder: "Search pages, classes, exercises…",
      loading: "Loading…",
      retry: "Try again",
      empty: "No results for “{query}”.",
      countOne: "1 result",
      count: "{n} results",
      close: "Close",
      indexDate: "Index of {date}",
      deadlines: "Deadlines",
      notices: "Notices",
      keys: "↑↓ to choose · Enter to open · Esc to close",
    },
  });
})(window.UC);
