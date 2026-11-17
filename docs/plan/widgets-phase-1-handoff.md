# Algorithm widgets, phase W1 → phase W2 handoff

W1 shipped the widget core and `<uc-widget-sort>`. Contract:
[`widgets-api.md`](widgets-api.md); what W1 refined is its section 21.

## What is in `main` after W1

| Path | What |
| --- | --- |
| `widgets/src/core/` | `index.js` (installs `UC.widgets`, loads the CSS, runs the queue), `widget.js` (base class: build, player, keys, narration, pseudocode, panel, text view, predict, editable, errors, events), `engine.js` (collect, cap, states, errors, `random`), `parse.js` (`values`, `ops`, `graph`), `svg/array.js`, `dom.js`, `i18n.js`, `version.js` (`1.0.0-dev`), `uc-widget.css`. |
| `widgets/src/bootstrap.js` | `boot(name, define)`: queue + add the core once. |
| `widgets/src/sort/` | `algorithm.js` (pure, six algorithms), `i18n.js`, `widget.js`, `meta.json`. |
| `widgets/v1/` | Built: core 9.6 KB, sort 5.2 KB, CSS 1.9 KB gzip; `catalog.json`. |
| `scripts/build-widgets.mjs` | Bundles, budgets, catalogue, catalogue cards; called by `build.mjs`. |
| `tests/widgets/` | `sort.test.mjs`, `steps.test.mjs`, `narration.test.mjs` + `narration.mjs --update`, snapshots in `narration/`. `npm run test:widgets`. |
| `tests/pages/uc-widget-sort.html` | Test page (predict, editable, own Java code, bilingual caption, every algorithm, invalid input). |
| `docs/pt/widgets/` | Catálogo, Usar widgets, uc-widget-sort; demos in `docs/demos/uc-widget-sort/`. |

## How to add a widget (W2 and later)

1. `widgets/src/<name>/` with `algorithm.js` (export `run(input, options,
   emit)` and the algorithm list), `i18n.js` (`strings.pt/en`, `code.<alg>`
   as `"<id>|text"`), `widget.js` (default export `define(UC)`, subclass of
   `UC.widgets.Widget`, `W.register(...)`), `meta.json` (with `test.input`).
2. `npm run build`, then `node tests/widgets/narration.mjs --update` and read
   the snapshot diff.
3. A `tests/widgets/<name>.test.mjs` against a reference (18.3 table).
4. A demo in `docs/demos/uc-widget-<name>/` (checked by check-pages and
   check-a11y automatically) and a page in `docs/pt/widgets/`, added to the
   "Widgets" group of `docs/nav.json`.
5. New SVG primitives (`svg.tree`, `svg.list`): in the core only when three
   or more widgets use them (16.3); otherwise import from
   `widgets/src/core/svg/` in the widget.

## Notes for W2

- `examples/edados-2526/extensions/uc-bst-traversal.js` is untouched; W2
  switches lab guide 10 to `uc-widget-bst` (D9).
- Miguel saw the W1 preview (state colours amber/violet/green); apply his
  remarks, if any arrived in the W1 thread, by changing the token fallbacks.
- `uc-site.py check` was not taught about `widgets/v1/` scripts in pages;
  check it does not warn on a page with a widget (search thread owns it).

## Pull requests

| PR | What | State |
| --- | --- | --- |
| see GitHub | Widgets phase W1: core and uc-widget-sort | merged with green CI |
