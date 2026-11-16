/**
 * <uc-event> — a highlighted item inside or between weeks (assessments, exams).
 * Takes its data from a configured deadline (`deadline` attribute) or from
 * `kind` + `date`. Teacher-written children are appended after the generated
 * content. See docs/api.md, section 3.3.
 *
 * Shared helpers for deadline rendering are published on UC.internal so that
 * <uc-week>, <uc-weeks> and <uc-this-week> describe deadlines the same way.
 */
(function (UC) {
  "use strict";
  if (UC.__duplicate) return;

  const { h, parseDay, parseDeadlineDate, addDays } = UC.internal;

  /** Kinds shown with the amber (warning) tag; the others use a neutral tag. */
  const WARNING_KINDS = ["assessment", "exam"];
  const KINDS = ["assessment", "exam", "quiz", "submission", "other"];

  function findDeadline(id) {
    return (id && UC.course.deadlines.find((deadline) => deadline.id === id)) || null;
  }

  /**
   * Formats a deadline's date, end date and time, e.g. "12 nov, 16:00",
   * "2–9 dez" or "janeiro 2026".
   */
  function deadlineDateText(deadline) {
    const parsed = deadline.parsed || parseDeadlineDate(deadline.date);
    if (parsed.precision !== "day") return UC.formatDate(deadline.date);
    const end = deadline.endDate || parseDay(deadline.end);
    const text = end ? UC.formatDateRange(parsed.date, end) : UC.formatDate(parsed.date);
    return UC.internal.withTime(text, deadline.time);
  }

  /** A <time> element for a deadline's date (or plain text when it has none). */
  function deadlineTime(deadline, className) {
    const parsed = deadline.parsed || parseDeadlineDate(deadline.date);
    const text = deadlineDateText(deadline);
    if (parsed.precision !== "day" && parsed.precision !== "month") return h("span", { class: className }, text);
    return h("time", { class: className, datetime: String(deadline.date).trim() }, text);
  }

  function kindTag(kind) {
    const warning = WARNING_KINDS.includes(kind);
    return h("span", { class: `uc-tag ${warning ? "uc-tag--warning" : "uc-tag--muted"} uc-event__kind` }, UC.t(`kinds.${kind}`));
  }

  /**
   * Deadlines with a day-precision date in [from, to). Ids listed in `exclude`
   * are left out (e.g. events the teacher already wrote by hand).
   */
  function deadlinesBetween(from, to, exclude) {
    const skip = exclude || new Set();
    return UC.course.deadlines.filter((deadline) => {
      const date = deadline.parsed && deadline.parsed.precision === "day" ? deadline.parsed.date : null;
      return date && date >= from && date < to && !skip.has(deadline.id);
    });
  }

  /**
   * Ids of the deadlines the calendar must not generate inside `root`: those
   * already written by the teacher as <uc-event deadline="…">, and those whose
   * kind is not listed in the enclosing <uc-weeks kind="…">.
   */
  function writtenEventIds(root) {
    const ids = new Set();
    root.querySelectorAll("uc-event[deadline]:not([data-uc-generated])").forEach((event) => ids.add(event.getAttribute("deadline")));
    const container = root.closest("uc-weeks");
    const kinds = ((container && container.getAttribute("kind")) || "").split(/\s+/).filter(Boolean);
    if (kinds.length) {
      UC.course.deadlines.forEach((deadline) => {
        if (!kinds.includes(deadline.kind)) ids.add(deadline.id);
      });
    }
    return ids;
  }

  /** Creates a generated <uc-event> for a deadline id. */
  function createEvent(deadlineId) {
    const event = document.createElement("uc-event");
    event.setAttribute("deadline", deadlineId);
    event.setAttribute("data-uc-generated", "");
    return event;
  }

  /** "past" when the event's last day is before today, otherwise "future" (today counts as future). */
  function eventState(date, end) {
    const last = end || date;
    if (!last) return null;
    return addDays(last, 1) <= UC.today() ? "past" : "future";
  }

  class UCEvent extends UC.Element {
    static get observedAttributes() {
      return ["deadline", "kind", "date"];
    }

    attributeChangedCallback() {
      if (this.__ucSetupDone && this.isConnected) this.render();
    }

    setup() {
      this.classList.add("uc-event");
      this.extra = Array.from(this.childNodes);
    }

    /** The data to show: a configured deadline or one built from attributes. */
    data() {
      const id = this.getAttribute("deadline");
      if (id) {
        const deadline = findDeadline(id);
        if (!deadline) console.warn(`[uc-kit] <uc-event>: unknown deadline "${id}"`);
        return deadline;
      }
      const date = this.getAttribute("date");
      const kind = this.getAttribute("kind") || "other";
      const parsed = parseDeadlineDate(date);
      return { kind, date, parsed, links: [] };
    }

    render() {
      const data = this.data();
      const generated = [];
      let state = null;

      if (data) {
        const kind = KINDS.includes(data.kind) ? data.kind : "other";
        const date = data.parsed && (data.parsed.precision === "day" || data.parsed.precision === "month") ? data.parsed.date : null;
        state = date ? eventState(data.parsed.precision === "month" ? new Date(date.getFullYear(), date.getMonth() + 1, 0) : date, data.endDate) : null;

        generated.push(kindTag(kind));
        if (data.title) {
          const title = this.text(data.title);
          generated.push(
            data.url
              ? h("a", { class: "uc-event__title", href: data.url }, title)
              : h("strong", { class: "uc-event__title" }, title),
          );
        }
        if (data.date || data.title) generated.push(deadlineTime(data, "uc-event__date"));
        if (data.note) generated.push(h("span", { class: "uc-event__note", html: this.text(data.note) }));
        data.links.forEach((link) => {
          generated.push(h("a", { class: "uc-event__link", href: link.url }, this.text(link.label)));
        });
      }

      this.classList.toggle("uc-event--past", state === "past");
      this.classList.toggle("uc-event--future", state === "future");
      this.replaceChildren(...generated, ...this.extra);
    }
  }

  Object.assign(UC.internal, { findDeadline, deadlineDateText, deadlineTime, kindTag, deadlinesBetween, writtenEventIds, createEvent });

  UC.define("uc-event", UCEvent);
})(window.UC);
