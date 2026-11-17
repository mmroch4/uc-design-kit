# New blocks, phase 4 → phase 5 handoff

Phase 4 built `<uc-materials>`, `<uc-problems>` and the `id` / `hidden`
fields of `platforms`. The contract is [`blocks-api.md`](blocks-api.md); its
section 17 lists what phase 4 refined.

## What is in `main` after phase 4

| Piece | Files |
| --- | --- |
| `<uc-materials>`: typed buttons (URL → type, `data-type` override), "Atualizado a …", "Novo" (`new-days`), "Sem material", PT/EN links | `kit/src/components/uc-materials.js`, `kit/src/css/components/uc-materials.css` |
| `<uc-problems>`: series, judge/type/weight tags, series deadline and state, `filters` (type, judge), `track` ("Resolvido" in `localStorage`, `uc:problemchange`, lists of one page follow each other) | `kit/src/components/uc-problems.js`, `kit/src/css/components/uc-problems.css` |
| `platforms[].id` / `hidden`; `<uc-page>` skips hidden platforms | `kit/src/components/uc-page.js`, `docs/api.md` 2.8 |
| Eight 16 px material icons (`pdf`, `notebook`, `github`, `video`, `archive`, `code`, `slides`, `link`) | `kit/src/core/dom.js` (`UC.internal.icon(name)`) |
| `UC.internal.otherLanguage` (moved from `uc-summaries.js`), `UC.internal.materialType(href)` | `kit/src/core/language.js`, `uc-materials.js` |
| Strings `materials.*`, `problems.*` (type names in `problems.types.*`) | `kit/src/i18n/*.js` |
| A11y check `checkProblems` (44 px filter buttons and "Resolvido" label, Enter flips `aria-pressed`, focus kept, count announced, only matching problems left, Space checks, kept after reload); two ARIA snapshots | `scripts/check-a11y.mjs`, `tests/pages/uc-materials.aria.yml`, `tests/pages/uc-problems.aria.yml` |
| Test pages | `tests/pages/uc-materials.html`, `tests/pages/uc-problems.html` (adds a hidden Codeforces and two series deadlines in an inline script) |
| Core unit tests: `materialType` table, materials decoration (title, updated, Novo, Sem material, hidden type text), problems ids / judge by label / series hidden by a filter | `tests/pages/core-tests.js` |
| Docs | `docs/pt/componentes/uc-materials.html`, `uc-problems.html` (one demo each), nav, components index (new group "Materiais e problemas", two thumbnails), `course-js.html` (`#plataformas`), `referencia/classes.html`, `referencia/api-js.html` (`uc:problemchange`), `migrar.html`, `template/AGENTS.md`, `docs/api.md` 2.2, 2.8, 3.7, 7, `CHANGELOG.md`; `check-docs.mjs` knows section 2.8 |

## Size

`uc-kit.js` is **42.9 KB** gzipped of 48 KB. Phase 4 used 3.5 KB. Phase 5
(`uc-links--grid`, `<uc-page updated>`, `editions.js`, `table[data-sortable]`)
has **5.1 KB**. `uc-links--grid` is CSS only; the sortable tables and the
editions disclosure are the JavaScript. Keep strings shared and check the
number the build prints.

## Facts phase 5 needs

- `table[data-sortable]` should register with `UC.internal.registerEnhancer`
  (like `core/tables.js`, `auth-links.js`), so tables inside components get it
  too; announce with `UC.internal.announce`. `UC.internal.normalise` and the
  number/date parsing ideas of `uc-grading.js` (decimal comma) can be reused.
- `UC.internal.otherLanguage(element)` now lives in `core/language.js`.
- Icons: `UC.internal.icon(name)`; `dom.js` has a `small(paths)` helper for
  16 px stroke icons if `editions` or sorting needs one (a chevron exists:
  `chevronDown`).
- The components index got a new group `#materiais-e-problemas`; the
  Padrões page (phase 5) can link to it.
- `docs/demos/course.js` has platform ids; series deadlines are NOT in the
  shared demo file (see 17.10), so demo heights elsewhere did not change.
- Docs markers and demo heights: as in the phase 3 handoff (serve the repo
  over HTTP to measure iframes; `file://` blocks `contentDocument`).

## Pull requests

| PR | What | State |
| --- | --- | --- |
| #37, #38, #39, #43 | Phases 0–3 | merged |
| phase 4 | this phase | see the PR list; merged when CI was green |

## What phase 5 does

Section 12 of `blocks-api.md`: `uc-links--grid`, `scripts/check-links.mjs`
plus the weekly workflow, `<uc-page updated>`, `editions.js`,
`table[data-sortable]`; pages Padrões, Introdução, Publicar, Novo ano letivo;
final review of `AGENTS.md` and `llms-full.txt`; `CHANGELOG.md` → 1.1.0. Same
rules: `docs/api.md` and the docs pages in the same PR, `npm run build`,
`npm test`, rebase, merge when CI is green, write
`docs/plan/blocks-phase-5-handoff.md`. Not in scope: `<uc-search>` (another
thread is planning it).
