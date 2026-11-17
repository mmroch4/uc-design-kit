# New blocks, phase 2 → phase 3 handoff

Phase 2 built `<uc-grading>`, `<uc-assessment-info>` (with `.ics`) and the
`duration` / `location` / `shifts` fields of deadlines. The contract is
[`blocks-api.md`](blocks-api.md); its section 15 lists what phase 2 refined.

## What is in `main` after phase 2

| Piece | Files |
| --- | --- |
| `<uc-grading>`: formula, proportions bar, weights table, parts, bonus, calculator | `kit/src/components/uc-grading.js`, `kit/src/css/components/uc-grading.css` |
| `<uc-assessment-info>`: card from a deadline, status, `.ics` button | `kit/src/components/uc-assessment-info.js`, `kit/src/css/components/uc-assessment-info.css` |
| `.ics` text `UC.internal.icsText(deadline, pageUrl)` (RFC 5545, `Europe/Lisbon`, folded lines) | `kit/src/core/ics.js` |
| `UC.internal.endTime`, `UC.internal.deadlineTimes` (shift and duration times) | `kit/src/core/time.js` |
| `UC.internal.deadlineStatus(deadline, today)` | `kit/src/components/uc-deadlines.js` |
| Times and location in `<uc-event>`, `<uc-deadlines>` (both views), `<uc-this-week>`, `<uc-weeks>` | `uc-event.js`, `uc-deadlines.js` |
| Strings `grading.*`, `assessment.*` (pt, en) | `kit/src/i18n/*.js` |
| Calculator keyboard/state check `checkGradingCalculator`; two ARIA snapshots | `scripts/check-a11y.mjs`, `tests/pages/uc-grading.aria.yml`, `tests/pages/uc-assessment-info.aria.yml` |
| Test pages | `tests/pages/uc-grading.html`, `tests/pages/uc-assessment-info.html`; `ap2` in `tests/pages/course.js` gained shifts, duration and location |
| Core unit tests: `deadlineTimes`, `deadlineStatus`, `icsText`, weights and formula | `tests/pages/core-tests.js` |
| Docs | `docs/pt/componentes/uc-grading.html` (3 demos), `uc-assessment-info.html` (2 demos), nav and components index ("Avaliação", thumbnails), `course-js.html` (`Minutes`, `duration`, `location`, `shifts`, `Shift`), `uc-event.html`, `uc-deadlines.html`, tokens, classes, `migrar.html`, `template/AGENTS.md`, `CHANGELOG.md` |
| Demo data | `teste` in `docs/demos/course.js` has `duration: 105`, `location`, two shifts (its old `note` became `location`) |

## Size budget: decide before phase 3

`uc-kit.js` is **36.8 KB** gzipped against the 37 KB budget. Phase 2 needed
4.7 KB (grading 2.4, assessment card 1.5, ics 1, strings ~0.5, minus sharing).
Phases 3–5 (summaries, compact weeks, materials, problems, sortable tables,
updated, editions) will need about 9 KB more.

On 17 Nov Miguel was asked in the phase 2 thread (decision card) to choose:
raise the budget to 48 KB (recommended), keep 37 KB and load blocks as
separate files, or keep 37 KB and cut features. **Phase 3 must read his answer
first** (project chat, the phase 2 thread, or project memory). If he chose
48 KB, change `JS_BUDGET_GZIP` in `scripts/build.mjs` and the number in
`blocks-api.md` 1.5 / `CHANGELOG.md` in the phase 3 PR. Do not raise it
without his answer.

## Facts phase 3 needs

- The component definition order matters: components defined earlier in
  `kit/src/manifest.json` render as soon as they are defined (the kit script
  is `defer`, so the document is already parsed). A helper used by an earlier
  component must live in `core/` (this is why `deadlineTimes` is in
  `time.js`).
- `UC.internal.deadlineStatus` and `deadlineTimes` are there for
  `<uc-weeks view="compact">` (deadline in a week row) and `<uc-problems>`
  ("Prazo: {date}").
- Headings: blocks set `class="uc-<block>__heading"` with the h2 size so
  `heading-level` changes only the outline.
- Docs pages can be written with empty `<!-- docs:demo … --><!-- /docs:demo -->`
  and `<!-- docs:classes … -->` markers: `npm run build` fills them. Measure
  demo heights at 1280 px (the frame's `scrollHeight`).
- Thumbnails (`docs/assets/img/components/<name>.webp`, 640×400) were taken
  with Playwright at a 640×400 viewport from the first demo, saved as WebP
  (quality 80) with Pillow.
- Local check runs in the sandbox fail on docs pages that load highlight.js
  from cdnjs (no network); CI is the reference.

## Pull requests

| PR | What | State |
| --- | --- | --- |
| #38 | Phase 1 | merged |
| phase 2 | this phase | see the PR list; merged when CI was green |
| PI, IP, PC migrations | `examples/pi*`, `ip*`, `pc*` | other threads; phase 2 did not touch them |

## What phase 3 does

Section 12 of `blocks-api.md`: `<uc-summaries>`, `<uc-weeks view="compact">`
and `<uc-week href>` (sections 3.4, 4.1, 4.2, 9.1/9.2 phase 3 parts), after
settling the size budget above. Same rules: `docs/api.md` and the docs pages
in the same PR, `npm run build`, `npm test`, rebase, merge when CI is green,
write `docs/plan/blocks-phase-3-handoff.md`.

A fase 2 terminou.
