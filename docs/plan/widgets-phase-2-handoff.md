# Algorithm widgets, phase W2 → phase W3 handoff

W2 shipped five widgets of wave 1 and two SVG primitives. Contract:
[`widgets-api.md`](widgets-api.md); what W2 refined is its section 22 (read
it: `step.code`, the `algorithms` toggle, `svg.tree` options).

## What is in `main` after W2

| Path | What |
| --- | --- |
| `widgets/src/core/svg/tree.js` | `svg.tree`, in the core (`UC.widgets.svg.tree`). Binary (in-order) and n-ary layouts. |
| `widgets/src/core/svg/list.js` | `svg.list`, bundled by list and stack-queue (not in the core). |
| `widgets/src/core/widget.js` | + `algorithms` toggle group, per-step pseudocode block (`step.code`), `editAttribute` / `editLabel`. |
| `widgets/src/search/` | linear, binary, lower (bound). |
| `widgets/src/bst/` | operations (insert, remove, search, min, max) and four traversals. |
| `widgets/src/list/` | singly linked list: add-first, add-last, insert, remove-first, remove-last, remove, search, reverse. |
| `widgets/src/stack-queue/` | stack / queue × array (circular queue) / list. |
| `widgets/src/recursion/` | factorial, fibonacci, hanoi. |
| `tests/widgets/{search,bst,list,stack-queue,recursion}.test.mjs` | References of 18.3; narration snapshots for all five. |
| `tests/pages/uc-widget-w2.html` | Test page with every W2 widget (in `check-a11y`). |
| `docs/pt/widgets/uc-widget-*.html`, `docs/demos/uc-widget-*/` | One page and two demos per widget; nav "Widgets" group. |
| `examples/edados-2526/guioes/aula10.html` | Uses `<uc-widget-bst algorithms="preorder inorder postorder levelorder" predict>`; the extension files stay (tutorial, D9). |

Sizes (gzip): core 10.9 KB of 12 (tight: about 1 KB left), CSS 2.1 of 4,
search 3.2, bst 5.5, list 6.0, stack-queue 5.7, recursion 3.2, sort 5.2.

## Notes for W3 (heap, avl, hash; `svg.grid` if needed)

- **Core budget**: only ~1 KB left. `svg.grid` (dp, backtracking, hash
  chaining) is used by three widgets but arrives in W3–W5: start it bundled
  in hash and move it to the core only if the budget allows, or raise the
  budget in 18.2 first (record it).
- **Heap**: draw the array with `W.svg.array` and the tree with
  `W.svg.tree` side by side in one `<svg>`? Each primitive replaces the svg
  content, so either draw into two `<g>` / nested `<svg>` elements (extend
  the primitives to accept a group) or pick a view toggle. Decide and record.
- **AVL**: reuse the BST's algorithm shape (`widgets/src/bst/algorithm.js`,
  node ids are values) and `svg.tree`; rotations animate for free because
  nodes are kept by key. Show the balance factor with `note`.
- **Hash**: open addressing on `svg.array`; chaining needs lists per slot
  (`svg.grid` or `svg.list` rows).
- Ops widgets: give each operation a pseudocode block and set `step.code`;
  set `static editAttribute = "ops"` if the operations are the input.
- `uc-site.py check` still was not checked against widget scripts (owned by
  the search thread).

## Pull requests

| PR | What | State |
| --- | --- | --- |
| see GitHub | Widgets phase W2: search, bst, list, stack-queue, recursion | merged with green CI |
