# UC Design Kit — API contract (v1)

This document is the public contract of the kit. Code, tests, examples and
documentation follow it. Anything listed here is stable within major
version 1; changing it requires its own pull request.

- Status: **draft for review** (milestone M0.2)
- Kit version: 1.1.0
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
  <link rel="stylesheet" href="https://uc-design-kit.miguelrocha.dev/kit/v1/themes/compact.css">  <!-- optional, a ready-made theme (8.1) -->
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
- `v1` can be replaced by an exact release such as `v1.1.0` (all three URLs),
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

**Values only.** The maintenance script `uc-site.py` (shipped with the
template, see the teacher guide "Manter o site") reads `course.js` without
running it, so the file may hold only: comments; exactly one
`window.UC_COURSE = <value>;`; before it, optional constants
`const NAME = <value>;` (`let`/`var` accepted); values (objects with quoted or
unquoted keys, arrays, strings with `'`, `"` or `` ` ``, numbers, `true`,
`false`, `null`, trailing commas); a constant used as a value, strings joined
with `+`, and `${NAME}` inside a template string. Functions, `new Date()`,
method calls, spread, computed keys and other assignments are errors that
`uc-site.py` reports with their line. The browser itself is unaffected.

**`uc-site.py`** (Python 3.8+, standard library only, in the site folder):
`python3 uc-site.py [check|index] [--site DIR] [--fix-permissions] [--quiet]
[--stdout] [--lang pt|en] [--version]`. It checks `course.js` (readable, `title`, every
`pages` file exists, valid dates, unique deadline ids, local `url` and links in
HTML texts), local `href`/`src`/`srcset` targets (exact case; a folder needs
its `index.html`; external, fragment-only and outside-the-folder references are
skipped), that every page with `<uc-page>` loads `uc-kit.css`, `course.js` and
`uc-kit.js`, duplicate `id`s, `lang` values outside `languages` (2+ languages),
`<img>` without `alt`, a missing `<h1>` (`<uc-hero>` counts), skipped heading
levels, read permissions for the web server and pages nothing links to. One
line per problem (`ERROR`/`WARNING`/`INFO`, file and line); exit status `0` no
errors, `1` errors, `2` wrong usage. It never changes `course.js` or the
pages.

**Search index.** With `search: true` (or `search: { index, exclude }`) in
`course.js`, the default command and `index` also write `search-index.js`
(mode `644`, written to a temporary file and renamed), even when the checks
found errors; `index --stdout` prints it instead. It holds every `.html` page
of the folder, minus `search.exclude` entries (paths relative to the site; a
trailing `/` is a folder), folders starting with `_` or `.`, and pages with
`<uc-page search="noindex">`. Each page is split into sections at `<h2>`,
`<h3>`, `<uc-week n>` (`week-<n>`), `<uc-exercise id>`, `<uc-question id>`,
`<li id>` and `<article id>`; `data-search-title` replaces a section title and
`data-search-ignore` leaves an element out. `<script>`, `<style>`, `<nav>`,
`<svg>`, `<template>`, `<noscript>` and the body of `<uc-code>` (only its
`filename`) are left out. Headings without an `id` inside `<uc-page>` get the
automatic id the kit gives them (slug of the text in the first language,
`-2`, `-3`… when taken). On sites with 2+ languages a page with `lang` text
gives one entry per language. The file is a script that sets
`window.UC_SEARCH_INDEX` (format version `1`, one page per line), so it also
loads from `file://`; `SOURCE_DATE_EPOCH` fixes its `generated` time. Full
rules: `docs/architecture/search-api.md` sections 4 to 6. The kit reads it.
Above 1 MB the script prints a warning after the summary (the first
search of a visit gets slower; leave folders out with `search.exclude`). The
template ships with `search: true` and a `search-index.js` for its sample
pages, which the first run of the script replaces.

### 2.1 Types

| Type | Definition |
| --- | --- |
| `LocalizedText` | A string (same in every language) or an object `{ [languageCode]: string }`. Missing languages fall back to the first language in `languages`, then to any available value. |
| `ISODate` | `"YYYY-MM-DD"`. A deadline may also use `"YYYY-MM"` (month known, day not) or `null` (to be scheduled). |
| `Time` | `"HH:MM"`, 24-hour. |
| `Weekday` | ISO weekday number: `1` = Monday … `7` = Sunday (as `semester.teachingDays`). |
| `Minutes` | A whole number of minutes, e.g. `120` for two hours. |
| `HTMLText` | A `LocalizedText` whose values may contain inline HTML (links, `<strong>`, `<em>`, `<code>`). It is written by the teacher and inserted as HTML. |
| `ThemeName` | The name of a ready-made theme in `kit/v1/themes/`: a theme with a layout (8.3), `"classic"`, `"modern"`, `"institutional"`, `"handbook"` or `"editorial"`, or a token theme (8.1), `"compact"`, `"serif"` or `"high-contrast"`. |

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
| `theme` | `ThemeName` \| `ThemeName[]` | no | — (as `"classic"`) | Ready-made themes: `"classic"` (8.3; the template sets it), `"modern"`, `"institutional"`, `"handbook"`, `"editorial"` (8.3), `"compact"`, `"serif"`, `"high-contrast"` (8.1). A list holds at most one theme with a layout (the last one wins, with a console warning) and any token themes. `"classic"` is the kit's own look and downloads nothing. For the others the kit adds `kit/v1/themes/<name>.css` (next to `uc-kit.js`) right after the `uc-kit.css` link, in order, unless the page already links it, and shows the page once they loaded (within the 300 ms wait of 3.1). Unknown names are ignored with a console warning. |
| `layout` | a layout name (8.3) | no | the theme's, else `"sidebar"` | Default `layout` of every `<uc-page>` (3.1): a page's own attribute wins over it, and it wins over the theme's `--uc-layout` (8.3). Kept as written in `UC.course.layout` (or `null` when missing or not a string, with a warning), since a site layout may be registered later; a name that is not a known layout is skipped with a warning when the page is drawn. |
| `aside` | (`"deadlines"` \| `"notices"` \| `"this-week"` \| `"office-hours"` \| `"platforms"`)[] | no | `["deadlines", "notices"]` | Blocks of the column of the layout `aside` (3.1), in order: `<uc-deadlines per-kind="1">`, `<uc-notices limit="3">`, `<uc-this-week>`, the office hours of the coordinator (the member with `role: "coordinator"` and `officeHours`, else the first member with `officeHours`) and the platforms. A block whose element the page's content already has (`<uc-deadlines>`, `<uc-notices>`, `<uc-this-week>`, and `<uc-team>` or `<uc-timetable>` for `"office-hours"`) is not repeated. Unknown names are dropped with a warning; `[]` leaves the column out. |
| `panel` | boolean | no | `true` | `false`: the bar of the layout `panel` (3.1) has no timetable summary at the bottom. |
| `logo` | URL \| SVG string \| `{ src \| svg, alt? }` \| `null` | no | built-in tree icon | Header mark, shown 28 × 28 px. A string starting with `<` is inline SVG (it inherits the accent colour through `currentColor`; give it a `viewBox`). `alt` (`LocalizedText`) makes the mark an image with that name; without it the mark is decorative (`alt=""` / `aria-hidden`), since the course title is next to it. `null` hides it. |
| `semester.start` | `ISODate` | for week features | — | First day of classes; week 1 is the calendar week containing it. |
| `semester.weeks` | number | no | `14` | Number of teaching weeks (breaks not counted). |
| `semester.teachingDays` | `[from, to]` | no | `[1, 5]` | ISO weekdays with classes (1 = Monday … 7 = Sunday). Week ranges are shown with these days, e.g. `[2, 5]` → "25–28 nov". |
| `semester.breaks` | `{ start, end, label }[]` | no | `[]` | Weeks without classes. Weeks are numbered skipping them. A calendar week that has any teaching day inside a break is a break week as a whole. |
| `pages` | `(PageId \| Page)[]` | no | `["home"]` | Navigation, in order. See 2.3. |
| `platforms` | `Platform[]` | no | `[]` | External links listed under "Platforms" in the navigation. See 2.8. |
| `team` | `TeamMember[]` | no | `[]` | See 2.4. |
| `schedule` | `ScheduleEntry[]` | no | `[]` | Weekly classes. See 2.7. Read by `<uc-timetable>` and, for the lectures, by the layout `panel` (3.1). |
| `scheduleTypes` | `{ [type]: LocalizedText }` | no | — | Labels for custom schedule types, or to rename built-in ones, e.g. `{ seminar: { pt: "Seminários", en: "Seminars" } }`. |
| `deadlines` | `Deadline[]` | no | `[]` | See 2.5. |
| `notices` | `Notice[]` | no | `[]` | See 2.6. |
| `footer` | `HTMLText` | no | course title + institution | Footer left side. |
| `source` | `{ author: HTMLText, url?: URL }` | no | — | Where the content comes from, for sites copied from an older one: a line in the footer, "Conteúdo de {author}, a partir do site original.", with "site original" linking to `url`, or to the page's own `<uc-page source>` (3.1). Without `url` and without `source=`, the line has no link. |
| `updated` | `ISODate` | no | — | "Last updated" in the footer. One page can show its own date with `<uc-page updated>` (3.1). |
| `editions` | URL | no | — | Address of the shared editions file, relative to `course.js`, usually `"../editions.js"`. See 2.9. |
| `today` | `ISODate` | no | the real date | Freezes "today" (demos, screenshots). The query string `?today=YYYY-MM-DD` overrides it. |
| `runner` | object | no | Codapi + browser | Where `<uc-code run>` executes code. See 7.1. |
| `search` | `true` \| `{ index?, exclude? }` | no | off | Site search (on in the template). `true` = `{ index: "search-index.js", exclude: [] }`. `index` is the index file, relative to `course.js`, written by `uc-site.py`; `exclude` is read by the script only. Normalised to `UC.course.search = { index, exclude }` or `null`. See 3.1 and 7. |

### 2.3 Pages

A page entry is either a built-in id or an object:

```js
pages: [
  "home",                                         // built-in: href "index.html", label "Início"/"Home"
  { id: "weeks", href: "semanas.html" },          // built-in id, custom file name
  { id: "contests", href: "contests.html", label: { pt: "Concursos", en: "Contests" } },
  { id: "about", href: { pt: "sobre.html", en: "about.html" } },  // one file per language
  { id: "assessment", href: "avaliacao.html", description: "Componentes, datas e regras." }
]
```

`description` (`HTMLText`, optional) is one sentence about the page, shown
under its name on its card in `<uc-tiles>` (3.1). Nothing else reads it.

A page that is not in `pages` (a lab guide, a problem statement) and has one
file per language names its translations in its `<head>`, with
`<link rel="alternate" hreflang="en" href="aula05.html">`. The language switch
then goes to that file, as it does for `pages` with one `href` per language.
A `<link rel="alternate">` wins over `pages` when both exist.

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

### 2.8 Platform

| Field | Type | Notes |
| --- | --- | --- |
| `label` | `LocalizedText` | Required. Shown in the navigation and as the judge tag of `<uc-problems>`. |
| `url` | URL | Required. |
| `id` | string | Optional short name, used by `<uc-problems data-judge="codeforces">`. Without it, `data-judge` is matched against `label`, ignoring case and accents. |
| `hidden` | boolean | Default `false`. `true` keeps the platform out of the navigation while `<uc-problems>` still knows it (a judge used by one series). |

```js
platforms: [
  { id: "mooshak", label: "Mooshak", url: "https://mooshak.dcc.fc.up.pt/~edados/" },
  { id: "codeforces", label: "Codeforces", url: "https://codeforces.com", hidden: true },
],
```

### 2.9 Editions file (`editions.js`)

One file in the course folder, **above** the year folders, shared by every
edition. Each year's `course.js` points to it with `editions`:

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
| `label` | string | Required. Compared with `edition` of `course.js` to find the edition of the current page. |
| `href` | URL | Required. Relative to `editions.js`. |

When `editions` is set, the kit loads the file with an injected `<script>`
(it works from `file://`; a missing file logs one warning). Then `<uc-page>`
shows an "Outros anos" button next to the brand in the header, with a list of
the other editions (a disclosure: `aria-expanded`, Esc closes it and returns
focus), and, on an edition that is not the first of the list, a notice at the
top of `<main>`: "Esta página é da edição 2024/25. Ver a edição atual
(2025/26)." Because the file lives outside the year folders, adding a year
updates the older sites without editing them. Sites without `editions` are
unchanged.

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
| `layout` | `sidebar` \| `top` \| `full` \| `banner` \| `docs` \| `centered` \| `panel` \| `aside` \| `onepage` \| a site layout (8.3) | `layout` of `course.js`, else the theme's `--uc-layout`, else `sidebar` | An unknown name is skipped with a warning (the next of those decides). `top` puts the navigation (pages, then platforms) in a bar under the header, wrapped in `.uc-topnav`, and gives the content the whole width; below 960 px it is the same collapsible menu as the sidebar. `full` hides the navigation (single-page sites, guides). `banner` (file `kit/v1/layouts/banner.css`, added by the kit when needed) puts the header, the first `<uc-hero>` written directly in the page and the navigation as tabs in one band of `--uc-color-accent-strong` (`.uc-banner`, `.uc-banner__inner`, `.uc-banner__hero`); the hero is moved, not copied, so the page keeps one `h1`, and without one the band only has the header and the tabs. Below 960 px the "Menu" button is inside the band. Prints without colour. `docs` (file `kit/v1/layouts/docs.css`) has three columns, up to `--uc-content-max` + 240 px: the navigation, the content and "Nesta página" (`.uc-toc`), a `<nav>` listing the `<h2>`/`<h3>` of the page that have an id (every one has, `core/anchors.js`), without those marked `data-nav="off"` (or inside such an element) and those of another language; the one in view has `aria-current="location"`. The list only shows with two or more entries. A `<uc-guide>` in the page puts its progress at the top of that column and makes no list of its own. From 1200 px down the list is a button "Nesta página · N secções" above the content that opens it, like "Menu"; Escape closes it. Prints like `full`. `centered` (file `kit/v1/layouts/centered.css`) has the structure of `top` (`.uc-topnav` under the header) styled as a book: the header is a centred column with the course title in large type, the search and language buttons in its top corner (above 960 px), the navigation centred between two lines with the current page underlined, and the content is one column of `--uc-reading-max` (760 px) where `.uc-split` stacks. Below 960 px the "Menu" button is centred above the content. Prints like `full`. `panel` (file `kit/v1/layouts/panel.css`) has no header band: the header (with the class `.uc-panel__brand`), the navigation and a timetable summary (`.uc-panel__info`) form one full-height bar on the left (`.uc-panel`, `--uc-panel-width` 272 px) that stays in place while the content scrolls. The summary lists the lectures of `schedule` (entries with the same time and room merge their days: "3.ª e 5.ª · 14:00–15:00 · FC4 0.41") and the coordinator's office hours, under "Teóricas" and "Atendimento"; `panel: false` in `course.js` leaves it out. Below 960 px the page looks like `sidebar` (header on top, then "Menu") and the summary is hidden. Prints like `full`. `aside` (file `kit/v1/layouts/aside.css`) adds, on every page, a column of blocks after `<main>`: an `<aside class="uc-aside">` named "Destaques", with the blocks of `aside` in `course.js` (2.2) as cards, up to `--uc-content-max` + 200 px. From 1200 px down the blocks go below the content; on phones they come last. Prints without them. `onepage` (file `kit/v1/layouts/onepage.css`) is the course site on one page: no sidebar; under the header, a `<nav class="uc-anchors">` (named like the navigation) that stays at the top while the page scrolls, with the page's sections, the `<h2>` of `<main>` that have an id, without those marked `data-nav="off"` (or inside such an element) and those of another language, then the other pages of `pages` (not the current one). The section in view has `aria-current="location"`; a heading reached from the bar is not hidden under it (`scroll-margin-top`). The bar is one line at every width and scrolls sideways when it does not fit, keeping the marked section in sight; there is no "Menu" button. Platforms are not in the bar. The content takes the whole width. Prints like `full`. |
| `toc` | `off` | — | Layout `docs`: no "Nesta página" column on this page (a `<uc-guide>` keeps its own list and progress). |
| `aside` | `off` | — | Layout `aside`: no column of blocks on this page. |
| `search` | `off` \| `noindex` | — | `off`: no search button on this page. `noindex`: `uc-site.py` leaves the page out of the search index (the button still shows). |
| `source` | URL | `source.url` of `course.js` | Address of this page on the original site: the link of the footer line "Conteúdo de …, a partir do site original" (2.1, `source`). Ignored when `course.js` has no `source`. |
| `updated` | `ISODate` \| `auto` | `updated` of `course.js` | Date shown in the footer for this page ("Atualizado a 20 nov 2025"). `auto` uses `document.lastModified`, but only when the server sent a `Last-Modified` header (a value more than 5 s before the page started loading; browsers report "now" otherwise) or the page is opened from `file://`; otherwise the footer shows no date. |

With `editions` in `course.js` (2.9), the header also has "Outros anos" and
older editions show a notice at the top of `<main>`. Stable classes:
`uc-page__editions`, `uc-page__editions-button`, `uc-page__editions-menu`,
`uc-page__edition-notice` (a `uc-callout`).

**Automatic heading ids.** Before any component renders, every `<h2>` and
`<h3>` written inside `<uc-page>` without an `id` gets one, so that any
section can be linked (`semanas.html#exercicio-2`) and the search index can
point at it. The id is the heading text without accents, in lowercase, with
every run of other characters turned into `-` (`Exercício 2` →
`exercicio-2`; nothing left → `section`); a repeated id gets `-2`, `-3`, … in
page order. Ids written in the HTML never change and are never reused, and
`week-<n>` of every `<uc-week n>` counts as taken. On a bilingual site the
text of the **first** language is used (or the file's own language when
`pages[].href` gives the page one file per language), so the id is the same
whatever language the visitor reads. `template/uc-site.py` applies the same
rule; both run the cases of `tests/search/slugs.json`.

**Links to a section.** The page is shown only after the components render,
so the kit scrolls to the `#hash` target again once the page is visible and
marks it for 2 s with the class `uc-target-flash` (a soft accent background
and outline; no transition with `prefers-reduced-motion`).

**Search button**. With `search` in `course.js`, the kit
asks once per visit, when the browser is idle, whether the index file exists
(`HEAD`, no cache, 5 s timeout; the answer is kept in `sessionStorage` under
`uc:<course>:search`; over `file://` the index is loaded instead). While it
waits, the header keeps an invisible placeholder of the button's size; if the
index exists, the header shows **Pesquisar** before the language switch
(`aria-haspopup="dialog"`, `aria-keyshortcuts="Control+K Meta+K /"`, a
`Ctrl K` hint, or `⌘ K` on Apple devices, on screens wider than 960 px; icon
only below 480 px, with the same accessible name), otherwise nothing. `Ctrl K`,
`⌘K` and `/` open the search (`/` types normally in fields and in
`<uc-code>`). Opening it loads `uc-search.js` (next to `uc-kit.js`) and the
index, once. Without `search` nothing of this runs and no request is made.
Stable classes: `uc-search-button`, `uc-search-button--pending`,
`uc-search-button__label`, `uc-search-button__hint`.

**Search dialog**. The button opens a modal
`<dialog class="uc-search-dialog">`. While `uc-search.js` (about 5 KB
gzipped) loads, the button has `aria-busy="true"`; if it cannot load,
"Não foi possível carregar a pesquisa." is announced and the next press tries
again. While the index downloads the dialog says "A carregar…"; if it fails,
it shows the same message and a "Tentar de novo" button. Results appear as
the visitor types, grouped by page (the label is the `pages[]` label of the
page's `g` and the page title, "Semanas · Guião 9"), at most 5 per page and
50 in all; `UC_COURSE.deadlines` and the notices already shown by
`<uc-notices>` are searched at runtime, in the groups "Prazos" and "Avisos"
(a deadline links to its `url`, else to the `assessment` page; a notice to
its first link, else to `home`). The field is a `combobox` controlling a
`listbox` (`aria-activedescendant`; ↑ ↓ Page Up/Down move, Enter opens, Esc
closes and gives focus back to the opener), the count goes into a
`role="status"` line, and the footer shows the index date
(`generated`). A result on the current page sets `#hash`, opens the
`<details>` around the target, scrolls, flashes it (`uc-target-flash`) and
moves focus to it. Matching rules: `<uc-search>`. Stable classes: the
`uc-search__*` classes of `<uc-search>` plus `uc-search-dialog`,
`uc-search-dialog__bar`, `__close`, `__body`, `__footer`, `__date`, `__keys`.

#### `<uc-hero>`

Course heading block: code, title (as `<h1>`) and tagline from the
configuration. Children, if any, are appended below the tagline.

#### `<uc-tiles>`

Mosaic for the home page: a list (`ul.uc-tiles__list`) with one card per page
of `pages` (2.3), without the current page, each a link
(`a.uc-card.uc-tiles__link`) with the page's name (`.uc-tiles__title`) and
its `description` (`.uc-tiles__text`) when it has one. During the semester
the card of the `weeks` page also shows the current teaching week and its
dates ("Semana 10 · 25–28 nov", `.uc-tiles__meta`) and stands out with the
soft accent background (`.uc-tiles__link--now`). Pages without an `href` are
left out. Names and descriptions follow the active language.

| Attribute | Values | Default | Notes |
| --- | --- | --- | --- |
| `pages` | page ids, separated by commas or spaces | every page but the current one | Picks the cards and their order (the current page too, when listed). An id that is not in `pages` is skipped with a console warning. |

#### `<uc-search>`

A search field with its results below it, inside a page. It is defined in `uc-search.js`, which `uc-kit.js` loads when the
site's index is known to exist (`uc:searchready`) and the page has a
`<uc-search>`: without `search` in `course.js` or without the index file the
element stays empty and nothing is downloaded. The index itself downloads
the first time the field gets focus ("A carregar…", or "Tentar de novo" on a
failure).

| Attribute | Values | Default | Notes |
| --- | --- | --- | --- |
| `scope` | path prefix | — | Only index pages whose `p` starts with it, e.g. `problemas/`. Without it, deadlines and notices are searched too. |
| `label` | text | `search.label` ("Pesquisar no site") | Visible label of the field. |
| `placeholder` | text | `search.placeholder` | Placeholder of the field. |
| `limit` | number | `10` | Most results shown. |

Matching (shared with the dialog, docs/architecture/search-api.md 9): the query is
folded like the index words (lowercase, accents removed) and split into
terms; every term of 3+ letters (or with a digit) that is not a stop word
must be the start of a word of the section title, the page title or the
text (stop words and 1–2 letter terms only add points; a query made only of
them requires them all). From 5 letters, one substituted letter or two
swapped neighbours also match, for fewer points. Points: section title >
page title > text; ties keep the index order. Entries whose `l` is not the
active language are skipped. Matched words are wrapped in
`<mark class="uc-search__mark">` (built as DOM nodes, never HTML from the
index).

The field is a `combobox` with a visible `<label>`, controlling a `listbox`
of options grouped by page (`aria-activedescendant`; ↑ ↓ Page Up/Down, Enter
opens, Esc clears); the count is announced through the shared live region
when typing pauses. Stable classes: `uc-search`, `uc-search__label`,
`uc-search__field`, `uc-search__input`, `uc-search__results`,
`uc-search__group`, `uc-search__group-label`, `uc-search__option`,
`uc-search__title`, `uc-search__text`, `uc-search__mark`,
`uc-search__message`, `uc-search__status`, `uc-search__retry`.


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
| `week-label` | boolean | With `week`: "Semana 6 · 20–24 out" (`uc-eyebrow uc-guide__week`) above the first visible `<h1>`, dates from `semester`. |
| `parent` | page `id` | The first breadcrumb is that page of `pages` (e.g. `assessment` for an exam guide) instead of "Semanas", and there is no week crumb. |
| `prev`, `next` | URL | "Guião anterior" / "Guião seguinte" links (`nav.uc-guide__pager`, `rel="prev"`/`"next"`) after the content. |
| `no-toc` | boolean | Hides the table of contents. |

#### `<uc-exercise>`

One exercise. Renders a numbered disclosure with title, optional metadata
badges and a "Mark as done" toggle persisted in `localStorage`.

| Attribute | Values | Notes |
| --- | --- | --- |
| `id` | string | Required for persistence. |
| `title` | text | Required. |
| `level` | `easy` \| `medium` \| `hard` | Optional badge. |
| `kind` | `main` \| `extra` \| `challenge` | Optional badge with the same texts as the types of `<uc-problems>` ("Extra", "Desafio"); `main` (default) shows none. |
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

It is defined in `uc-grading.js`, which `uc-kit.js` loads from its own folder
when the page has a `<uc-grading>` (at start, or when a script adds one
later). The page is shown once it has loaded, waiting at most 300 ms, as for
the fonts; if the file cannot load, the teacher's list stays as it is and the
console says `[uc-kit] could not load uc-grading.js next to uc-kit.js`.

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
  leaves out the item's `<span>` description, but keeps a `<span lang>` in
  the active language, so bilingual names work). Comma or dot are accepted. A
  value out of range shows an error linked with `aria-describedby` and sets
  `aria-invalid`. An empty bonus counts as 0; any other empty field shows
  "Preenche todas as componentes para ver a nota.". The result is an
  `<output>` ("Nota final: 12,4 valores") with a state line ("Aprovado nesta
  simulação", "Abaixo do mínimo em E (4,9 em 14)" or "Abaixo de 9,5"),
  announced 300 ms after typing stops. A fixed note says the official grade is
  the one published on SIGARRA. Nothing is saved.
- Without JavaScript: the teacher's list with the weights as written.

##### Formulas and rules

Since grading phase G2 the method can be written as text formulas, as on the
course slide, in an `<ol data-formulas>`, with the pass rules in a
`<ul data-rules>` (contract: `docs/architecture/grading-api.md` 3 to 8). The three
lists can be in any order; without a formulas list the element works as
above.

```html
<uc-grading scale="20">
  <ul>
    <li data-code="P">Avaliação prática</li>
    <li data-code="R">Resolução de problemas</li>
    <li data-code="E">Exame final</li>
  </ul>
  <ol data-formulas>
    <li><code>CF = max(0.75*E + 0.2*P + 0.05*R; 0.65*E + 0.3*P + 0.05*R)</code> Conta a fórmula mais favorável.</li>
  </ol>
  <ul data-rules>
    <li><code>E >= 4.9</code> Exame com pelo menos 4,9 valores.</li>
    <li><code>CF >= 9.5</code></li>
  </ul>
</uc-grading>
```

| Attribute | Values | Default | Notes |
| --- | --- | --- | --- |
| `result` | formula name | the last formula | Which formula is the final grade. |

- **Formulas.** One per `<li>`, in its first `<code>`; the rest of the item
  is a description shown under the formula (`.uc-grading__note`).
  `NAME = expression` names a formula; later formulas and rules may use the
  name. Expressions use numbers (`0.75` or `0,75`), component and part codes,
  earlier formula names, `+ - * /` (also `×`, `·`, `−`), parentheses and
  `max`/`min` (any case) with arguments separated by `;` (or a comma that is
  not between two digits: `max(1,5)` is one argument, 1.5). Never evaluated
  as code: a small parser turns the text into a tree.
- **Components.** Every top-level, non-bonus item needs a unique `data-code`
  (`[A-Za-z_][A-Za-z0-9_]*`, not `max`/`min`). The formula decides the
  weights, so a top-level `<data>` is not needed; on parts it still sets
  their weights inside the parent. Bonus items are not written in formulas:
  they are added to the result.
- **Weight columns and bars.** When the result is `max(…)`/`min(…)` each
  argument is a branch, and each branch is one weight column and one bar
  ("Fórmula 1", "Fórmula 2", or the formula's name when the branch is a
  named formula, linked to its paragraph with `aria-describedby`). One
  branch gives the usual "Peso" column. Weights are shown only when every
  branch is linear (sums of constant × code); otherwise the table has
  Component and Minimum only.
- **Rules.** `<code>expression comparison expression</code>` (`>=`, `>`,
  `<=`, `<`, `=`, `≥`, `≤`), then an optional description. `RESULT` is the
  final grade. An item without `<code>` is a text rule, shown as written.
  `data-min` and `pass` are shortcuts for `CODE >= n` and `RESULT >= n`, listed
  first; a written rule equal to one is not repeated. The list is headed
  "Para aprovar" (`.uc-grading__rules`); a rule `CODE >= n` on a component
  also fills its Minimum cell.
- **Errors.** A formula that cannot be read leaves the teacher's lists as
  written (no bars, no weight columns, no calculator) and writes one console
  warning with the formula number and column, e.g.
  `[uc-kit] uc-grading: formula 1, column 18: unknown name "X". Known: P, E.`
  A rule that cannot be read becomes a text rule, with a warning.
- **Calculator.** With formulas, `calculator` keeps the same fields (one per
  leaf and per bonus item) and evaluates the formulas as the student types
  (grading phase G3, contract 9). Its output, in order: one line with the
  value of each branch when there are two or more ("Fórmula 1: 12,8 ·
  Fórmula 2: 13", `.uc-grading__branches`); the final grade, named after the
  result formula and with the branch that counts ("Nota final (CF): 13
  valores (conta a Fórmula 2)"); one item per rule (`.uc-grading__checks`):
  "✓"/"✗" plus the words "cumprido"/"não cumprido" for screen readers, and
  "não verificado: …" for a text rule; then the state ("Aprovado nesta
  simulação.", "Aprovado nesta simulação, se cumprires os requisitos não
  verificados." when there are text rules, or "Não aprovado nesta simulação.
  Abaixo do mínimo: E ≥ 4,9" with the first rule that fails). The final grade
  is the result formula plus the bonus items, clamped to `[0, scale]`; in
  rules, `RESULT` and the result formula's name are that final grade. Rules
  are checked on unrounded values. A division by 0 gives "Não é possível
  calcular a nota com estes valores." One announcement, 300 ms after typing
  stops, says the final grade and the state. With only a rules list (no
  formulas) the calculator works as above, from `data-min` and `pass`, and
  does not check the written rules.
- **Examples.** The guide's "Exemplos das cadeiras" shows three real methods:
  two formulas with `max` and an exam minimum (Estruturas de Dados 2026/27,
  demo `docs/demos/uc-grading/edados-2627.html`); components graded 0–100
  with `data-scale="100"`, the literal formula
  `CF = (0.7*EF + 0.25*AP + 0.05*RE) / 5` and a rule on an expression,
  `0.7*EF/5 >= 4.9` (`examples/pi-2526/avaliacao.html`); and weights kept in
  `<data>` with a rules list holding only a text rule
  (`examples/pc-2627/evaluation.html`).

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

### 3.7 Materials and problems

#### `<uc-materials>`

Decorates the teacher's list of materials per lecture or chapter: each link
becomes a button with its recognised type, the date of the last update and a
"Novo" tag.

```html
<uc-materials new-days="7">
  <ol>
    <li><time datetime="2025-11-18">18 nov</time> Árvores binárias
      <a href="slides/7_arvores.pdf">Slides</a> <a href="codigo/arvores/">Código</a></li>
    <li>Revisões para o 1.º teste</li>
  </ol>
</uc-materials>
```

| Attribute | Values | Default |
| --- | --- | --- |
| `new-days` | number | `7`; items updated fewer days ago (and not in the future) get "Novo"; `0` disables it |
| `heading` | text \| `none` | localised "Materiais" / "Materials" |
| `heading-level` | `2`–`6` | `2` |

- **Items** are the `<li>` of the first `<ol>`/`<ul>` child. The text before
  the item's first link is its title. The first `<time datetime>` that is a
  direct child of the item is the date of the last update, shown under the
  title as "Atualizado a 18 nov" in the active language (the teacher's text
  stays in `data-uc-text`). An `<ol>` keeps its numbers.
- **Links** that are direct children of the item become buttons
  (`uc-button uc-materials__link`) with a decorative type icon; text that
  only separates them ("·", "|", ",") is dropped. The type comes from the URL;
  `data-type` on the `<a>` overrides it, and the computed or given type is
  written back to `data-type`:

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

  The type joins the accessible name after the visible text ("Slides
  (PDF)"), through visually hidden text, unless the visible text already says
  it ("PDF").
- **No links** (or none in the active language): "Sem material", muted.
- **Languages.** Items and links with `lang` follow section 6, so PT and EN
  slides can share a list.
- Other content of an item (a `<span>` note after the links) stays in the
  title column. Elements after the list stay after it.
- Without JavaScript: the list with its normal links.

#### `<uc-problems>`

Decorates problem lists grouped in series: judge and type tags, the series
deadline, filters and, with `track`, a "Resolvido" checkbox saved in the
browser.

```html
<uc-problems filters track>
  <section data-deadline="ps01">
    <h2>Série 1 · Introdução</h2>
    <ul>
      <li data-judge="mooshak"><a href="problems/pc001.html">Increasing Array</a> <code>PC001</code></li>
      <li data-judge="codeforces" data-type="extra"><a href="https://codeforces.com/problemset/problem/499/B">Lecture</a> <code>499B</code></li>
    </ul>
  </section>
</uc-problems>
```

| Attribute | Values | Default |
| --- | --- | --- |
| `filters` | boolean | no filters; with it, buttons by type and by judge (`aria-pressed`), for groups with two or more values |
| `track` | boolean | no checkboxes; with it, "Resolvido" per problem and "3 de 5 resolvidos" per series, saved in `localStorage` |
| `cards` | boolean | rows; with it, one card per problem: title, a judge seal with the problem code ("Mooshak PC033", a link to the platform `url` when it has one), languages, hints and "Resolvido" |
| `heading` | text \| `none` | `none` (problem pages have their own `<h1>`); a text adds a heading |
| `heading-level` | `2`–`6` | `2` |

The series are the `<section>` children, each with a heading (`h2`–`h6`) and
a list; a single `<ol>`/`<ul>` without sections is one series without a name.

| Item attribute | On | Values | Notes |
| --- | --- | --- | --- |
| `data-judge` | `<li>` | platform `id` or label | Judge tag with the platform's label (2.8). Unknown values are shown as written. |
| `data-type` | `<li>` | `main` \| `extra` \| `challenge` | Default `main` (no tag). "Extra" and "Desafio" are text tags. |
| `data-id` | `<li>` | text | Identifier for `track`. Default: `<judge>:<text of the first <code>>`, else the resolved URL of the first link. |
| `data-languages` | `<li>` | comma-separated list | "Testado em C++ Java" as muted tags. When every problem of a series has the same list, it is shown once under the series heading instead. |
| `data-deadline` | `<section>` | deadline `id` | "Prazo: 12 out, 23:59" under the series heading, with its state ("Daqui a 8 dias", "Hoje", "Encerrado"). |

- An optional `<data value>` in an item is its weight, shown as a tag ("40 %").
- **Filters.** Two `role="group"` groups, "Tipo" and "Juiz", each with "Todos"
  and one button per value that occurs. Groups combine with AND; a series
  with no problem left is hidden; the count is announced ("2 de 6
  problemas"). Focus stays on the pressed button.
- **Track.** A checkbox labelled "Resolvido" whose accessible name includes
  the problem ("Resolvido: Increasing Array"). Its key is
  `uc:<course>:solved:<id>`, so a problem listed on two pages (a series and an
  index) shares its state, also between lists of one page. A change fires a
  bubbling `uc:problemchange` (`detail: { id, solved }`) and updates "3 de 5
  resolvidos" under the series heading (not a live region: the checkbox
  announces its own state).
- **Hints.** A `<details>` child of an item gets `uc-problems__hints`: the
  `<summary>` becomes a small disclosure with a chevron and the rest a soft
  panel. A `<details>` with nothing but its `<summary>` is hidden.
- **Unknown deadline id.** One console warning; no deadline line.
- Without JavaScript: the teacher's sections, headings and lists.

#### `<uc-problem>`

The header of one problem statement: the judge seal with the code (a link to
the platform's `url`), the deadline of its series, a "Submeter no …" button
and, with `track`, the same "Resolvido" checkbox as `<uc-problems track>`.

```html
<h1>Soma dos dígitos</h1>
<uc-problem code="PI013" judge="mooshak" deadline="aula05" track></uc-problem>
```

| Attribute | Values | Notes |
| --- | --- | --- |
| `code` | text | The problem code, shown in the judge seal. |
| `judge` | platform `id` or label | As `data-judge` of `<uc-problems>` (2.8). With a platform `url`: the seal is a link and a primary "Submeter no Mooshak" button is added. |
| `deadline` | deadline `id` | "Prazo: 12 out, 23:59" with its state, as a series of `<uc-problems>`. |
| `track` | boolean | "Resolvido" checkbox, stored under `uc:<course>:solved:<judge>:<code>`, so it is shared with the same problem in any `<uc-problems track>`. |
| `data-id` | text | Overrides the stored id. |

- The element is written empty; whatever is inside is replaced.
- A change fires the same bubbling `uc:problemchange` as `<uc-problems>`, and
  the element follows changes made elsewhere on the page.
- Unknown deadline id: one console warning, no deadline line.
- Without JavaScript: nothing (the statement around it stays complete).

## 4. CSS building blocks

Layout pieces that need no behaviour are plain CSS classes, usable anywhere:

| Class | Use |
| --- | --- |
| `uc-card` | Bordered surface. `uc-card--accent` for the highlighted variant. |
| `uc-grid` | Responsive auto-fit grid. `--uc-grid-min` sets the minimum column width (default 220px). |
| `uc-stack` | Vertical rhythm container (`gap` from `--uc-stack-gap`). |
| `uc-tag` | Small badge. Variants: `uc-tag--accent`, `uc-tag--warning`, `uc-tag--success`, `uc-tag--danger`, `uc-tag--muted`. |
| `uc-table` | Put on a wrapper `<div>` around a `<table>`: horizontal scroll, borders, header style. While the table overflows, the kit makes the wrapper focusable (`tabindex="0"`, `role="region"`, labelled by the `<caption>`) so it can be scrolled with the keyboard. Set `--uc-table-min` (default `560px`) to change the minimum table width. |
| `uc-links` | A `<ul>` of links with a secondary description in a `<span>`. |
| `uc-links--grid` | Variant of `uc-links` in columns, for long lists (judges, other courses). Column width from `--uc-links-min` (default `260px`); one column on phones. Group several lists with `<h3>` headings as usual. |
| `uc-shortcuts` | A `<nav>` or `<ul>` of large link buttons (quick access). |
| `uc-callout` | Soft grey panel; `uc-callout--warning` for amber. |
| `uc-checklist` | A `<ul>` with check icons. The kit adds `role="list"` to `uc-links`, `uc-shortcuts` and `uc-checklist` lists, which Safari would otherwise not announce as lists. |
| `uc-split` | Two columns (main + narrower side) that stack below 960px. |
| `uc-section` | A page section: spaces its own children (heading, text, blocks) evenly. |
| `uc-bullets` | A `<ul>` with simple bullets and comfortable spacing. |
| `uc-page-header` | A page's header: optional breadcrumbs (`uc-crumbs`) and `uc-eyebrow`, the `<h1>` and an intro, 12px apart (the page spaces its sections 48px apart). Replaces `uc-stack` with an inline `--uc-stack-gap`. |
| `uc-eyebrow` | Small uppercase muted label above a title. |
| `uc-crumbs` | Breadcrumbs for pages outside the navigation: `<nav class="uc-crumbs" aria-label="…"><ol><li><a>…</a></li>…<li aria-current="page">…</li></ol></nav>`, with the look of `<uc-guide>`'s breadcrumbs. Put it first in `uc-page-header`. |
| `uc-samples` | Sample input/output of a problem: a grid of columns (each a `<div>` with a `uc-samples__label` and a `<pre data-copy>`), at least `--uc-samples-min` wide (default 220px); one column on phones. |
| `uc-steps` | An `<ol>` numbered 01, 02, … (decorative numbers; the list gives the position), each item a title and a text, separated by lines (a syllabus). |
| `uc-tags` | A `<ul>` whose items look like `uc-tag`, wrapped on several lines. |
| `uc-links--inline` | Variant of `uc-links`: the links on one line, separated by a decorative dot. |
| `uc-facts` | A `<dl>` of label/value rows (label muted on the left; stacked on phones). A `<div>` may wrap each pair. |
| `uc-table--fit` | Variant of `uc-table`: the table is only as wide as its content (`--uc-table-min: 0`). |
| `uc-num` | A numeric cell: right-aligned, tabular figures. |
| `uc-details` | A `<details>` anywhere in a page, styled as the hints of `<uc-problems>`: a small accent summary that opens a soft panel. (`details.uc-hint` and `details.uc-solution` of 3.x also work outside an exercise.) |
| `uc-button` | Link or button styled as a button; `uc-button--primary` filled, `uc-button--sm` compact (tables, toolbars). |
| `uc-lead` | Larger intro paragraph. |
| `uc-prose` | Readable text column (max 720px, secondary colour). |
| `uc-content` | Wrapper for plain HTML written without kit classes (pasted from an older site or an editor): spacing for headings, paragraphs, lists, tables, `<pre>` and images. `<img class="uc-content__float">` floats right on wide screens. |
| `<pre data-copy>` | Adds a copy button to the top-right corner of a preformatted block (for example the input and output of a problem's examples). The value names what is copied in the button's accessible label: `data-copy="Input"` reads "Copiar Input"; an empty value reads "Copiar". Works anywhere on the page, not only inside `uc-content`, with the same box (background, padding, rounded corners). |
| `a[data-auth]` | Link that needs a login. The kit adds a decorative lock icon (`uc-auth-icon`, `aria-hidden="true"`) after the text and a visually hidden "(Requer autenticação)" (`uc-auth-label`); with a value it names the system: `data-auth="SIGARRA"` → "(Requer autenticação: SIGARRA)". Works in page HTML, in `HTMLText` from `course.js` and inside components. Without JavaScript it is a normal link. |
| `table[data-sortable]` | Inside `.uc-table`. The header cells of the `<thead>` become buttons (`uc-sort-button`, 44 px tall) and the sorted column has `aria-sort`. A cell sorts by its `data-sort` attribute, else its `<time datetime>`, else its text: numbers (decimal comma or dot, optional `%`) and ISO dates numerically, text in the active language with numbers inside compared as numbers ("PL2" before "PL10"); empty cells go last. Rows of the first `<tbody>` move; rows with `data-sort-fixed` (totals) stay last. `data-sort-default="asc"` or `"desc"` on a `<th>` sorts on load; `data-no-sort` on a `<th>` leaves that column out. Each sort is announced ("Ordenado por Pontos, decrescente"). Works in tables written by components too. Without JavaScript the table keeps its written order. |
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
| `--uc-links-min` | `260px` | Column width of `uc-links--grid`. |

**Choice properties.** Not tokens: no CSS uses them and `uc-kit.css` does
not define them. A theme or `theme.css` sets them on `:root`, and the kit's
JavaScript reads each one once, after the themes have loaded (8.3).

| Token | Values | Use |
| --- | --- | --- |
| `--uc-layout` | a layout name | Layout of `<uc-page>` when neither the page nor `course.js` names one (8.3). |

Fonts (Inter, JetBrains Mono) are served with the kit from `kit/v1/fonts/` and declared in `uc-kit.css`; no third-party request is made. Preload `fonts/inter-latin.woff2` from the page (section 1) so it downloads in parallel with the CSS.
Setting `--uc-font-sans: system-ui, sans-serif` in `theme.css` uses the
system font and skips downloading Inter, if a course prefers.

## 6. Languages

- Interface strings live in `kit/src/i18n/<lang>.js` (`pt` and `en` in v1).
  Adding a language means adding one dictionary file. The strings of the
  site search (`search.label`, `search.placeholder`, `search.loading`,
  `search.retry`, `search.empty`, `search.count`, `search.countOne`,
  `search.close`, `search.indexDate`, `search.deadlines`, `search.notices`,
  `search.keys`) come with `uc-search.js` (`kit/src/search/strings.js`), and
  the `grading.*` strings with `uc-grading.js` (`kit/src/grading/strings.js`);
  neither replaces a string the site already set with `UC.addTranslations`.
- **Active language** is resolved in this order: `?lang=` query, saved choice
  (`localStorage` key `uc:<course>:lang`, per course; a course with no saved
  choice adopts the pre-1.1 shared key `uc:lang`), `<html lang>`, first of
  `languages`.
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
| `UC.registerLayout(name, { extends, css })` | Adds a site layout: the structure of the layout `extends` (default `sidebar`) plus the style sheet `css`, relative to `course.js` (8.3). Call it after `uc-kit.js`. |
| `UC.search.available()` | `Promise<boolean>`: whether the site has a search index (asks the server if this visit has not yet; `false` without `search`). |
| `UC.search.open(query?)` | Opens the site search, optionally with a query. Does nothing without an index. |

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
| `uc:problemchange` | Bubbles from a `<uc-problems track>` when a problem is marked solved or not. `event.detail = { id, solved }`. |
| `uc:searchready` | On `document`, when the search index is known to exist. |

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

### 7.2 Widgets (`UC.widgets`)

The algorithm widget library is separate from the kit: files in
`widgets/v1/`, the kit's version (needs kit 1.0+), outside the
kit's size budget. Full contract: `docs/architecture/widgets-api.md`. A page loads
one file per widget type after the kit:

```html
<script src="https://uc-design-kit.miguelrocha.dev/widgets/v1/uc-widget-sort.js" defer></script>
<uc-widget-sort values="5 2 9 1 7 3" algorithm="insertion"><p>Fallback text.</p></uc-widget-sort>
```

The widget file loads `uc-widget-core.js` and `uc-widget.css` from its own
folder. The catalogue is `widgets/v1/catalog.json`. Every widget is
`stable`: its attributes, `ops` verbs, members and events below keep working
in all of 1.x (`tests/widgets/compat.html` checks `widgets/v1/` and every
frozen release on each change). Releases are frozen as `widgets/vX.Y.Z/`
(`npm run snapshot:widgets`; the first is `widgets/v1.0.0/`, released with
kit 1.0.0). Widgets:

| Element | Own attributes | `algorithm` |
| --- | --- | --- |
| `<uc-widget-sort>` | `values`, `pivot` = `last` `first` `middle` `random`, `bars` | `bubble` `selection` `insertion` `merge` `quick` `counting` |
| `<uc-widget-search>` | `values`, `target` (binary searches need sorted values) | `linear` `binary` `lower` |
| `<uc-widget-bst>` | `values` (≤ 15), `ops` = `insert v; remove v; search v; min; max` | `operations` `preorder` `inorder` `postorder` `levelorder` |
| `<uc-widget-list>` | `values` (≤ 10), `ops` = `add-first v; add-last v; insert k v; remove-first; remove-last; remove v; search v; reverse` | `singly` |
| `<uc-widget-stack-queue>` | `values`, `ops` = `push v; pop; peek` / `enqueue v; dequeue; peek`, `impl` = `array` `list`, `capacity` (1–16, default 8) | `stack` `queue` |
| `<uc-widget-recursion>` | `n` (factorial ≤ 8, fibonacci ≤ 6, hanoi 1–4) | `factorial` `fibonacci` `hanoi` |
| `<uc-widget-heap>` | `values` (≤ 15), `ops` = `insert v; extract; peek`, `kind` = `max` `min` | `operations` `heapify` `heapsort` |
| `<uc-widget-avl>` | `values` (≤ 15), `ops` = `insert v; remove v; search v` | `operations` |
| `<uc-widget-hash>` | `values` (integers or words, ≤ 16), `ops` = `insert k; remove k; search k`, `size` (1–16, default 7), `max-load` (default `0.75`, or `none`) | `chaining` `linear` `quadratic` |
| `<uc-widget-graph>` | graph in `<pre data-input>` (`U V [W]` per line, `U` alone, `U @ X,Y`, `#` comments) or `edges="A B; A C"`, `directed`, `source` (default: the first vertex); ≤ 10 vertices, 20 edges | `bfs` `dfs` `components` |
| `<uc-widget-shortest-path>` | as `<uc-widget-graph>`, integer weights (negative only for Bellman-Ford; unweighted = 1) | `dijkstra` `bellman-ford` |
| `<uc-widget-complexity>` | `functions` (≤ 8 of `1 log sqrt n nlogn n2 n3 2n fact`), `max` (2–32, default 16), `scale` = `linear` `log`, `for` (id of a widget to measure), `measure` (its counter), `points` (`n:count …`) | `growth` |
| `<uc-widget-mst>` | as `<uc-widget-graph>`, undirected only (`directed` is an error), `source` (Prim's start); a disconnected graph gives a spanning forest | `kruskal` `prim` |
| `<uc-widget-toposort>` | as `<uc-widget-graph>`, always directed, no `source`; a cycle is found and named | `kahn` `dfs` |
| `<uc-widget-dp>` | `problem` (= the algorithm, read first), `a` `b` (1–8 characters), `weights` `values` (1–8 items) `capacity` (1–8), `coins` (1–6 distinct) `amount` (1–8) | `lcs` `edit-distance` `knapsack` `coins` |
| `<uc-widget-backtracking>` | `n` (queens, 1–8, default 4), `all` (every solution; use n ≤ 6), `values` (subsets: 1–4 positive integers; permutations: 1–3 distinct tokens), `target` (subsets with that sum, also `values="3 1 4 : 5"`) | `queens` `subsets` `permutations` |
| `<uc-widget-union-find>` | `n` (1–16 elements, 0 … n − 1, default 8), `ops` = `union a b; find a; connected a b` (default: neighbours, then pairs of sets, a find and a connected) | `compression` `size` `naive` |
| `<uc-widget-trace>` | the steps as JSON in `<script type="application/json" data-input>`: `view` = `array` `tree` `graph` `grid`, `code`, `graph`/`directed` (graph view), `rowHeads`/`colHeads` (grid view), `steps` = `[{ state, marks, pointers, line, say, vars, predict }]` (`say` a string or `{ pt, en }`; a step without `state` keeps the previous one) | `trace` |

A teacher's own widget (no build step) starts from
`widgets/template/my-widget-gcd.js`: a class extending `UC.widgets.Widget`
with `parse()`, `steps()`, `draw()`, registered with
`UC.widgets.register("my-widget-x", …)`; the page loads
`uc-widget-core.js` before it. Guide: `docs/pt/widgets/criar.html`.

With `ops`, `values` builds the structure without steps and the operations
are the demo; without `ops`, inserting / adding each value is the demo.

| Common attribute | Values | Default |
| --- | --- | --- |
| `algorithm` | a name from the widget's list | the first |
| `algorithms` | names from the list: toggle buttons to switch algorithm | absent |
| `speed` | ms, 200–5000 | `900` |
| `controls` | `full`, `compact` | `full` |
| `editable` | boolean | absent |
| `predict` | boolean | absent |
| `start` | `0`, a step number, `end` | `0` |
| `seed` | integer (for `values="random N [MIN..MAX]"`) | `1` |
| `caption` | text (or `<template data-caption>` with `<span lang>`) | the algorithm's name |

| Widget element member | Description |
| --- | --- |
| `go(n)`, `next()`, `back()`, `play()`, `pause()`, `reset()` | Move the demo (`go("end")` allowed). |
| `step`, `total`, `result` | Current index, number of steps, the algorithm's result (read only). |

| Widget event | `detail` | When |
| --- | --- | --- |
| `uc:widgetstep` | `{ widget, step, total }` | Every change of step. |
| `uc:widgetdone` | `{ widget, total, stats, input }` | The last step reached moving forward (`stats`: the last step's counters; `input`: the parsed input). |
| `uc:widgetpredict` | `{ widget, step, correct, right, asked }` | Every predict answer. |

A step (the unit the player moves through) is plain JSON: `{ state, marks,
pointers, line, say: [i18n key, params], stats, aux, predict, code }`; marks
are `current`, `compared`, `swapped`, `visited`, `done`. `code` names the
pseudocode block of the step (an operation such as `insert`); without it the
block is the algorithm's. A teacher's `<pre data-pseudocode
data-algorithm="…">` matches either.

| `UC.widgets` property | Description |
| --- | --- |
| `version` | Library version. |
| `Widget` | Base class (extends `UC.Element`); a widget defines `parse()`, `steps(input, emit)`, `draw(step, svg)` and optionally `describe`, `table`, `panel`, `pseudocode`, `serialize`. |
| `register(name, Class)` | Defines the element (`UC.define`). |
| `svg.array(svg, values, { marks, pointers, bars })` | Draws an array. |
| `svg.tree(svg, root, { children, binary, key, label, note, marks, pointers, empty })` | Draws a binary (in-order layout, default `[node.l, node.r]`) or n-ary tree; nodes kept by key and moved. |
| `parse.values`, `parse.ops`, `parse.graph` | Input parsers; throw `InputError(key, params)`. |
| `random(seed)` | Seeded generator: `int(min, max)`, `pick`, `shuffle`. |
| `MAX_STEPS`, `STATES`, `InputError`, `TooManySteps` | Limits and error types. |

Strings are `widget.core.*` and `widget.<name>.*`, added with
`UC.addTranslations`, so a page can override any of them.

## 8. Customisation levels

| Level | How | Example |
| --- | --- | --- |
| 0 | `course.js` | `accentColor`, `theme`, `layout`, `logo`, `pages`, `languages`. |
| 1 | Tokens in `theme.css` | `:root { --uc-color-accent: #0F766E; --uc-radius-lg: 4px; }` |
| 2 | Any CSS in `theme.css` | `.uc-week__title { text-transform: uppercase; }` — classes listed in the component reference are stable. |
| 3 | Own components and layouts | `UC.define("uc-my-widget", …)` or `UC.registerLayout("poster", …)` in a local script. |
| 4 | Free HTML | Any markup anywhere, with or without kit components. |

Kit CSS uses `:where()` so its selectors have zero specificity and any
teacher rule wins.

### 8.1 Ready-made themes

The token themes of `kit/v1/themes/<name>.css` are small style sheets that
only redefine tokens (section 5) on `:root`, built from `kit/src/themes/`
(minified, no source map). They combine with any theme with a layout (8.3).
A page uses one with a `<link>` between `uc-kit.css` and `theme.css`, or with
`theme` in `course.js` (2.2). Cascade order: `uc-kit.css`, the themes, the
site's `theme.css`, then `accentColor` (inline on `<html>`).

| Name | Changes |
| --- | --- |
| `compact` | Base size 93.75 %, line height 1.55, radii 4/6/8 px, spaces 5–12 smaller, sidebar 200 px, header 56 px. Touch targets stay 44 px. |
| `serif` | `--uc-font-sans` is the system serif stack (Charter, Cambria, Georgia; nothing downloaded); line height 1.65. |
| `high-contrast` | Black text, darker greys, borders `#71717A`, darker status colours, accent `#1E3A8A` (10:1 on white), 3 px focus ring. `accentColor` still wins. |

Every theme passes the same WCAG 2.1 AA checks as the kit (test pages in
`tests/pages/themes/`). The names are listed in `kit/src/core/themes.js`;
the build fails when that list and the files differ. A new theme is a new
file there: themes never change token names, only values.

### 8.2 Starter `theme.css`

`scripts/themes.mjs` writes `template/theme.css` (and the same file to
`docs/downloads/theme.css` and, as `window.UC_DOCS_THEME_STARTER`, to
`docs/assets/theme-starter.js` for the theme customiser) from
`kit/src/css/base/tokens.css`: every token of section 5 commented out with
the kit's value, under Portuguese group titles, followed by a place for level 2
CSS. It changes nothing until a line is uncommented.

### 8.3 Themes with a layout

A theme with a layout also chooses the layout of `<uc-page>`: it declares the
choice property `--uc-layout` (section 5) and `@import`s the file of its
layout. Layouts other than `sidebar`, `top` and `full` are files of
`kit/v1/layouts/` (`banner.css`, `docs.css`, `centered.css`, `panel.css`, `aside.css`, `onepage.css`), downloaded only when a page uses them. Full contract:
`docs/architecture/themes-layouts.md`.

| Name | Layout | Changes |
| --- | --- | --- |
| `classic` | `sidebar` | Nothing: the kit's own look, already in `uc-kit.css`. The default; naming it downloads nothing. |
| `modern` | `top` | Moderno: a grey page (`--uc-color-surface-sunken` #F6F7F9) with the header and the navigation in white; the navigation as pills, the current page filled with `--uc-color-accent-strong`; `.uc-card`, `<uc-this-week>`, `<uc-notices>` and `<uc-deadlines>` as white cards with a soft shadow; corners 10/16 px; a larger hero title. `top` is in `uc-kit.css`, so the theme imports no layout. |
| `institutional` | `banner` | Institucional: the header, the course heading and the tabs in one band in the course colour; squarer corners (`--uc-radius-*` 3/4/6 px); the `h2` of the page's sections underlined. |
| `handbook` | `docs` | Manual: the navigation, the content and "Nesta página"; the type and spacing of `compact`; up to 1440 px; `--uc-weeks-view: compact`. |
| `editorial` | `centered` | Editorial: the serif stack of `serif` with line spacing 1.7; the hero centred, its title for screen readers only (the header shows the name) and the tagline in italics; `--uc-hero-align: center`, `--uc-team-view: table`. |

Order of precedence of a page's layout: the `layout` attribute, then
`layout` in `course.js`, then `--uc-layout` on `:root` (the theme, then the
site's `theme.css`), then `sidebar`. A value that is not a known layout, or
whose style sheet failed to load, is skipped with a console warning. The kit
reads `--uc-layout` once the themes have loaded and shows the page after the
layout files have loaded too, within the 300 ms wait of 3.1.

A list in `theme` holds at most one theme with a layout. The token themes
(8.1) combine with it: `theme: ["classic", "high-contrast"]`.

**Site layouts.** `UC.registerLayout(name, { extends, css })`, called in a
script after `uc-kit.js`, adds a layout with the structure of `extends` (a
kit layout or another site layout; default `sidebar`) and the style sheet
`css`, written relative to `course.js` and loaded when a page uses it. The
page gets the classes of both, `.uc-page--<kit layout>` (none for `sidebar`)
and `.uc-page--<name>`, so it inherits everything and only changes what its
CSS says. `name` is lower-case letters, digits and `-`, and cannot be a kit
layout. `--uc-layout: <name>` in `theme.css` works too.

```js
UC.registerLayout("poster", { extends: "top", css: "layouts/poster.css" });
```

```css
/* layouts/poster.css */
:where(.uc-page--poster .uc-header) { border-bottom: 4px solid var(--uc-color-accent); }
```

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
