/**
 * Dates and the teaching calendar.
 * All dates are handled as local calendar days (no time zone conversions):
 * "2025-11-12" becomes new Date(2025, 10, 12) at local midnight.
 */
(function (UC) {
  "use strict";
  if (UC.__duplicate) return;

  const DAY_MS = 24 * 60 * 60 * 1000;
  const ISO_DAY = /^(\d{4})-(\d{2})-(\d{2})$/;
  const ISO_MONTH = /^(\d{4})-(\d{2})$/;

  /** Parses "YYYY-MM-DD" into a local Date, or returns null. */
  function parseDay(value) {
    if (value instanceof Date) return startOfDay(value);
    const match = typeof value === "string" && ISO_DAY.exec(value.trim());
    if (!match) return null;
    const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    return date.getMonth() === Number(match[2]) - 1 ? date : null;
  }

  /** Parses a deadline date: day precision, month precision or null. */
  function parseDeadlineDate(value) {
    if (value === null || value === undefined || value === "") return { precision: "none", date: null };
    const day = parseDay(value);
    if (day) return { precision: "day", date: day };
    const month = typeof value === "string" && ISO_MONTH.exec(value.trim());
    if (month) return { precision: "month", date: new Date(Number(month[1]), Number(month[2]) - 1, 1) };
    return { precision: "invalid", date: null };
  }

  function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  function diffDays(later, earlier) {
    return Math.round((startOfDay(later) - startOfDay(earlier)) / DAY_MS);
  }

  /** Monday of the week containing `date`. */
  function mondayOf(date) {
    return addDays(startOfDay(date), -((date.getDay() + 6) % 7));
  }

  function toISO(date) {
    const pad = (n) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }

  /** "Today" at local midnight, honouring ?today= and UC_COURSE.today. */
  UC.today = function today() {
    let override = null;
    try {
      override = new URLSearchParams(window.location.search).get("today");
    } catch (error) {
      override = null;
    }
    return parseDay(override) || parseDay(UC.course && UC.course.today) || startOfDay(new Date());
  };

  function fill(pattern, values) {
    return pattern.replace(/\{(\w+)\}/g, (match, name) => (name in values ? values[name] : match));
  }

  function parts(date) {
    return {
      d: String(date.getDate()),
      m: UC.t("dates.months")[date.getMonth()],
      M: UC.t("dates.monthsLong")[date.getMonth()],
      y: String(date.getFullYear()),
      w: UC.t("dates.weekdays")[date.getDay()],
    };
  }

  /**
   * Formats a date in the active language.
   * @param {string|Date|null} value ISO day, ISO month ("YYYY-MM"), Date or null.
   * @param {"short"|"long"|"weekday"} [format]
   */
  UC.formatDate = function formatDate(value, format) {
    const parsed = value instanceof Date ? { precision: "day", date: value } : parseDeadlineDate(value);
    if (parsed.precision === "none" || parsed.precision === "invalid") return UC.t("deadlines.toBeScheduled");
    if (parsed.precision === "month") return fill(UC.t("dates.format.month"), parts(parsed.date));
    const key = ["medium", "long", "weekday"].includes(format) ? format : "short";
    return fill(UC.t(`dates.format.${key}`), parts(parsed.date));
  };

  /**
   * Formats a date range, e.g. "25–28 nov" or "30 set–3 out".
   * With format "medium" the year is added: "25–28 nov 2025",
   * or "30 dez 2025–3 jan 2026" across years.
   */
  UC.formatDateRange = function formatDateRange(start, end, format) {
    const a = parseDay(start);
    const b = parseDay(end);
    if (!a || !b) return UC.formatDate(a || b, format);
    if (diffDays(a, b) === 0) return UC.formatDate(a, format);
    const withYear = format === "medium";
    if (withYear && a.getFullYear() !== b.getFullYear()) return `${UC.formatDate(a, "medium")}–${UC.formatDate(b, "medium")}`;
    const pa = parts(a);
    const pb = parts(b);
    const range =
      a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()
        ? fill(UC.t("dates.format.rangeSameMonth"), { d1: pa.d, d2: pb.d, m: pa.m })
        : fill(UC.t("dates.format.rangeOtherMonth"), { d1: pa.d, m1: pa.m, d2: pb.d, m2: pb.m });
    return withYear ? `${range} ${pb.y}` : range;
  };

  /** Appends a time to an already formatted date. */
  UC.internal.withTime = (formattedDate, time) =>
    time ? fill(UC.t("dates.format.withTime"), { date: formattedDate, time }) : formattedDate;

  /* ---------------------------------------------------------------------------
   * Teaching calendar
   * ------------------------------------------------------------------------- */

  let calendarCache = null;

  /**
   * Builds the list of teaching weeks from UC_COURSE.semester:
   * consecutive calendar weeks from `start`, skipping weeks covered by a break.
   */
  function buildCalendar(semester) {
    const start = parseDay(semester && semester.start);
    if (!start) return { weeks: [], breaks: [] };

    const [firstDay, lastDay] = semester.teachingDays;
    const breaks = semester.breaks
      .map((item) => ({ start: parseDay(item.start), end: parseDay(item.end), label: item.label }))
      .filter((item) => item.start && item.end);

    const weeks = [];
    const breakWeeks = [];
    let monday = mondayOf(start);
    const SAFETY_LIMIT = 104;
    for (let i = 0; weeks.length < semester.weeks && i < SAFETY_LIMIT; i += 1) {
      const classStart = addDays(monday, firstDay - 1);
      const classEnd = addDays(monday, lastDay - 1);
      const onBreak = breaks.find((item) => item.start <= classEnd && item.end >= classStart);
      if (onBreak) {
        breakWeeks.push({ monday, start: onBreak.start, end: onBreak.end, label: onBreak.label, afterWeek: weeks.length });
      } else {
        weeks.push({
          n: weeks.length + 1,
          monday,
          start: weeks.length === 0 && start > classStart ? start : classStart,
          end: classEnd,
        });
      }
      monday = addDays(monday, 7);
    }
    return { weeks, breaks: breakWeeks };
  }

  function calendar() {
    if (!calendarCache) calendarCache = buildCalendar(UC.course && UC.course.semester);
    return calendarCache;
  }

  /** Dates of teaching week `n`: { n, start, end } or null. */
  UC.weekDates = function weekDates(n) {
    const week = calendar().weeks.find((item) => item.n === Number(n));
    return week ? { n: week.n, start: week.start, end: week.end } : null;
  };

  /** The teaching week containing `date` (default: today), or null. */
  UC.weekOf = function weekOf(date) {
    const day = parseDay(date || UC.today());
    if (!day) return null;
    const week = calendar().weeks.find((item) => day >= item.monday && day < addDays(item.monday, 7));
    return week ? { n: week.n, start: week.start, end: week.end } : null;
  };

  /**
   * State of week `n` relative to `day` (default: today): "past", "current" or "future".
   * A week is current from its Monday to its Sunday.
   */
  function weekState(n, day) {
    const week = calendar().weeks.find((item) => item.n === Number(n));
    if (!week) return "future";
    const today = day || UC.today();
    if (today < week.monday) return "future";
    if (today >= addDays(week.monday, 7)) return "past";
    return "current";
  }

  Object.assign(UC.internal, {
    parseDay,
    parseDeadlineDate,
    startOfDay,
    addDays,
    diffDays,
    mondayOf,
    toISO,
    calendar,
    weekState,
    resetCalendar: () => {
      calendarCache = null;
    },
  });
})(window.UC);
