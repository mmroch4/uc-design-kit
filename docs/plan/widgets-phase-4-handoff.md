# Algorithm widgets, phase W4 → phase W5 handoff

W4 shipped the last three widgets of wave 2. Contract:
[`widgets-api.md`](widgets-api.md); what W4 refined is its section 24 (read
it first: `svg.graph` bundled, the graph model, `edges`, fixtures, the
`uc:widgetdone` detail).

## What is in `main` after W4

| Path | What |
| --- | --- |
| `widgets/src/core/svg/graph.js` | `svg.graph` with the automatic layout (per component), bundled into the graph widgets. `layout()` is exported for the tests. |
| `widgets/src/graph/model.js` | Pure graph model: edge ids, adjacency in input order, `source()`, `choices()`. |
| `widgets/src/graph/element.js`, `shared-i18n.js`, `graph.css` | Browser side shared by every graph widget: reading `edges` / `<pre data-input>`, serialising for the editable field, describing; the strings they all spread; weights and notes CSS. |
| `widgets/src/graph/` | `uc-widget-graph`: `bfs`, `dfs`, `components`. |
| `widgets/src/shortest-path/` | `uc-widget-shortest-path`: `dijkstra` (lazy priority queue), `bellman-ford` (negative cycles). |
| `widgets/src/complexity/`, `widgets/src/core/svg/plot.js` | `uc-widget-complexity`: growth functions, overtakes, measured points from `for` / `points`; `svg.plot` bundled. |
| `widgets/src/*/fixture.js` | Text fixtures for graph inputs (tests and `meta.json` only). |
| `tests/widgets/{graph,shortest-path,complexity}.test.mjs`, `graphs.mjs` | References of 18.3 (BFS = reference BFS, DFS = reference recursive DFS, components = naive labelling; Dijkstra = Bellman-Ford = Floyd-Warshall, negative cycle iff reachable; overtakes are real order changes), `parse.graph` on the docs' inputs, layout determinism. `randomGraph(rng, { weights, directed })` is reusable. |
| `tests/pages/uc-widget-w4.html` | Test page (in `check-a11y`), including complexity measuring a sort widget. |
| `docs/pt/widgets/uc-widget-{graph,shortest-path,complexity}.html`, `docs/demos/…` | One page and two demos per widget. |

Sizes (gzip): core 10.9 KB of 12 (two counter strings and the event detail
added, no change at one decimal), CSS 2.2 of 4, graph 7.1, shortest-path
6.9, complexity 4.8 (all of 8).

## Notes for W5 (mst, union-find, toposort, dp, backtracking, trace)

- **Graph widgets** (mst, union-find, toposort): import `model`,
  `readGraph`/`serializeGraph`/`edgeList` (`../graph/element.js`),
  `shared` strings (`../graph/shared-i18n.js`) and `svg.graph`
  (`../core/svg/graph.js`), like `shortest-path/`. Give them a
  `fixture.js` (one line, see `shortest-path/fixture.js`). Watch the 8 KB
  budget: the primitive plus the shared parts cost about 3.5 KB, so keep
  each widget's sentences short. Kruskal can show the sorted edge list as
  an aux array; union-find may want the forest as `svg.tree` (core) next to
  the graph with two nested svgs (23.2).
- **Toposort / DAGs**: the force layout does not layer a DAG; if a layered
  drawing is wanted, add an option to `layout()` (keep the default).
- **`svg.grid`** is still bundled into hash only; DP and backtracking make
  it three users. The core has about 1 KB free: measure before moving it.
- **`uc-widget-trace`** with `view: "graph"` needs the graph model from a
  JSON input: build it with `model()`.
- **Known limitation**: complexity narrates decimals with a point
  ("log n = 2.3") in both languages (values are formatted in the pure
  algorithm). Fixing it needs a number formatter in the narration (core) or
  per-language lists.
- Still open from earlier phases: `uc-site.py check` against widget scripts
  (search thread).

## Pull requests

| PR | What | State |
| --- | --- | --- |
| see GitHub | Widgets phase W4: graph, shortest-path, complexity | merged with green CI |
