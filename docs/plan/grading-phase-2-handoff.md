# Grading with several formulas, phase G2 → phase G3 handoff

Phase G2 taught `<uc-grading>` to read an `<ol data-formulas>` and a
`<ul data-rules>`: a safe parser, weight columns per formula, the "Para
aprovar" list and the fallback for a formula with an error. The contract is
[`grading-api.md`](grading-api.md); what G2 refined is in its section 17.2.

- Plan (PT): [`grading-formulas.md`](grading-formulas.md), approved by Miguel
  on 17 Nov 2026 (D1–D5 recommended options; D6 open for the professor, G4
  writes 4.9 with an HTML comment).
- Order: G0 → G1 → G2 → **G3** → G4. Each phase: its own thread and branch,
  one PR, merged with green CI (4 shards + `check`), a
  `docs/plan/grading-phase-N-handoff.md`, fetch and rebase on `main` right
  before merging. Do not tag.
- Never `eval`/`Function`: evaluate the trees with
  `UC.internal.grading.evaluate`.

## What is in `main` after G2

| File | What |
| --- | --- |
| `kit/src/grading/formula.js` | Tokenizer, parser, `model`, `evaluate`, `check`, weight columns, `print`/`printRule`, exposed as `UC.internal.grading` (API in contract 17.2 item 2). No DOM. |
| `kit/src/grading/element.js` | `render()` finds the three lists, calls `grading.model` (errors → one `console.warn` and the fallback), prints the formulas (`<abbr>` for máx/mín), the notes, the bars (`.uc-grading__bars` with labels when ≥ 2 columns), the table via `renderTable(components, scale, columns)` and the rules list. Legacy pages take the old path unchanged (`columns === null`). |
| `kit/src/grading/strings.js` | New keys: `formulaN`, `max`, `maxTitle`, `min`, `minTitle`, `rules`. The calculator keys of contract 11 are still to add (G3). |
| `kit/src/css/components/uc-grading.css` | `.uc-grading__note`, `.uc-grading__bars`, `.uc-grading__bar-label`, `.uc-grading__rules`. |
| `scripts/build.mjs` | Budget of `uc-grading.js` is now 8 KB (contract 17.2 item 1). |
| `tests/pages/core-tests.js` | `formulaTests` (13.1, 13.2, 13.4, 13.5) and `gradingFormulaTests` (the element), run after `loadModule("grading")`. Add 13.3 there. |
| `tests/pages/uc-grading.html` | New cases `#edados-2627` (snapshot `uc-grading-formulas.aria.yml`), `#named` (named formulas, `pass`, `data-min`, text rule) and `#broken` (fallback, checked by `check-pages`). |
| `docs/demos/uc-grading/formulas.html` | Demo, embedded in the guide section "Várias fórmulas e regras para aprovar". |
| Docs | Guide `docs/pt/componentes/uc-grading.html` (new section, `result`, classes, no-JavaScript), `docs/api.md` 3.6 "Formulas and rules", CHANGELOG "Added", `.md` copies and `llms-full.txt` rebuilt. |

## Sizes at the end of G2 (gzip)

| File | Size | Budget |
| --- | --- | --- |
| `uc-kit.js` | 44.9 KB | 48 KB |
| `uc-grading.js` | 6.9 KB | 8 KB: G3 has about 1.1 KB |
| `uc-search.js` | 5.0 KB | 6 KB |

## Facts G3 needs

- In `render()`, formula mode is `formulas !== null` (`model.result` set);
  `columns` is `model.columns || []`. The calculator is skipped there today:
  `flag(this, "calculator") && !columns`. G3 replaces that with the new
  calculator (contract 9) when `formulas` is set, and keeps the legacy one
  (`renderCalculator`/`update`, exact legacy strings) otherwise.
- Values for `evaluate`: a code's value is the entered number for leaves and
  `gradeOf(component, values)` for parents; formula names map to their own
  evaluated values, in order; `RESULT` is the result formula's value. Final =
  `clamp(result + Σ bonus, 0, scale)` (5.3).
- "conta a …": compare the result with each branch's value. The branches
  are not exposed yet: `model.columns` is null for non-linear results. Either
  export the branch trees from `columnsOf` (cheap: it already has them) or
  recompute; "conta" is only shown with linear branches anyway.
- The rules shown are built in `render()` as `rules = [{ rule, item }]`
  (`rule` null for a text rule): reuse that array for ✓/✗ and "não
  verificado".
- With only a rules list (no formulas) the legacy calculator still uses
  `data-min` and `pass` only (17.2 item 9). Decide whether written rules are
  checked there too.
- The cloud container cannot reach the highlight.js CDN, so `check-pages`
  fails on documentation pages with `ERR_TUNNEL_CONNECTION_FAILED`; CI does
  not. Filter those lines locally.
- `check-a11y --update-snapshots` rewrites every snapshot it checks; review
  the diff (G2 left `uc-grading.aria.yml` unchanged).

## Pull requests

| PR | What | State |
| --- | --- | --- |
| 71 | G0: contract and handoff | merged |
| 73 | G1: uc-grading in its own lazily loaded file | merged |
| see GitHub | G2: formulas and rules in uc-grading | merged with green CI |
