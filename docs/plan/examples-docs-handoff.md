# Examples in the documentation: handoff

The docs list every real example in `docs/pt/exemplos/`: an overview
(`index.html`, cards and a comparison table) and one page per example
(`edados.html`, `pc.html`, `ip.html`). The header and the "Site" list of the
sidebar link "Exemplos" to the overview (`examples` in `docs/nav.json`).

## Adding an example (for example PI, `examples/pi-2526`)

Only once the example is merged and complete:

1. Screenshots, 1280×800 at deviceScaleFactor 1.25 (1600×1000), served over
   HTTP, saved as WebP (quality 80) in `docs/assets/img/`: `pi-home.webp` and
   three more pages (`pi-<page>.webp`).
2. `docs/pt/exemplos/pi.html`: copy `ip.html` and rewrite the article (lead,
   notice callout with the authors and `NOTICE.md`, screenshots, pages table,
   `course.js`, personalisation, migration with a link to `MIGRACAO.md`).
3. `docs/nav.json`: `{ "title": "PI 2025/26", "path": "pt/exemplos/pi.html" }`
   in the "Exemplos" group, after IP.
4. `docs/pt/exemplos/index.html`: replace the `PI:` comment with a card and add
   a column to the comparison table.
5. `index.html` (landing): replace the `PI:` comment in "Mais cadeiras feitas
   com o kit" with a third figure.
6. `docs/pt/index.html` ("Próximos passos"), `docs/pt/migrar.html` ("Ver
   também"), `scripts/llms.mjs` (intro line and "Optional" list) and the
   licence paragraph of `README.md`.
7. `npm run build` (regenerates sidebars, `.md` files, `llms*.txt` and the
   search index), then `npm test`.
