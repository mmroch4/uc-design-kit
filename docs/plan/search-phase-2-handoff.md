# Site search, phase S2 → phase S3 handoff

Phase S2 shipped the maintenance script without the index: `template/uc-site.py`
reads `course.js`, runs every check of contract section 3.3 and prints the
report of 3.2 in Portuguese or English. Refinements: contract section 14.

- Plan (PT): <https://claude.ai/artifact/GvPxc6XQpJsWyp7d6xJ561>
- Order: S0 ✓ → S2 ✓ → **S3** → S1 (after blocks phase 5) → S4 → S5 (after
  blocks phase 6). v1.2.0.

## What is in `main` after S2

| File | What |
| --- | --- |
| `template/uc-site.py` | The script: `LiteralReader` (course.js, values + constants, line of every key in `JsObject.lines` / `JsArray.lines`), `Site` (file list, `resolve`, exact-case `lookup`), `check_course`, `PageScanner` + `check_page`, `check_permissions`, `check_site`, output (`format_report`, `summary`), CLI (`main`). `write_index()` is the placeholder S3 replaces. |
| `tests/site-script/test_uc_site.py` | 62 `unittest` tests: reader, each check failing once on a temp site, examples/template clean, CLI and output format. `npm run test:site-script` or `python3 -m unittest discover -s tests/site-script`. |
| `.github/workflows/site-script.yml` | Tests on `python:3.8-slim` and `python:3-slim`, plus `check --quiet` on every example and the template. |
| `docs/pt/manter.html` | Teacher guide "Manter o site" (in `nav.json` after "Publicar"). S3 completes the index part. |
| `docs/pt/course-js.html#so-valores`, `docs/api.md` §2 | The values-only rule and a summary of the script (EN). |
| `template/README.txt`, `template/AGENTS.md` | Step "Verificar", rules 11 (values only) and 12 (run `check`). |

## Facts S3 needs

- **Where to plug in:** `write_index(site, course, search, messages, out)` in
  `uc-site.py`. It receives the parsed `course` (plain dict subclasses), a
  `SearchConfig` (`index`, `exclude`) and `site.html` (every `.html`/`.htm`,
  path order, hidden folders already left out). Return the summary line of
  contract 3.2 (`Índice: search-index.js (116 páginas, 685 secções, 289 KB)`)
  through `messages` (add the keys to **both** `MESSAGES["pt"]` and `["en"]`;
  a test checks they match). Remove `index.pending`.
- The default command already calls it **after** the checks even with errors
  (when `course.js` read); `index` calls it after reading `course.js` only.
  `--quiet` passes a null writer.
- Write with mode `644` (`os.chmod` after writing; contract decision 3), via a
  temp file + `os.replace` so a visitor never gets half a file.
- The extractor can start from `docs/plan/search-prototype.py`
  (`PageExtractor`), then **delete the prototype** (contract 11.3).
- `slugify`/`fold`/words: the prototype's versions match contract 4.5 and 6;
  add `tests/search/slugs.json` and run it from the Python tests.
- `build.mjs` should generate the examples' indexes through the script only
  when their `course.js` has `search` (none has it yet: S5 turns it on).
- Keep `python3 -W error` clean (no `re.split(…, 1)` positional maxsplit,
  no 3.9+ APIs). Check locally with `uv python install 3.8`.
- `check` reports `index.absent` / `index.stale` (INFO) when search is on; the
  default command does not (it rewrites the index).
- **Python on the DCC**: still not confirmed; ask Miguel once, without
  blocking (`python3 --version` over ssh), then record it in contract §12.

## Pull requests

| PR | What | State |
| --- | --- | --- |
| see GitHub | Search phase S2: uc-site.py checks | merged with green CI |
