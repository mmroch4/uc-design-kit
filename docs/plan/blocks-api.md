# New blocks — API contract (phase 0)

This is the contract of the blocks that the kit adds in **v1.1.0**. It was
written before any code, so that the phases that implement the blocks
(1 to 5) share one design. It does not change `docs/api.md` or the kit: each
implementation phase copies its sections from here into `docs/api.md`, in the
same format, in the same PR as the code.

- Plan (Portuguese, approved by Miguel on 16 Nov 2026):
  <https://claude.ai/artifact/4pF22gSc8XMQw3pHT7ioB9>
- Status: **approved design, not implemented**. A phase may refine a detail
  that turns out wrong while coding; it records the change in this file and in
  its handoff note, so later phases see it.
- Everything here is **additive** to v1: no existing attribute, field, class
  or token changes meaning. Sites written for v1.0 keep working unchanged.

Contents:

1. [Common rules](#1-common-rules)
2. [`course.js` additions](#2-coursejs-additions)
3. [New components](#3-new-components)
4. [Changes to existing components](#4-changes-to-existing-components)
5. [CSS building blocks and page-wide enhancements](#5-css-building-blocks-and-page-wide-enhancements)
6. [Tokens](#6-tokens)
7. [JavaScript API and internals](#7-javascript-api-and-internals)
8. [Interface strings](#8-interface-strings)
9. [Demo and test data](#9-demo-and-test-data)
10. [Where each course uses each block](#10-where-each-course-uses-each-block)
11. [Tests and acceptance](#11-tests-and-acceptance)
12. [Phases and files](#12-phases-and-files)
13. [Decisions taken in phase 0](#13-decisions-taken-in-phase-0)

---

## 1. Common rules

All of `docs/api.md` section 3 ("Common behaviour") applies: light DOM, no
shadow DOM, lowercase kebab-case attributes, boolean attributes present or
absent, generated text from the i18n dictionaries, re-render on
`uc:languagechange`, teacher-written children never discarded.

### 1.1 Where the data comes from

| Data | Source | Why |
| --- | --- | --- |
| Grading, summaries, materials, problems, links | **HTML** written by the teacher (lists with a few `data-*` attributes) | Appears on one page only. Readable without JavaScript. |
| Timetable, office hours | `course.js` (`schedule`, `team[].officeHours`) | Changes every year; shown on the schedule page, on team cards and possibly on the home page. |
| Exam and test details | `course.js` (`deadlines[]`: new `duration`, `location`, `shifts`) | Shared by `<uc-assessment-info>`, `<uc-event>`, `<uc-deadlines>`, `<uc-weeks>` and `<uc-this-week>`. |

HTML-first blocks *decorate* the teacher's list: they never rebuild it from
scratch, and they keep working when the list contains extra markup (links,
`<code>`, `<em>`, `<span>` descriptions).

Blocks that read only `course.js` render nothing without JavaScript. Their
documentation page shows a `<noscript>` with a link to a static version (for
example the SIGARRA timetable). That is plain HTML, not API.

### 1.2 Dates inside HTML-first blocks

- The date of an item is the **first `<time datetime="YYYY-MM-DD">`** inside
  it (not inside a nested list). `datetime` is required; a `<time>` without it
  is ignored.
- With JavaScript, the kit replaces the text of that `<time>` with the date
  formatted in the active language (the `datetime` is the source of truth), so
  bilingual sites need not write the date twice. The teacher's original text
  is kept in `data-uc-text` and is what shows without JavaScript.
- "Today" is `UC.today()`, so `?today=` and `UC_COURSE.today` work in demos
  and screenshots.

### 1.3 Choices saved in the browser

Every course on `www.dcc.fc.up.pt` shares one origin, so `localStorage` keys
include the course:

```
uc:<course>:<feature>[:<detail>]
```

`<course>` is `UC_COURSE.code` (e.g. `CC1007`); when there is no code, it is
the path of the folder that holds `course.js` (e.g. `/~fds/aulas/EDados/2526/`).

| Key | Value | Written by |
| --- | --- | --- |
| `uc:<course>:class:<type>` | class code, e.g. `PL2` | `<uc-timetable class-filter>` ("My class", one per schedule type) |
| `uc:<course>:solved:<problem-id>` | `"1"` | `<uc-problems track>` |

Existing keys (`uc:lang`, `uc:done:<path>:<id>`, `uc:weeks-page:<url>`) do not
change. Every read and write is wrapped in `try`/`catch` (private windows,
blocked storage), and the block works without storage, only forgetting the
choice. The helper is `UC.internal.storage` (section 7.2).

### 1.4 Accessibility (acceptance criterion of every PR)

WCAG 2.1 AA, checked by `scripts/check-a11y.mjs` (added by the accessibility
audit, PR #35) and `scripts/check-pages.mjs`:

| Criterion | Every block guarantees |
| --- | --- |
| 1.3.1 Info and relationships | Tables with `<caption>` and `<th scope>`; real lists; dates in `<time datetime>`; one heading per block (`heading` attribute), and the block is a `<section aria-labelledby>` when it has one. |
| 1.4.1 Use of colour | Every state and type is text ("Extra", "Hoje", "Novo", "Prevista"); colour only repeats it. |
| 1.4.3 / 1.4.11 Contrast | Existing tokens only; control borders reach 3:1. |
| 1.4.10 Reflow | Tables inside `.uc-table` (own scroll); list layouts below 760 px; no horizontal page scroll at 320 px. |
| 1.4.4 / 1.4.12 Text | No fixed heights on text; survives 200 % text and increased text spacing. |
| 2.1.1 Keyboard | Filters, search, calculator, sort buttons and checkboxes work with Tab, Enter, Space (and arrows for native `<select>`); no traps. |
| 2.4.3 / 2.4.7 Focus | Filtering never hides the focused element; focus ring is `--uc-focus-ring`. |
| 2.5.5 Target size | Interactive controls are at least `--uc-target-min` (44 px) tall, except inline links in running text. |
| 3.3.1 / 3.3.2 Forms | Inputs have a `<label>`; errors are text linked with `aria-describedby` and `aria-invalid`. |
| 4.1.3 Status messages | Result counts and calculator results are announced with `UC.internal.announce` (one polite live region per page). |

### 1.5 Size budget

`kit/v1/uc-kit.js` is 27 KB gzipped today. All blocks together must keep it
at **37 KB gzipped or less**. Phase 1 adds the check to `scripts/build.mjs`
(the build fails above the limit and prints the size).

### 1.6 Versioning

v1.0.0 is frozen without the blocks. The blocks ship as **v1.1.0**
(`kit/v1/` and `kit/v1.1.0/`). Each phase adds its lines to the "Unreleased"
section of `CHANGELOG.md`; phase 5 turns it into 1.1.0 once all blocks are in.

---

## 2. `course.js` additions

New rows for `docs/api.md` 2.2 (fields) and new sub-sections 2.7–2.9.
Sub-section numbers below are the ones they get in `docs/api.md` (2.4–2.6
extend existing tables), so they are not in numeric order here.

### 2.1 New top-level fields

| Field | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `schedule` | `ScheduleEntry[]` | no | `[]` | Weekly classes. See 2.7. Read by `<uc-timetable>`. |
| `scheduleTypes` | `{ [type]: LocalizedText }` | no | — | Labels for custom schedule types, or to rename built-in ones, e.g. `{ seminar: { pt: "Seminários", en: "Seminars" } }`. |
| `editions` | URL | no | — | Address of the shared editions file, relative to `course.js`, usually `"../editions.js"`. See 2.9. |

### 2.2 Types

| Type | Definition |
| --- | --- |
| `Weekday` | ISO weekday number: `1` = Monday … `7` = Sunday (as `semester.teachingDays`). |
| `Minutes` | A positive integer number of minutes, e.g. `120`. |

### 2.7 Schedule entry (`schedule[]`)

```js
schedule: [
  { type: "lecture", class: "T1", day: 2, start: "14:00", end: "15:00", room: "FC4 0.41" },
  { type: "lecture", class: "T1", day: 4, start: "14:00", end: "15:00", room: "FC4 0.41" },
  { type: "lab", class: "PL2", day: 2, start: "16:00", end: "18:00", room: "FC6 1.65" },
  { type: "lab", class: "PL7", day: 2, start: "16:00", end: "18:00", room: "FC6 0.08", staff: "Eduardo Marques" },
],
```

| Field | Type | Notes |
| --- | --- | --- |
| `type` | `"lecture"` \| `"lab"` \| `"tutorial"` \| string | Required. Built-in types are translated (Teóricas / Práticas laboratoriais / Teórico-práticas); any other string is a custom type, labelled by `scheduleTypes`, or shown as written. |
| `class` | string | Required. Class code, e.g. `"T1"`, `"PL2"`. |
| `day` | `Weekday` | Required. |
| `start`, `end` | `Time` | Required. |
| `room` | `HTMLText` | Optional. May be a link (room map). |
| `staff` | string \| string[] | Optional. Names as in `team[].name`. When missing, the teachers are the `team` members whose `classes` include `class`, so the data is not written twice. |
| `note` | `HTMLText` | Optional, e.g. "Só nas semanas ímpares". |

### 2.4 Team member: new field

| Field | Type | Notes |
| --- | --- | --- |
| `officeHours` | `OfficeHours[]` | Weekly office hours. Shown by `<uc-team>` and by `<uc-timetable type="office-hours">`. |

`OfficeHours`: `{ day: Weekday, start: Time, end: Time, room?: HTMLText, note?: HTMLText }`.
When `room` is missing, the member's `office` is used.

```js
team: [
  { name: "Fernando Silva", role: "coordinator", classes: ["T1", "T2"], office: "Gab. 1.25",
    officeHours: [
      { day: 2, start: "16:00", end: "18:00" },
      { day: 4, start: "16:30", end: "18:00", note: { pt: "Hora a confirmar" } },
    ] },
],
```

### 2.5 Deadline: new fields

| Field | Type | Notes |
| --- | --- | --- |
| `duration` | `Minutes` | Length of the assessment. With `time`, the end time is computed ("14:30–16:30"). |
| `location` | `HTMLText` | Rooms, links to room allocations (may use `data-auth`, section 5.2). |
| `shifts` | `Shift[]` | When the same assessment runs more than once. Replaces `time` for display; `time` stays the first shift's start for sorting. |

`Shift`: `{ time: Time, end?: Time, date?: ISODate, location?: HTMLText, note?: HTMLText }`.
`end` defaults to `time + duration`; `date` defaults to the deadline's `date`
(set it for assessments that run on two days); `location` defaults to the
deadline's `location`.

```js
{ id: "t1", title: { pt: "1.º teste", en: "Test 1" }, date: "2025-11-05", time: "14:30", kind: "assessment",
  duration: 120,
  location: { pt: "FC1 120, FC1 122 · <a href=\"evaluation/turnos_teste1.pdf\" data-auth>distribuição por salas</a>" },
  shifts: [{ time: "14:30" }, { time: "16:30" }],
  url: "test1.html" },
```

### 2.6 Platform: new field

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | Optional. Short identifier used by `<uc-problems>` (`data-judge="codeforces"`). When missing, `data-judge` is matched against `label`, ignoring case and accents. |

`platforms[]` entries may also set `hidden: true` to be known to
`<uc-problems>` without being listed in the navigation (e.g. a judge used by
a single problem series). Default `false`.

### 2.8 `UC_COURSE.updated` and `<uc-page updated>`

No change to the field. A page can override it, see 4.6.

### 2.9 Editions file (`editions.js`)

One file in the course folder, **above** the year folders, shared by every
edition:

```
EDados/
  editions.js      ← window.UC_EDITIONS
  2425/course.js   ← editions: "../editions.js"
  2526/course.js   ← editions: "../editions.js"
```

```js
window.UC_EDITIONS = [
  { label: "2025/26", href: "2526/" },        // first = current edition
  { label: "2024/25", href: "2425/" },
  { label: "2023/24", href: "https://www.dcc.fc.up.pt/~fds/aulas/EDados/2324/" },
];
```

| Field | Type | Notes |
| --- | --- | --- |
| `label` | string | Required. Compared with `UC_COURSE.edition` to find the edition of the current page. |
| `href` | URL | Required. Relative to `editions.js`. |

When `UC_COURSE.editions` is set, the kit loads that file with an injected
`<script>` (works from `file://`; a missing file only logs one warning). Then
`<uc-page>`:

- shows an "Other years" disclosure next to the edition in the header (a
  `<button aria-expanded>` with a list of links; Esc closes and returns focus);
- on an edition that is not the first of the list, shows a notice at the top
  of `<main>`: "Esta página é da edição 2024/25. Ver a edição atual (2025/26)."

Because the file lives outside the year folders, adding a new year updates the
older sites without editing them. Sites without `editions` are unchanged.

---

## 3. New components

Each sub-section is written in the format of `docs/api.md` section 3, so the
implementing phase copies it as is (the `check-docs` parser reads `#### \`<uc-x>\``
headings and their attribute tables). Every component also accepts:

| Attribute | Values | Default | Notes |
| --- | --- | --- | --- |
| `heading` | text \| `none` | localised, per component | Section heading (`<h2>`). With `none`, the block is labelled by `aria-label` with the same localised text. |

Teacher children that are not the decorated list (introductions, notes) are
kept, in order, below the generated content unless stated otherwise.

### 3.1 `<uc-timetable>` (section "3.4 People and timetable" of api.md)

Renders `UC_COURSE.schedule` and, for `office-hours`, the team's
`officeHours`.

```html
<uc-timetable class-filter></uc-timetable>
<uc-timetable type="office-hours" heading="Atendimento"></uc-timetable>
```

| Attribute | Values | Default | Notes |
| --- | --- | --- | --- |
| `view` | `table` \| `days` | `table` | `table`: one table per type. `days`: one group per weekday, all types mixed, in time order. |
| `type` | space-separated types | all types in `schedule`, then `office-hours` if any member has office hours | Built-in: `lecture`, `lab`, `tutorial`, `office-hours`; or a custom type. Order of tables: the order given here, else lecture, tutorial, lab, custom types (first appearance), office-hours. |
| `class-filter` | boolean | absent | One "My class" `<select>` per type that has two or more classes. The choice is saved (`uc:<course>:class:<type>`), shared by every `<uc-timetable>` of the course and announced. |
| `heading` | text \| `none` | localised "Horário" / "Timetable" | |

Rendering rules:

- **Table view.** Each table has a `<caption>` with the type's plural label
  ("Teóricas", "Práticas laboratoriais", "Atendimento"). Columns:
  Class (`<th scope="row">`), Day, Time, Room, Teacher, and Notes only when an
  entry of that type has a `note`. Office hours: Teacher (`<th scope="row">`),
  Day, Time, Room, Notes.
- **Merging.** Entries with the same type, class, start, end, room and staff
  become one row with the days joined ("3.ª e 5.ª"), as most lectures run twice
  a week. Rows are sorted by first day, then start time, then class code.
- **Days.** Shown abbreviated ("3.ª", "Tue") with the full name for screen
  readers (`<span aria-hidden="true">3.ª</span><span class="uc-visually-hidden">terça-feira</span>`).
  Times are `<time>` elements ("14:00–15:00").
- **Teachers** are links when the member has a `url`.
- **Days view.** One `<h3>` per weekday that has entries (Monday first), with a
  list: "14:00–15:00 · T1 · Teórica · FC4 0.41 · Fernando Silva".
- **Filter.** Choosing a class hides the other rows of that type (days view:
  the other items of that type); "Todas" shows all. Office hours are never
  filtered. The announcement reads "A mostrar a turma PL2". The filter bar is
  `UC.internal.filterBar` (7.2).
- Empty `schedule` and no office hours: the element is hidden, like
  `<uc-team>` with no members.

Stable classes: `uc-timetable`, `uc-timetable__filters`, `uc-timetable__table`,
`uc-timetable__day`, `uc-timetable__item`, `uc-timetable__time`,
`uc-timetable__note`.

### 3.2 `<uc-grading>` (section "3.6 Assessment" of api.md)

Decorates the teacher's list of grade components: a proportions bar, a table
of weights and minimums, a generated formula and, optionally, a grade
calculator. The weight is written once, in a `<data>` element that is visible
without JavaScript and read by the component.

```html
<uc-grading scale="20" pass="9.5" calculator>
  <ul>
    <li data-code="E" data-scale="14" data-min="4.9"><data value="14">14 valores</data> Exame final.
      <span>Teórico-prático, sem consulta.</span></li>
    <li data-code="AP"><data value="5">5 valores</data> Avaliações práticas</li>
    <li data-code="P"><data value="1">1 valor</data> Exercícios das aulas práticas</li>
  </ul>
</uc-grading>
```

| Attribute | Values | Default | Notes |
| --- | --- | --- | --- |
| `scale` | number | `20` | Scale of the final grade. |
| `pass` | number | absent | Pass mark, on `scale`. Used by the calculator. |
| `calculator` | boolean | absent | Adds the grade simulation. |
| `no-formula` | boolean | absent | Hides the generated formula. |
| `heading` | text \| `none` | localised "Como é calculada a nota" / "How the grade is calculated" | |

Item attributes (on the `<li>` of the first `<ul>`/`<ol>` child):

| Attribute | Values | Notes |
| --- | --- | --- |
| `data-code` | text | Required for the formula and calculator, e.g. `E`, `AP`, `T1`. Letters, digits, `_`. |
| `data-scale` | number | Scale in which this component is graded. Default: the `scale` of the element (for sub-components: the parent's). |
| `data-min` | number | Minimum on this component's own scale ("4,9 em 14"). |
| `data-bonus` | number \| `N%` | Marks a bonus item: not part of the weights; adds up to this many points on the final scale (`2`) or this percentage of it (`10%`). The final grade is capped at `scale`. |

- **Weights.** The value of the item's `<data value>` (a number; a trailing `%`
  and a decimal comma are accepted). Weights are **normalised** among siblings,
  so `0.1/0.2/0.2/0.5` (IP), `14/5/1` (EDados) and `25%/50%/25%` (PC) all work.
  A bonus item needs no `<data>`.
- **Sub-components.** A `<ul>`/`<ol>` inside an item lists its parts; their
  weights are relative to the parent (PC: contests 30/30/40 inside CE 50 %).
  The parent's grade is the weighted mean of its parts, on the parent's scale.
- **Rendering.** The teacher's list is kept but hidden (`hidden`), and the
  component renders, in order: the formula, the proportions bar
  (`aria-hidden="true"`, one segment per top-level component, labelled with
  its code), and a table (visually hidden caption "Componentes da nota").
  Table columns: Component (`<th scope="row">`: code and a copy of the item's
  content without the `<data>` and the nested list), Weight (the teacher's
  `<data>` text plus the normalised share, "14 valores · 70 %"), Minimum
  ("4,9 em 14", or "—"). Sub-components are indented rows whose share reads
  "15 % (30 % de CE)". Bonus rows read "Bónus · até 2 valores".
- **Formula.** Coefficients are computed on each component's own scale and a
  coefficient of 1 is omitted: EDados gives "Nota = E + AP + P", IP gives
  "Nota = 0,1 × A + 0,2 × T1 + 0,2 × T2 + 0,5 × E". Decimal separator and
  "×" follow the active language. Bonus items are added as "+ B".
- **Calculator** (`calculator`). A `<fieldset>` with `<legend>` "Simular a
  nota"; one `<input inputmode="decimal">` per leaf component and per bonus
  item, labelled "E: Exame final (0 a 14)"; comma or dot accepted. Invalid
  values ("21", "abc") show an error linked by `aria-describedby` and set
  `aria-invalid`; the result is not computed. The result is an `<output>`
  ("Nota final: 12,4 valores") followed by a state line: "Aprovado nesta
  simulação", "Abaixo do mínimo em E (4,9 em 14)" or "Abaixo de 9,5". The
  pass comparison uses the unrounded grade. It is announced once, 300 ms
  after typing stops. A fixed note says "Simulação. A nota oficial é a
  publicada no SIGARRA." (an i18n string, so a site can change it). Nothing
  is saved.
- Without JavaScript: the teacher's list with the weights as written.

Stable classes: `uc-grading`, `uc-grading__formula`, `uc-grading__bar`,
`uc-grading__segment`, `uc-grading__table`, `uc-grading__sub`,
`uc-grading__calculator`, `uc-grading__result`, `uc-grading__status`.
Local token: `--uc-grading-bar-height`.

### 3.3 `<uc-assessment-info>` (section "3.6 Assessment" of api.md)

A summary card at the top of an exam or test page, from a configured
deadline. The rest of the page (rules, syllabus, past exams) is free HTML
inside the element, kept below the card.

```html
<uc-assessment-info deadline="t1" calendar>
  <h2>Regras</h2> …
  <h2>Exames anteriores</h2>
  <ul class="uc-links"><li><a href="…" data-auth>Exame 2024/25</a></li></ul>
</uc-assessment-info>
```

| Attribute | Values | Default | Notes |
| --- | --- | --- | --- |
| `deadline` | deadline id | required | Date, time, duration, location, shifts, note and links come from it. |
| `calendar` | boolean | absent | "Adicionar ao calendário (.ics)" button; the file is generated in the browser. |
| `heading` | text \| `none` | the deadline's `title` | |

- **Card.** A `<dl>` with the rows that have data, in this order: Date (long
  format with weekday, "quarta-feira, 5 de novembro de 2025"; a month-only or
  `null` date reads "Por marcar"), Time ("14:30–16:30") or Shifts (a list:
  "14:30–16:30 · FC1 120", with each shift's note), Duration ("2 h",
  "1 h 45 min"), Location, Status, Links (the deadline's `url` is not repeated
  when it points to the current page; `links` are). The deadline's `note` goes
  below the `<dl>`.
- **Status** (text, with the tag colours of `<uc-deadlines>`): "Daqui a 5
  dias", "Amanhã", "Hoje", "A decorrer" (between start and end of a multi-day
  deadline), "Realizado", "Por marcar".
- **Calendar.** `<button>` whose name says what it downloads ("Adicionar ao
  calendário, ficheiro .ics"). Generates `<code>-<id>.ics` (RFC 5545):
  one `VEVENT` per shift (or one), `TZID=Europe/Lisbon` with its `VTIMEZONE`,
  `LOCATION` from the plain text of `location`, `URL` of the page; a deadline
  without time becomes an all-day event; hidden when the date is not a full
  day.
- **Unknown id.** One console warning; the card is not rendered and the
  children are kept (as `<uc-event>`).
- Without JavaScript: only the children. The documentation recommends a
  `<noscript>` with the date on exam pages.

Stable classes: `uc-assessment-info`, `uc-assessment-info__card`,
`uc-assessment-info__status`, `uc-assessment-info__shifts`,
`uc-assessment-info__calendar`.

### 3.4 `<uc-summaries>` (section "3.3 Weekly calendar" of api.md)

Decorates the numbered list of lecture summaries: date with weekday, link to
the matching week, breaks inserted from `semester.breaks`, states and search.

```html
<uc-summaries search>
  <ol>
    <li><time datetime="2025-09-16">16 set</time> <strong>Apresentação; Introdução ao Java</strong>
      <p>Considerações gerais sobre o programa…</p></li>
  </ol>
</uc-summaries>
```

| Attribute | Values | Default | Notes |
| --- | --- | --- | --- |
| `search` | boolean | absent | Search field: ignores case and accents, highlights matches with `<mark>`, announces "5 de 24 sumários". Esc clears it. |
| `order` | `asc` \| `desc` | `asc` | `desc` shows the most recent lecture first (numbers stay). |
| `no-breaks` | boolean | absent | Do not insert breaks. |
| `no-weeks` | boolean | absent | Do not link items to their week ("Semana 7" → `weeks` page `#week-7`). |
| `heading` | text \| `none` | localised "Sumários" / "Lecture summaries" | |

- **Items.** The first `<ol>`/`<ul>` child. Each item's date is its first
  `<time datetime>` (1.2), shown with the weekday ("terça-feira, 16 set").
  Items keep their number: the component sets `value` on each `<li>` from its
  original position, so inserted breaks and `order="desc"` do not renumber.
- **Week link.** "Semana 7", a link to the `weeks` page (`pages`) with
  `#week-7`, from `UC.weekOf(date)`. No link when there is no `weeks` page or
  the date is outside the semester.
- **Breaks.** Between two items that straddle a break, an item without number
  (`class="uc-summaries__break"`) with text: "Interrupção: Semana de estudo
  (27 a 31 out)". Hidden while searching.
- **States** (text tags): the last item dated today or earlier gets "Última
  aula"; items dated after today get "Prevista" and are dimmed. The same list
  therefore serves as a per-lecture plan (IP's T01–T23).
- **Search** (`search`): `<input type="search">` with a visible `<label>`
  "Pesquisar nos sumários"; filtering keeps focus in the field; only items
  visible in the active language are counted; with no match, a "Nenhum
  sumário encontrado" line.
- Items without a `<time>` are shown as written, without week or state.
- Without JavaScript: the teacher's list with its dates and texts.

Stable classes: `uc-summaries`, `uc-summaries__search`, `uc-summaries__item`,
`uc-summaries__date`, `uc-summaries__week`, `uc-summaries__state`,
`uc-summaries__break`, `uc-summaries__empty`.

### 3.5 `<uc-materials>` (section "3.7 Materials and problems" of api.md)

Decorates the list of materials per lecture or chapter: one button per link
with its recognised type, the date of the last update and a "Novo" tag.

```html
<uc-materials new-days="7">
  <ol>
    <li><time datetime="2025-11-18">18 nov</time> Árvores binárias
      <a href="slides/7_arvores.pdf">Slides</a> <a href="codigo/arvores/">Código</a></li>
    <li>Revisões para o 1.º teste</li>
  </ol>
</uc-materials>
```

| Attribute | Values | Default | Notes |
| --- | --- | --- | --- |
| `new-days` | number | `7` | Items updated fewer days ago (and not in the future) get "Novo". `0` disables. |
| `heading` | text \| `none` | localised "Materiais" / "Materials" | |

- **Items.** First `<ol>`/`<ul>` child. The first `<time datetime>` is the last
  update, shown as "Atualizado a 18 nov". The item's text before the first
  link is its title.
- **Links** become buttons (`uc-button uc-button--sm`) with a decorative type
  icon. The type is recognised from the URL; `data-type` on the `<a>`
  overrides it:

  | Type | Recognised from |
  | --- | --- |
  | `pdf` | `.pdf` |
  | `notebook` | `.ipynb`, `colab.research.google.com` |
  | `github` | `github.com`, `gitlab.com` |
  | `video` | `youtube.com`, `youtu.be`, `vimeo.com`, `.mp4` |
  | `archive` | `.zip`, `.tar.gz`, `.tgz` |
  | `code` | `.java`, `.py`, `.c`, `.cpp`, `.h`, `.hs`, `.ml`, `.js` |
  | `slides` | only with `data-type` |
  | `link` | anything else |

  The type is part of the accessible name, after the visible text ("Slides,
  PDF"), through a visually hidden span, so the visible label stays in the
  name (2.5.3).
- **No links**: the item shows "Sem material" (muted text), as IP's revision
  lectures.
- **Languages.** Links or items with `lang` follow the in-place language rule
  (`docs/api.md` section 6), so PT and EN slides can live in one list.
- Without JavaScript: the list with normal links.

Stable classes: `uc-materials`, `uc-materials__item`, `uc-materials__title`,
`uc-materials__updated`, `uc-materials__links`, `uc-materials__link`,
`uc-materials__empty`. The `data-type` attribute is kept on each link
(computed or given), so `theme.css` can style a type:
`.uc-materials__link[data-type="notebook"]`.

### 3.6 `<uc-problems>` (section "3.7 Materials and problems" of api.md)

Decorates problem lists grouped in series: judge tag, type, series deadline,
filters and, optionally, a "Solved" checkbox saved in the browser.

```html
<uc-problems filters track>
  <section data-deadline="ps01">
    <h2>Série 1 · Introdução</h2>
    <ul>
      <li data-judge="mooshak"><a href="problems/pc001.html">Increasing Array</a> <code>PC001</code></li>
      <li data-judge="codeforces" data-type="extra"><a href="https://codeforces.com/…">Lecture</a> <code>499B</code></li>
    </ul>
  </section>
</uc-problems>
```

| Attribute | Values | Default | Notes |
| --- | --- | --- | --- |
| `filters` | boolean | absent | Filter buttons by type and by judge (`aria-pressed`), shown only for values that occur. |
| `track` | boolean | absent | "Resolvido" checkbox on each problem and "3 de 5 resolvidos" in each series, saved in `localStorage`. |
| `heading` | text \| `none` | `none` | Problem pages usually have their own `<h1>`; set a text to add an `<h2>`. |

Structure: the series are the `<section>` children, each with a heading and a
list; a single list without sections is one unnamed series.

Item and series attributes:

| Attribute | On | Values | Notes |
| --- | --- | --- | --- |
| `data-judge` | `<li>` | platform `id` or label | Judge tag with the platform's label ("Codeforces"). Unknown values are shown as written. |
| `data-type` | `<li>` | `main` \| `extra` \| `challenge` | Default `main` (no tag). "Extra" and "Desafio" are text tags. |
| `data-id` | `<li>` | text | Identifier for `track`. Default: `<judge>:<text of the first <code>>`, else the link's resolved URL. |
| `data-deadline` | `<section>` | deadline id | Shows the deadline's date and status ("Prazo: 12 out, 23:59 · Concluído") under the series heading. |

- An optional `<data value>` in an item is its weight and is shown as a tag
  ("40 %").
- **Filters.** Two `role="group"` groups with names "Tipo" and "Juiz", each
  with "Todos" plus one button per value. Groups combine with AND. Series
  with no visible problem are hidden. The count is announced ("7 de 23
  problemas"). Focus stays on the pressed button, which is never hidden.
- **Track.** `<input type="checkbox">` labelled "Resolvido" with the
  problem's name in the accessible name ("Resolvido: Increasing Array").
  The key is `uc:<course>:solved:<id>`, so the same problem shares its state
  across pages. Changing it fires a bubbling `uc:problemchange` event and
  updates the series count ("3 de 5 resolvidos", not live; the checkbox
  state is announced by the screen reader itself).
- Without JavaScript: the teacher's sections, headings and lists.

Stable classes: `uc-problems`, `uc-problems__filters`, `uc-problems__series`,
`uc-problems__deadline`, `uc-problems__progress`, `uc-problems__item`,
`uc-problems__judge`, `uc-problems__type`, `uc-problems__solved`.

---

## 4. Changes to existing components

### 4.1 `<uc-weeks view="compact">`

New attribute:

| Attribute | Values | Default |
| --- | --- | --- |
| `view` | `full` \| `compact` | `full` |

`compact` renders the same `<uc-week>` children as one table (caption
"Planeamento das semanas", visually hidden): columns Week (`<th scope="row">`,
"1"), Dates ("16–19 set"), Topic (the week's title, a link when the week has
`href`; the week's deadlines as small lines below unless `no-deadlines`),
Status ("Dada", "Esta semana", "Prevista"). Breaks are rows with a cell
spanning all columns. The `<uc-week>` elements stay in the DOM, hidden, so
`<uc-this-week>` can still read the page. The "Go to this week" link is
replaced by highlighting the current row (`aria-current="date"` on it) and
its status text.

Per-lecture plans (two lectures per week) use `<uc-summaries>` with future
dates instead.

### 4.2 `<uc-week href>`

| Attribute | Values | Notes |
| --- | --- | --- |
| `href` | URL | Page of that week's class (PC's `week06.html`). Relative to the page. In the full view, a "Página da aula" link is added as the first line of the body (links are not allowed inside `<summary>`); in the compact view, the title links to it. |

### 4.3 `<uc-team>` office hours

Cards show "Atendimento" with one line per entry ("3.ª 16:00–18:00 · Gab.
1.25"), using the abbreviated-day pattern of 3.1. The table view adds an
"Atendimento" column only when some member has `officeHours`. No new
attribute.

### 4.4 `<uc-event>` and `<uc-deadlines>`: duration, location, shifts

- `<uc-event>`: the note line gains the times ("14:30 e 16:30" for shifts,
  "14:30–16:30" with `duration`) and the location; the event's own `note`
  follows.
- `<uc-deadlines view="table">`: the Time column shows the range or the
  shifts; Information shows `location` before `note`.
- `<uc-deadlines>` list view and `<uc-this-week>`: the time at the start of
  the note line becomes "14:30 e 16:30" for shifts; location is not added
  (they are short lists).

### 4.5 `<uc-page>`: editions

See 2.9. New stable classes: `uc-page__editions`, `uc-page__editions-menu`,
`uc-page__edition-notice`.

### 4.6 `<uc-page updated>`

| Attribute | Values | Default | Notes |
| --- | --- | --- | --- |
| `updated` | `ISODate` \| `auto` | `UC_COURSE.updated` | Date shown in the footer for this page. `auto` uses `document.lastModified`, but only when the server sent `Last-Modified` (detected as a value more than 5 s before the page started loading, since browsers report "now" otherwise) or the page is opened from `file://`; otherwise the footer shows no date. |

---

## 5. CSS building blocks and page-wide enhancements

New rows for `docs/api.md` section 4.

### 5.1 `uc-links--grid`

| Class | Use |
| --- | --- |
| `uc-links--grid` | Variant of `uc-links` in columns, for long lists (PC's judges and courses). Column width from `--uc-links-min` (default `260px`). Group several lists with `<h3>` headings as usual. |

### 5.2 `a[data-auth]`

| Selector | Use |
| --- | --- |
| `a[data-auth]` | Link that needs a U.Porto login. The kit adds a decorative lock icon (`aria-hidden="true"`) after the text and a visually hidden "(requer autenticação)"; with a value, it names the system: `data-auth="SIGARRA"` → "(requer autenticação: SIGARRA)". Works anywhere: page HTML, `HTMLText` from `course.js`, and inside components. |

Implemented in `kit/src/core/auth-links.js`, like `copy-blocks.js`. It runs on
`uc:ready`, after every component render (`UC.Element` calls
`UC.internal.enhance(root)`) and on `uc:languagechange` (the hidden text is
replaced, never duplicated). Without JavaScript the link is a normal link; the
kit CSS adds no icon then, to avoid an icon with no text alternative.

Stable classes: `uc-auth-icon`, `uc-auth-label`. This replaces the
hand-drawn locks of `examples/edados-2526/avaliacao.html` (phase 6).

### 5.3 `table[data-sortable]`

| Selector | Use |
| --- | --- |
| `table[data-sortable]` | Inside `.uc-table`. Header cells of the `<thead>` become `<button>`s; the sorted column has `aria-sort`. `data-sort-default="asc"`/`"desc"` on a `<th>` sorts on load; `data-no-sort` on a `<th>` excludes a column. |

- A cell's sort value is its `data-sort` attribute, else its `<time
  datetime>`, else its text. Numbers (decimal comma or dot, optional `%`) and
  ISO dates sort numerically; text with `Intl.Collator` in the active
  language, numeric-aware ("PL2" before "PL10").
- Sorting moves `<tr>`s inside the first `<tbody>`; rows with
  `data-sort-fixed` (totals) stay last.
- The change is announced: "Ordenado por Pontos, decrescente".
- Without JavaScript: the table in its written order.

Implemented in `kit/src/core/sortable-tables.js`. Stable class:
`uc-sort-button`.

### 5.4 Link checker (maintainers, not teachers)

`scripts/check-links.mjs` checks the external links of `examples/` and
`template/` (and of `docs/`, which reuses the same list). It runs weekly in
GitHub Actions (`.github/workflows/links.yml`, Mondays 06:00 UTC, plus manual
`workflow_dispatch`), never on pull requests, and opens or updates one issue
labelled `broken-links` with the list. It skips `a[data-auth]` (they answer
with a login page), `evaluation/` paths and `mailto:`; requests to one host
are spaced one per second (the DCC server blocks bursts). Teachers, who have
no npm, are pointed to the W3C Link Checker on the "Publicar" page.

---

## 6. Tokens

No new colour. States use the existing `--uc-color-success-*`,
`--uc-color-warning-*`, `--uc-color-accent-soft` and `--uc-color-text-muted`.

New **local** tokens (read with a fallback, not defined on `:root`):

| Token | Fallback | Use |
| --- | --- | --- |
| `--uc-timetable-time-width` | `7.5rem` | Time column of `<uc-timetable>` (days view). |
| `--uc-summaries-date-width` | `9rem` | Date column of `<uc-summaries>` on wide screens. |
| `--uc-grading-bar-height` | `12px` | Height of the proportions bar. |
| `--uc-links-min` | `260px` | Column width of `uc-links--grid`. |

---

## 7. JavaScript API and internals

### 7.1 Public (`docs/api.md` section 7)

| Member | Description |
| --- | --- |
| `UC.formatTime(time, end?)` | "14:00" or "14:00–15:00" in the active language (24-hour in both PT and EN). |
| `UC.formatDuration(minutes)` | "2 h", "1 h 45 min", "45 min". |
| `UC.weekdayName(day, format?)` | `Weekday` → "terça-feira" (`long`) or "3.ª" / "Tue" (`short`, default). |

| Event | When |
| --- | --- |
| `uc:problemchange` | Bubbles from `<uc-problems>` when a problem is marked solved or not. `event.detail = { id, solved }`. |
| `uc:classchange` | On `document`, when "My class" changes. `event.detail = { type, class }` (`class` is `""` for all). |

### 7.2 Internal helpers (phase 1; `UC.internal`, not public API)

| Helper | Description |
| --- | --- |
| `announce(text)` | One `aria-live="polite"` region per page (`role="status"`, visually hidden), debounced 300 ms; clears then sets the text so repeats are read. `copy-blocks.js` and `uc-code` switch to it. |
| `filterBar({ label, groups, onChange })` | Builds the filter bar: each group is either buttons (`aria-pressed`, inside `role="group"` with `aria-label`) or a `<select>` with a visible `<label>`. Returns `{ element, value(), set(groupId, value) }`. Used by `<uc-timetable>`, `<uc-problems>`. Same look everywhere (`uc-filters`, `uc-filters__group`, `uc-filters__button`). |
| `storage` | `get(feature, detail)`, `set(feature, detail, value)`, `remove(…)` with the key of 1.3, all failure-safe. |
| `courseKey()` | The `<course>` part of 1.3. |
| `firstTime(element)` | The first `<time datetime>` of an item (not inside a nested list) as `{ element, date }`, or `null`. |
| `localiseTime(timeElement, format)` | Keeps the original text in `data-uc-text` and writes the formatted date (1.2). |
| `normalise(text)` | Lowercase, accents removed (search and judge matching). |
| `enhance(root)` | Runs page-wide enhancements (auth links, sortable tables, scrollable tables) on newly rendered content. |
| `deadlineStatus(deadline)` | Existing status logic of `<uc-deadlines>` exposed for `<uc-assessment-info>` and `<uc-problems>`. |

PR #36 (kit fixes, merged) added `UC.internal.resolveCourseLinks`, `UC.formatDateRange`
and the runner `supports()`; the new blocks use them instead of new code.

---

## 8. Interface strings

New keys in `kit/src/i18n/pt.js` and `en.js`. Placeholders in braces.

| Key | pt | en |
| --- | --- | --- |
| `a11y.requiresLoginAt` | Requer autenticação: {system} | Requires login: {system} |
| `common.all` | Todas | All |
| `common.showing` | {shown} de {total} | {shown} of {total} |
| `weekdays.long` | segunda-feira … domingo (array of 7) | Monday … Sunday |
| `weekdays.short` | 2.ª, 3.ª, 4.ª, 5.ª, 6.ª, sáb., dom. | Mon … Sun |
| `duration.hours` / `.minutes` / `.both` | {h} h / {m} min / {h} h {m} min | same |
| `timetable.heading` | Horário | Timetable |
| `timetable.type.lecture` / `.lab` / `.tutorial` / `.officeHours` | Teóricas / Práticas laboratoriais / Teórico-práticas / Atendimento | Lectures / Labs / Tutorials / Office hours |
| `timetable.column.class` / `.day` / `.time` / `.room` / `.staff` / `.notes` | Turma / Dia / Hora / Sala / Docente / Notas | Class / Day / Time / Room / Teacher / Notes |
| `timetable.myClass` | A minha turma ({type}) | My class ({type}) |
| `timetable.showing` | A mostrar a turma {class} | Showing class {class} |
| `team.officeHours` | Atendimento | Office hours |
| `grading.heading` | Como é calculada a nota | How the grade is calculated |
| `grading.caption` | Componentes da nota | Grade components |
| `grading.column.component` / `.weight` / `.minimum` | Componente / Peso / Mínimo | Component / Weight / Minimum |
| `grading.formula` | Nota | Grade |
| `grading.minimumOf` | {min} em {scale} | {min} out of {scale} |
| `grading.shareOf` | {share} de {parent} | {share} of {parent} |
| `grading.bonus` | Bónus · até {max} | Bonus · up to {max} |
| `grading.points` | {n} valores | {n} points |
| `grading.calculator.legend` | Simular a nota | Simulate your grade |
| `grading.calculator.field` | {code}: {name} (0 a {scale}) | {code}: {name} (0 to {scale}) |
| `grading.calculator.invalid` | Escreve um número entre 0 e {scale}. | Enter a number between 0 and {scale}. |
| `grading.calculator.result` | Nota final: {grade} valores | Final grade: {grade} |
| `grading.calculator.incomplete` | Preenche todas as componentes para ver a nota. | Fill in every component to see the grade. |
| `grading.calculator.pass` | Aprovado nesta simulação | Pass in this simulation |
| `grading.calculator.belowMin` | Abaixo do mínimo em {code} ({min} em {scale}) | Below the minimum in {code} ({min} out of {scale}) |
| `grading.calculator.belowPass` | Abaixo de {pass} | Below {pass} |
| `grading.calculator.disclaimer` | Simulação. A nota oficial é a publicada no SIGARRA. | Simulation only. The official grade is the one published on SIGARRA. |
| `assessment.date` / `.time` / `.shifts` / `.duration` / `.location` / `.status` / `.links` | Data / Hora / Turnos / Duração / Local / Estado / Ligações | Date / Time / Shifts / Duration / Location / Status / Links |
| `assessment.inDays` | Daqui a {count} dias | In {count} days |
| `assessment.tomorrow` / `.today` / `.ongoing` / `.done` | Amanhã / Hoje / A decorrer / Realizado | Tomorrow / Today / In progress / Done |
| `assessment.calendar` | Adicionar ao calendário | Add to calendar |
| `assessment.calendarFile` | ficheiro .ics | .ics file |
| `summaries.heading` | Sumários | Lecture summaries |
| `summaries.search` | Pesquisar nos sumários | Search the summaries |
| `summaries.count` | {shown} de {total} sumários | {shown} of {total} summaries |
| `summaries.none` | Nenhum sumário encontrado. | No summary found. |
| `summaries.week` | Semana {n} | Week {n} |
| `summaries.last` / `.planned` | Última aula / Prevista | Latest lecture / Planned |
| `summaries.break` | Interrupção: {label} ({dates}) | Break: {label} ({dates}) |
| `materials.heading` | Materiais | Materials |
| `materials.updated` | Atualizado a {date} | Updated {date} |
| `materials.new` | Novo | New |
| `materials.none` | Sem material | No material |
| `materials.type.pdf` / `.notebook` / `.github` / `.video` / `.archive` / `.code` / `.slides` / `.link` | PDF / notebook / GitHub / vídeo / arquivo / código / diapositivos / ligação | PDF / notebook / GitHub / video / archive / code / slides / link |
| `problems.filters` | Filtrar problemas | Filter problems |
| `problems.type` / `.judge` | Tipo / Juiz | Type / Judge |
| `problems.type.main` / `.extra` / `.challenge` | Principal / Extra / Desafio | Main / Extra / Challenge |
| `problems.count` | {shown} de {total} problemas | {shown} of {total} problems |
| `problems.deadline` | Prazo: {date} | Due: {date} |
| `problems.solved` | Resolvido | Solved |
| `problems.solvedNamed` | Resolvido: {name} | Solved: {name} |
| `problems.progress` | {done} de {total} resolvidos | {done} of {total} solved |
| `weeks.compactCaption` | Planeamento das semanas | Weekly plan |
| `weeks.column.week` / `.dates` / `.topic` / `.status` | Semana / Datas / Tema / Estado | Week / Dates / Topic / Status |
| `weeks.status.done` / `.current` / `.planned` | Dada / Esta semana / Prevista | Done / This week / Planned |
| `weeks.classPage` | Página da aula | Class page |
| `editions.other` | Outros anos | Other years |
| `editions.notice` | Esta página é da edição {edition}. | This page is from the {edition} edition. |
| `editions.current` | Ver a edição atual ({edition}) | See the current edition ({edition}) |
| `sort.button` | Ordenar por {column} | Sort by {column} |
| `sort.announce` | Ordenado por {column}, {direction} | Sorted by {column}, {direction} |
| `sort.asc` / `.desc` | crescente / decrescente | ascending / descending |

---

## 9. Demo and test data

### 9.1 `docs/demos/course.js` (fictional "Algoritmos e Programação", today 27 Nov 2025)

Additions (phases add only the part they need):

```js
// Phase 1
schedule: [
  { type: "lecture", class: "T1", day: 1, start: "10:00", end: "11:30", room: "Anf. 1" },
  { type: "lecture", class: "T1", day: 3, start: "10:00", end: "11:30", room: "Anf. 1" },
  { type: "lecture", class: "T2", day: 2, start: "14:00", end: "15:30", room: "Anf. 2" },
  { type: "lecture", class: "T2", day: 4, start: "14:00", end: "15:30", room: "Anf. 2" },
  { type: "tutorial", class: "TP1", day: 5, start: "09:00", end: "10:30", room: "Sala 1.12" },
  { type: "lab", class: "PL1", day: 2, start: "16:00", end: "18:00", room: "Lab 1" },
  { type: "lab", class: "PL2", day: 3, start: "14:00", end: "16:00", room: "Lab 2" },
  { type: "lab", class: "PL3", day: 4, start: "16:00", end: "18:00", room: "Lab 1" },
  { type: "lab", class: "PL4", day: 5, start: "11:00", end: "13:00", room: "Lab 2", note: { pt: "Só nas semanas ímpares", en: "Odd weeks only" } },
],
// team: add officeHours to Ana Ribeiro and Bruno Matos
//   Ana:   [{ day: 2, start: "11:00", end: "12:30" }]
//   Bruno: [{ day: 4, start: "16:00", end: "17:00", room: "Sala 1.12", note: { pt: "Marcar por email", en: "Book by email" } }]

// Phase 2: on the existing deadline "teste"
duration: 105,
location: { pt: "Laboratórios 1 e 2 · <a href=\"#\" data-auth>distribuição por salas</a>", en: "Labs 1 and 2 · <a href=\"#\" data-auth>room allocation</a>" },
shifts: [{ time: "14:00" }, { time: "16:00", location: { pt: "Laboratório 1", en: "Lab 1" } }],

// Phase 4: platform ids, plus a hidden judge for one problem series
platforms: [
  { id: "entregas", label: "Plataforma de entregas", url: "https://example.org/entregas" },
  { id: "forum", label: "Fórum da UC", url: "https://example.org/forum" },
  { id: "codeforces", label: "Codeforces", url: "https://codeforces.com", hidden: true },
],
// and two problem-series deadlines:
// { id: "ps1", title: "Série 1", date: "2025-10-10", time: "23:59", kind: "submission" },
// { id: "ps2", title: "Série 2", date: "2025-12-05", time: "23:59", kind: "submission" },
```

The demo HTML of each block (in `docs/demos/uc-x/`) uses the same course:
grading 10 % quizzes (`Q`) + 30 % project (`T`, sub-items T1/T2 40/60) + 60 %
exam (`E`, min 8) with a bonus of 1 point; 12 summaries across the study week
with the last two in the future; 8 materials (PDF, notebook, GitHub, video,
zip, one without material, one PT/EN pair, one updated on 24 Nov → "Novo");
two problem series (6 problems, two judges, one extra, one challenge).

### 9.2 `tests/pages/course.js` (EDados-like, `CC1007`)

Test pages exercise edge cases, not looks:

| Block | Cases |
| --- | --- |
| `uc-timetable` | merged rows (T1 Tue+Thu), `staff` from `team.classes`, explicit `staff` array, custom type with and without `scheduleTypes`, office hours with fallback `office`, filter persistence across two instances, empty schedule (hidden). |
| `uc-grading` | weights 14/5/1 with `data-scale`; 0.1/0.2/0.2/0.5; percentages with sub-items and `data-bonus="10%"`; calculator inputs "21", "abc", "12,5", "", bonus cap at `scale`. |
| `uc-assessment-info` | full day with shifts on two dates; month-only date; `null` date; unknown id; `heading="none"`; `.ics` text (fixed with `?today=`). |
| `uc-summaries` | two breaks after the same item; item without `<time>`; `order="desc"`; PT/EN items; `?today=` before, during and after the semester. |
| `uc-materials` | each URL type; `data-type` override; no links; future date (no "Novo"). |
| `uc-problems` | single list without sections; unknown judge; label match without `id`; hidden focused item while filtering; two pages sharing a problem id. |
| `uc-weeks view="compact"` | three `?today=` values; week with `href`; deadline in a break. |
| extras | `data-auth` with and without value, inside `HTMLText`; sortable numbers with comma, dates, `data-sort-fixed`; `updated="auto"` over `file://` and HTTP. |

---

## 10. Where each course uses each block

Phase 6 applies the blocks in this order: EDados first (its example is ours),
then PI, IP and PC once their migrations are merged (the migration threads own
`examples/pi*`, `ip*`, `pc*`).

| Block | EDados (`examples/edados-2526`) | PI | IP | PC |
| --- | --- | --- | --- | --- |
| `uc-timetable` | `horarios.html`: T1/T2 cards, PL table, office hours (fix "61:30") | Schedule, EN and PT | Optional: teachers per class only | — |
| `uc-team` office hours | `horarios.html` | Two teachers | — | — |
| `uc-grading` | `avaliacao.html` (14/5/1, minimums 4.9 and 9.5) | Assessment in the course description (5 % + 2×25 % + exam) | `evaluation.html` (0.1/0.2/0.2/0.5, test improvement) | `evaluation.html` (SI/CE/PDC, sub-items, bonus +10 %) |
| `uc-assessment-info` | practical tests 1 and 2 | practical tests 1 and 2 | `exam.html`, `test1.html`, `test2.html` (shifts 14:30/16:30, 2 h, rooms) | `contest1.html` |
| `uc-summaries` | summaries (24, one break) | summaries EN and PT (3 breaks) | planned lectures T01–T23 ("Prevista") | — |
| `uc-materials` | `materiais.html` (10 chapters with last change) | PDF slides EN and PT | 23 Colab notebooks, revision lectures without material | — (external material goes to `uc-links--grid`) |
| `uc-problems` | `problemas/` index (65 problems) | Mooshak problem list | main/extra/challenge problems in the guides | `problems.html` and series (4 judges, extras) |
| `uc-weeks view="compact"` | optional | lab calendar per week | planned labs | planned classes with contests and breaks, `href` to `weekNN.html` |
| `uc-links--grid` | links | links | support material, other courses | judges, material, similar courses |
| `a[data-auth]` | grade sheets and attendance PDFs | Mooshak statistics | grades, rooms, past exam | rankings |
| `table[data-sortable]` | — | — | — | rankings |
| `<uc-page updated>` | footer | footer (was MM/DD/YYYY) | per page | per page |
| `editions.js` | `EDados/editions.js` (2425, 2526) | `PI/` | `IP/` | `pc2627` sits in a flat folder: needs a parent folder or absolute `href`s |

---

## 11. Tests and acceptance

Every block PR is green on `npm run build:check` and `npm test` (which runs
`check-docs --strict`, `check-a11y` and `check-pages`) and in CI, and adds:

1. `tests/pages/uc-x.html` with the cases of 9.2 (checked by `check-pages`:
   axe, no JavaScript, 360 px).
2. Pure-logic tests in `tests/pages/core-tests.js`: weight normalisation and
   rounding, formula coefficients, `.ics` text, accent-insensitive search,
   URL → material type, schedule merging, sort value parsing.
3. Keyboard and state cases in `scripts/check-a11y.mjs` (reused from PR #35,
   not a new script): filter by keyboard, focus after filtering, live region
   text, `aria-pressed`/`aria-sort`/`aria-invalid` flips, target size ≥ 44 px.
4. An accessibility-tree snapshot (`ariaSnapshot`) per block for one fixed
   `?today=`, stored next to the test page, so a change in roles, names or
   state text fails the build.
5. The documentation page `docs/pt/componentes/uc-x.html` (sections:
   Utilização, Exemplos, Atributos, Configuração, Personalizar, Acessibilidade,
   Sem JavaScript, Ver também), demos in `docs/demos/uc-x/`, `docs/nav.json`,
   the components index with a thumbnail, new fields in
   `docs/pt/course-js.html`, the `docs:classes` region.
6. `npm run build` output committed: `llms.txt`, `llms-full.txt`, the `.md` of
   each page, the search index, the template zip.
7. `template/AGENTS.md` and `docs/pt/migrar.html`: the "old page → component"
   map gains the block.
8. One line in `CHANGELOG.md` (Unreleased).

---

## 12. Phases and files

| Phase | Builds | Main files |
| --- | --- | --- |
| 0 | This contract and the handoff | `docs/plan/blocks-api.md`, `docs/plan/blocks-phase-0-handoff.md` |
| 1 | Shared pieces (`announce`, `filterBar`, `storage`, `enhance`, `formatTime`, `formatDuration`, `weekdayName`), `a[data-auth]`, size budget check, a11y snapshot helper, `<uc-timetable>`, `officeHours` in `<uc-team>` | `kit/src/core/{announce,filters,storage,auth-links}.js`, `kit/src/components/uc-timetable.js`, `kit/src/css/components/uc-timetable.css`, `scripts/build.mjs` |
| 2 | `<uc-grading>` with calculator, `<uc-assessment-info>`, `duration`/`location`/`shifts` in `<uc-event>`, `<uc-deadlines>`, `<uc-this-week>` | `uc-grading.*`, `uc-assessment-info.*`, `core/ics.js` |
| 3 | `<uc-summaries>`, `<uc-weeks view="compact">`, `<uc-week href>` | `uc-summaries.*`, `uc-weeks.js`, `uc-week.js` |
| 4 | `<uc-materials>`, `<uc-problems>`, `platforms[].id`/`hidden` | `uc-materials.*`, `uc-problems.*` |
| 5 | `uc-links--grid`, `check-links.mjs` + weekly workflow, `<uc-page updated>`, `editions.js`, `table[data-sortable]`; pages Padrões, Introdução, Publicar, Novo ano letivo; final review of `AGENTS.md` and `llms-full.txt`; CHANGELOG → 1.1.0 | `core/sortable-tables.js`, `uc-page.js`, `scripts/check-links.mjs`, `.github/workflows/links.yml` |
| 6 | Tell the PI/IP/PC migrations, apply the blocks to `examples/edados-2526`, then to the other examples, final report | `examples/**` |

Order constraints: phase 1 starts after PR #36 (kit fixes, merged 16 Nov; touches
`api.md`, `uc-deadlines`, `uc-team`) is merged; it reuses the check of PR #35
(accessibility audit). Phase 3 waits for any audit fix to `uc-week`/`uc-weeks`.
Every phase fetches and rebases at the start and before merging, and works on
its own branch.

---

## 13. Decisions taken in phase 0

The plan left these details open; phase 0 fixed them so the phases agree.
Each can be revisited by the phase that implements it (record the change
here).

1. **"My class" is per type.** A student has a lecture class *and* a lab class,
   so there is one `<select>` per type with two or more classes, saved as
   `uc:<course>:class:<type>`, instead of a single `uc:class`.
2. **"Solved" is per problem, not per page.** The key uses the problem id
   (judge + code by default), so a problem listed on a series page and on an
   index page shares its state. The plan said "per page"; per problem is
   strictly more useful and still course-scoped.
3. **`<uc-grading>` hides the teacher's list and renders a table** with a copy
   of each item's content, so the information is not shown twice. The list
   stays in the DOM (no-JS view, re-render source).
4. **Formula coefficients on each component's own scale**, omitting 1, so
   EDados reads "E + AP + P" exactly as the teacher writes it today.
5. **`data-bonus` accepts points or a percentage** (`2` or `10%`), and the
   final grade is capped at `scale`.
6. **Dates in HTML-first blocks are re-rendered from `datetime`** in the active
   language (original text kept for no-JS), so bilingual pages write a date
   once.
7. **Shifts may carry their own date and location**, for tests split across
   days or rooms.
8. **`scheduleTypes` and `platforms[].hidden`** are two small new fields, for
   custom class types (seminars) and judges that should not appear in the
   navigation.
9. **`editions` is opt-in through `course.js`** (`editions: "../editions.js"`),
   so sites without the shared file make no failing request. The template
   sets it from phase 5 on, so every new year inherits it.
10. **`updated="auto"`** treats a `document.lastModified` within 5 s of page
    load as "no header" (browsers report "now" when the header is missing).
11. **New public helpers** (`UC.formatTime`, `UC.formatDuration`,
    `UC.weekdayName`) because extensions writing schedules need the same
    formatting; everything else stays in `UC.internal`.
12. **`<uc-problems heading>` defaults to `none`**, since problem pages already
    have their own `<h1>`.

## 14. Changes made in phase 1

Phase 1 implemented sections 2.1 (`schedule`, `scheduleTypes`), 2.2
(`Weekday`), 2.4, 2.7, 3.1, 4.3, 5.2, the `--uc-timetable-time-width` token,
7.1 (`UC.formatTime`, `UC.formatDuration`, `UC.weekdayName`, `uc:classchange`)
and the helpers of 7.2 except `deadlineStatus`. They are now in `docs/api.md`.
Refinements made while coding:

1. **`announce(text, delay = 50)`.** The shared live region writes the text
   50 ms after clearing (the last call wins), not after a fixed 300 ms: the
   copy buttons must confirm at once. Callers that announce while the reader
   types (search in phase 3, the calculator in phase 2) pass `300`.
2. **`<uc-timetable heading-level>`** (2–6, default 2), like the other
   components with a heading; the weekday headings of `view="days"` are one
   level below.
3. **Merging also compares `note`**, so two classes with different notes stay
   on separate rows.
4. **New strings:** `common.and` ("e" / "and", joins days: "3.ª e 5.ª"),
   `timetable.showingAll` ("A mostrar todas as turmas (Teóricas)", announced
   when "Todas" is chosen) and `team.column.officeHours`.
5. **More stable classes** than 3.1 listed: `uc-timetable__section`,
   `__heading`, `__days`, `__room` (cells that do not wrap), `__day-heading`,
   `__list`, `__details`; filter bar `uc-filters__label` and
   `uc-filters__select`; on `<uc-team>`, `uc-team__hours`, `__hours-title`,
   `__hours-list`. `uc-timetable__table` carries `data-type`.
6. **Filter buttons are full-size `uc-button`s** (44 px), not `uc-button--sm`
   (32 px), to meet the target size of 1.4 / 2.5.5.
7. **`.uc-table` is `position: relative`**, so visually hidden text inside a
   table (the full weekday names) scrolls with it instead of widening the
   page at 320 px.
8. **`deadlineStatus` was not extracted** in phase 1 (no phase 1 block uses
   it). Phase 2 extracts it from `uc-deadlines.js`.
9. **Size.** `uc-kit.js` was 28.2 KB gzipped at the start of phase 1 (PR #35
   included) and is 32.1 KB after it: phase 1 used 3.9 KB of the 8.8 KB
   left. Phases 2–5 have 4.9 KB for five blocks and the extras, which is
   tight; each phase should check the number the build prints and keep
   strings and helpers shared.

