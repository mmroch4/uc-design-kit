# Documentation, phase 3 → phase 4 handoff

Phase 3 (PR "Docs phase 3") wrote the components group: the overview and the
13 remaining component pages, with their demos. Everything in
`phase-1-handoff.md` and `phase-2-handoff.md` still applies; this note adds
what phase 3 changed and what phase 4 (Estilos and Personalizar, plus the
theme customiser) needs.

## What exists now

| Path | What it is |
| --- | --- |
| `docs/pt/componentes/index.html` | Overview: one `h2` per group (`#estrutura`, `#datas-e-avisos`, `#calendario`, `#pessoas`, `#guioes-e-codigo`) with a grid of link cards (`.docs-components` > `.docs-component`), then `#regras-comuns`. |
| `docs/pt/componentes/uc-*.html` | All 14 component pages, same model as the `uc-week` pilot. |
| `docs/assets/img/components/<name>.webp` | Overview thumbnails, 640×400: the first demo of each page captured at 600×375, scale 2, resized. Regenerate when a component changes look (Playwright screenshot + Pillow; no script in the repo). |
| `docs/assets/img/uc-page-desktop.webp` | The full `<uc-page>` layout with the sidebar (iframes are narrower than the kit's 960 px breakpoint). |
| `docs/demos/<component>/*.html` | About 60 demos. |
| `docs/demos/index.html`, `semanas.html`, `avaliacao.html`, `sobre.html` | Pages of the demo course, so the navigation of the `<uc-page>` demos and the links of `<uc-this-week>`/`<uc-guide>` lead somewhere. `<uc-this-week>` fetches `semanas.html` (weeks 1–12) over HTTP. |
| `docs/demos/course.js` | Now also has `pages` (home, weeks, assessment, about), `platforms`, `team` (4 people), `notices` (7, one dated 1 Dec 2025 so it is hidden on the frozen date), `footer`, `updated`. |

`package.json` `test` now runs `check-docs.mjs --strict` (every component in
api.md must have a page).

## Conventions added

- **Generated-region markers must have the same indentation** on the opening
  and the closing line (`REGION` in `scripts/docs.mjs` matches the indent).
  A closing marker at column 0 under an indented opening one is silently
  skipped: the page gets no header, sidebar, pager or "Nesta página".
- **Demos without text when JavaScript is off** (an empty `<uc-hero>`,
  `<uc-this-week>`…) get a `<noscript><p>…</p></noscript>` after
  `<!-- demo:end -->`, so check-pages' "content without JS" passes and the
  line is not in the code shown.
- **Demo-specific configuration** goes in an inline `<script>` after
  `../course.js` with a one-line English comment (extra deadlines in the
  `uc-deadlines` demos, a Mooshak platform in `uc-exercise/mooshak.html`, a
  second language in the `?lang=en` demos).
- **`<uc-page>` demos** set `body { padding: 0 } uc-page { min-height: 0 }`
  inline; otherwise `min-height: 100vh` makes the iframe grow in a loop.
- **Behaviour sections** used by the pages, worth linking from phase 4/5:
  `uc-page.html#comportamento` and `#subpastas`; `uc-team.html#atributo-role`;
  `uc-deadlines.html#estados`; `uc-notices.html#datas`; `uc-date.html#formatos`;
  `uc-weeks.html#elementos-gerados`; `uc-this-week.html#pagina-de-semanas`;
  `uc-guide.html#indice-e-progresso`; `uc-exercise.html#feito` (localStorage
  key and `uc:exercisechange`) and `#problema-no-mooshak`;
  `uc-question.html#respostas`; `uc-code.html#execucao` (harness and tests)
  and `#configuracao` (runner defaults).
- Every page has `#personalizar` with its stable classes: phase 5's
  "Classes CSS estáveis" can be assembled from those tables.

## For phase 4

- Link from the new pages: the "Personalizar" sections of component pages are
  level 2 examples; `course-js.html` row `runner` now points to
  `uc-code.html#configuracao` and should point to the "Execução de código"
  page once it exists (also `uc-code.html`, which names it in plain text).
- Still to link when they land (plain text now): "Execução de código" and the
  other Personalizar pages from `estrutura.html#extensoes`, `course-js.html`,
  `uc-code.html`; Estilos pages (tokens, blocks) from the component pages'
  `#personalizar` sections if useful.
- Tokens used by components but missing from api.md section 5:
  `--uc-color-success-text`, `--uc-color-success-bg` (exercise, question,
  `uc-tag--success`), `--uc-notices-date-width`, `--uc-deadlines-date-width`,
  `--uc-header-height`, `--uc-gutter`. The Tokens page must decide whether
  they are public (then add them to api.md) or internal.
- Demo iframes are about 798 px wide at a 1280 px window: anything that needs
  the kit's desktop layout (≥ 960 px) needs a screenshot, like
  `uc-page-desktop.webp`.

## Issues found in the kit

Fixed in a separate PR after this one (see its description): the harness of
`<uc-code run>` visible without JavaScript; "Testar no {platform}" assuming a
masculine name; bold code inside a `<uc-question>` prompt; the `<uc-guide>`
fallback link to `weeks.html` not resolved against `course.js`.

Documented as the code behaves, left for a decision (they would change
behaviour or the contract):

- `<uc-deadlines view="table">`: multi-day ranges have no year
  ("24–30 nov") although api.md says the table shows the year; the table has
  no separate links column (api.md says "status and links columns"); the
  list shows no kind badge (api.md 2.5 says `kind` "drives the badge").
- `<uc-team role>` splits on spaces, so a free-text role of more than one
  word cannot be filtered. With children, the element stays visible when no
  member matches (api.md: "hidden").
- `current`, `role` and other attributes are read once; changing them later
  does not re-render (no `attributeChangedCallback`).
- `<uc-week>` only skips a deadline when the hand-written
  `<uc-event deadline>` is inside that week; `<uc-weeks>` checks the whole
  list. Month-only deadlines inside the semester appear in no week.
- A break that touches any teaching day turns the whole week into a break.
- `<uc-code run>` shows "Executar" even when no runner is registered for the
  language (`UC.internal.canRun` exists but is unused).
- The `data-explanation` of `<uc-question>` is visible without JavaScript.
- Still open from phase 2: deadline `url`/`links` and links inside notices are
  relative to the page that shows them, not to `course.js`.
