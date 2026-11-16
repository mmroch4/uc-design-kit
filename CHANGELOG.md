# Changelog

All notable changes to the kit are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and the kit uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added
- `<uc-code collapsible>`: a show/hide toggle in the header; add `collapsed`
  to start folded. The EDados lecture code pages use it.
- `<pre data-copy>`: a copy button for preformatted text such as problem
  input/output examples. The EDados problem pages use it on every example.
- Frozen releases: `npm run snapshot` copies the build to `kit/vX.Y.Z/`, served
  with `Cache-Control: immutable` for a year; `npm run build:check` fails if a
  release is modified. `kit/v1/` stays the auto-updating alias.
- Source maps (`uc-kit.js.map`, `uc-kit.css.map`) with the original sources.
- The body font (`fonts/inter-latin.woff2`) is preloaded: on the example pages
  through a `Link` header in `_headers` (also sent as an Early Hint), and
  documented as an optional `<link rel="preload">` for course sites.
- Deployment guide: release steps and jsDelivr as a fallback mirror.
- `.uc-content` block for plain HTML without kit classes (pasted or migrated
  pages): spacing for headings, lists, tables, `<pre>` and floated images.
- EDados 2025/26 example: problem statements (`problemas/`), lecture code
  (`codigo/`), lab help pages, slides, images and data files migrated from the
  original site.
- Fonts are served with the kit from `kit/v1/fonts/` (no Google Fonts request),
  including the Greek subset of Inter.
- Site favicon.
- `.uc-table` wrappers that scroll sideways become keyboard-focusable regions
  (labelled by the table caption) while they overflow.
- Repository scaffold, licence and contribution guide.
- Page checker (`npm test`) and GitHub Actions workflow.
- Core runtime: configuration loading and validation, i18n (pt, en), language
  switching with in-place bilingual content, dates and teaching calendar with
  breaks, `UC.Element` base class and `UC.define`.
- Base styles: design tokens, reset, typography and layout building blocks.
- `<uc-page>` (header, responsive navigation, footer) and `<uc-hero>`.
- `scripts/build.mjs` bundles `kit/src` into `kit/v1/uc-kit.{js,css}`.
- `<uc-notices>`, `<uc-deadlines>` (list and table views) and `<uc-date>`.
- Weekly calendar: `<uc-weeks>`, `<uc-week>`, `<uc-event>` and `<uc-this-week>`.
- Lab guides: `<uc-guide>` (breadcrumbs, table of contents, progress) and
  `<uc-exercise>` (hints, solutions, "mark as done").
- `<uc-team>`, `<uc-code>` (highlight.js from cdnjs, copy, download, editor)
  and `<uc-question>`.
- `per-kind` on `<uc-deadlines>`, `kind` on `<uc-weeks>` and `<uc-this-week>`,
  `medium` date format, `uc-split` and `uc-button--sm` blocks.
- In-page code execution: `<uc-code run>` (no value) adds a "Run" button,
  with optional hidden harness and tests shown as ✓/✗. Runners are pluggable
  (`UC.registerRunner`, `UC_COURSE.runner`); built in: Codapi and JavaScript
  in a Web Worker.

### Changed
- `uc-kit.js` and `uc-kit.css` are minified with esbuild (about 35 % and 23 %
  smaller after compression).
- `_headers`: cache rules no longer overlap, so `X-Content-Type-Options` is no
  longer sent twice on kit files.
- `<uc-page>` stays hidden until the kit has built the page and the web fonts
  are ready (at most 300 ms of waiting for fonts; revealed after 2 s if the kit
  never runs, at once without JavaScript), so the header, navigation and
  components no longer make the content jump, and the text no longer switches
  font, on load. The kit marks this with `.uc-visible` on `<html>`.
- `<uc-this-week>` keeps the last copy of the weeks page in `localStorage` and
  renders from it straight away, refreshing when the new copy arrives.
- The kit is cached for 5 minutes and then revalidated in the background
  (`stale-while-revalidate`), so repeat visits no longer wait for the server.
- `<uc-notices>` hides notices dated in the future until their day.
- `<uc-this-week>`: the current week is highlighted with a soft accent
  background instead of an accent border.
- `<uc-deadlines view="table">` status badges: done is green, next is amber
  (new block `uc-tag--success`).

### Fixed
- `<uc-code editable>`: space after the longest line; the caret stays visible on long lines (the editor
  scrolls with it), and the code no longer flickers on every key.
- The kit is now revalidated on every load (`_headers`), so pages and kit
  stay in step after a deploy.
- Page links from pages in subfolders: `pages[].href` is now relative to
  `course.js`.
- "null" printed in `<uc-exercise>` without `mooshak` and in `<uc-hero>`
  without `code` or `tagline`.
