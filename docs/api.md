# UC Design Kit — API contract (v1)

This document is the public contract of the kit. Code, tests, examples and
documentation follow it. Anything listed here is stable within major
version 1; changing it requires its own pull request.

- Status: **draft for review** (milestone M0.2)
- Kit version: 1.0.0 (unreleased)

## 1. Loading the kit

Every page loads, in this order:

```html
<!doctype html>
<html lang="pt">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Semanas · Estruturas de Dados</title>
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
| `semester.breaks` | `{ start, end, label }[]` | no | `[]` | Weeks without classes. Weeks are numbered skipping them. |
| `pages` | `(PageId \| Page)[]` | no | `["home"]` | Navigation, in order. See 2.3. |
| `platforms` | `{ label, url }[]` | no | `[]` | External links listed under "Platforms" in the navigation. |
| `team` | `TeamMember[]` | no | `[]` | See 2.4. |
| `deadlines` | `Deadline[]` | no | `[]` | See 2.5. |
| `notices` | `Notice[]` | no | `[]` | See 2.6. |
| `footer` | `HTMLText` | no | course title + institution | Footer left side. |
| `updated` | `ISODate` | no | — | "Last updated" in the footer. |
| `today` | `ISODate` | no | the real date | Freezes "today" (demos, screenshots). The query string `?today=YYYY-MM-DD` overrides it. |

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

### 2.4 Team member

| Field | Type | Notes |
| --- | --- | --- |
| `name` | string | Required. |
| `url` | URL | Personal page. |
| `email` | string | Optional; rendered as a `mailto:` link. |
| `role` | `"coordinator"` \| `"lecturer"` \| `"assistant"` \| `LocalizedText` | Built-in roles are translated. |
| `classes` | string[] | Class codes, e.g. `["PL1", "PL5"]`. |
| `office` | string | e.g. `"Gab. 1.25"`. |

### 2.5 Deadline

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | Required, unique. Referenced by `<uc-date deadline>`. |
| `title` | `LocalizedText` | Required. |
| `date` | `ISODate` \| `"YYYY-MM"` \| `null` | `null` = to be scheduled. |
| `time` | `Time` | Start time. |
| `end` | `ISODate` | For multi-day items (e.g. a quiz open for a week). |
| `kind` | `"assessment"` \| `"exam"` \| `"quiz"` \| `"submission"` \| `"other"` | Drives the badge and filtering. |
| `note` | `HTMLText` | Short secondary line (shifts, rooms…). |
| `url` | URL | Main link (information page). |
| `links` | `{ label, url }[]` | Extra links (results, shifts…). |

### 2.6 Notice

| Field | Type | Notes |
| --- | --- | --- |
| `date` | `ISODate` | Required. Notices are shown newest first. |
| `text` | `HTMLText` | Required. One line. |
| `details` | `HTMLText` | Optional second line. |

## 3. Components

All components are custom elements in the **light DOM**: their content is part
of the page, global CSS applies, and without JavaScript the teacher's content
is still readable (unstyled by the component).

Common behaviour:

- Every component re-renders on language change.
- Attributes are lowercase, kebab-case. Boolean attributes are present/absent.
- Teacher-written children are never discarded; components wrap or decorate them.
- Generated text comes from the i18n dictionaries.

### 3.1 Page shell

#### `<uc-page>`

Renders the skip link, header (logo, title, edition, institution, language
switch), navigation (sidebar on desktop, collapsible menu on phones), the
`<main>` landmark around its children, and the footer.

| Attribute | Values | Default | Notes |
| --- | --- | --- | --- |
| `current` | a page id | inferred from the file name | Marks the active navigation item. |
| `layout` | `sidebar` \| `full` | `sidebar` | `full` hides the navigation (single-page sites, guides). |

#### `<uc-hero>`

Course heading block: code, title (as `<h1>`) and tagline from the
configuration. Children, if any, are appended below the tagline.

### 3.2 Dates, deadlines and notices

#### `<uc-notices>`

Lists `UC_COURSE.notices`, newest first.

| Attribute | Values | Default | Notes |
| --- | --- | --- | --- |
| `limit` | number | `5` | Older notices go into a collapsed "Earlier notices (n)" section. |
| `new-days` | number | `7` | Notices newer than this get a "New" badge. |
| `heading` | text \| `none` | localised "Notices" | Section heading (`<h2>`). |

Children written inside the element (e.g. a link to the assessment rules) are
kept below the list.

#### `<uc-deadlines>`

Lists `UC_COURSE.deadlines`.

| Attribute | Values | Default | Notes |
| --- | --- | --- | --- |
| `view` | `list` \| `table` | `list` | `table` adds status and links columns. |
| `filter` | `upcoming` \| `past` \| `all` | `upcoming` (list), `all` (table) | |
| `kind` | space-separated kinds | all | e.g. `kind="assessment exam"`. |
| `limit` | number | none | |
| `heading` | text \| `none` | localised "Upcoming dates" | |

Status shown in the table view: *Done* (date passed), *Next* (the first
upcoming), *Scheduled* (later), *To be scheduled* (`date: null` or month only).
A deadline with an `end` date counts as upcoming until it ends and is shown as
a range. Children written inside the element are kept below the list.

#### `<uc-date>`

Prints a date inline, formatted in the active language.

| Attribute | Values | Notes |
| --- | --- | --- |
| `deadline` | deadline id | Uses that deadline's date (and time, with `with-time`). |
| `value` | `ISODate` | A literal date. |
| `format` | `short` \| `long` \| `weekday` | `short` = "12 nov", `long` = "12 de novembro de 2025", `weekday` = "quarta-feira, 12 nov". Default `short`. |
| `with-time` | boolean | Appends the time. |

### 3.3 Weekly calendar

#### `<uc-weeks>`

Container for `<uc-week>` elements. Adds a "Go to this week" link, inserts
`UC_COURSE.semester.breaks` between weeks, and appends deadlines that fall
after the last week.

| Attribute | Values | Default |
| --- | --- | --- |
| `no-breaks` | boolean | breaks are inserted |
| `no-deadlines` | boolean | deadlines are shown inside their week |

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
| `open` | boolean | Force open. |

Children are free HTML. A `<dl>` directly inside is styled as label/value rows
("Lectures", "Lab", "Quiz"…).

The element gets `id="week-<n>"` for deep links; opening the page with
`#week-<n>` opens that week. The `title` attribute is removed after it is read
(so browsers do not show it as a tooltip); the title is therefore only visible
with JavaScript, while the children stay readable without it.

`<uc-weeks>` does not repeat a deadline that already has a hand-written
`<uc-event deadline="…">`, and places deadlines that fall in a break right
after the break.

#### `<uc-event>`

A highlighted item inside or between weeks (assessments, exams).

| Attribute | Values | Notes |
| --- | --- | --- |
| `deadline` | deadline id | Takes title, date, note and links from the configuration. |
| `kind` | deadline kind | When not using `deadline`. |
| `date` | `ISODate` | When not using `deadline`. |

Children (free HTML) are appended after the generated content.

#### `<uc-this-week>`

"This week" card for the home page: week number and dates, deadlines this
week and next, and a link to `weeks.html#week-<n>`. When the page is served
over HTTP(S), it also fetches the weeks page and shows the current week's
title and `<dl>` rows (progressive enhancement; on `file://` that part is
skipped). Outside the semester it shows the next relevant date.

| Attribute | Values | Default |
| --- | --- | --- |
| `source` | URL | the `weeks` page from `pages` |

### 3.4 People

#### `<uc-team>`

Renders `UC_COURSE.team`.

| Attribute | Values | Default |
| --- | --- | --- |
| `view` | `cards` \| `table` | `cards` |
| `role` | space-separated roles | all |
| `heading` | text \| `none` | localised "Teaching team" |

`role` is not a valid ARIA role, so after upgrade the element moves it to
`data-role` (accessibility checkers would flag it otherwise). Write `role` in
the HTML as documented; in custom CSS select `uc-team[data-role]`. When no
member matches, the element is hidden.

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

A code block with syntax highlighting, copy and download buttons.

| Attribute | Values | Notes |
| --- | --- | --- |
| `lang` | `java` \| `python` \| `c` \| `cpp` \| `js` \| … | Highlighting language (highlight.js, loaded on first use). |
| `filename` | text | Shown in the header and used for downloads. |
| `editable` | boolean | Makes the code editable with a "Reset" button. |
| `no-copy`, `no-download` | boolean | Hide buttons. |
| `run` | URL | Optional "Test on…" link (e.g. Mooshak problem). |

Code is given as a `<script type="text/plain">` child (no HTML escaping
needed) or as `<pre><code>` with escaped HTML. The kit CSS shows the script's
text when JavaScript is off.

highlight.js 11.9.0 is loaded from cdnjs on first use; less common grammars
(haskell, ocaml, prolog, scala…) are loaded with SRI hashes. Without network,
or for an unknown language, the code stays readable as plain text. `lang="java"`
is not a valid language tag, so after upgrade the element moves it to
`data-lang`; in custom CSS select `uc-code[data-lang="java"]`.

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

## 4. CSS building blocks

Layout pieces that need no behaviour are plain CSS classes, usable anywhere:

| Class | Use |
| --- | --- |
| `uc-card` | Bordered surface. `uc-card--accent` for the highlighted variant. |
| `uc-grid` | Responsive auto-fit grid. `--uc-grid-min` sets the minimum column width (default 220px). |
| `uc-stack` | Vertical rhythm container (`gap` from `--uc-stack-gap`). |
| `uc-tag` | Small badge. Variants: `uc-tag--accent`, `uc-tag--warning`, `uc-tag--muted`. |
| `uc-table` | Put on a wrapper `<div>` around a `<table>`: horizontal scroll, borders, header style. |
| `uc-links` | A `<ul>` of links with a secondary description in a `<span>`. |
| `uc-shortcuts` | A `<nav>` or `<ul>` of large link buttons (quick access). |
| `uc-callout` | Soft grey panel; `uc-callout--warning` for amber. |
| `uc-checklist` | A `<ul>` with check icons. |
| `uc-lead` | Larger intro paragraph. |
| `uc-muted`, `uc-mono` | Text utilities. |
| `uc-visually-hidden` | Hidden visually, available to screen readers. |

## 5. Design tokens (CSS custom properties)

Defined on `:root` in `uc-kit.css`. Override them in `theme.css`.

| Token | Default | Use |
| --- | --- | --- |
| `--uc-color-accent` | `#1D4ED8` | Links, active navigation, primary buttons. Set from `accentColor`. |
| `--uc-color-accent-strong` | derived (darker) | Hover. |
| `--uc-color-accent-soft` | derived (`#EFF4FF`) | Active nav background, accent tags. |
| `--uc-color-highlight` | derived (`#F3F6FF`) | Current week band. |
| `--uc-color-text` | `#18181B` | Body text. |
| `--uc-color-text-secondary` | `#3F3F46` | Secondary paragraphs. |
| `--uc-color-text-muted` | `#52525B` | Metadata, labels. |
| `--uc-color-text-subtle` | `#71717A` | Navigation group labels. |
| `--uc-color-border` | `#E4E4E7` | Borders and rules. |
| `--uc-color-surface` | `#FFFFFF` | Page background. |
| `--uc-color-surface-muted` | `#F4F4F5` | Tags, callouts, hover. |
| `--uc-color-surface-sunken` | `#FAFAFA` | Table headers. |
| `--uc-color-warning-text` | `#92400E` | Assessment and "new" badges (text). |
| `--uc-color-warning-bg` | `#FEF3C7` | Assessment and "new" badges (background). |
| `--uc-color-warning-surface` | `#FFFBEB` | Event panels. |
| `--uc-color-warning-border` | `#FDE68A` | Event panel borders. |
| `--uc-font-sans` | `Inter, system-ui, sans-serif` | Body. |
| `--uc-font-mono` | `"JetBrains Mono", ui-monospace, monospace` | Code, dates, codes. |
| `--uc-font-size-base` | `16px` | Root size; the type scale is relative to it. |
| `--uc-radius-sm` / `-md` / `-lg` | `6px` / `8px` / `12px` | Corners. |
| `--uc-space-1` … `--uc-space-12` | `4px` steps | Spacing scale. |
| `--uc-content-max` | `1200px` | Page width. |
| `--uc-sidebar-width` | `216px` | Navigation column. |
| `--uc-target-min` | `44px` | Minimum touch target. |
| `--uc-focus-ring` | `2px solid var(--uc-color-accent)` | Focus outline. |

Fonts (Inter, JetBrains Mono) are loaded from Google Fonts by `uc-kit.css`.
Setting `--uc-font-sans: system-ui, sans-serif` in `theme.css` avoids the
external request if a course prefers.

## 6. Languages

- Interface strings live in `kit/src/i18n/<lang>.js` (`pt` and `en` in v1).
  Adding a language means adding one dictionary file.
- **Active language** is resolved in this order: `?lang=` query, saved choice
  (`localStorage` key `uc:lang`), `<html lang>`, first of `languages`.
- **In-place bilingual content:** any element with a `lang` attribute whose
  value is a configured language but not the active one is hidden. Untagged
  content is always visible.

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
| `UC.text(localizedText)` | Resolves a `LocalizedText` in the active language. |
| `UC.today()` | "Today" as a `Date` at local midnight (honours `today`). |
| `UC.formatDate(isoOrDate, format?)` | Formats like `<uc-date>`. |
| `UC.weekOf(date)` | `{ n, start, end }` or `null` outside the semester. |
| `UC.weekDates(n)` | `{ start, end }` for week `n`. |
| `UC.Element` | Base class for components (see below). |
| `UC.define(name, class)` | Registers a component once (safe to call twice). |
| `UC.addTranslations(lang, dict)` | Adds or overrides interface strings. |

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
| `uc:ready` | Configuration loaded and built-in components defined. |
| `uc:languagechange` | After the active language changes. `event.detail.lang`. |
| `uc:exercisechange` | Bubbles from a `<uc-exercise>` when it is marked done or not done. |

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
- `UC.version` and `CHANGELOG.md` record the exact version.

## 10. Out of scope for v1

- Dark theme (tokens make it possible later).
- Running code in the browser (CheerpJ, Pyodide) — possible as extensions.
- Any server-side feature (search, authentication, forms).
