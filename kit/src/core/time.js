/**
 * Weekdays, times and durations (timetables, office hours, assessments),
 * and the helpers that read and localise <time datetime> in teacher HTML.
 * See docs/architecture/blocks-api.md 1.2 and 7.
 */
(function (UC) {
  "use strict";
  if (UC.__duplicate) return;

  const { h } = UC.internal;
  const TIME = /^([01]?\d|2[0-3]):([0-5]\d)$/;

  /** "9:00" → "09:00"; null when the value is not a 24-hour time. */
  function parseTime(value) {
    const match = typeof value === "string" && TIME.exec(value.trim());
    return match ? `${match[1].padStart(2, "0")}:${match[2]}` : null;
  }

  /** Minutes since midnight of a Time, or NaN. */
  function minutesOf(value) {
    const time = parseTime(value);
    return time ? Number(time.slice(0, 2)) * 60 + Number(time.slice(3)) : NaN;
  }

  /** "14:00" or "14:00–15:00" (24-hour in every language). Invalid input is returned as written. */
  UC.formatTime = function formatTime(time, end) {
    const start = parseTime(time) || (time ? String(time) : "");
    if (!end) return start;
    return `${start}–${parseTime(end) || String(end)}`;
  };

  /** "2 h", "1 h 45 min", "45 min". */
  UC.formatDuration = function formatDuration(minutes) {
    const total = Math.round(Number(minutes));
    if (!Number.isFinite(total) || total <= 0) return "";
    const hours = Math.floor(total / 60);
    const rest = total % 60;
    if (!hours) return UC.t("duration.minutes", { m: rest });
    return rest ? UC.t("duration.both", { h: hours, m: rest }) : UC.t("duration.hours", { h: hours });
  };

  /** ISO weekday (1 = Monday … 7 = Sunday) → "terça-feira" (long) or "3.ª" / "Tue" (short, default). */
  UC.weekdayName = function weekdayName(day, format) {
    const n = Number(day);
    if (!Number.isInteger(n) || n < 1 || n > 7) return "";
    return UC.t(format === "long" ? "weekdays.long" : "weekdays.short")[n - 1];
  };

  /** Abbreviated weekday for the eye, full name for screen readers. */
  function dayNode(day) {
    return h(
      "span",
      { class: "uc-day" },
      h("span", { "aria-hidden": "true" }, UC.weekdayName(day)),
      h("span", { class: "uc-visually-hidden" }, UC.weekdayName(day, "long")),
    );
  }

  /** <time>14:00</time>–<time>15:00</time>, inside one span. */
  function timeRangeNode(start, end, className) {
    const time = (value) => {
      const parsed = parseTime(value);
      return parsed ? h("time", { datetime: parsed }, parsed) : String(value || "");
    };
    return h("span", { class: className || null }, time(start), end ? ["–", time(end)] : null);
  }

  /** Joins nodes as a list in the active language: "a", "a e b", "a, b e c". */
  function joinNodes(nodes) {
    const and = ` ${UC.t("common.and")} `;
    return nodes.flatMap((node, index) => {
      if (index === 0) return [node];
      return [index === nodes.length - 1 ? and : ", ", node];
    });
  }

  /** End of a session: `end`, else `time` + the deadline's `duration` (minutes), else null. */
  function endTime(time, end, duration) {
    if (end) return end;
    const start = minutesOf(time);
    const minutes = start + Number(duration);
    if (!(duration > 0) || !Number.isFinite(minutes)) return null;
    return `${String(Math.floor(minutes / 60) % 24).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
  }

  /** Short time text of a deadline: "14:30 e 16:30" (shifts), "14:30–16:30" (duration), "14:30" or "". */
  function deadlineTimes(deadline) {
    const shifts = Array.isArray(deadline.shifts) ? deadline.shifts.filter((shift) => shift && shift.time) : [];
    if (shifts.length) return joinNodes(shifts.map((shift) => UC.formatTime(shift.time))).join("");
    return deadline.time ? UC.formatTime(deadline.time, endTime(deadline.time, null, deadline.duration)) : "";
  }

  /** Lowercase, accents removed: for search and for matching names written by hand. */
  function normalise(text) {
    return String(text || "")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .trim();
  }

  /**
   * The first <time datetime="YYYY-MM-DD"> of a list item that is not inside
   * a nested list, as { element, date }, or null.
   */
  function firstTime(item) {
    for (const element of item.querySelectorAll("time[datetime]")) {
      const nested = element.parentElement.closest("ul, ol");
      if (nested && nested !== item.parentElement && item.contains(nested)) continue;
      const date = UC.internal.parseDay(element.getAttribute("datetime"));
      if (date) return { element, date };
    }
    return null;
  }

  /**
   * Writes the date of a <time datetime> in the active language. The text the
   * teacher wrote is kept in data-uc-text (and is what shows without JavaScript).
   */
  function localiseTime(element, format) {
    if (!element.hasAttribute("data-uc-text")) element.setAttribute("data-uc-text", element.textContent);
    const date = UC.internal.parseDay(element.getAttribute("datetime"));
    if (date) element.textContent = UC.formatDate(date, format);
  }

  Object.assign(UC.internal, { endTime, deadlineTimes, parseTime, minutesOf, dayNode, timeRangeNode, joinNodes, normalise, firstTime, localiseTime });
})(window.UC);
