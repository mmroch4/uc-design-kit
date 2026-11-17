# Grading with several formulas — API contract (phase G0)

This is the contract for the second version of `<uc-grading>`: assessment
methods written as text formulas (`max`, `min`, several weightings), pass
rules on any expression, and the move of the component out of `uc-kit.js`
into a module loaded only by the pages that use it. It was written before any
code, so that phases G1 to G4 share one design. It does not change the kit,
`docs/api.md` or the teacher guide: each phase copies its sections from here
into the documentation, in the same PR as the code.

- Plan (Portuguese): [`grading-formulas.md`](grading-formulas.md), merged in
  PR 70. Miguel approved it on 17 Nov 2026, 15:25 ("aprovo o plano"), with
  the recommended option of every decision (section 16).
- Status: **approved design, not implemented**. A phase may refine a detail
  that turns out wrong while coding; it records the change in section 17 and
  in its handoff note, so later phases see it.
- Everything is **backward compatible**: a page without `data-formulas` and
  `data-rules` renders exactly as today (section 3.5). The four example pages
  (`examples/{edados-2526,ip-2526,pc-2627,pi-2526}`) keep working unchanged
  until G4 decides to edit them.
- **Never `eval`**, `Function` or any other way of running page text as
  code. Formulas are read by a small parser into a tree; the tree is the only
  thing that is evaluated.

Contents:

1. [Principles](#1-principles)
2. [Files, loading and budgets](#2-files-loading-and-budgets)
3. [HTML](#3-html)
4. [Formula language](#4-formula-language)
5. [Evaluation](#5-evaluation)
6. [Weights per formula](#6-weights-per-formula)
7. [Rendering](#7-rendering)
8. [Rules](#8-rules)
9. [Calculator](#9-calculator)
10. [Errors](#10-errors)
11. [Strings](#11-strings)
12. [Accessibility](#12-accessibility)
13. [Test cases](#13-test-cases)
14. [The courses in this scheme](#14-the-courses-in-this-scheme)
15. [Phases](#15-phases)
16. [Decisions](#16-decisions)
17. [Refinements made in later phases](#17-refinements-made-in-later-phases)

---

## 1. Principles

1. **HTML first (D1).** The assessment method lives in the page, written by
   the teacher as it appears on the course slide. It reads without
   JavaScript, and nothing has to be kept in sync with `course.js`.
2. **The formula is the source of truth.** Weights, the proportions bars, the
   table columns and the calculator are all derived from the same tree. The
   teacher never writes a weight twice.
3. **Small, safe language (D4).** Numbers, component codes, formula names,
   `+ - * /`, parentheses, `max` and `min`. Nothing else in v1.
4. **Fail visibly for the teacher, quietly for the student.** A formula the
   kit cannot read gives a console warning with its position, and the page
   shows the teacher's text as written, without weights or calculator. A
   student never sees a broken table or a wrong simulated grade.
5. **Same look as today.** One formula renders like the current component;
   several formulas add columns and bars, not a new layout.

## 2. Files, loading and budgets

### 2.1 Files (phase G1)

| File | What |
| --- | --- |
| `kit/src/grading/strings.js` | The `grading.*` strings (section 11), moved out of `kit/src/i18n/{pt,en}.js` and added with the same "only if not defined yet" call that `uc-search.js` uses (`kit/src/core/i18n.js`), so a site that overrides a string still wins. |
| `kit/src/grading/formula.js` | G2. Tokenizer, parser, evaluator, weight extraction, pretty printer. Exposed as `UC.internal.grading` for the unit tests. No DOM. |
| `kit/src/grading/element.js` | `<uc-grading>`, moved from `kit/src/components/uc-grading.js` (G1, unchanged), then extended (G2, G3). |
| `kit/src/core/modules.js` | G1. The generic lazy loader (2.2). |
| `kit/src/css/components/uc-grading.css` | **Stays in `uc-kit.css`.** It is 2.8 KB raw, under 1 KB gzipped, and keeping one stylesheet means no restyle when the module arrives. |
| `kit/v1/uc-grading.js` | Built from the new `grading` list of `kit/src/manifest.json`, with a source map, like `uc-search.js`. |

`loadScript` and the "folder of `uc-kit.js`" lookup move from
`kit/src/core/search-loader.js` into `kit/src/core/modules.js`, and the search
loader uses them from there (`UC.internal.loadScript`,
`UC.internal.kitUrl(file)`). No behaviour change for the search.

### 2.2 The loader

```js
// kit/src/core/modules.js (sketch)
const MODULES = { grading: { file: "uc-grading.js", tags: ["uc-grading"] } };
UC.internal.loadModule(name)   // → Promise, once per module; rejects on network error
UC.internal.modulesReady()     // → Promise for every module the page needed at start
```

- **When.** On `DOMContentLoaded` (or at once if already parsed), for each
  module, if `document.querySelector(tags)` finds an element, load the file.
  A `MutationObserver` on `document` (child list, subtree) catches elements
  added later by script; it disconnects once every module is loaded, or at
  once when no module exists for the page. The browser upgrades elements that
  are already in the page when `UC.define` runs in the module, so the order
  does not matter.
- **Where.** Next to `uc-kit.js`: the same URL resolution as `uc-search.js`
  (the `src` of the `uc-kit.js` script, else `document.baseURI`). Works on
  `file://` (a classic `<script>`, not `import()` or `fetch`).
- **Reveal.** `bootstrap.js` waits for `modulesReady()` together with the
  fonts, **inside the same 300 ms cap** (`FONT_WAIT_MS`), before it adds
  `uc-visible`. On a fast or cached load the grading block is drawn before
  the page shows, so there is no layout jump; on a slow one the page shows
  after 300 ms with the teacher's list, then the block replaces it.
- **Failure.** A network error or 404 gives one console warning,
  `[uc-kit] could not load uc-grading.js next to uc-kit.js. Copy the whole kit/v1 folder.`,
  and the teacher's list stays as the content (the no-JavaScript view).
  `modulesReady()` resolves anyway, so the page is never held back.
- **Twice.** The module starts with the usual `if (UC.__duplicate) return;`,
  and `UC.define` ignores a tag that is already defined.
- **Tests and core-tests.** Code that creates `<uc-grading>` and reads it
  straight away must `await UC.internal.loadModule("grading")` first.
  `scripts/check-a11y.mjs` and `scripts/check-pages.mjs` wait for
  `customElements.whenDefined("uc-grading")` on pages that have one.
- The same loader serves later heavy blocks: adding one is one line in
  `MODULES`, one list in the manifest and one budget line in `build.mjs`.

### 2.3 Budgets (gzip, `scripts/build.mjs`)

| File | Budget | Now | After |
| --- | --- | --- | --- |
| `uc-kit.js` | 48 KB (unchanged) | 47.0 KB (17 Nov, `main` at PR 70) | G1 must reach **≤ 45 KB** (about 44.3 expected) |
| `uc-grading.js` | **6 KB** (new) | — | G1 about 3 KB; G2 + G3 about 5.5 KB |
| `uc-search.js` | 6 KB (unchanged) | 5.0 KB | — |

`build.mjs` prints and checks the new budget, citing this section, like the
two existing ones. The plan's 46.8 KB figure was measured before the last
widgets merge; 47.0 KB is the measured value at the start of G0.

### 2.4 Who has to copy what

Sites that copy `kit/v1/` as a folder (the teacher guide's instruction) get
`uc-grading.js` with it. Sites that copied only `uc-kit.js` and `uc-kit.css`
would lose the decorated block (the list still shows). G1 adds a CHANGELOG
line under "Changed" and checks that `docs/pt/publicar.html`,
`docs/pt/novo-ano.html`, `template/README.txt` and `template/AGENTS.md` say
"the whole `kit/v1` folder" (they already do for `uc-search.js` and the
fonts; G1 only checks).

## 3. HTML

### 3.1 Element

```html
<uc-grading scale="20" calculator>
  <ul> … components … </ul>
  <ol data-formulas> … formulas … </ol>
  <ul data-rules> … rules … </ul>
  … any other content (shown after the table, as today) …
</uc-grading>
```

| Attribute | Values | Default | Notes |
| --- | --- | --- | --- |
| `scale` | number | `20` | Scale of the final grade, and default scale of each component. |
| `pass` | number | absent | Shortcut for the rule `RESULT >= pass` (3.4). |
| `result` | formula name | the last formula | Which formula is the final grade (5.2). |
| `calculator` | boolean | absent | Adds the grade simulation. |
| `no-formula` | boolean | absent | Hides the formula paragraphs (the descriptions stay). |
| `heading`, `heading-level` | as today | | |

The **components list** is the first direct `<ul>`/`<ol>` child that has
neither `data-formulas` nor `data-rules` (today: the first direct list). The
formulas list and the rules list are the first direct children with those
attributes; any extra one is ignored with a console warning. Order of the
three lists in the source does not matter.

### 3.2 Components

Unchanged item attributes: `data-code`, `data-scale`, `data-min`,
`data-bonus`, nested parts. Changes when a formulas list is present:

- **`<data>` on top-level items is not needed.** If present, its text is
  ignored for weights (the formula decides) and one console note says so
  once per element. `<data>` on **parts** still sets the parts' weights
  inside their parent (P = P1 + P2), as today.
- **Every top-level non-bonus item needs a `data-code`**, matching
  `[A-Za-z_][A-Za-z0-9_]*`, unique in the element, and not `max`/`min` (any
  case). Otherwise it is a formula error (section 10).
- Bonus items (`data-bonus`) are not written in formulas: they are added to
  the final result automatically (5.3). Naming one in a formula is an error.

### 3.3 Formulas

```html
<ol data-formulas>
  <li><code>A = 0.75*E + 0.2*P + 0.05*R</code></li>
  <li><code>B = 0.65*E + 0.3*P + 0.05*R</code></li>
  <li><code>CF = max(A; B)</code> Conta a fórmula mais favorável.</li>
</ol>
```

- One formula per `<li>`. The formula is the text of the item's **first
  `<code>` child** (leading whitespace allowed before it). Text and elements
  after the `<code>` are the description, shown under the formula.
- `NAME = expression` names the formula; the name follows the code rules of
  3.2 and must not repeat a component code or an earlier name. Without
  `NAME =`, the formula has no name, cannot be referenced, and is labelled
  with the localised "Nota"/"Grade" (as today).
- A formula may use component codes (top-level or parts) and the names of
  **earlier** formulas only. So there are no cycles by construction.
- An `<li>` without `<code>` is a formula error.

### 3.4 Rules

```html
<ul data-rules>
  <li><code>E >= 4.9</code> Exame com pelo menos 4,9 valores.</li>
  <li><code>CF >= 9.5</code></li>
  <li>Comparecer a pelo menos 2 dos 3 concursos.</li>
</ul>
```

- With a first `<code>` child: a **checked rule**, `expression comparison
  expression` (4.3). The rest of the item is its description. Without a
  description, the kit writes the condition in words (7.4).
- Without `<code>`: a **text rule**, shown in the list and marked "não
  verificado" by the calculator.
- `RESULT` is the name of the final grade when the result formula has no
  name (`RESULT >= 9.5`); it also works when it has one.
- **Shortcuts.** `data-min="4.9"` on an item is the rule `CODE >= 4.9`;
  `pass="9.5"` on the element is `RESULT >= 9.5`. Shortcut rules come first,
  in component order then `pass`, before the written rules. A written rule
  with the same normalised text as a shortcut (`E>=4.9` = `E >= 4,9`) is not
  added twice.
- A rules list without a formulas list is valid (the PC case: weights from
  `<data>`, one text rule).

### 3.5 Legacy mode

Without a formulas list the element works exactly as today: weights from
`<data>`, generated formula "Nota = 0,1 × A + …", one Weight column, one bar.
Test: the ARIA snapshot `tests/pages/uc-grading.aria.yml` and the
`core-tests.js` cases do not change in G1, G2 or G3, and the four example
pages produce the same DOM (checked by `check-pages`). With only a rules
list, the table and formula stay legacy and the rules list (7.4) is added.

## 4. Formula language

### 4.1 Tokens

| Token | Accepted | Notes |
| --- | --- | --- |
| number | `0.75`, `0,75`, `14` (not `.5`) | `\d+([.,]\d+)?`. A comma **directly between two digits** is a decimal mark; any other comma is an argument separator. No exponent, no leading dot, no thousands separator. |
| name | `E`, `AP`, `T1`, `CF`, `RESULT` | `[A-Za-z_][A-Za-z0-9_]*`. Case-sensitive, except the functions. |
| function | `max`, `min` | Any case (`Max(` as on the slide). Must be followed by `(`. |
| operator | `+`, `-`, `*`, `/` | Also `×` and `·` for `*`, `−` (U+2212) for `-`. |
| separator | `;` | And a comma that is not a decimal mark (`max(A, B)`, `max(A,B)`). |
| comparison | `>=`, `>`, `<=`, `<`, `=` | Also `≥`, `≤`. Rules only. In a formula, `=` only after the name. |
| parentheses | `(`, `)` | |
| space | any Unicode whitespace, incl. no-break space | Ignored between tokens. |

Anything else is an error ("unexpected character"). Formula text is limited
to 500 characters and nesting to 32 levels, both errors when exceeded.

The comma rule has one sharp edge, documented in the guide (G4):
`max(1,5)` is **one** argument, 1.5, and therefore an error ("max needs at
least two arguments"); write `max(1; 5)`.

### 4.2 Grammar

```
formula    = [ name "=" ] expression
rule       = expression comparison expression
expression = term { ( "+" | "-" ) term }
term       = unary { ( "*" | "/" ) unary }
unary      = "-" unary | primary
primary    = number | name | call | "(" expression ")"
call       = ( "max" | "min" ) "(" expression separator expression { separator expression } ")"
```

Standard precedence and left associativity. A recursive descent parser
produces the tree:

```js
{ type: "number", value }                 // 0.75
{ type: "name", name }                    // "E"
{ type: "neg", arg }
{ type: "+"|"-"|"*"|"/", left, right }
{ type: "max"|"min", args: [ … ] }        // ≥ 2 args
// rule: { op: ">="|">"|"<="|"<"|"=", left, right }
```

Each node keeps `start` (0-based character offset in the `<code>` text) for
error messages.

### 4.3 Comparisons

Exactly one comparison per rule. Every comparison uses a tolerance of
`1e-9`, so floating-point noise never flips a rule: `a >= b` is
`a > b - 1e-9`, `a = b` is `|a - b| <= 1e-9`, and so on. `≥` is the same
token as `>=`.

## 5. Evaluation

### 5.1 Values

- A component's value is the number entered for it, on its own scale
  (`data-scale`, else the element's `scale`). A parent with parts has the
  weighted mean of its parts on its own scale, as today (`gradeOf`).
- A formula's value is its tree evaluated with component values and earlier
  formula values. Intermediate formulas are **not** clamped.
- Division by a value that is 0 makes the result undefined; the calculator
  says "Não é possível calcular a nota com estes valores." A literal `/ 0` is
  a parse-time error.

### 5.2 Result

The result formula is the one named by `result`, else the last formula. A
`result` that names no formula is an error. Formulas after the result are
allowed (they are shown, and usable in rules).

### 5.3 Final grade

`final = clamp(result + Σ bonus, 0, scale)`. Same as today, where the sum is
capped at `scale`; the new lower bound only matters for formulas with `-`.

### 5.4 Rules

A checked rule is true, false or undefined (a division by zero). Values are
**not rounded** before checking: 9.45 fails `CF >= 9.5` even though it would
display as "9,5". (SIGARRA rounds the official grade; the disclaimer already
says the simulation is not official. If a course needs rounding, it is a
v2 function, D4.)

## 6. Weights per formula

The table and bars need a weight per component. They come from the result
formula with named formulas substituted in (a copy of the tree).

- **Linear expression**: built only from numbers, names, `neg`, `+`, `-`,
  `* ` with at least one side constant, and `/` by a constant. It normalises
  to `c0 + Σ ci × codei`.
- **Branches**: if the result is `max`/`min` (flattening nested calls of the
  **same** function), its arguments are the branches; otherwise the whole
  result is one branch.
- If **every** branch is linear, each branch gives a column: the weight of
  component *i* is `ci × scale_i` points on the final scale, and the share is
  that over `scale` ("4 valores · 20 %"). A component with coefficient 0 shows
  "—". The constant `c0` is not shown in the table (it stays in the formula
  text).
- If any branch is not linear (a product of two codes, `max` inside a sum,
  mixed `max`/`min`), there are **no weight columns and no bars**: the table
  shows Component and Minimum only. The formula and the calculator still
  work.
- **Column names**: a branch that is just the name of a formula uses that
  name (`CF = max(A; B)` → "A", "B"); otherwise "Fórmula 1", "Fórmula 2", ….
  One branch: the column is "Peso", as today.
- **Parts**: a part's row shows its share inside its parent ("15 % (30 % de
  CE)") in every column, multiplied by the parent's share in that column.

## 7. Rendering

In order, inside the section (as today): heading, formula block, bars, table,
rules list, calculator, the other children.

### 7.1 Formula block

One `<p class="uc-grading__formula">` per formula, pretty-printed from the
tree, followed by the item's description (if any) in a
`<p class="uc-grading__note">` (new class, small, muted). `no-formula` hides
the formula paragraphs only.

Pretty printing:

| | pt | en |
| --- | --- | --- |
| Numbers | `Intl.NumberFormat(UC.lang)`, up to 3 decimals: `0,75` | `0.75` |
| `*` | ` × ` | ` × ` |
| `/`, `+`, `-` | spaced: ` / `, ` + `, ` − ` | same |
| `max`, `min` | `<abbr title="máximo">máx</abbr>`, `<abbr title="mínimo">mín</abbr>` | `max`, `min` (no `abbr`) |
| Separator | `; ` | `, ` |
| Unnamed | `Nota = …` | `Grade = …` |

Parentheses are printed only where precedence needs them. So
`CF = max(0.75*E + 0.2*P + 0.05*R; 0.65*E + 0.3*P + 0.05*R)` prints in pt as
`CF = máx(0,75 × E + 0,2 × P + 0,05 × R; 0,65 × E + 0,3 × P + 0,05 × R)`.

### 7.2 Bars

One bar per weight column, `aria-hidden="true"` on the group (as today: the
table says the same). With two or more columns each bar has a small visible
label before it ("Fórmula 1" / "A"), class `uc-grading__bar-label`. Segment
widths are the shares in that column; components with weight 0 have no
segment.

### 7.3 Table

Columns: Component, one weight column per branch, Minimum. The
`<th scope="col">` of each weight column has an `aria-describedby` pointing
at its formula paragraph when the branch is a named formula, so screen
readers hear what "A" means. The Minimum column shows rules of the form
`CODE >= number` or `CODE > number` on a component (incl. `data-min`): "4,9
em 20". Other rules are only in the rules list.

### 7.4 Rules list

`<p><strong>Para aprovar</strong></p>` then a `<ul class="uc-grading__rules">`
(new class), one `<li>` per rule, shortcuts included. A checked rule shows its
condition pretty-printed (`<span class="uc-mono">E ≥ 4,9</span>`), then the
description if any. A text rule shows its content as written. Shown only when
there is at least one rule, and in legacy mode too when a rules list exists.
**In pure legacy mode (no lists) nothing changes:** `data-min` and `pass`
keep their current rendering.

### 7.5 Fallback (formula error)

The formulas list's items render as written (the `<code>` text, in mono, and
the description), no bars, no weight columns, no calculator. The rules list
renders as text (conditions as written). The table keeps Component and
Minimum. One console warning per error (section 10).

## 8. Rules

Covered by 3.4, 5.4 and 7.4. Additions:

- Names in rules: component codes, part codes, formula names, `RESULT`.
- A rule that does not parse makes **that rule** a text rule (its `<code>`
  shown as written) with a console warning; it does not switch the whole
  element to fallback.

## 9. Calculator

Built in G3. Same fieldset, fields, validation and messages as today (one
field per leaf and per bonus item, comma or dot, range 0 to the component's
scale, empty bonus = 0). The output becomes:

```
Fórmula 1: 12,6 · Fórmula 2: 13,1           (only with ≥ 2 branches)
Nota final (CF): 13,1 valores (conta a Fórmula 2)
✓ E ≥ 4,9 · ✓ CF ≥ 9,5 · não verificado: Comparecer a 2 dos 3 concursos
Aprovado nesta simulação.
Simulação. A nota oficial é a publicada no SIGARRA.
```

- "conta a …": the branch whose value equals the result; on a tie, the first.
  Not shown with one branch or when branches are not linear.
- Each checked rule: "✓" / "✗" **and** the words in the accessible text
  ("cumprido" / "não cumprido", visually hidden), never colour alone.
- State line: all checked rules true and no text rules → "Aprovado nesta
  simulação."; all true and some text rules → "Aprovado nesta simulação, se
  cumprires os requisitos não verificados."; any false → "Não aprovado nesta
  simulação." followed by the first failing rule ("Abaixo do mínimo: E ≥
  4,9"); undefined → the 5.1 message.
- Without any rule (no `pass`, no `data-min`, no list): only the result line,
  as today.
- One announcement 300 ms after typing stops, of the result line and the
  state line (not every rule).
- Legacy mode keeps today's exact strings (`belowMin`, `belowPass`, `pass`).

## 10. Errors

Console only, English, prefixed `[uc-kit] uc-grading:`, with the formula or
rule number (1-based, in its list) and the 1-based column:

| Case | Message (after the prefix) |
| --- | --- |
| Unknown character | `formula 1, column 9: unexpected "&".` |
| Unknown name | `formula 1, column 14: unknown name "X". Known: P, R, E, A.` |
| Name used before its formula | `formula 1, column 5: "B" is defined later; a formula can only use earlier ones.` |
| Bonus in a formula | `formula 2, column 3: "B" is a bonus; it is added to the result automatically.` |
| Missing `)` / extra `)` | `formula 1, column 40: expected ")".` / `unexpected ")".` |
| Too few arguments | `formula 1, column 4: max needs at least two arguments (did you mean ";" instead of ","?).` |
| Function not supported | `formula 1, column 1: unknown function "round". Only max and min.` |
| Ends early | `formula 1, column 22: the formula ends too early.` |
| Comparison in a formula | `formula 1, column 3: comparisons belong in data-rules.` |
| Rule without one comparison | `rule 2: a rule needs exactly one comparison (>=, >, <=, <, =).` |
| Duplicate or invalid name | `formula 2: "E" is already a component code.` |
| Missing code | `component 3 has no data-code; formulas need one on every component.` |
| `result` unknown | `result="CF" names no formula.` |
| Division by literal zero | `formula 1, column 12: division by 0.` |
| Too long / too deep | `formula 1: longer than 500 characters.` / `nested too deeply.` |
| `<li>` without `<code>` | `formula 3 has no <code>.` |

## 11. Strings

New keys in `kit/src/grading/strings.js` (existing `grading.*` keys move
there unchanged):

| Key | pt | en |
| --- | --- | --- |
| `grading.formulaN` | `Fórmula {n}` | `Formula {n}` |
| `grading.max` / `grading.maxTitle` | `máx` / `máximo` | `max` / `maximum` |
| `grading.min` / `grading.minTitle` | `mín` / `mínimo` | `min` / `minimum` |
| `grading.rules` | `Para aprovar` | `To pass` |
| `grading.calculator.branch` | `{name}: {grade}` | `{name}: {grade}` |
| `grading.calculator.resultNamed` | `Nota final ({name}): {grade} valores` | `Final grade ({name}): {grade} points` |
| `grading.calculator.counts` | `conta a {name}` | `{name} counts` |
| `grading.calculator.ruleMet` / `ruleFailed` | `cumprido` / `não cumprido` | `met` / `not met` |
| `grading.calculator.unchecked` | `não verificado` | `not checked` |
| `grading.calculator.passRules` | `Aprovado nesta simulação.` | `Pass in this simulation.` |
| `grading.calculator.passIf` | `Aprovado nesta simulação, se cumprires os requisitos não verificados.` | `Pass in this simulation, if you meet the requirements not checked.` |
| `grading.calculator.fail` | `Não aprovado nesta simulação.` | `Not a pass in this simulation.` |
| `grading.calculator.failRule` | `Abaixo do mínimo: {rule}` | `Below the minimum: {rule}` |
| `grading.calculator.undefined` | `Não é possível calcular a nota com estes valores.` | `The grade cannot be calculated with these values.` |

The current `grading.calculator.result` ("Nota final: {grade} valores") is
used when the result formula has no name.

## 12. Accessibility

WCAG 2.1 AA, checked by `scripts/check-a11y.mjs` (axe and ARIA snapshot).

- Formulas are text in `<p>`; `máx`/`mín` in `<abbr title>`; `×` and `−` are
  read correctly by NVDA, JAWS and VoiceOver (checked on the IP page today).
- Table: visually hidden `<caption>`, `<th scope="col">` and
  `<th scope="row">`; weight column headings linked to their formula
  (7.3).
- Bars `aria-hidden`; their visible labels repeat what the column headings
  say.
- Rules and calculator: ✓/✗ with words, never colour alone; `<fieldset>` and
  `<legend>`; `inputmode="decimal"`; errors linked with `aria-describedby`
  and `aria-invalid`; result in an `<output>`; one announcement.
- Contrast: new classes use existing tokens (`--uc-muted` passes 4.5:1).
- Reflow at 320 px: the table is inside `.uc-table` (horizontal scroll inside
  the box, not the page), as today; with three weight columns the minimum
  table width must still fit `.uc-table`'s scroll, not the page.
- No JavaScript: the three lists as written, formulas and rules in `<code>`.
- New snapshot in G2: `tests/pages/uc-grading.aria.yml` gains a second case,
  the EDados 2026/27 page (`#edados-2627`); G3 adds the calculator after
  input, like the existing `check-a11y` calculator check.

## 13. Test cases

G2 turns these tables into `core-tests.js` cases (the parser has no DOM, so
they run in the existing core test page). "pt" is the printed form with
`UC.lang = "pt"`.

### 13.1 Formulas that parse

| # | Input (`<code>`) | Tree / printed (pt) |
| --- | --- | --- |
| F1 | `CF = max(0.75*E + 0.2*P + 0.05*R; 0.65*E + 0.3*P + 0.05*R)` | `CF = máx(0,75 × E + 0,2 × P + 0,05 × R; 0,65 × E + 0,3 × P + 0,05 × R)` |
| F2 | `CF = Max(0,75*E + 0,2*P + 0,05*R ; 0,65*E + 0,3*P + 0,05*R)` | same tree as F1 (capital `Max`, decimal commas, space before `;`) |
| F3 | `CF = max(0.75*E+0.2*P+0.05*R, 0.65*E+0.3*P+0.05*R)` | same tree as F1 (`, ` separator) |
| F4 | `CF = (0.7*EX + 0.25*PA + 0.05*WP) / 5` | `CF = (0,7 × EX + 0,25 × PA + 0,05 × WP) / 5` |
| F5 | `A = 0.75*E + 0.2*P + 0.05*R` · `B = 0.65*E + 0.3*P + 0.05*R` · `CF = max(A; B)` | three formulas; `CF = máx(A; B)` |
| F6 | `0.1*A + 0.2*T1 + 0.2*T2 + 0.5*E` | unnamed; `Nota = 0,1 × A + 0,2 × T1 + 0,2 × T2 + 0,5 × E` |
| F7 | `CF = 0,75 × E + 0,2 · P + 0,05*R` | `×` and `·` as `*` |
| F8 | `CF = min(E; max(P; R))` | nested calls; parses (no weight columns, 6) |
| F9 | `CF = -1 + E − 0.5*(P - R)` | `neg`, U+2212; printed `CF = −1 + E − 0,5 × (P − R)` |
| F10 | `CF = E * P / 20` | parses (not linear: no weight columns) |
| F11 | `CF = max(E;P;R)` | three arguments |

### 13.2 Formulas that do not parse

Components P, R, E unless stated. Message per section 10.

| # | Input | Error at |
| --- | --- | --- |
| X1 | `CF = 0.75*E + 0.2*X` | column 19, unknown name "X" |
| X2 | `CF = max(0.75*E + 0.2*P` | end, expected ")" |
| X3 | `CF = E + P)` | column 11, unexpected ")" |
| X4 | `CF = max(1,5)` | max needs at least two arguments |
| X5 | `CF = round(E)` | unknown function "round" |
| X6 | `CF = E +` | the formula ends too early |
| X7 | `CF = E & P` | unexpected "&" |
| X8 | `CF = E >= 4.9` | comparisons belong in data-rules |
| X9 | `E = 0.5*P` | "E" is already a component code |
| X10 | `CF = max(A; B)` then `A = …` | "A" is defined later |
| X11 | `CF = E / 0` | column 10, division by 0 |
| X12 | `CF = .5*E` | unexpected "." |
| X13 | `CF = 0.9*E + B` (B is `data-bonus`) | "B" is a bonus |
| X14 | `CF = max(E)` | max needs at least two arguments |
| X15 | 33 nested parentheses | nested too deeply |
| X16 | `CF = E + P` with `result="NF"` | `result="NF"` names no formula |

### 13.3 Evaluation

EDados 2026/27 (F1, scale 20; rules `E >= 4.9`, `CF >= 9.5`):

| P | R | E | Branch 1 | Branch 2 | CF | Counts | Rules | State |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 14 | 20 | 12 | 12.8 | 13.0 | 13.0 | Fórmula 2 | ✓ ✓ | pass |
| 10 | 20 | 14 | 13.5 | 13.1 | 13.5 | Fórmula 1 | ✓ ✓ | pass |
| 20 | 20 | 4 | 8.0 | 9.6 | 9.6 | Fórmula 2 | ✗ ✓ | fail, E ≥ 4,9 |
| 8 | 10 | 10 | 9.6 | 9.4 | 9.6 | Fórmula 1 | ✓ ✓ | pass |
| 8 | 0 | 10 | 9.1 | 8.9 | 9.1 | Fórmula 1 | ✓ ✗ | fail, CF ≥ 9,5 |
| 10 | 10 | 10 | 10.0 | 10.0 | 10.0 | Fórmula 1 (tie) | ✓ ✓ | pass |
| 0 | 0 | 0 | 0 | 0 | 0 | Fórmula 1 | ✗ ✗ | fail, E ≥ 4,9 |
| 20 | 20 | 20 | 20 | 20 | 20 | Fórmula 1 | ✓ ✓ | pass |

PI literal (F4, EX/PA/WP on 0–100, scale 20; rules `0.7*EX/5 >= 4.9`,
`CF >= 9.5`):

| EX | PA | WP | CF | `0.7*EX/5` | State |
| --- | --- | --- | --- | --- | --- |
| 50 | 80 | 100 | 12.0 | 7.0 | pass |
| 35 | 100 | 100 | 10.9 | 4.9 | pass (4.9 ≥ 4.9, needs the tolerance of 4.3) |
| 34 | 100 | 100 | 10.76 | 4.76 | fail, first rule |
| 60 | 0 | 0 | 8.4 | 8.4 | fail, CF ≥ 9,5 |

Clamp and bonus (PC style, legacy weights SI 25 % / CE 50 % / PDC 25 %,
bonus `10%` of 20 = 2): SI = CE = PDC = 20, B = 2 → 20 (capped). SI = CE =
PDC = 10, B = 2 → 12.

Division by zero: `CF = E / P` with P = 0 → undefined, message 5.1.

### 13.4 Weights

| Formula (scale) | Components (scale) | Columns |
| --- | --- | --- |
| F1 (20) | P, R, E (20) | "Fórmula 1": P 4 · 20 %, R 1 · 5 %, E 15 · 75 %; "Fórmula 2": P 6 · 30 %, R 1 · 5 %, E 13 · 65 % |
| F5 (20) | same | columns named "A" and "B", same values as F1 |
| F4 (20) | EX, PA, WP (100) | one column "Peso": EX 14 · 70 %, PA 5 · 25 %, WP 1 · 5 % |
| F6 (20) | A, T1, T2, E (20) | one column: 2 · 10 %, 4 · 20 %, 4 · 20 %, 10 · 50 % |
| F8, F10 | — | no weight columns, no bars |
| `CF = max(E; P) + R` | — | no weight columns (max inside a sum) |
| `CF = max(0.5*E + 0.5*P; E)` | P, E (20) | "Fórmula 1": E 10 · 50 %, P 10 · 50 %; "Fórmula 2": E 20 · 100 %, P "—" |

### 13.5 Rules

| Rule | Result |
| --- | --- |
| `E >= 4.9` | checked; Minimum column "4,9 em 20" |
| `E ≥ 4,9` | same as above (and not duplicated with `data-min="4.9"`) |
| `CF >= 9.5` | checked; not in Minimum column (CF is not a component) |
| `0.7*EX/5 >= 4.9` | checked; not in Minimum column |
| `RESULT >= 9.5` with unnamed result | checked; printed `Nota ≥ 9,5` |
| text "Comparecer a 2 dos 3 concursos." | text rule; "não verificado" |
| `E >= 4.9 >= 2` | invalid → text rule + warning |
| `E` | invalid (no comparison) → text rule + warning |
| `pass="9.5"` + no list | legacy rendering, unchanged |
| `pass="9.5"` + `data-rules` | shortcut `RESULT >= 9.5` first in the list |

## 14. The courses in this scheme

- **EDados 2026/27** (new page, G4): plan section 3.1, components P, R, E on
  0–20, F1, rules `E >= 4.9` and `CF >= 9.5`. Per the coordinator's note the
  page uses **4.9** as on the slide, with an HTML comment above the rule:
  `<!-- Mínimo do exame: 4,9 como no diapositivo. A confirmar com o professor (35 % de 20 seriam 7). -->`.
  D6 stays open for the professor and blocks nothing.
- **PI 2025/26** (D3, G4): rewritten with the literal formula, plan section 4
  and test 13.3.
- **PC 2026/27** (G4): legacy weights unchanged, plus a rules list with the
  text rule "Participar em pelo menos 2 dos 3 concursos. Caso contrário, RFC
  (falta de componente)."
- **IP 2025/26** and **EDados 2025/26**: no change.

## 15. Phases

Each in a new thread, one PR merged with green CI (4 shards + `check`), a
`docs/plan/grading-phase-N-handoff.md`, fetch and rebase on `main` right
before merging.

| Phase | Scope | Done when |
| --- | --- | --- |
| G0 | This contract. | Merged. |
| G1 | `core/modules.js` (2.2), `uc-grading` moved to `kit/v1/uc-grading.js` with its strings, **no behaviour change**; budget line in `build.mjs`; tests and a11y checks wait for the module; CHANGELOG "Changed"; the "whole `kit/v1` folder" check (2.4). | Existing grading tests, ARIA snapshot and the four example pages unchanged; `uc-kit.js` ≤ 45 KB; `uc-grading.js` ≤ 6 KB. |
| G2 | `grading/formula.js` (4, 5, 6), lists (3.3, 3.4), rendering (7), errors (10), strings (11) minus calculator strings. | 13.1, 13.2, 13.4, 13.5 as unit tests; EDados 2026/27 ARIA snapshot; axe clean. |
| G3 | Calculator (9). | 13.3 as tests; one announcement; check-a11y calculator check on the new case. |
| G4 | Docs and examples: guide `docs/pt/componentes/uc-grading.html` (PT first), `docs/api.md` 3.6 (EN), demos, `llms.txt` / `llms-full.txt` (via `npm run build`), `template/AGENTS.md`; examples (section 14). | `check-docs`, `check-pages`, links green. |

## 16. Decisions

Approved by Miguel on 17 Nov 2026, 15:25, with the recommended options.

| # | Decision | Taken |
| --- | --- | --- |
| D1 | Where the method lives | **In the page HTML.** `source="course"` (plan 3.4) is not built; the internal model (components, formulas, rules) is kept DOM-free so it can be added later without changes. |
| D2 | Separate module | **Yes**, lazily loaded `kit/v1/uc-grading.js`, 6 KB budget (section 2). |
| D3 | PI with the literal formula | **Yes**, in G4 (section 14). |
| D4 | Functions in v1 | **Only `max` and `min`.** `round`, `if`, "best of N" wait until a course needs them. |
| D5 | Alternative regimes (e.g. grade improvement, exam only) | **Out of v1.** Written as text after the element. A later version could allow several formulas lists with `data-label`. |
| D6 | EDados 26/27 exam minimum: 4.9 on 20 or 35 % (7)? | **Open**, for the professor. Does not block: G4 writes 4.9 with an HTML comment (section 14); either value is one edit. |

Details decided in G0 (beyond the plan):

1. The CSS stays in `uc-kit.css` (2.1).
2. The loader waits inside the existing 300 ms font cap (2.2).
3. Component codes are case-sensitive; `max`/`min` are not, and cannot be
   codes (3.2, 4.1).
4. A comma between digits is a decimal mark, any other comma separates
   arguments; `max(1,5)` is an error with a hint (4.1).
5. Formulas may only reference earlier formulas (no cycles, 3.3).
6. Intermediate formulas are not clamped; the final grade is clamped to
   `[0, scale]` after the bonus (5.3).
7. Rules are checked on unrounded values (5.4).
8. Weight columns are all-or-nothing: shown only when every branch is
   linear (6).
9. A broken rule degrades to a text rule; a broken formula switches the
   element to the fallback (7.5, 8).
10. `RESULT` names the final grade in rules (3.4).
11. Legacy pages produce the same DOM in every phase (3.5).

## 17. Refinements made in later phases

None yet. Each phase adds a subsection here when it changes a detail above.
