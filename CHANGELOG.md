# Changelog

All notable changes to the kit are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and the kit uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Fixed
- `<uc-materials>`: an item with many links no longer squeezes its title to
  one letter per line; the title keeps at least 12rem and the buttons wrap.

### Added
- Blocks for the patterns that the four example sites wrote by hand
  (curation of the examples): `uc-page-header` and `uc-eyebrow` for the top of
  a page without inline `style`, `uc-crumbs` (breadcrumbs outside
  `<uc-guide>`, same look), `uc-samples` (input/output of a problem, stacked
  on phones), `uc-steps` (numbered syllabus 01, 02…), `uc-tags`,
  `uc-tag--danger`, `uc-links--inline`, `uc-facts` (label/value `<dl>`),
  `uc-table--fit` and `uc-num`, and `details.uc-details` (the look of the
  hints of `<uc-problems>`, anywhere in a page).
- `<link rel="alternate" hreflang="…">` in a page's `<head>`: the language
  switch opens that file. Lab guides and problem statements with one file per
  language no longer need an "English version" link.
- `source` in `course.js` (`{ author, url }`) and `<uc-page source="…">`: a
  footer line "Conteúdo de …, a partir do site original" for sites copied
  from an older one, instead of a note at the end of every page. New class
  `.uc-footer__source`.
- `<uc-grading>` reads the assessment method as text formulas, as on the
  course slide: an `<ol data-formulas>` with `max`/`min` and named formulas
  (`CF = max(0.75*E + 0.2*P + 0.05*R; 0.65*E + 0.3*P + 0.05*R)`), and the pass
  rules in a `<ul data-rules>` (`E >= 4.9`, `CF >= 9.5`, or plain text). The
  table and bars get one weight column per formula, and a new `result`
  attribute names the final formula. Pages without these lists are unchanged
  (grading phase G2, `docs/architecture/grading-api.md` 3 to 8).
- With `data-formulas`, `<uc-grading calculator>` simulates the formulas: the
  value of each branch of a `max`/`min`, the final grade with the branch
  that counts, every rule checked with ✓/✗ and words ("cumprido" / "não
  cumprido", "não verificado" for text rules) and a pass or fail line naming
  the first rule that fails. New classes `.uc-grading__branches` and
  `.uc-grading__checks` (grading phase G3, `docs/architecture/grading-api.md` 9).

- Guide for `<uc-grading>`: a new "Exemplos das cadeiras" section with three
  real methods written with formulas and rules (Estruturas de Dados 2026/27,
  Programação Imperativa 2025/26 with its literal formula, Competitive
  Programming 2026/27 with a text rule). The PI example page now uses
  `CF = (0.7*EF + 0.25*AP + 0.05*RE) / 5`, and the PC one lists the RFC rule
  (grading phase G4).

### Fixed
- `<uc-grading calculator>`: on a bilingual page, a field's label keeps the
  component's name written in `<span lang="…">` (only the active language);
  before, every `<span>` was dropped and the label read "E: (0 a 20)".

### Changed
- `<uc-grading>` now lives in its own file, `kit/v1/uc-grading.js`, which
  `uc-kit.js` loads from its own folder only on pages that have a
  `<uc-grading>` (grading phase G1, `docs/architecture/grading-api.md` 2). Nothing
  changes on the page, and `uc-kit.js` drops from 47.0 KB (in 1.0.0) to 44.9 KB
  gzipped. Sites that load the kit from `uc-design-kit.miguelrocha.dev` need
  nothing; a site that keeps its own copy of the kit must copy the whole
  `kit/v1` folder, not only `uc-kit.js` and `uc-kit.css`.
- The saved language, the "done" marks of `<uc-exercise>` and the cached
  weeks page of `<uc-this-week>` are saved per course, like every newer
  choice (`uc:<course>:lang`, `uc:<course>:done:…`,
  `uc:<course>:weeks-page:…`), through the kit's one storage helper. On the
  first visit a value saved under the old key is adopted, so students keep
  their marks; choosing a language in one course no longer changes the
  others on the same server.

### Removed
- Two unused internal helpers, `UC.internal.hasLanguage` and
  `UC.internal.hasText`.
- The phase plans and handoff notes in `docs/plan/` (history in git); the
  four design contracts moved to `docs/architecture/`.

## Widgets [1.0.0] - 2026-11-17

The algorithm widget library (`widgets/v1/`, frozen as `widgets/v1.0.0/`)
has its own versions; contract `docs/architecture/widgets-api.md`. Its first release
ships together with kit 1.0.0, under the same tag `v1.0.0`, and needs kit
1.0 or later.

### Added
- 18 widgets, all `stable`: sort, search, bst, list, stack-queue, recursion
  (wave 1); heap, avl, hash, graph, shortest-path, complexity (wave 2); mst,
  union-find, toposort, dp, backtracking, trace (wave 3).
- Core (phase W1): `uc-widget-core.js` and `uc-widget.css`, loaded by each
  widget file from its own folder; `UC.widgets` (`Widget`, `register`,
  `svg.array`, `parse`, `random`); step engine, player (Play, Back, Step,
  Reset, scrubber), keyboard, pseudocode panel (or the teacher's own code with
  `data-line`), state panel, narration with a live region, "Vista em texto",
  `predict`, `editable`, error notes, events `uc:widgetstep`,
  `uc:widgetdone`, `uc:widgetpredict`; `widgets/v1/catalog.json`.
- `<uc-widget-sort>`: bubble, selection, insertion, merge,
  quick (`pivot`) and counting sort, `bars`.
- Documentation: "Widgets" group (Catálogo, Usar widgets, uc-widget-sort),
  `docs/api.md` 7.2, `template/AGENTS.md`; tests in `tests/widgets/`
  (`npm run test:widgets`).
- Phase W2: `<uc-widget-search>` (linear, binary, lower
  bound), `<uc-widget-bst>` (insert, remove, search, min, max; pre-, in-,
  post- and level-order traversals), `<uc-widget-list>` (singly linked list,
  including reverse), `<uc-widget-stack-queue>` (stack and queue, in an array
  with a circular queue or in a linked list), `<uc-widget-recursion>`
  (factorial, Fibonacci, Towers of Hanoi). Core: `svg.tree`, the common
  attribute `algorithms` (toggle buttons), per-operation pseudocode
  (`step.code`); `svg.list` is bundled into the two widgets that use it.
  Small arrays and trees are no longer drawn larger than 1:1.
- The EDados example's lab guide 10 uses `<uc-widget-bst>`; the extension
  `extensions/uc-bst-traversal.js` stays as the custom component tutorial.
- Phase W3: `<uc-widget-heap>` (max or min heap drawn as its
  array and its tree; insert, extract, peek, heapify, heapsort),
  `<uc-widget-avl>` (insert, remove, search with heights, balance factors and
  the four rotations), `<uc-widget-hash>` (separate chaining, linear and
  quadratic probing; tombstones, load factor and the table doubling; integer
  or word keys). `svg.grid` is bundled into `<uc-widget-hash>`; the core is
  unchanged.
- Phase W4: `<uc-widget-graph>` (BFS with its queue and
  distances, recursive DFS with its call stack, connected components;
  directed or not), `<uc-widget-shortest-path>` (Dijkstra with its priority
  queue, Bellman-Ford with negative cycle detection),
  `<uc-widget-complexity>` (growth functions as n grows, with measured
  counts of another widget via `for`). Graph input in `<pre data-input>` or
  the new `edges` attribute; `svg.graph` (automatic layout per connected
  component) is bundled into the graph widgets and `svg.plot` into the
  complexity widget. Core: `uc:widgetdone` carries `stats` and `input`; new
  counters `edges` and `relaxations`.
- Phase W5: `<uc-widget-mst>` (Kruskal with union-find,
  lazy Prim; spanning forests), `<uc-widget-union-find>` (union by size and
  path compression, or without them; the parent array and the forest),
  `<uc-widget-toposort>` (Kahn and DFS, naming a cycle when there is one),
  `<uc-widget-dp>` (LCS, edit distance, 0/1 knapsack, coin change, with the
  reconstruction path), `<uc-widget-backtracking>` (N queens, subsets with a
  target sum and their cuts, permutations), `<uc-widget-trace>` (the
  teacher's own steps in JSON, with array, tree, graph or grid drawings).
  "Criar um widget" guide, `widgets/template/` (a widget of one's own in one
  plain script, and the catalogue checklist). Core: decimals in the page
  language ("2,3" in Portuguese) in narration, panel, text view and labels;
  a rebuild clears an old field error.
- Phase W6: every widget is `stable` (attributes, `ops` verbs, methods and
  events kept for all of 1.x). `npm run snapshot:widgets` freezes
  `widgets/v1/` as `widgets/vX.Y.Z/` with its `SHA256SUMS` (it refuses a
  `-dev` version, an unstable widget or a missing kit release), and
  `npm run build:check` verifies widget releases like kit releases.
  `tests/widgets/compat.html` uses the 1.0.0 API of every widget and of a
  teacher's own widget, and the page check opens it against `widgets/v1/` and
  every frozen release. The catalogue lists the waitlist instead of the
  planned waves.
- The EDados, IP and PC examples use widgets in their lab guides (see the
  kit notes below).

## [1.0.0] - 2026-11-17

First release of the kit, frozen as `kit/v1.0.0/` (tag `v1.0.0`). It
collects all the work so far; earlier plans that mentioned 1.1.0 or 1.2.0
refer to this release.

### Changed
- Examples: the EDados lab guides 6, 7, 8, 9, 11 and 12, the IP practical
  classes 6 and 9 and the PC weeks 2, 3, 6 and 7 show their algorithms with
  widgets (list, stack and queue, complexity, backtracking, bst, heap,
  recursion, sort, dp, toposort), each with its fallback text.

### Added
- `logo` in `course.js` also takes an inline SVG string (`"<svg …>"`, drawn
  in the accent colour when it uses `currentColor`) and an object
  `{ src | svg, alt }` whose `alt` (a `LocalizedText`) names the image for
  screen readers. Without `alt` the logo stays decorative. `uc-site.py check`
  checks `logo.src` and skips inline SVG.
- `<uc-problems>`: `cards` (one card per problem, with a "Mooshak PC033"
  judge seal that links to the judge), `data-languages` on problems ("Testado
  em C++ Java", once per series when all match) and styled hints from a
  `<details>` in the item (hidden when empty). The PC 2026/27 example uses
  them on its weekly problem sets.
- `uc-site.py` in the template (search phase S2): the site maintenance
  script, Python 3.8+ with the standard library only. `python3 uc-site.py
  check` reads `course.js` without running it (values only, with constants),
  checks required fields, pages, dates, deadline ids, local links and images
  (exact case), the kit files of every page, duplicate ids, `lang` values,
  `alt`, `<h1>` and heading levels, web-server read permissions
  (`--fix-permissions`) and pages nothing links to. Messages in Portuguese and
  English, exit status 1 on errors, `--quiet` for `cron`. Teacher guide page
  "Manter o site"; tests in `tests/site-script/` run on Python 3.8 and the
  current Python in CI.
- The search index (search phase S3): with `search: true` (or
  `search: { index, exclude }`) in `course.js`, `python3 uc-site.py` and
  `python3 uc-site.py index` write `search-index.js` (a script setting
  `window.UC_SEARCH_INDEX`, so it also loads from `file://`): every page split
  into sections at `<h2>`/`<h3>`, weeks, exercises, questions and `<li id>`/
  `<article id>`, with automatic ids for headings without one, one entry per
  language on bilingual pages, `data-search-ignore`, `data-search-title` and
  `<uc-page search="noindex">`. Written atomically with mode 644;
  `index --stdout` prints it. Shared test cases for the kit in
  `tests/search/` (`slugs.json`, `words.json`). `npm run build` regenerates
  the index of every example whose `course.js` has `search`.
- Automatic heading ids (search phase S1): every `<h2>`/`<h3>` inside
  `<uc-page>` without an `id` gets one from its text (`Exercício 2` →
  `exercicio-2`, repeats `-2`, `-3`; first-language text on bilingual sites),
  the same rule as `uc-site.py`, so any section can be linked. After start-up
  the kit scrolls again to the `#hash` target and highlights it for 2 s
  (`.uc-target-flash`). `<uc-guide>` uses the same ids.
- Search foundations in the kit (search phase S1): the
  `search` field of `course.js` (`UC.course.search`), one `HEAD` per visit at
  idle for the index (`sessionStorage`, 5 s timeout; the index script over
  `file://`), the header button "Pesquisar" with `Ctrl K`, `⌘K` and `/`,
  `<uc-page search="off">`, `UC.search.available()`, `UC.search.open()`, the
  `uc:searchready` event and the new `uc-search.js` (loaded on open, 6 KB
  budget; the dialog comes in phase S4). Sites without `search` make no new
  request. Browser checks in `scripts/check-search.mjs`.
- The search dialog and `<uc-search>` (search phase S4):
  `uc-search.js` (5 KB gzipped) now holds the engine (folded prefix
  matching, one typo from 5 letters, section title > page title > text,
  grouped by page, language filter), the modal dialog of the header button
  ("A carregar…", "Tentar de novo", index date, results on the same page
  open their `<details>` and take focus) and the new `<uc-search>` element
  (`scope`, `label`, `placeholder`, `limit`), loaded only on sites with an
  index. Deadlines and notices of `course.js` are searched at runtime.
  Combobox + listbox with arrows, Enter and Esc; checked by `check-search`,
  `check-a11y` and two new accessibility-tree snapshots. Fix:
  `uc-site.py check` no longer reports the `lang` of `<uc-code>` (the
  programming language, `lang="c"`) as a language the site does not have.
- Search on in the template and the examples (search phase S5): `search:
  true` in `template/course.js` and in the four examples, each with its
  `search-index.js` (the template's is rewritten by the first run of
  `uc-site.py`); `<uc-search scope="problems/">` on the PC problems page; the
  PI problem statements are back in its index. `uc-site.py` is `1.0.0` and
  warns above 1 MB instead of 500 KB. Teacher guide: index date and console
  warnings (`manter`), search on Cloudflare and optional Apache compression
  (`publicar`), run the script after copying a year (`novo-ano`) or
  migrating (`migrar`), `template/AGENTS.md` rule 14.
- The search dialog's result area is a keyboard stop (`tabindex="0"`), so a
  long list that scrolls can be reached without a mouse (WCAG 2.1.1; found
  by axe once the EDados example had a real index).
- `<uc-timetable>` (blocks phase 1): the weekly classes from the new
  `schedule` and `scheduleTypes` fields of `course.js`, one table per type or
  grouped by weekday (`view="days"`), with a saved "My class" choice per type
  (`class-filter`, event `uc:classchange`) and the team's office hours.
- `officeHours` on team members, shown on `<uc-team>` cards and as an extra
  column of its table.
- `a[data-auth]`: links that need a login get a lock icon and a hidden
  "(Requer autenticação)" text, in page HTML, `HTMLText` and components.
- `<uc-grading>` (blocks phase 2): decorates the teacher's list of grade
  components (weights in `<data>`, `data-code`, `data-scale`, `data-min`,
  `data-bonus`, parts in a nested list) with a generated formula, a
  proportions bar and a table of weights and minimums, and an optional grade
  simulation (`calculator`, `pass`).
- `<uc-assessment-info>` (blocks phase 2): the card of one exam or test from
  its deadline (date, time or shifts, duration, location, status, links),
  with an optional `.ics` download (`calendar`).
- `duration`, `location` and `shifts` on deadlines. `<uc-event>`,
  `<uc-deadlines>` and `<uc-this-week>` show the shift times ("14:30 e
  16:30") or the range with the duration ("14:30–16:30"); `<uc-event>` and the
  table of `<uc-deadlines>` also show the location.
- `UC.formatTime`, `UC.formatDuration`, `UC.weekdayName`.
- `<uc-summaries>` (blocks phase 3): decorates the teacher's list of lecture
  summaries with the date and weekday in the active language, a link to the
  item's week, the semester breaks between items, "Última aula" and
  "Prevista" states (`order="desc"`, `no-breaks`, `no-weeks`) and an
  accent-insensitive search that highlights matches (`search`).
- `<uc-weeks view="compact">` (blocks phase 3): the same weeks as one table,
  one row per week (dates, topic, deadlines, status), breaks as full-width
  rows; and `href` on `<uc-week>`, the page of that week's class ("Página da
  aula" in the full view, the title link in the compact view).
- `<uc-materials>` (blocks phase 4): decorates the teacher's list of
  materials per lecture: links become buttons with a type icon recognised
  from the URL (PDF, notebook, GitHub, video, archive, code; `data-type`
  overrides, `slides` only by hand), the first `<time>` reads "Atualizado a
  18 nov", recent items get "Novo" (`new-days`) and items without links read
  "Sem material".
- `<uc-problems>` (blocks phase 4): problem series (`<section
  data-deadline>`) with judge (`data-judge`) and type (`data-type`: extra,
  challenge) tags, a weight from `<data>`, the series deadline and its state,
  filters by type and judge (`filters`) and a "Resolvido" checkbox per
  problem saved per course in `localStorage` (`track`, event
  `uc:problemchange`).
- `id` and `hidden` on `platforms` entries: `<uc-problems data-judge>` finds a
  platform by `id` (or by label), and `hidden: true` keeps it out of the
  navigation.
- `table[data-sortable]` (blocks phase 5): header buttons sort the table by
  numbers (decimal comma), dates (`<time datetime>`) or text in the active
  language, with `aria-sort` and an announcement; `data-sort-default`,
  `data-no-sort`, `data-sort` and `data-sort-fixed` (totals).
- `uc-links--grid` and the local token `--uc-links-min`: long link lists in
  columns.
- `<uc-page updated>`: a page's own date in the footer, or `auto` (the
  file's `Last-Modified`, never "today").
- Editions: `editions` in `course.js` points to a shared `editions.js`
  (`window.UC_EDITIONS`) above the year folders; `<uc-page>` shows "Outros
  anos" in the header and, on older editions, a notice linking to the current
  one. The template has the line, commented out.
- `scripts/check-links.mjs` and the weekly workflow `links.yml`: the external
  links of the examples, template and docs, with one `broken-links` issue.
- Documentation: patterns "Horários e equipa", "Sumários" and "Materiais", the
  assessment pattern with `<uc-grading>` and `<uc-assessment-info>`; editions in
  "Novo ano letivo"; broken links and page dates in "Publicar".
- Internal pieces for the new blocks: one shared live region
  (`<pre data-copy>` and `<uc-code>` now use it), course-scoped storage keys
  (`uc:<course>:…`), the filter bar (`uc-filters`), page enhancements run
  after each component render. `scripts/build.mjs` fails above 48 KB gzipped
  for `uc-kit.js` and prints its size (37 KB until phase 3, raised with
  Miguel's approval on 17 Nov 2026 to fit the remaining blocks).
- Accessibility (WCAG 2.1 AA audit): `heading-level` on `<uc-notices>`,
  `<uc-deadlines>`, `<uc-team>` and `<uc-this-week>` (2–6, default 2; the
  heading looks the same at any level); a check mark on the right answers of a
  solved `<uc-question>` (`.uc-question__mark`); a console warning when
  `accentColor` has less than 4.5:1 contrast with white; `scripts/check-a11y.mjs`
  in `npm test` (keyboard walk, focus indicators, label in name, reflow at
  320 px, text at 200 %, reduced motion, focus and announcements of the
  components).
- Migration with a coding agent: the page "Migrar um site existente" with a
  ready-to-paste prompt for Claude Code, Codex and similar agents, and
  `template/AGENTS.md` (kit rules and the migration procedure), now part of
  the template zip.
- Documentation for language models: `llms.txt` (index and rules) and
  `llms-full.txt` (every page as Markdown, plus `docs/api.md`) at the site
  root, a `.md` version of every documentation page (linked from its
  footer), and the page "Usar com uma LLM" with a ready-to-copy prompt.
  Generated by `npm run build` (`scripts/llms.mjs`); `build:check` fails
  when they are out of date.
- Documentation site (phase 5): the Exemplos group (Estruturas de Dados
  2025/26, five page patterns with live demos) and the Referência group
  (JavaScript API, runners, stable CSS classes, versions, browsers and
  limits, contributing). Ctrl K / ⌘K / `/` opens a search over every page,
  from a static index that `npm run build` writes to
  `docs/assets/search-index.js`. `check-docs` now also checks the JavaScript
  API and runners against `docs/api.md` section 7, and that every class the
  kit styles or generates is documented.
- Documentation site (phase 1): a landing page at the site root, the
  documentation frame in `docs/pt/` (sidebar, "Nesta página", previous/next,
  live demos in iframes with their code generated from the demo files), the
  Introduction and the `<uc-week>` page. `npm run build` fills the generated
  parts; `npm test` also runs `scripts/check-docs.mjs` (navigation, links and
  attribute coverage against `docs/api.md`) and checks the docs pages.
- Documentation site (phase 2): the "Começar" pages (create a site, site
  structure, every `course.js` field, languages, new academic year,
  publishing) and a starter site in `template/`, downloadable as
  `docs/downloads/uc-template.zip` (built by `npm run build`). The page checker
  serves the public kit URL from `kit/` on disk, and `check-docs` also checks
  the `course.js` page against `docs/api.md` section 2.
- Documentation site (phase 3): the components overview and a page for every
  component, with about 60 live demos. `npm test` now fails when a component
  of `docs/api.md` has no page (`check-docs --strict`).
- `<uc-code collapsible>`: a show/hide toggle in the header; add `collapsed`
  to start folded. The EDados lecture code pages use it.
- `<pre data-copy>`: a copy button for preformatted text such as problem
  input/output examples. The EDados problem pages use it on every example.
- Frozen releases: `npm run snapshot` copies the build to `kit/vX.Y.Z/`, served
  with `Cache-Control: immutable` for a year; `npm run build:check` fails if a
  release is modified. `kit/v1/` stays the auto-updating alias.
- Source maps (`uc-kit.js.map`, `uc-kit.css.map`) with the original sources.
- The body font (`fonts/inter-latin.woff2`) is preloaded: on the example pages
  through a `Link` header in `_headers` (also sent as an Early Hint), and
  documented as an optional `<link rel="preload">` for course sites.
- Deployment guide: release steps and jsDelivr as a fallback mirror.
- `.uc-content` block for plain HTML without kit classes (pasted or migrated
  pages): spacing for headings, lists, tables, `<pre>` and floated images.
- EDados 2025/26 example: problem statements (`problemas/`), lecture code
  (`codigo/`), lab help pages, slides, images and data files migrated from the
  original site.
- Fonts are served with the kit from `kit/v1/fonts/` (no Google Fonts request),
  including the Greek subset of Inter.
- Site favicon.
- `.uc-table` wrappers that scroll sideways become keyboard-focusable regions
  (labelled by the table caption) while they overflow.
- Repository scaffold, licence and contribution guide.
- Page checker (`npm test`) and GitHub Actions workflow.
- Core runtime: configuration loading and validation, i18n (pt, en), language
  switching with in-place bilingual content, dates and teaching calendar with
  breaks, `UC.Element` base class and `UC.define`.
- Base styles: design tokens, reset, typography and layout building blocks.
- `<uc-page>` (header, responsive navigation, footer) and `<uc-hero>`.
- `scripts/build.mjs` bundles `kit/src` into `kit/v1/uc-kit.{js,css}`.
- `<uc-notices>`, `<uc-deadlines>` (list and table views) and `<uc-date>`.
- Weekly calendar: `<uc-weeks>`, `<uc-week>`, `<uc-event>` and `<uc-this-week>`.
- Lab guides: `<uc-guide>` (breadcrumbs, table of contents, progress) and
  `<uc-exercise>` (hints, solutions, "mark as done").
- `<uc-team>`, `<uc-code>` (highlight.js from cdnjs, copy, download, editor)
  and `<uc-question>`.
- `per-kind` on `<uc-deadlines>`, `kind` on `<uc-weeks>` and `<uc-this-week>`,
  `medium` date format, `uc-split` and `uc-button--sm` blocks.
- In-page code execution: `<uc-code run>` (no value) adds a "Run" button,
  with optional hidden harness and tests shown as ✓/✗. Runners are pluggable
  (`UC.registerRunner`, `UC_COURSE.runner`); built in: Codapi and JavaScript
  in a Web Worker.

### Changed
- Accessibility: `--uc-font-size-base` is `100%` (the reader's browser setting)
  instead of `16px`; the theme customiser writes percentages. `.uc-tag` wraps
  when wider than its column. A finished run of `<uc-code run>` announces
  "Execução terminada…" instead of "Resultado". A read-only code block is a Tab
  stop only while it scrolls sideways. The language switch is named
  "EN: Switch to English". Scrollable tables without a caption are named after
  the nearest heading. On screens narrower than 30em the documentation header
  links move into the menu.
- Every relative URL in `course.js` is now relative to `course.js`, like
  `pages[].href`: `logo`, `institution.url`, `platforms[].url`, team and
  deadline `url`, deadline `links`, and links and images inside `HTMLText`
  (notices, notes, footer). Pages in subfolders no longer need absolute URLs.
  Sites at the root of their folder are not affected.
- `<uc-team role>`: when the filter matches nobody the element is hidden even
  if it has children.
- `<uc-deadlines view="table">`: date ranges show the year.
- `<uc-week>` does not repeat a deadline written by hand as
  `<uc-event deadline>` in another week of the same `<uc-weeks>`.
- `<uc-code run>` shows no "Run" button when the runner cannot run the
  language (`html`, `css`, `text`…); runners may declare `supports(language)`.
- `uc-tag--muted` is now an outlined tag, distinct from `uc-tag`.
- `<pre data-copy>` outside `uc-content` gets the same box as inside it.
- Corner radii of shortcuts, options, events and progress bars follow
  `--uc-radius-*` (same look with the default tokens).
- `--uc-color-text-subtle` is `#6E6E77` (was `#71717A`): 4.5:1 on
  `--uc-color-surface-muted`.
- `stderr` of a code run uses `--uc-color-danger-bg`.
- `uc-kit.js` and `uc-kit.css` are minified with esbuild (about 35 % and 23 %
  smaller after compression).
- `_headers`: cache rules no longer overlap, so `X-Content-Type-Options` is no
  longer sent twice on kit files.
- `<uc-page>` stays hidden until the kit has built the page and the web fonts
  are ready (at most 300 ms of waiting for fonts; revealed after 2 s if the kit
  never runs, at once without JavaScript), so the header, navigation and
  components no longer make the content jump, and the text no longer switches
  font, on load. The kit marks this with `.uc-visible` on `<html>`.
- `<uc-this-week>` keeps the last copy of the weeks page in `localStorage` and
  renders from it straight away, refreshing when the new copy arrives.
- The kit is cached for 5 minutes and then revalidated in the background
  (`stale-while-revalidate`), so repeat visits no longer wait for the server.
- `<uc-notices>` hides notices dated in the future until their day.
- `<uc-this-week>`: the current week is highlighted with a soft accent
  background instead of an accent border.
- `<uc-deadlines view="table">` status badges: done is green, next is amber
  (new block `uc-tag--success`).

### Fixed
- `<uc-materials>` keeps the `start` of the teacher's `<ol>` (chapter 0 was
  numbered 1).
- Example `edados-2526` uses the new blocks (blocks phase 6): `<uc-timetable>`
  and office hours in `horarios.html`, `<uc-grading>` with the simulator and
  `a[data-auth]` in `avaliacao.html`, `<uc-assessment-info>` on both practical
  test pages, a new `sumarios.html` with `<uc-summaries>`, `<uc-materials>` for
  the slides (the PT PDFs were placeholders) and `<uc-problems track>` in
  `problemas/`.
- Copy buttons keep focus when the clipboard fallback is used (`file://`).
- `<uc-weeks>`: two breaks in a row after the same week appear in date order
  (they were reversed).
- EDados example: the "migrado de …" notes link to the original pages on the
  DCC site (they pointed to the page itself).
- `<uc-question>`: the `data-explanation` (which gives the answer away) is
  hidden when JavaScript is off.
- `uc-links`, `uc-shortcuts` and `uc-checklist` get `role="list"`, so Safari
  announces them as lists.
- api.md: `UC.formatDateRange`, the `lang` argument of `UC.text`,
  `data-uc-keep-lang`, when `uc:ready` fires, that attributes are read once,
  and what `uc-section` and the deadlines table really do.
- `<uc-code run>`: the hidden `<script data-harness>` files no longer appear
  under the code when JavaScript is off.
- `<uc-code run="URL">`: the link reads "Testar em …" (was "Testar no …",
  wrong for platform names that are not masculine).
- `<uc-question>`: code blocks inside the question keep their normal weight.
- `<uc-guide week>` without a `weeks` page: the fallback `weeks.html` link is
  resolved against `course.js`, like other page links, so guides in
  subfolders link correctly.
- `UC.addTranslations` called from a script loaded after the kit now re-renders
  the components on the page when the dictionary is for the active language.
- Code font ligatures (JetBrains Mono joins `->`, `-<`) are off in `code`,
  `kbd`, `samp` and `pre`, as they already were in `<uc-code>`.
- `<uc-code editable>`: space after the longest line; the caret stays visible on long lines (the editor
  scrolls with it), and the code no longer flickers on every key.
- The kit is now revalidated on every load (`_headers`), so pages and kit
  stay in step after a deploy.
- Page links from pages in subfolders: `pages[].href` is now relative to
  `course.js`.
- "null" printed in `<uc-exercise>` without `mooshak` and in `<uc-hero>`
  without `code` or `tagline`.
