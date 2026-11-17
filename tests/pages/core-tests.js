/* Unit tests for kit/src/core, run in the browser by the page checker. */
(function () {
  "use strict";
  const results = document.getElementById("results");
  let failures = 0;

  function test(name, fn) {
    let ok = true;
    let detail = "";
    try {
      fn();
    } catch (error) {
      ok = false;
      detail = error.message;
      failures += 1;
      console.error(`FAIL ${name}: ${detail}`);
    }
    const item = document.createElement("li");
    item.textContent = `${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`;
    results.append(item);
  }

  function equal(actual, expected) {
    const a = JSON.stringify(actual);
    const e = JSON.stringify(expected);
    if (a !== e) throw new Error(`expected ${e}, got ${a}`);
  }

  const iso = (date) => (date ? UC.internal.toISO(date) : null);

  test("today honours ?today=", () => equal(iso(UC.today()), new URLSearchParams(location.search).get("today") || iso(UC.today())));
  test("parseDay rejects invalid dates", () => equal(UC.internal.parseDay("2025-02-30"), null));
  test("week 1 starts on semester start (Tuesday)", () => equal(iso(UC.weekDates(1).start), "2025-09-16"));
  test("week 1 ends on Friday", () => equal(iso(UC.weekDates(1).end), "2025-09-19"));
  test("week 6 is before the break", () => equal(iso(UC.weekDates(6).start), "2025-10-21"));
  test("week 7 skips the break week", () => equal(iso(UC.weekDates(7).start), "2025-11-04"));
  test("week 10 dates", () => equal([iso(UC.weekDates(10).start), iso(UC.weekDates(10).end)], ["2025-11-25", "2025-11-28"]));
  test("weekOf a Wednesday in week 10", () => equal(UC.weekOf("2025-11-26").n, 10));
  test("weekOf a Sunday belongs to that week", () => equal(UC.weekOf("2025-11-30").n, 10));
  test("weekOf the break is null", () => equal(UC.weekOf("2025-10-29"), null));
  test("weekState past/current/future", () =>
    equal([8, 10, 11].map((n) => UC.internal.weekState(n, UC.internal.parseDay("2025-11-27"))), ["past", "current", "future"]));
  test("calendar records the break after week 6", () => equal(UC.internal.calendar().breaks.map((b) => b.afterWeek), [6]));

  test("formatDate short (pt)", () => equal(UC.formatDate("2025-11-12"), "12 nov"));
  test("formatDate long (pt)", () => equal(UC.formatDate("2025-11-12", "long"), "12 de novembro de 2025"));
  test("formatDate weekday (pt)", () => equal(UC.formatDate("2025-11-12", "weekday"), "quarta-feira, 12 nov"));
  test("formatDate month precision", () => equal(UC.formatDate("2026-01"), "janeiro 2026"));
  test("formatDate null", () => equal(UC.formatDate(null), "Por marcar"));
  test("formatDateRange same month", () => equal(UC.formatDateRange("2025-11-25", "2025-11-28"), "25–28 nov"));
  test("formatDateRange across months", () => equal(UC.formatDateRange("2025-09-30", "2025-10-03"), "30 set–3 out"));
  test("formatDateRange medium adds the year", () => equal(UC.formatDateRange("2025-11-24", "2025-11-30", "medium"), "24–30 nov 2025"));
  test("formatDateRange medium across years", () => equal(UC.formatDateRange("2025-12-29", "2026-01-02", "medium"), "29 dez 2025–2 jan 2026"));
  test("canRun: markup languages have no Run button", () => equal(["html", "css", "text", "java", "py", "js"].map(UC.internal.canRun), [false, false, false, true, true, true]));

  test("text resolves active language", () => equal(UC.text({ pt: "Olá", en: "Hello" }), UC.lang === "en" ? "Hello" : "Olá"));
  test("text falls back to first language", () => equal(UC.text({ pt: "Só PT" }, "en"), "Só PT"));
  test("t interpolates", () => equal(UC.internal.tIn("en", "weeks.week", { n: 3 }), "Week 3"));
  test("deadlines sorted, null last", () => equal(UC.course.deadlines.map((d) => d.id), ["ap1", "quiz9", "ap2", "exam", "resit"]));
  test("notices sorted newest first", () => equal(UC.course.notices[0].date, "2025-11-27"));
  test("pages normalised", () => equal(UC.course.pages[0], { id: "home", href: "uc-page.html", builtin: true, label: null }));

  test("formatDate in English", () => {
    const saved = UC.lang;
    UC.lang = "en";
    try {
      equal([UC.formatDate("2025-11-12", "long"), UC.formatDateRange("2025-09-30", "2025-10-03")], ["12 November 2025", "30 Sep–3 Oct"]);
    } finally {
      UC.lang = saved;
    }
  });

  test("headingTag reads heading-level (2 to 6, else h2)", () => {
    const tag = (value) => {
      const element = document.createElement("uc-notices");
      if (value !== null) element.setAttribute("heading-level", value);
      return UC.internal.headingTag(element);
    };
    const warn = console.warn;
    console.warn = () => {};
    try {
      equal([tag(null), tag("3"), tag("6"), tag("1"), tag("x")], ["h2", "h3", "h6", "h2", "h2"]);
    } finally {
      console.warn = warn;
    }
  });

  const summary = document.createElement("p");
  summary.textContent = failures ? `${failures} failing` : "All tests passed.";
  results.after(summary);
})();
