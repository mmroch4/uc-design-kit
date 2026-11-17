# Algorithm widgets, phase W0 → phase W1 handoff

Phase W0 closed the contract of the widget library. Nothing in the kit, the
template, the examples or the docs site changed. The contract is
[`widgets-api.md`](widgets-api.md); its section 20 lists what W0 decided
beyond the plan.

- Plan (PT): <https://claude.ai/artifact/VRLDLknHBitpt6LRWYkmLy> (9 decisions
  approved by Miguel on 17 Nov 2026, 11:29).
- Execution authorised by Miguel on 17 Nov 2026, 11:32: phase by phase, each in
  a new thread, merge with green CI, **no stops until the end of the plan**.
  The plan's visual gate at the end of W1 is **not blocking**: post a preview
  of `uc-widget-sort` to Miguel and continue. Releasing (W6) stays his gate:
  prepare, do not cut.
- Order: W0 → **W1** → W2 → W3 → W4 → W5 → W6.

## What is in `main` after W0

| File | What |
| --- | --- |
| `docs/plan/widgets-api.md` | The contract: files and loading, attributes, input formats, step format, anatomy and sketch, player and keys, pseudocode, panels, narration, text view, predict, editable, states and tokens (with contrast figures), strings, events/methods, `UC.widgets` API, catalogue, build, budgets, tests, docs, phases. |
| `docs/plan/widgets-phase-0-handoff.md` | This note. |

## Facts W1 needs

- **W1 may start now**: blocks phase 5 (#47) and the CI speed-up (#46),
  which W1 waited for, are merged.
- **Scope of W1** (contract 19): the whole core, `bootstrap.js`,
  `scripts/build-widgets.mjs` (called from `build.mjs`), budgets (core 12 KB,
  widget 8 KB, CSS 4 KB gzip), `catalog.json`, `_headers` rules, the test
  harness (algorithm tests with `node:test`, step validator, narration
  snapshots, page checks inside the existing shards), `uc-widget-sort` with
  all six algorithms (`bubble selection insertion merge quick counting`,
  `pivot` for quick), docs (Catálogo, Usar widgets, Ordenação; pt + en;
  `docs/api.md` 7.2; `llms`; `template/AGENTS.md`), `CHANGELOG.md` under a
  "Widgets" heading.
- **Start from** `examples/edados-2526/extensions/uc-bst-traversal.js`: its
  player, live region, pseudocode panel and SVG helpers are the seed of the
  core. Do not change that file (it stays as the extension tutorial, D9; W2
  switches lab guide 10 to `uc-widget-bst`).
- **Kit APIs the core may use**: only the public ones in `docs/api.md` 7
  (`UC.Element`, `UC.define`, `UC.addTranslations`, `UC.t`, `UC.lang`,
  `uc:languagechange`) and the kit CSS classes `.uc-button`,
  `.uc-button--primary`, `.uc-button--sm`, `.uc-visually-hidden`. Not
  `UC.internal` (it may change without notice); copy the small `el()` helper.
- `UC.version` on `main` is `1.0.0-dev` (v1.0.0 and v1.1.0 were never cut),
  so the version check of contract 2.2 (major.minor ≥ 1.1, suffix ignored)
  **would warn** on today's `main`. Bump the source version to `1.1.0-dev` in
  `kit/src/core/namespace.js` in the W1 PR (blocks are heading to 1.1.0; check
  the CHANGELOG first), and record it in contract section 20.
- Build: the kit build uses esbuild with `target: "esnext"`; use the same.
  `npm run build:check` must cover `widgets/v1/`.
- `tests/pages/` holds the kit's test pages and `scripts/check-pages.mjs` /
  `check-a11y.mjs` accept `--shard=i/n`; add the widget pages to the page
  list so they spread over the 4 shards. No new CI job, no screenshots in PRs.
- Files other threads touch now (blocks phase 6, search S2+, PI/IP/PC
  migrations in `examples/`): `CHANGELOG.md`, `docs/nav.json`,
  `llms-full.txt`, `template/AGENTS.md`, `scripts/build.mjs`, the CI
  workflow. Fetch and rebase right before merging; keep both sides.
- The visual preview for Miguel: publish the built docs page of the sort
  widget (or a self-contained HTML with the built files inlined) as an
  artifact, or give the Cloudflare preview URL of the PR
  (`<hash>.uc-design-kit.pages.dev/docs/…`), then continue with W2.

## Open points (not blocking)

- The state colours (amber `#B45309`, violet `#6D28D9`, green `#15803D`)
  are new to the kit. Miguel sees them at the W1 preview; if he wants others,
  only the token fallbacks change.

## Pull requests

| PR | What | State |
| --- | --- | --- |
| see GitHub | Widgets phase W0: API contract | merged with green CI |
