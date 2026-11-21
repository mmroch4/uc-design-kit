/**
 * The span and state of a <uc-week>, from the teaching calendar or its
 * `start`/`end` overrides. Shared by <uc-week> and <uc-weeks>.
 */
(function (UC) {
  "use strict";
  if (UC.__duplicate) return;

  const { parseDay, mondayOf, addDays } = UC.internal;

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

  /** "past", "current" or "future" for a span of weekSpan(); null without one. */
  function weekStateOf(span) {
    if (!span) return null;
    const today = UC.today();
    if (today < span.from) return "future";
    if (today >= span.to) return "past";
    return "current";
  }

  Object.assign(UC.internal, { weekSpan, weekStateOf });
})(window.UC);
