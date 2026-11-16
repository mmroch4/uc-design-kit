# Changelog

All notable changes to the kit are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and the kit uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added
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

### Fixed
- Page links from pages in subfolders: `pages[].href` is now relative to
  `course.js`.
- "null" printed in `<uc-exercise>` without `mooshak` and in `<uc-hero>`
  without `code` or `tagline`.
