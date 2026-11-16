# Documentation, phase 2 → phase 3 handoff

Phase 2 (PR "Docs phase 2") wrote the "Começar" group, the starter template
and its zip. Everything in `phase-1-handoff.md` still applies; this note adds
what phase 2 changed and what phase 3 (the 13 remaining component pages and
the components overview) needs.

## What exists now

| Path | What it is |
| --- | --- |
| `docs/pt/criar-site.html` | Six steps from the download to publishing. Demos in `docs/demos/getting-started/`. |
| `docs/pt/estrutura.html` | Folder layout, `<head>`, `pages`, subfolders (`#subpastas`), links (`#links`), extensions (`#extensoes`). |
| `docs/pt/course-js.html` | Every `course.js` field. Section ids: `#tipos`, `#campos` (h3: `#campos-curso`, `#campos-linguas`, `#campos-semestre`, `#campos-navegacao`, `#campos-conteudo`, `#campos-avancado`), `#paginas`, `#equipa`, `#prazos`, `#avisos`, `#erros-comuns`. |
| `docs/pt/linguas.html` | In-place content (`#mesma-pagina`, demo `docs/demos/languages/in-place.html`), one file per language (`#ficheiros`), `#outra-lingua`. |
| `docs/pt/novo-ano.html` | Checklist for a new academic year; `#kit` explains moving to a newer fixed version. |
| `docs/pt/publicar.html` | `#dcc` (`~/public_html`, scp, rsync, permissions), `#github-pages`, `#cloudflare`, `#versao`, `#cache`. |
| `template/` | Starter site (index, semanas, avaliacao, sobre, `course.js`, `theme.css`, `README.txt`). Loads the kit from `https://uc-design-kit.miguelrocha.dev/kit/v1/` so it works from disk. Comments in PT (teacher-facing, like the EDados example). |
| `scripts/template-zip.mjs` | Packs `template/` into `docs/downloads/uc-template.zip` (stored, sorted, fixed date). Run by `npm run build`; `build:check` fails when stale. `.gitattributes` keeps `template/` in LF. |
| `docs/assets/img/template-home.webp` | Screenshot of the template (1280×800 at 1.25×, `?today=2026-09-24`, served over HTTP so "Esta semana" is complete). |

## Conventions added

- **Linking `course.js` fields from a component page**: use
  `../course-js.html#campos-semestre` (or the other ids above), not api.md on
  GitHub. The "Configuração usada" table of each component page should link
  each field this way.
- **Field tables** use `<div class="uc-table docs-fields">` with columns
  "Campo e tipo / Necessário / Por omissão / Descrição"; the type goes in
  `<span class="docs-type">` under the name. Only the course.js page uses it.
- **Requirement tags**: `uc-tag--warning` Obrigatório, `uc-tag--accent`
  Recomendado, `uc-tag--muted` Opcional.
- **Demo with another date**: `?today=YYYY-MM-DD` in the `docs:demo` `src`
  (e.g. `first-week.html?today=2025-09-17`); with another language,
  `?lang=en` and a page-level `UC_COURSE.languages = ["pt", "en"]` (see
  `languages/in-place.html`).
- Pages for groups not written yet are named in plain text ("no grupo
  Personalizar (em preparação)"): phase 4 must link them in
  `estrutura.html#extensoes`, `course-js.html` (row `runner`) and
  `linguas.html` if relevant.

## Tests added

- `check-docs.mjs` compares the first column of each table in `docs/api.md`
  section 2 (2.1–2.6) with the first `<code>` of the rows in the matching h2
  of `course-js.html` (`COURSE_SECTIONS`). A new subsection in api.md needs a
  new entry there.
- `check-pages.mjs` answers requests to the public kit URL from `kit/` on
  disk (`newContext`), so pages that use absolute kit URLs (the template) test
  the local kit and need no network.

## For phase 3

- Link the new component pages from: `docs/pt/index.html` (table "O que
  inclui"), `uc-week.html` "Ver também", `criar-site.html` table of template
  files (`<uc-hero>`, `<uc-this-week>`…), `course-js.html` descriptions
  (`<uc-hero>`, `<uc-team>`, `<uc-weeks>`, `<uc-date deadline>`,
  `<uc-event deadline>`), `estrutura.html#pagina` (`<uc-page>`).
- The template is a ready source of realistic markup for demos, but demos must
  keep using `docs/demos/course.js` (fictional course, frozen date).

## Issues found in the kit

- `UC.addTranslations` called from a script loaded after the kit (the way
  `linguas.html#outra-lingua` documents adding a language) does not affect
  the first render: components are defined when the deferred kit runs, before
  the extension script. Fixed in a separate PR (re-render on new
  translations for the active language).
- Deadline `url`/`links` and links inside notices are relative to the page
  that shows them, not to `course.js` (only `pages[].href` is). Documented as
  such in `estrutura.html#subpastas`; resolving them against `course.js`
  would be a behaviour change, left for a decision.
- Phase 1's ligature note (JetBrains Mono joins `-<`, `->` in kit code
  blocks) still applies to the kit's own `<uc-code>`.
