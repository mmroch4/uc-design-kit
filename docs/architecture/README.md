# Architecture

Design contracts of the parts of the kit that were built in several phases.
Each one was written before the code and kept up to date while the phases
refined it, so it explains *why* the code is the way it is. Code comments cite
them by section ("`grading-api.md` 2.2"): keep the section numbers stable.

| File | What |
| --- | --- |
| [`blocks-api.md`](blocks-api.md) | The blocks added for the other courses: `uc-timetable`, `uc-grading`, `uc-assessment-info`, `uc-summaries`, `uc-materials`, `uc-problems`, saved choices, size budget. |
| [`search-api.md`](search-api.md) | The site search: `uc-site.py`, `search-index.js`, `<uc-search>` and the search dialog. |
| [`widgets-api.md`](widgets-api.md) | The algorithm widget library (`widgets/v1/`). |
| [`grading-api.md`](grading-api.md) | `<uc-grading>` with formulas and rules, and the lazily loaded modules. |

The public contract for teachers is [`docs/api.md`](../api.md); when the two
differ, `docs/api.md` wins. The phase plans and handoff notes that went with
these contracts were removed in the cleanup of 17 Nov 2026; they are in the
git history at commit `846b283`.
