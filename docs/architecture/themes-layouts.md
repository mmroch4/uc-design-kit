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

Status: **L0–L7 done** (mechanism; layout `banner` and theme
`institutional`; layout `docs` and theme `handbook`; layout `centered` and
themes `editorial` and `modern`; layouts `panel` and `aside`; layout
`onepage`, `<uc-tiles>` and the home-page patterns; component variants;
the guides). Sections marked
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
| `editorial` | Editorial | `centered` | L3 |
| `modern` | Moderno | `top` (in `uc-kit.css`: no `@import`) | L3 |

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
| `--uc-hero-align` | `start` \| `center` | `<uc-hero>` without `align` (`.uc-hero--center`) | L6 (`editorial`: `center`) |
| `--uc-weeks-view` | `full` \| `compact` | `<uc-weeks>` without `view` | L6 (`handbook`: `compact`) |
| `--uc-team-view` | `cards` \| `table` | `<uc-team>` without `view` | L6 (`editorial`: `table`) |

A component attribute always wins over a choice property; any other value
means the component's default. Components read them with
`UC.internal.variant(element, attribute, name)` (`core/layouts.js`): the
attribute, else `themeValue(name)`. A component drawn before the themes have
loaded is drawn again once they have, only if the value it read changed (a
`<uc-weeks>` that changes view draws its `<uc-week>` children again, so the
`#week-<n>` ids move between the weeks and the table rows).

## 6. Layouts

| Value | File | Structure | Classes | Phase |
| --- | --- | --- | --- | --- |
| `sidebar` | `uc-kit.css` | Navigation on the left | none (default) | 1.0 |
| `top` | `uc-kit.css` | Navigation in a bar under the header | `.uc-page--top`, `.uc-topnav` | 1.1 |
| `full` | `uc-kit.css` | No navigation | `.uc-page--full` | 1.0 |
| `banner` | `layouts/banner.css` | Band in the course colour with the header, the first `<uc-hero>` and tabs (6.1) | `.uc-page--banner`, `.uc-banner`, `.uc-banner__inner`, `.uc-banner__hero` | L1 |
| `docs` | `layouts/docs.css` | Navigation, content, "Nesta página" (6.2) | `.uc-page--docs`, `.uc-toc`, `.uc-toc-toggle`, `.uc-toc__nav`, `.uc-toc__list`, `.uc-toc__item`, `.uc-toc__link` | L2 |
| `centered` | `layouts/centered.css` | Centred header and navigation, reading column `--uc-reading-max` (6.3) | `.uc-page--centered`, with the structure of `top` (`.uc-topnav`) | L3 |
| `panel` | `layouts/panel.css` | Full-height bar with the header, the navigation and a timetable summary; no header band (6.4) | `.uc-page--panel`, `.uc-panel`, `.uc-panel__brand`, `.uc-panel__info`, `.uc-panel__label`, `.uc-panel__list` | L4 |
| `aside` | `layouts/aside.css` | Navigation, content and blocks on the right on every page (6.5) | `.uc-page--aside`, `.uc-aside`, `.uc-aside__heading`, `.uc-aside__office-hours`, `.uc-aside__platforms` | L4 |
| `onepage` | `layouts/onepage.css` | Sticky bar with the page's sections, then the other pages (6.6) | `.uc-page--onepage`, `.uc-anchors`, `.uc-anchors__list`, `.uc-anchors__item`, `.uc-anchors__pages`, `.uc-anchors__link` | L5 |

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

### 6.3 centered

```
.uc-skip-link
.uc-header                       a centred column: brand (logo, title in --uc-font-size-display, edition)
  .uc-header__meta               absolute in the top corner from 961 px; in the flow, centred, below
.uc-topnav > .uc-sidebar         as in top; centred, a --uc-color-text line above
.uc-shell > main.uc-main         one column, max-width --uc-reading-max (760 px) + gutters
.uc-footer                       centred
```

- The structure is exactly the one of `top` (`uc-page.js` draws `.uc-topnav`
  for both), so `centered.css` only adds styles; it repeats the few rules of
  `top` it needs under `.uc-page--centered` instead of giving the page the
  class `.uc-page--top`, so a site's styles for `top` never reach it.
- The current page is underlined (`box-shadow` inset 2 px in the accent), not
  filled; on phones the open list marks it with a line on the left.
- `.uc-split` is one column in the layout (the plan had it in the theme
  `editorial`): two columns do not fit in 760 px.
- `--uc-reading-max` is a token of `uc-kit.css` (760 px), so a site can change
  it in its `theme.css`.
- Below 960 px: the title in `--uc-font-size-h1`, the "Menu" button centred
  with the width of the reading column.
- Print: like `full` (uc-kit.css hides `.uc-topnav`).

### 6.4 panel

```
.uc-skip-link
.uc-shell                        2 columns from 961 px: --uc-panel-width (272 px) | main
  .uc-panel                      sticky, 100vh, its own scroll, --uc-color-surface-sunken
    header.uc-header.uc-panel__brand   the usual header, its inner part a column
    .uc-sidebar                  toggle + nav.uc-nav, as in sidebar
    .uc-panel__info              unless panel: false; only when there is something to show
      p.uc-panel__label "Teóricas"     ul.uc-panel__list > li
      p.uc-panel__label "Atendimento"  ul.uc-panel__list > li
  main.uc-main                   max-width --uc-content-max − --uc-panel-width
.uc-footer                       its inner part aligned with main
```

- There is **one** `<header>`: in this layout `uc-page.js` puts it inside the
  bar instead of above the shell, so the brand, "Outros anos", the
  institution, the search button and the language switch all move with it
  and nothing is drawn twice. The plan had a second brand block in the bar;
  moving the header keeps one banner landmark and one search button.
- Lines: `slotList(slots, office)` in `uc-page.js` groups slots with the same
  start, end and room, merges their days ("3.ª e 5.ª · 14:00–15:00 ·
  FC4 0.41", the weekdays as in `<uc-timetable>`: short for the eye, long for
  screen readers) and keeps the order of `course.js`. Lectures are the
  `schedule` entries with `type: "lecture"`; office hours are those of the
  member with `role: "coordinator"` and `officeHours`, else of the first
  member with `officeHours`, the room falling back to the member's `office`.
  Labels reuse `timetable.type.lecture` and `team.officeHours`.
- Below 960 px `.uc-panel` is `display: contents`, so the header goes back
  across the top (negative margins over the shell's gutter) and the
  navigation is the usual "Menu"; the summary is hidden. Print: no summary
  (and no navigation, as everywhere).

### 6.5 aside

```
.uc-skip-link
.uc-header
.uc-shell                        3 columns from 1201 px: navigation | main | --uc-aside-width (300 px)
  .uc-sidebar
  main.uc-main
  aside.uc-aside                 aria-label "Destaques"; unless aside="off" and only with a block
    uc-deadlines[per-kind=1] | uc-notices[limit=3] | uc-this-week
    div.uc-aside__office-hours > h2.uc-aside__heading, (p.uc-panel__label), ul.uc-panel__list
    div.uc-aside__platforms > h2.uc-aside__heading, ul.uc-links
.uc-footer
```

- The blocks come from `UC.course.aside` (`config.js` keeps the known names,
  warns about the others, default `["deadlines", "notices"]`), in order. A
  block is skipped when `<main>` already has its element: `<uc-deadlines>`,
  `<uc-notices>`, `<uc-this-week>`, and `<uc-team>` or `<uc-timetable>` for
  `office-hours` (decision D6: never the same block twice on a page). With
  no block left there is no `<aside>` and the shell keeps two columns
  (`:has()`).
- The aside comes after `<main>` in the DOM, so on phones the blocks are last
  and the reading order is the visual one. It is rebuilt at every render of
  the page (the components inside render themselves).
- Width: `--uc-aside-max` = `--uc-content-max` + 200 px for the header, the
  shell and the footer. 961–1200 px: two columns, the blocks below the content
  in its column. Not sticky: a tall column of blocks would be cut.
- Print: no `.uc-aside`.

### 6.6 onepage

```
.uc-skip-link
.uc-header
nav.uc-anchors                   named like the navigation ("Secções da cadeira"); sticky, top 0
  ul.uc-anchors__list            aria-label "Nesta página"; filled after each render
    li.uc-anchors__item > a.uc-anchors__link
  ul.uc-anchors__pages           the other pages of `pages` (not the current one)
    li > a.uc-anchors__link
.uc-shell > main.uc-main         one column
.uc-footer
```

- No `.uc-sidebar` and no "Menu" button: the bar is the navigation. Platforms
  are not in it (the plan lists sections, then pages).
- Sections: the `<h2>` of `<main>` with an id, with the same filters as the
  `.uc-toc` of `docs` (6.2): not `[data-nav="off"]` or inside one, not hidden,
  not of another language, not empty. `updateToc()` fills both lists (the
  `.uc-toc` one or this one) in a microtask after each render, and
  `core/scrollspy.js` marks the section in view with `aria-current="location"`.
  A click scrolls (smoothly unless reduced motion) and moves focus to the
  heading. Unlike `.uc-toc`, the bar shows with any number of sections; the
  line before the pages only shows when there is one (`:not(:empty)`).
- The bar is one line at every width (`overflow-x: auto`, links
  `white-space: nowrap`). When the marked link changes, the bar's
  `scrollLeft` centres it, so on phones the current section stays in sight;
  the window's scroll is never touched. Its inline padding lines its first
  link up with the content (`--uc-content-max`).
- Height `--uc-anchors-height` (48 px); headings of `<main>` get
  `scroll-margin-top` of that plus `--uc-space-4`, so a heading reached from
  the bar (or from a `#hash`) is not hidden under it.
- Print: no `.uc-anchors`.

### 6.7 `<uc-tiles>` and the home-page patterns

`<uc-tiles>` is a component of `uc-kit.js` (not a layout), with its CSS in
`uc-kit.css`; full contract in `docs/api.md` 3.1.

```
uc-tiles.uc-tiles
  ul.uc-tiles__list                        grid, columns of at least 240 px
    li.uc-tiles__item > a.uc-card.uc-tiles__link(.uc-tiles__link--now)
      span.uc-tiles__title                 the page's label
      span.uc-tiles__meta                  weeks card only: "Semana 10 · 25–28 nov"
      span.uc-tiles__text                  pages[].description (HTMLText)
```

- Cards: every page of `pages` but the current one, or the ids of
  `pages="…"` in that order (unknown ids warned). Pages without `href` are
  skipped.
- The weeks card shows the current teaching week from `UC.weekOf()` (the
  calendar of `core/dates.js`) and gets `--now` (the soft accent background of
  `<uc-this-week>`). The plan asked for "the matter of the week"; that title
  lives in the weeks page, which only `<uc-this-week>` fetches, so the card
  shows the week number and dates instead (no fetch, about 0.1 KB).
- Each card is a `.uc-card`, so the themes that restyle cards (`modern`)
  restyle the tiles too.
- Home-page patterns in the section gallery (`docs/pt/seccoes/cabecalhos.html`):
  "Mosaico de secções" (`<uc-hero>` + `<uc-tiles>`) and "Calendário primeiro"
  (`<uc-weeks view="compact">` as the home page).

Done in L2: `<uc-page toc="off">`, `data-nav="off"` for the "Nesta página"
list. Done in L4: `<uc-page aside="off">`, `aside` and `panel` in
`course.js`. Done in L5: `data-nav="off"` for the anchor bar,
`pages[].description`, `<uc-tiles>`.

## 7. Size

All the JavaScript of the layouts lives in `uc-kit.js` (decision D3). Its
budget goes from 48 KB to **50 KB** gzipped (`scripts/lib/budgets.mjs`).
Estimate for the whole plan: about +2 KB (layouts 1.2, `<uc-tiles>` 0.5,
variants 0.2). L0 measured 47.4 KB (+0.4 KB), L1 47.6 KB, L2 48.3 KB (the toc and the scroll spy), L3 48.3 KB (one condition), L4 49.2 KB (+0.9 KB: the panel summary and the
aside blocks), L5 49.7 KB (+0.5 KB: the anchor bar, which reuses the toc code,
and `<uc-tiles>`), L6 49.9 KB (+0.2 KB: `UC.internal.variant` and the
second drawing; about 0.15 KB left). `uc-kit.css` only grows with
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
- `tests/pages/layouts/centered.html` (L3): `layout="centered"` from the
  attribute, the file linked after the kit, the structure of `top`, the
  centred header, the reading column, `.uc-split` stacked, and by width the
  centred open navigation with the current page underlined (≥ 961 px) or the
  menu button (≤ 960 px).
- `tests/pages/themes/editorial.html` (L3): layout from the CSS,
  `layouts/centered.css` by `@import` only, serif and 1.7, the choice
  properties, the hero centred with its title visually hidden.
- `tests/pages/themes/modern.html` (L3): layout `top` from the CSS and no
  layout file, grey page and white header, white cards with a shadow, the
  current page a filled pill.
- `tests/pages/layouts/panel.html` (L4): `layout="panel"` from the
  attribute, the file linked after the kit, one header inside the bar, the
  lines of the summary (days merged, the coordinator's office hours), by
  width the sticky full-height bar or the header across the top with "Menu".
- `tests/pages/layouts/panel-off.html` (L4): `layout: "panel"` and
  `panel: false` in `course.js`: no summary.
- `tests/pages/layouts/aside.html` (L4): `layout="aside"` from the
  attribute, the named `<aside>` after `<main>`, the blocks of `aside` without
  the notices the page already has, headings, by width three columns, below
  the content, or last.
- `tests/pages/layouts/aside-off.html` (L4): `layout: "aside"` in
  `course.js`, the default blocks, `aside="off"` removes the column.
- `tests/pages/layouts/onepage.html` (L5): `layout="onepage"` from the
  attribute, the file linked after the kit, header, bar, shell with `main`
  only, no sidebar or menu button, the nav's name, the sections (h2 only,
  `data-nav="off"`, other language), the other pages without the current one,
  sticky, one line, a heading reached is below the bar, the section in view
  marked, and on narrow screens the bar scrolled to it.
- `tests/pages/uc-tiles.html` (L5): one card per page but the current one,
  hrefs, descriptions (HTML kept, none when missing), the weeks card with the
  week, `.uc-card`, `pages="…"` order, English labels and descriptions.
- `tests/pages/themes/institutional.html` (L1): theme from `course.js` with
  `high-contrast`; layout from the CSS; `layouts/banner.css` arrives by
  `@import` only (no extra `<link>`); tokens and underlined `h2`.
- `tests/pages/themes/variants.html` (L6): `handbook` from `course.js`
  (loaded after the first drawing) and a `<style>` standing for `theme.css`;
  `<uc-weeks>` drawn again as the compact table with the `#week-<n>` ids on
  the rows, `view="full"` wins; `<uc-team>` as a table, `view="cards"` wins;
  `<uc-hero align="start">` wins over `--uc-hero-align: center`, and without
  it the hero is centred.
- `check-pages` runs axe on all of them at 1280 and 390 px (contrast on the
  band) and from `file://`. From L6 it also opens every demo of
  `docs/demos/sections/` once per ready-made theme but `classic`
  (`?theme=<name>`, read by `docs/demos/course.js`), checking console errors,
  that the theme loaded, and axe.
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

### L3 — layout `centered`, themes `editorial` and `modern`

- `kit/src/layouts/centered.css` (`FILE_LAYOUTS = ["banner", "docs",
  "centered"]`), section 6.3. Token `--uc-reading-max` (760 px) in
  `uc-kit.css`.
- `uc-page.js`: `centered` draws the structure of `top`.
- `kit/src/themes/editorial.css`: `@import "../layouts/centered.css"`,
  `--uc-layout: centered`, `--uc-hero-align: center`, `--uc-team-view: table`
  (both read from L6), the serif stack, line spacing 1.7, the hero centred
  with its title visually hidden and the tagline in italics (scoped to
  `.uc-page--centered`).
- `kit/src/themes/modern.css`: `--uc-layout: top`, no `@import` (the build
  accepts a theme with a layout that imports nothing), `--uc-color-surface-sunken`
  #F6F7F9 as the page background, white header and bar, pills with the
  current page in `--uc-color-accent-strong`, white cards with a shadow
  (`.uc-card`, `.uc-this-week__card`, non-empty `<uc-notices>` and
  `<uc-deadlines>`), radii 10/16 px, hero title × 1.2 (scoped to
  `.uc-page--top`). Both added to `THEMES` and `LAYOUT_THEMES`.
- Docs: `docs/api.md` 2.1, 2.2, 3.1, 8.3; `componentes/uc-page.html`
  "Centrado" with the demo `docs/demos/uc-page/centered.html`;
  `course-js.html`; `criar-tema.html`; `tokens.html`; classes;
  `template/course.js`.
- `uc-kit.js` 48.3 KB gzipped (unchanged to the tenth).

### L4 — layouts `panel` and `aside`

- `kit/src/layouts/panel.css` and `kit/src/layouts/aside.css`
  (`FILE_LAYOUTS = ["banner", "docs", "centered", "panel", "aside"]`),
  sections 6.4 and 6.5.
- `uc-page.js`: `panel` puts the header in `.uc-panel` with the navigation and
  `renderPanelInfo()`; `aside` adds `renderAside()` after `<main>`;
  `officeHoursList()` and `slotList()` are shared by both. `aside` attribute.
- `config.js`: `aside` normalised (known names, default
  `["deadlines", "notices"]`); `panel` kept as written.
- i18n: `aside.label` ("Destaques" / "Highlights").
- No theme uses these layouts (the plan gives none); they are chosen with
  `layout`.
- Docs: `docs/api.md` 2.2 (`aside`, `panel`, `schedule`), 3.1, 8.3;
  `componentes/uc-page.html` "Painel lateral" and "Blocos laterais" with the
  demos `docs/demos/uc-page/panel.html` and `aside.html`; `course-js.html`;
  classes; `template/course.js`.
- `uc-kit.js` 49.2 KB gzipped (+0.9 KB); `layouts/panel.css` 2.3 KB and
  `layouts/aside.css` 1.2 KB are separate files.

### L5 — layout `onepage`, `<uc-tiles>`, home-page patterns

- `kit/src/layouts/onepage.css` (`FILE_LAYOUTS = ["banner", "docs",
  "centered", "panel", "aside", "onepage"]`), section 6.6.
- `uc-page.js`: `renderAnchors()`; `updateToc()` now fills the `.uc-toc` list
  or the bar's sections (same filters, same scroll spy) and centres the marked
  link in the bar. `UC.internal.pageLabel`.
- `components/uc-tiles.js` and `css/components/uc-tiles.css` (section 6.7);
  `pages[].description` (kept by `config.js` as written).
- No new i18n strings (`nav.label`, `guide.onThisPage`, `weeks.week`).
- Docs: `docs/api.md` 2.3 (`description`), 3.1 (`onepage`, `<uc-tiles>`), 8.3;
  `componentes/uc-page.html` "Página única" with the demo
  `docs/demos/uc-page/onepage.html`; `componentes/uc-tiles.html` (new) with
  the demos `docs/demos/uc-tiles/basic.html` and `pages.html`;
  `course-js.html` (`description`, `onepage`); the section gallery
  `seccoes/cabecalhos.html` "Mosaico de secções" and "Calendário primeiro"
  (demos `docs/demos/sections/home-tiles.html` and `home-calendar.html`);
  `docs/demos/course.js` gives the demo pages a `description`; classes;
  `template/course.js`.
- `uc-kit.js` 49.7 KB gzipped (+0.5 KB); `uc-kit.css` +0.3 KB;
  `layouts/onepage.css` is a separate file.

### L6 — component variants

- `core/layouts.js`: `UC.internal.variant(element, attribute, name)` (section
  5.3); components that read a choice property before the themes loaded are
  drawn again once they have, only when the value changed.
- `<uc-weeks>` (`view`, `--uc-weeks-view`; keeps `compact` as a property so
  its `<uc-week>` children know where their id goes, and draws them again
  when it changes), `<uc-team>` (`view`, `--uc-team-view`), `<uc-hero>`
  (new attribute `align`, `--uc-hero-align`, class `.uc-hero--center` in
  `uc-hero.css`). `editorial.css` no longer centres the hero itself.
- Values of `--uc-weeks-view` are `full` | `compact`, as the attribute (the
  plan said `list`).
- The section gallery's theme picker lists the five themes with a layout;
  `?theme=` is now read by `docs/demos/course.js` (it sets `theme`, so the kit
  loads it and waits for it) instead of `docs/demos/demo.js` adding a
  `<link>` the kit did not wait for.
- `check-pages`: every section demo × every theme (axe, console errors, the
  theme loaded). New test page `tests/pages/themes/variants.html`; the
  editorial test checks the table and the centred hero.
- Docs: `docs/api.md` 3.1 (`<uc-hero>` `align`, `<uc-weeks>` and `<uc-team>`
  `view` defaults), 5 (choice properties), 8.3; `estilos/tokens.html`
  "Propriedades de escolha"; `componentes/uc-hero.html`, `uc-weeks.html`,
  `uc-team.html`; `seccoes/index.html` "Ver com outro tema"; CHANGELOG.
- `uc-kit.js` 49.9 KB gzipped (+0.2 KB).

### L7 — documentation

- Guides (Portuguese): `personalizar/temas.html` "Escolher um tema" (the five
  themes side by side, with screenshots of the demo course in
  `docs/assets/img/themes/` and links to it with `?theme=`; token themes;
  changing a theme's layout), `personalizar/criar-layout.html` "Criar um
  layout" (when a site layout is needed, the parts of every layout, the
  `cartaz` example built on `banner` with the demo
  `docs/demos/customize/layout-cartaz.html`, an accessibility checklist), and
  in `personalizar/criar-tema.html` the sections "Ajustar um tema pronto",
  "Mudar o layout de um tema" and "Criar um tema com layout".
- Theme customiser (`personalizar/tema.html`, `docs/assets/theme-editor.js`):
  controls "Tema" (the five themes with a layout) and "Layout" (the theme's,
  or any of the nine), the old "Tema pronto" renamed "Tema de tokens";
  corners 16 px added (the radius of `modern`). The themes and the layout go
  in the preview's URL (`?theme=a,b&layout=x`, read by
  `docs/demos/theme/preview.js` before the kit starts and kept in the links of
  its navigation), so changing them loads the preview again; tokens still go
  by `postMessage`. The `course.js` result always has `theme` (a list with a
  token theme) and `layout` only when it is not the theme's. The hash gains
  `style` and `layout`; `theme` keeps meaning the token theme, so links shared
  before still work.
- `criar-site.html` ("A cor e o tema"), `migrar.html` ("Mudar o tema de um
  site", and the theme in the request), `llm.html` (a rule on themes and
  layouts, which `llms.txt` copies, and a request to change the theme),
  `template/AGENTS.md` (rule 7, and the theme in the migration steps),
  `template/course.js` (how to switch, link to the guide), `course-js.html`,
  `componentes/uc-page.html`, `personalizar/index.html`.
- No change to the kit's code or size; the examples stay on `classic`.

