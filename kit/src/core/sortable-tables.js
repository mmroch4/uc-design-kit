/**
 * Sortable tables: <table data-sortable> inside a .uc-table.
 *
 * The header cells of the <thead> become buttons; the sorted column carries
 * aria-sort. A cell sorts by its data-sort attribute, else by its
 * <time datetime>, else by its text: numbers (decimal comma or dot, optional
 * %) and ISO dates numerically, text with Intl.Collator in the active
 * language, numeric-aware ("PL2" before "PL10"). Empty cells go last.
 * Rows of the first <tbody> move; rows with data-sort-fixed (totals) stay
 * last. `data-sort-default="asc"|"desc"` on a <th> sorts on load and
 * `data-no-sort` leaves a column out. Without JavaScript the table keeps its
 * written order. See docs/api.md, section 4.
 */
(function (UC) {
  "use strict";
  if (UC.__duplicate) return;

  const { h, icon } = UC.internal;
  const NUMBER = /^[-−]?\d+([.,]\d+)?\s*%?$/;
  const ISO_DATE = /^\d{4}-\d{2}-\d{2}(T[\d:.]+)?/;
  const done = new WeakSet();

  /** The value a cell sorts by: a number, or a string ("" when empty). */
  function sortValue(cell) {
    if (!cell) return "";
    const time = cell.querySelector("time[datetime]");
    const raw = (cell.getAttribute("data-sort") ?? (time ? time.getAttribute("datetime") : cell.textContent)).replace(/\s+/g, " ").trim();
    if (NUMBER.test(raw)) return Number(raw.replace("−", "-").replace(",", ".").replace("%", ""));
    if (ISO_DATE.test(raw)) {
      const date = Date.parse(raw.length === 10 ? `${raw}T00:00` : raw);
      if (!Number.isNaN(date)) return date;
    }
    return raw;
  }

  /** Compares two sort values; empty values always go last. */
  function compareValues(a, b, collator, direction) {
    if (a === "" || b === "") return (a === "") - (b === "");
    const result = typeof a === "number" && typeof b === "number" ? a - b : typeof a === "number" ? -1 : typeof b === "number" ? 1 : collator.compare(a, b);
    return direction === "desc" ? -result : result;
  }

  function sort(table, header, direction, announce) {
    const body = table.tBodies[0];
    if (!body) return;
    const index = header.cellIndex;
    const collator = new Intl.Collator(UC.lang, { numeric: true, sensitivity: "base" });
    const rows = Array.from(body.rows);
    const fixed = rows.filter((row) => row.hasAttribute("data-sort-fixed"));
    const moving = rows
      .filter((row) => !row.hasAttribute("data-sort-fixed"))
      .map((row) => [row, sortValue(row.cells[index])])
      .sort((a, b) => compareValues(a[1], b[1], collator, direction));
    body.append(...moving.map(([row]) => row), ...fixed);
    table.querySelectorAll("thead th[aria-sort]").forEach((th) => th.removeAttribute("aria-sort"));
    header.setAttribute("aria-sort", direction === "desc" ? "descending" : "ascending");
    if (announce) {
      UC.internal.announce(UC.t("sort.announce", { column: header.textContent.trim(), direction: UC.t(`sort.${direction}`) }));
    }
  }

  function enhanceTable(table) {
    if (done.has(table) || !table.tHead) return;
    done.add(table);
    const row = table.tHead.rows[table.tHead.rows.length - 1];
    let initial = null;
    for (const header of Array.from((row && row.cells) || [])) {
      if (header.localName !== "th" || header.hasAttribute("data-no-sort") || header.colSpan > 1) continue;
      const button = h("button", { type: "button", class: "uc-sort-button" });
      button.append(...Array.from(header.childNodes), icon("sort"));
      header.append(button);
      button.addEventListener("click", () => {
        const next = header.getAttribute("aria-sort") === "ascending" ? "desc" : "asc";
        sort(table, header, next, true);
      });
      const preset = header.getAttribute("data-sort-default");
      if (!initial && (preset === "asc" || preset === "desc")) initial = [header, preset];
    }
    if (initial) sort(table, initial[0], initial[1], false);
  }

  function enhanceSortable(root) {
    if (!root || !root.querySelectorAll) return;
    if (root.matches && root.matches("table[data-sortable]")) enhanceTable(root);
    root.querySelectorAll("table[data-sortable]").forEach(enhanceTable);
  }

  UC.internal.registerEnhancer(enhanceSortable);
  UC.internal.sortValue = sortValue;
  UC.internal.compareSortValues = compareValues;

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => enhanceSortable(document));
  else enhanceSortable(document);
})(window.UC);
