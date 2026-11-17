/**
 * The search engine of uc-search.js (docs/plan/search-api.md 9): query
 * folding, prefix matching with one typo, ranking, grouping by page and the
 * course.js entries (deadlines, notices) searched at runtime.
 *
 * Exposed as UC.internal.searchEngine for the dialog, <uc-search> and the
 * tests (scripts/check-search.mjs runs tests/search/words.json against
 * `words`, the same cases template/uc-site.py passes).
 */
(function (UC) {
  "use strict";
  if (!UC) return;

  /** The stop words of uc-site.py and tests/search/words.json. */
  const STOP_WORDS = new Set(
    "ainda all and antes any are bem cada can com como das depois dos ela elas ele eles entre essa esse esta estas este estes foi for from has have into isso isto its ja mais mas nao nas nos not num numa onde para pela pelas pelo pelos por quando que sao sem ser seu seus so sobre sua suas tambem tem ter that the this uma umas uns was were will with you your".split(" "),
  );
  const MAX_RESULTS = 50;
  const SECTIONS_PER_PAGE = 5;
  const TYPO_MIN_LENGTH = 5;
  /** Points per term, by where it matched: [exact prefix, one typo]. */
  const POINTS = { heading: [30, 15], title: [20, 10], text: [5, 2] };

  /** Lowercase, without accents (NFD, U+0300–U+036F dropped): "Secção" → "seccao". */
  const fold = (text) =>
    String(text || "")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase();
  const tokens = (text) => fold(text).match(/[a-z0-9][a-z0-9_-]*/g) || [];
  const meaningful = (word) => (word.length >= 3 || /\d/.test(word)) && !STOP_WORDS.has(word);

  /** The index's words of a text (contract 4.5): distinct, in order, 3+ letters or with a digit, no stop words. */
  function words(text) {
    return [...new Set(tokens(text).filter(meaningful))];
  }

  /**
   * The terms of a query: { required, optional }. Every required term must
   * match; stop words and 1–2 letter words only add points. A query made only
   * of those ("ar", "com") requires them all, so typing still finds words.
   */
  function terms(query) {
    const all = [...new Set(tokens(query))];
    const required = all.filter(meaningful);
    return required.length ? { required, optional: all.filter((term) => !meaningful(term)) } : { required: all, optional: [] };
  }

  /** True when `word` starts with `term` but for one substituted letter or two swapped neighbours. */
  function typo(term, word) {
    const n = term.length;
    if (n < TYPO_MIN_LENGTH || word.length < n) return false;
    let i = 0;
    while (i < n && term[i] === word[i]) i += 1;
    if (i === n) return false;
    if (term.slice(i + 1) === word.slice(i + 1, n)) return true;
    return i + 1 < n && term[i] === word[i + 1] && term[i + 1] === word[i] && term.slice(i + 2) === word.slice(i + 2, n);
  }

  /** 0 (no match), 1 (one typo) or 2 (a word starts with the term). */
  function matchIn(term, list) {
    let best = 0;
    for (const word of list) {
      if (word.startsWith(term)) return 2;
      if (!best && typo(term, word)) best = 1;
    }
    return best;
  }

  /** Points of one term in a prepared section: its heading, then the page title, then the text. */
  function termScore(term, item) {
    let score = 0;
    for (const where of ["heading", "title", "text"]) {
      const match = matchIn(term, item[where]);
      if (match) score = Math.max(score, POINTS[where][2 - match]);
      if (match === 2) break;
    }
    return score;
  }

  /** The section's score for the query, or 0 when a required term is missing. */
  function score(item, query) {
    let total = 0;
    for (const term of query.required) {
      const points = termScore(term, item);
      if (!points) return 0;
      total += points;
    }
    for (const term of query.optional) total += termScore(term, item) / 5;
    // The intro of a page whose title matches comes before its sections.
    return total + (item.intro ? 1 : 0);
  }

  /* ---------- What is searched ---------- */

  const pageOf = (id) => UC.course.pages.find((page) => page.id === id);
  /** The label of a page of course.js (navigation), by id. */
  function pageLabel(id) {
    const page = id && pageOf(id);
    if (!page) return "";
    return page.label ? UC.text(page.label) : page.builtin ? UC.t(`pages.${id}`) : "";
  }
  /** The href of a page of course.js, relative to this page. */
  function pageHref(id) {
    const page = pageOf(id);
    if (!page || !page.href) return "";
    return typeof page.href === "object" ? UC.text(page.href) : page.href;
  }
  const plain = (html) => (html ? UC.internal.fragment(UC.text(html)).textContent.replace(/\s+/g, " ").trim() : "");

  /** Index sections, prepared once per index (the folded word lists are cached). */
  const prepared = new WeakMap();
  function indexItems(index) {
    if (!prepared.has(index)) {
      const items = [];
      index.pages.forEach((page) => {
        const title = tokens(page.t);
        const label = pageLabel(page.g);
        const group = label && fold(label) !== fold(page.t) ? `${label} · ${page.t}` : page.t;
        for (const section of page.s || []) {
          items.push({
            page,
            group,
            lang: page.l,
            path: page.p,
            intro: !section.i,
            heading: section.h ? tokens(section.h) : title,
            title,
            text: String(section.w || "").split(" "),
            name: section.h || page.t,
            excerpt: section.x || "",
            href: () => UC.internal.resolvePageHref(page.p) + (section.i ? `#${section.i}` : ""),
          });
        }
      });
      prepared.set(index, items);
    }
    return prepared.get(index);
  }

  /** Deadlines and notices of course.js: searched as they are now, never from the index. */
  function courseItems() {
    const items = [];
    const deadlines = UC.t("search.deadlines");
    const fallback = pageHref("assessment") || pageHref("home");
    for (const deadline of UC.course.deadlines || []) {
      const name = UC.text(deadline.title);
      if (!name) continue;
      const when = deadline.parsed && deadline.parsed.date ? UC.formatDate(deadline.date, "medium") : UC.t("deadlines.toBeScheduled");
      const time = UC.internal.deadlineTimes(deadline);
      const note = plain(deadline.note);
      items.push({
        group: deadlines,
        heading: tokens(name),
        title: [],
        text: tokens(note),
        name,
        excerpt: [time ? `${when} · ${time}` : when, note].filter(Boolean).join(" · "),
        href: () => deadline.url || fallback,
      });
    }
    const notices = UC.t("search.notices");
    const today = UC.today();
    for (const notice of UC.course.notices || []) {
      if (!notice.parsedDate || notice.parsedDate > today) continue; // not shown yet by <uc-notices>
      const name = plain(notice.text);
      const link = UC.internal.fragment(UC.text(notice.text)).querySelector("a[href]");
      items.push({
        group: notices,
        heading: tokens(name),
        title: [],
        text: tokens(plain(notice.details)),
        name,
        excerpt: UC.formatDate(notice.parsedDate, "medium"),
        // Notice links are written relative to course.js, like every course.js URL.
        href: () => (link ? UC.internal.resolvePageHref(link.getAttribute("href")) : pageHref("home")),
      });
    }
    return items;
  }

  /**
   * Searches the index (and, without `scope`, the course.js entries).
   * Returns { groups: [{ label, results: [{ title, text, href }] }], count, terms }.
   * Pages of another language are skipped; `scope` keeps paths that start with it.
   */
  function search(index, text, { scope = "", limit = MAX_RESULTS } = {}) {
    const query = terms(text);
    const empty = { groups: [], count: 0, terms: [] };
    if (!query.required.length) return empty;
    const lang = String(UC.lang || "").split("-")[0];
    const candidates = indexItems(index).filter((item) => (!item.lang || item.lang === lang) && (!scope || item.path.startsWith(scope)));
    const hits = [];
    for (const item of scope ? candidates : courseItems().concat(candidates)) {
      const points = score(item, query);
      if (points) hits.push({ item, points });
    }
    // Best first; equal scores keep the index order (Array.prototype.sort is stable).
    hits.sort((a, b) => b.points - a.points);
    const groups = new Map();
    let count = 0;
    for (const { item } of hits) {
      if (count >= limit) break;
      const key = item.page || item.group;
      if (!groups.has(key)) groups.set(key, { label: item.group, results: [] });
      const group = groups.get(key);
      if (group.results.length >= SECTIONS_PER_PAGE) continue;
      group.results.push({ title: item.name, text: item.excerpt, href: item.href() });
      count += 1;
    }
    return { groups: [...groups.values()], count, terms: query.required };
  }

  /**
   * Text with the words that match `terms` wrapped in <mark>, as nodes (never
   * HTML: the index is data).
   */
  function highlight(text, list) {
    const nodes = [];
    let last = 0;
    for (const match of String(text).matchAll(/[\p{L}\p{N}_-]+/gu)) {
      const word = fold(match[0]);
      if (!list.some((term) => word.startsWith(term) || typo(term, word))) continue;
      nodes.push(text.slice(last, match.index), UC.internal.h("mark", { class: "uc-search__mark" }, match[0]));
      last = match.index + match[0].length;
    }
    nodes.push(text.slice(last));
    return nodes.filter((node) => node !== "");
  }

  UC.internal.searchEngine = { fold, words, terms, typo, search, highlight, stopWords: STOP_WORDS };
})(window.UC);
