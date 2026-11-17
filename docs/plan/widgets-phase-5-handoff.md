# Algorithm widgets, phase W5 → phase W6 handoff

W5 shipped wave 3 (the last six widgets of the catalogue), the "Criar um
widget" guide with a template, and the decimal fix in the core. Contract:
[`widgets-api.md`](widgets-api.md); what W5 refined is its section 25.

## What is in `main` after W5

| Path | What |
| --- | --- |
| `widgets/src/mst/` | `uc-widget-mst`: `kruskal` (union-find notes `[rep]`), `prim` (lazy, queue of edges); spanning forests. |
| `widgets/src/union-find/` | `uc-widget-union-find`: `compression`, `size`, `naive`; parent array above the forest (one n-ary `svg.tree` under a hidden root). |
| `widgets/src/toposort/` | `uc-widget-toposort`: `kahn`, `dfs`; a cycle is found and named. |
| `widgets/src/dp/` | `uc-widget-dp`: `problem` = `lcs`, `edit-distance`, `knapsack`, `coins`; table, then the reconstruction path. |
| `widgets/src/backtracking/` | `uc-widget-backtracking`: `queens` (`n`, `all`), `subsets` (`target`, cuts), `permutations`. |
| `widgets/src/trace/` | `uc-widget-trace`: the teacher's steps in JSON (`view` array, tree, graph, grid); `lineIds(input)` for the step validator. |
| `widgets/template/` | `my-widget-gcd.js` (a widget of one's own, one plain script, no build) and `README.md` (catalogue checklist). |
| `docs/pt/widgets/criar.html`, `docs/demos/widgets-criar/` | The guide and its demo (checked by `check-a11y`). |
| `docs/pt/widgets/uc-widget-{mst,union-find,toposort,dp,backtracking,trace}.html`, `docs/demos/…` | One page and two demos per widget. |
| `tests/widgets/{mst,union-find,toposort,dp,backtracking,trace}.test.mjs` | References of 18.3 (trace: every JSON example of the docs is accepted, broken inputs rejected by key). |
| `tests/pages/uc-widget-w5.html` | Test page with all six, predict, editable, bilingual, error notes. |

Sizes (gzip): core 11.0 KB of 12; CSS 2.2 of 4; mst 7.0, union-find 4.5,
toposort 6.7, dp 7.5, backtracking 6.2, trace 7.1 (all of 8). All 18
widgets of the plan exist, every one `experimental`.

## Notes for W6 (release preparation + examples)

- **Releasing is Miguel's gate**: prepare `widgets/v1.0.0/` (snapshot
  `--widgets`), the compatibility page (18.3 item 6), every `meta.json`
  `status` → `stable`, the `## Widgets [1.0.0]` changelog section; cut
  nothing. Widgets 1.0.0 needs kit 1.1.0 released first.
- **Apply widgets to the examples** (EDados, PC, IP guides); tell the
  migration threads. PC: mst, union-find, toposort, dp, backtracking fit
  the problem pages; EDados: heap, avl, hash, graph, shortest-path.
- Known limitations: parallel undirected edges overlap in `svg.graph`;
  subsets with 4 values and no target draw 31 nodes (scroll on phones);
  9-column tables render small at 320 px; `editable` on trace edits the
  JSON in one line (documented as impractical for long traces).
- Core headroom ≈ 1 KB: `svg.grid` (4 users) and `svg.graph` (5) stay
  bundled by choice (25.2, 24.1).
- Still open from earlier phases: `uc-site.py check` against widget scripts
  (search thread).

## Pull requests

| PR | What | State |
| --- | --- | --- |
| see GitHub | Widgets phase W5: mst, union-find, toposort, dp, backtracking, trace; Criar um widget | merged with green CI |
