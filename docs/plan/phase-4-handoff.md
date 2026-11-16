# Documentation, phase 4 → phase 5 handoff

Phase 4 (PR "Docs phase 4") wrote the Estilos group (9 pages), the
Personalizar group (8 pages) and the theme customiser. Everything in the
handoffs of phases 1–3 still applies; this note adds what phase 4 changed and
what phase 5 (Exemplos, Referência, Ctrl K search, final coverage, links in
README/api.md/CONTRIBUTING, screenshots) needs.

## What exists now

| Path | What it is |
| --- | --- |
| `docs/pt/estilos/index.html` | Princípios de design. Ids: `simples`, `leve`, `acessivel`, `hierarquia`, `densidade`, `escolher-o-bloco` (h3 `cartao`, `caixa`, `tabela`). |
| `docs/pt/estilos/cor.html` | `paleta`, `neutras`, `destaque`, `estado`, `contraste`. Swatches and contrast ratios read live. |
| `docs/pt/estilos/tipografia.html` | `familias` (h3 `sem-ligaduras`), `escala`, `titulos`, `introducao-e-texto` (uc-lead, uc-prose), `uc-content`, `utilitarios`. |
| `docs/pt/estilos/espaco.html` | `escala`, `cantos`, `larguras`, `alvos-de-toque`, `foco`. |
| `docs/pt/estilos/tokens.html` | One row per token: `como-mudar`, `cor` (h3 `cor-destaque`, `cor-neutras`, `cor-estado`), `tipografia`, `espaco-e-forma`, `layout`, `tokens-locais`, `internas`. |
| `docs/pt/estilos/layout.html` | `section`, `stack`, `grid`, `split`. |
| `docs/pt/estilos/superficies.html` | `card`, `callout`, `links`, `shortcuts`, `checklist`, `bullets`. |
| `docs/pt/estilos/elementos.html` | `button`, `tag`, `table`, `pre-data-copy`, `utilitarios` (h3 `muted`, `mono`, `small`), `visually-hidden`. |
| `docs/pt/estilos/acessibilidade.html` | `objetivo`, `o-que-o-kit-garante`, `o-que-cabe-a-quem-escreve`, `lista`, `verificar`. |
| `docs/pt/personalizar/index.html` | Levels overview: `niveis`, `escolher`, `estabilidade`, `caso-real`. |
| `docs/pt/personalizar/course-js.html` | Level 0: `cor`, `logotipo`, `paginas`, `linguas`, `limites`. |
| `docs/pt/personalizar/tokens.html` | Level 1: `theme-css`, `cor`, `cantos`, `letra`, `antes-e-depois`, `locais`, `lista`. |
| `docs/pt/personalizar/css.html` | Level 2: `classes-estaveis`, `especificidade`, `exemplos`, `nao-estavel`, `cascata`. |
| `docs/pt/personalizar/componentes.html` | Level 3 tutorial (`<uc-binary-search>`): `quando`, `ficheiros`, `nome`, `estrutura`, `ciclo`, `textos`, `eventos`, `exemplo`, `estilos`, `acessibilidade`, `sem-javascript`, `caso-real`. |
| `docs/pt/personalizar/html.html` | Level 4: `dentro-da-pagina`, `uc-content`, `regras`, `o-que-funciona`, `o-que-nao-funciona`. |
| `docs/pt/personalizar/tema.html` | Theme customiser (`docs/assets/theme-editor.js`). State in the hash: `#accent=0F766E&radius=4&size=16&font=system&width=1200`. |
| `docs/pt/personalizar/execucao.html` | Runners: `como-funciona`, `codapi-publico`, `codapi-proprio`, `judge0`, `browser`, `contrato`, `cuidados`. |
| `docs/assets/styles.js` | Live token values on the Estilos pages: `data-token="--uc-…"` + `data-kind="color|length|raw"`, `data-contrast="fg bg"`. The markup holds the defaults (correct without JS). |
| `docs/demos/blocks/`, `styles/`, `customize/` | Demos of the new pages. `customize/extensions/` has the level 3 example component and an inspecting runner. |
| `docs/demos/theme/` | Copies of the demo course pages wrapped in `<uc-page>` for the customiser preview; `preview.js` receives tokens by `postMessage` (works from `file://`) and keeps navigation inside `demos/theme/`. The original `docs/demos/*.html` course pages are untouched. |

Existing pages now link the new ones: `course-js.html` (row `runner` →
`personalizar/execucao.html`), `uc-code.html`, `estrutura.html#extensoes`,
`linguas.html#outra-lingua`, and one identical sentence in `#personalizar` of
the 14 component pages (→ `personalizar/css.html`, `estilos/tokens.html`).

## api.md changes (additive, documentation of existing behaviour)

- Section 5 now lists every token the kit defines: success/danger colours,
  the font-size scale, line heights, `--uc-header-height`, `--uc-gutter`,
  and a **Local tokens** table (not defined on `:root`, read with a fallback):
  `--uc-grid-min`, `--uc-grid-gap`, `--uc-stack-gap`, `--uc-table-min`,
  `--uc-card-padding`, `--uc-main-gap`, `--uc-guide-gap`,
  `--uc-notices-date-width`, `--uc-deadlines-date-width`.
  `--uc-disclosure-icon` stays internal (listed on the Tokens page as such).
- The derived accent values were wrong (`#EFF4FF`/`#F3F6FF`); now `#EDF1FC`
  (8% accent on white) and `#F4F6FD` (5%).

## Tests added to `check-docs.mjs`

- **Blocks**: every name in the first column of api.md section 4 must be the
  text of a `<code>` in an h2/h3 of `estilos/layout.html`, `superficies.html`,
  `elementos.html` or `tipografia.html`; on the three Blocos pages any
  `uc-…` code in a heading must be a section 4 name (catches typos).
- **Tokens**: every token of api.md section 5 needs a row (first `<code>`) on
  `estilos/tokens.html`; ranges with `…` expand to every kit token with that
  prefix; every `--uc-` row must be in api.md or defined/read in `kit/src/css`.

Phase 5 still has to add: stable classes (Referência) coverage, and the
course.js/JS API coverage for the Referência pages.

## Conventions added

- Wide tool pages: `body.docs docs-theme-page` hides "Nesta página" at every
  width so the tool spans the main column (prose stays 800 px).
- Short class tables use `.docs-compact` (`--uc-table-min: 0`).
- `docs.css` has one section per group at the end (theme customiser, blocks,
  styles, customisation). Keep new rules in the section of their page.

## For phase 5

- Referência "API JavaScript" must document `UC.Element#setup()` (used by the
  kit and by EDados; api.md section 7 only names `render()`) and the
  `uc:ready` timing (see below). "Runners" can link `personalizar/execucao.html#contrato`.
- "Classes CSS estáveis" can be assembled from the `#personalizar` tables of
  the component pages and the class tables of the Blocos pages.
- Exemplos "EDados" can link `personalizar/index.html#caso-real` and
  `personalizar/componentes.html#caso-real`.

## Issues found in the kit

Fixed in a separate PR after this one (see its description), without API
changes: see "Kit fixes found while documenting styles" PR.

Left for a decision (behaviour or contract):

- `accentColor` is applied inline on `<html>`, so it always beats
  `--uc-color-accent` in `theme.css`; the template's `course.js` sets it, so
  api.md section 8's level 1 example has no effect on a template site. The
  pages document the precedence.
- `uc:ready` fires before extension scripts loaded with `defer` after the kit
  run, so it is useless to them (documented on the level 3 page).
- `logo` is relative to the page (like deadline/notice links), unlike
  `pages[].href`.
- `data-uc-keep-lang` (keeps a passage in another configured language
  visible) works and is recommended on the accessibility page, but is not in
  api.md.
- api.md describes `uc-section` as spacing between sections; it spaces its own
  children (16 px).
- `uc-tag--muted` looks the same as the plain `uc-tag`.
- `<pre data-copy>` outside `uc-content` has no box (background, padding).
- Hard-coded radii (10px in `uc-shortcuts`, uc-event, uc-weeks, uc-question;
  4px uc-guide; 5px uc-exercise) ignore `--uc-radius-*`.
- `--uc-color-danger-bg` is defined but unused; `text-subtle` on
  `surface-muted` is 4.40:1.
- `uc-links`/`uc-shortcuts`/`uc-checklist` with `list-style: none` lose list
  semantics in Safari/VoiceOver (would need `role="list"` in the markup).
- Still open from phases 2–3: the api.md/code differences listed in
  `phase-3-handoff.md`, and deadline/notice links relative to the page.
