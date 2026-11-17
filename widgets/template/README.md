# Widget template

Two ways to add an algorithm that is not in the catalogue
(guide: https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/criar.html).

## Your own widget, no build step

`my-widget-gcd.js` is a complete widget in one file (Euclid's algorithm).
Copy it next to your pages, rename the element (keep a hyphen and use your
course's prefix, e.g. `edados-…`; `uc-widget-…` is reserved for the
catalogue) and change its four marked parts: the strings, `run()`,
`parse()` and `draw()`. In the page, after the kit:

```html
<script src="https://uc-design-kit.miguelrocha.dev/widgets/v1/uc-widget-core.js" defer></script>
<script src="my-widget-gcd.js" defer></script>

<my-widget-gcd a="48" b="18" predict>
  <p>mdc(48, 18) = 6.</p>
</my-widget-gcd>
```

If the steps do not need to be computed (the input never changes), write
them as JSON in `<uc-widget-trace>` instead: no JavaScript at all.

## Proposing a widget for the catalogue

A catalogue widget lives in `widgets/src/<name>/` as ES modules and is
built by `npm run build` into `widgets/v1/uc-widget-<name>.js`. Contract:
`docs/plan/widgets-api.md`. Checklist for the pull request:

1. `algorithm.js`: pure (no DOM, no `UC`, no `Math.random`, no `Date`),
   exports `ALGORITHMS` and `run(input, options, emit)`; `steps[0]` has
   no marks, the last step is the result; at most 2000 steps.
2. `i18n.js`: every sentence and the default pseudocode in **pt and en**,
   the same keys and line ids in both; sentences start with the action and
   give the values.
3. `widget.js`: `parse()`, `steps()`, `draw()`, `describe()` (the drawing
   in words) and `table()` (the text view); `UC.widgets.register("uc-widget-<name>", …)`.
4. `meta.json`: catalogue entry (`status: "experimental"` at first) and a
   `test` input; `fixture.js` if that input is awkward as JSON.
5. `tests/widgets/<name>.test.mjs`: 200 random inputs from a fixed seed and
   the edge cases, against a reference implementation.
6. `node tests/widgets/narration.mjs --update`, then read the sentences in
   `tests/widgets/narration/<name>.{pt,en}.txt`.
7. Docs: `docs/pt/widgets/uc-widget-<name>.html` (copy a widget page) and
   two demos in `docs/demos/uc-widget-<name>/`; an entry in `docs/nav.json`.
8. Size: at most 8 KB gzip (`npm run build` prints it); no change to the
   core without measuring it (12 KB budget).
9. `npm test` green: algorithms, step validator, narration, axe with the
   keyboard walk, no horizontal scroll at 320 px.
