# Contributing

## Principles

1. **No build for users.** Teachers must be able to use the kit by linking two
   files. Maintainer tooling (tests, bundling) lives in `scripts/` and
   `package.json` and is optional for users.
2. **The contract comes first.** `docs/api.md` defines the configuration
   schema, component names and attributes, CSS custom properties and i18n keys.
   Change it in its own pull request before changing code that depends on it.
3. **One component, one file.** `kit/src/components/uc-<name>.js` and
   `kit/src/css/components/uc-<name>.css`, plus a test page
   `tests/pages/uc-<name>.html` showing every state. A component too big for
   one file gets a folder split by concern, listed in order in the manifest:
   `kit/src/code/` (`<uc-code>`), `kit/src/grading/`, `kit/src/search/`.
4. **Light DOM, classic scripts.** Components render into the light DOM so
   global CSS applies to teacher content, and are loaded as classic scripts
   (not ES modules) so pages work from `file://`.
5. **Accessible by default.** WCAG 2.1 AA, keyboard operable, visible focus,
   44 px touch targets, no information conveyed by colour alone.
6. **Never break a published major version.** Anything in `kit/v1/` stays
   backwards compatible; breaking changes go to a new major folder. Frozen
   releases (`kit/vX.Y.Z/`) are never modified at all.

## Code style

- Modern JavaScript (ES2020), no framework, no transpilation.
- English for all identifiers, comments and commit messages.
- Small, pure helpers in `kit/src/core/`; components only orchestrate.
- No user-facing strings in code: use the i18n dictionaries.
- CSS: custom properties prefixed `--uc-`, classes prefixed `uc-`,
  low specificity (`:where()`), so teachers can override easily.
- Choices saved in the browser go through `UC.internal.storage`
  (`core/storage.js`): keys are scoped to the course and every call is safe
  when storage is blocked. Never call `localStorage` directly.
- The kit and the widgets are built differently on purpose. The kit is classic
  scripts concatenated in the order of `kit/src/manifest.json` (no modules),
  so a copied folder works from `file://`. The widgets
  (`widgets/src/`) are ES modules bundled by esbuild, because their pure
  algorithms are tested in Node (`tests/widgets/`); they need the kit at run
  time and use only its public API, so `widgets/src/core/dom.js` keeps its own
  small `el()`.
- Design contracts of the bigger parts (blocks, search, widgets, grading) are
  in `docs/architecture/`; code comments cite them by section.

## Workflow

- One branch per pull request; branches are deleted when the pull request is
  merged.
- Run `npm test` before opening a pull request.
- Update `CHANGELOG.md` under *Unreleased*.

## Tests

```sh
npm ci                      # installs Playwright and axe-core (maintainers only)
npx playwright install chromium
npm test                    # checks every page; add a filter: npm test -- uc-week
npm run test:update-screenshots   # also writes tests/screenshots/*.png
```

`scripts/check-pages.mjs` checks every HTML page in `tests/pages/`,
`examples/`, `template/` and the root `index.html`: console errors over HTTP
and `file://`, missing local files, horizontal scrolling at 360 px, axe-core
WCAG 2.1 A/AA (serious and critical violations fail), and visible content with
JavaScript disabled. Pages are loaded with `?today=2025-11-27` (override with
`TEST_TODAY`) so date-dependent output is stable.

`scripts/check-search.mjs` (`npm run test:search`) checks the kit side of
the site search on pages it makes up and serves from a fake origin: the
automatic heading ids against `tests/search/slugs.json` (the cases
`uc-site.py` runs too), the jump to `#hash`, the index detection (no request
without `search`, one `HEAD` per visit, 404, timeout, `file://`), the header
button, the shortcuts and `UC.search`. CI runs it in the second job.

`scripts/check-dom.mjs` (`npm run test:dom`) is the "nothing changed" check:
it renders every page that `check-pages.mjs` opens (1280 × 900, frozen date,
no requests to other sites, every widget built) and compares a hash of the
rendered DOM and of the accessibility tree of `<body>` with
`tests/dom-record.json`. The record also keeps the gzip size of every built
`.js` and `.css` of `kit/v1/` and `widgets/v1/`, and the check fails when one
grows. A refactoring must pass it without touching the record. A change that
is meant to alter pages (or to grow a file) runs `npm run test:dom -- --update`
and commits the record in the same pull request, so its diff lists the pages
that changed. To see what changed in a page:
`node scripts/check-dom.mjs --against=origin/main <filter>` renders the
changed pages at that commit too and prints a diff; `--save=DIR` writes every
rendered DOM and tree to `DIR`.

The scripts share what they have in common through `scripts/lib/`:
`server.mjs` (the local server and the public-kit route), `browser.mjs`
(Chromium, the frozen date, waiting for the kit, axe-core), `pages.mjs` (the
pages the browser checks open), `runner.mjs` (options, shards, the page pool
and the "ok/FAIL" report) and `budgets.mjs` (every gzip budget and writing
built files). The accessibility checks are split by theme in `scripts/a11y/`
(`page`, `components`, `grading`, `search`, `widgets`, `snapshots`; a new
block adds its accessibility-tree snapshot in `snapshots.mjs`) and the search
checks in `scripts/search/` (`ids`, `detection`, `dialog`, `docs`, on the
fake site of `harness.mjs`). A budget is raised in its contract first, then in
`scripts/lib/budgets.mjs`.

`check-pages.mjs`, `check-a11y.mjs` and `check-dom.mjs` check several pages at the same time
(`--concurrency=n`, default: CPU count, at most 4) and can check one part of
the pages (`--shard=i/n`; the environment variables `CHECK_CONCURRENCY` and
`CHECK_SHARD` do the same). CI runs `build:check`, then the checks split in 4
parallel jobs (`.github/workflows/check-pages.yml`); the required status
`check` is green only when every job passed. Screenshots are taken only on
`main` (artifacts `screenshots-1` to `screenshots-4`).

## Documentation

The documentation pages in `docs/pt/` are hand-written HTML. Header, sidebar,
"Nesta página", previous/next links, the code of each demo and the class
tables of the "Classes CSS estáveis" page are generated by `npm run build`
between `<!-- docs:… -->` markers (see `scripts/docs.mjs`); never edit inside
them. The build also writes the search index (`docs/assets/search-index.js`,
in the kit's index format, read by the kit's own Ctrl K dialog) and
`docs/assets/course.js` (the kit configuration of the documentation, whose
`pages` are the sidebar groups) from `docs/nav.json`, and the
documentation for language models (`scripts/llms.mjs`): a `.md` next to every
page, `llms.txt` and `llms-full.txt` at the root. The rules in `llms.txt` are
the `#regras` section of `docs/pt/llm.html`. All of these are committed and
checked by `npm run build:check`.

`scripts/check-docs.mjs` (first step of `npm test`) fails when the
documentation and `docs/api.md` disagree: component attributes, `course.js`
fields, building blocks, tokens, the JavaScript API members and events, the
built-in runners, and every CSS class the kit styles or generates (it must be
in a component's "Personalizar" table, a Blocos page, or the internal list of
`docs/pt/referencia/classes.html`).

### Documenting a new component

1. Add it and its attributes to `docs/api.md`, section 3.
2. Copy `docs/pt/componentes/uc-week.html` to `uc-<name>.html` and keep the
   same sections (demo, usage, examples, attributes, configuration,
   customisation, accessibility, without JavaScript, see also).
3. Write the demos in `docs/demos/uc-<name>/`, marking the shown code with
   `<!-- demo:start -->` / `<!-- demo:end -->`, and embed them with
   `<!-- docs:demo src="…" title="…" height="…" -->`.
4. Add the page to `docs/nav.json` (with `"component"`), a card to the
   components overview, and a `docs:classes` region to
   `docs/pt/referencia/classes.html`.
5. `npm run build && npm test`.

### Writing conventions

- European Portuguese, impersonal or third person for the teacher ("o
  professor", "copia-se a pasta"); code, file names and code comments in
  English.
- Section ids: lowercase ASCII, no accents (`titulo-noutra-lingua`).
- Code blocks: `<uc-code lang="…" filename="…" no-download><pre><code>escaped</code></pre></uc-code>`.
- Internal links use an explicit `index.html` (pages must work from
  `file://`). Link `course.js` fields to `../course-js.html#…`, not to
  `docs/api.md` on GitHub.
- Demos use only the fictional course (`docs/demos/course.js`); EDados and
  the other real courses appear only as links or screenshots (their content is
  not MIT). A demo with another date uses `?today=YYYY-MM-DD` in its `src`;
  another language, `?lang=en` and a page-level `UC_COURSE.languages`.
  Demo-specific configuration goes in an inline `<script>` after
  `../course.js` with a one-line comment.
- A demo with no text when JavaScript is off gets a
  `<noscript><p>…</p></noscript>` after `<!-- demo:end -->`. `<uc-page>`
  demos set `body { padding: 0 } uc-page { min-height: 0 }` inline, or the
  iframe grows in a loop.
- Generated-region markers must have the same indentation on the opening and
  the closing line; otherwise `scripts/docs.mjs` skips the region silently.
- Field tables use `<div class="uc-table docs-fields">`; short class tables
  `.docs-compact`. Requirement tags: `uc-tag--warning` Obrigatório,
  `uc-tag--accent` Recomendado, `uc-tag--muted` Opcional.
- `docs.css` has one section per group at the end; keep new rules in the
  section of their page.

### Adding a real example

Once the example in `examples/<code>-<year>/` is merged and complete:

1. Screenshots, 1280×800 at deviceScaleFactor 1.25, served over HTTP, saved
   as WebP (quality 80) in `docs/assets/img/`: `<code>-home.webp` and three
   more pages.
2. `docs/pt/exemplos/<code>.html`: copy `ip.html` and rewrite the article
   (lead, authors and `NOTICE.md`, screenshots, pages, `course.js`,
   personalisation, migration with a link to `MIGRACAO.md`).
3. `docs/nav.json`: the page in the "Exemplos" group; a card and a column of
   the comparison table in `docs/pt/exemplos/index.html`; a figure in the
   landing (`index.html`, "Mais cadeiras feitas com o kit").
4. `docs/pt/index.html` ("Próximos passos"), `docs/pt/migrar.html` ("Ver
   também"), `scripts/llms.mjs` (intro line and "Optional" list) and the
   licence paragraph of `README.md`.
5. `npm run build && npm test`.

The same steps in Portuguese: `docs/pt/referencia/contribuir.html`.
