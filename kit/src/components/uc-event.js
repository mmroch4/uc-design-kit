/**
 * <uc-event> — a highlighted item inside or between weeks (assessments, exams).
 * Takes its data from a configured deadline (`deadline` attribute) or from
 * `kind` + `date`. Teacher-written children are appended after the generated
 * content. See docs/api.md, section 3.3.
 * The deadline helpers it uses live in core/deadlines.js.
 */
(function (UC) {
  "use strict";
  if (UC.__duplicate) return;

  const { h, parseDeadlineDate, addDays, findDeadline, deadlineTime } = UC.internal;

  /** Kinds shown with the amber (warning) tag; the others use a neutral tag. */
  const WARNING_KINDS = ["assessment", "exam"];
  const KINDS = ["assessment", "exam", "quiz", "submission", "other"];

  function kindTag(kind) {
    const warning = WARNING_KINDS.includes(kind);
    return h("span", { class: `uc-tag ${warning ? "uc-tag--warning" : "uc-tag--muted"} uc-event__kind` }, UC.t(`kinds.${kind}`));
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
        if (data.location) generated.push(h("span", { class: "uc-event__note", html: this.text(data.location) }));
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

  UC.define("uc-event", UCEvent);
})(window.UC);
