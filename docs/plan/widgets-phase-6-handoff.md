# Algorithm widgets, phase W6 handoff (end of the plan)

W6 is the last phase of the widgets plan. It prepared the 1.0.0 release
without cutting it and applied the widgets to the examples. Contract:
[`widgets-api.md`](widgets-api.md); what W6 refined is its section 26.

## What is in `main` after W6

| Path | What |
| --- | --- |
| `widgets/src/*/meta.json` | `"status": "stable"` for all 18 widgets. |
| `scripts/snapshot.mjs --widgets` (`npm run snapshot:widgets`) | Freezes `widgets/v1/` as `widgets/vX.Y.Z/` with `SHA256SUMS`, with the guards of 26.2. |
| `scripts/releases.mjs`, `scripts/build.mjs` | Release helpers take a base folder; `build:check` verifies widget releases. |
| `tests/widgets/compat.html`, `scripts/check-pages.mjs` | The compatibility page (26.3), checked against `widgets/v1/` and every frozen release. |
| `docs/pt/widgets/index.html`, `usar.html` | "Estável", waitlist, versions and the compatibility page. |
| `docs/deployment.md`, `docs/pt/referencia/contribuir.html` | How to release the widgets. |
| `docs/api.md` 7.2 | Stability and releases in short. |
| `CHANGELOG.md` | `## Widgets [1.0.0] - not released yet` above the kit's *Unreleased*. |
| `examples/{edados-2526,ip-2526,pc-2627}` | 12 guide pages with widgets (26.4); `MIGRACAO.md` of IP and PC say so. |

## Releasing widgets 1.0.0 (Miguel's gate)

1. Release kit 1.1.0 first (`docs/deployment.md`, "Releasing"):
   `kit/v1.1.0/` must exist.
2. `widgets/src/core/version.js`: `VERSION = "1.0.0"`; in `CHANGELOG.md`,
   rename the heading to `## Widgets [1.0.0] - <date>`.
3. `npm run build && npm run snapshot:widgets`, commit `widgets/v1.0.0/`.
4. Merge, tag `widgets-v1.0.0`, set `VERSION` to `1.1.0-dev`.

From then on the compatibility page runs against `widgets/v1.0.0/` too.

## Known limitations (unchanged from W5)

- Parallel undirected edges overlap in `svg.graph`.
- Subsets with 4 values and no target draw 31 nodes (scroll on phones).
- 9-column tables render small at 320 px.
- `editable` on trace edits the JSON in one line.
- Core headroom about 1 KB (11.0 of 12 KB gzip).
- Still open: `uc-site.py check` against widget scripts (search thread).

## Pull requests

| PR | What | State |
| --- | --- | --- |
| see GitHub | Widgets phase W6: release prepared (stable, snapshot, compatibility page), widgets in the examples | merged with green CI |
