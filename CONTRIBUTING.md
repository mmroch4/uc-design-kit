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
   backwards compatible; breaking changes go to a new major folder.

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
