# New blocks, phase 1 → phase 2 handoff

Phase 1 built the shared pieces, `a[data-auth]`, `<uc-timetable>` and the
office hours of `<uc-team>`. The contract is
[`blocks-api.md`](blocks-api.md); its section 14 lists what phase 1 refined
(read it before phase 2: the `announce` delay, new strings and classes, the
size budget).

## What is in `main` after phase 1

| Piece | Files |
| --- | --- |
| Shared live region `UC.internal.announce(text, delay = 50)`; `<pre data-copy>` and `<uc-code>` use it | `kit/src/core/announce.js` |
| Course-scoped storage `UC.internal.storage` (`get`, `set`, `remove`, `key`) and `courseKey()` | `kit/src/core/storage.js` |
| `UC.formatTime`, `UC.formatDuration`, `UC.weekdayName`; internal `parseTime`, `minutesOf`, `dayNode`, `timeRangeNode`, `joinNodes`, `normalise`, `firstTime`, `localiseTime` | `kit/src/core/time.js` |
| Filter bar `UC.internal.filterBar({ label, groups, onChange })` → `{ element, value(id), set(id, value) }`; groups are `kind: "select"` or buttons | `kit/src/core/filters.js`, `kit/src/css/base/shared.css` |
| Page enhancements: `UC.internal.registerEnhancer(fn)` and `UC.internal.enhance(root)`, run by `UC.Element` after every render (connect, language change, `rerenderAll`). `core/tables.js` and `core/auth-links.js` register | `kit/src/core/element.js` |
| `a[data-auth]` | `kit/src/core/auth-links.js`, `shared.css` |
| `<uc-timetable>` | `kit/src/components/uc-timetable.js`, `kit/src/css/components/uc-timetable.css` |
| `officeHours` in `<uc-team>` | `uc-team.js`, `uc-team.css` |
| Size budget: build fails above 37 KB gzipped, prints the size | `scripts/build.mjs` |
| `ARIA_SNAPSHOTS` list, `checkAriaSnapshots`, `checkClassFilter`, data-auth check; `--update-snapshots` | `scripts/check-a11y.mjs` |
| Test page and snapshots | `tests/pages/uc-timetable.html`, `tests/pages/uc-timetable*.aria.yml` |
| Core unit tests for the helpers above | `tests/pages/core-tests.js` |
| Docs | `docs/pt/componentes/uc-timetable.html` + 5 demos, `course-js.html` (`#horario`, `officeHours`, `Weekday`, `schedule`, `scheduleTypes`), `uc-team.html` (`#atendimento`), `estilos/elementos.html#data-auth` + `demos/blocks/auth.html`, `referencia/api-js.html`, `estilos/tokens.html`, `referencia/classes.html`, `migrar.html`, components index + thumbnail, `template/AGENTS.md`, `CHANGELOG.md` |

`scripts/check-docs.mjs` maps `docs/api.md` 2.7 to `course-js.html#horario`
(`COURSE_SECTIONS`); a new course.js subsection needs a new entry there.

## Facts phase 2 needs

- **Size:** `uc-kit.js` is **32.1 KB** gzipped (budget 37). Phase 2 adds
  `<uc-grading>` with its calculator and `<uc-assessment-info>` with `.ics`:
  keep them small, reuse `time.js`, `announce`, `storage` and the strings in
  `common.*`. If the budget cannot hold the remaining blocks, say so to Miguel
  instead of raising it silently.
- `deadlineStatus` is still private to `uc-deadlines.js` (`statuses()`):
  extract it there for `<uc-assessment-info>` and `<uc-problems>`.
- `UC.formatDuration(minutes)` exists; `duration.*` strings exist.
- The calculator announces with `UC.internal.announce(text, 300)`.
- Accessibility checks: a new block's demos in `docs/demos/uc-x/` are walked by
  `check-a11y.mjs` automatically. Behaviour checks go in `checkBehaviour` (or a
  function like `checkClassFilter`), and the block's snapshot is one line in
  `ARIA_SNAPSHOTS` (run `node scripts/check-a11y.mjs --update-snapshots uc-x`
  once to write it, then review the `.aria.yml`).
- Visually hidden text inside a table is safe now (`.uc-table` is positioned).
- Demo heights in `<!-- docs:demo … height="…" -->` are the initial iframe
  heights; measure them at 1280 px (the iframe then resizes itself).
- `docs/demos/course.js` now has `schedule` and `officeHours` (Ana, Bruno).
  The `uc-team` demos grew by one block per card; their heights were updated.
- Local test runs in the sandbox fail on pages that load highlight.js from
  cdnjs (no network); CI has network and is the reference.

## Pull requests

| PR | What | State |
| --- | --- | --- |
| #35 | Accessibility audit and `check-a11y.mjs` | merged before phase 1's PR (phase 1 was built on it) |
| phase 1 | this phase | see the PR list; merged when CI was green |
| PI, IP, PC migrations | `examples/pi*`, `ip*`, `pc*` | other threads; phase 1 did not touch them |

## What phase 2 does

Section 12 of `blocks-api.md`: `<uc-grading>` with calculator,
`<uc-assessment-info>` (`core/ics.js`), and `duration` / `location` / `shifts`
in `<uc-event>`, `<uc-deadlines>` and `<uc-this-week>` (sections 2.5, 3.2,
3.3, 4.4, 9.1 phase 2 part, 9.2). Same rules: `docs/api.md` and the docs pages
in the same PR, `npm run build`, `npm test`, rebase, merge when CI is green,
write `docs/plan/blocks-phase-2-handoff.md`.

A fase 1 terminou.
