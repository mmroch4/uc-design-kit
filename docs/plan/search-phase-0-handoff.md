# Site search, phase S0 → phase S2 handoff

Phase S0 closed the contract of the site search and measured the real index
size. Nothing in the kit, the template or the docs changed. The contract is
[`search-api.md`](search-api.md); its section 13 lists what S0 decided beyond
the plan.

- Plan (PT): <https://claude.ai/artifact/GvPxc6XQpJsWyp7d6xJ561>
- Order: S0 → **S2** → S3 (both in parallel with blocks phases 4 and 5) →
  S1 (after blocks phase 5) → S4 → S5 (after blocks phase 6). v1.2.0.
- Every phase: its own thread and branch, one PR, merged with green CI, a
  `docs/plan/search-phase-N-handoff.md`, docs in PT first in the same PR.

## What is in `main` after S0

| File | What |
| --- | --- |
| `docs/plan/search-api.md` | The contract: `course.js` field, values-only rule, script commands/output/checks, extraction rules, index format, auto ids, kit detection, components, API, strings, ranking, a11y, budgets, tests, phases, measurements. |
| `docs/plan/search-prototype.py` | Throwaway extractor (no checks) used for the measurements. Has a working `course.js` literal reader (`LiteralReader`) that S2 may start from. **Delete it in S3.** |
| `docs/plan/search-phase-0-handoff.md` | This note. |

## Results

- **Index size:** EDados 288.6 KB (72.6 KB gzip), PI 37.0 KB, IP 32.9 KB,
  PC 13.7 KB. Under the 300 KB stop threshold of decision 8, so no stop.
  Details and room for trimming: contract section 12.
- **Python on the DCC:** not confirmed (the sandbox cannot reach the DCC). No
  evidence it is missing, so no stop; the script targets 3.8 and can always
  run on the local copy. **Ask Miguel once, without blocking**, to run
  `python3 --version` on the DCC server (or ask Fernando Silva) and record
  the answer in project memory and in contract section 12.
- **Contract differences from the plan** (section 13): constants allowed in
  `course.js` (PI uses `const ORIGINAL`); `search` is `true` or
  `{ index, exclude }`; bilingual pages give one entry per language; auto ids
  from the first language; errors do not stop the index being written;
  `<nav>`/`<svg>` left out; `g` is `<uc-page current>`.

## Facts S2 needs

- **Scope of S2:** `template/uc-site.py` with the reader (2.2), every check of
  3.3, the commands and options of 3.1, the output of 3.2 (pt and en
  messages), `--fix-permissions`; `index` may be a stub that S3 fills (or say
  "S3" in `--help`). Tests in `tests/site-script/` with `unittest`; CI job in
  `.github/workflows/check-pages.yml` (or a new workflow, to avoid touching a
  file the blocks phases might edit) with `actions/setup-python` for **3.8**
  and the default version. Docs in the same PR: `template/AGENTS.md`,
  `template/README.txt`, first `docs/pt/manter.html` (and its `nav.json`
  entry), `docs/pt/course-js.html` (values-only rule). Rebuild with
  `npm run build` so `llms-full.txt` and the `.md` copies follow.
- `nav.json`, `CHANGELOG.md` and `template/AGENTS.md` may also be touched by
  blocks phase 5: fetch and rebase right before merging, resolve by keeping
  both sides.
- **Python 3.8 limits:** no `match`, no `str.removeprefix` (3.9), no
  `list[str]` annotations at runtime (3.9), no `zoneinfo` (3.9 — not needed),
  `functools.cache` is 3.9 (use `lru_cache`). `html.parser` and `os.walk` are
  enough.
- The reader in the prototype reports "expected ':'" for a method shorthand
  (`f() {}`); S2 should say "functions are not allowed" there.
- Kit path check: example pages load `../../kit/v1/uc-kit.js` (outside the
  site folder). Resolve relative to the page; when the target is outside
  `--site`, still check it exists if it is on disk, else skip (template sites
  on the DCC usually point to the shared kit at the published URL or to a
  copied `kit/` folder).
- `examples/edados-2526` has 116 HTML files; the prototype runs in 0.2 s, so
  performance is not a concern.
- The kit already has `UC.internal.normalise` and `UC.internal.findMatches`
  (from `uc-summaries.js`) and `slugify` in `uc-guide.js`: S1/S4 reuse them;
  S3's Python must match `slugify` exactly (contract 6).

## Pull requests

| PR | What | State |
| --- | --- | --- |
| see GitHub | Search phase S0: contract, measurements, prototype | merged with green CI |
