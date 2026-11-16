/**
 * <uc-week> — one teaching week rendered as a disclosure (<details>).
 * Dates come from the teaching calendar (or the `start`/`end` overrides); the
 * current week is open and highlighted, future weeks are dimmed, and
 * deadlines dated inside the week (Monday to Sunday) appear as events.
 * See docs/api.md, section 3.3.
 */
(function (UC) {
  "use strict";
  if (UC.__duplicate) return;

  const { h, icon, parseDay, mondayOf, addDays, toISO } = UC.internal;

  /**
   * The week's displayed dates and its Monday-to-Sunday span, or null when
   * there is no calendar and no override.
   */
  function weekSpan(element) {
    const computed = UC.weekDates(element.getAttribute("n"));
    const start = parseDay(element.getAttribute("start")) || (computed && computed.start);
    const end = parseDay(element.getAttribute("end")) || (computed && computed.end) || start;
    if (!start) return null;
    const from = mondayOf(start);
    const to = addDays(mondayOf(end < start ? start : end), 7);
    return { start, end: end < start ? start : end, from, to };
  }

  function stateOf(span) {
    if (!span) return null;
    const today = UC.today();
    if (today < span.from) return "future";
    if (today >= span.to) return "past";
    return "current";
  }

  const STATES = ["past", "current", "future"];

  class UCWeek extends UC.Element {
    static get observedAttributes() {
      return ["n", "title", "start", "end"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
      // The `title` attribute is moved into the summary (see storeTitle); its removal is not a change.
      if (name === "title" && newValue === null) return;
      if (this.__ucSetupDone && this.isConnected) this.render();
    }

    setup() {
      this.classList.add("uc-week");
      this.summary = h("summary", { class: "uc-week__summary" });
      this.body = h("div", { class: "uc-week__body" });
      this.body.append(...Array.from(this.childNodes));
      this.details = h("details", { class: "uc-week__details" }, this.summary, this.body);
      this.generatedEvents = [];
      this.initialised = false;
      this.replaceChildren(this.details);
    }

    /**
     * Keeps the title in a property and removes the attribute, so the browser
     * does not show it as a tooltip over the whole week.
     */
    storeTitle() {
      if (this.hasAttribute("title")) {
        this.baseTitle = this.getAttribute("title");
        this.removeAttribute("title");
      }
    }

    /** The title in the active language: `title-<lang>` when present, else `title`. */
    get weekTitle() {
      this.storeTitle();
      return this.getAttribute(`title-${UC.lang}`) || this.baseTitle || "";
    }

    /** Opens the week (used by "Go to this week" and deep links). */
    reveal(focus) {
      this.details.open = true;
      if (focus) {
        this.scrollIntoView({ block: "start" });
        this.summary.focus({ preventScroll: true });
      }
    }

    get showsDeadlines() {
      const container = this.closest("uc-weeks");
      return !(container && container.hasAttribute("no-deadlines"));
    }

    render() {
      const n = this.getAttribute("n");
      if (n === null) console.warn("[uc-kit] <uc-week> needs an n attribute");
      if (n !== null) this.id = `week-${n}`;

      const span = weekSpan(this);
      const state = stateOf(span);
      STATES.forEach((name) => this.classList.toggle(`uc-week--${name}`, state === name));

      if (!this.initialised) {
        this.initialised = true;
        const linked = n !== null && window.location.hash === `#week-${n}`;
        this.details.open = this.hasAttribute("open") || state === "current" || linked;
      }

      this.renderSummary(n, span, state);
      this.renderEvents(span);
    }

    renderSummary(n, span, state) {
      const meta = h(
        "span",
        { class: "uc-week__meta" },
        state === "current" ? h("span", { class: "uc-tag uc-tag--accent uc-week__now" }, this.t("weeks.thisWeek")) : null,
        span
          ? h("time", { class: "uc-week__date", datetime: toISO(span.start) }, UC.formatDateRange(span.start, span.end))
          : null,
      );
      if (state === "current") this.summary.setAttribute("aria-current", "date");
      else this.summary.removeAttribute("aria-current");

      this.summary.replaceChildren(
        h("span", { class: "uc-week__number" }, n !== null ? this.t("weeks.week", { n }) : ""),
        h("span", { class: "uc-week__title" }, this.weekTitle),
        meta,
        h("span", { class: "uc-week__chevron" }, icon("chevronDown")),
      );
    }

    renderEvents(span) {
      this.generatedEvents.forEach((event) => event.remove());
      this.generatedEvents = [];
      if (!span || !this.showsDeadlines) return;
      const written = UC.internal.writtenEventIds(this.body);
      UC.internal.deadlinesBetween(span.from, span.to, written).forEach((deadline) => {
        const event = UC.internal.createEvent(deadline.id);
        this.generatedEvents.push(event);
        this.body.append(event);
      });
    }
  }

  UC.define("uc-week", UCWeek);
})(window.UC);
