# UC Design Kit — API contract (v1)

This document is the public contract of the kit. Code, tests, examples and
documentation follow it. Anything listed here is stable within major
version 1; changing it requires its own pull request.

- Status: **draft for review** (milestone M0.2)
- Kit version: 1.0.0 (unreleased)
- Documentation for teachers (Portuguese), which explains every item of this
  contract with live demos: <https://uc-design-kit.miguelrocha.dev/docs/pt/>.
  `npm test` checks that both cover the same components, attributes,
  `course.js` fields, building blocks, tokens, JavaScript API and runners.

## 1. Loading the kit

Every page loads, in this order:

```html
<!doctype html>
<html lang="pt">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Semanas · Estruturas de Dados</title>
  <link rel="preload" href="https://uc-design-kit.miguelrocha.dev/kit/v1/fonts/inter-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="https://uc-design-kit.miguelrocha.dev/kit/v1/uc-kit.css">
  <link rel="stylesheet" href="theme.css">            <!-- optional, level 1-2 customisation -->
  <script src="course.js"></script>                    <!-- the course configuration -->
  <script src="https://uc-design-kit.miguelrocha.dev/kit/v1/uc-kit.js" defer></script>
  <script src="extensions/uc-bst-traversal.js" defer></script>  <!-- optional, level 3 -->
</head>
<body>
  <uc-page current="weeks">
    …page content…
  </uc-page>
</body>
</html>
```

Rules:

- `uc-kit.js` is a **classic script** (no ES modules), so pages work from
  `file://`. It must be loaded with `defer` (or at the end of `<body>`).
- `course.js` is loaded **before** the kit and without `defer`.
- The `preload` line is optional: it starts downloading the body font
  together with the CSS instead of after it, so the page appears sooner on a
  first visit. Keep `crossorigin` (fonts are always fetched in CORS mode) and
  use the same folder as `uc-kit.css`. Use the absolute `https://` URL: with a
  relative path the preload fails when the page is opened from `file://`.
- `v1` can be replaced by an exact release such as `v1.0.0` (all three URLs),
  see section 9.
- `<html lang>` is the language the page is written in by default.
- The kit never requires a build step, a server or a package manager.
- External libraries (e.g. syntax highlighting) are loaded on demand from a CDN
  with a pinned version and Subresource Integrity, only by the components that
  need them.

## 2. Course configuration (`course.js`)

`course.js` assigns one object to `window.UC_COURSE`. It holds the values that
change every year or appear on more than one page. Everything else is HTML.

```js
window.UC_COURSE = {
  code: "CC1007",
  title: { pt: "Estruturas de Dados", en: "Data Structures" },
  tagline: { pt: "Programação orientada a objetos em Java…", en: "Object-oriented programming in Java…" },
  edition: "2025/26",
  languages: ["pt", "en"],
  institution: { name: "DCC · FCUP", url: "https://www.dcc.fc.up.pt" },
  accentColor: "#1D4ED8",
  logo: "logo.svg",

  semester: {
    start: "2025-09-16",
    weeks: 12,
    teachingDays: [2, 5],
    breaks: [
      { start: "2025-10-27", end: "2025-10-31", label: { pt: "Atividades FCUP II", en: "FCUP Activities Week" } }
    ]
  },

  pages: ["home", "weeks", "assessment", "materials", "schedule", "about"],

  platforms: [
    { label: "Mooshak", url: "https://mooshak.dcc.fc.up.pt/~edados/" },
    { label: "SIGARRA", url: "https://sigarra.up.pt/fcup/" }
  ],

  team: [
    { name: "Fernando Silva", url: "http://www.dcc.fc.up.pt/~fds", role: "coordinator", classes: ["T1", "T2"] },
    { name: "Joana Leite", role: "assistant", classes: ["PL2", "PL3"] }
  ],

  deadlines: [
    { id: "ap1", title: { pt: "Avaliação Prática 1" }, date: "2025-11-12", time: "16:00", kind: "assessment",
      note: { pt: "Turnos das 16h e 18h" }, url: "praticas/teste_pratico1.html" },
    { id: "exam", title: { pt: "Exame, época normal" }, date: "2026-01", kind: "exam" }
  ],

  notices: [
    { date: "2025-11-27", text: { pt: "<a href=\"evaluation/quizzes.pdf\">Número de respostas aos quizzes</a>" } }
  ],

  footer: { pt: "© 2025 Fernando Silva · DCC, Faculdade de Ciências da Universidade do Porto" },
  updated: "2025-11-27"
};
```

### 2.1 Types

| Type | Definition |
| --- | --- |
| `LocalizedText` | A string (same in every language) or an object `{ [languageCode]: string }`. Missing languages fall back to the first language in `languages`, then to any available value. |
| `ISODate` | `"YYYY-MM-DD"`. A deadline may also use `"YYYY-MM"` (month known, day not) or `null` (to be scheduled). |
| `Time` | `"HH:MM"`, 24-hour. |
| `Weekday` | ISO weekday number: `1` = Monday … `7` = Sunday (as `semester.teachingDays`). |
| `Minutes` | A whole number of minutes, e.g. `120` for two hours. |
| `HTMLText` | A `LocalizedText` whose values may contain inline HTML (links, `<strong>`, `<em>`, `<code>`). It is written by the teacher and inserted as HTML. |

### 2.2 Fields

| Field | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `code` | string | no | — | Course code shown above the title (e.g. `CC1007`). |
| `title` | `LocalizedText` | **yes** | — | Course name, used in header, `<title>` suffix and footer. |
| `tagline` | `LocalizedText` | no | — | One-sentence description, used by `<uc-hero>`. |
| `edition` | string | no | — | Academic year label, e.g. `2025/26`. |
| `languages` | string[] | no | `[<html lang>]` | BCP 47 codes. First is the default. More than one enables the language switch. |
| `institution` | `{ name, url? }` | no | — | Shown in the header. |
| `accentColor` | CSS colour | no | `#1D4ED8` | Sets `--uc-color-accent`; soft and strong variants are derived. Must reach 4.5:1 contrast on white. |
| `logo` | URL \| `null` | no | built-in tree icon | Header mark. `null` hides it. |
| `semester.start` | `ISODate` | for week features | — | First day of classes; week 1 is the calendar week containing it. |
| `semester.weeks` | number | no | `14` | Number of teaching weeks (breaks not counted). |
| `semester.teachingDays` | `[from, to]` | no | `[1, 5]` | ISO weekdays with classes (1 = Monday … 7 = Sunday). Week ranges are shown with these days, e.g. `[2, 5]` → "25–28 nov". |
| `semester.breaks` | `{ start, end, label }[]` | no | `[]` | Weeks without classes. Weeks are numbered skipping them. A calendar week that has any teaching day inside a break is a break week as a whole. |
| `pages` | `(PageId \| Page)[]` | no | `["home"]` | Navigation, in order. See 2.3. |
| `platforms` | `{ label, url }[]` | no | `[]` | External links listed under "Platforms" in the navigation. |
| `team` | `TeamMember[]` | no | `[]` | See 2.4. |
| `schedule` | `ScheduleEntry[]` | no | `[]` | Weekly classes. See 2.7. Read by `<uc-timetable>`. |
| `scheduleTypes` | `{ [type]: LocalizedText }` | no | — | Labels for custom schedule types, or to rename built-in ones, e.g. `{ seminar: { pt: "Seminários", en: "Seminars" } }`. |
| `deadlines` | `Deadline[]` | no | `[]` | See 2.5. |
| `notices` | `Notice[]` | no | `[]` | See 2.6. |
| `footer` | `HTMLText` | no | course title + institution | Footer left side. |
| `updated` | `ISODate` | no | — | "Last updated" in the footer. |
| `today` | `ISODate` | no | the real date | Freezes "today" (demos, screenshots). The query string `?today=YYYY-MM-DD` overrides it. |
| `runner` | object | no | Codapi + browser | Where `<uc-code run>` executes code. See 7.1. |

### 2.3 Pages

A page entry is either a built-in id or an object:

```js
pages: [
  "home",                                         // built-in: href "index.html", label "Início"/"Home"
  { id: "weeks", href: "semanas.html" },          // built-in id, custom file name
  { id: "contests", href: "contests.html", label: { pt: "Concursos", en: "Contests" } },
  { id: "about", href: { pt: "sobre.html", en: "about.html" } }   // one file per language
]
```

| Built-in id | Default `href` | Default label (pt / en) |
| --- | --- | --- |
| `home` | `index.html` | Início / Home |
| `weeks` | `weeks.html` | Semanas / Weeks |
| `assessment` | `assessment.html` | Avaliação / Assessment |
| `materials` | `materials.html` | Materiais / Materials |
| `schedule` | `schedule.html` | Horários e equipa / Schedule and team |
| `about` | `about.html` | Sobre a UC / About the course |

When `href` is a `LocalizedText`, switching language navigates to the page in
the other language instead of toggling content in place.

Relative `href`s are relative to `course.js`, not to the page. A page in a
subfolder (e.g. `guioes/aula10.html` loading `../course.js`) therefore gets
navigation and breadcrumb links such as `../semanas.html` automatically.

The same holds for every other URL in `course.js` (`logo`, `institution.url`,
`platforms[].url`, team and deadline `url`, deadline `links`) and for links
and images inside `HTMLText` (notices, notes, footer). URLs that start with a
scheme (`https:`, `mailto:`), `/` or `#` are used as written.

### 2.4 Team member

| Field | Type | Notes |
| --- | --- | --- |
| `name` | string | Required. |
| `url` | URL | Personal page. |
| `email` | string | Optional; rendered as a `mailto:` link. |
| `role` | `"coordinator"` \| `"lecturer"` \| `"assistant"` \| `LocalizedText` | Built-in roles are translated. |
| `classes` | string[] | Class codes, e.g. `["PL1", "PL5"]`. |
| `office` | string | e.g. `"Gab. 1.25"`. |
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

### 2.5 Deadline

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | Required, unique. Referenced by `<uc-date deadline>`. |
| `title` | `LocalizedText` | Required. |
| `date` | `ISODate` \| `"YYYY-MM"` \| `null` | `null` = to be scheduled. |
| `time` | `Time` | Start time. |
| `end` | `ISODate` | For multi-day items (e.g. a quiz open for a week). |
| `kind` | `"assessment"` \| `"exam"` \| `"quiz"` \| `"submission"` \| `"other"` | Drives the badge of `<uc-event>`, the `data-kind` attribute of `<uc-deadlines>` items and rows, and filtering. |
| `note` | `HTMLText` | Short secondary line (shifts, rooms…). |
| `url` | URL | Main link (information page). |
| `links` | `{ label, url }[]` | Extra links (results, shifts…). |
| `duration` | `Minutes` | Length of the assessment. With `time`, the end is computed ("14:30–16:30"). |
| `location` | `HTMLText` | Rooms, or a link to the room allocation (may use `data-auth`). |
| `shifts` | `Shift[]` | When the same assessment runs more than once. Shown instead of `time`; `time` stays the first shift's start, for sorting. |

`Shift`: `{ time: Time, end?: Time, date?: ISODate, location?: HTMLText, note?: HTMLText }`.
`end` defaults to `time` + `duration`; `date` to the deadline's `date` (set it
for an assessment that runs on two days); a shift's `location` is shown next to
that shift only (the deadline's `location` applies to all).

```js
{ id: "t1", title: { pt: "1.º teste", en: "Test 1" }, date: "2025-11-05", time: "14:30", kind: "assessment",
  duration: 120,
  location: { pt: "FC1 120, FC1 122 · <a href=\"evaluation/salas_t1.pdf\" data-auth>distribuição por salas</a>" },
  shifts: [{ time: "14:30" }, { time: "16:30" }],
  url: "test1.html" },
```

### 2.6 Notice

| Field | Type | Notes |
| --- | --- | --- |
| `date` | `ISODate` | Required. Notices are shown newest first. |
| `text` | `HTMLText` | Required. One line. |
| `details` | `HTMLText` | Optional second line. |

### 2.7 Schedule entry

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

An entry without `type`, `class`, `day`, `start` or `end` is skipped with one
console warning.

## 3. Components

All components are custom elements in the **light DOM**: their content is part
of the page, global CSS applies, and without JavaScript the teacher's content
is still readable (unstyled by the component).

Common behaviour:

- Every component re-renders on language change.
- Attributes are read when the element is connected. Changing one later does
  not re-render the element; to change it from a script, replace the element.
- Attributes are lowercase, kebab-case. Boolean attributes are present/absent.
- Teacher-written children are never discarded; components wrap or decorate them.
- Generated text comes from the i18n dictionaries.
- Choices a component saves in the browser use `localStorage` keys that
  include the course, `uc:<course>:<feature>[:<detail>]`, because every course
  on one server shares one origin. `<course>` is `code`, or the path of the
  folder that holds `course.js`. Storage may be blocked; the component then
  works and only forgets the choice.

### 3.1 Page shell

#### `<uc-page>`

Renders the skip link, header (logo, title, edition, institution, language
switch), navigation (sidebar on desktop, collapsible menu on phones), the
`<main>` landmark around its children, and the footer. Until the kit has run and
the web fonts are ready (waiting at most 300 ms for them), `<uc-page>` is
hidden, so the page appears once, already laid out and in its final font. The
kit then adds `.uc-visible` to `<html>`. If the kit script fails to load, the content is shown after 2 s;
with JavaScript disabled it is shown at once.

| Attribute | Values | Default | Notes |
| --- | --- | --- | --- |
| `current` | a page id | inferred from the file name | Marks the active navigation item. |
| `layout` | `sidebar` \| `full` | `sidebar` | `full` hides the navigation (single-page sites, guides). |

#### `<uc-hero>`

Course heading block: code, title (as `<h1>`) and tagline from the
configuration. Children, if any, are appended below the tagline.

### 3.2 Dates, deadlines and notices

#### `<uc-notices>`

Lists `UC_COURSE.notices`, newest first. A notice dated after "today" is
hidden until that day, so notices can be written in advance.

| Attribute | Values | Default | Notes |
| --- | --- | --- | --- |
| `limit` | number | `5` | Older notices go into a collapsed "Earlier notices (n)" section. |
| `new-days` | number | `7` | Notices newer than this get a "New" badge. |
| `heading` | text \| `none` | localised "Notices" | Section heading (`<h2>`). |
| `heading-level` | `2`–`6` | `2` | Level of the generated heading, e.g. `3` inside a section that already has an `<h2>`. It looks the same at any level. |

Children written inside the element (e.g. a link to the assessment rules) are
kept below the list.

#### `<uc-deadlines>`

Lists `UC_COURSE.deadlines`.

| Attribute | Values | Default | Notes |
| --- | --- | --- | --- |
| `view` | `list` \| `table` | `list` | `table` has columns for title, date, time, details (note and links) and status. |
| `filter` | `upcoming` \| `past` \| `all` | `upcoming` (list), `all` (table) | |
| `kind` | space-separated kinds | all | e.g. `kind="assessment exam"`. |
| `per-kind` | number | none | At most this many items of each kind, e.g. `per-kind="1"` shows only the next quiz. |
| `limit` | number | none | |
| `heading` | text \| `none` | localised "Upcoming dates" | |
| `heading-level` | `2`–`6` | `2` | Level of the generated heading. |

Status shown in the table view: *Done* (date passed), *Next* (the first
upcoming), *Scheduled* (later), *To be scheduled* (`date: null` or month only).
A deadline with an `end` date counts as upcoming until it ends and is shown as
a range. Children written inside the element are kept below the list. In
the list view the time goes at the start of the note line ("21:00 · Mooshak");
the table view shows dates and ranges with the year. A deadline with `shifts`
shows their start times ("14:30 e 16:30"), and one with `duration` its range
("14:30–16:30"), in both views; the table's details column shows `location`
before `note`.

#### `<uc-date>`

Prints a date inline, formatted in the active language.

| Attribute | Values | Notes |
| --- | --- | --- |
| `deadline` | deadline id | Uses that deadline's date (and time, with `with-time`). |
| `value` | `ISODate` | A literal date. |
| `format` | `short` \| `medium` \| `long` \| `weekday` | `short` = "12 nov", `medium` = "12 nov 2025", `long` = "12 de novembro de 2025", `weekday` = "quarta-feira, 12 nov". Default `short`. |
| `with-time` | boolean | Appends the time. |

### 3.3 Weekly calendar

#### `<uc-weeks>`

Container for `<uc-week>` elements. Adds a "Go to this week" link, inserts
`UC_COURSE.semester.breaks` between weeks, and appends deadlines that fall
after the last week.

| Attribute | Values | Default |
| --- | --- | --- |
| `view` | `full` \| `compact` | `full` |
| `no-breaks` | boolean | breaks are inserted |
| `no-deadlines` | boolean | deadlines are shown inside their week |
| `kind` | space-separated kinds | all kinds; e.g. `kind="assessment exam"` leaves quizzes to the weeks' own rows |

`view="compact"` renders the same `<uc-week>` children as one table (caption
"Planeamento das semanas", visually hidden) with the columns Week
(`<th scope="row">`), Dates ("16–19 set"), Topic (the week's title, a link when
the week has `href`; below it, the week's deadlines of the listed `kind`s as
small lines, written by hand or not, unless `no-deadlines`) and Status
("Dada", "Esta semana", "Prevista"). Breaks are rows with one cell spanning
the table, followed by the deadlines dated in them. The current row has
`aria-current="date"` and replaces the "Go to this week" link. Each row takes
the `id="week-<n>"` of its week, so `#week-<n>` links keep working; the
`<uc-week>` elements stay in the DOM, hidden. Deadlines after the last week
are appended after the table, as in the full view.

#### `<uc-week>`

One teaching week, rendered as a disclosure (`<details>`). Dates are computed
from `semester.start` and `breaks`; the current week is open and highlighted,
future weeks are dimmed. Deadlines dated inside the week appear as events.

| Attribute | Values | Notes |
| --- | --- | --- |
| `n` | number | Required. Week number. |
| `title` | text | Required. Shown in the summary row. |
| `title-<lang>` | text | Title in another language, used when that language is active, e.g. `title-en="Binary search trees"`. |
| `start`, `end` | `ISODate` | Override the computed dates. |
| `href` | URL | Page of that week's class, relative to the page. In the full view a "Página da aula" link is the first line of the body (links are not allowed inside `<summary>`); in the compact view the title links to it. |
| `open` | boolean | Force open. |

Children are free HTML. A `<dl>` directly inside is styled as label/value rows
("Lectures", "Lab", "Quiz"…).

The element gets `id="week-<n>"` for deep links; opening the page with
`#week-<n>` opens that week. The `title` attribute is removed after it is read
(so browsers do not show it as a tooltip); the title is therefore only visible
with JavaScript, while the children stay readable without it.

A deadline that already has a hand-written `<uc-event deadline="…">` in any
week of the `<uc-weeks>` is not repeated. `<uc-weeks>` places deadlines that
fall in a break right after the break. Deadlines with a month only
(`"2026-01"`) appear in no week: they are listed by `<uc-deadlines>`.

#### `<uc-event>`

A highlighted item inside or between weeks (assessments, exams).

| Attribute | Values | Notes |
| --- | --- | --- |
| `deadline` | deadline id | Takes title, date, time, location, note and links from the configuration. The time reads "14:30 e 16:30" for shifts and "14:30–16:30" with a `duration`; the location goes before the note. |
| `kind` | deadline kind | When not using `deadline`. |
| `date` | `ISODate` | When not using `deadline`. |

Children (free HTML) are appended after the generated content.

#### `<uc-summaries>`

Decorates the numbered list of lecture summaries written by the teacher: date
with weekday, link to the matching week, breaks between items, states and
search.

```html
<uc-summaries search>
  <ol>
    <li><time datetime="2025-09-16">16 set</time> <strong>Apresentação; Introdução ao Java</strong>
      <p>Considerações gerais sobre o programa…</p></li>
  </ol>
</uc-summaries>
```

| Attribute | Values | Default |
| --- | --- | --- |
| `search` | boolean | no search field |
| `order` | `asc` \| `desc` | `asc`; `desc` shows the most recent lecture first (numbers stay) |
| `no-breaks` | boolean | breaks are inserted |
| `no-weeks` | boolean | items link to their week |
| `heading` | text \| `none` | localised "Sumários" / "Lecture summaries" |
| `heading-level` | `2`–`6` | `2` |

- **Items** are the `<li>` of the first `<ol>`/`<ul>` child. An item's date is
  its first `<time datetime="YYYY-MM-DD">` that is not inside a nested list;
  it is shown with the weekday in the active language ("terça-feira, 16 set")
  in a date column (`--uc-summaries-date-width`), and the teacher's text is
  kept in `data-uc-text` (what shows without JavaScript). Each item keeps its
  number: `value` (and a visible number) from its position among the items
  of the active language, counted from the `<ol>`'s `start`.
- **Week link.** "Semana 7", to the `weeks` page of `pages` with `#week-7`
  (`UC.weekOf(date)`). None when there is no `weeks` page or the date is
  outside the semester.
- **Breaks.** Between two dated items that straddle a break of
  `semester.breaks`, an item without number (`uc-summaries__break`):
  "Interrupção: Semana de estudo (27–31 out)". Hidden while searching.
- **States** (text tags): the most recent item dated today or earlier gets
  "Última aula"; items dated after today get "Prevista" and are dimmed, so the
  list also serves as a lecture plan.
- **Search** (`search`): `<input type="search">` with the visible label
  "Pesquisar nos sumários". It ignores case and accents, looks only at the
  text of the active language, highlights matches with `<mark>`, keeps focus
  in the field and announces "5 de 24 sumários" (or "Nenhum sumário
  encontrado.", also shown under the list). Esc clears it.
- Items without a `<time>` are shown as written, without week or state.
  Elements after the list stay after it.

#### `<uc-this-week>`

"This week" card for the home page: week number and dates, deadlines this
week and next, and a link to `weeks.html#week-<n>`. When the page is served
over HTTP(S), it also fetches the weeks page and shows the current week's
title and `<dl>` rows (progressive enhancement; on `file://` that part is
skipped). The last copy of the weeks page is kept in `localStorage`, so on
later visits the card is complete at once and does not grow when the fetch
returns. Outside the semester it shows the next relevant date.

| Attribute | Values | Default |
| --- | --- | --- |
| `source` | URL | the `weeks` page from `pages` |
| `kind` | space-separated kinds | all kinds; use it to avoid repeating a deadline the week's rows already mention |
| `heading-level` | `2`–`6` | `2` |

### 3.4 People and timetable

#### `<uc-team>`

Renders `UC_COURSE.team`.

| Attribute | Values | Default |
| --- | --- | --- |
| `view` | `cards` \| `table` | `cards` |
| `role` | space-separated roles | all |
| `heading` | text \| `none` | localised "Teaching team" |
| `heading-level` | `2`–`6` | `2` |

`role` is not a valid ARIA role, so after upgrade the element moves it to
`data-role` (accessibility checkers would flag it otherwise). Write `role` in
the HTML as documented; in custom CSS select `uc-team[data-role]`. When no
member matches, the element is hidden.

Members with `officeHours` show "Atendimento" / "Office hours" on their card,
one line per slot ("3.ª 16:00–18:00 · Gab. 1.25"). The table view adds an
"Office hours" column only when some member has `officeHours`.

#### `<uc-timetable>`

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
| `heading-level` | `2`–`6` | `2` | Day headings of the `days` view are one level below. |

- **Table view.** Each table has a `<caption>` with the type's plural label
  ("Teóricas", "Práticas laboratoriais", "Atendimento"). Columns: Class
  (`<th scope="row">`), Day, Time, Room, Teacher, and Notes only when an entry
  of that type has a `note`. Office hours: Teacher (`<th scope="row">`), Day,
  Time, Room, Notes.
- **Merging.** Entries with the same type, class, start, end, room, staff and
  note become one row with the days joined ("3.ª e 5.ª"). Rows are sorted by
  first day, then start time, then class code.
- **Days** are abbreviated ("3.ª", "Tue") with the full name for screen
  readers; times are `<time>` elements ("14:00–15:00"). Teachers are links
  when the member has a `url`.
- **Days view.** One heading per weekday that has entries (Monday first), with
  a list: "14:00–15:00 · T1 · Teóricas · FC4 0.41 · Fernando Silva".
- **Filter.** Choosing a class hides the other rows of that type; "Todas"
  shows all. Office hours are never filtered. The choice is announced ("A
  mostrar a turma PL2") and fires `uc:classchange`.
- With nothing to show, the element is hidden. Without JavaScript only the
  teacher's children show: link the official timetable there.

### 3.5 Lab guides

#### `<uc-guide>`

Wraps a lab guide. Adds breadcrumbs, an "On this page" table of contents
built from its `<h2>` elements (sticky on desktop), and a progress indicator
counting completed `<uc-exercise>` elements.

| Attribute | Values | Notes |
| --- | --- | --- |
| `week` | number | Links back to `weeks.html#week-<n>`. |
| `no-toc` | boolean | Hides the table of contents. |

#### `<uc-exercise>`

One exercise. Renders a numbered disclosure with title, optional metadata
badges and a "Mark as done" toggle persisted in `localStorage`.

| Attribute | Values | Notes |
| --- | --- | --- |
| `id` | string | Required for persistence. |
| `title` | text | Required. |
| `level` | `easy` \| `medium` \| `hard` | Optional badge. |
| `mooshak` | problem code | Optional badge in the summary, plus a "Submit on Mooshak" link to the platform's URL next to the toggle (links are not allowed inside `<summary>`). |
| `open` | boolean | Start expanded. |

Inside, `<details class="uc-hint">` blocks are styled as hints and
`<details class="uc-solution">` as a hidden solution; a translated
`<summary>` ("Hint" / "Solution") is added when missing. Exercises are numbered
in document order. Done states are stored per page path. Toggling fires a
bubbling `uc:exercisechange` event, which `<uc-guide>` uses for its progress.
Like `<uc-week>`, the `title` attribute is removed after it is read.

#### `<uc-code>`

A code block with syntax highlighting, copy and download buttons, and
optional in-page execution with tests.

| Attribute | Values | Notes |
| --- | --- | --- |
| `lang` | `java` \| `python` \| `c` \| `cpp` \| `js` \| … | Highlighting language (highlight.js, loaded on first use). |
| `filename` | text | Shown in the header and used for downloads. |
| `editable` | boolean | Makes the code editable with a "Reset" button. |
| `no-copy`, `no-download` | boolean | Hide buttons. |
| `collapsible` | boolean | Adds a show/hide toggle (chevron and file name) to the header, so long code can be folded away. |
| `collapsed` | boolean | With `collapsible`: starts folded. Pressing "Run" opens the block. |
| `run` | boolean \| URL | Without a value: a "Run" button that executes the code in the page (see below). With a URL: a "Test on…" link to an external platform. |

Code is given as a `<script type="text/plain">` child (no HTML escaping
needed) or as `<pre><code>` with escaped HTML. The kit CSS shows the script's
text when JavaScript is off.

highlight.js 11.9.0 is loaded from cdnjs on first use; less common grammars
(haskell, ocaml, prolog, scala…) are loaded with SRI hashes. Without network,
or for an unknown language, the code stays readable as plain text. `lang="java"`
is not a valid language tag, so after upgrade the element moves it to
`data-lang`; in custom CSS select `uc-code[data-lang="java"]`.

**Running code.** With `run` (no value) the block gets a "Run" button, unless
the runner configured for the language says it cannot run it (`html`, `css`,
`text`, `json`… with the built-in runners; a console warning says so). The
code is sent to the runner configured for its language (7.1) and the output
and errors are shown under the code. Two optional children turn it into a
small automatic check:

```html
<uc-code lang="java" filename="BTree.java" editable run>
  <script type="text/plain">…student's starting code…</script>
  <script type="text/plain" data-harness filename="BTNode.java">…</script>
  <script type="text/plain" data-harness>
    public class Main {
      public static void main(String[] args) { /* prints one line per test */ }
    }
  </script>
  <ol data-tests>
    <li data-expected="0">Empty tree has 0 nodes</li>
    <li data-expected="3">Tree with three nodes</li>
  </ol>
</uc-code>
```

- `script[data-harness]`: hidden code that runs *as the entry file*; the
  student's code is sent as a second file named by `filename`. For Java the
  harness must start with `public class Main` (Codapi's entry point).
- `script[data-harness][filename]`: an extra hidden file, e.g. a `BTNode.java`
  the student's code uses. In Java each public class needs its own file.
- `ol[data-tests]`: line *i* of the program's output is compared with test
  *i*'s `data-expected` (trailing spaces ignored). Results are shown as ✓/✗
  with the expected and obtained values; the button reads "Run tests".
- Neither is shown on the page; without JavaScript only the code appears.
- Programs cannot read standard input: the harness provides the data.

#### `<uc-question>`

A multiple-choice self-check question with immediate feedback.

```html
<uc-question>
  <p>Que percurso visita a raiz primeiro?</p>
  <ul>
    <li data-correct>Pré-ordem</li>
    <li>Em-ordem</li>
    <li>Pós-ordem</li>
  </ul>
  <p data-explanation>Em pré-ordem visita-se o nó antes das subárvores.</p>
</uc-question>
```

Attributes: `multiple` (boolean) allows more than one correct answer.

### 3.6 Assessment

#### `<uc-grading>`

Decorates the teacher's list of grade components: a generated formula, a
proportions bar, a table of weights and minimums and, optionally, a grade
simulation. Each weight is written once, in a `<data>` element that shows
without JavaScript.

```html
<uc-grading scale="20" pass="9.5" calculator>
  <ul>
    <li data-code="E" data-scale="14" data-min="4.9"><data value="14">14 valores</data> Exame final.
      <span>Teórico-prático, sem consulta.</span></li>
    <li data-code="AP" data-scale="5"><data value="5">5 valores</data> Avaliações práticas</li>
    <li data-code="P" data-scale="1"><data value="1">1 valor</data> Exercícios das aulas práticas</li>
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
| `heading-level` | `2`–`6` | `2` | Level of the generated heading. |

Item attributes, on the `<li>` of the first `<ul>`/`<ol>` child:

| Item attribute | Values | Notes |
| --- | --- | --- |
| `data-code` | text | Short name used by the formula, the table and the calculator, e.g. `E`, `AP`, `T1`. |
| `data-scale` | number | Scale in which this component is graded. Default: the element's `scale` (for parts: the parent's). |
| `data-min` | number | Minimum on this component's own scale ("4,9 em 14"). |
| `data-bonus` | number \| `N%` | A bonus item: not part of the weights; adds up to this many points on the final scale (`2`) or this share of it (`10%`). The final grade is capped at `scale`. Needs no `<data>`. |

- **Weights.** The `value` of the item's `<data>` (a number; a trailing `%`
  and a decimal comma are accepted). Weights are normalised among siblings,
  so `0.1/0.2/0.2/0.5`, `14/5/1` and `25%/50%/25%` all work.
- **Parts.** A `<ul>`/`<ol>` inside an item lists its parts, with weights
  relative to the parent (contests 30/30/40 inside a 50 % component). The
  parent's grade is the weighted mean of its parts, on the parent's scale.
- **Rendering.** The teacher's list stays in the page but hidden; the element
  shows, in order, the formula, the proportions bar (`aria-hidden`, one segment
  per top-level component, labelled with its code) and a table (visually
  hidden caption "Componentes da nota"; columns Component, Weight, Minimum).
  The component cell is the code and a copy of the item without its `<data>`
  and nested list. The weight cell is the teacher's `<data>` text and the
  normalised share ("14 valores · 70 %"; a weight written as a percentage is
  not repeated); parts are indented rows reading "15 % (30 % de CE)"; bonus
  rows read "Bónus · até 2 valores". Other children follow the table.
- **Formula.** Coefficients are on each top-level component's own scale and a
  coefficient of 1 is omitted: "Nota = E + AP + P",
  "Nota = 0,1 × A + 0,2 × T1 + 0,2 × T2 + 0,5 × E". Bonus items are added as
  "+ B".
- **Calculator.** A `<fieldset>` "Simular a nota" with one labelled field per
  leaf component and per bonus item ("E: Exame final (0 a 14)"; the label
  leaves out the item's `<span>` description). Comma or dot are accepted. A
  value out of range shows an error linked with `aria-describedby` and sets
  `aria-invalid`. An empty bonus counts as 0; any other empty field shows
  "Preenche todas as componentes para ver a nota.". The result is an
  `<output>` ("Nota final: 12,4 valores") with a state line ("Aprovado nesta
  simulação", "Abaixo do mínimo em E (4,9 em 14)" or "Abaixo de 9,5"),
  announced 300 ms after typing stops. A fixed note says the official grade is
  the one published on SIGARRA. Nothing is saved.
- Without JavaScript: the teacher's list with the weights as written.

#### `<uc-assessment-info>`

A summary card of one configured deadline, at the top of an exam or test page.
The rest of the page (rules, syllabus, past papers) is written inside the
element and stays below the card.

```html
<uc-assessment-info deadline="t1" calendar>
  <h2>Regras</h2> …
</uc-assessment-info>
```

| Attribute | Values | Default | Notes |
| --- | --- | --- | --- |
| `deadline` | deadline id | required | Date, time, duration, location, shifts, note and links come from it. |
| `calendar` | boolean | absent | "Adicionar ao calendário" button that downloads an `.ics` file made in the browser. Not shown when the date is not a full day. |
| `heading` | text \| `none` | the deadline's `title` | |
| `heading-level` | `2`–`6` | `2` | Level of the generated heading. |

- **Card.** A `<dl>` with the rows that have data, in this order: Date (long,
  with the weekday: "quarta-feira, 5 de novembro de 2025"; a month or "Por
  marcar" otherwise), Time ("14:30–16:30") or Shifts (one line per shift:
  "14:30–16:30 · FC1 120 · note", with the shift's day when it differs),
  Duration ("2 h"), Location, Status, Links (the deadline's `url`, unless it
  is this page, and its `links`). The deadline's `note` follows the list.
- **Status** (text in a tag): "Daqui a 5 dias", "Amanhã", "Hoje", "A decorrer"
  (inside a multi-day deadline), "Realizado", "Por marcar". No status row
  when the date is `null`.
- **Calendar file.** `<code>-<id>.ics` (RFC 5545): one event per shift, times
  in `Europe/Lisbon` (with its `VTIMEZONE`), `LOCATION` from the plain text of
  the location, `URL` of the page; a deadline without a time becomes an
  all-day event. The button's name says what it downloads ("Adicionar ao
  calendário, ficheiro .ics").
- **Unknown id.** One console warning; only the children are shown.
- Without JavaScript: only the children. Write the date in a `<noscript>` on
  exam pages.

## 4. CSS building blocks

Layout pieces that need no behaviour are plain CSS classes, usable anywhere:

| Class | Use |
| --- | --- |
| `uc-card` | Bordered surface. `uc-card--accent` for the highlighted variant. |
| `uc-grid` | Responsive auto-fit grid. `--uc-grid-min` sets the minimum column width (default 220px). |
| `uc-stack` | Vertical rhythm container (`gap` from `--uc-stack-gap`). |
| `uc-tag` | Small badge. Variants: `uc-tag--accent`, `uc-tag--warning`, `uc-tag--success`, `uc-tag--muted`. |
| `uc-table` | Put on a wrapper `<div>` around a `<table>`: horizontal scroll, borders, header style. While the table overflows, the kit makes the wrapper focusable (`tabindex="0"`, `role="region"`, labelled by the `<caption>`) so it can be scrolled with the keyboard. Set `--uc-table-min` (default `560px`) to change the minimum table width. |
| `uc-links` | A `<ul>` of links with a secondary description in a `<span>`. |
| `uc-shortcuts` | A `<nav>` or `<ul>` of large link buttons (quick access). |
| `uc-callout` | Soft grey panel; `uc-callout--warning` for amber. |
| `uc-checklist` | A `<ul>` with check icons. The kit adds `role="list"` to `uc-links`, `uc-shortcuts` and `uc-checklist` lists, which Safari would otherwise not announce as lists. |
| `uc-split` | Two columns (main + narrower side) that stack below 960px. |
| `uc-section` | A page section: spaces its own children (heading, text, blocks) evenly. |
| `uc-bullets` | A `<ul>` with simple bullets and comfortable spacing. |
| `uc-button` | Link or button styled as a button; `uc-button--primary` filled, `uc-button--sm` compact (tables, toolbars). |
| `uc-lead` | Larger intro paragraph. |
| `uc-prose` | Readable text column (max 720px, secondary colour). |
| `uc-content` | Wrapper for plain HTML written without kit classes (pasted from an older site or an editor): spacing for headings, paragraphs, lists, tables, `<pre>` and images. `<img class="uc-content__float">` floats right on wide screens. |
| `<pre data-copy>` | Adds a copy button to the top-right corner of a preformatted block (for example the input and output of a problem's examples). The value names what is copied in the button's accessible label: `data-copy="Input"` reads "Copiar Input"; an empty value reads "Copiar". Works anywhere on the page, not only inside `uc-content`, with the same box (background, padding, rounded corners). |
| `a[data-auth]` | Link that needs a login. The kit adds a decorative lock icon (`uc-auth-icon`, `aria-hidden="true"`) after the text and a visually hidden "(Requer autenticação)" (`uc-auth-label`); with a value it names the system: `data-auth="SIGARRA"` → "(Requer autenticação: SIGARRA)". Works in page HTML, in `HTMLText` from `course.js` and inside components. Without JavaScript it is a normal link. |
| `uc-muted`, `uc-mono`, `uc-small` | Text utilities. |
| `uc-visually-hidden` | Hidden visually, available to screen readers. |

## 5. Design tokens (CSS custom properties)

Defined on `:root` in `uc-kit.css`. Override them in `theme.css`.

| Token | Default | Use |
| --- | --- | --- |
| `--uc-color-accent` | `#1D4ED8` | Links, active navigation, primary buttons. Set from `accentColor`. |
| `--uc-color-accent-strong` | derived (70% accent, 30% black) | Hover. |
| `--uc-color-on-accent` | `#FFFFFF` | Text on accent backgrounds (primary buttons). |
| `--uc-color-accent-soft` | derived (`#EDF1FC`: 8% accent on white) | Active nav background, accent tags. |
| `--uc-color-highlight` | derived (`#F4F6FD`: 5% accent on white) | Current week band. |
| `--uc-color-text` | `#18181B` | Body text. |
| `--uc-color-text-secondary` | `#3F3F46` | Secondary paragraphs. |
| `--uc-color-text-muted` | `#52525B` | Metadata, labels. |
| `--uc-color-text-subtle` | `#6E6E77` | Navigation group labels. |
| `--uc-color-border` | `#E4E4E7` | Borders and rules. |
| `--uc-color-surface` | `#FFFFFF` | Page background. |
| `--uc-color-surface-muted` | `#F4F4F5` | Tags, callouts, hover. |
| `--uc-color-surface-sunken` | `#FAFAFA` | Table headers. |
| `--uc-color-warning-text` | `#92400E` | Assessment and "new" badges (text). |
| `--uc-color-warning-bg` | `#FEF3C7` | Assessment and "new" badges (background). |
| `--uc-color-warning-surface` | `#FFFBEB` | Event panels. |
| `--uc-color-warning-border` | `#FDE68A` | Event panel borders. |
| `--uc-color-success-text` | `#166534` | Correct answers, exercises marked done, `uc-tag--success` (text). |
| `--uc-color-success-bg` | `#DCFCE7` | The same (background). |
| `--uc-color-danger-text` | `#991B1B` | Failed tests, run errors, wrong answers. |
| `--uc-color-danger-bg` | `#FEE2E2` | Background paired with `--uc-color-danger-text`. |
| `--uc-font-sans` | `Inter, system-ui, sans-serif` | Body. |
| `--uc-font-mono` | `"JetBrains Mono", ui-monospace, monospace` | Code, dates, codes. |
| `--uc-font-size-base` | `100%` | Root size, as a share of the reader's browser setting (16 px by default); the type scale is relative to it. |
| `--uc-font-size-xs` … `--uc-font-size-display` | `0.75rem` … `2.5rem` | Type scale: `-xs` 12px, `-sm` 13px, `-md` 14px, `-body-sm` 15px, `-lg` 18px, `-h3` 20px, `-h2` 22px, `-h1` 36px, `-display` 40px (at the 16px base). Below 760px `-h1` is `1.875rem` and `-display` `2rem`. |
| `--uc-line-height` / `--uc-line-height-tight` | `1.6` / `1.25` | Body text / headings. |
| `--uc-radius-sm` / `-md` / `-lg` | `6px` / `8px` / `12px` | Corners. |
| `--uc-space-1` … `--uc-space-12` | `4px` steps | Spacing scale. |
| `--uc-content-max` | `1200px` | Page width. |
| `--uc-sidebar-width` | `216px` | Navigation column. |
| `--uc-header-height` | `64px` | Height of the `<uc-page>` top bar; sticky offsets use it. |
| `--uc-gutter` | `32px` (`16px` below 760px) | Horizontal page padding. |
| `--uc-target-min` | `44px` | Minimum touch target. |
| `--uc-focus-ring` | `2px solid var(--uc-color-accent)` | Focus outline. |

**Local tokens.** These are not defined on `:root`: the kit reads them with a
fallback, so they can be set on `:root` for the whole site or on one element
(`style="--uc-grid-min: 160px"`) to change only that block.

| Token | Fallback | Use |
| --- | --- | --- |
| `--uc-grid-min` | `220px` | Minimum column width of `uc-grid`. |
| `--uc-grid-gap` | `12px` | Gap of `uc-grid`. |
| `--uc-stack-gap` | `16px` | Gap of `uc-stack`. |
| `--uc-table-min` | `560px` | Minimum table width inside `uc-table`. |
| `--uc-card-padding` | `20px 24px` | Padding of `uc-card` (team cards use `16px 20px`). |
| `--uc-main-gap` | `48px` | Space between the top-level blocks of the `<uc-page>` main content. |
| `--uc-guide-gap` | `48px` | Space between the blocks of a `<uc-guide>`. |
| `--uc-notices-date-width` | `64px` | Date column of `<uc-notices>`. |
| `--uc-deadlines-date-width` | `5.25rem` | Date column of `<uc-deadlines>` in the list view. |
| `--uc-timetable-time-width` | `7.5rem` | Time column of `<uc-timetable view="days">`. |
| `--uc-grading-bar-height` | `12px` | Height of the proportions bar of `<uc-grading>`. |
| `--uc-summaries-date-width` | `10rem` | Date column of `<uc-summaries>` on wide screens. |

Fonts (Inter, JetBrains Mono) are served with the kit from `kit/v1/fonts/` and declared in `uc-kit.css`; no third-party request is made. Preload `fonts/inter-latin.woff2` from the page (section 1) so it downloads in parallel with the CSS.
Setting `--uc-font-sans: system-ui, sans-serif` in `theme.css` uses the
system font and skips downloading Inter, if a course prefers.

## 6. Languages

- Interface strings live in `kit/src/i18n/<lang>.js` (`pt` and `en` in v1).
  Adding a language means adding one dictionary file.
- **Active language** is resolved in this order: `?lang=` query, saved choice
  (`localStorage` key `uc:lang`), `<html lang>`, first of `languages`.
- **In-place bilingual content:** any element with a `lang` attribute whose
  value is a configured language but not the active one is hidden. Untagged
  content is always visible. `data-uc-keep-lang` on an element with `lang`
  keeps it visible in every language (a quotation, a term in the original).

  ```html
  <p lang="pt">As aulas começam a 16 de setembro.</p>
  <p lang="en">Classes start on 16 September.</p>
  ```

- **Per-language files:** when a page `href` is a `LocalizedText`, the switch
  navigates between files instead.
- The kit sets `<html lang>` to the active language and fires
  `uc:languagechange` on `document`.

## 7. JavaScript API (for extensions)

`uc-kit.js` defines a single global, `window.UC`:

| Member | Description |
| --- | --- |
| `UC.version` | Kit version string. |
| `UC.course` | The normalised configuration (read-only). |
| `UC.lang` | Active language code. |
| `UC.setLanguage(code)` | Switches language. |
| `UC.t(key, params?)` | Translates an interface string. |
| `UC.text(localizedText, lang?)` | Resolves a `LocalizedText` in the active language, or in `lang`. |
| `UC.today()` | "Today" as a `Date` at local midnight (honours `today`). |
| `UC.formatDate(isoOrDate, format?)` | Formats like `<uc-date>`. |
| `UC.formatDateRange(start, end, format?)` | Formats a range, e.g. "25–28 nov"; with `format` `medium` adds the year. |
| `UC.weekOf(date)` | `{ n, start, end }` or `null` outside the semester. |
| `UC.weekDates(n)` | `{ n, start, end }` for week `n`, or `null`. |
| `UC.formatTime(time, end?)` | "14:00" or "14:00–15:00" (24-hour in every language). |
| `UC.formatDuration(minutes)` | "2 h", "1 h 45 min", "45 min". |
| `UC.weekdayName(day, format?)` | `Weekday` → "terça-feira" (`long`) or "3.ª" / "Tue" (`short`, default). |
| `UC.Element` | Base class for components (see below). |
| `UC.define(name, class)` | Registers a component once (safe to call twice). |
| `UC.addTranslations(lang, dict)` | Adds or overrides interface strings. |
| `UC.registerRunner(name, runner)` | Adds or replaces a code runner (7.1). |

`UC.Element` extends `HTMLElement` and provides `render()` (called on
connect and on language change), `this.t()`, `this.text()`, and
`this.course`. Extensions follow the same rules as built-in components:

```js
UC.define("uc-bst-traversal", class extends UC.Element {
  render() { /* … */ }
});
```

Events on `document`:

| Event | When |
| --- | --- |
| `uc:ready` | Configuration loaded and built-in components defined. Fires while the kit script runs: scripts loaded after it (extensions with `defer`) find `window.UC` ready and do not need it. |
| `uc:languagechange` | After the active language changes. `event.detail.lang`. |
| `uc:exercisechange` | Bubbles from a `<uc-exercise>` when it is marked done or not done. |
| `uc:classchange` | On `document`, when "My class" of a `<uc-timetable>` changes. `event.detail = { type, class }` (`class` is `""` for all). |

### 7.1 Code runners

Pages never talk to an execution service directly: `<uc-code run>` asks
the kit, and the kit picks a *runner* from `UC_COURSE.runner`. Changing
provider (public Codapi, a self-hosted Codapi, Judge0, an in-browser
engine…) is a configuration change; no page has to be edited.

```js
// course.js — all fields optional; these are the defaults.
runner: {
  provider: "codapi",                    // runner for languages not listed below
  languages: { javascript: "browser", js: "browser" },
  codapi: {
    url: "https://api.codapi.org/v1",    // or a self-hosted Codapi
    sandboxes: { c: "gcc", "c++": "cpp", py: "python" },  // block lang → sandbox
    timeout: 20000,
  },
  browser: { timeout: 5000 },
},
```

Built-in runners:

| Name | Runs | Notes |
| --- | --- | --- |
| `codapi` | Java, Python, C (`gcc`), C++, Haskell… | Sends the files to Codapi's `/exec`. The public service is free and rate limited; a course with many students should self-host it. |
| `browser` | JavaScript | Web Worker, no network, no DOM; `console.log` is the output. |

A runner is an object with `run(request, options)` that returns a Promise:

```js
UC.registerRunner("judge0", {
  run({ language, files }, options) {   // files[""] is the entry file
    // options = UC_COURSE.runner.judge0
    return fetch(/* … */).then(() => ({ ok: true, stdout: "…", stderr: "", duration: 120 }));
  },
});
// course.js: runner: { provider: "judge0", judge0: { url: "…" } }
```

A runner may also have `supports(language)`, returning `false` for languages
it cannot run; `<uc-code run>` then shows no "Run" button for them. Without
it, every language is assumed to run.

Reject the Promise only when the code could not be run at all (network,
timeout); compilation and runtime errors resolve with `ok: false` and the
message in `stderr`.

## 8. Customisation levels

| Level | How | Example |
| --- | --- | --- |
| 0 | `course.js` | `accentColor`, `logo`, `pages`, `languages`. |
| 1 | Tokens in `theme.css` | `:root { --uc-color-accent: #0F766E; --uc-radius-lg: 4px; }` |
| 2 | Any CSS in `theme.css` | `.uc-week__title { text-transform: uppercase; }` — classes listed in the component reference are stable. |
| 3 | Own components | `UC.define("uc-my-widget", …)` in a local script. |
| 4 | Free HTML | Any markup anywhere, with or without kit components. |

Kit CSS uses `:where()` so its selectors have zero specificity and any
teacher rule wins.

## 9. Versioning

- `kit/v1/` is the stable URL of major version 1. Fixes and additive features
  are published in place; nothing listed in this document is removed or
  changed incompatibly.
- Breaking changes go to `kit/v2/`. Old course sites keep working because
  they reference `v1`.
- Each release is also frozen as `kit/vX.Y.Z/` (e.g. `kit/v1.0.0/`). Its files
  never change, so browsers cache them for a year without checking again
  (`Cache-Control: immutable`). A course site that points to an exact
  release gets the fastest repeat visits and keeps the same kit for the whole
  semester; to update, change the version in the `<head>` of each page (one
  search and replace). `kit/v1/` is cached for 5 minutes and then revalidated
  in the background, so it picks up fixes automatically.
- `uc-kit.js` and `uc-kit.css` are minified. Their source maps
  (`uc-kit.js.map`, `uc-kit.css.map`) contain the original files, so the
  browser's developer tools show readable code.
- `UC.version` and `CHANGELOG.md` record the exact version.

## 10. Out of scope for v1

- Dark theme (tokens make it possible later).
- In-browser engines for languages other than JavaScript (CheerpJ, Pyodide)
  — possible as runners (7.1).
- Any server-side feature (search, authentication, forms).
