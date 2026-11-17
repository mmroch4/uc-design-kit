# New blocks, phase 5 → phase 6 handoff

Phase 5 built the extras: `table[data-sortable]`, `uc-links--grid`,
`<uc-page updated>`, editions (`editions.js`) and the weekly link checker,
and finished the documentation pages of the plan. The contract is
[`blocks-api.md`](blocks-api.md); its section 18 lists what phase 5 refined.

## What is in `main` after phase 5

| Piece | Files |
| --- | --- |
| Sortable tables (`data-sortable`, `data-sort-default`, `data-no-sort`, `data-sort`, `data-sort-fixed`), announced, `aria-sort` | `kit/src/core/sortable-tables.js`, `kit/src/css/base/shared.css`, icon `sort` in `kit/src/core/dom.js` |
| `uc-links--grid`, `--uc-links-min` | `kit/src/css/base/blocks.css` |
| `<uc-page updated="YYYY-MM-DD" \| "auto">`, editions disclosure and notice | `kit/src/components/uc-page.js`, `kit/src/css/components/uc-page.css` |
| Strings `editions.*`, `sort.*` | `kit/src/i18n/*.js` |
| Link checker + weekly workflow (Mondays 06:00 UTC, manual run; one `broken-links` issue, closed when all answer) | `scripts/check-links.mjs`, `.github/workflows/links.yml` |
| Tests | `tests/pages/extras.html` (sortable table, link grid, page date), `tests/pages/editions/{editions.js,2425/,2526/}`, unit tests in `core-tests.js`, `checkSortableAndEditions` in `check-a11y.mjs` (also runs on `docs/demos/blocks/table-sortable.html`), snapshots `sortable-table.aria.yml`, `editions.aria.yml`; `check-docs` knows api.md 2.9 (`#edicoes`) |
| Docs | `docs/api.md` 2.2, 2.9, 3.1, 4, 5; pages uc-page (`#outros-anos`, `#data-da-pagina`), course-js (`#edicoes`), estilos/elementos (`#table-sortable`), estilos/superficies (`#links-grid`), tokens, classes; Novo ano letivo (new step 2 `#outros-anos`), Publicar (`#links-partidos`, `#data-das-paginas`), Introdução ("O que inclui"), Padrões (assessment with uc-grading + uc-assessment-info; new Horários, Sumários, Materiais), migrar, llm rules, `template/AGENTS.md`, `template/course.js` (editions commented), `CHANGELOG.md` |

## Size

`uc-kit.js` is **44.6 KB** gzipped of 48 KB.

## Not done (needs Miguel)

- **v1.1.0 was not cut.** v1.0.0 itself was never frozen or tagged (gate 3 of
  the original plan). Everything stays under "Unreleased". See 18.6 for the
  steps.

## What phase 6 does

Section 12 of `blocks-api.md`: tell the PI/IP/PC migration threads, apply the
blocks to `examples/edados-2526` (timetable, grading, assessment info,
summaries, materials, problems index, `data-auth` instead of the hand-drawn
locks, `uc-links--grid`, `<uc-page updated>`), then the other examples once
their migrations are merged (PC rankings → `data-sortable`). Editions need a
parent folder above the year folders; `examples/` holds one year per course,
so an `editions.js` there would be shared by unrelated courses: leave editions
out of the examples (the docs demo and `tests/pages/editions/` cover them).
Final report to Miguel.

Facts phase 6 needs:

- Sortable tables live in page HTML; inside components they are enhanced too
  (`UC.internal.enhance`).
- `updated="auto"` shows nothing when the server sends no `Last-Modified`
  (the test servers of `check-pages`/`check-a11y` send none, so snapshots are
  stable). Cloudflare Pages sends no `Last-Modified` for HTML as far as we
  know: prefer explicit dates on the hosted examples.
- Editions hrefs are rewritten relative to the page; an edition that is not in
  the list shows the disclosure but no notice.
- Demo heights: serve the repo over HTTP and measure the iframes (`file://`
  blocks `contentDocument`), as before.
