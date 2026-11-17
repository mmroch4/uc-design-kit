# Grading with several formulas, phase G0 → phase G1 handoff

Phase G0 wrote the contract of the new `<uc-grading>`. Nothing in the kit,
the template, the examples or the user docs changed. The contract is
[`grading-api.md`](grading-api.md); section 16 lists the decisions and the
details G0 settled beyond the plan.

- Plan (PT): [`grading-formulas.md`](grading-formulas.md) (PR 70), approved
  by Miguel on 17 Nov 2026, 15:25, with the recommended option of D1–D5.
  D6 (EDados 26/27 exam minimum, 4.9 or 7) is open for the professor and
  blocks nothing: G4 writes 4.9 with an HTML comment.
- Order: G0 → **G1** → G2 → G3 → G4. Each phase: its own thread and branch,
  one PR, merged with green CI (4 shards + `check`), a
  `docs/plan/grading-phase-N-handoff.md`, fetch and rebase on `main` right
  before merging.
- Never `eval`/`Function`: the parser builds a tree (contract 4).

## What is in `main` after G0

| File | What |
| --- | --- |
| `docs/plan/grading-api.md` | The contract: loading and budgets, HTML, formula language, evaluation, weights per formula, rendering, rules, calculator, errors, strings, accessibility, test-case tables, courses, phases, decisions. |
| `docs/plan/grading-formulas.md` | The plan; status line now says approved and links the contract. |
| `docs/plan/grading-phase-0-handoff.md` | This note. |

## Facts G1 needs

- **Scope of G1 (contract 2 and 15): move, do not change.** New
  `kit/src/core/modules.js` with `UC.internal.loadModule(name)` and
  `UC.internal.modulesReady()`; `loadScript` and the "next to `uc-kit.js`"
  URL move there from `kit/src/core/search-loader.js` (the search uses them
  from there). `kit/src/components/uc-grading.js` → `kit/src/grading/element.js`;
  the `grading.*` strings leave `kit/src/i18n/{pt,en}.js` for
  `kit/src/grading/strings.js`, added with the "only if not defined" helper
  in `kit/src/core/i18n.js` (as `kit/src/search/strings.js` does). New
  `grading` list in `kit/src/manifest.json`; `uc-grading.css` stays in the
  `css` list.
- **Reveal:** `kit/src/core/bootstrap.js` `ready()` waits for
  `modulesReady()` and the fonts under the same `FONT_WAIT_MS` (300 ms) cap.
  Today `fontsReady()` races its own timeout; restructure so one cap covers
  both.
- **Budgets:** add `uc-grading.js` 6 KB to the size check in
  `scripts/build.mjs` (lines ~44–160, cite `docs/plan/grading-api.md 2.3`).
  `uc-kit.js` measured **47.0 KB** gzip at the start of G0 (not the plan's
  46.8); G1 must end at ≤ 45 KB.
- **Tests that create `<uc-grading>` synchronously:** `tests/pages/core-tests.js`
  ("uc-grading: normalised weights and formula coefficients", around line
  190) must `await UC.internal.loadModule("grading")` first. Check that the
  core test page loads the kit from `kit/v1/` so the module URL resolves.
  `scripts/check-a11y.mjs` has the grading ARIA case (line ~101) and the
  calculator check (line ~478): wait for `customElements.whenDefined("uc-grading")`.
  Same in `scripts/check-pages.mjs` if it inspects grading output.
- **No behaviour change** is the acceptance test: `tests/pages/uc-grading.aria.yml`,
  the core tests and the four example pages
  (`examples/{edados-2526/avaliacao,ip-2526/assessment,pc-2627/evaluation,pi-2526/avaliacao}.html`)
  must produce the same result.
- **Docs in G1:** CHANGELOG "Changed" line (uc-grading now loads from
  `uc-grading.js` next to `uc-kit.js`; copy the whole `kit/v1` folder), and
  check that `docs/pt/publicar.html`, `docs/pt/novo-ano.html`,
  `template/README.txt` and `template/AGENTS.md` already say "the whole
  `kit/v1` folder" (contract 2.4). Mention the new file in `docs/api.md` 3.6
  and the PT guide `docs/pt/componentes/uc-grading.html` in one sentence
  each, then `npm run build` so the `.md` copies and `llms-full.txt` follow.
- **v1.0.0 release:** a parallel thread is cutting v1.0.0 (version strings,
  CHANGELOG). Do not tag. `CHANGELOG.md` will conflict: rebase right before
  merging and keep both sides; G1's line goes under "Unreleased".
- G2 starts from contract section 13 for its unit tests; the parser has no
  DOM and can be tested in `core-tests.js`.

## Pull requests

| PR | What | State |
| --- | --- | --- |
| see GitHub | Grading phase G0: contract and handoff | merged with green CI |
