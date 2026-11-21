# Deployment (Cloudflare Pages)

The repository is published as-is: there is no build step on Cloudflare (the
built kit is committed, see *Building*). The kit is served
from `https://uc-design-kit.miguelrocha.dev/kit/v1/` and the examples from
`https://uc-design-kit.miguelrocha.dev/examples/…`.

## One-time setup

1. In the Cloudflare dashboard open **Workers & Pages → Create → Pages →
   Connect to Git** and choose the GitHub repository `mmroch4/uc-design-kit`.
2. Build settings:
   - Production branch: `main`
   - Framework preset: **None**
   - Build command: *(leave empty)*
   - Build output directory: `/`
3. Save and deploy. The site appears at `https://<project>.pages.dev`.
4. **Custom domains → Set up a custom domain →** `uc-design-kit.miguelrocha.dev`.
   When `miguelrocha.dev` is managed by Cloudflare DNS the CNAME record is
   created automatically.
5. Every pull request gets a preview URL (`https://<hash>.<project>.pages.dev`),
   posted on the PR by the Cloudflare GitHub app.

## Headers

`_headers` (repository root) sets CORS for `/kit/*` so course sites on any
domain can load the kit (and its fonts), basic security headers, and the
cache rules below. Cloudflare joins the values when two rules set the same
header, so the `Cache-Control` rules match disjoint paths.

| Path | `Cache-Control` | Why |
| --- | --- | --- |
| `/kit/v1/*` | `public, max-age=300, stale-while-revalidate=604800` | Major version alias, updated in place |
| `/kit/v1.*` (e.g. `/kit/v1.0.0/`) | `public, max-age=31536000, immutable` | Frozen release, never changes |
| `/examples/*/course.js`, `theme.css` | `public, max-age=60, stale-while-revalidate=86400` | Edited often |

With `kit/v1/`, browsers use their copy for five minutes without asking and
after that still use it straight away while checking for a new version in the
background, so pages never wait for the kit on a repeat visit; the first visit
after a deploy may still use the previous kit once, which is fine because
`kit/v1/` stays backwards compatible. A frozen release is never checked again
for a year, not even on reload.

When adding a major version, add the same two rules for `/kit/v2/*` and
`/kit/v2.*`. `npm run snapshot` refuses to create a release without its rule.

The fonts (Inter and JetBrains Mono) are served from the kit folder, so a page
makes no requests to third-party servers to render. `_headers` adds a
`Link: …; rel=preload` header for `fonts/inter-latin.woff2` to the example
pages, which Cloudflare also sends as an Early Hint (103) before the page
itself. Course sites hosted elsewhere use `<link rel="preload">` instead (see
`docs/api.md`, section 1).

Cloudflare Pages redirects `page.html` to `page` (a 308 redirect, about
100 ms). Links keep the `.html` extension so that sites also work from any
other web server and from the file system; on a department server there is no
redirect.

On a custom domain, Cloudflare's zone settings can override this. In the
domain's dashboard, set **Caching → Configuration → Browser Cache TTL** to
**Respect Existing Headers**, and after changing it use **Purge Everything**
once.

## Building

There is still no build step on Cloudflare: the built files are committed.
After changing anything in `kit/src/`, run `npm run build`. It concatenates
the files listed in `kit/src/manifest.json`, minifies them with esbuild and
writes `kit/v1/uc-kit.{js,css}` with their source maps. CI runs
`npm run build:check`, which fails when the committed build is out of date or
a frozen release was modified.

## Releasing

1. Set the version in `package.json`, its only source: `npm run build` writes
   it into `kit/src/core/namespace.js` (`UC.version`),
   `widgets/src/core/version.js` and `template/uc-site.py`, and
   `npm run build:check` fails when they differ. Move the *Unreleased* notes in
   `CHANGELOG.md` under it.
2. `npm run build`, then `npm run snapshot`: copies `kit/v1/` to
   `kit/vX.Y.Z/` and writes its `SHA256SUMS`.
3. Commit, merge to `main` (deployed automatically) and tag `vX.Y.Z`.
4. Set the version back to the next `-dev` version.

Never edit a frozen release: publish a new version instead. `kit/v1/` must stay
backwards compatible (see `docs/api.md`, section 9).

### Widget library releases

The widgets (`widgets/v1/`) share the kit's version (from `package.json`,
`docs/architecture/widgets-api.md` 2.2) and its `vX.Y.Z` tag. `KIT_MIN` in
`widgets/src/core/version.js` is the oldest kit they work with.

1. Every widget's `meta.json` has `"status": "stable"` (the snapshot refuses
   otherwise). Move the *Widgets* notes in `CHANGELOG.md` under `## Widgets [X.Y.Z]`.
2. `npm run build`, then `npm run snapshot:widgets`: copies `widgets/v1/` to
   `widgets/vX.Y.Z/` and writes its `SHA256SUMS`. `npm run build:check`
   verifies the checksums of every release, kit and widgets.
3. Commit and merge to `main` with the kit's `vX.Y.Z` tag. From then on the check
   opens `tests/widgets/compat.html` against `widgets/v1/` and against every
   frozen release: the 1.0.0 attributes, `ops` verbs, methods and events must
   keep working.

## Mirror on jsDelivr (fallback)

jsDelivr serves any tagged version of a public GitHub repository, with no
setup. Every release is therefore also available at:

```
https://cdn.jsdelivr.net/gh/mmroch4/uc-design-kit@v1.1.0/kit/v1.1.0/uc-kit.css
https://cdn.jsdelivr.net/gh/mmroch4/uc-design-kit@v1.1.0/kit/v1.1.0/uc-kit.js
```

It is not faster than Cloudflare Pages (both are global CDNs, and browsers no
longer share caches between sites), so the kit's own domain stays the
default. Use the mirror only if that domain is unavailable: replace
`https://uc-design-kit.miguelrocha.dev/kit/v1.1.0/` with the URL above in the
page `<head>`. The fonts load from the same place because `uc-kit.css` refers
to them by relative path.
