# Contributing

## Principles

1. **No build for users.** Teachers must be able to use the kit by linking two
   files. Maintainer tooling (tests, bundling) lives in `scripts/` and
   `package.json` and is optional for users.
2. **The contract comes first.** `docs/api.md` defines the configuration
   schema, component names and attributes, CSS custom properties and i18n keys.
   Change it in its own pull request before changing code that depends on it.
3. **One component, one file.** `kit/src/components/uc-<name>.js` and
   `kit/src/css/components/uc-<name>.css`, plus a test page
   `tests/pages/uc-<name>.html` showing every state.
4. **Light DOM, classic scripts.** Components render into the light DOM so
   global CSS applies to teacher content, and are loaded as classic scripts
   (not ES modules) so pages work from `file://`.
5. **Accessible by default.** WCAG 2.1 AA, keyboard operable, visible focus,
   44 px touch targets, no information conveyed by colour alone.
6. **Never break a published major version.** Anything in `kit/v1/` stays
   backwards compatible; breaking changes go to a new major folder. Frozen
   releases (`kit/vX.Y.Z/`) are never modified at all.

## Code style

- Modern JavaScript (ES2020), no framework, no transpilation.
- English for all identifiers, comments and commit messages.
- Small, pure helpers in `kit/src/core/`; components only orchestrate.
- No user-facing strings in code: use the i18n dictionaries.
- CSS: custom properties prefixed `--uc-`, classes prefixed `uc-`,
  low specificity (`:where()`), so teachers can override easily.

## Workflow

- Branch per milestone: `m<phase>.<n>-<short-name>`.
- Run `npm test` before opening a pull request and attach the screenshots.
- Update `CHANGELOG.md` under *Unreleased*.

## Tests

```sh
npm ci                      # installs Playwright and axe-core (maintainers only)
npx playwright install chromium
npm test                    # checks every page; add a filter: npm test -- uc-week
npm run test:update-screenshots   # also writes tests/screenshots/*.png
```

`scripts/check-pages.mjs` checks every HTML page in `tests/pages/`,
`examples/`, `template/` and the root `index.html`: console errors over HTTP
and `file://`, missing local files, horizontal scrolling at 360 px, axe-core
WCAG 2.1 A/AA (serious and critical violations fail), and visible content with
JavaScript disabled. Pages are loaded with `?today=2025-11-27` (override with
`TEST_TODAY`) so date-dependent output is stable.

## Documentation

The documentation pages in `docs/pt/` are hand-written HTML. Header, sidebar,
"Nesta página", previous/next links and the code of each demo are generated
by `npm run build` between `<!-- docs:… -->` markers (see `scripts/docs.mjs`);
never edit inside them. When you add an attribute to `docs/api.md`, add it to
the component's "Atributos" table: `npm test` fails until the two match.
Conventions for new pages: `docs/plan/phase-1-handoff.md`.
