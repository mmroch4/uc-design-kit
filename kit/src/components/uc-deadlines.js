/**
 * <uc-deadlines> — the course dates (UC_COURSE.deadlines) as a list or a table.
 * Teacher-written children (e.g. a "See the assessment rules" link) are kept
 * below the list.
 * See docs/api.md, section 3.2.
 */
(function (UC) {
  "use strict";
  if (UC.__duplicate) return;

  const { h, uid, number, toISO } = UC.internal;
  const VIEWS = ["list", "table"];
  const FILTERS = ["upcoming", "past", "all"];
  const TABLE_COLUMNS = ["item", "date", "time", "details", "status"];
  const STATUS_TAG = {
    done: "uc-tag uc-tag--success",
    next: "uc-tag uc-tag--warning",
    scheduled: "uc-tag",
    toBeScheduled: "uc-tag",
  };

  /**
   * The last day a deadline is still relevant, or null when it has no date.
   * Month-precision dates last until the end of the month; multi-day items
   * until their `end`.
   */
  function lastDay(deadline) {
    const { precision, date } = deadline.parsed;
    if (!date) return null;
    if (precision === "month") return new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return deadline.endDate && deadline.endDate > date ? deadline.endDate : date;
  }

  /** True while a deadline has not passed. Undated deadlines are always upcoming. */
  function isUpcoming(deadline, today) {
    const last = lastDay(deadline);
    return !last || last >= today;
  }

  /** "2025-12-02", "2025-12-02T21:00" or "2026-01"; null when there is no date. */
  function datetimeOf(deadline, withTime) {
    const { precision, date } = deadline.parsed;
    if (!date) return null;
    if (precision === "month") return toISO(date).slice(0, 7);
    const day = toISO(date);
    return withTime && deadline.time ? `${day}T${deadline.time}` : day;
  }

  /** Date label: single day, range for multi-day items, month, or "To be scheduled". */
  function formatWhen(deadline, format) {
    const { precision, date } = deadline.parsed;
    if (precision === "day" && deadline.endDate && deadline.endDate > date) {
      return UC.formatDateRange(date, deadline.endDate, format);
    }
    return UC.formatDate(date && precision === "day" ? date : deadline.date, format);
  }

  /** Status of each deadline for the table view, keyed by deadline object. */
  function statuses(deadlines, today) {
    const result = new Map();
    let nextAssigned = false;
    for (const deadline of deadlines) {
      const { precision } = deadline.parsed;
      let status;
      if (!isUpcoming(deadline, today)) status = "done";
      else if (precision !== "day") status = "toBeScheduled";
      else if (!nextAssigned) {
        status = "next";
        nextAssigned = true;
      } else status = "scheduled";
      result.set(deadline, status);
    }
    return result;
  }

  class UCDeadlines extends UC.Element {
    static get observedAttributes() {
      return ["view", "filter", "kind", "per-kind", "limit", "heading"];
    }

    setup() {
      this.classList.add("uc-deadlines");
      this.extra = Array.from(this.childNodes);
      this.headingId = uid("uc-deadlines-heading");
    }

    attributeChangedCallback() {
      if (this.__ucSetupDone && this.isConnected) this.render();
    }

    get view() {
      const value = (this.getAttribute("view") || "").trim();
      return VIEWS.includes(value) ? value : "list";
    }

    get filter() {
      const value = (this.getAttribute("filter") || "").trim();
      if (FILTERS.includes(value)) return value;
      return this.view === "table" ? "all" : "upcoming";
    }

    /** The deadlines to show, in configuration order (chronological, undated last). */
    selectDeadlines(today) {
      const kinds = (this.getAttribute("kind") || "").split(/\s+/).filter(Boolean);
      const filter = this.filter;
      let deadlines = this.course.deadlines.filter((deadline) => {
        if (kinds.length && !kinds.includes(deadline.kind)) return false;
        if (filter === "all") return true;
        return isUpcoming(deadline, today) === (filter === "upcoming");
      });
      const perKind = number(this, "per-kind", null);
      if (perKind !== null) {
        const counts = new Map();
        deadlines = deadlines.filter((deadline) => {
          const count = counts.get(deadline.kind) || 0;
          counts.set(deadline.kind, count + 1);
          return count < Math.max(0, Math.floor(perKind));
        });
      }
      const limit = number(this, "limit", null);
      if (limit !== null) deadlines = deadlines.slice(0, Math.max(0, Math.floor(limit)));
      return deadlines;
    }

    render() {
      const today = UC.today();
      const deadlines = this.selectDeadlines(today);
      const view = this.view;
      this.classList.toggle("uc-deadlines--table", view === "table");

      const heading = this.renderHeading();
      let body;
      if (!deadlines.length) body = h("p", { class: "uc-deadlines__empty" }, this.t("deadlines.empty"));
      else if (view === "table") body = this.renderTable(deadlines, statuses(deadlines, today));
      else body = this.renderList(deadlines, today);

      this.replaceChildren(
        h(
          "section",
          { class: "uc-deadlines__section", "aria-labelledby": heading ? this.headingId : null },
          heading,
          body,
          this.extra.length ? h("div", { class: "uc-deadlines__more" }, this.extra) : null,
        ),
      );
    }

    renderHeading() {
      const value = this.getAttribute("heading");
      if (value !== null && value.trim().toLowerCase() === "none") return null;
      const label = value !== null && value.trim() ? value : this.t("deadlines.heading");
      return h("h2", { class: "uc-deadlines__heading", id: this.headingId }, label);
    }

    renderTitle(deadline) {
      const title = this.text(deadline.title);
      return deadline.url ? h("a", { href: deadline.url }, title) : title;
    }

    renderLinks(deadline) {
      if (!deadline.links.length) return null;
      const items = [];
      deadline.links.forEach((link, index) => {
        if (index > 0) items.push(" · ");
        items.push(h("a", { href: link.url }, this.text(link.label)));
      });
      return h("span", { class: "uc-deadlines__links" }, items);
    }

    renderNote(deadline) {
      return deadline.note ? h("span", { class: "uc-deadlines__note", html: this.text(deadline.note) }) : null;
    }

    renderList(deadlines, today) {
      return h(
        "ul",
        { class: "uc-deadlines__list" },
        deadlines.map((deadline) => {
          const datetime = datetimeOf(deadline, true);
          const modifiers = [
            !datetime ? "uc-deadlines__item--unscheduled" : null,
            !isUpcoming(deadline, today) ? "uc-deadlines__item--past" : null,
          ].filter(Boolean);
          // The list's narrow date column shows the day only; the time goes
          // first on the note line ("21:00 · No Mooshak").
          const time = datetime && deadline.time ? deadline.time : null;
          const note = this.renderNote(deadline);
          let meta = note;
          if (time) {
            meta = note || h("span", { class: "uc-deadlines__note" });
            meta.prepend(h("span", { class: "uc-deadlines__time" }, time), note ? " · " : "");
          }
          return h(
            "li",
            { class: ["uc-deadlines__item", ...modifiers].join(" "), dataset: { kind: deadline.kind } },
            datetime
              ? h("time", { class: "uc-deadlines__date", datetime }, formatWhen(deadline))
              : h("span", { class: "uc-deadlines__date" }, formatWhen(deadline)),
            h(
              "div",
              { class: "uc-deadlines__body" },
              h("span", { class: "uc-deadlines__title" }, this.renderTitle(deadline)),
              meta,
              this.renderLinks(deadline),
            ),
          );
        }),
      );
    }

    renderTable(deadlines, statusMap) {
      const header = h(
        "tr",
        {},
        TABLE_COLUMNS.map((column) => h("th", { scope: "col" }, this.t(`deadlines.column.${column}`))),
      );
      const rows = deadlines.map((deadline) => {
        const datetime = datetimeOf(deadline, false);
        const status = statusMap.get(deadline);
        const note = this.renderNote(deadline);
        const links = this.renderLinks(deadline);
        const empty = () => h("span", { class: "uc-deadlines__none", "aria-hidden": "true" }, "—");
        return h(
          "tr",
          { class: `uc-deadlines__row uc-deadlines__row--${status}`, dataset: { kind: deadline.kind } },
          h("th", { scope: "row", class: "uc-deadlines__title" }, this.renderTitle(deadline)),
          h(
            "td",
            { class: "uc-deadlines__date" },
            datetime ? h("time", { datetime }, formatWhen(deadline, "medium")) : formatWhen(deadline, "medium"),
          ),
          h(
            "td",
            { class: "uc-deadlines__time" },
            deadline.time && datetime && deadline.parsed.precision === "day" ? deadline.time : empty(),
          ),
          h("td", { class: "uc-deadlines__details" }, note || links ? [note, links] : empty()),
          h("td", { class: "uc-deadlines__status" }, h("span", { class: STATUS_TAG[status] }, this.t(`deadlines.status.${status}`))),
        );
      });
      return h("div", { class: "uc-table" }, h("table", {}, h("thead", {}, header), h("tbody", {}, rows)));
    }
  }

  UC.define("uc-deadlines", UCDeadlines);
})(window.UC);
