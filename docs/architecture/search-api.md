# Site search — API contract (phase S0)

This is the contract of the site search that the kit added in **v1.0.0**: the
maintenance script `uc-site.py`, the index file `search-index.js`, and the
kit side (`search` in `course.js`, the header button, `<uc-search>`). It was
written before any code, so that phases S1 to S5 share one design. It does not
change `docs/api.md` or the kit: each phase copies its sections from here into
`docs/api.md` and the teacher guide, in the same PR as the code.

- Plan (Portuguese, the 8 decisions approved by Miguel on 17 Nov 2026, 10:53):
  <https://claude.ai/artifact/GvPxc6XQpJsWyp7d6xJ561>
- Status: **implemented** (S0 to S5, PRs 45, 49, 54, 57, 62 and 65), released
  in v1.0.0. Sections 11.3 and 13 to 18 are the history of the phases;
  the phase handoff notes were removed in the repository cleanup of 17 Nov 2026; read them in the git history at commit `846b283`.
- Everything is **additive**: a v1.0/v1.1 site without `search` in
  `course.js` looks and behaves exactly as before and makes **no new request**.
- Measurements: section 12 (the S0 prototype behind them was deleted in S3;
  `template/uc-site.py` now implements sections 4 to 6).

Contents:

1. [How it works](#1-how-it-works)
2. [`course.js`](#2-coursejs)
3. [The maintenance script `uc-site.py`](#3-the-maintenance-script-uc-sitepy)
4. [What goes into the index](#4-what-goes-into-the-index)
5. [Index file format](#5-index-file-format)
6. [Automatic heading ids](#6-automatic-heading-ids)
7. [Kit: detecting the index](#7-kit-detecting-the-index)
8. [Kit: components, attributes and JavaScript API](#8-kit-components-attributes-and-javascript-api)
9. [Matching, ranking and results](#9-matching-ranking-and-results)
10. [Accessibility](#10-accessibility)
11. [Size, tests and phases](#11-size-tests-and-phases)
12. [Measurements (S0)](#12-measurements-s0)
13. [Decisions taken in phase S0](#13-decisions-taken-in-phase-s0)
14. [Decisions taken in phase S2](#14-decisions-taken-in-phase-s2)
15. [Decisions taken in phase S3](#15-decisions-taken-in-phase-s3)
16. [Decisions taken in phase S1](#16-decisions-taken-in-phase-s1)
17. [Decisions taken in phase S4](#17-decisions-taken-in-phase-s4)

---

## 1. How it works

Two moments, never mixed:

1. **The maintainer builds the index.** After every change to the site, in the
   year folder (on the DCC server over ssh, or on a local copy before
   uploading), they run `python3 uc-site.py`. The script checks the site and,
   when `course.js` has `search`, writes `search-index.js` with every `.html`
   file of the folder.
2. **The visitor only reads it.** With `search` in `course.js`, the kit asks
   once per visit whether `search-index.js` exists. If it does, a "Pesquisar"
   button appears in the header; opening it downloads `uc-search.js` and the
   index. If it does not, nothing appears and nothing else happens.

The browser never crawls. Keeping the index fresh is the maintainer's job; the
kit only helps them notice (section 7.4).

## 2. `course.js`

### 2.1 The `search` field

```js
search: true,                       // on, defaults below
search: {                           // on, with options
  index: "search-index.js",         // file name, relative to course.js
  exclude: ["rascunhos/", "velho.html"],
},
// absent or false                  // off (the default in the kit)
```

| Field | Type | Default | Read by |
| --- | --- | --- | --- |
| `search` | `boolean` or object | absent = off | script and kit |
| `search.index` | relative path | `"search-index.js"` | script (where to write) and kit (where to look) |
| `search.exclude` | `string[]` | `[]` | script only. Each entry is a path relative to the site folder; an entry ending in `/` excludes the whole folder. No wildcards. |

The new template ships with `search: true` (decision 4). `config.js`
normalises the field to `UC.course.search = { index, exclude } | null`.

### 2.2 `course.js` holds values only

`uc-site.py` reads `course.js` without running JavaScript, so `course.js` may
contain only:

- comments (`//` and `/* */`);
- `window.UC_COURSE = <value>;` (exactly once);
- before it, optional constants: `const NAME = <value>;` (`let`/`var` are
  accepted and treated the same);
- values: objects (quoted or unquoted keys), arrays, strings with `'`, `"` or
  `` ` ``, numbers, `true`, `false`, `null`, trailing commas;
- a constant used as a value, strings joined with `+`, and `${NAME}` inside a
  template string, where `NAME` is a constant defined above.

Anything else (functions, `new Date()`, method calls, spread, computed keys,
other assignments) is an **error** that names the line where reading stopped:

```
ERRO  course.js:3  'new' não é um valor: o course.js só pode ter valores (texto, números, listas, objetos)
```

Why constants: the PI example keeps the address of the original site in
`const ORIGINAL = "…"` and builds links with `ORIGINAL + "…"` and
`` `${ORIGINAL}…` ``. That is a natural way to avoid repeating a URL, it is
easy to read, and the reader supports it in a few lines (section 13, item 1).

The template, `docs/pt/course-js.html` and `template/AGENTS.md` state this
rule from S2 on.

## 3. The maintenance script `uc-site.py`

One file, Python **3.8 or newer**, standard library only. It sits in the site
folder, next to `course.js`, comes with the template and is copied with the
folder every year (decision 2). It needs no network and installs nothing. It
writes **only** the index file, with mode `644` (decision 3); `course.js` is
never changed.

### 3.1 Commands

| Command | Does |
| --- | --- |
| `python3 uc-site.py` | Checks everything; then, with `search` on, writes the index. Recommended after every change. |
| `python3 uc-site.py check` | Checks only. Writes nothing. |
| `python3 uc-site.py index` | Writes the index only (still fails if `course.js` cannot be read). |

| Option | Effect |
| --- | --- |
| `--site DIR` | Site folder. Default: the folder that holds the script (so it works from any working directory, including `cron`). |
| `--fix-permissions` | Adds read permission for everyone (`o+r`, and `o+x` on folders) to files and folders of the site that lack it. Without it, missing permissions are only a warning. |
| `--quiet` | Prints errors only (and nothing when there are none). For `cron` and git hooks. |
| `--lang pt\|en` | Language of the messages. Default: the first of `course.js` `languages` if it is `pt` or `en`, otherwise `en`. |
| `--version` | Prints the script version (the kit version it was released with, e.g. `1.2.0`). |
| `-h`, `--help` | Usage. |

Exit status: `0` no errors (warnings allowed), `1` at least one error, `2`
wrong usage. With errors, `uc-site.py` (no command) **still writes the
index** when `course.js` could be read, because a broken link should not take
search away; the errors are printed and the status is `1`.

### 3.2 Output

One line per problem, grouped by file in path order, then a summary:

```
UC Design Kit · uc-site.py 1.2.0 · Estruturas de Dados 2025/26 (CC1007)
ERRO   semanas.html:142     ligação para guioes/aula13.html: o ficheiro não existe
AVISO  guioes/aula04.html   imagem sem alt: imagens/heap.png
INFO   codigo/Velho.html    nenhuma página liga para este ficheiro
116 páginas · 1 erro · 1 aviso · 1 informação
Índice: search-index.js (116 páginas, 685 secções, 289 KB)
```

Labels `ERRO`/`AVISO`/`INFO` (pt) and `ERROR`/`WARNING`/`INFO` (en). Line
numbers where the parser knows them. No colours (the DCC terminal and `cron`
mail must stay readable).

### 3.3 Checks

| Check | Level |
| --- | --- |
| `course.js` reads (2.2); required fields exist (`title`, `semester.start`); every page in `pages` exists; dates are valid `YYYY-MM-DD`; deadline `id`s are unique | error |
| Local links (`href`) and images (`src`, `srcset`) point to files that exist (fragment and query ignored; `mailto:`, `tel:`, `http(s):`, `//`, `javascript:`, `data:` skipped; a link to a folder needs its `index.html`) | error |
| Each page loads `uc-kit.css`, `course.js` and `uc-kit.js`, and those paths resolve to files (the kit path may point outside the site folder, e.g. `../../../kit/v1/`; it must exist **if** it is inside the folder tree that was given; outside it, the check is skipped) | error |
| Duplicate `id` in a page; `lang` on an element with a language the site does not have (only on sites with 2+ languages) | error |
| `search.exclude` entry that matches nothing | warning |
| Image without `alt` (an empty `alt=""` is fine); page without `<h1>`; heading level skipped (h2 → h4) | warning |
| File or folder without read permission for the web server (`o+r`, folders `o+x`) | warning (fixed with `--fix-permissions`) |
| Page that no other page links to (and that is not in `pages`) | info |
| Index older than a page (only in `check`, where it is not rewritten) | info |

External links are not checked (no network on the server; slow). The kit's
weekly `check-links.mjs` (blocks phase 5) covers the kit's own sites.

## 4. What goes into the index

### 4.1 Files

Every `*.html` file under the site folder, recursively, in path order, minus:
`search.exclude`; folders whose name starts with `.` or `_`; and pages with
`<uc-page search="noindex">`. Paths are stored relative to the site folder with
`/` separators.

### 4.2 Text that is left out

- `<head>` (except `<title>`, the page title fallback).
- `<script>`, `<style>`, `<noscript>`, `<template>`, `<svg>`, `<nav>` (the
  breadcrumbs written by the teacher).
- Any element with `data-search-ignore`, and everything inside it.
- The body of `<uc-code>`: only its `filename` attribute goes in (decision 6).
- Header, navigation and footer: the kit generates them, they are not in the
  HTML.

`alt` text of images goes in as text of the section.

### 4.3 Sections

A page is split into sections, in document order. A new section starts at:

| Element | Section `id` | Section title |
| --- | --- | --- |
| `<h2>`, `<h3>` | its `id`, or the automatic id (section 6) | heading text |
| `<uc-week n>` | `week-<n>` (what the kit sets) | `title` / `title-<lang>` |
| `<uc-exercise id>`, `<uc-question id>` | its `id` | `title` / `title-<lang>` |
| `<li id>` or `<article id>` | its `id` | first heading or link text inside |

Any of these with `data-search-title="…"` uses that title instead. Text before
the first section is the page's **intro** section (`i: ""`), kept only when it
has text. The page title is the text of the first `<h1>`, or the `<title>` up
to the first ` · `.

### 4.4 Languages

Single-language sites: one entry per page, without `l`.

Sites with 2+ `languages` follow the rule the kit already uses
(`language.js`): text inside an element whose `lang` is one of the site's
languages belongs to that language; everything else belongs to all of them.

- A file listed in `pages[].href` as `{ pt: "sobre.html", en: "about.html" }`
  belongs entirely to that language: one entry with `l`.
- A page with any language-specific text gets **one entry per language**, each
  with the common text plus that language's text, and `l` set.
- Any other page: one entry without `l` (shown in every language).

### 4.5 Excerpt and words

- `x` (excerpt): the section text, whitespace collapsed, cut at the last space
  before 140 characters, trailing `,.;:` removed, plus `…`.
- `w` (words): the distinct words of title + text, in order: lowercase,
  accents removed (NFD, combining marks dropped), `[a-z0-9][a-z0-9_-]*`,
  3+ characters or containing a digit, minus a short PT + EN stop-word list.
  The list is the one in `scripts/docs.mjs` plus English words (`the and for
  are with this that from you your can will not have has into its was were all
  any`); S3 copies it into the script and into `tests/search/words.json`.

## 5. Index file format

A script, not JSON, so that it also loads from `file://` (decision recorded in
the plan):

```js
/* Generated by uc-site.py 1.2.0. Do not edit: run python3 uc-site.py again. */
window.UC_SEARCH_INDEX = {"v":1,"generator":"uc-site.py 1.2.0","generated":"2026-11-20T10:00:00Z","course":"CC1007","languages":["pt"],"pages":[
{"t":"Semanas","p":"semanas.html","g":"weeks","s":[{"i":"","h":"","x":"…","w":"…"},{"i":"week-1","h":"Apresentação e introdução ao Java","x":"…","w":"…"}]},
{"t":"About the course","p":"about.html","g":"about","l":"en","s":[…]}
]};
```

| Key | Meaning |
| --- | --- |
| `v` | Format version, `1`. The kit ignores an index whose `v` it does not know (no button, a console warning). |
| `generator` | Script name and version. |
| `generated` | UTC time of generation, ISO 8601. Shown in the dialog footer and compared with `UC_COURSE.updated`. |
| `course` | `UC_COURSE.code` (or `""`). The kit warns in the console when it differs from the loaded `course.js` (copied folder, stale index). |
| `languages` | `UC_COURSE.languages` at generation time. |
| `pages[]` | One entry per page (per language, see 4.4). |
| `t` | Page title. |
| `p` | Path relative to the folder of `course.js`. |
| `g` | Optional: the `current` attribute of the page's `<uc-page>` (a `pages[].id`). Used to label groups ("Semanas · Aula 5"). |
| `l` | Optional: the language of the entry. Absent = every language. |
| `s[]` | Sections: `i` id (`""` for the intro), `h` title, `x` excerpt, `w` words. |

The documentation uses the same format: `scripts/docs.mjs` writes
`docs/assets/search-index.js` (its `g` are the sidebar groups, declared as
`pages` in the generated `docs/assets/course.js`) and the documentation
opens the kit's own dialog. One page per line, so diffs
of the examples' indexes stay readable.

## 6. Automatic heading ids

Many headings have no `id` (EDados guides `ajuda.html` and
`aula01-instalacao.html` have none), but a result must link to its section.

- **Which:** every `<h2>` and `<h3>` inside `<uc-page>` without an `id`,
  including those inside ignored regions (so numbering never depends on
  `data-search-ignore`). Not inside `<template>` or `<noscript>`.
- **When (kit):** in `core/anchors.js`, before any component renders. Only ids
  written in the HTML and `week-<n>` ids count as taken.
- **Text:** the heading's text content, whitespace collapsed, without the text
  of elements whose `lang` is another of the site's languages than the
  **first** one in `languages` (for a whole-language file: than that file's
  language). So the id is the same in every active language.
- **Slug:** the rule `uc-guide.js` already uses (`slugify`): NFD, drop
  combining marks, lowercase, every run of characters outside `[a-z0-9]`
  becomes `-`, trim `-`; empty → `section`.
- **Unique:** if taken, append `-2`, `-3`, … in document order.
- A teacher-written id never changes.

`uc-guide.js` switches to `core/anchors.js` in S1 (today it slugs the visible
text of the active language; no example has a bilingual guide heading without
an id, so no existing link changes).

`tests/search/slugs.json` holds the shared cases, run by the JS core tests and
by the Python unit tests:

```json
[
  { "html": "<h2>Exercício 2</h2>", "ids": ["exercicio-2"] },
  { "html": "<h2>A</h2><h2>A</h2>", "ids": ["a", "a-2"] },
  { "html": "<h2 id=\"a\">x</h2><h2>A</h2>", "ids": ["a", "a-2"] },
  { "html": "<h2><span lang=\"pt\">Árvores</span><span lang=\"en\">Trees</span></h2>", "languages": ["pt", "en"], "ids": ["arvores"] },
  { "html": "<h2>!!</h2>", "ids": ["section"] }
]
```

After start-up the kit scrolls again to the `#hash` target (the page only
becomes visible once components render) and highlights it for 2 s
(`.uc-target-flash`, no animation with `prefers-reduced-motion`). This also
fixes `#` links coming from other sites.

## 7. Kit: detecting the index

### 7.1 Only with `search`

Without `search`, none of this runs: no request, no reserved space.

### 7.2 Once per visit

1. After the page becomes visible, in `requestIdleCallback` (fallback
   `setTimeout(…, 1500)`), the kit sends `HEAD <index>` (URL relative to
   `course.js`, `cache: "no-store"`).
2. The answer is kept in `sessionStorage` under `uc:<course>:search`
   (`<course>` as in blocks-api 1.3) as `"1"` or `"0"`, so later pages of the
   same visit do not ask again. Storage unavailable → ask on every page.
3. `200`–`299` → available. Anything else, a network error or a timeout of
   5 s → not available.
4. Over `file://`, `HEAD` is not possible: the kit loads the index with a
   `<script>` tag right away (local, instant) and decides from
   `window.UC_SEARCH_INDEX`.

While the answer is pending, the header keeps the button's space (an invisible
placeholder of the same size) so that nothing shifts; it disappears if the
answer is "no".

### 7.3 Loading

Opening the search (button, shortcut, focusing an `<uc-search>` field) loads
`uc-search.js` (from the same folder as `uc-kit.js`) and the index (script tag)
in parallel, once. While they load, the dialog shows "A carregar…". A failure
shows "Não foi possível carregar a pesquisa." with a retry button.

### 7.4 Stale index

- The dialog footer shows "Índice de 20 nov 2026" (from `generated`).
- If `UC_COURSE.updated` is later than `generated`, or `course` differs from
  `UC_COURSE.code`, the kit writes one `console.warn` (students do not see it):
  `UC Design Kit: search-index.js is older than course.js (updated …). Run python3 uc-site.py.`

## 8. Kit: components, attributes and JavaScript API

### 8.1 `<uc-page>`

When the index is available, `<uc-page>` puts a **"Pesquisar"** button in the
header, before the language switcher (`aria-haspopup="dialog"`,
`aria-keyshortcuts="Control+K Meta+K /"`, visible `Ctrl K` hint on wide
screens). On narrow screens only the icon shows, with the same accessible
name.

| Attribute | Effect |
| --- | --- |
| `search="off"` | No button on this page (the page is still indexed). |
| `search="noindex"` | The page is not indexed (script). The button still shows. |

Shortcuts: `Ctrl K`, `⌘K` and `/` open the dialog. `/` is ignored while focus
is in an `input`, `textarea`, `select`, `[contenteditable]` or the `<uc-code>`
editor.

### 8.2 `<uc-search>` (new)

An inline search box with results below it, for example at the top of the
problems page. Renders nothing until the index is known to exist (and nothing
at all without it).

| Attribute | Type | Default | Meaning |
| --- | --- | --- | --- |
| `scope` | path prefix | — | Only pages whose `p` starts with it, e.g. `scope="problemas/"`. |
| `label` | text | `t("search.label")` | Visible label of the field. |
| `placeholder` | text | `t("search.placeholder")` | Placeholder. |
| `limit` | number | `10` | Results shown. |

### 8.3 HTML attributes read by the script

| Attribute | Effect |
| --- | --- |
| `data-search-ignore` | The element and its content stay out of the index. |
| `data-search-title="…"` | On a section element (4.3): the title shown in results. |
| `<uc-page search="noindex">` | The page stays out. |

### 8.4 JavaScript API

| Name | Description |
| --- | --- |
| `UC.search.available()` | `Promise<boolean>`: whether the index exists (runs the check of 7.2 if needed; `false` without `search`). |
| `UC.search.open(query?)` | Opens the dialog, optionally with a query. No-op when not available. |
| `uc:searchready` | Event on `document` when the index is known to exist (the button and `<uc-search>` listen to it). |

`UC.internal.searchIndex()` (loads and returns the parsed index) and the
matching function stay internal.

### 8.5 Interface strings (pt, en)

| Key | pt | en |
| --- | --- | --- |
| `search.button` | Pesquisar | Search |
| `search.label` | Pesquisar no site | Search the site |
| `search.placeholder` | Pesquisar páginas, aulas, exercícios… | Search pages, classes, exercises… |
| `search.loading` | A carregar… | Loading… |
| `search.failed` | Não foi possível carregar a pesquisa. | Could not load the search. |
| `search.retry` | Tentar de novo | Try again |
| `search.empty` | Sem resultados para «{query}». | No results for “{query}”. |
| `search.count` | {n, plural, one {# resultado} other {# resultados}} | {n, plural, one {# result} other {# results}} |
| `search.close` | Fechar | Close |
| `search.indexDate` | Índice de {date} | Index of {date} |
| `search.deadlines` | Prazos | Deadlines |
| `search.notices` | Avisos | Notices |

(Plural syntax as the existing dictionaries do it; S4 follows whatever
`i18n.js` supports.)

## 9. Matching, ranking and results

`kit/src/search/engine.js`, shared by the course sites and the
documentation (`scripts/docs.mjs` also folds the documentation's `w` with its
`words`):

- The query is folded like `w` and split into terms; **every** term must match.
- A term matches a word when it is a **prefix** of the word.
- One typo (decision 5): a term of 5+ letters also matches a word with
  Damerau–Levenshtein distance 1 on the same length prefix ("arvroe" →
  "arvore"), worth less. Own code, no library.
- Score: section title match > page title match > text match; exact prefix >
  typo; ties keep index order. At most 50 results in the dialog.
- Excerpts highlight matched words with `<mark>` (text built with DOM nodes,
  never `innerHTML` from the index).
- Results are grouped by page ("Semanas · Aula 5"); the link is
  `p#i` (or `p` for the intro), relative to `course.js`.
- `UC_COURSE.deadlines` and `notices` (already loaded) are searched at
  runtime, in their own group with the date, always fresh; they link to the
  deadline's page/anchor as `<uc-deadlines>` does.
- Entries with `l` other than the active language are skipped.

## 10. Accessibility

Same pattern as the docs dialog, which passed the WCAG 2.1 AA audit (PR 35):
modal `<dialog>`, field `role="combobox"` with `aria-expanded`,
`aria-controls` and `aria-activedescendant`, `role="listbox"` with groups
(`role="group"` + label), arrows / Enter / Esc, focus returned to the opener,
plus a `role="status"` region with the result count. `<uc-search>` uses the
same listbox without the dialog. Both go into `check-a11y.mjs` with ARIA
snapshots and keyboard tests. Targets 44 px; `<mark>` contrast checked.

## 11. Size, tests and phases

### 11.1 Size

| File | Budget (gzip) | Checked by |
| --- | --- | --- |
| `uc-kit.js` | 48 KB total (blocks-api 1.5); search adds about 1 KB (anchors, detection, button, shortcuts) | `build.mjs` |
| `uc-search.js` (new, in `kit/v1/`) | 6 KB: engine, dialog, `<uc-search>` | `build.mjs`, budget in `scripts/lib/budgets.mjs` |
| `uc-search.css` | inside `uc-kit.css` (small: dialog and results) | — |

### 11.2 Tests

- `tests/site-script/` (S2, S3): `unittest`, run in CI with **Python 3.8**
  (`actions/setup-python`) and the runner's default Python, on the four
  examples and on small broken sites made for the tests (every check of 3.3
  must fail once).
- `tests/search/slugs.json` (S3, used by S1): section 6.
- The examples' indexes are generated by `npm run build` through the script,
  and `build:check` fails when they are out of date (S3).
- Kit (S1, S4): core tests for anchors and detection (mock `HEAD`, `file://`
  path), no request without `search`; ARIA snapshots; keyboard tests; a v1.0
  site without `search` renders identically (existing screenshots unchanged).

### 11.3 Phases and files

| Phase | Builds | Main files | Starts after |
| --- | --- | --- | --- |
| S0 | This contract, measurements, prototype | `docs/architecture/search-api.md`, `search-phase-0-handoff.md`, `search-prototype.py` (deleted in S3) | — |
| S2 | `uc-site.py`: `course.js` reader, checks, commands, output; tests; `template/AGENTS.md`, `template/README.txt`, first version of `docs/pt/manter.html`, `course-js.html` values-only rule | `template/uc-site.py`, `tests/site-script/` | S0 |
| S3 | Extractor and index writer; `tests/search/slugs.json`; examples' indexes from `build.mjs`; `estrutura.html`; `manter.html` completed; delete the prototype | `template/uc-site.py`, `scripts/build.mjs` (only the call) | S2 |
| S1 | `core/anchors.js`, `core/search-loader.js` (detection, button, shortcuts, `UC.search`), `search` in `config.js`, `uc-guide.js` uses anchors, `uc-search.js` budget | `kit/src/core/*`, `uc-page.js`, `build.mjs`, `manifest.json` | blocks phase 5 and S3 |
| S4 | Engine, dialog, `<uc-search>`, course.js entries, index date; a11y | `kit/src/search/*`, `uc-search.css` | S1 |
| S5 | Docs (PT then EN), template `search: true` + script + zip, examples with index, Cloudflare check, CHANGELOG 1.2.0 | `docs/**`, `template/**`, `examples/**` | S4 and blocks phase 6 |

S2 and S3 only add files (and one call in `build.mjs`), so they run in
parallel with blocks phases 4 and 5 without conflicts. S1 onwards touch
`uc-page.js`, `build.mjs`, `manifest.json`, the dictionaries and `api.md`,
which blocks phase 5 also touches: they wait for it. Note for S5:
`docs/api.md` currently lists "server-side feature (search, …)" as out of
scope; that line changes.

## 12. Measurements (S0)

Prototype (`search-prototype.py`, Python 3.13, the rules of sections 4–6),
17 Nov 2026, on `main` at `3ec9030`:

| Example | HTML files | Entries | Sections | Index | gzip -9 | Time |
| --- | --- | --- | --- | --- | --- | --- |
| `edados-2526` | 116 | 116 | 685 | **288.6 KB** | **72.6 KB** | 0.19 s |
| `ip-2526` | 9 | 9 | 75 | 32.9 KB | 10.5 KB | — |
| `pc-2627` | 6 | 6 | 40 | 13.7 KB | 4.7 KB | — |
| `pi-2526` (pt + en) | 7 | 12 | 84 | 37.0 KB | 11.9 KB | — |

- EDados is **under the 300 KB stop threshold** of decision 8, but above the
  plan's estimate (~200 KB / ~50 KB gzip). Where it goes: `problemas/` 150 KB,
  `guioes/` 108 KB, top pages 20 KB, `codigo/` 19 KB; by key, `w` 164 KB,
  `x` 77 KB, `h` 14 KB, `i` 8 KB.
- Downloaded only when the search opens, compressed by the server and cached
  by the browser: ~73 KB once per cache lifetime is acceptable.
- Room if a future site is much bigger (S3 may apply them, recording it here):
  drop from `w` the words already in `h`; shorten `x` to 100 characters
  (−~25 KB on EDados); the script warns above 1 MB (500 KB until S5).
- `course.js` of all four examples reads with the reader of 2.2 (PI needs the
  constants support).
- Python on the DCC server: **not confirmed from here** (the sandbox cannot
  reach `dcc.fc.up.pt`). No sign that it is missing; the script targets 3.8,
  and the plan's fallback stands (run it on the local copy before uploading).
  Confirm with `python3 --version` on the first ssh session (S2 handoff asks).

## 13. Decisions taken in phase S0

1. **Constants in `course.js`.** The plan said "values only, no variables"
   and that the four examples comply; PI does not (`const ORIGINAL` with `+`
   and `${}`). Instead of editing the example, the reader accepts top-level
   constants, `+` between strings and `${NAME}` (2.2). Everything else stays
   an error with the line.
2. **`search` is one field**, `true` or `{ index, exclude }`, instead of
   three top-level fields (`index`/`exclude` alone would be ambiguous in
   `UC_COURSE`).
3. **Bilingual pages: one entry per language** (4.4) with the common text
   repeated, rather than a common entry plus language entries. The kit then
   filters by `l` with no de-duplication. Cost on PI: +1.5 KB.
4. **Auto ids from the first language** (6), not the active one, so links in
   the index work whatever language the visitor uses.
5. **Errors do not block the index** (3.1): with `course.js` readable, the
   default command writes the index and exits with `1`.
6. **`<nav>` and `<svg>` stay out** of the index (the teacher's breadcrumbs
   repeat the page names on every page).
7. **`g` (group) is the `<uc-page current>`** value, not a docs-style label.

## 14. Decisions taken in phase S2

Phase S2 wrote `template/uc-site.py` (checks, commands, output) and refined
section 3 as follows.

1. **`semester.start` missing is a warning**, not an error: the teacher guide
   (`course-js.html`) has it as "Recomendado" and the kit works without it
   (the weeks have no dates). Only `title` is required.
2. **`course.js` links are checked too**: local `url` fields, `logo`, and
   `href`/`src` inside HTML texts (notices, notes), resolved against
   `course.js` as the kit does (`resolveCourseLinks`). A target found there
   also counts as "linked" for the orphan check.
3. **Kit checks only on kit pages.** A page needs `uc-kit.css`, `course.js`
   and `uc-kit.js` only when it has `<uc-page>` or loads one of them; an old
   page copied as it was (migration "copiar tal como está") is not an error.
   The `<h1>` and heading-level warnings follow the same rule. `<uc-hero>`
   counts as the `<h1>` (it renders it).
4. **Extra checks**, all cheap and found useful on the examples:
   a local link whose file exists only with another case (`Semanas.html` vs
   `semanas.html`; macOS hides it, the DCC's Linux does not) is an **error**;
   a root-absolute path (`/~fds/…`) is a **warning**; a deadline without `id`
   or `title` or with an unknown `kind` is a **warning** (the same cases the
   kit writes to the console); a page that is not UTF-8 is a **warning** (it
   is then read as Latin-1 and still checked).
5. **Outside the site folder nothing is checked** (links and kit paths
   alike), as 3.3 says for the kit path: on the server a link to `../2526/`
   exists even when the local copy does not have it.
6. **Hidden files and folders** (name starting with `.`) and `__pycache__`
   are ignored by every check (`.git` of a local copy). Folders starting with
   `_` are checked; S3 leaves them out of the index only.
7. **`index` with search off** prints that search is off and exits `0`.
   Until S3, the default command and `index` print a line saying the index is
   not generated yet. `--version` says `1.2.0-dev`; S5 sets `1.2.0`.
8. **Message argument names** never use `file`, `line`, `level` or `key`
   (they clash with `Report.add`); see `MESSAGES` in the script.
9. **CI**: a separate workflow, `.github/workflows/site-script.yml`, runs the
   unit tests and `uc-site.py check` on every example in the official
   `python:3.8-slim` and `python:3-slim` images (3.8 is no longer in the
   runner images). It is not part of the required `check` status, so a PR
   is merged only when both workflows are green.
10. The first run found one real error: `examples/ip-2526/course.js` linked
    the second practical test to `practical/test2.html`, which was never
    migrated. It now points to the original site, as `MIGRACAO.md` says.

## 15. Decisions taken in phase S3

Phase S3 wrote the extractor and the index writer in `template/uc-site.py`
(`PageIndexer`, `page_entries`, `build_index`, `index_source`,
`write_index`) and refined sections 4 to 6 as follows.

1. **Path order** is the sorted list of site paths (`aulas/c.html` before
   `index.html`), not the folder walk order.
2. **Item sections end with their element.** `<uc-week>`, `<uc-exercise>`,
   `<uc-question>`, `<li id>` and `<article id>` hold the text inside them;
   text after the element goes back to the section it interrupted. An
   `<h2>`/`<h3>` inside an item starts its own section as usual.
3. **Item titles.** `title` / `title-<lang>` on weeks, exercises and
   questions are the section title (and, like any `lang` text, give a
   bilingual page one entry per language). For `<li id>` and `<article id>`
   the title is the text of the first `<h2>`–`<h6>` or `<a>` inside, which then
   stays out of the excerpt.
4. **Language text** follows `core/language.js` exactly: only elements inside
   `<body>` (the `<html lang>` of every page is not language text), `lang`
   equal to a site language or starting with it plus `-` (`en-GB`), and not
   elements with `data-uc-keep-lang`.
5. **Headings outside `<uc-page>`** (old pages copied as they were) get no
   automatic id, because the kit does not run there: they are sections with
   `i: ""`, so the result links to the page.
6. **Page title fallback** (no `<h1>`, e.g. `<uc-hero>` pages): the
   `<title>` up to the first ` · `, the same for every language. On PI the
   English home entry is titled "Início". S4 may label results by `g` with the
   kit's page names instead.
7. **Accents** are removed as in JavaScript: NFD, then U+0300–U+036F only
   (not every Unicode combining mark), so `slugify` matches `uc-guide.js`
   byte for byte. Words with a digit are kept at any length (`1`, `h2`), as in
   the docs index.
8. **Build tools.** `index --stdout` prints the index instead of writing it
   (messages go to stderr). `SOURCE_DATE_EPOCH` fixes `generated`.
   `scripts/example-indexes.mjs` (called by `build.mjs`) runs the script on
   every example whose `course.js` has `search` and compares the output
   without `generated`, so an unchanged index is never rewritten and
   `build:check` fails only when the pages changed. No example has `search`
   yet (S5 turns it on); `python3` is only needed then.
9. **Failures.** An index path outside the site folder is refused, and a
   write that fails (permissions, disk) is printed even with `--quiet` and
   gives exit status `1`. The size warning above 500 KB is a line after the
   summary, not a problem in the report.
10. **Shared cases:** `tests/search/slugs.json` (contract section 6 plus
    weeks, ignored regions, templates, region languages) and
    `tests/search/words.json` (`stopWords` and `cases` for section 4.5). The
    Python tests run both; S1 (slugs) and S4 (words) run them in the kit.

Measurements on `main` after S3 (the same machine as section 12):

| Example | HTML files | Entries | Sections | Index |
| --- | --- | --- | --- | --- |
| `edados-2526` | 116 | 116 | 685 | 290.1 KB |
| `ip-2526` | 9 | 9 | 75 | 33.2 KB |
| `pc-2627` | 58 | 58 | 250 | 106.4 KB (problem statements added in PR 48) |
| `pi-2526` (pt + en) | 7 | 12 | 84 | 38.3 KB |

## 16. Decisions taken in phase S1

Phase S1 wrote `kit/src/core/anchors.js`, `kit/src/core/search-loader.js`,
the `search` field in `config.js`, the header button in `uc-page.js`, the
`uc-search.js` bundle (a placeholder) and `scripts/check-search.mjs`, and
refined sections 6 to 8 as follows.

1. **When ids are given.** `anchors.js` runs on `DOMContentLoaded` before
   `element.js` defines the components (or at once when the kit is loaded
   after parsing). It is placed before `element.js` in `manifest.json` for
   that reason. The file's own language (6) is found by matching the page's
   file name against `pages[].href` objects, without `<uc-page current>`.
2. **`#hash` after start-up** happens once, in the first animation frame
   after `.uc-visible`; not on `hashchange` (in-page links already scroll, and
   the skip link to `#uc-main` must not flash). `.uc-target-flash` is a soft
   accent background with an outline; with `prefers-reduced-motion` it has no
   transition.
3. **Detection starts on `uc:ready`**, in `requestIdleCallback` (fallback
   1.5 s), whenever `search` is on (also on a page without `<uc-page>`, so
   `<uc-search>` and `UC.search` work there). A known answer from
   `sessionStorage` sets the state before the header renders: `"1"` shows the
   button at once (no placeholder), `"0"` renders nothing, and
   `uc:searchready` is still dispatched on `uc:ready`. A timeout or network
   error is remembered as `"0"` for the visit, like a 404.
4. **Unknown index format** (`v` ≠ 1, or no `pages` array) over HTTP is only
   seen when the index is loaded (on open): the button is removed and a
   warning written; it is not stored in `sessionStorage`.
5. **Console messages** use the kit's usual prefix: `[uc-kit] search-index.js
   is older than course.js (updated …). Run python3 uc-site.py.` and a second
   one when `course` differs: `[uc-kit] search-index.js was made for "…", not
   for this course.js. …`.
6. **`<uc-page search="off">`** also turns the shortcuts off on that page
   (there is no opener to return focus to).
7. **Button.** Label `search.button` ("Pesquisar"/"Search"), icon `search`,
   hint `Ctrl K` (`⌘ K` when `navigator.platform` is Apple) shown above
   960 px, icon only at 480 px and below (the label stays as visually hidden
   text, so the accessible name is unchanged), hidden when printing. The
   pending placeholder is the same button with `visibility: hidden` (out of
   the accessibility tree and the tab order).
8. **Loader ↔ `uc-search.js` interface.** `UC.search.open(query)` checks
   availability, then loads `uc-search.js` (next to `uc-kit.js`, from
   `document.currentScript`) and the index in parallel, once each (a failed
   load can be retried), and calls
   `UC.internal.searchUI.open({ index, query, opener })`, where `opener` is
   the element focused before opening. `uc-search.js` must set
   `UC.internal.searchUI` (the S1 placeholder only warns). The "A carregar…"
   state and the retry button of 7.3 belong to the dialog (S4): today a
   failed load only writes a console warning. `UC.internal.searchIndex()`
   returns the loaded index (rejects with search off).
9. **Size.** `uc-kit.js` went from 44.6 to 46.5 KB gzipped (+1.9 KB, not the
   estimated 1 KB): about 1.5 KB of the 48 KB budget is left. `uc-search.js`
   is a separate bundle (`manifest.json` key `search`) with its own 6 KB
   budget in `build.mjs`.
10. **Tests.** `scripts/check-search.mjs` (in `npm test`, CI job 2) runs
    every `slugs.json` case with the kit in `<head>` and with `defer`, plus
    detection, button, shortcuts, file:// and warnings, on made-up pages
    served by Playwright. `tests/pages/search/` is a real page with search on
    and a hand-written index (checked by `check-pages` and `check-a11y`).
11. **Note for S5.** A site with `search` but no index answers the `HEAD`
    with 404, which Chromium logs as a console error and `check-pages.mjs`
    counts as a failure (any local response ≥ 400). The template ships
    `search: true` (decision 4), so S5 must either generate its
    `search-index.js` or let `check-pages` accept a 404 for the index `HEAD`.


## 17. Decisions taken in phase S4

Phase S4 replaced the `uc-search.js` placeholder with `kit/src/search/`
(`strings.js`, `engine.js`, `results.js`, `dialog.js`, `element.js`) and
`kit/src/css/components/uc-search.css` (inside `uc-kit.css`), and refined
sections 7 to 10 as follows.

1. **Loader ↔ dialog interface.** `UC.search.open()` starts the index
   download, loads `uc-search.js` and then calls
   `UC.internal.searchUI.open({ load, query, opener })`, where `load()`
   returns the (memoised) index promise. So the dialog opens as soon as the
   5 KB engine is there and shows "A carregar…" while the index (up to
   ~75 KB gzipped) arrives, and "Tentar de novo" calls `load()` again. While
   `uc-search.js` itself loads the header button has `aria-busy="true"`; if
   it fails, `search.failed` (the only new string in `uc-kit.js`, with
   `search.button`) is announced in the shared live region. No dialog shell
   in `uc-kit.js` (budget).
2. **Strings** of 8.5 live in `uc-search.js` and are added with the new
   `UC.internal.addDefaults(lang, dict)`, which never overrides a string the
   site set and does not re-render. There is no plural syntax in `i18n.js`:
   `search.count` ("{n} resultados") plus `search.countOne`. Extra key:
   `search.keys` (footer hint, `aria-hidden`).
3. **Query terms.** Words of the query that pass the index's word rule (4.5:
   3+ letters or a digit, no stop word) are required; stop words and 1–2
   letter words only add a fifth of their points. A query made only of
   those ("ar", "com") requires them all, so the first letters typed already
   give results.
4. **Typo** (decision 5) is checked against the word's prefix of the term's
   length: one substitution or one swap of neighbours. Insertions and
   deletions are not matched.
5. **Points per term:** section title 30 (typo 15), page title 20 (10),
   text 5 (2); intro sections use the page title as their title and get +1,
   so the page itself comes before its sections. At most 5 results per page
   and 50 in all (the dialog) or `limit` (`<uc-search>`, default 10).
6. **Group label:** `<pages[] label of g> · <t>` when they differ, else
   `t`. Runtime groups "Prazos" and "Avisos". Deadlines link to `url`, else
   to the `assessment` page, else `home`; notices to their first link (it is
   relative to `course.js`), else `home`. Notices dated after today are left
   out, as `<uc-notices>` hides them. `<uc-search scope>` skips both groups.
7. **Options are links** (`<a role="option" tabindex="-1" href>`), so
   Ctrl/⌘/middle-click opens a new tab. Keys on the field: ↑ ↓ (wrap),
   Page Up/Down (5), Enter. Esc closes the dialog (native `cancel`) or clears
   `<uc-search>`. A click on an option keeps focus in the field until it
   navigates.
8. **Result on the same page:** `history.pushState` of the hash (when it
   changes), open every `<details>` ancestor, `anchors.revisitHash()`
   (scroll + flash), `tabindex="-1"` when needed and focus on the target; the
   dialog then does not give focus back to the opener.
9. **Status.** The dialog has its own `role="status"` line (the page's live
   region is inert behind a modal dialog): the count is visually hidden,
   "A carregar…", the failure and "Sem resultados para «…»." are shown.
   `<uc-search>` shows those in `.uc-search__message` and announces the count
   through `UC.internal.announce` 700 ms after typing stops.
10. **`<uc-search>` loading.** `uc-kit.js` loads `uc-search.js` on
    `uc:searchready` when the page has a `<uc-search>`; the element is
    defined there, so before (and without an index) it is an empty unknown
    element. Its index downloads on the first focus or input.
11. **Tests.** `check-search.mjs`: `words.json` cases and the stop-word list,
    engine (prefix, typo, required terms, ranking, language, scope, limit,
    runtime entries, highlight), dialog (loading, groups, arrows, Enter to
    another page and on the same page, Esc, backdrop, retry, engine failure,
    English strings, index date) and `<uc-search>`. `check-a11y.mjs`: a
    search check on pages whose site has an index (modal, combobox/listbox,
    44 px options, axe with the dialog open and with `<uc-search>` results,
    320 px) and two snapshots, `tests/pages/search/dialog.aria.yml` and
    `uc-search.aria.yml`; snapshots may now have a `prepare` step.
12. **Docs.** New page `docs/pt/componentes/uc-search.html` (demos in
    `docs/demos/uc-search/`, with a small index of demo pages made by
    `uc-site.py index`), `uc-page.html#pesquisa` describes the dialog,
    `docs/api.md` 3.1 (`Search dialog`, `<uc-search>`) and 6. Every page
    still says "1.2.0, em preparação"; S5 removes that.
13. **`uc-site.py`:** `lang` on `<uc-code>` is the programming language and
    is no longer checked against the site's languages (found by the PI
    migration, which used `data-lang` as a work-around).

## 18. Decisions taken in phase S5

1. **Index size.** `LARGE_INDEX` in `uc-site.py` is now 1 MB (about
   250 KB gzipped): the 300 KB of decision 8 was only the stop threshold of
   S0. A bigger index only makes the first search of a visit slower. The
   warning says so. Sharding stays out unless a site passes about 2 MB; the
   compaction of section 5 (`w` without the words of `h`, 100-character
   `x`) was not applied: the gain (−12 %) did not justify a format change
   shared with the engine tests.
2. **PI.** Its 112 problem statements are back in the index (no more
   `search="noindex"`): 368 KB, 99 KB gzipped. `tests/site-script` now checks
   every example against `LARGE_INDEX` instead of 300 KB.
3. **Examples and template.** All four examples and the template have
   `search: true`. `scripts/example-indexes.mjs` also writes
   `template/search-index.js`, so the zip ships an index and `check-pages`
   gets no `HEAD` 404 (note 16.11). The PC problems page has
   `<uc-search scope="problems/">`.
4. **Version.** `uc-site.py --version` says `1.2.0`. The docs no longer say
   "em preparação"; the CHANGELOG keeps the entries under Unreleased until
   the release is tagged (the release itself is the maintainer's call).
5. **Docs.** `manter.html#indice-atualizado` (index date in the dialog
   footer, the three `[uc-kit]` console warnings), `publicar.html#pesquisa`
   (`HEAD` on Cloudflare, optional Apache `.htaccess` compression),
   `novo-ano.html` and `migrar.html` (run `uc-site.py` after copying),
   `criar-site.html` (the template's `search-index.js`), `llm.html` and
   `template/AGENTS.md` rule 14 (`<uc-search>`, `data-search-ignore`).
6. **Accessibility.** With real indexes, axe found that a long result list
   makes `.uc-search-dialog__body` a scrollable region with no tab stop (the
   options are `tabindex="-1"`): it now has `tabindex="0"`. `check-a11y`
   searches for the longest word of each page's `<h1>` instead of `arvores`,
   so English sites and the template get results too.
