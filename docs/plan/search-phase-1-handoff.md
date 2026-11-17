# Site search, phase S1 → phase S4 handoff

Phase S1 built the kit side that does not depend on the dialog: automatic
heading ids, the jump to `#hash`, the `search` field, index detection, the
header button, the shortcuts and `UC.search`. Refinements: contract
section 16.

- Plan (PT): <https://claude.ai/artifact/GvPxc6XQpJsWyp7d6xJ561>
- Order: S0 ✓ → S2 ✓ → S3 ✓ → S1 ✓ → **S4** → S5 (after blocks phase 6).
  v1.2.0.

## What is in `main` after S1

| File | What |
| --- | --- |
| `kit/src/core/anchors.js` | `UC.internal.anchors = { slugify, uniqueId, assignIds, revisitHash }`. Ids on `DOMContentLoaded`, before components. |
| `kit/src/core/search-loader.js` | State (`off`/`unknown`/`yes`/`no`), `HEAD` probe, `sessionStorage` `uc:<course>:search`, `file://` path, `loadScript`, `loadIndex` (format check, stale warnings), `UC.internal.searchButton()`, shortcuts, `UC.search`, `UC.internal.searchIndex()`. |
| `kit/src/core/config.js` | `UC.course.search = { index, exclude } \| null`. |
| `kit/src/components/uc-page.js` | Button in `.uc-header__meta`, before the language switch; `search="off"`. |
| `kit/src/search/ui.js` | Placeholder `uc-search.js`: sets `UC.internal.searchUI.open`. **S4 replaces it.** |
| `kit/src/manifest.json` | New key `search` (files of `uc-search.js`). |
| `scripts/build.mjs` | Builds `kit/v1/uc-search.js` (+ map); budget 6 KB gzipped. |
| `scripts/check-search.mjs` | Browser checks (42), in `npm test` and CI job 2. |
| `tests/pages/search/` | Page with search on + hand-written index fixture. |
| `kit/src/i18n/{pt,en}.js` | Only `search.button` so far; S4 adds the other keys of 8.5. |
| Docs | `docs/api.md` (2.2 `search`, 3.1 ids/hash/button, 7 `UC.search`, `uc:searchready`), `docs/pt/componentes/uc-page.html#ligacoes-seccoes` and `#pesquisa`, `course-js.html` (`search`), `referencia/api-js.html`. All say "1.2.0, em preparação: ainda não ligar num site real". S5 removes that wording. |

## Facts S4 needs

- **Entry point:** `UC.internal.searchUI.open({ index, query, opener })` is
  called on every open (button, `Ctrl K`/`⌘K`/`/`, `UC.search.open(q)`),
  after `uc-search.js` and the index loaded. `index` is the parsed
  `window.UC_SEARCH_INDEX`; `opener` is where focus goes back. Keep the
  guard `if (UC.internal.searchUI) return` out of the real file (the
  placeholder had it so a test could pre-set the interface; the S4 file may
  simply assign).
- **Loading/failed state (7.3):** not built. The loader resolves only after
  both files load; on failure it writes `[uc-kit] could not load …`. If the
  dialog should show "A carregar…" before `uc-search.js` arrives, the
  smallest way is a tiny `<dialog>` shell in `search-loader.js` — mind the
  budget: **≈1.5 KB left** in `uc-kit.js`. Alternatively show the loading
  state on the button (`aria-busy`) and open the dialog when ready.
- **`<uc-search>`** (8.2) is not defined yet. It should render nothing until
  `uc:searchready` (or `UC.search.available()` resolves `true`), then load
  through `UC.search`/`UC.internal.searchIndex()` and `loadScript`. If it
  lives in `uc-search.js`, `uc-kit.js` needs a tiny stub that triggers the
  load when an `<uc-search>` is on the page.
- **Words rule:** `tests/search/words.json` (stop words + cases) for the
  query folding; run it in `check-search.mjs` like `slugs.json`.
- **Runtime entries:** `UC.course.deadlines` / `notices` (already
  normalised; deadlines have `parsed`, notices `parsedDate`).
- **Results links:** `p#i` relative to `course.js` →
  `UC.internal.resolvePageHref(p) + (i ? "#" + i : "")`. On arrival the
  target is flashed by `anchors.revisitHash` (start-up only); for a result on
  the same page call `UC.internal.anchors.revisitHash()` after setting
  `location.hash`.
- **Index date** for the footer: `index.generated` (UTC).
- **a11y:** add the dialog to `check-a11y.mjs` (the search test page is
  already in its list; `open()` there waits for the pending button).
- **Python on the DCC:** still not confirmed (contract §12).

## Pull requests

| PR | What | State |
| --- | --- | --- |
| see GitHub | Search phase S1: anchors, detection, button, `UC.search` | merged with green CI |
