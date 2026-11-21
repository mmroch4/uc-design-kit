/**
 * <uc-weeks> — container for <uc-week> elements. Adds a "Go to this week"
 * link, inserts the semester breaks between weeks and appends the deadlines
 * that fall after the last week. With view="compact" the same weeks are
 * shown as one table, one row per week. See docs/api.md, section 3.3.
 */
(function (UC) {
  "use strict";
  if (UC.__duplicate) return;

  const { h, addDays, toISO, weekSpan, weekStateOf, writtenEventIds, deadlinesBetween, createEvent } = UC.internal;
  const STATUS = { past: "done", current: "current", future: "planned" };
  const WEEK_HASH = /^#week-(\d+)$/;

  /** The first <uc-week> child whose number is greater than `n`, or null. */
  function firstWeekAfter(weeks, n) {
    return weeks.find((week) => Number(week.getAttribute("n")) > n) || null;
  }

  /**
   * Calendar break weeks merged per configured break: a break that covers
   * several calendar weeks is shown once, spanning all of them.
   */
  function mergeBreaks(breakWeeks) {
    const merged = [];
    breakWeeks.forEach((item) => {
      const previous = merged[merged.length - 1];
      if (previous && +previous.start === +item.start && +previous.end === +item.end) previous.to = addDays(item.monday, 7);
      else merged.push({ ...item, from: item.monday, to: addDays(item.monday, 7) });
    });
    return merged;
  }

  class UCWeeks extends UC.Element {
    setup() {
      this.classList.add("uc-weeks");
      this.generated = [];
      this.addEventListener("click", (event) => {
        const link = event.target.closest && event.target.closest(".uc-weeks__go");
        if (!link || !this.contains(link)) return;
        const week = this.weekNamed(link.dataset.week);
        if (!week || typeof week.reveal !== "function") return;
        event.preventDefault();
        week.reveal(true);
        try {
          window.history.pushState(null, "", `#week-${link.dataset.week}`);
        } catch (error) {
          /* Some file:// contexts refuse history updates; the week is open anyway. */
        }
      });
    }

    connectedCallback() {
      super.connectedCallback();
      if (!this.onHashChange) {
        this.onHashChange = () => this.revealFromHash();
        window.addEventListener("hashchange", this.onHashChange);
      }
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      if (this.onHashChange) {
        window.removeEventListener("hashchange", this.onHashChange);
        this.onHashChange = null;
      }
    }

    /** Opens the week targeted by a #week-<n> link followed inside the page. */
    revealFromHash() {
      const match = WEEK_HASH.exec(window.location.hash);
      const week = match && this.weekNamed(match[1]);
      if (week && typeof week.reveal === "function") week.reveal(false);
    }

    weekNamed(n) {
      return this.weeks().find((week) => week.getAttribute("n") === String(n)) || null;
    }

    /** Teacher-written <uc-week> children, in document order. */
    weeks() {
      return Array.from(this.children).filter((child) => child.localName === "uc-week");
    }

    render() {
      this.generated.forEach((node) => node.remove());
      this.generated = [];

      const weeks = this.weeks();
      const calendar = UC.internal.calendar();
      const showDeadlines = !this.hasAttribute("no-deadlines");
      const written = writtenEventIds(this);
      const compact = this.getAttribute("view") === "compact";
      weeks.forEach((week) => (week.hidden = compact));

      if (compact) {
        this.renderTable(weeks, calendar.breaks, showDeadlines);
        if (showDeadlines) this.renderTrailingDeadlines(calendar, written);
        return;
      }
      this.renderGoToLink(weeks);
      if (!this.hasAttribute("no-breaks")) this.renderBreaks(weeks, calendar.breaks, showDeadlines ? written : null);
      if (showDeadlines) this.renderTrailingDeadlines(calendar, written);
    }

    /** Remembers a generated node so the next render can remove it. */
    track(node) {
      node.setAttribute("data-uc-generated", "");
      this.generated.push(node);
      return node;
    }

    renderGoToLink(weeks) {
      const current = UC.weekOf(UC.today());
      if (!current || !weeks.some((week) => week.getAttribute("n") === String(current.n))) return;
      const link = h(
        "a",
        { class: "uc-button uc-button--primary uc-weeks__go", href: `#week-${current.n}`, dataset: { week: String(current.n) } },
        this.t("weeks.goToThisWeek"),
      );
      this.prepend(this.track(h("p", { class: "uc-weeks__actions" }, link)));
    }

    /** "22 dez – 2 jan · Férias de Natal, sem aulas": the dates and label of a break. */
    breakText(item) {
      const label = item.label ? this.text(item.label) : "";
      return [
        h("time", { class: "uc-weeks__break-date", datetime: toISO(item.start) }, UC.formatDateRange(item.start, item.end)),
        " · ",
        label ? `${label}, ${this.t("weeks.noClasses")}` : this.t("weeks.noClasses"),
      ];
    }

    renderBreaks(weeks, breaks, written) {
      // Last node placed after each week, so consecutive breaks keep their order.
      const lastAfter = new Map();
      mergeBreaks(breaks).forEach((item) => {
        const panel = this.track(
          h("p", { class: "uc-weeks__break" }, this.breakText(item)),
        );
        const previous = lastAfter.get(item.afterWeek) || weeks.find((week) => Number(week.getAttribute("n")) === item.afterWeek);
        if (previous) previous.after(panel);
        else {
          const next = firstWeekAfter(weeks, item.afterWeek);
          if (next) next.before(panel);
          else this.append(panel);
        }

        // Deadlines dated during the break follow its panel.
        let anchor = panel;
        if (written) {
          deadlinesBetween(item.from, item.to, written).forEach((deadline) => {
            const event = this.track(createEvent(deadline.id));
            anchor.after(event);
            anchor = event;
          });
        }
        if (previous) lastAfter.set(item.afterWeek, anchor);
      });
    }

    /** Deadlines of the listed kinds dated in [from, to), written by hand or not. */
    deadlinesIn(from, to) {
      const kinds = (this.getAttribute("kind") || "").split(/\s+/).filter(Boolean);
      return deadlinesBetween(from, to).filter((deadline) => !kinds.length || kinds.includes(deadline.kind));
    }

    /** Small lines under a row's topic: "Teste · quinta-feira, 4 dez, 14:00". */
    deadlineLines(from, to) {
      const deadlines = this.deadlinesIn(from, to);
      if (!deadlines.length) return null;
      return h(
        "ul",
        { class: "uc-weeks__deadlines" },
        deadlines.map((deadline) =>
          h(
            "li",
            {},
            h("strong", {}, this.text(deadline.title)),
            " · ",
            h("time", { datetime: toISO(deadline.parsed.date) }, UC.internal.withTime(UC.formatDate(deadline.parsed.date, "weekday"), UC.internal.deadlineTimes(deadline))),
          ),
        ),
      );
    }

    /** view="compact": one table row per week, breaks as full-width rows. */
    /** view="compact": one table with a row per week and the breaks between them. */
    renderTable(weeks, breaks, showDeadlines) {
      const columns = ["week", "dates", "topic", "status"];
      // Break rows, grouped by the week they follow.
      const breakRows = new Map();
      mergeBreaks(this.hasAttribute("no-breaks") ? [] : breaks).forEach((item) => {
        const row = h(
          "tr",
          { class: "uc-weeks__break-row" },
          h("td", { colspan: columns.length }, this.breakText(item), showDeadlines ? this.deadlineLines(item.from, item.to) : null),
        );
        if (!breakRows.has(item.afterWeek)) breakRows.set(item.afterWeek, []);
        breakRows.get(item.afterWeek).push(row);
      });
      const rows = [];
      const placed = new Set();
      const placeBreaks = (upTo) =>
        breakRows.forEach((list, after) => {
          if (after <= upTo && !placed.has(after)) {
            placed.add(after);
            rows.push(...list);
          }
        });
      weeks.forEach((week) => {
        placeBreaks(Number(week.getAttribute("n")) - 1);
        rows.push(this.weekRow(week, showDeadlines));
      });
      placeBreaks(Infinity);

      this.prepend(
        this.track(
          h(
            "div",
            { class: "uc-table uc-weeks__compact" },
            h(
              "table",
              { class: "uc-weeks__table" },
              h("caption", { class: "uc-visually-hidden" }, this.t("weeks.compactCaption")),
              h("thead", {}, h("tr", {}, columns.map((column) => h("th", { scope: "col" }, this.t(`weeks.column.${column}`))))),
              h("tbody", {}, rows),
            ),
          ),
        ),
      );
    }

    /** A week's row of the compact table: number, dates, topic (and its deadlines), status. */
    weekRow(week, showDeadlines) {
      const n = week.getAttribute("n");
      const span = weekSpan(week);
      const state = weekStateOf(span);
      const title = typeof week.weekTitle === "string" ? week.weekTitle : week.getAttribute(`title-${UC.lang}`) || week.getAttribute("title") || "";
      const href = week.getAttribute("href");
      return h(
        "tr",
        {
          id: n !== null ? `week-${n}` : null,
          class: state ? `uc-weeks__row uc-weeks__row--${state}` : "uc-weeks__row",
          "aria-current": state === "current" ? "date" : null,
        },
        h("th", { scope: "row" }, n),
        h("td", { class: "uc-weeks__dates" }, span ? h("time", { datetime: toISO(span.start) }, UC.formatDateRange(span.start, span.end)) : ""),
        h(
          "td",
          { class: "uc-weeks__topic" },
          href ? h("a", { href }, title) : title,
          showDeadlines && span ? this.deadlineLines(span.from, span.to) : null,
        ),
        h("td", { class: "uc-weeks__status" }, state ? h("span", { class: state === "current" ? "uc-tag uc-tag--accent" : null }, this.t(`weeks.status.${STATUS[state]}`)) : ""),
      );
    }

    /** Deadlines after the last teaching week (day or month precision), appended at the end. */
    renderTrailingDeadlines(calendar, written) {
      const last = calendar.weeks[calendar.weeks.length - 1];
      if (!last) return;
      const end = addDays(last.monday, 7);
      UC.course.deadlines
        .filter((deadline) => {
          const { precision, date } = deadline.parsed;
          return (precision === "day" || precision === "month") && date >= end && !written.has(deadline.id);
        })
        .forEach((deadline) => this.append(this.track(createEvent(deadline.id))));
    }
  }

  UC.define("uc-weeks", UCWeeks);
})(window.UC);
