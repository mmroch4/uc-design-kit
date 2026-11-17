# Site search, phase S3 → phase S1 handoff

Phase S3 made `template/uc-site.py` write the search index. The kit does not
read it yet: that starts in S1 (detection, button, automatic ids) and S4
(engine, dialog). Refinements: contract section 15.

- Plan (PT): <https://claude.ai/artifact/GvPxc6XQpJsWyp7d6xJ561>
- Order: S0 ✓ → S2 ✓ → S3 ✓ → **S1** → S4 → S5 (after blocks phase 6).
  v1.2.0.

## What is in `main` after S3

| File | What |
| --- | --- |
| `template/uc-site.py` | `PageIndexer` (one pass over a page: sections, language pieces, ids taken), `assign_ids`, `page_entries`, `build_index`, `index_source`, `write_index` (temp file + `os.replace`, mode 644), `index --stdout`. `fold`, `slugify`, `search_words`, `excerpt`, `STOP_WORDS`. |
| `tests/search/slugs.json` | Automatic-id cases: `html` (inside `<uc-page>`), optional `languages`, expected `ids` of the `<h2>`/`<h3>` outside `<template>`, in order. |
| `tests/search/words.json` | `stopWords` and `cases` (`text` → `words`) of contract 4.5. |
| `tests/site-script/test_index.py` | 36 tests: shared cases, excerpt, sections, languages, file format, commands, the examples. |
| `scripts/example-indexes.mjs` | Called by `build.mjs`: writes `examples/*/search-index.js` for examples with `search` (none yet). |
| `docs/pt/manter.html#indice`, `docs/pt/estrutura.html`, `docs/api.md` §2 | Teacher guide and API text for the index. |

The S0 prototype (`docs/plan/search-prototype.py`) is deleted.

## Facts S1 needs

- **Automatic ids (contract 6 + 15.4/15.5):** run `tests/search/slugs.json`
  in the kit's core tests against `core/anchors.js`. Each case's `html` goes
  inside `<uc-page>`; `languages` (when present) is `UC_COURSE.languages`.
  The expected ids are those of every `<h2>`/`<h3>` not inside `<template>`.
  Taken ids: every `id` in the HTML (outside templates) and `week-<n>` of
  every `<uc-week n>`, collected **before** any heading gets one (a later
  teacher-written id still wins: case 3).
- **Slug text:** the heading's text without elements whose `lang` is another
  site language than the first (`lang|=`, and not `data-uc-keep-lang`, as
  `core/language.js`). Fold = NFD + drop U+0300–U+036F + lowercase; the same
  `slugify` as `uc-guide.js`.
- Headings outside `<uc-page>` get nothing (the kit does not run there).
- `UC.course.search`: `config.js` normalises `true` → `{ index:
  "search-index.js", exclude: [] }`, an object → the same with its values,
  anything else → `null`. The script ignores everything but `index` and
  `exclude`.
- `generated` is UTC `YYYY-MM-DDTHH:MM:SSZ`; `course` is `UC_COURSE.code` or
  `""`; `languages` the array of `course.js`. Compare with `UC_COURSE.updated`
  (a day, `YYYY-MM-DD`) for the stale warning of contract 7.4.
- To try the kit against a real index, put `search: true` in an example's
  `course.js` locally and run `npm run build` (or
  `python3 template/uc-site.py index --site examples/edados-2526`). Do not
  commit an example with `search` before S5 unless S1 needs one for a test;
  if it does, commit its `search-index.js` too (`build:check` verifies it).
- For S4: `tests/search/words.json` holds the words rule the engine must fold
  queries with. Page titles of `<uc-hero>` pages come from `<title>` and are
  not translated (15.6); `g` holds the page id for better labels.
- **Python on the DCC**: still not confirmed. Asked again in this phase's
  report to Miguel; record it in contract §12 when known.

## Pull requests

| PR | What | State |
| --- | --- | --- |
| see GitHub | Search phase S3: index writer, shared cases, docs | merged with green CI |
