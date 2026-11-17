# Algorithm widgets — API contract (phase W0)

This is the contract of the **widget library** (`widgets/v1/`): interactive,
step-by-step visualisations of classic algorithms and data structures that a
teacher adds to any kit page with one `<script>` line and one element
(`<uc-widget-sort>`, `<uc-widget-bst>`, …). It was written before any code, so
that phases W1 to W6 and the 18 widgets share one design. It does not change
the kit, `docs/api.md` or the teacher guide: each phase copies its sections
from here into the documentation, in the same PR as the code.

- Plan (Portuguese, the 9 decisions approved by Miguel on 17 Nov 2026, 11:29):
  <https://claude.ai/artifact/VRLDLknHBitpt6LRWYkmLy>
- Status: **approved design, not implemented**. A phase may refine a detail
  that turns out wrong while coding; it records the change in section 20 and
  in its handoff note, so later phases see it.
- Everything is **additive** to the kit: a page without a widget script loads
  nothing new, and the kit's 48 KB budget does not count widget files.
- Starting point: `examples/edados-2526/extensions/uc-bst-traversal.js`, the
  extension used in lab guide 10. Its rules (section 1 of its header comment)
  become rules for every widget; its player, pseudocode panel, narration and
  SVG drawing move into the shared core.

Contents:

1. [Principles](#1-principles)
2. [Files, loading and versions](#2-files-loading-and-versions)
3. [Using a widget in a page](#3-using-a-widget-in-a-page)
4. [Common attributes](#4-common-attributes)
5. [Input formats](#5-input-formats)
6. [The step engine and the step format](#6-the-step-engine-and-the-step-format)
7. [Anatomy and layout](#7-anatomy-and-layout)
8. [Player and keyboard](#8-player-and-keyboard)
9. [Pseudocode panel](#9-pseudocode-panel)
10. [State panel, narration and text view](#10-state-panel-narration-and-text-view)
11. [`predict` mode](#11-predict-mode)
12. [`editable` mode](#12-editable-mode)
13. [Visual states and tokens](#13-visual-states-and-tokens)
14. [Languages](#14-languages)
15. [Events and element methods](#15-events-and-element-methods)
16. [Authoring API (`UC.widgets`)](#16-authoring-api-ucwidgets)
17. [Catalogue](#17-catalogue)
18. [Build, size, tests and documentation](#18-build-size-tests-and-documentation)
19. [Phases](#19-phases)
20. [Decisions taken in phase W0](#20-decisions-taken-in-phase-w0)
21. [Refinements made in phase W1](#21-refinements-made-in-phase-w1)
22. [Refinements made in phase W2](#22-refinements-made-in-phase-w2)

---

## 1. Principles

1. **One way to use them all.** Every widget has the same player, keyboard
   keys, panels, attributes, events and text view. A student who has used one
   can use the other 17.
2. **The algorithm runs once, apart from the drawing.** It returns the full
   list of steps (section 6). The player only moves an index through that
   list, so going back, scrubbing and tests are free.
3. **Correct before pretty.** A wrong animation teaches the wrong algorithm.
   No widget merges without tests against a reference implementation
   (section 18.3).
4. **Accessible by construction** (WCAG 2.1 AA). Every step has a sentence;
   the text view is a full alternative to the animation; states never rely on
   colour alone (section 13).
5. **Static and offline.** No external libraries (hand-drawn SVG), no network
   after the files are loaded, works from `file://` and from a copied folder.
6. **The teacher's HTML is the fallback.** Whatever the teacher writes inside
   the element shows with JavaScript off, if the widget fails, and before the
   widget is built; it is kept (hidden) afterwards.
7. **Small.** Core ≤ 12 KB gzip, each widget ≤ 8 KB gzip; widgets are built
   only when they come near the screen.
8. **Code and names in English**, interface strings in pt and en from the
   first commit.

## 2. Files, loading and versions

### 2.1 Repository

| Path | What |
| --- | --- |
| `widgets/src/core/` | Shared core, ES modules: `index.js` (entry, `UC.widgets`), `widget.js` (`UC.widgets.Widget`), `engine.js` (step list, cap, seeded random), `player.js`, `pseudocode.js`, `panel.js` (state panel), `narration.js` (visible line + live region), `text-view.js`, `predict.js`, `editable.js`, `svg/` (primitives, section 16.3), `i18n.js` (`widget.core.*`), `version.js`. |
| `widgets/src/core/uc-widget.css` | Every core style (player, panels, states, print). |
| `widgets/src/<name>/` | One folder per widget, `<name>` without the prefix (`sort`, `bst`, `shortest-path`): `algorithm.js` (pure, no DOM, section 6.4), `widget.js` (the element), `i18n.js` (strings and default pseudocode), `meta.json` (catalogue entry, section 17), optional `<name>.css` (≤ 1 KB; appended to `uc-widget.css`, see 18.1). |
| `widgets/src/bootstrap.js` | The few lines prepended to every widget file that load the core (2.3). |
| `widgets/v1/` | **Generated** by `npm run build`, committed like `kit/v1/`: `uc-widget-core.js`, `uc-widget.css`, `uc-widget-<name>.js`, source maps, `catalog.json`. |
| `widgets/v1.0.0/`, … | Frozen releases made by `scripts/snapshot.mjs --widgets` (W6). |
| `tests/widgets/` | Algorithm tests (Node), narration snapshots, test pages (18.3). |

Sources are **ES modules** bundled by esbuild (already a dev dependency) into
one IIFE per output file, minified, with source maps. This is different from
the kit (which concatenates IIFE files from `manifest.json`): it lets the tests
`import` `algorithm.js` directly in Node, and lets a widget import an SVG
primitive that the core does not ship (16.3).

### 2.2 URLs and versions

- The library has its **own semver**, starting at **widgets 1.0.0** (W6),
  independent of the kit. `UC.widgets.version` and `catalog.json` carry it.
- It **needs kit 1.1 or later**. The core compares `UC.version` (major.minor,
  ignoring a pre-release suffix such as `-dev`) and, if older, logs one
  `console.warn` and keeps going. Missing `window.UC` is an error (2.4).
- `widgets/v1/` receives **compatible changes only**: new widgets, new
  attributes, new algorithms, new strings. Nothing listed in this contract is
  removed or changes meaning. A breaking change goes to `widgets/v2/`, and
  `v1/` stays served.
- Frozen releases `widgets/v1.X.Y/` never change.
- `_headers` gets the same rules as the kit (W1):

  ```text
  /widgets/*
    Access-Control-Allow-Origin: *
  /widgets/v1/*
    Cache-Control: public, max-age=300, stale-while-revalidate=604800
  /widgets/v1.*
    Cache-Control: public, max-age=31536000, immutable
  ```

### 2.3 How a widget file loads the core

Each `uc-widget-<name>.js` starts with the bootstrap (2.1), which:

1. Stops with one `console.error` if `window.UC` or `UC.Element` is missing
   ("Load uc-kit.js before uc-widget-<name>.js"). The fallback stays.
2. Creates `UC.widgets` if absent, as a stub `{ __queue: [] }`. **No other
   global is written** (same rule as the kit).
3. Pushes the widget's definition function onto `UC.widgets.__queue` (or runs
   it at once if the core is already there).
4. If the core is neither loaded nor loading, adds **one**
   `<script src="<own folder>/uc-widget-core.js" data-uc-widget-core>` to
   `<head>`. "Own folder" is taken from `document.currentScript.src`, so the
   same files work from the site URL, from `file://` and from a copy of the
   folder. A second widget file sees `script[data-uc-widget-core]` and does
   not add another.

The core, when it runs:

1. If `UC.widgets.version` is already set (two copies, e.g. `v1/` and
   `v1.0.0/` on one page), keeps the first and warns once if the versions
   differ.
2. Adds `<link rel="stylesheet" href="<own folder>/uc-widget.css">` unless a
   `link[href$="uc-widget.css"]` is already in the page.
3. Installs `UC.widgets` (section 16) and runs every queued definition.

**Optional preload.** A page that wants to save the round trip on the first
visit adds `<script src=".../widgets/v1/uc-widget-core.js" defer></script>`
(and, to avoid a late stylesheet, the `<link>`) before the widget scripts; the
bootstrap then finds the core ready. This is optional and documented, never
required.

### 2.4 Building lazily

A widget element is **upgraded** as soon as its file runs, but it is
**built** (algorithm run, DOM and SVG created) only when it comes within
`200px` of the viewport (`IntersectionObserver`), or at once when
`IntersectionObserver` is missing, or on `beforeprint` (so printing shows every
widget's text view). Until then the teacher's fallback is visible. A failure
during the build (bad input, exception) shows an error note (10.4) and the
fallback; it never throws to the page.

## 3. Using a widget in a page

```html
<!-- in <head>, after the kit (also defer) -->
<script src="https://uc-design-kit.miguelrocha.dev/widgets/v1/uc-widget-sort.js" defer></script>

<!-- anywhere in the body -->
<uc-widget-sort values="5 2 9 1 7 3" algorithm="insertion">
  <p>Ordenação por inserção de 5 2 9 1 7 3: 2 5 9 1 7 3, 2 5 9 1 7 3,
     1 2 5 9 7 3, 1 2 5 7 9 3, 1 2 3 5 7 9.</p>
</uc-widget-sort>
```

- One `<script>` per widget **type**, however many elements of it the page
  has. A relative path (`../../widgets/v1/…`) works too, as with the kit.
- Several widgets on one page share the core and the stylesheet (2.3); each
  element is independent (own step, own player).
- Inside `<uc-guide>` and `<uc-exercise>` a widget is an ordinary block: it
  takes the width of the column and follows `--uc-guide-gap`.

## 4. Common attributes

Every widget accepts these; widget-specific attributes (`values`, `ops`,
`algorithm`, `source`…) are listed on each widget's page.

| Attribute | Values | Default | Effect |
| --- | --- | --- | --- |
| `algorithm` | a name from the widget's list | the widget's first | Which algorithm of the family runs (`bubble`, `insertion`, `binary`, `dijkstra`…). Widgets with one algorithm ignore it. |
| `speed` | milliseconds, 200–5000 | `900` | Time between steps while playing. Clamped to the range. |
| `controls` | `full`, `compact` | `full` | `compact`: only Back, Step and the step counter (for small inline demos). |
| `editable` | boolean | absent | The student can change the input and run again (section 12). |
| `predict` | boolean | absent | Before some steps the student chooses what happens next (section 11). |
| `start` | `0`, a step number, `end` | `0` | Step shown when the widget is built. `end` shows the result first (useful after a static explanation). |
| `seed` | integer | `1` | Seed for `random` inputs (5.1). The same seed gives the same input and steps on every visit. |
| `caption` | text | generated (`widget.<name>.caption`, e.g. "Ordenação por inserção") | Visible caption (`<figcaption>`) and accessible name of the widget. Bilingual pages give one `<span lang>` per language inside a `<template data-caption>` instead (14.2). |

Rules for every attribute:

- Boolean attributes follow HTML: present (any value) means on.
- Changing an attribute after the build (from a script) rebuilds the widget
  and returns to `start`. `observedAttributes` are the common ones plus the
  widget's own input attributes.
- An invalid value of a common attribute falls back to its default and logs
  one `console.warn` naming the element and the attribute. Invalid **input**
  (5) is an error note instead (10.4).

## 5. Input formats

Small inputs go in attributes; structured inputs (graphs, DP problems, trace
steps) go in a child element with `data-input`, so they read well in the HTML
source and stay out of the fallback.

### 5.1 Lists of values (`values`)

- Space- or comma-separated integers: `values="5 3 8 1"`,
  `values="5, 3, 8, 1"`. Negative numbers allowed. Widgets that accept text
  keys (hash, BST of words) say so on their page; keys are then
  space-separated tokens without spaces.
- `values="random N"` or `values="random N MIN..MAX"` (default `1..99`):
  N values from the seeded generator (`seed`, section 4). `values=""` is an
  empty input, valid for the widgets where it makes sense (empty list).

### 5.2 Operation scripts (`ops`)

For structures that change over time (BST, AVL, heap, hash, list, stack,
queue, union-find):

```html
<uc-widget-bst values="50 30 70" ops="insert 40; remove 30; search 70; min"></uc-widget-bst>
```

- Operations separated by `;`, each `verb arg…`. Verbs are **English, lower
  case**, the same in every page language (they read like code); each widget
  lists its verbs. Whitespace is free.
- `values` builds the initial structure **without steps** (shown as step 0);
  `ops` produces the steps. Without `ops`, the widget's default operation
  runs on `values` (BST: insert each value; sort: sort them).

### 5.3 Graphs (`<pre data-input>`)

```html
<uc-widget-shortest-path source="A" directed>
  <pre data-input>
A B 4
A C 1
C B 2      # comments start with #
B D 5
E          # an isolated vertex
A @ 0,0    # optional position, grid units
  </pre>
  <p>Distâncias a partir de A: B 3, C 1, D 8; E inacessível.</p>
</uc-widget-shortest-path>
```

- One line per edge: `U V` or `U V W` (weight, integer, may be negative where
  the algorithm allows it). A line with one name declares a vertex. Names are
  tokens without spaces (`A`, `v1`, `Porto`).
- `U @ X,Y` sets a vertex position on a grid (any non-negative numbers; the
  drawing scales them). Vertices without a position are placed by the layout
  (16.3). If any position is given, every vertex should have one; otherwise the
  rest are placed around them.
- `directed` attribute: arcs; absent: edges. Weighted is inferred (any line
  with a third token). A missing weight on a weighted graph is an error.
- The source vertex is the attribute `source` (never `start`, which is the
  initial step, section 4).
- `<pre data-input>` is hidden once the widget is built; it is not part of the
  fallback (write the fallback in other elements).

### 5.4 Other structured inputs

- `<uc-widget-dp>`: `problem` attribute (`knapsack`, `lcs`, `edit-distance`,
  `coins`) and the problem's data in attributes (`a="ABCBDAB" b="BDCABA"`,
  `weights`, `values`, `capacity`, `coins`, `amount`). Fixed in W5.
- `<uc-widget-trace>`: the teacher's own steps as JSON in
  `<script type="application/json" data-input>` (the step format of section
  6.2 with literal `say` strings per language and a `view`: `array`, `tree`,
  `graph` or `grid`). Fixed in W5.

### 5.5 Size limits

So that the drawing stays readable at 320 px:

| Shape | Limit |
| --- | --- |
| Array (sort, search, heap array, hash table, stack/queue) | 16 cells |
| Tree (BST, AVL, heap tree, recursion tree) | 15 nodes; recursion trees cap the argument instead (Fibonacci n ≤ 6, Hanoi n ≤ 4, factorial n ≤ 8) |
| Graph | 10 vertices, 20 edges |
| Grid (DP table, N queens) | 9 × 9 cells (DP strings up to 8 characters) |
| Steps | 2000 per run (6.3) |

Over a limit, the widget is not drawn: it shows the error note
`widget.core.error.tooLarge` ("Demasiados elementos para desenhar (máximo
16).") and the fallback. In `editable` mode the same message is shown next to
the input field and the previous run stays.

## 6. The step engine and the step format

### 6.1 Flow

```text
attributes / data-input ──parse()──▶ input ──algorithm.run(input, options)──▶ { steps[], result }
                                                                       │
          player index n ──────────────▶ draw(steps[n]) + panels + narration
```

`parse()` and `algorithm.run()` happen once per build (and again after an edit
or attribute change). The player never calls the algorithm.

### 6.2 A step

Plain data, JSON-serialisable (no functions, no DOM, no `Map`/`Set`), so it can
be snapshot in tests and printed in the text view.

```js
{
  // Full snapshot of the structure after this step (not a diff).
  // Shape decided by each widget: array widgets use { a: [5, 2, 9] },
  // trees { root: { v: 5, l: {…}, r: null } }, graphs { dist: {A: 0, …} }…
  state: { a: [2, 5, 9, 1, 7, 3] },

  // Visual state of the elements this step touches (section 13).
  // Keys are element ids chosen by the widget (array index "0".."15",
  // node value, vertex name, edge "A-B", cell "r,c"). Unlisted = default.
  marks: { "1": "current", "0": "compared" },

  // Named pointers drawn as labels under array cells / next to nodes.
  // Optional. Values are element ids.
  pointers: { lo: "0", mid: "2", hi: "5" },

  // Line(s) of the pseudocode to highlight: an id or ids (section 9), or null.
  line: "compare",

  // The narration: an i18n key and its parameters, never a finished string,
  // so a language switch re-renders it (section 14).
  say: ["widget.sort.compare", { a: 5, b: 2 }],

  // Counters and auxiliary structures for the state panel (section 10.1).
  // Optional; keys are fixed per widget.
  stats: { comparisons: 1, swaps: 0 },
  aux: { output: [], stack: [], queue: [] },

  // Only on steps the student may be asked about (section 11). Optional.
  predict: {
    ask: ["widget.sort.predict.swap", { a: 5, b: 2 }],
    options: [["widget.core.yes"], ["widget.core.no"]],
    answer: 0,
  },
}
```

Rules:

- `steps[0]` is the **initial state**, before the algorithm does anything,
  with `say` = the widget's "start" sentence and no marks.
- The **last step** is the result, with every final element marked `done`
  where that makes sense (sorted array, found key, shortest-path tree), and
  `say` = the summary ("Vetor ordenado: 14 comparações, 6 trocas.").
- `state` is complete in every step, so `draw(steps[n])` never needs
  `steps[n - 1]`. Memory is bounded by the step cap and the size limits.
- Every `say` key exists in **pt and en**; every `line` id exists in the
  default pseudocode of the current algorithm; `marks` values are one of the
  five states. The step validator (18.3) checks this for every widget.

### 6.3 Step cap

`UC.widgets.MAX_STEPS = 2000`. `engine.js` gives the algorithm an `emit(step)`
function that throws `TooManySteps` past the cap; the widget then shows
`widget.core.error.tooManySteps` and the fallback. With the size limits of 5.5
no catalogue algorithm reaches the cap; it guards `editable` and `trace`.

### 6.4 `algorithm.js`

```js
// widgets/src/sort/algorithm.js
export const ALGORITHMS = ["bubble", "selection", "insertion", "merge", "quick", "counting"];

/** Pure: no DOM, no UC, no Date, no Math.random. Same input, same steps. */
export function run(input, { algorithm = "bubble", pivot = "last" } = {}, emit) {
  // … emit({ state, marks, line, say, stats, predict }) for each step …
  return result;            // the final answer, compared with the reference in tests
}
```

- `run(input, options, emit)` returns the result; the engine collects the
  emitted steps and adds `steps[0]` if the algorithm did not emit it.
- Randomness only through `UC.widgets.random(seed)` (16.4), passed in
  `options.random`; never `Math.random`.
- The file imports nothing from the core except, optionally,
  `../core/engine.js` helpers (`clone`, `range`), which are pure. Tests run it
  in Node without a browser.

## 7. Anatomy and layout

### 7.1 DOM

Light DOM, like every kit component. Generated structure (classes are stable
API from W1, section 18.4):

```html
<uc-widget-sort class="uc-widget" values="…">
  <div class="uc-widget__fallback" hidden>…teacher's content, untouched…</div>
  <figure class="uc-widget__figure" aria-labelledby="ucw3-caption">
    <figcaption class="uc-widget__caption" id="ucw3-caption">Ordenação por inserção</figcaption>
    <div class="uc-widget__body">
      <div class="uc-widget__stage" tabindex="0" aria-describedby="ucw3-say">
        <svg class="uc-widget__svg" role="img" aria-label="Vetor: 2 5 9 1 7 3" viewBox="…">…</svg>
      </div>
      <div class="uc-widget__side">
        <div class="uc-widget__code">…pseudocode (9)…</div>
        <dl class="uc-widget__panel">…state panel (10.1)…</dl>
      </div>
    </div>
    <p class="uc-widget__say" id="ucw3-say">Compara 5 com 2: 5 &gt; 2, troca.</p>
    <div class="uc-widget__predict" hidden>…(11)…</div>
    <div class="uc-widget__player" role="group" aria-label="Controlos da demonstração">…(8)…</div>
    <div class="uc-widget__tools">
      <button type="button" class="uc-button uc-button--sm" aria-expanded="false" aria-controls="ucw3-text">Vista em texto</button>
      <!-- editable: the input form (12) -->
    </div>
    <div class="uc-widget__text" id="ucw3-text" hidden>…(10.3)…</div>
  </figure>
  <p class="uc-visually-hidden" aria-live="polite" aria-atomic="true"></p>
</uc-widget-sort>
```

- Ids are `ucw<N>-…`, `N` a per-page counter, so several widgets never clash.
- `.uc-button`, `.uc-button--primary`, `.uc-button--sm` and
  `.uc-visually-hidden` come from the kit's CSS; the widgets reuse them.
- The `figure` takes the full width of its container, max `--uc-content-max`.

### 7.2 Layout

Container query on `.uc-widget` (`container-type: inline-size`), not the
viewport, because widgets live in columns of different widths:

| Container width | Layout |
| --- | --- |
| ≥ 720 px | Stage (≈ 60 %) and side column (pseudocode above the state panel) side by side. |
| < 720 px | Stacked: stage, narration, player, then pseudocode and state panel. |
| 320 px | Same as stacked; no horizontal scroll; the SVG scales down to the width (5.5 keeps labels ≥ 12 px). |

### 7.3 Sketch

Full controls, wide container (sort, insertion, step 4 of 17):

```text
┌ Ordenação por inserção ─────────────────────────────────────────────────────┐
│                                              │ PSEUDOCÓDIGO                 │
│        ▼                                     │   para i de 1 a n-1:         │
│  ┌──┐┌╌╌┐┌──┐┌──┐┌──┐┌──┐                    │     x = a[i]                 │
│  │ 2││ 5││ 9││ 1││ 7││ 3│                    │     j = i - 1                │
│  └──┘└╌╌┘└──┘└──┘└──┘└──┘                    │ ▶   enquanto j ≥ 0 e a[j] > x│
│   0   1   2   3   4   5                      │       a[j+1] = a[j]          │
│       j   i                                  │     a[j+1] = x               │
│                                              │──────────────────────────────│
│                                              │ Comparações 4   Trocas 2     │
│──────────────────────────────────────────────┴──────────────────────────────│
│ Compara 5 com 1: 5 > 1, desloca 5 para a direita.                           │
│ [▶ Reproduzir] [◀ Recuar] [Passo ▶] [↺ Reiniciar]  ━━━━●━━━━━━━  Passo 4 de 17│
│ [Vista em texto]                                                            │
└─────────────────────────────────────────────────────────────────────────────┘
```

`controls="compact"`, narrow container:

```text
┌ Pesquisa binária ─────────────┐
│  ┌──┐┌──┐┌──┐┌━━┐┌──┐┌──┐      │
│  │ 1││ 3││ 4││ 7││ 8││ 9│      │
│  └──┘└──┘└──┘└━━┘└──┘└──┘      │
│  lo      mid         hi       │
│ 7 = 7: encontrado na posição 3.│
│ [◀ Recuar] [Passo ▶]  3 de 3   │
└───────────────────────────────┘
```

`predict` question open (drawing still at the previous step):

```text
│ O que acontece a seguir?  Compara 9 com 1.                       │
│ [ 9 desloca-se para a direita ]  [ 1 fica no lugar ]             │
│ Previsões certas: 2 de 3                                         │
```

The five states drawn on one array (legend shown on each widget's docs page,
not in the widget):

```text
 default   current    compared    swapped     visited    done
 ┌──┐      ┏━━┓ ▼     ┌╌╌┐        ╔══╗ ⇄      ┌──┐       ┌──┐
 │ 4│      ┃ 4┃       ┆ 4┆        ║ 4║        │ 4│•      │ 4│✓
 └──┘      ┗━━┛       └╌╌┘        ╚══╝        └──┘       └──┘
 white     accent     amber,      violet,     soft       green,
 grey      fill,      dashed      double      accent     solid
 border    pointer                + arrows    + dot      + tick
```

The real look is the visual check at the end of W1 (19).

## 8. Player and keyboard

### 8.1 Controls

| Control | Element | Behaviour |
| --- | --- | --- |
| Play / Pause | `button.uc-button--primary` | Label and icon toggle ("Reproduzir" / "Pausar"). At the last step, Play starts again from step 0. Never plays on its own (no autoplay). Hidden in `compact`. |
| Back | `button` | `n - 1`. Disabled at step 0. Pauses. |
| Step | `button` | `n + 1` (asks first in `predict`, 11). Disabled at the last step. Pauses. |
| Reset | `button` | Back to step 0, pauses, clears `predict` answers. Hidden in `compact`. |
| Scrubber | `input type="range"` min 0 max `total - 1` | Drag or arrows to any step; `aria-valuetext` = "Passo 4 de 17: <sentence>". Hidden in `compact`. |
| Counter | `output` | "Passo 4 de 17" (`compact`: "4 de 17"). |

- Buttons are at least `--uc-target-min` (44 px) tall; icons are inline SVG
  with `aria-hidden="true"` next to visible text (text hidden below 400 px
  container width, kept as `aria-label`).
- Disabled buttons use `disabled`, not `aria-disabled` (they are not useful
  while disabled).
- Playing stops when the widget leaves the viewport, when the page is hidden
  (`visibilitychange`) and on any manual control.

### 8.2 Keyboard

Handled on the `.uc-widget` element while focus is inside it, except when the
focus is in a text input (`editable`) or a `predict` option:

| Key | Action |
| --- | --- |
| `→` / `←` | Step / Back. |
| `Home` / `End` | Step 0 / last step. |
| `Space` | Play / Pause, when focus is on the stage (on a button, Space presses the button as usual). |
| `Escape` | Pause. |

The stage (`tabindex="0"`) is the place to press keys; the focus ring is
`--uc-focus-ring`. Native controls keep their own keys (the range input moves
with arrows by itself). Focus never moves on its own, except into the
`predict` question (11) and back.

## 9. Pseudocode panel

### 9.1 Default pseudocode

Generic pseudocode in pt and en (decision D5), in the widget's dictionary,
one entry per algorithm. Lines are strings `"<id>|<text>"`; the id names the
line for `step.line`, and lines that are never highlighted start with `|`:

```js
UC.addTranslations("pt", { widget: { sort: { code: { insertion: [
  "|para i de 1 a n-1:",
  "take|  x = a[i]",
  "|  j = i - 1",
  "compare|  enquanto j ≥ 0 e a[j] > x:",
  "shift|    a[j+1] = a[j]; j = j - 1",
  "insert|  a[j+1] = x",
] } } } });
```

The same ids in every language. The panel renders a `<pre>` with one
`<span class="uc-widget__line">` per line; the current line gets
`.is-current`, `aria-current="true"` and a visible `▶` marker (not colour
alone). Several ids in `step.line` highlight several lines.

### 9.2 The teacher's code

The teacher replaces the pseudocode with the course's language by writing a
`<pre data-pseudocode>` inside the element, marking the lines with
`data-line`:

```html
<uc-widget-sort values="5 2 9 1" algorithm="insertion">
  <pre data-pseudocode data-algorithm="insertion"><code>for (int i = 1; i &lt; n; i++) {
<span data-line="take">  int x = a[i];</span>
  int j = i - 1;
<span data-line="compare">  while (j &gt;= 0 &amp;&amp; a[j] &gt; x) {</span>
<span data-line="shift">    a[j + 1] = a[j]; j--;</span>
  }
<span data-line="insert">  a[j + 1] = x;</span>
}</code></pre>
  <p>…fallback…</p>
</uc-widget-sort>
```

- `data-algorithm` picks the algorithm it belongs to; without it, it applies
  to every algorithm of the widget.
- A `data-line` may hold several ids (`data-line="compare shift"`). Ids the
  teacher does not mark simply highlight nothing.
- Bilingual pages: `lang="pt"` / `lang="en"` on the `<pre>`; the widget picks
  the one in the active language, then an untagged one, then the default.
- The teacher's `<pre data-pseudocode>` is moved into the panel (not copied),
  so its text appears once on the page. With JavaScript off it shows where the
  teacher wrote it, as part of the fallback.
- A line marker may use any ids from the widget's page (each widget lists
  them per algorithm). An unknown id logs one `console.warn`.

## 10. State panel, narration and text view

### 10.1 State panel

`<dl class="uc-widget__panel">` with the widget's counters and auxiliary
structures for the current step, from `step.stats` and `step.aux`:

| Key | Shown as | Label key |
| --- | --- | --- |
| `stats.comparisons`, `stats.swaps`, `stats.writes`, `stats.probes` … | number | `widget.core.stat.<key>` |
| `aux.output` | sequence `5 3 1 4` (or "Ainda nada.") | `widget.core.output` |
| `aux.stack` | vertical list, top first, labelled "topo" | `widget.core.stack` (or the widget's, e.g. "Pilha de chamadas") |
| `aux.queue` | horizontal list, front first, labelled "frente" | `widget.core.queue` |
| `aux.<other>` | widget-specific renderer | `widget.<name>.aux.<other>` |

Counters do not use `aria-live`; the narration says what changed.

### 10.2 Narration

- The **visible line** `.uc-widget__say` always shows the current step's
  sentence (it helps everyone, not only screen-reader users).
- The **live region** (`aria-live="polite"`, `aria-atomic="true"`) announces
  on manual moves (Step, Back, Home/End, scrubber release): "Passo 4 de 17.
  Compara 5 com 1: 5 > 1, desloca 5 para a direita." While **playing** it
  stays quiet (a sentence every 900 ms would pile up in the reader's queue):
  Play announces "A reproduzir", Pause and the end announce the current step.
- Sentences are short, start with the action verb, and give the values
  ("Compara 7 com 3: troca."). Each widget's phrases are snapshot-tested
  (18.3).
- The SVG has `role="img"` and an `aria-label` from the widget's
  `describe(step)` (16.2): the structure in words ("Vetor: 2 5 9 1 7 3";
  "Árvore com raiz 50; filhos de 50: 30 e 70; …").

### 10.3 Text view

The "Vista em texto" button (`aria-expanded`) shows `.uc-widget__text`:

1. An `<ol>` with the sentence of **every** step; the current one has
   `aria-current="step"` and is visually marked. Each item is a button-less
   list item (no extra tab stops); it is a reading view, not a navigator.
2. A `<table>` (with `<caption>`) of the current step's state from the
   widget's `table(step)` (16.2): for an array, index and value with the state
   in words ("comparado"); for a graph, vertex, distance, predecessor.
3. The result in one sentence.

It is the complete text alternative to the animation (WCAG 1.1.1), and is what **printing** shows: `@media print` hides the player
and the predict/editable controls, opens the text view and keeps the SVG of
the current step.

### 10.4 Error note

On invalid input, a size limit or a failed build, the widget shows
`<p class="uc-widget__error">` with the reason in the page language
(`widget.core.error.*`) **above** the teacher's fallback, and logs details
(`console.warn`, element and input). The note is static text (no `role="alert"`:
it is there on page load, not the result of an action), except in `editable`
mode, where the field error is linked with `aria-describedby` and announced.

## 11. `predict` mode

In the core from W1 for every widget (decision D7).

- The algorithm puts `predict` on the steps worth asking about (6.2):
  comparisons with an outcome (swap or not, go left or right, which vertex
  leaves the queue, which rotation). Each widget's page lists them. A widget
  with no predict steps ignores the attribute.
- When the student moves **forward** onto a step `n` with `predict` (Step,
  Play or `→`), and it was not answered in this run, the drawing stays at
  `n - 1` and `.uc-widget__predict` opens: the question (`ask`) as a
  `<p>`, then one `button` per option (2–4). Focus moves to the first option.
  Play pauses.
- On a choice: the feedback "Certo." or "Ainda não: <the step's sentence>"
  is shown and announced (`aria-live`), the question closes, the drawing moves
  to `n`, focus returns to the Step button. Play does not resume by itself.
- Back, Home, End and the scrubber never ask. Reset clears the answers.
- A score line "Previsões certas: 3 de 4" is shown under the player while
  `predict` is on. Nothing is stored or sent: no grades, no `localStorage`.
- The element fires `uc:widgetpredict` (15) after each answer.

## 12. `editable` mode

- Adds, under the player, a small form: a labelled text field with the
  current input in the attribute's syntax (`values`, `ops`; graphs get a
  `<textarea>` with the `data-input` lines), a "Correr" button, and "Repor"
  (back to the teacher's input).
- The same parser and limits as the attributes. An error keeps the previous
  run, shows the message under the field (`aria-describedby`,
  `aria-invalid="true"`) and announces it.
- A valid input rebuilds the steps and returns to step 0. The attribute is not
  changed; nothing is stored.
- The algorithm selector is **not** part of `editable`: to compare
  algorithms, the teacher puts two widgets side by side (or the widget offers
  its own `algorithm` toggle, as the BST traversal does with orders; such
  toggles are `button[aria-pressed]` groups in the header).

## 13. Visual states and tokens

### 13.1 The five states

Every widget draws elements in one of six looks: default plus the five
states. Colour, outline **and** a marker differ, so no state depends on colour
alone (WCAG 1.4.1); every line and marker has ≥ 3:1 against its background
(1.4.11) and every label ≥ 4.5:1 (1.4.3).

| State | Meaning | Fill | Outline | Marker | Label |
| --- | --- | --- | --- | --- | --- |
| default | not involved yet | `--uc-color-surface` | 1.5 px solid `--uc-color-text-muted` (7.7:1) | — | `--uc-color-text` |
| `current` | the element the algorithm is working on | `--uc-widget-current` | 3 px solid `--uc-widget-current` | `▼` pointer above (arrays) / thick ring (nodes) | `--uc-color-on-accent` (6.7:1 on the default accent) |
| `compared` | read or compared in this step | `--uc-widget-compared-bg` | 2 px **dashed** `--uc-widget-compared` (5.0:1 on white, 4.5:1 on its fill) | — | `--uc-color-warning-text` (6.4:1) |
| `swapped` | moved or written in this step | `--uc-widget-swapped-bg` | **double** outline `--uc-widget-swapped` (7.1:1) | `⇄` arc between the pair (arrays) | `--uc-color-text` (14.9:1) |
| `visited` | already processed, still relevant | `--uc-widget-visited-bg` | 1.5 px solid `--uc-widget-visited` (5.9:1 on its fill) | small dot `•` | `--uc-color-text` (15.7:1) |
| `done` | in its final place / part of the answer | `--uc-widget-done-bg` | 2 px solid `--uc-widget-done` (5.0:1, 4.6:1 on its fill) | `✓` | `--uc-color-success-text` (6.5:1) |

Edges of graphs and trees use the same outline colours and patterns as
strokes (current: 3 px; compared: dashed; done: 3 px solid; visited: 2 px).

### 13.2 Tokens

Local tokens (read with a fallback, **not** defined on `:root`, so a course's
`theme.css` wins whatever the load order of `uc-widget.css`):

| Token | Fallback | Use |
| --- | --- | --- |
| `--uc-widget-current` | `var(--uc-color-accent)` | `current` fill and outline. Follows `accentColor`. |
| `--uc-widget-compared` | `#B45309` | `compared` outline. |
| `--uc-widget-compared-bg` | `var(--uc-color-warning-bg)` | `compared` fill. |
| `--uc-widget-swapped` | `#6D28D9` | `swapped` outline and arc. |
| `--uc-widget-swapped-bg` | `#EDE9FE` | `swapped` fill. |
| `--uc-widget-visited` | `var(--uc-color-accent)` | `visited` outline and dot. |
| `--uc-widget-visited-bg` | `var(--uc-color-accent-soft)` | `visited` fill. |
| `--uc-widget-done` | `#15803D` | `done` outline and tick. |
| `--uc-widget-done-bg` | `var(--uc-color-success-bg)` | `done` fill. |
| `--uc-widget-stage-max` | `420px` | Maximum height of the stage; the SVG scales inside it. |
| `--uc-widget-duration` | `200ms` | Transition time of moves and colour changes; `0s` with `prefers-reduced-motion: reduce`. |

The contrast figures above are for the default tokens on white; a teacher who
changes them is responsible for the new pairs (the docs say so, as for
`accentColor`).

### 13.3 Motion

- Moves (swaps, rotations, elements entering a queue) are CSS transitions of
  `transform` and `fill`/`stroke` over `--uc-widget-duration`, always shorter
  than `speed`.
- `prefers-reduced-motion: reduce`: no transitions; steps change instantly.
  Playback still works (the step change is not animation in the 2.3.3 sense,
  and the student starts it).
- Nothing flashes (2.3.1); nothing moves without the student pressing a
  control (2.2.2: Pause is always reachable while playing).

## 14. Languages

### 14.1 Keys

- Core strings: `widget.core.*` (player, panels, text view, predict,
  editable, errors), in `widgets/src/core/i18n.js`.
- Widget strings: `widget.<name>.*` (`widget.sort.compare`,
  `widget.sort.code.insertion`, `widget.shortest-path.relax`), in
  `widgets/src/<name>/i18n.js`. Keys with a hyphen are written as quoted
  object keys; `UC.t` already splits on dots only.
- Added with `UC.addTranslations("pt" | "en", …)`, the kit's public API, so
  a teacher can override any widget string from a local script, as for kit
  strings.

### 14.2 Language switch

The element extends `UC.Element`: on `uc:languagechange` it re-renders the
texts (labels, narration from `say` keys, pseudocode default, text view)
**keeping the current step**. The algorithm does not run again. A bilingual
caption is written as

```html
<template data-caption><span lang="pt">Ordenação por inserção</span><span lang="en">Insertion sort</span></template>
```

and the widget picks the span of the active language.

### 14.3 Interface strings (pt / en)

| Key | pt | en |
| --- | --- | --- |
| `widget.core.play` / `pause` | Reproduzir / Pausar | Play / Pause |
| `widget.core.back` / `step` / `reset` | Recuar / Passo / Reiniciar | Back / Step / Reset |
| `widget.core.counter` | Passo {n} de {total} | Step {n} of {total} |
| `widget.core.controls` | Controlos da demonstração | Demo controls |
| `widget.core.playing` | A reproduzir. | Playing. |
| `widget.core.textView` | Vista em texto | Text view |
| `widget.core.code` | Pseudocódigo | Pseudocode |
| `widget.core.output` / `stack` / `queue` | Saída / Pilha / Fila | Output / Stack / Queue |
| `widget.core.top` / `front` | topo / frente | top / front |
| `widget.core.nothingYet` / `empty` | Ainda nada. / Vazia. | Nothing yet. / Empty. |
| `widget.core.stat.comparisons` / `swaps` / `writes` / `probes` | Comparações / Trocas / Escritas / Sondagens | Comparisons / Swaps / Writes / Probes |
| `widget.core.state.current` … `done` | atual / comparado / trocado / visitado / terminado | current / compared / swapped / visited / done |
| `widget.core.predict.question` | O que acontece a seguir? | What happens next? |
| `widget.core.predict.right` / `wrong` | Certo. / Ainda não: {say} | Right. / Not quite: {say} |
| `widget.core.predict.score` | Previsões certas: {right} de {total} | Correct predictions: {right} of {total} |
| `widget.core.yes` / `no` | Sim / Não | Yes / No |
| `widget.core.edit.label` / `run` / `restore` | Valores / Correr / Repor | Values / Run / Restore |
| `widget.core.error.input` | Não consegui ler os dados: {detail} | Could not read the input: {detail} |
| `widget.core.error.tooLarge` | Demasiados elementos para desenhar (máximo {max}). | Too many elements to draw (maximum {max}). |
| `widget.core.error.tooManySteps` | O algoritmo passou de {max} passos. Usa uma entrada mais pequena. | The algorithm went past {max} steps. Use a smaller input. |
| `widget.core.error.build` | Não foi possível mostrar a demonstração. | The demo could not be shown. |

W1 may add keys; it may not rename these.

## 15. Events and element methods

Events bubble from the element (`composed` is irrelevant: no shadow DOM):

| Event | `detail` | When |
| --- | --- | --- |
| `uc:widgetstep` | `{ widget, step, total }` | After every change of the current step (any cause, including the build). `widget` is the tag name. |
| `uc:widgetdone` | `{ widget, total }` | When the last step is reached by moving forward (not by `start="end"`). |
| `uc:widgetpredict` | `{ widget, step, correct, right, asked }` | After each `predict` answer. |

Methods and properties on every widget element (available once built; before
that, `go`/`play` build it first):

| Member | Description |
| --- | --- |
| `go(n)` | Shows step `n` (clamped; `"end"` allowed). |
| `next()` / `back()` | One step (the same as the buttons, including `predict`). |
| `play()` / `pause()` | Start / stop playing. |
| `reset()` | Step 0, clear `predict` answers. |
| `step` (read only) | Current step index. |
| `total` (read only) | Number of steps. |
| `result` (read only) | The algorithm's result (e.g. the sorted array). |

Example (a guide that reveals a question when the demo ends):

```js
document.querySelector("#demo").addEventListener("uc:widgetdone", () => {
  document.querySelector("#q3").hidden = false;
});
```

## 16. Authoring API (`UC.widgets`)

For the catalogue and for teachers who write their own widget ("Criar um
widget" guide, W5).

### 16.1 Namespace

| Member | Description |
| --- | --- |
| `UC.widgets.version` | Library version (`"1.0.0"`). |
| `UC.widgets.Widget` | Base class (16.2). |
| `UC.widgets.register(name, Class)` | `UC.define(name, Class)` plus internal bookkeeping (adds `class="uc-widget"`, the build observer). Name must start with `uc-widget-` for catalogue widgets; teachers' own widgets may use any name with a hyphen. |
| `UC.widgets.svg` | Drawing primitives (16.3). |
| `UC.widgets.random(seed)` | Seeded generator (16.4). |
| `UC.widgets.parse` | Shared parsers: `values(text, opts)`, `ops(text, verbs)`, `graph(text)`; they throw `UC.widgets.InputError(key, params)`. |
| `UC.widgets.MAX_STEPS` | `2000`. |
| `UC.widgets.InputError`, `UC.widgets.TooManySteps` | Error types the core turns into notes (10.4). |

### 16.2 `UC.widgets.Widget`

Extends `UC.Element`. A widget declares only what is specific to it:

```js
UC.widgets.register("uc-widget-sort", class extends UC.widgets.Widget {
  static id = "sort";                        // i18n namespace: widget.sort.*
  static algorithms = ALGORITHMS;            // for the algorithm attribute
  static inputAttributes = ["values", "pivot"];
  static limits = { items: 16 };

  parse() {                                  // attributes / data-input → input, may throw InputError
    return UC.widgets.parse.values(this.getAttribute("values") ?? "random 8", { max: 16, random: this.random });
  }
  steps(input, emit) {                       // calls the pure algorithm
    return run(input, { algorithm: this.algorithm, pivot: this.getAttribute("pivot") ?? "last" }, emit);
  }
  draw(step, svg) {                          // draws one step into the stage's <svg>
    UC.widgets.svg.array(svg, step.state.a, { marks: step.marks, pointers: step.pointers });
  }
  describe(step) {                           // the SVG's aria-label
    return this.t("widget.sort.describe", { values: step.state.a.join(" ") });
  }
  table(step) {                              // text view table (10.3)
    return { head: ["#", "Valor", "Estado"], rows: step.state.a.map((v, i) => [i, v, this.stateName(step.marks[i])]) };
  }
});
```

| Hook | Required | Default |
| --- | --- | --- |
| `parse()` | yes | — |
| `steps(input, emit)` | yes | — |
| `draw(step, svg)` | yes | — |
| `describe(step)` | no | caption + step sentence |
| `table(step)` | no | no table in the text view |
| `panel(step)` | no | the generic renderer of `stats`/`aux` (10.1) |
| `pseudocode(algorithm)` | no | `widget.<name>.code.<algorithm>` |

Provided by the base class: building on visibility, the fallback, the player,
keyboard, narration, text view, pseudocode, predict, editable, error notes,
language switch, events and methods of 15, `this.algorithm`, `this.random`
(seeded from `seed`), `this.stateName(state)`.

The base class keeps `setup()`/`render()` of `UC.Element` for itself; a widget
does not override them.

### 16.3 SVG primitives

Each draws into the given `<svg>`, replacing its content, keeps elements with
the same id between steps (so CSS transitions animate moves), and sets the
`viewBox` to fit. All accept `{ marks, pointers, labels }` and apply the state
classes `uc-widget__item is-<state>`.

| Primitive | Draws | Used by | Phase |
| --- | --- | --- | --- |
| `svg.array(svg, values, opts)` | Row of cells with indexes, pointers (`lo`, `i`, `j`…), swap arcs; `opts.bars` for a bar view | sort, search, heap, hash, stack-queue | W1 |
| `svg.tree(svg, root, opts)` | Binary/n-ary tree, `opts.children(node)`, `opts.key(node)`; tidy layout (in-order x, depth y) | bst, avl, heap, recursion, backtracking | W2 |
| `svg.list(svg, nodes, opts)` | Linked nodes with pointer arrows, `head`/`tail`, `null` | list, stack-queue | W2 |
| `svg.graph(svg, graph, opts)` | Vertices, edges/arcs, weights; manual positions or automatic layout | graph, shortest-path, mst, union-find, toposort | W4 |
| `svg.grid(svg, rows, cols, cells, opts)` | Table of cells with row/column headers | dp, backtracking (board), hash (chaining) | W3–W5 |
| `svg.plot(svg, series, opts)` | Line chart of growth functions | complexity | W4 |

Rule for size: a primitive lives in the core when **three or more** widgets
use it; otherwise the widget imports it from `widgets/src/core/svg/` and
esbuild bundles it into that widget's file only. W1 ships `array` in the core;
the phase that adds a primitive decides by this rule and records it.

### 16.4 Seeded random

`UC.widgets.random(seed)` returns `{ int(min, max), shuffle(array),
pick(array) }` based on mulberry32. The same module is imported by the tests,
so a widget page and a test with the same seed see the same input.

## 17. Catalogue

`widgets/v1/catalog.json`, generated by the build from every
`widgets/src/<name>/meta.json` (the runtime `register()` cannot write files):

```json
{
  "version": "1.0.0",
  "kit": ">=1.1",
  "widgets": [
    {
      "name": "uc-widget-sort",
      "file": "uc-widget-sort.js",
      "status": "stable",
      "since": "1.0.0",
      "wave": 1,
      "title": { "pt": "Ordenação", "en": "Sorting" },
      "summary": { "pt": "Bolha, seleção, inserção, merge sort, quicksort e counting sort.", "en": "Bubble, selection, insertion, merge sort, quicksort and counting sort." },
      "algorithms": ["bubble", "selection", "insertion", "merge", "quick", "counting"],
      "courses": ["IP", "EDados", "PI"],
      "attributes": ["values", "algorithm", "pivot"],
      "predict": true,
      "gzip": 6144
    }
  ]
}
```

`status` is `experimental` while a widget's page says so (it may still change
in compatible ways only after it is `stable`); every widget is `stable` at
W6. The docs catalogue page and `llms-full.txt` are generated from this file.

The 18 widgets, their algorithms and waves are those of the plan's catalogue
table; the waitlist (red-black trees, B-trees, skip lists, tries, KMP,
Rabin-Karp, Floyd-Warshall, segment and Fenwick trees, flood fill) is not
built unless someone asks.

## 18. Build, size, tests and documentation

### 18.1 Build

- `scripts/build.mjs` calls a new `scripts/build-widgets.mjs` (its own file,
  so the widget work rarely touches the kit's build). It bundles
  `widgets/src/core/index.js` → `uc-widget-core.js`, each
  `widgets/src/<name>/widget.js` (with `bootstrap.js` first) →
  `uc-widget-<name>.js`, concatenates `core/uc-widget.css` and every
  `<name>.css` → `uc-widget.css`, and writes `catalog.json`. Same esbuild
  version and browser target as the kit; minified, with source maps.
- `npm run build:check` fails when `widgets/v1/` is not up to date, as for
  `kit/v1/`.
- The kit build is unchanged except for the call; `kit/v1/` stays byte for
  byte the same.

### 18.2 Size budgets

| File | Budget (gzip) | On failure |
| --- | --- | --- |
| `uc-widget-core.js` | 12 KB | build fails: "Make the core smaller or raise the budget in docs/plan/widgets-api.md 18.2 first." |
| `uc-widget-<name>.js` | 8 KB each | build fails, naming the widget |
| `uc-widget.css` | 4 KB | build fails |

The build prints every size, as it does for the kit.

### 18.3 Tests

All run in CI on every PR. Node tests use the built-in `node:test` (no new
dependency) and take seconds.

1. **Algorithms** (`tests/widgets/<name>.test.mjs`, Node, no browser): for each
   widget and algorithm, 200 random inputs from a fixed seed, plus the classic
   edge cases (empty, one element, all equal, repeated values, already sorted,
   reverse sorted, disconnected graph, negative weights where allowed). The
   result and the last step's `state` must match a **reference**:

   | Widget | Reference / invariant |
   | --- | --- |
   | sort | `Array.prototype.sort` copy; multiset kept in every step; counters never decrease |
   | search | `indexOf` / the lower bound; `lo ≤ mid ≤ hi` in every step |
   | bst, avl | in-order is sorted after every operation; AVL balance in {-1, 0, 1} after every operation; search answers match a `Set` |
   | list, stack-queue | final contents equal an array model of the same ops |
   | recursion | `n!`, Fibonacci value, Hanoi move count `2^n − 1` and a legal move list |
   | heap | heap property after every operation; heapsort equals the sorted copy |
   | hash | every inserted key found, removed keys not found; load factor matches |
   | graph | BFS distances equal a reference BFS; DFS visits each reachable vertex once |
   | shortest-path | Dijkstra distances equal Bellman-Ford's (and a negative cycle is reported) |
   | mst | Kruskal and Prim give the same total weight |
   | union-find | connectivity equals a naive labelling |
   | toposort | output respects every arc; a cycle is reported iff it exists |
   | dp | table equals a straightforward reference; reconstruction is valid |
   | backtracking | N-queens counts 1, 0, 0, 2, 10, 4, 40, 92 for n = 1..8 |
   | trace | the JSON schema validator accepts the docs examples and rejects broken ones |

2. **Step validator** (`tests/widgets/steps.test.mjs`): for every widget,
   algorithm and a fixed input, every step is JSON-serialisable, `steps[0]`
   has no marks, `marks` values are the five states, every `line` id exists
   in the default pseudocode (pt and en, same ids), every `say` and `predict`
   key exists in pt and en, and `steps.length ≤ MAX_STEPS`.
3. **Narration snapshots** (`tests/widgets/narration/<name>.<lang>.txt`): the
   sentences of a fixed input per widget, compared on every PR;
   `node tests/widgets/narration.mjs --update` rewrites them (the diff is
   reviewed like code).
4. **Pages** (Playwright + axe, inside the existing `check-pages`/`check-a11y`
   shards, no new CI job): every widget demo page (18.4) is walked with the
   keyboard from the first to the last step; axe has no violations at step 0,
   at the last step, with the text view open and with a `predict` question
   open; no console errors; no horizontal scroll at 320 px; with
   `prefers-reduced-motion` the computed transition duration is `0s`; with
   JavaScript off the fallback is visible; language switch keeps the step.
5. **Size**: the build budgets (18.2).
6. **Compatibility** (from W6): `tests/widgets/compat.html` uses the attributes
   and methods of `widgets/v1.0.0/` and must keep working with `widgets/v1/`.

No screenshots in PRs (the CI stays fast); the visual check is Miguel's, once,
at the end of W1.

### 18.4 Documentation

Each phase documents what it ships, in the same PR, PT first and then EN, in
the style of the site:

- New "Widgets" group in `docs/nav.json`: **Catálogo** (cards from
  `catalog.json`: name, algorithms, courses, status), **Usar widgets** (import,
  preload, pin a version, copy the files for offline use, combine with
  `<uc-guide>`/`<uc-exercise>`, events), one **page per widget** (live demo,
  copyable code with the site's copy button, attributes table, `ops` verbs,
  pseudocode line ids per algorithm, predict steps, accessibility notes) and
  **Criar um widget** (W5).
- Widget pages double as test pages (18.3 item 4).
- `docs/api.md`: a new section **7.2 Widgets (`UC.widgets`)** with sections
  4, 6.2, 15 and 16 of this contract in short form (7.2 rather than a new
  section 8, so existing anchors do not move).
- `llms.txt` / `llms-full.txt`: the catalogue and the attributes (generated by
  the build from the docs pages, as today). `template/AGENTS.md`: when to
  suggest a widget and the one-line import.
- `CHANGELOG.md`: a separate "Widgets" heading under "Unreleased" until W6
  gives the library its own changelog section `## Widgets [1.0.0]`.

## 19. Phases

Each phase: its own thread and branch, one PR merged with green CI, a
`docs/plan/widgets-phase-N-handoff.md`, the docs of what it ships.

| Phase | Ships | Notes |
| --- | --- | --- |
| **W0** | This contract and its handoff. | Docs only. |
| **W1** | `widgets/src/core` complete (engine, `Widget`, player, keyboard, pseudocode, panel, narration, text view, predict, editable, errors, `svg.array`, random, parsers), `bootstrap.js`, `build-widgets.mjs` with budgets and `catalog.json`, `_headers`, the test harness of 18.3 (algorithms, step validator, narration, pages), **`uc-widget-sort`** complete with all six algorithms, docs pages Catálogo, Usar widgets and Ordenação (pt + en), `api.md` 7.2, `llms` and `AGENTS.md`. | Ends with the **visual check**: post a preview of the sort widget to Miguel and **continue without waiting** (Miguel asked to stop only at the end of the plan; his remarks are applied in the next phase). Blocks phase 5 and the CI speed-up, which W1 waited for, are merged (#47, #46). |
| **W2** | `uc-widget-search`, `uc-widget-bst` (lab guide 10 of `examples/edados-2526` switches to it; `uc-bst-traversal.js` stays as the extension tutorial, decision D9), `uc-widget-list`, `uc-widget-stack-queue`, `uc-widget-recursion`; `svg.tree`, `svg.list`. | Touches `examples/edados-2526/guioes/aula10*` only for the switch: coordinate with the blocks phase 6 / migration threads (fetch and rebase before merging). |
| **W3** | `uc-widget-heap`, `uc-widget-avl`, `uc-widget-hash`; `svg.grid` if needed. | |
| **W4** | `svg.graph` with automatic layout, `uc-widget-graph`, `uc-widget-shortest-path`, `uc-widget-complexity` (`svg.plot`; can read the counters of another widget on the page through `uc:widgetdone`). | |
| **W5** | `uc-widget-mst`, `uc-widget-union-find`, `uc-widget-toposort`, `uc-widget-dp`, `uc-widget-backtracking`, `uc-widget-trace`; "Criar um widget" guide, template folder and contribution checklist. | |
| **W6** | Freeze `widgets/v1.0.0/` (snapshot), compatibility page, final catalogue, apply widgets to the examples (EDados, PC, IP guides), tell the migration threads. | **Releasing is Miguel's gate**: prepare everything, cut nothing. Widgets 1.0.0 needs kit 1.1.0 released first. |

Every phase also: keeps `npm test` green, keeps the budgets, adds its
strings in pt and en, updates `llms-full.txt` through the build, and lists in
its handoff the contract sections it refined.

Files other threads also touch (search S1–S5, blocks phase 6, migrations):
`CHANGELOG.md`, `docs/nav.json`, `llms-full.txt`, `template/AGENTS.md`,
`scripts/build.mjs`, `.github/workflows/check-pages.yml`. Fetch and rebase
right before merging and keep both sides.

## 20. Decisions taken in phase W0

Beyond the plan, W0 fixed these details (later phases add theirs here):

1. **ES modules + esbuild bundle** for widget sources (the kit concatenates
   IIFEs). Reason: Node tests import the pure algorithms directly; a widget can
   bundle a primitive the core does not ship.
2. **Catalogue from `meta.json` at build time.** The plan said `register()`
   adds to `catalog.json`; at runtime it cannot write files, so the build does.
3. **State tokens are local tokens** (fallback, not `:root`), and each state
   has a colour and a `-bg` token (10 instead of the plan's 5), plus
   `--uc-widget-stage-max` and `--uc-widget-duration`. Reason: the widget CSS
   is injected after `theme.css`, so `:root` defaults would override the
   teacher's values; and a fill and an outline per state are needed to reach
   3:1 with shape cues.
4. **Graph source is `source`**, not `start` (taken by the initial step).
5. **The live region is quiet while playing** (announces Play, Pause and
   the end). Manual moves announce every step.
6. **`predict` asks only when moving forward**, once per run, never on Back
   or the scrubber; options are buttons, not a radio group with a submit.
7. **`ops` verbs are English** in every language (they read as code).
8. **Pseudocode lines are `"<id>|<text>"`** in the dictionaries; teachers
   mark their own code with `<span data-line>`.
9. **Primitives used by fewer than three widgets are bundled into those
   widgets**, not the core, to keep the core ≤ 12 KB.
10. **Docs go to `docs/api.md` 7.2**, not a new section 8, so anchors stay.
11. **CSS budget** of 4 KB gzip for `uc-widget.css` (the plan gave none).
12. **Version check** accepts pre-release suffixes (`1.1.0-dev`), since the
    kit on `main` is not released yet; widgets 1.0.0 is released after kit
    1.1.0 (W6).

## 21. Refinements made in phase W1

1. **Kit version**: `UC.version` (and `package.json`) is `1.1.0-dev`, so the
   core's version check passes on `main`.
2. **The bootstrap is a module** (`widgets/src/bootstrap.js` exports
   `boot(name, define)`); the build bundles a small entry that calls it before
   the widget runs, instead of prepending text. Same behaviour as 2.3. It also
   treats a `<script src=".../uc-widget-core.js">` written by the page as the
   preload (no second copy).
3. **Fewer core files than 2.1**: the player, keyboard, narration, pseudocode,
   panels, text view, predict and editable live in `core/widget.js`; helpers in
   `core/dom.js`, parsers in `core/parse.js`. The split can change freely.
4. **Errors are recognised by name** (`error.name === "InputError"`), because
   each widget file bundles its own copy of `engine.js` with the algorithm.
5. **Empty cells**: `null` in an array state is an empty cell. Insertion sort
   takes `x` out, merge sort takes both halves out (`aux.left`/`aux.right`),
   counting sort empties the array and rewrites it from `aux.count`. So the
   array plus the held values are always the input (the multiset test of 18.3).
6. **svg.array animates states, not moves**: cells are kept per index and
   their colours change with a transition; values do not slide. Bars
   (`bars` attribute of the sort widget, new) are at least 28 units tall so the
   value fits inside.
7. **New core keys**: `counterShort`, `scrubber`, `announce`, `steps`,
   `result`, `state`, `hole`, `value`, `stateName.*`, `column.*`,
   `error.notInteger`, `error.random`, `error.verb`, `error.line`,
   `error.weight`. `stat.*` and `state.*` of 14.3 are `stat.*` and
   `stateName.*` (`state` is the text-view caption).
8. **Counter numbers from 1**: "Passo 1 de 31" is step index 0; `total` is
   the number of steps. Narration announces "Passo n de total. <sentence>".
9. **Text view** has no scroll box (a scrollable list would need a tab stop).
10. **Predict feedback** is shown under the player (`.uc-widget__feedback`)
    and announced; focus returns to Step (Back at the last step).
11. **meta.json `test`**: the fixed input and extra option sets the step
    validator and the narration snapshots use (`input`, `options`).
12. **Catalogue cards** are written by `build-widgets.mjs` between
    `<!-- widgets:catalog -->` markers (the `docs:` prefix belongs to
    `docs.mjs`). Widget pages are nav entries without `component`.
13. **CI**: the Node widget tests run in shard 2 (`npm run test:widgets`);
    the browser checks of 18.3 item 4 are `checkWidgets` in
    `scripts/check-a11y.mjs`, on every page with a widget.
14. **Counting sort** refuses inputs with more than 100 distinct possible
    values (`widget.sort.error.range`).

## 22. Refinements made in phase W2

1. **`svg.tree` is in the core** (bst, avl, heap, recursion, backtracking
   use it: rule 16.3). Options `children`, `binary` (in-order layout, the
   default; `false` gives the n-ary layout: one column per leaf, a parent
   above the middle of its children), `key`, `label`, `note` (drawn right of
   the node, e.g. a return value), `marks`, `pointers`, `empty`. Nodes are
   pill-shaped boxes as wide as the longest label. An edge takes the state of
   its lower node when that node is `current`, `visited` or `done`.
2. **`svg.list` is bundled** into `uc-widget-list` and
   `uc-widget-stack-queue` (two widgets: rule 16.3), from
   `widgets/src/core/svg/list.js`. Nodes `[{ id, v, next }]` in display
   order; `raised` ids are drawn above the row (a node not linked yet, or
   just taken out); arrows to the next slot are straight, others are arcs
   (below when they point left, as in a reversal); an edge mark is keyed
   `"<id>>"`. Lists hold at most **10 nodes** (5.5 had no list row).
3. **Moves animate**: tree and list nodes are kept by key and placed with a
   CSS `transform`, so insertions, removals and the successor moving up
   slide over `--uc-widget-duration`. Each primitive records its kind in
   `svg.__ucKind`, so one widget can switch primitives (stack-queue `impl`).
4. **Not larger than 1:1**: trees and lists set `max-width` to their
   natural size, arrays to 1.25 ×; small inputs no longer fill the column
   with huge cells.
5. **Per-operation pseudocode (`step.code`)**: a step may name the
   pseudocode block it belongs to (`insert`, `reverse`, `queue-array`);
   without it the block is the algorithm's. The panel switches blocks while
   moving through the steps; a teacher's `<pre data-pseudocode
   data-algorithm="insert">` matches the block name. The step validator
   checks line ids against the step's block.
6. **Several ids per default line**: `"left right found|…"` — the part
   before `|` may hold space-separated ids, like `data-line`.
7. **Common attribute `algorithms`**: space-separated names of the widget's
   list; with two or more, a `button[aria-pressed]` group
   (`.uc-widget__choices`, labelled "Algoritmo") under the caption switches
   the algorithm and rebuilds at step 0 (12). Labels are the algorithms'
   captions. Changing the `algorithm` attribute clears the choice.
8. **Editable field per widget**: `static editAttribute` (default: the
   first input attribute) and `static editLabel` (an i18n key). The list
   and stack-queue edit `ops`; the search edits `values` with the target
   after `:` (`1 3 5 7 : 5`, also accepted in the attribute).
9. **Meta `test.options` may carry their own `input`** (the search's
   binary/lower inputs, the BST's operations, the stack-queue's four
   structures); `tests/widgets/helpers.mjs` `splitInput`.
10. **Widget choices**: BST `algorithm` = `operations` (default; insert
    each value, or run `ops`) or a traversal; removal of a node with two
    children copies the successor's value and removes the successor in one
    step, so the successor's node visibly moves up. Search target defaults
    to the value two thirds along the array; `random` inputs are sorted for
    the binary searches, explicit unsorted inputs are an error. The list has
    one algorithm, `singly` (room for `doubly`). Stack-queue: arrays have a
    fixed `capacity` (1–16, default 8) with overflow / underflow steps; the
    queue is circular. Recursion: `n` caps of 5.5, Hanoi node labels
    `h(n,from,to)`, pegs in `aux.pegs`, moves in `aux.output`.
11. **New core keys**: `algorithm`, `edit.ops`, `tree.empty`.
