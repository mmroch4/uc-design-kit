# Documentation, phase 1 → phase 2 handoff

Phase 1 (PR "Docs phase 1") built the documentation frame, the landing page,
the Introduction and the full `<uc-week>` page as the pilot of the component
page model. The plan for all phases is in the project's plan document; this
note fixes the conventions the next phases must follow.

## Files

| Path | What it is |
| --- | --- |
| `index.html` | Landing page (PT). Uses the `docs:header` region only. |
| `docs/index.html` | Redirect stub to `pt/index.html` (also `_redirects` on Cloudflare). |
| `docs/nav.json` | Sidebar, in order: groups → pages (`title`, `path`, `code`, `component`). Labels of the frame per language. |
| `docs/pt/**.html` | Hand-written pages. Components live in `docs/pt/componentes/uc-<name>.html`. |
| `docs/assets/docs.css`, `docs.js` | Frame styles and behaviour (tabs, iframe height, mobile menu, "Nesta página"). |
| `docs/assets/kit-config.js` | `UC_COURSE` of the docs site itself (title, `languages: ["pt"]`). |
| `docs/assets/img/` | Screenshots (WebP, 2× and resized). |
| `docs/demos/course.js` | Fictional course "Algoritmos e Programação 2025/26", `today: "2025-11-27"` → week 10 (24–28 Nov). Deadlines `t2` (28 Nov), `teste` (10 Dec), `exame` (Jan 2026). |
| `docs/demos/<component>/<variant>.html` | One small page per demo; loads the kit, `../course.js`, `../demo.css`, `../demo.js`. |
| `scripts/docs.mjs` | Fills the generated regions (called by `npm run build`; `build:check` fails if stale). |
| `scripts/check-docs.mjs` | Nav ↔ files, h2 ids, local links and anchors, attribute coverage against `docs/api.md` (`npm test` runs it first). |

## Generated regions (never edit their content by hand)

```html
<!-- docs:header -->  <!-- /docs:header -->     every page, first in <body>
<!-- docs:sidebar --> <!-- /docs:sidebar -->    first child of .docs-layout
<!-- docs:pager -->   <!-- /docs:pager -->      after </article>, inside <main>
<!-- docs:toc -->     <!-- /docs:toc -->        inside <aside class="docs-aside">
<!-- docs:demo src="../../demos/uc-week/open.html" title="semana futura aberta" height="159" -->
<!-- /docs:demo -->
```

Write the markers empty and run `npm run build`. A demo shows the part of its
file between `<!-- demo:start -->` and `<!-- demo:end -->` (several pairs are
joined). `height` is the desktop height of the iframe in px (avoids a jump
before `demo.js` reports the real one); measure it once. A `?query` in `src`
is kept (e.g. `?lang=en`).

## Page skeleton

Copy `docs/pt/componentes/uc-week.html` (or `docs/pt/index.html` for a guide
page) and keep: the `<head>` order (kit CSS, `docs.css`, inline `docs-js`
class, `kit-config.js`, kit JS, `docs.js`), `<body class="docs">`,
`.docs-layout` > sidebar + `main#content.docs-main` > `article.docs-article`
+ pager, then `aside.docs-aside` > toc. Then add the page to `docs/nav.json`.

## Component page model (fixed by the pilot)

1. `header.docs-page-header`: eyebrow "Componentes · <grupo>", `<h1><code>&lt;uc-x&gt;</code></h1>`,
   `p.docs-lead` (one or two sentences), `p.docs-badges` with `uc-tag` badges
   ("Lê o course.js", "Usa JavaScript externo") when they apply.
2. Main demo right after the header, then one sentence explaining what it shows.
3. `h2#utilizacao` Utilização: minimal HTML + the `course.js` fields it needs (`<uc-code filename>`).
4. `h2#exemplos` Exemplos: one `h3` with id per variant, a sentence, its demo.
5. `h2#atributos` Atributos: `.uc-table` with columns Atributo / Tipo / Por omissão / Descrição.
   **First cell of each row = one attribute in `<code>`, exactly the names of
   api.md** (one row per name; `title-&lt;lang&gt;` for patterns). The coverage
   test compares both ways.
6. `h2#configuracao` Configuração usada: table Campo / Para quê.
7. Component-specific behaviour section if needed (uc-week: `h2#estados`).
8. `h2#personalizar`: table of stable classes + a `theme.css` example.
9. `h2#acessibilidade`: `.docs-grid-2` with two `.uc-card` ("O que o componente faz" / "O que cabe a quem escreve").
10. `h2#sem-javascript`, 11. `h2#ver-tambem`.

A component without attributes keeps `h2#atributos` with the sentence
"Não tem atributos." and no table.

## Conventions

- Portuguese (pt-PT), impersonal or third person for the teacher ("o professor",
  "copia-se a pasta"); code, ids of files and comments in code in English.
- Section ids: lowercase ASCII, no accents (`titulo-noutra-lingua`).
- Code blocks: `<uc-code lang="…" filename="…" no-download><pre><code>escaped</code></pre></uc-code>`.
- Demos use only the fictional course; EDados appears only as a real-world link
  or screenshot (its content is not MIT).
- Internal links use explicit `index.html` (pages must work from `file://`).
- Links to pages that do not exist yet are plain text (`<code>&lt;uc-weeks&gt;</code>`);
  link them when the page lands (phase 3 must revisit "Ver também" of uc-week
  and the component table of the Introduction). The "contrato da API" links on
  GitHub should point to the course.js page once phase 2 writes it.
- "Nesta página" is hidden below 1360 px so demo iframes stay above the kit's
  760 px breakpoint; the sidebar becomes a drawer below 960 px.

## Tests

- `npm run build` then `npm test`. Locally, pages with `<uc-code>` report a
  console error when cdnjs is unreachable (sandbox); CI has network.
- `check-docs.mjs --strict` makes missing component pages fail: switch the
  `test` script to it in phase 5 (now 13 pending).

## Issues found in the kit (to fix in separate PRs)

- JetBrains Mono ligatures turn `-<`, `->`, `<=` into single glyphs in code
  (e.g. `title-<lang>` reads "title—<lang>"). The docs disable them with
  `font-variant-ligatures: none`; the kit's `<uc-code>` and inline `code`
  probably should too.
- `<uc-code>` outside `<uc-page>` works (risk in the plan: checked, no issue).
