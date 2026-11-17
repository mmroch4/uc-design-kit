# Grading with several formulas, phase G1 → phase G2 handoff

Phase G1 moved `<uc-grading>` out of `uc-kit.js` into the lazily loaded
`kit/v1/uc-grading.js`, with **no behaviour change**. The contract is
[`grading-api.md`](grading-api.md); what G1 refined is in its section 17.1.

- Plan (PT): [`grading-formulas.md`](grading-formulas.md), approved by Miguel
  on 17 Nov 2026 (D1–D5 recommended options; D6 open for the professor, G4
  writes 4.9).
- Order: G0 → G1 → **G2** → G3 → G4. Each phase: its own thread and branch,
  one PR, merged with green CI (4 shards + `check`), a
  `docs/plan/grading-phase-N-handoff.md`, fetch and rebase on `main` right
  before merging.
- Never `eval`/`Function`: the parser builds a tree (contract 4).

## What is in `main` after G1

| File | What |
| --- | --- |
| `kit/src/core/modules.js` | `MODULES` (`grading: { file: "uc-grading.js", tags: "uc-grading" }`), `UC.internal.loadModule(name)`, `UC.internal.modulesReady()`, plus `UC.internal.loadScript(src)` and `UC.internal.kitUrl(file)` (moved from the search loader). Scans on `DOMContentLoaded`, then a `MutationObserver` until every module is loaded. One console warning on failure; `modulesReady()` never rejects. |
| `kit/src/core/search-loader.js` | Uses `loadScript` and `kitUrl` from `modules.js`. |
| `kit/src/core/bootstrap.js` | `pageReady()`: fonts and `modulesReady()` under one `FONT_WAIT_MS` (300 ms) cap before `uc-visible`. |
| `kit/src/grading/element.js` | `<uc-grading>`, moved unchanged from `kit/src/components/uc-grading.js` (only the header comment and the guard: `if (!UC) return;`, see 17.1). |
| `kit/src/grading/strings.js` | The `grading.*` strings (pt, en), added with `UC.internal.addDefaults`. They left `kit/src/i18n/{pt,en}.js`. |
| `kit/src/manifest.json` | New `grading` list: `grading/strings.js`, `grading/element.js`. G2 adds `grading/formula.js` **before** `element.js`. |
| `scripts/build.mjs` | Builds `kit/v1/uc-grading.js` (+ map) and checks its 6 KB budget. |
| `tests/pages/core-tests.js` | The grading unit test runs after `await UC.internal.loadModule("grading")`; the summary line is written after it. Add G2's parser tests in the same `then` (or a new function called there). |
| `scripts/check-a11y.mjs`, `scripts/check-pages.mjs` | Wait until `uc-grading` is defined on pages that have one. `check-pages` also opens `tests/pages/uc-grading.html` with `uc-grading.js` returning 404 (page revealed, list shown, one warning). |
| Docs | CHANGELOG "Changed" (Unreleased), `docs/api.md` 3.6 and 6, guide `docs/pt/componentes/uc-grading.html` ("Configuração usada", "Sem JavaScript"), `.md` copies and `llms-full.txt` rebuilt. |

## Sizes at the end of G1 (gzip)

| File | Size | Budget |
| --- | --- | --- |
| `uc-kit.js` | 44.9 KB (45 800 bytes) | 48 KB; G1 target ≤ 45 KB met |
| `uc-grading.js` | 3.1 KB | 6 KB; G2 + G3 must fit in the remaining ~2.9 KB |
| `uc-search.js` | 5.0 KB | 6 KB |

## Facts G2 needs

- The parser goes in `kit/src/grading/formula.js`, exposed as
  `UC.internal.grading` (contract 2.1), no DOM. Because it is in
  `uc-grading.js`, unit tests must load the module first (see
  `core-tests.js`).
- Strings for G2 (contract 11) go in `kit/src/grading/strings.js`, both
  languages, never in `kit/src/i18n/`.
- Legacy pages must produce the same DOM (contract 3.5): the ARIA snapshot
  `tests/pages/uc-grading.aria.yml` and the four example pages are the guard.
- Budget is tight: about 2.9 KB gzip left for G2 + G3. Measure after each
  step with `npm run build`.
- In this cloud container the CDN (highlight.js) is unreachable, so
  `check-pages` reports `ERR_TUNNEL_CONNECTION_FAILED` on pages that load it;
  CI does not have that problem. Filter those lines when reading a local run.
- v1.0.0: a parallel thread is cutting the release (PR 72). Do not tag; keep
  CHANGELOG lines under "Unreleased" and rebase before merging.

## Pull requests

| PR | What | State |
| --- | --- | --- |
| 71 | Grading phase G0: contract and handoff | merged |
| see GitHub | Grading phase G1: uc-grading in its own lazily loaded file | merged with green CI |
