# Algorithm widgets, phase W3 → phase W4 handoff

W3 shipped the first three widgets of wave 2. Contract:
[`widgets-api.md`](widgets-api.md); what W3 refined is its section 23 (read
it: two primitives in one drawing, `svg.grid`, pseudocode placeholders).

## What is in `main` after W3

| Path | What |
| --- | --- |
| `widgets/src/heap/` | max / min heap: operations (insert, extract, peek), heapify, heapsort; array and tree in one drawing (nested svgs). |
| `widgets/src/avl/` | AVL tree: insert, remove, search; heights, balance factors (node notes), the four rotations, early stop. Reuses the BST's `inorder` and sentences. |
| `widgets/src/hash/` | hash table: chaining, linear, quadratic; tombstones, load factor, doubling; integer or word keys. |
| `widgets/src/core/svg/grid.js` | `svg.grid`, bundled into hash only (core unchanged). |
| `tests/widgets/{heap,avl,hash}.test.mjs` | References of 18.3 (heap property after every operation, heapsort = sorted copy; AVL invariants and heights after every operation; hash answers = Set model, keys on their chain / probe sequence, load factor). Narration snapshots for all three. |
| `tests/pages/uc-widget-w3.html` | Test page with every W3 widget (in `check-a11y`). |
| `docs/pt/widgets/uc-widget-{heap,avl,hash}.html`, `docs/demos/uc-widget-{heap,avl,hash}/` | One page and two demos per widget; nav "Widgets" group. |

Sizes (gzip): core 10.9 KB of 12 (unchanged, about 1 KB left), CSS 2.1 of
4, heap 4.7, avl 6.4, hash 6.2 (all of 8).

## Notes for W4 (graph, shortest-path, complexity; `svg.graph`, `svg.plot`)

- **Core budget**: `svg.graph` is used by graph, shortest-path, mst,
  union-find and toposort (five widgets): by rule 16.3 it belongs in the
  core, but with ~1 KB left it will not fit. Either keep the automatic
  layout out of the core (bundle a `layout.js` with the graph widgets and
  put only the drawing in the core), or raise the core budget in 18.2 first
  and record why. Measure before deciding.
- **Combined views**: Dijkstra's priority queue can be the state panel
  (`aux` arrays render as chips) or a second nested svg (section 23.2, see
  `widgets/src/heap/widget.js` `draw`).
- `svg.plot` (complexity) has one user: bundle it.
- `parse.graph` (5.3) is already in the core (W1), with tests still to write
  against real inputs.
- Ops widgets: per-operation pseudocode blocks and `step.code`, as in W2–W3;
  pseudocode placeholders (23.5) avoid duplicate blocks for variants
  (directed / undirected).
- `uc-site.py check` was still not checked against widget scripts (owned by
  the search thread).

## Pull requests

| PR | What | State |
| --- | --- | --- |
| see GitHub | Widgets phase W3: heap, avl, hash | merged with green CI |
