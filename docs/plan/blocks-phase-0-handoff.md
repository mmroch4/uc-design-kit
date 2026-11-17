# New blocks, phase 0 → phase 1 handoff

Phase 0 wrote the contract of the new blocks in
[`blocks-api.md`](blocks-api.md). It changed no code, no `docs/api.md` and no
documentation page, so `npm test` behaves exactly as before.

- Plan (Portuguese, approved 16 Nov 2026):
  <https://claude.ai/artifact/4pF22gSc8XMQw3pHT7ioB9>. Decisions approved by
  Miguel: no stops (every phase merges its own PR when the tests are green),
  HTML first for content blocks, `course.js` only for timetable, office hours
  and the new deadline fields, no `uc-plan` and no `uc-resources`, calculator
  only with `calculator`, `editions.js` shared, `data-sortable` for rankings,
  course code in `localStorage` keys, v1.0.0 frozen without blocks (blocks are
  v1.1.0), names `uc-timetable`, `uc-grading`, `uc-assessment-info`,
  `uc-summaries`, `uc-materials`, `uc-problems`.
- Phase 0 also fixed twelve open details (section 13 of `blocks-api.md`).
  The ones that differ from the plan's wording: "My class" is saved per class
  type (`uc:<course>:class:<type>`), and "Solved" is saved per problem id, not
  per page.

## State of the repository at the end of phase 0

| PR | What | State when phase 0 ended |
| --- | --- | --- |
| #35 | Accessibility audit: fixes + `scripts/check-a11y.mjs` in `npm test` | open |
| #36 | Kit fixes: links relative to `course.js` (`UC.internal.resolveCourseLinks`), `UC.formatDateRange`, runner `supports()`, `core/lists.js`, api.md aligned with the code | **merged** (16 Nov, 23:57) |
| PI, IP, PC migrations | `examples/pi*`, `ip*`, `pc*` | running in other threads; do not edit those folders |

Check both PRs with `git fetch origin && git log origin/main` before starting.

## What phase 1 does

Scope (section 12 of `blocks-api.md`):

1. PR #36 is merged, so phase 1 can start at once: rebase on `main` and
   read its changes to `docs/api.md`, `uc-deadlines` and `uc-team` first.
2. **Shared pieces** in `kit/src/core/`: `announce` (and switch
   `copy-blocks.js` and `uc-code` to it), `filterBar`, `storage` +
   `courseKey`, `firstTime`, `localiseTime`, `normalise`, `enhance` (called by
   `UC.Element` after each render), and the public `UC.formatTime`,
   `UC.formatDuration`, `UC.weekdayName`. Register new files in
   `kit/src/manifest.json`.
3. **`a[data-auth]`** (`core/auth-links.js`, section 5.2) with the new
   `a11y.requiresLoginAt` string; `a11y.requiresLogin` already exists.
4. **Size budget** in `scripts/build.mjs`: fail above 37 KB gzipped for
   `uc-kit.js`, print the size.
5. **Accessibility tests**: extend `scripts/check-a11y.mjs` (from PR #35)
   rather than adding `check-interactions.mjs`; add the `ariaSnapshot`
   helper (11.4) there.
6. **`<uc-timetable>`** (3.1), `schedule` and `scheduleTypes` in `course.js`
   (2.7), `officeHours` (2.4) shown by `<uc-team>` (4.3).
7. Contract: copy the relevant sections of `blocks-api.md` into
   `docs/api.md` (2.2, 2.4, 2.7, section 3 for `<uc-timetable>`, section 4
   for `a[data-auth]`, section 5 for `--uc-timetable-time-width`, section 7
   for the new members and `uc:classchange`). `check-docs --strict` then
   requires the docs pages for the same items in the same PR.
8. Docs: `docs/pt/componentes/uc-timetable.html` (model: `uc-week.html`),
   demos in `docs/demos/uc-timetable/`, `docs/nav.json`, components index,
   `docs/pt/course-js.html` (schedule, scheduleTypes, officeHours), the
   `a[data-auth]` block in the Blocos pages, `docs/pt/referencia/api-js.html`
   (new members and event), `template/AGENTS.md`, `docs/pt/migrar.html`
   (map: schedule tables → `<uc-timetable>`, lock icons → `data-auth`),
   `CHANGELOG.md` (Unreleased).
9. Data: section 9.1 phase 1 part in `docs/demos/course.js`; section 9.2
   timetable and `data-auth` cases in `tests/pages/`.
10. `npm run build`, commit the generated files, `npm test`, PR, rebase, merge
    when CI is green. Write `docs/plan/blocks-phase-1-handoff.md`.

## Facts about the code that phase 1 needs

- Components are IIFEs over `window.UC` that start with
  `if (UC.__duplicate) return;`; helpers live on `UC.internal`
  (`h`, `icon`, `copyText`, `tIn`, `tNodes`, `hasText`, `rerenderAll`,
  `runCode`, `canRun`, `withTime`, `builtinPages`, `resolvePageHref`,
  `currentPage`).
- `copy-blocks.js` has its own private live region (`announce` function):
  replace it with `UC.internal.announce`.
- Existing storage keys: `uc:lang`, `uc:done:<path>:<id>` (exercises),
  `uc:weeks-page:<url>` (this-week cache). Do not rename them.
- `scripts/check-docs.mjs` parses `docs/api.md` sections 2–7 (component
  headings `#### \`<uc-x>\`` with attribute tables, course.js tables, section
  4 class names, section 5 tokens, section 7 members/events) and checks that
  the docs pages document exactly the same set. `docs/plan/*.md` is not
  parsed.
- Demo "today" is 27 Nov 2025 (week 10 of the demo course); tests use
  `?today=` in the URL to pin states.
- `uc-kit.js` is about 27 KB gzipped (83 KB minified) before phase 1.

A fase 0 terminou.
