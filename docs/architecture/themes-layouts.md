# Themes with a layout — design contract

Contract of the kit 1.2.0 work "temas com layout": a theme can choose the
layout of `<uc-page>` (and later a few component variants), each theme and
each new layout is a separate file downloaded only when a page uses it, and
a site can register its own layout on top of one of the kit's.

Plan (Portuguese, with the prototypes): https://claude.ai/artifact/GxwwMHZKYLHgCkiMLBNX4i.
It runs in phases L0–L8, one pull request each. Every phase updates this file
(section 10 lists what each phase added) and the public contract
[`docs/api.md`](../api.md), which wins when the two differ. Code comments cite
this file by section number: keep the numbers stable.

Status: **L0, L1 and L2 done** (mechanism; layout `banner` and theme
`institutional`; layout `docs` and theme `handbook`). Sections marked
*(planned, Ln)* describe what a later phase adds; until then the kit does
not know those names.

## 1. Rules

1. **A theme is chosen; the default is already chosen.** `template/course.js`
   ships with `theme: "classic"`. Without `theme` the kit behaves as
   `classic`, which is the look of 1.1.0, so existing sites do not change.
2. **Only the chosen theme is downloaded.** `uc-kit.css` keeps the default
   theme and the layouts `sidebar`, `top` and `full`. Every other theme is a
   file of `kit/v1/themes/`, every other layout a file of `kit/v1/layouts/`.
3. **A theme picks a layout, but the site always wins** (section 2).
4. **Layouts and themes are separate pieces.** A layout works without a
   theme (`<uc-page layout="docs">`), and the token themes of 1.1.0
   (`compact`, `serif`, `high-contrast`) combine with any theme:
   `theme: ["institutional", "high-contrast"]`.
5. Code, file names, classes and properties are in English; the documentation
   and the customiser use Portuguese names (Clássico, Moderno, Institucional,
   Manual, Editorial).

## 2. Precedence of the layout

`<uc-page>` takes the first valid value of:

| Order | Where | Example |
| --- | --- | --- |
| 1 | The page's attribute | `<uc-page layout="top">` |
| 2 | `course.js` | `layout: "top"` |
| 3 | CSS: `--uc-layout` on `:root` (a theme with a layout, then the site's `theme.css`, which loads later and wins) | `--uc-layout: banner;` |
| 4 | Default | `sidebar` |

A value that is not a known layout (kit or site layout, section 6), or whose
style sheet failed to load, is skipped with one console warning and the next
level decides. Names in `course.js` are kept as written
(`UC.course.layout`), because a site layout may be registered after the kit
reads `course.js`; they are checked when a page is drawn. Unknown-name
warnings are only printed once the page has finished loading (section 4), so a
layout registered by a script after the kit is never reported.

`core/layouts.js` implements it: `UC.internal.layouts.resolve(page)`.

## 3. Files

| Source | Built (minified, no source map) | Listed in | Loaded |
| --- | --- | --- | --- |
| `kit/src/themes/<name>.css` | `kit/v1/themes/<name>.css` | `THEMES` in `kit/src/core/themes.js` | By `theme` in `course.js`, or a `<link>` |
| `kit/src/layouts/<name>.css` | `kit/v1/layouts/<name>.css` | `FILE_LAYOUTS` in `kit/src/core/layouts.js` | By the theme's `@import`, or by the kit when the attribute or `course.js` names it |

`scripts/themes.mjs` builds both and **fails the build** when:

- `THEMES` and the files of `kit/src/themes/` differ;
- `FILE_LAYOUTS` and the files of `kit/src/layouts/` differ;
- a theme of `LAYOUT_THEMES` does not declare `--uc-layout`;
- a theme's `@import` is not `"../layouts/<name>.css"` with an existing layout
  file;
- a layout file does not declare `--uc-layout-<name>-loaded: 1` on `:root`
  (section 4). The import is kept relative as written, so it works from
  `kit/v1/`, a frozen `kit/vX.Y.Z/` and a copied folder alike.

Every rule of a layout file is wrapped in `:where()` and scoped to
`.uc-page--<name>`, like the rest of the kit, so the site's `theme.css` wins.

## 4. Loading cycle

1. `core/themes.js` (when the kit script runs) adds the `<link>` of each theme
   of `course.js` after `uc-kit.css`, except `classic` (section 5.1) and themes
   the page already links.
2. Each `<uc-page>` resolves its layout at every render. When it names a file
   layout or a site layout with a style sheet, `UC.internal.layouts.load()`
   adds that `<link>` after the kit's and the themes' links (before the site's
   `theme.css`, which still wins). A kit layout file that is already there
   (imported by a theme) is not linked again: every layout file sets
   `--uc-layout-<name>-loaded: 1` on `:root`, and the kit looks for it. So the
   layout of a theme keeps its place in the cascade, right where the theme is.
3. `UC.internal.layoutsReady()` waits for the themes and for the document to be
   parsed (so scripts after the kit, which may call `UC.registerLayout`, have
   run), then loads what the CSS level (`--uc-layout`) and the pages ask for,
   repeating until nothing new is loading. Then it **keeps** the values of the
   choice properties (section 5.3): the kit reads each one once. Then it draws
   again the pages whose resolved layout changed (a theme's `--uc-layout`
   arrived).
4. `core/bootstrap.js` shows the page after `layoutsReady()`, the fonts and the
   lazily loaded modules, all under the same **300 ms** cap as before. A slow
   file shows the page with what is there and draws it again when it arrives.

A style sheet that fails to load is reported once (`could not load the layout
style sheet …`) and its layout counts as unknown (section 2), so the page falls
back to the next level, in the end `sidebar` with the kit's colours. Nothing
breaks.

## 5. Themes

### 5.1 Two kinds

| Kind | List | What it may change |
| --- | --- | --- |
| Theme with a layout | `LAYOUT_THEMES` in `core/themes.js` | `--uc-layout`, the choice properties (5.3), tokens, and decoration of stable classes scoped to its layout |
| Token theme | the rest of `THEMES` | tokens only (`docs/api.md` 8.1); never a choice property |

A list may hold **one** theme with a layout: the last one wins, the others are
not loaded, and the console says so. Token themes are added in the order
given.

`classic` is the kit's own look, already in `uc-kit.css`; its file only
declares `--uc-layout: sidebar` so the name can be linked and listed. Naming
it in `course.js` downloads nothing.

| Theme | Name in the docs | Layout | Phase |
| --- | --- | --- | --- |
| `classic` | Clássico | `sidebar` | L0 |
| `institutional` | Institucional | `banner` | L1 |
| `handbook` | Manual | `docs` | L2 |
| `editorial` | Editorial | `centered` | *(planned, L3)* |
| `modern` | Moderno | `top` | *(planned, L3)* |

### 5.2 Shape of a theme with a layout

```css
/* kit/src/themes/institutional.css */
@import "../layouts/banner.css";
:root {
  --uc-layout: banner;
  /* choice properties (5.3) and tokens */
}
:where(.uc-page--banner .uc-nav__link[aria-current="page"]) { … }
```

### 5.3 Choice properties

Custom properties on `:root` that the kit's JavaScript reads once
(`UC.internal.themeValue(name)` reads `--uc-<name>`, quotes removed, `""`
when unset). They are not tokens: no CSS uses them, and `uc-kit.css` does not
define them.

| Property | Values | Read by | Phase |
| --- | --- | --- | --- |
| `--uc-layout` | a layout name | `<uc-page>` (section 2, level 3) | L0 |
| `--uc-hero-align` | `start` \| `center` | `<uc-hero>` | *(planned, L6)* |
| `--uc-weeks-view` | `list` \| `compact` | `<uc-weeks>` without `view` | *(planned, L6)* |
| `--uc-team-view` | `cards` \| `table` | `<uc-team>` without `view` | *(planned, L6)* |

A component attribute always wins over a choice property.

## 6. Layouts

| Value | File | Structure | Classes | Phase |
| --- | --- | --- | --- | --- |
| `sidebar` | `uc-kit.css` | Navigation on the left | none (default) | 1.0 |
| `top` | `uc-kit.css` | Navigation in a bar under the header | `.uc-page--top`, `.uc-topnav` | 1.1 |
| `full` | `uc-kit.css` | No navigation | `.uc-page--full` | 1.0 |
| `banner` | `layouts/banner.css` | Band in the course colour with the header, the first `<uc-hero>` and tabs (6.1) | `.uc-page--banner`, `.uc-banner`, `.uc-banner__inner`, `.uc-banner__hero` | L1 |
| `docs` | `layouts/docs.css` | Navigation, content, "Nesta página" (6.2) | `.uc-page--docs`, `.uc-toc`, `.uc-toc-toggle`, `.uc-toc__nav`, `.uc-toc__list`, `.uc-toc__item`, `.uc-toc__link` | L2 |
| `centered` | `layouts/centered.css` | Centred header and navigation, reading column `--uc-reading-max` | `.uc-page--centered` | *(planned, L3)* |
| `panel` | `layouts/panel.css` | Full-height bar with name, search, navigation and timetable; no header | `.uc-page--panel`, `.uc-panel__brand`, `.uc-panel__info` | *(planned, L4)* |
| `aside` | `layouts/aside.css` | Navigation, content and blocks on the right on every page | `.uc-page--aside`, `.uc-aside` | *(planned, L4)* |
| `onepage` | `layouts/onepage.css` | Sticky bar with the page's sections, then the other pages | `.uc-page--onepage`, `.uc-anchors` | *(planned, L5)* |

Every layout keeps the skip link, one `header`/`nav`/`main`/`footer`, one `h1`
and `aria-current`; prints like `full`; below 960 px has a menu button or a
scrolling bar. `<uc-page>` gets `.uc-page--<layout>` for every layout but
`sidebar` (so the pages of 1.1.0 keep their exact DOM).

### 6.1 banner

```
.uc-skip-link
.uc-banner                      background --uc-color-accent-strong
  .uc-header                    (the usual header, light text and buttons)
  .uc-banner__inner             max-width --uc-content-max
    .uc-banner__hero > uc-hero  only when the page has one (see below)
    .uc-sidebar                 toggle + nav.uc-nav: tabs, the current one white
.uc-shell > main.uc-main        one column
.uc-footer
```

- The hero is the first `<uc-hero>` that is a direct child of `<uc-page>`
  (so of `<main>`). It is **moved**, not copied, so the page keeps one `h1`;
  a comment keeps its place in `<main>`, and it goes back there when the page
  is drawn with another layout (`uc-page.js`, `placeHero`). Without one the
  band has only the header and the tabs.
- Light colours on the band are local properties of `.uc-page--banner`:
  `--uc-banner-text` (`--uc-color-on-accent`), `--uc-banner-text-muted`,
  `--uc-banner-line`, `--uc-banner-fill`. `--uc-focus-ring` is redefined
  inside `.uc-banner` so focus is visible on the band. The band uses
  `--uc-color-accent-strong`, which is darker than the accent, so white text
  keeps at least 4.5:1 whenever `accentColor` does (config.js warns otherwise).
- 961 px and up: the navigation is a row of tabs at the bottom of the band.
  Up to 960 px: the "Menu" button and the open list are inside the band.
- Print: no colour on the band, no navigation (uc-kit.css hides it).

### 6.2 docs

```
.uc-skip-link
.uc-header
.uc-shell                        3 columns from 1201 px: navigation | main | .uc-toc
  .uc-sidebar                    (the usual navigation, a line on its right)
  .uc-toc                        only without toc="off"; before main in reading order
    .uc-guide__progress          moved here by a <uc-guide> of the page, if any
    button.uc-toc-toggle         "Nesta página · N secções" (1200 px and down)
    nav.uc-toc__nav              named by p.uc-toc__label "Nesta página"
      ol.uc-toc__list > li.uc-toc__item(.uc-toc__item--sub) > a.uc-toc__link
  main.uc-main
.uc-footer
```

- Entries: the `<h2>`/`<h3>` of `<main>` with an id (`core/anchors.js` gives
  one to each), without those that are, or are inside, `[data-nav="off"]`,
  `[hidden]`, `dialog` or `template`, those of another language, and empty
  ones; `h3` entries get `--sub`. Built in a microtask after each render of
  the page, so headings written by the components inside (`<uc-this-week>`,
  `<uc-deadlines>`…) are listed. The list and its button are `hidden` with
  fewer than 2 entries.
- `core/scrollspy.js` marks the entry in view with `aria-current="location"`
  (IntersectionObserver, the line at 30 % of the viewport, as `<uc-guide>`
  did); a click scrolls (smoothly unless reduced motion), moves focus to the
  heading and closes the list on small screens. The anchor bar of `onepage`
  (L5) is meant to use the same module.
- `<uc-guide>`: when its `<uc-page>` has a `.uc-toc` (`page.tocColumn`), the
  guide makes no list of its own and puts its progress at the top of the
  column; the guide gets `.uc-guide--no-aside`. The page draws its guides again
  after each render, so the progress follows the column (and goes back to the
  guide with another layout or `toc="off"`).
- Width: `--uc-docs-max` = `--uc-content-max` + 240 px (1440 px by default)
  for the header, the shell and the footer; `--uc-toc-width` 220 px.
- 1201 px and up: the list is open and sticky. 961–1200 px: the navigation
  on the left, and on the right the column (progress, then the button) above
  the content. Up to 960 px: one column, "Menu", the column, the content. The
  button has `aria-expanded`/`aria-controls`; Escape closes it.
  `.uc-page--toc-open` while open. The plan hid the list between 960 and
  1200 px; the button was kept there instead, so the progress and the list
  stay reachable.
- Print: no `.uc-toc`.

Planned attributes and fields, added to `docs/api.md` by their phase:
`<uc-page aside="off">` and `aside`/`panel` in `course.js` (L4),
`data-nav="off"` for the anchor bar (L5), `pages[].description` and
`<uc-tiles>` (L5). Done in L2: `<uc-page toc="off">`, `data-nav="off"` for
the "Nesta página" list.

## 7. Size

All the JavaScript of the layouts lives in `uc-kit.js` (decision D3). Its
budget goes from 48 KB to **50 KB** gzipped (`scripts/lib/budgets.mjs`).
Estimate for the whole plan: about +2 KB (layouts 1.2, `<uc-tiles>` 0.5,
variants 0.2). L0 measured 47.4 KB (+0.4 KB), L1 47.6 KB, L2 48.3 KB (the toc and the scroll spy). `uc-kit.css` only grows with
`<uc-tiles>`. Each layout file is expected at 0.4–0.8 KB and each theme at
0.3–1 KB, downloaded only when used.

## 8. Tests

- `tests/pages/layouts/precedence.html`: attribute > `course.js` > CSS; an
  unknown attribute falls to the next level; `course.js` keeps the name.
- `tests/pages/layouts/css.html`: `--uc-layout` (quoted) decides alone;
  `classic` adds no file, `compact` does.
- `tests/pages/layouts/register.html`: `UC.registerLayout` from a script after
  the kit, a layout built on a site layout, refused names.
- `tests/pages/layouts/banner.html` (L1): `layout="banner"` from the
  attribute, the file linked after the kit, band with header, hero and
  navigation, one `h1`, colours, the hero back in `<main>` with another
  layout and into the band again.
- `tests/pages/layouts/banner-no-hero.html` (L1): `layout: "banner"` in
  `course.js`, no hero, the page's own `h1` stays in `<main>`.
- `tests/pages/layouts/docs.html` (L2): `layout="docs"` from the attribute,
  shell order, entries (h2/h3, `data-nav="off"`, other language), the nav's
  name, the guide's progress in the column and back, the button at 1200 px
  and down (opens, Escape closes), the scroll spy.
- `tests/pages/layouts/docs-short.html` (L2): `layout: "docs"` in
  `course.js`; one section hides the list; `toc="off"` removes the column.
- `tests/pages/themes/handbook.html` (L2): theme from `course.js`, layout
  from the CSS, `layouts/docs.css` by `@import` only, compact tokens,
  `--uc-weeks-view`.
- `tests/pages/themes/institutional.html` (L1): theme from `course.js` with
  `high-contrast`; layout from the CSS; `layouts/banner.css` arrives by
  `@import` only (no extra `<link>`); tokens and underlined `h2`.
- `check-pages` runs axe on all of them at 1280 and 390 px (contrast on the
  band) and from `file://`.
- The record of `npm run test:dom` must not change for any page that existed
  before; new layouts get their own test pages.

A style sheet that fails to load cannot be tested by `check-pages`: the
browser logs the failed request as a console error, which fails the check.
The fallback is covered by reading (section 4) and was tried by hand.

## 9. Extending: site layouts

```js
// a site script after uc-kit.js
UC.registerLayout("poster", { extends: "banner", css: "layouts/poster.css" });
```

- `name`: lower-case letters, digits and `-`; not a kit layout.
- `extends`: a kit layout or a site layout already registered (default
  `sidebar`). The structure (header, navigation, `main`, footer, phone menu) is
  that of the kit layout at the root of the chain.
- `css`: optional, written relative to `course.js` like the other links of the
  site. Loaded when a page uses the layout, after the kit's style sheets.
- The page gets `.uc-page--<kit layout>` (none for `sidebar`) and then one
  `.uc-page--<name>` per site layout of the chain, so it inherits every style
  and only changes what its CSS says.
- `--uc-layout: poster` in a theme also works.
- Refused calls print a warning and change nothing. Pages already drawn are
  drawn again when a registration changes their layout.

## 10. Phase log

### L0 — contract and mechanism

- `core/layouts.js`: `LAYOUTS` (`BUILT_IN` + `FILE_LAYOUTS`, empty in L0),
  `resolve`, `base`, `classes`, `load`, `UC.internal.themeValue`,
  `UC.internal.layoutsReady`, `UC.registerLayout`.
- `core/themes.js`: `classic`, `LAYOUT_THEMES`, one theme with a layout per
  list.
- `config.js`: `layout` keeps any name (checked at render).
- `uc-page.js`: draws the structure of `base(layout)`, classes from
  `classes(layout)`.
- `core/bootstrap.js`: waits for `layoutsReady()` instead of `themesReady()`.
- `scripts/themes.mjs`: builds `kit/src/layouts/`, the checks of section 3.
- `template/course.js`: `theme: "classic"` active, the token themes
  commented. Each later phase adds the line of its theme.
- Budget 50 KB.

### L1 — layout `banner`, theme `institutional`

- `kit/src/layouts/banner.css` (`FILE_LAYOUTS = ["banner"]`), section 6.1.
- `uc-page.js`: the banner structure; `placeHero()` moves the first direct
  `<uc-hero>` into the band and back.
- `kit/src/themes/institutional.css`: `@import "../layouts/banner.css"`,
  `--uc-layout: banner`, radii 3/4/6 px, `h2` of the page's sections
  underlined (scoped to `.uc-page--banner`). Added to `THEMES` and
  `LAYOUT_THEMES`.
- `core/layouts.js`: no `<link>` for a kit layout file that is already
  loaded (`--uc-layout-<name>-loaded`, section 4); `scripts/themes.mjs`
  checks the property.
- Docs: `docs/api.md` 2.2, 3.1, 8.3; `componentes/uc-page.html` "Faixa
  institucional" with the demo `docs/demos/uc-page/banner.html`;
  `course-js.html`; `personalizar/criar-tema.html` (table of themes with a
  layout); `template/course.js` (commented `theme: "institutional"`).
- `uc-kit.js` 47.6 KB gzipped (+0.2 KB); `layouts/banner.css` and
  `themes/institutional.css` are separate files.

### L2 — layout `docs`, theme `handbook`

- `kit/src/layouts/docs.css` (`FILE_LAYOUTS = ["banner", "docs"]`), section
  6.2.
- `core/scrollspy.js` (new): `UC.internal.scrollspy(headings, onChange)`,
  `.markCurrent(links, heading)`, `.goTo(event, heading)`. `<uc-guide>` uses
  it instead of its own copy (same behaviour, same DOM).
- `uc-page.js`: `toc` attribute, `.uc-toc` column (`renderTocColumn`,
  `updateToc`, `setTocOpen`), Escape closes the list.
- `uc-guide.js`: progress into the page's column in the layout `docs`.
- i18n: `toc.sections` ("{count} secções" / "{count} sections").
- `kit/src/themes/handbook.css`: `@import "../layouts/docs.css"`,
  `--uc-layout: docs`, the tokens of `compact`, `--uc-weeks-view: compact`
  (read from L6). Added to `THEMES` and `LAYOUT_THEMES`.
- Docs: `docs/api.md` 2.1, 2.2, 3.1, 8.3; `componentes/uc-page.html` "Três
  colunas" with the demo `docs/demos/uc-page/docs.html`; `uc-guide.html`;
  `course-js.html`; `criar-tema.html`; classes; `template/course.js`.
- `uc-kit.js` 48.3 KB gzipped (+0.7 KB); `layouts/docs.css` 3.7 KB and
  `themes/handbook.css` 0.4 KB are separate files.
