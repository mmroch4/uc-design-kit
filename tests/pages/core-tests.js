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

  test("logo: default, hidden, URL, inline SVG, object", () => {
    const logo = (value) => UC.internal.normalizeLogo(value, (href) => `../${href}`);
    equal([logo(undefined), logo("default"), logo(null), logo(""), logo({ alt: "x" })], ["default", "default", null, null, null]);
    equal(logo("logo.png"), { src: "../logo.png" });
    equal(logo(' <svg viewBox="0 0 1 1"></svg>'), { svg: ' <svg viewBox="0 0 1 1"></svg>' });
    equal(logo({ src: "a.svg", alt: { pt: "DCC" } }), { src: "../a.svg", alt: { pt: "DCC" } });
  });

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

  /* Blocks phase 1: times, weekdays, storage keys, search text, list items. */
  const inLang = (lang, fn) => {
    const saved = UC.lang;
    UC.lang = lang;
    try {
      return fn();
    } finally {
      UC.lang = saved;
    }
  };
  test("formatTime pads and joins a range", () => equal([UC.formatTime("9:00"), UC.formatTime("14:00", "15:30"), UC.formatTime("x")], ["09:00", "14:00–15:30", "x"]));
  test("formatDuration (pt and en)", () =>
    equal([UC.formatDuration(120), UC.formatDuration(105), UC.formatDuration(45), UC.formatDuration(0), inLang("en", () => UC.formatDuration(90))], ["2 h", "1 h 45 min", "45 min", "", "1 h 30 min"]));
  test("weekdayName short, long, out of range", () =>
    equal([inLang("pt", () => UC.weekdayName(2)), inLang("pt", () => UC.weekdayName(7, "long")), inLang("en", () => UC.weekdayName(1)), UC.weekdayName(0)], ["3.ª", "domingo", "Mon", ""]));
  test("storage keys include the course code", () => equal(UC.internal.storage.key("class", "lab"), "uc:CC1007:class:lab"));
  test("storage round trip", () => {
    UC.internal.storage.set("test", "x", "1");
    const value = UC.internal.storage.get("test", "x");
    UC.internal.storage.remove("test", "x");
    equal([value, UC.internal.storage.get("test", "x")], ["1", null]);
  });
  test("storage adopts and removes a legacy key", () => {
    localStorage.setItem("uc:test-legacy", "old");
    const value = UC.internal.storage.get("test", "legacy", { legacy: "uc:test-legacy" });
    const result = [value, localStorage.getItem("uc:CC1007:test:legacy"), localStorage.getItem("uc:test-legacy")];
    UC.internal.storage.remove("test", "legacy");
    equal(result, ["old", "old", null]);
  });
  test("storage keeps a shared legacy key with keepLegacy", () => {
    localStorage.setItem("uc:test-shared", "en");
    const value = UC.internal.storage.get("test", "shared", { legacy: "uc:test-shared", keepLegacy: true });
    const kept = localStorage.getItem("uc:test-shared");
    UC.internal.storage.remove("test", "shared");
    localStorage.removeItem("uc:test-shared");
    equal([value, kept], ["en", "en"]);
  });
  test("storage prefers the course key over the legacy one", () => {
    UC.internal.storage.set("test", "both", "new");
    localStorage.setItem("uc:test-both", "old");
    const value = UC.internal.storage.get("test", "both", { legacy: "uc:test-both" });
    UC.internal.storage.remove("test", "both");
    localStorage.removeItem("uc:test-both");
    equal(value, "new");
  });
  test("normalise ignores case and accents", () => equal(UC.internal.normalise("  Árvores Binárias "), "arvores binarias"));
  test("firstTime skips nested lists and times without datetime", () => {
    const list = document.createElement("ul");
    list.innerHTML = '<li><time>hoje</time> Tópico <ul><li><time datetime="2025-10-01">1 out</time></li></ul> <time datetime="2025-11-18">18 nov</time></li>';
    const found = UC.internal.firstTime(list.firstElementChild);
    equal(found && UC.internal.toISO(found.date), "2025-11-18");
  });
  test("localiseTime keeps the teacher's text", () => {
    const time = document.createElement("time");
    time.setAttribute("datetime", "2025-11-18");
    time.textContent = "18/11";
    UC.internal.localiseTime(time, "long");
    equal([time.textContent, time.getAttribute("data-uc-text")], [inLang(UC.lang, () => UC.formatDate("2025-11-18", "long")), "18/11"]);
  });

  /* Blocks phase 2: deadline times, status, grading and calendar files. */
  const deadline = (fields) => ({ links: [], ...fields, parsed: UC.internal.parseDeadlineDate(fields.date), endDate: UC.internal.parseDay(fields.end) });
  test("deadlineTimes: shifts, duration, time", () =>
    equal(
      inLang("pt", () => [
        UC.internal.deadlineTimes({ time: "14:30", shifts: [{ time: "14:30" }, { time: "16:30" }, { time: "18:30" }] }),
        UC.internal.deadlineTimes({ time: "14:30", duration: 120 }),
        UC.internal.deadlineTimes({ time: "9:00", duration: 105 }),
        UC.internal.deadlineTimes({ time: "21:00" }),
        UC.internal.deadlineTimes({}),
      ]),
      ["14:30, 16:30 e 18:30", "14:30–16:30", "09:00–10:45", "21:00", ""],
    ));
  test("deadlineStatus counts days and spans", () => {
    const today = UC.internal.parseDay("2025-11-27");
    const status = (fields) => {
      const { status: value, days } = UC.internal.deadlineStatus(deadline(fields), today);
      return days === undefined ? value : `${value} ${days}`;
    };
    equal(
      [
        status({ date: "2025-12-02" }),
        status({ date: "2025-11-28" }),
        status({ date: "2025-11-27" }),
        status({ date: "2025-11-24", end: "2025-11-30" }),
        status({ date: "2025-11-12" }),
        status({ date: "2026-01" }),
        status({ date: null }),
      ],
      ["upcoming 5", "upcoming 1", "today 0", "ongoing -3", "done -15", "toBeScheduled", "toBeScheduled"],
    );
  });
  test("icsText: one event per shift, Lisbon time, escaped text", () => {
    const text = UC.internal.icsText(
      deadline({ id: "t1", title: "Teste 1; parte A", date: "2025-12-03", time: "14:30", duration: 120, location: "FC1 120, <a href=\"#\">salas</a>", shifts: [{ time: "14:30" }, { time: "16:30", date: "2025-12-04", location: "FC6" }] }),
      "https://example.org/t1.html",
    );
    const lines = text.split("\r\n");
    equal(
      [
        lines.filter((line) => line === "BEGIN:VEVENT").length,
        lines.includes("DTSTART;TZID=Europe/Lisbon:20251203T143000"),
        lines.includes("DTEND;TZID=Europe/Lisbon:20251203T163000"),
        lines.includes("DTSTART;TZID=Europe/Lisbon:20251204T163000"),
        lines.includes("SUMMARY:Teste 1\\; parte A"),
        lines.includes("LOCATION:FC1 120\\, salas"),
        lines.includes("LOCATION:FC6"),
        lines.includes("TZID:Europe/Lisbon"),
        text.endsWith("END:VCALENDAR\r\n"),
      ],
      [2, true, true, true, true, true, true, true, true],
    );
  });
  test("icsText: a deadline without time is an all-day event", () => {
    const lines = UC.internal.icsText(deadline({ id: "q", title: "Quiz", date: "2025-11-24", end: "2025-11-30" })).split("\r\n");
    equal([lines.includes("DTSTART;VALUE=DATE:20251124"), lines.includes("DTEND;VALUE=DATE:20251201"), lines.includes("TZID:Europe/Lisbon")], [true, true, false]);
  });
  test("findMatches ignores case and accents and maps back to the text", () => {
    const text = "Árvores binárias; ÁRVORES";
    const ranges = UC.internal.findMatches(text, UC.internal.normalise("arvores"));
    equal(ranges.map(([start, end]) => text.slice(start, end)), ["Árvores", "ÁRVORES"]);
    equal(UC.internal.findMatches("Notação O", "cao o"), [[4, 9]]);
    equal(UC.internal.findMatches("abc", ""), []);
  });
  test("uc-summaries: numbers, week links, states and breaks", () => {
    const host = document.createElement("div");
    host.hidden = true;
    host.innerHTML =
      '<uc-summaries order="desc"><ol start="3">' +
      '<li><time datetime="2025-10-24">24 out</time> A</li>' +
      '<li><time datetime="2025-11-04">4 nov</time> B</li>' +
      '<li>C</li>' +
      '<li><time datetime="2025-12-02">2 dez</time> D</li>' +
      "</ol></uc-summaries>";
    document.body.append(host);
    const element = host.firstElementChild;
    const rows = Array.from(element.querySelectorAll("li"), (item) =>
      item.classList.contains("uc-summaries__break")
        ? "break"
        : [item.value, (item.querySelector(".uc-summaries__week") || {}).textContent || "", (item.querySelector(".uc-summaries__state") || {}).textContent || ""].join("|"),
    );
    const date = element.querySelector("time").getAttribute("data-uc-text");
    host.remove();
    equal(
      inLang("pt", () => rows),
      ["6|Semana 11|Prevista", "5||", "4|Semana 7|Última aula", "break", "3|Semana 6|"],
    );
    equal(date, "2 dez");
  });
  test("uc-weeks compact: one row per week, break row, current row", () => {
    const host = document.createElement("div");
    host.hidden = true;
    host.innerHTML = '<uc-weeks view="compact" no-deadlines><uc-week n="6" title="Seis"></uc-week><uc-week n="7" title="Sete" href="w7.html"></uc-week><uc-week n="10" title="Dez"></uc-week></uc-weeks>';
    document.body.append(host);
    const rows = Array.from(host.querySelectorAll(".uc-weeks__table tbody tr"), (row) => [row.id, row.getAttribute("aria-current") || "", Array.from(row.cells, (cell) => cell.textContent.trim()).join(" ")]);
    const weeksHidden = Array.from(host.querySelectorAll("uc-week"), (week) => week.hidden && !week.id);
    const link = host.querySelector(".uc-weeks__topic a").getAttribute("href");
    host.remove();
    equal(weeksHidden, [true, true, true]);
    equal(link, "w7.html");
    equal(rows.map((row) => row[0]), ["week-6", "", "week-7", "week-10"]);
    equal(rows[3][1], "date");
    equal(rows.map((row) => row[2]).slice(1, 3), ["27–31 out · Atividades FCUP II, sem aulas", "7 4–7 nov Sete Dada"]);
  });
  test("uc-week href: class page link first in the body", () => {
    const host = document.createElement("div");
    host.hidden = true;
    host.innerHTML = '<uc-weeks no-deadlines no-breaks><uc-week n="3" title="Três" href="w3.html"><p>Corpo</p></uc-week></uc-weeks>';
    document.body.append(host);
    const first = host.querySelector(".uc-week__body").firstElementChild;
    const result = [first.className, first.querySelector("a").getAttribute("href"), host.querySelector("uc-week").id];
    host.remove();
    equal(result, ["uc-week__page", "w3.html", "week-3"]);
  });

  test("materialType: URL → type", () =>
    equal(
      [
        "slides/a.PDF",
        "https://colab.research.google.com/drive/x",
        "https://github.com/a/b/blob/main/n.ipynb",
        "https://gitlab.com/a/b",
        "https://youtu.be/x",
        "https://www.youtube.com/watch?v=x",
        "aula.mp4",
        "code.tar.gz",
        "a.tgz",
        "Main.java",
        "https://github.com/a/b",
        "https://example.org/",
        "folder/",
      ].map(UC.internal.materialType),
      ["pdf", "notebook", "notebook", "github", "video", "video", "video", "archive", "archive", "code", "github", "link", "link"],
    ));
  test("uc-materials: title, updated, Novo, Sem material, data-type and hidden type", () => {
    const host = document.createElement("div");
    host.hidden = true;
    host.innerHTML =
      '<uc-materials><ol><li><time datetime="2025-11-25">25 nov</time> — Árvores <a href="a.pdf">PDF</a> · <a href="s.pdf" data-type="slides">Diapositivos</a></li>' +
      '<li><time datetime="2025-12-25">25 dez</time> Futuro</li><li><time datetime="2025-11-01">1 nov</time> Antigo <a href="x.zip">Ficheiros</a></li></ol></uc-materials>';
    document.body.append(host);
    const items = Array.from(host.querySelectorAll(".uc-materials__item"), (item) => [
      item.querySelector(".uc-materials__title").textContent.trim(),
      (item.querySelector(".uc-materials__updated") || {}).textContent || "",
      Boolean(item.querySelector(".uc-materials__new")),
      item.querySelector(".uc-materials__empty").hidden,
      Array.from(item.querySelectorAll(".uc-materials__link"), (link) => `${link.dataset.type}:${link.textContent}`),
    ]);
    host.remove();
    const today = iso(UC.today());
    if (today !== "2025-11-27") return; // dates below assume the test day
    equal(items, [
      ["Árvores", "Atualizado a 25 nov", true, true, ["pdf:PDF", "slides:Diapositivos"]],
      ["Futuro", "Atualizado a 25 dez", false, false, []],
      ["Antigo", "Atualizado a 1 nov", false, true, ["archive:Ficheiros (arquivo)"]],
    ]);
  });
  test("uc-materials: <ol start> keeps its first number", () => {
    const host = document.createElement("div");
    host.innerHTML = '<uc-materials><ol start="0"><li>Zero <a href="a.pdf">PDF</a></li></ol></uc-materials>' +
      '<uc-materials><ul><li>Sem número <a href="b.pdf">PDF</a></li></ul></uc-materials>';
    document.body.append(host);
    const lists = Array.from(host.querySelectorAll(".uc-materials__list"), (list) => list.style.counterReset);
    host.remove();
    equal(lists, ["uc-materials -1", ""]);
  });
  test("uc-problems: ids, judge by id or label, series hidden by filters", () => {
    const host = document.createElement("div");
    host.hidden = true;
    host.innerHTML =
      '<uc-problems filters><section><h3>S1</h3><ul><li data-judge="MOOSHAK"><a href="#a">A</a> <code>P1</code></li>' +
      '<li data-judge="Kattis" data-type="extra" data-id="k-hello"><a href="#b">B</a></li></ul></section>' +
      '<section><h3>S2</h3><ul><li><a href="#c">C</a></li></ul></section></uc-problems>';
    document.body.append(host);
    const element = host.querySelector("uc-problems");
    const ids = element.items.map((item) => item.id);
    const judges = Array.from(host.querySelectorAll(".uc-problems__judge"), (tag) => tag.textContent);
    host.querySelectorAll(".uc-filters__button").forEach((button) => button.dataset.value === "extra" && button.click());
    const hidden = Array.from(host.querySelectorAll("section.uc-problems__series"), (section) => section.hidden);
    host.remove();
    equal(ids, ["mooshak:P1", "k-hello", new URL("#c", location.href).href]);
    equal(judges, ["Mooshak", "Kattis"]);
    equal(hidden, [false, true]);
  });

  test("uc-problems: cards seal, languages once or per item, empty hints hidden", () => {
    const host = document.createElement("div");
    host.hidden = true;
    host.innerHTML =
      '<uc-problems cards><section><h3>S1</h3><ul>' +
      '<li data-judge="mooshak" data-languages="C++, Java"><a href="#a">A</a> <code>P1</code><details><summary>Dicas</summary><p>Usa DP.</p></details></li>' +
      '<li data-judge="mooshak" data-languages="C++,Java"><a href="#b">B</a> <code>P2</code><details><summary>Dicas</summary></details></li>' +
      '</ul></section><section><h3>S2</h3><ul>' +
      '<li data-languages="C"><a href="#c">C</a></li><li data-languages="C, Python"><a href="#d">D</a></li>' +
      '</ul></section></uc-problems>';
    document.body.append(host);
    const seal = host.querySelector(".uc-problems__judge");
    const series = Array.from(host.querySelectorAll(".uc-problems__meta .uc-problems__languages"), (line) => line.textContent);
    const items = Array.from(host.querySelectorAll(".uc-problems__item > .uc-problems__languages"), (line) => (line.hidden ? "" : line.textContent));
    const hints = Array.from(host.querySelectorAll(".uc-problems__hints"), (details) => details.hidden);
    host.remove();
    equal([seal.localName, seal.textContent], ["a", "Mooshak P1"]);
    equal(series, ["Testado em C++Java"]);
    equal(items, ["", "", "Testado em C", "Testado em CPython"]);
    equal(hints, [false, true]);
  });

  test("sortable tables: sort values", () => {
    const cell = (html, attrs = "") => {
      const row = document.createElement("tr");
      row.innerHTML = `<td ${attrs}>${html}</td>`;
      return row.cells[0];
    };
    const { sortValue } = UC.internal;
    equal(
      [sortValue(cell("12,5")), sortValue(cell(" 50 % ")), sortValue(cell("−3")), sortValue(cell("x", 'data-sort="7"')), sortValue(cell("PL2")), sortValue(cell(""))],
      [12.5, 50, -3, 7, "PL2", ""],
    );
    equal(sortValue(cell('<time datetime="2025-11-03">3 nov</time>')), new Date(2025, 10, 3).getTime());
  });
  test("sortable tables: order (numbers, numeric-aware text, empty last)", () => {
    const collator = new Intl.Collator("pt", { numeric: true, sensitivity: "base" });
    const order = (values, direction) => values.slice().sort((a, b) => UC.internal.compareSortValues(a, b, collator, direction));
    equal(order(["PL10", "PL2", "", "pl1"], "asc"), ["pl1", "PL2", "PL10", ""]);
    equal(order([3, "", 12.5, 7], "desc"), [12.5, 7, 3, ""]);
    equal(order(["Árvores", "arrays", "Bits"], "asc"), ["arrays", "Árvores", "Bits"]);
  });
  test("sortable tables: header buttons, default sort, fixed rows", () => {
    const host = document.createElement("div");
    host.innerHTML =
      '<div class="uc-table"><table data-sortable><thead><tr><th>Nome</th><th data-sort-default="desc">Pontos</th><th data-no-sort>Notas</th></tr></thead>' +
      '<tbody><tr><td>A</td><td>2</td><td></td></tr><tr data-sort-fixed><td>Total</td><td>13</td><td></td></tr><tr><td>B</td><td>10,5</td><td></td></tr><tr><td>C</td><td>1</td><td></td></tr></tbody></table></div>';
    document.body.append(host);
    UC.internal.enhance(host);
    const names = () => Array.from(host.querySelectorAll("tbody tr"), (row) => row.cells[0].textContent);
    const buttons = host.querySelectorAll(".uc-sort-button").length;
    const first = names();
    const sorted = host.querySelectorAll("th")[1].getAttribute("aria-sort");
    host.querySelector("th .uc-sort-button").click();
    const byName = names();
    UC.internal.enhance(host);
    const again = host.querySelectorAll(".uc-sort-button").length;
    host.remove();
    equal([buttons, again, sorted], [2, 2, "descending"]);
    equal(first, ["B", "A", "C", "Total"]);
    equal(byName, ["A", "B", "C", "Total"]);
  });

  /* uc-grading lives in uc-grading.js (core/modules.js): load it before creating one. */
  const gradingTests = () => test("uc-grading: normalised weights and formula coefficients", () => {
    const render = (html, attributes = "") => {
      const host = document.createElement("div");
      host.hidden = true;
      host.innerHTML = `<uc-grading ${attributes}>${html}</uc-grading>`;
      document.body.append(host);
      const element = host.firstElementChild;
      const result = {
        formula: element.querySelector(".uc-grading__formula").textContent,
        weights: Array.from(element.querySelectorAll(".uc-grading__table tbody td:nth-child(2)"), (cell) => cell.textContent),
      };
      host.remove();
      return result;
    };
    const edados = render('<ul><li data-code="E" data-scale="14"><data value="14">14 valores</data> Exame</li><li data-code="AP" data-scale="5"><data value="5">5 valores</data> AP</li><li data-code="P" data-scale="1"><data value="1">1 valor</data> P</li></ul>');
    const ip = render('<ul><li data-code="A"><data value="0,1">0,1</data> A</li><li data-code="T"><data value="0.4">0,4</data> T</li><li data-code="E"><data value="0.5">0,5</data> E</li><li data-code="B" data-bonus="2">Bónus</li></ul>');
    equal(
      inLang("pt", () => [edados.formula, ip.formula, ip.weights[3]]),
      ["Nota = E + AP + P", "Nota = 0,1 × A + 0,4 × T + 0,5 × E + B", "Bónus · até 2 valores"],
    );
    equal(edados.weights[0].replace(/\s/g, " "), "14 valores · 70%");
  });

  /* Formulas and rules (docs/architecture/grading-api.md 13): the parser has no DOM. */
  const formulaTests = () => {
    const G = UC.internal.grading;
    const PRE = [{ code: "P" }, { code: "R" }, { code: "E" }];
    const F1 = "CF = max(0.75*E + 0.2*P + 0.05*R; 0.65*E + 0.3*P + 0.05*R)";
    const text = (tree) => inLang("pt", () => G.print(tree).join(""));
    const errorOf = (options) => {
      try {
        G.model({ components: PRE, ...options });
      } catch (error) {
        return error.message;
      }
      return "no error";
    };
    const columns = (formulas, components = PRE, result = null) =>
      G.model({ components, formulas, result }).columns?.map((column) => [column.name, Object.entries(column.coefficients).map(([code, c]) => `${code} ${Math.round(c * 1000) / 1000}`).sort().join(", ")]) ?? null;

    test("grading 13.1: formulas parse, F1–F3 are one tree, pretty printing (pt)", () => {
      const strip = (tree) => JSON.stringify(tree, (key, value) => (key === "start" ? undefined : value));
      const [f1, f2, f3] = [F1, "CF = Max(0,75*E + 0,2*P + 0,05*R ; 0,65*E + 0,3*P + 0,05*R)", "CF = max(0.75*E+0.2*P+0.05*R, 0.65*E+0.3*P+0.05*R)"].map((t) => G.parse(t, "formula 1"));
      equal([strip(f2), strip(f3)], [strip(f1), strip(f1)]);
      equal([f1.name, text(f1.tree)], ["CF", "max(0,75 × E + 0,2 × P + 0,05 × R; 0,65 × E + 0,3 × P + 0,05 × R)"]);
      const printed = ["CF = (0.7*EX + 0.25*PA + 0.05*WP) / 5", "0.1*A + 0.2*T1 + 0.2*T2 + 0.5*E", "CF = 0,75 × E + 0,2 · P + 0,05*R", "CF = min(E; max(P; R))", "CF = -1 + E − 0.5*(P - R)", "CF = E * P / 20", "CF = max(E;P;R)", "CF = (E - P) - (R - E) / (P / R)"].map((t) => {
        const { name, tree } = G.parse(t, "formula 1");
        return `${name || "Nota"} = ${text(tree)}`;
      });
      equal(printed, [
        "CF = (0,7 × EX + 0,25 × PA + 0,05 × WP) / 5",
        "Nota = 0,1 × A + 0,2 × T1 + 0,2 × T2 + 0,5 × E",
        "CF = 0,75 × E + 0,2 × P + 0,05 × R",
        "CF = min(E; max(P; R))",
        "CF = −1 + E − 0,5 × (P − R)",
        "CF = E × P / 20",
        "CF = max(E; P; R)",
        "CF = E − P − (R − E) / (P / R)",
      ]);
      equal(inLang("en", () => G.print(f1.tree).join("")), "max(0.75 × E + 0.2 × P + 0.05 × R, 0.65 × E + 0.3 × P + 0.05 × R)");
      const f5 = G.model({ components: PRE, formulas: ["A = 0.75*E + 0.2*P + 0.05*R", "B = 0.65*E + 0.3*P + 0.05*R", "CF = max(A; B)"] });
      equal([f5.formulas.map((f) => f.name), f5.result.name, text(f5.result.tree)], [["A", "B", "CF"], "CF", "max(A; B)"]);
      equal(G.model({ components: PRE, formulas: ["A = E", "CF = P"], result: "A" }).result.name, "A");
    });

    test("grading 13.2: formulas that do not parse", () => {
      const nested = `CF = ${"(".repeat(33)}E${")".repeat(33)}`;
      equal(
        [
          errorOf({ formulas: ["CF = 0.75*E + 0.2*X"] }),
          errorOf({ formulas: ["CF = max(0.75*E + 0.2*P"] }),
          errorOf({ formulas: ["CF = E + P)"] }),
          errorOf({ formulas: ["CF = max(1,5)"] }),
          errorOf({ formulas: ["CF = round(E)"] }),
          errorOf({ formulas: ["CF = E +"] }),
          errorOf({ formulas: ["CF = E & P"] }),
          errorOf({ formulas: ["CF = E >= 4.9"] }),
          errorOf({ formulas: ["E = 0.5*P"] }),
          errorOf({ formulas: ["CF = max(A; B)", "A = E", "B = P"] }),
          errorOf({ formulas: ["CF = E / 0"] }),
          errorOf({ formulas: ["CF = .5*E"] }),
          errorOf({ components: [...PRE, { code: "B", bonus: true }], formulas: ["CF = 0.9*E + B"] }),
          errorOf({ formulas: ["CF = max(E)"] }),
          errorOf({ formulas: [nested] }),
          errorOf({ formulas: ["CF = E + P"], result: "NF" }),
          errorOf({ formulas: [`CF = E${" + E".repeat(200)}`] }),
          errorOf({ components: [{ code: "P" }, { code: "" }], formulas: ["CF = P"] }),
          errorOf({ formulas: ["A = E", "A = P"] }),
        ],
        [
          'formula 1, column 19: unknown name "X". Known: P, R, E.',
          'formula 1, column 24: expected ")".',
          'formula 1, column 11: unexpected ")".',
          'formula 1, column 6: max needs at least two arguments (did you mean ";" instead of ","?).',
          'formula 1, column 6: unknown function "round". Only max and min.',
          "formula 1, column 9: the formula ends too early.",
          'formula 1, column 8: unexpected "&".',
          "formula 1, column 8: comparisons belong in data-rules.",
          'formula 1: "E" is already a component code.',
          'formula 1, column 10: "A" is defined later; a formula can only use earlier ones.',
          "formula 1, column 10: division by 0.",
          'formula 1, column 6: unexpected ".".',
          'formula 1, column 14: "B" is a bonus; it is added to the result automatically.',
          'formula 1, column 6: max needs at least two arguments (did you mean ";" instead of ","?).',
          "formula 1: nested too deeply.",
          'result="NF" names no formula.',
          "formula 1: longer than 500 characters.",
          "component 2 has no data-code; formulas need one on every component.",
          'formula 2: "A" is already a formula name.',
        ],
      );
      equal(errorOf({ formulas: [`CF = ${"(".repeat(32)}E${")".repeat(32)}`] }), "no error");
    });

    test("grading 13.4: weight columns per formula", () => {
      const all = (rows) => rows.map(([name, list]) => `${name}: ${list}`);
      equal(all(columns([F1])), ["null: E 0.75, P 0.2, R 0.05", "null: E 0.65, P 0.3, R 0.05"]);
      equal(all(columns(["A = 0.75*E + 0.2*P + 0.05*R", "B = 0.65*E + 0.3*P + 0.05*R", "CF = max(A; B)"])), ["A: E 0.75, P 0.2, R 0.05", "B: E 0.65, P 0.3, R 0.05"]);
      equal(all(columns(["CF = (0.7*EX + 0.25*PA + 0.05*WP) / 5"], [{ code: "EX" }, { code: "PA" }, { code: "WP" }])), ["null: EX 0.14, PA 0.05, WP 0.01"]);
      equal(all(columns(["0.1*A + 0.2*T1 + 0.2*T2 + 0.5*E"], [{ code: "A" }, { code: "T1" }, { code: "T2" }, { code: "E" }])), ["null: A 0.1, E 0.5, T1 0.2, T2 0.2"]);
      equal([columns(["CF = min(E; max(P; R))"]), columns(["CF = E * P / 20"]), columns(["CF = max(E; P) + R"]), columns(["CF = E / P"])], [null, null, null, null]);
      equal(all(columns(["CF = max(0.5*E + 0.5*P; E)"])), ["null: E 0.5, P 0.5", "null: E 1"]);
      equal(all(columns(["CF = max(E; max(P; R))"])), ["null: E 1", "null: P 1", "null: R 1"]);
    });

    test("grading 13.5: rules parse, print and degrade to text rules", () => {
      const model = G.model({ components: PRE, formulas: [F1], rules: ["E >= 4.9", "E ≥ 4,9", "CF >= 9.5", "RESULT >= 9.5", null, "E >= 4.9 >= 2", "E", "X > 1"] });
      const printed = model.rules.map((rule) => rule && inLang("pt", () => G.printRule(rule, undefined, { RESULT: "Nota" }).join("")));
      equal(printed, ["E ≥ 4,9", "E ≥ 4,9", "CF ≥ 9,5", "Nota ≥ 9,5", null, null, null, null]);
      equal(model.ruleErrors.filter(Boolean), [
        "rule 6: a rule needs exactly one comparison (>=, >, <=, <, =).",
        "rule 7: a rule needs exactly one comparison (>=, >, <=, <, =).",
        'rule 8, column 1: unknown name "X". Known: P, R, E, CF, RESULT.',
      ]);
      const pi = G.model({ components: [{ code: "EX" }], formulas: ["CF = EX / 5"], rules: ["0.7*EX/5 >= 4.9"] }).rules[0];
      const value = (values) => (name) => values[name];
      equal([35, 34].map((EX) => G.check(pi, value({ EX }))), [true, false]);
      equal([G.evaluate(G.parse("CF = E / P", "formula 1").tree, value({ E: 10, P: 0 })), G.evaluate(G.parse(F1, "formula 1").tree, value({ P: 14, R: 20, E: 12 }))].map((n) => Math.round(n * 100) / 100), [null, 13]);
    });
  };

  /* The element with formulas and rules (grading-api.md 7). */
  const gradingFormulaTests = () =>
    test("uc-grading with data-formulas and data-rules", () => {
      const host = document.createElement("div");
      host.hidden = true;
      host.innerHTML = `<uc-grading pass="9.5"><ul><li data-code="P">P</li><li data-code="R">R</li><li data-code="E" data-min="4.9">E</li><li data-code="B" data-bonus="1">B</li></ul>
        <ol data-formulas><li><code>A = 0.75*E + 0.2*P + 0.05*R</code></li><li><code>B2 = 0.65*E + 0.3*P + 0.05*R</code></li><li><code>CF = max(A; B2)</code> Conta a mais favorável.</li></ol>
        <ul data-rules><li><code>E>=4,9</code></li><li><code>CF >= 9.5</code> Nota final.</li><li>Comparecer.</li><li><code>E >=</code> partida</li></ul></uc-grading>`;
      document.body.append(host);
      const element = host.firstElementChild;
      const texts = (selector) => Array.from(element.querySelectorAll(selector), (node) => node.textContent.replace(/\s+/g, " ").trim());
      const result = inLang("pt", () => {
        element.render();
        return [texts(".uc-grading__formula"), texts(".uc-grading__note"), texts("thead th"), Array.from(element.querySelectorAll("tbody tr"), (row) => Array.from(row.children, (cell) => cell.textContent.replace(/\s+/g, " ").trim()).join(" | ")), texts(".uc-grading__bar-label"), texts(".uc-grading__rules li"), element.querySelector("[data-formulas]").hidden];
      });
      const described = element.querySelector("thead th[aria-describedby]");
      equal(Boolean(described && element.querySelector(`#${described.getAttribute("aria-describedby")}`)), true);
      equal(element.querySelector(".uc-grading__formula abbr").title, "máximo");
      host.remove();
      equal(result, [
        ["A = 0,75 × E + 0,2 × P + 0,05 × R", "B2 = 0,65 × E + 0,3 × P + 0,05 × R", "CF = máx(A; B2)"],
        ["Conta a mais favorável."],
        ["Componente", "A", "B2", "Mínimo"],
        ["P P | 4 valores · 20% | 6 valores · 30% | —", "R R | 1 valor · 5% | 1 valor · 5% | —", "E E | 15 valores · 75% | 13 valores · 65% | 4,9 em 20", "B B | Bónus · até 1 valor | Bónus · até 1 valor | —"],
        ["A", "B2"],
        ["E ≥ 4,9", "CF ≥ 9,5", "CF ≥ 9,5 Nota final.", "Comparecer.", "E >= partida"],
        true,
      ]);
    });

  /* The calculator with formulas and rules (grading-api.md 9 and 13.3). */
  const calculatorTests = () => {
    /** Renders `html` with `calculator`, types each row of `rows` into the fields and reads [branches, result, checks, state]. */
    const simulate = (attributes, html, rows) => {
      const host = document.createElement("div");
      host.hidden = true;
      host.innerHTML = `<uc-grading calculator ${attributes}>${html}</uc-grading>`;
      document.body.append(host);
      const element = host.firstElementChild;
      const read = (selector) => element.querySelector(selector).textContent.replace(/\s+/g, " ").trim();
      const out = inLang("pt", () => {
        element.render();
        return rows.map((row) => {
          element.querySelectorAll(".uc-grading__calculator input").forEach((input, index) => {
            input.value = row[index] ?? "";
            input.dispatchEvent(new Event("input"));
          });
          return [read(".uc-grading__branches"), read(".uc-grading__result"), Array.from(element.querySelectorAll(".uc-grading__checks li"), (li) => li.textContent), read(".uc-grading__status")];
        });
      });
      host.remove();
      return out;
    };
    const EDADOS = `<ul><li data-code="P">P</li><li data-code="R">R</li><li data-code="E">E</li></ul>
      <ol data-formulas><li><code>CF = max(0.75*E + 0.2*P + 0.05*R; 0.65*E + 0.3*P + 0.05*R)</code></li></ol>
      <ul data-rules><li><code>E >= 4.9</code> Exame.</li><li><code>CF >= 9.5</code></li></ul>`;

    test("grading 13.3: EDados 2026/27 simulation", () => {
      const rows = [[14, 20, 12], [10, 20, 14], [20, 20, 4], [8, 10, 10], [8, 0, 10], [10, 10, 10], [0, 0, 0], [20, 20, 20]];
      const short = simulate('scale="20"', EDADOS, rows).map(([branches, result, checks, state]) => [branches, result.replace("Nota final (CF): ", ""), checks.map((check) => check[0]).join(""), state]);
      const pass = "Aprovado nesta simulação.";
      const failE = "Não aprovado nesta simulação. Abaixo do mínimo: E ≥ 4,9";
      equal(short, [
        ["Fórmula 1: 12,8 · Fórmula 2: 13", "13 valores (conta a Fórmula 2)", "✓✓", pass],
        ["Fórmula 1: 13,5 · Fórmula 2: 13,1", "13,5 valores (conta a Fórmula 1)", "✓✓", pass],
        ["Fórmula 1: 8 · Fórmula 2: 9,6", "9,6 valores (conta a Fórmula 2)", "✗✓", failE],
        ["Fórmula 1: 9,6 · Fórmula 2: 9,4", "9,6 valores (conta a Fórmula 1)", "✓✓", pass],
        ["Fórmula 1: 9,1 · Fórmula 2: 8,9", "9,1 valores (conta a Fórmula 1)", "✓✗", "Não aprovado nesta simulação. Abaixo do mínimo: CF ≥ 9,5"],
        ["Fórmula 1: 10 · Fórmula 2: 10", "10 valores (conta a Fórmula 1)", "✓✓", pass],
        ["Fórmula 1: 0 · Fórmula 2: 0", "0 valores (conta a Fórmula 1)", "✗✗", failE],
        ["Fórmula 1: 20 · Fórmula 2: 20", "20 valores (conta a Fórmula 1)", "✓✓", pass],
      ]);
      // Each check says met / not met in words, not only with ✓ / ✗ (12).
      const [[, , checks]] = simulate('scale="20"', EDADOS, [[20, 20, 4]]);
      equal(checks, ["✗ E ≥ 4,9 (não cumprido)", "✓ CF ≥ 9,5 (cumprido)"]);
    });

    test("grading 13.3: PI literal, tolerance, text rules, clamp, bonus, division by 0", () => {
      const PI = `<ul><li data-code="EX" data-scale="100">EX</li><li data-code="PA" data-scale="100">PA</li><li data-code="WP" data-scale="100">WP</li></ul>
        <ol data-formulas><li><code>CF = (0.7*EX + 0.25*PA + 0.05*WP) / 5</code></li></ol><ul data-rules><li><code>0.7*EX/5 >= 4.9</code></li><li><code>CF >= 9.5</code></li></ul>`;
      const pi = simulate("", PI, [[50, 80, 100], [35, 100, 100], [34, 100, 100], [60, 0, 0]]).map(([branches, result, , state]) => [branches, result, state]);
      equal(pi, [
        ["", "Nota final (CF): 12 valores", "Aprovado nesta simulação."],
        ["", "Nota final (CF): 10,9 valores", "Aprovado nesta simulação."],
        ["", "Nota final (CF): 10,8 valores", "Não aprovado nesta simulação. Abaixo do mínimo: 0,7 × EX / 5 ≥ 4,9"],
        ["", "Nota final (CF): 8,4 valores", "Não aprovado nesta simulação. Abaixo do mínimo: CF ≥ 9,5"],
      ]);
      const PC = `<ul><li data-code="SI">SI</li><li data-code="CE">CE</li><li data-code="PDC">PDC</li><li data-code="B" data-bonus="10%">B</li></ul>
        <ol data-formulas><li><code>0.25*SI + 0.5*CE + 0.25*PDC</code></li></ol><ul data-rules><li><code>RESULT >= 9.5</code></li><li>Comparecer a 2 dos 3 concursos.</li></ul>`;
      equal(simulate("", PC, [[20, 20, 20, 2], [10, 10, 10, 2], [10, 10, 10]]).map(([, result, checks, state]) => [result, checks, state]), [
        ["Nota final: 20 valores", ["✓ Nota ≥ 9,5 (cumprido)", "não verificado: Comparecer a 2 dos 3 concursos."], "Aprovado nesta simulação, se cumprires os requisitos não verificados."],
        ["Nota final: 12 valores", ["✓ Nota ≥ 9,5 (cumprido)", "não verificado: Comparecer a 2 dos 3 concursos."], "Aprovado nesta simulação, se cumprires os requisitos não verificados."],
        ["Nota final: 10 valores", ["✓ Nota ≥ 9,5 (cumprido)", "não verificado: Comparecer a 2 dos 3 concursos."], "Aprovado nesta simulação, se cumprires os requisitos não verificados."],
      ]);
      // Bilingual names: the label keeps the active language and drops the description (17.4).
      const host = document.createElement("div");
      host.hidden = true;
      host.innerHTML = '<uc-grading calculator><ul><li data-code="EF" data-scale="100"><span lang="pt">Exame</span><span lang="en">Exam</span> <span>Escrito.</span></li><li data-code="P">Prática <span>Duas provas.</span></li></ul></uc-grading>';
      document.body.append(host);
      const labels = ["pt", "en"].map((lang) => inLang(lang, () => {
        host.firstElementChild.render();
        return Array.from(host.querySelectorAll(".uc-grading__calculator label"), (label) => label.textContent.replace(/\s+/g, " ").trim());
      }));
      host.remove();
      equal(labels, [["EF: Exame (0 a 100)", "P: Prática (0 a 20)"], ["EF: Exam (0 to 100)", "P: Prática (0 to 20)"]]);
      const ratio = '<ul><li data-code="E">E</li><li data-code="P">P</li></ul><ol data-formulas><li><code>CF = E / P</code></li></ol>';
      equal(simulate("", ratio, [[10, 0], [10, 5], [10]]).map(([, result, , state]) => [result, state]), [
        ["", "Não é possível calcular a nota com estes valores."],
        ["Nota final (CF): 2 valores", ""],
        ["", "Preenche todas as componentes para ver a nota."],
      ]);
    });
  };

  test("modules: kit files resolve next to uc-kit.js", () => equal(new URL(UC.internal.kitUrl("uc-grading.js")).pathname.endsWith("/kit/v1/uc-grading.js"), true));

  UC.internal
    .loadModule("grading")
    .then(() => [gradingTests, formulaTests, gradingFormulaTests, calculatorTests].forEach((run) => run()), (error) => test("uc-grading.js loads next to uc-kit.js", () => { throw error; }))
    .then(() => {
      const summary = document.createElement("p");
      summary.textContent = failures ? `${failures} failing` : "All tests passed.";
      results.after(summary);
    });
})();
