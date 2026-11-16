/**
 * <uc-weeks> — container for <uc-week> elements. Adds a "Go to this week"
 * link, inserts the semester breaks between weeks and appends the deadlines
 * that fall after the last week. See docs/api.md, section 3.3.
 */
(function (UC) {
  "use strict";
  if (UC.__duplicate) return;

  const { h, addDays, toISO } = UC.internal;
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
      const written = UC.internal.writtenEventIds(this);

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

    renderBreaks(weeks, breaks, written) {
      // Last node placed after each week, so consecutive breaks keep their order.
      const lastAfter = new Map();
      mergeBreaks(breaks).forEach((item) => {
        const label = item.label ? this.text(item.label) : "";
        const range = UC.formatDateRange(item.start, item.end);
        const panel = this.track(
          h(
            "p",
            { class: "uc-weeks__break" },
            h("time", { class: "uc-weeks__break-date", datetime: toISO(item.start) }, range),
            " · ",
            label ? `${label}, ${this.t("weeks.noClasses")}` : this.t("weeks.noClasses"),
          ),
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
          UC.internal.deadlinesBetween(item.from, item.to, written).forEach((deadline) => {
            const event = this.track(UC.internal.createEvent(deadline.id));
            anchor.after(event);
            anchor = event;
          });
        }
        if (previous) lastAfter.set(item.afterWeek, anchor);
      });
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
        .forEach((deadline) => this.append(this.track(UC.internal.createEvent(deadline.id))));
    }
  }

  UC.define("uc-weeks", UCWeeks);
})(window.UC);
