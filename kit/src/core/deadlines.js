/**
 * The course deadlines (UC_COURSE.deadlines) as the blocks read them: lookup,
 * status on a day, deadlines inside a week, and the <time> that shows one.
 * Shared by <uc-deadlines>, <uc-event>, <uc-week>, <uc-weeks>,
 * <uc-this-week>, <uc-assessment-info> and <uc-problems>.
 */
(function (UC) {
  "use strict";
  if (UC.__duplicate) return;

  const { h, parseDay, parseDeadlineDate, diffDays, deadlineTimes } = UC.internal;

  /** The configured deadline with this id, or null. */
  function findDeadline(id) {
    return (id && UC.course.deadlines.find((deadline) => deadline.id === id)) || null;
  }

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

  /**
   * State of one deadline on `today`, for blocks that show a single deadline:
   * { status: "upcoming" | "today" | "ongoing" | "done" | "toBeScheduled", days }
   * where `days` counts from today to the first day (negative once it started).
   */
  function deadlineStatus(deadline, today) {
    const { precision, date } = deadline.parsed;
    const upcoming = isUpcoming(deadline, today);
    if (precision !== "day") return { status: upcoming ? "toBeScheduled" : "done" };
    const days = diffDays(date, today);
    return { status: days > 0 ? "upcoming" : days === 0 ? "today" : upcoming ? "ongoing" : "done", days };
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
    return UC.internal.withTime(text, deadlineTimes(deadline));
  }

  /** A <time> element for a deadline's date (or plain text when it has none). */
  function deadlineTime(deadline, className) {
    const parsed = deadline.parsed || parseDeadlineDate(deadline.date);
    const text = deadlineDateText(deadline);
    if (parsed.precision !== "day" && parsed.precision !== "month") return h("span", { class: className }, text);
    return h("time", { class: className, datetime: String(deadline.date).trim() }, text);
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

  Object.assign(UC.internal, {
    findDeadline,
    isUpcoming,
    deadlineStatus,
    deadlineDateText,
    deadlineTime,
    deadlinesBetween,
    writtenEventIds,
    createEvent,
  });
})(window.UC);
