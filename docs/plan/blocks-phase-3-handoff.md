# New blocks, phase 3 → phase 4 handoff

Phase 3 built `<uc-summaries>`, `<uc-weeks view="compact">` and
`<uc-week href>`, and raised the size budget to 48 KB. The contract is
[`blocks-api.md`](blocks-api.md); its section 16 lists what phase 3 refined.

## What is in `main` after phase 3

| Piece | Files |
| --- | --- |
| `<uc-summaries>`: weekday dates, week links, breaks, "Última aula" / "Prevista", search with `<mark>` | `kit/src/components/uc-summaries.js`, `kit/src/css/components/uc-summaries.css` |
| `<uc-weeks view="compact">`: one table, rows `id="week-<n>"`, deadlines per row, break rows | `kit/src/components/uc-weeks.js`, `kit/src/css/components/uc-weeks.css` |
| `<uc-week href>`: "Página da aula" first in the body; gives up its `id` in the compact view | `kit/src/components/uc-week.js`, `kit/src/css/components/uc-week.css` |
| `UC.internal.weekSpan`, `UC.internal.weekStateOf` (exported by `uc-week.js`), `UC.internal.findMatches` (accent-insensitive ranges, exported by `uc-summaries.js`) | as above |
| Strings `summaries.*`, `weeks.compactCaption`, `weeks.column.*`, `weeks.status.*`, `weeks.classPage` (pt, en) | `kit/src/i18n/*.js` |
| Budget 48 KB | `scripts/build.mjs` (`JS_BUDGET_GZIP`), `blocks-api.md` 1.5, `CHANGELOG.md` |
| Search check `checkSummariesSearch` (44 px field, label, focus kept, count announced, `<mark>`, breaks hidden, Esc clears); two ARIA snapshots | `scripts/check-a11y.mjs`, `tests/pages/uc-summaries.aria.yml`, `tests/pages/uc-weeks-compact.aria.yml` |
| Test pages | `tests/pages/uc-summaries.html` (adds a weekend break in an inline script: two breaks after one item), `tests/pages/uc-weeks-compact.html` (adds a deadline inside the study week) |
| Core unit tests: `findMatches`, summaries numbers/weeks/states/breaks in `order="desc"`, compact rows and ids, `href` link | `tests/pages/core-tests.js` |
| Docs | `docs/pt/componentes/uc-summaries.html` (2 demos), `uc-weeks.html` ("Vista compacta", 1 demo), `uc-week.html` ("Página da aula", 1 demo), nav, components index (Calendário, thumbnail), classes reference, tokens, `migrar.html`, `template/AGENTS.md`, `docs/api.md` 3.3 and 5, `CHANGELOG.md` |

## Size

`uc-kit.js` is **39.4 KB** gzipped of 48 KB. Phase 3 used 2.6 KB. Phases 4
and 5 (materials, problems, sortable tables, `updated`, editions, links grid)
have 8.6 KB; the phase 2 estimate for them was about 6–7 KB.

## Facts phase 4 needs

- The same HTML-first pattern as `<uc-summaries>` fits `<uc-materials>`:
  capture the list in `setup()`, decorate each `<li>` once (the first
  `<time datetime>` through `UC.internal.firstTime`, localised with
  `UC.internal.localiseTime`), and in `render()` only rebuild the generated
  parts (tags, extras) so a language change is idempotent.
- For "items shown in the active language", `uc-summaries.js` has a private
  `otherLanguage(element)` (mirrors the CSS rule `[lang|=code]` of
  `language.js`). If `<uc-problems>` needs it too, move it to `core/` (for
  example `UC.internal.otherLanguage` in `language.js`) rather than copy it.
- `UC.internal.findMatches(text, query)` returns `[start, end)` ranges in the
  original text with case and accents ignored (`query` already passed through
  `UC.internal.normalise`). Use it for judge-name matching or a problem search.
- Component order in `kit/src/manifest.json`: `uc-summaries.js` sits after
  `uc-this-week.js`. New blocks that only use `core/` helpers can go after
  `uc-assessment-info.js`.
- Docs markers: `<!-- docs:demo … -->` and `<!-- docs:classes … -->` must be
  followed by a newline and the closing marker on its own line with the same
  indentation, or `npm run build` will not fill them (the region regex in
  `scripts/docs.mjs`). Demo links must point to existing anchors (`href="#"`
  is fine): `check-docs --strict` checks them.
- Demo heights: build, open the docs page at 1280 px and read each frame's
  `contentDocument.documentElement.scrollHeight`; thumbnails as before
  (Playwright 640×400, first demo, WebP q80 with Pillow).
- `?today=` in a test page plus `UC_COURSE` edits in an inline `<script>`
  between `course.js` and the kit lets a test page add a break or a deadline
  without changing the shared `tests/pages/course.js` (whose calendar the
  core tests depend on).

## Pull requests

| PR | What | State |
| --- | --- | --- |
| #37, #38, #39 | Phases 0–2 | merged |
| phase 3 | this phase | see the PR list; merged when CI was green |
| #40, #41, #42 | PI, PC, IP examples (main pages) | merged by the migration threads; phase 3 did not touch `examples/` |

## What phase 4 does

Section 12 of `blocks-api.md`: `<uc-materials>`, `<uc-problems>` and
`platforms[].id` / `hidden` (sections 2.6, 3.5, 3.6, the phase 4 parts of 9.1
and 9.2). Same rules: `docs/api.md` and the docs pages in the same PR,
`npm run build`, `npm test`, rebase, merge when CI is green, write
`docs/plan/blocks-phase-4-handoff.md`.
