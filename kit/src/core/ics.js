/**
 * Calendar files (RFC 5545) for <uc-assessment-info calendar>: one VEVENT per
 * shift, local times in Europe/Lisbon. See docs/api.md, section 3.6.
 */
(function (UC) {
  "use strict";
  if (UC.__duplicate) return;

  const { h, toISO, addDays, parseDay, parseTime } = UC.internal;

  // Portugal (mainland): WET in winter, WEST from the last Sunday of March to the last of October.
  const TIMEZONE = [
    "BEGIN:VTIMEZONE",
    "TZID:Europe/Lisbon",
    "BEGIN:DAYLIGHT",
    "TZOFFSETFROM:+0000",
    "TZOFFSETTO:+0100",
    "TZNAME:WEST",
    "DTSTART:19700329T010000",
    "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU",
    "END:DAYLIGHT",
    "BEGIN:STANDARD",
    "TZOFFSETFROM:+0100",
    "TZOFFSETTO:+0000",
    "TZNAME:WET",
    "DTSTART:19701025T020000",
    "RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU",
    "END:STANDARD",
    "END:VTIMEZONE",
  ];

  const day = (date) => toISO(date).replace(/-/g, "");
  const escape = (text) => String(text).replace(/[\\;,]/g, "\\$&").replace(/\s*\n\s*/g, "\\n").trim();
  /** Plain text of an HTMLText value (links and markup removed). */
  const plain = (value) => h("div", { html: UC.text(value) }).textContent.trim();

  /** Folds a content line at 75 octets (RFC 5545 3.1). */
  function fold(line) {
    let out = "";
    let size = 0;
    for (const char of line) {
      const bytes = new TextEncoder().encode(char).length;
      if (size + bytes > 75) {
        out += "\r\n ";
        size = 1;
      }
      out += char;
      size += bytes;
    }
    return out;
  }

  /**
   * The .ics text of a deadline (with a day-precision date). DTSTAMP is
   * "today" at midnight, so the text is reproducible with ?today=.
   */
  UC.internal.icsText = function icsText(deadline, pageUrl) {
    const shifts = Array.isArray(deadline.shifts) && deadline.shifts.length ? deadline.shifts : [{}];
    const id = String(deadline.id || "event").replace(/[^\w-]/g, "");
    const host = String(UC.internal.courseKey()).replace(/[^\w.-]/g, "") || "uc";
    const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//UC Design Kit//uc-assessment-info//PT", "CALSCALE:GREGORIAN"];
    if (shifts.some((shift) => parseTime(shift.time || deadline.time))) lines.push(...TIMEZONE);
    shifts.forEach((shift, index) => {
      const date = parseDay(shift.date) || deadline.parsed.date;
      const start = parseTime(shift.time || deadline.time);
      const end = parseTime(UC.internal.endTime(start, shift.end, deadline.duration));
      const location = shift.location || deadline.location;
      lines.push("BEGIN:VEVENT", `UID:${id}-${index + 1}@${host}`, `DTSTAMP:${day(UC.today())}T000000Z`);
      if (start) {
        lines.push(`DTSTART;TZID=Europe/Lisbon:${day(date)}T${start.replace(":", "")}00`);
        if (end) lines.push(`DTEND;TZID=Europe/Lisbon:${day(date)}T${end.replace(":", "")}00`);
      } else {
        lines.push(`DTSTART;VALUE=DATE:${day(date)}`, `DTEND;VALUE=DATE:${day(addDays(deadline.endDate || date, 1))}`);
      }
      lines.push(`SUMMARY:${escape(UC.text(deadline.title))}`);
      if (location) lines.push(`LOCATION:${escape(plain(location))}`);
      if (pageUrl) lines.push(`URL:${pageUrl}`);
      lines.push("END:VEVENT");
    });
    lines.push("END:VCALENDAR");
    return lines.map(fold).join("\r\n") + "\r\n";
  };
})(window.UC);
