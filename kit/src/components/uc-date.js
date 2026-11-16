/**
 * <uc-date> — a date printed inline in the active language, from a deadline
 * (`deadline="ap1"`) or a literal ISO date (`value="2025-11-12"`).
 * The teacher-written text inside the element is the fallback: it stays
 * visible without JavaScript and whenever the date cannot be resolved.
 * See docs/api.md, section 3.2.
 */
(function (UC) {
  "use strict";
  if (UC.__duplicate) return;

  const { h, flag, parseDeadlineDate, toISO } = UC.internal;
  const FORMATS = ["short", "long", "weekday"];

  class UCDate extends UC.Element {
    static get observedAttributes() {
      return ["deadline", "value", "format", "with-time"];
    }

    setup() {
      this.classList.add("uc-date");
      this.fallback = Array.from(this.childNodes);
      this.warned = new Set();
    }

    attributeChangedCallback() {
      if (this.__ucSetupDone && this.isConnected) this.render();
    }

    warn(message) {
      if (this.warned.has(message)) return;
      this.warned.add(message);
      console.warn(`[uc-kit] <uc-date>: ${message}`);
    }

    /** { date, precision, time } for the element's attributes, or null. */
    resolve() {
      const id = this.getAttribute("deadline");
      if (id !== null) {
        const deadline = this.course.deadlines.find((item) => item.id === id);
        if (!deadline) {
          this.warn(`unknown deadline "${id}"`);
          return null;
        }
        return { ...deadline.parsed, time: deadline.time || null, source: deadline.date };
      }
      const value = this.getAttribute("value");
      if (value === null) {
        this.warn("needs a deadline or value attribute");
        return null;
      }
      const parsed = parseDeadlineDate(value);
      if (parsed.precision !== "day" && parsed.precision !== "month") {
        this.warn(`invalid value "${value}"`);
        return null;
      }
      return { ...parsed, time: null, source: value };
    }

    render() {
      const resolved = this.resolve();
      if (!resolved) {
        this.replaceChildren(...this.fallback);
        return;
      }
      const { precision, date, time, source } = resolved;
      if (precision === "none" || precision === "invalid") {
        // The deadline exists but has no date yet: "To be scheduled".
        this.replaceChildren(UC.formatDate(null));
        return;
      }

      const requested = (this.getAttribute("format") || "").trim();
      const format = FORMATS.includes(requested) ? requested : "short";
      const showTime = flag(this, "with-time") && precision === "day" && Boolean(time);
      const day = precision === "month" ? toISO(date).slice(0, 7) : toISO(date);
      const label = UC.formatDate(precision === "day" ? date : source, format);

      this.replaceChildren(
        h(
          "time",
          { datetime: showTime ? `${day}T${time}` : day },
          showTime ? UC.internal.withTime(label, time) : label,
        ),
      );
    }
  }

  UC.define("uc-date", UCDate);
})(window.UC);
