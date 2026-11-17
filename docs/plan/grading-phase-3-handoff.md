# Grading with several formulas, phase G3 → phase G4 handoff

Phase G3 built the calculator for `<uc-grading>` with formulas (contract
section 9): branch values, the final grade with the branch that counts, every
rule checked with ✓/✗ and words, and a pass or fail line. The contract is
[`grading-api.md`](grading-api.md); what G3 refined is in its section 17.3.

- Plan (PT): [`grading-formulas.md`](grading-formulas.md), approved by Miguel
  on 17 Nov 2026 (D1–D5 recommended options; **D6 still open** for the
  professor: G4 writes `E >= 4.9` with an HTML comment saying it is to be
  confirmed, 35 % of 20 would be 7).
- Order: G0 → G1 → G2 → G3 → **G4**. Each phase: its own thread and branch,
  one PR, merged with green CI (4 shards + `check`), fetch and rebase on
  `main` right before merging. Do not tag. G4 is the last phase: it writes no
  handoff, but updates the memory/plan status.
- Never `eval`/`Function`.

## What is in `main` after G3

| File | What |
| --- | --- |
| `kit/src/grading/element.js` | `render()` sets `this.calc = { model, rules, all, fn, alias, labels }` in formula mode (null otherwise) and renders the calculator unless in fallback. `update()` keeps the legacy path; with `this.calc` it calls `simulate()`, which fills `.uc-grading__branches` and `.uc-grading__checks` and returns the result and state lines. |
| `kit/src/grading/formula.js` | `columnsOf` adds `tree` to each column. |
| `kit/src/grading/strings.js` | Calculator keys of contract 11 (pt and en). |
| `kit/src/css/components/uc-grading.css` | `.uc-grading__checks` (no bullets), `:empty` hides branches and checks. |
| `tests/pages/core-tests.js` | `calculatorTests`: every row of 13.3 (EDados, PI, PC bonus/clamp, division by 0, incomplete). |
| `tests/pages/uc-grading.html` | `#edados-2627` has `calculator`. Snapshots `uc-grading-formulas.aria.yml` (updated) and `uc-grading-simulation.aria.yml` (new, after input). |
| `scripts/check-a11y.mjs` | `checkGradingCalculator(…, axeSource)` runs from `checkPage` for the first legacy calculator and the first one with formulas (17.3 item 6). |
| Docs | Guide section "Várias fórmulas e regras para aprovar" now describes the simulator (and the classes table has `__branches`, `__checks`); demo `formulas.html` has `calculator` (height 940); `docs/api.md` 3.6 "Calculator" bullet; CHANGELOG "Added"; `.md` copies, `classes`, search index and `llms-full.txt` rebuilt. |

## Sizes at the end of G3 (gzip)

| File | Size | Budget |
| --- | --- | --- |
| `uc-kit.js` | 44.9 KB | 48 KB |
| `uc-grading.js` | 7.8 KB | 8 KB: almost full. G4 should not need JS; if it does, look for bytes first (e.g. the `fmt`/`pct` helpers, the parser's error strings). |
| `uc-search.js` | 5.0 KB | 6 KB |

## What G4 has to do (contract 15, section 14)

- Guide `docs/pt/componentes/uc-grading.html` (PT first): G2 and G3 already
  wrote the reference text and the demo; G4 reviews it as a whole, adds the
  per-course examples (EDados 26/27, PI literal, PC with only a rules list)
  and "Usar com uma LLM" notes if that page lists components.
- `docs/api.md` 3.6 (EN): already has "Formulas and rules" with the
  calculator; review.
- `template/AGENTS.md` and `llms.txt` / `llms-full.txt` (via `npm run build`).
- Examples (section 14): EDados 2026/27 page with `E >= 4.9` **and an HTML
  comment for D6**; PI with the literal formula (D3); PC with a rules list.
  Remember the four example pages are checked by `check-pages` and some
  have ARIA snapshots.
- `check-docs`, `check-pages`, links green.

## Facts G4 needs

- The cloud container cannot reach the highlight.js CDN, so `check-pages` on
  documentation pages logs `ERR_TUNNEL_CONNECTION_FAILED`; CI does not.
  Filter those lines locally.
- `check-a11y` filters are substrings of the page path, but `tests/pages/`
  pages are not in its page list (only the ARIA snapshots use them): use
  `uc-grading` as the filter to check the demos and the three grading
  snapshots.
- `core.html` opened from `file://` shows two unrelated failures
  (uc-summaries, uc-weeks compact, date dependent); over HTTP, as
  `check-pages` does, it passes.
- `check-a11y --update-snapshots` rewrites every snapshot it checks; review
  the diff.

## Pull requests

| PR | What | State |
| --- | --- | --- |
| 71 | G0: contract and handoff | merged |
| 73 | G1: uc-grading in its own lazily loaded file | merged |
| 74 | G2: formulas and rules in uc-grading | merged |
| see GitHub | G3: the calculator with formulas | merged with green CI |
