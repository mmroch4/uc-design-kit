# Deployment (Cloudflare Pages)

The repository is published as-is: there is no build step. The kit is served
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
domain can load the kit, and basic security headers. The kit is served with
`Cache-Control: public, max-age=300, stale-while-revalidate=604800`: for five
minutes browsers use their copy without asking, and after that they still use
it straight away while checking for a new version in the background. Pages
therefore never wait for the kit on a repeat visit. The price is that the
first visit after a deploy may still use the previous kit once, which is fine
because `kit/v1/` stays backwards compatible. Each example's `course.js` and
`theme.css` use the same rule with `max-age=60`.

The fonts (Inter and JetBrains Mono) are served from `kit/v1/fonts/`, so a
page makes no requests to third-party servers to render.

Cloudflare Pages redirects `page.html` to `page` (a 308 redirect, about
100 ms). Links keep the `.html` extension so that sites also work from any
other web server and from the file system; on a department server there is no
redirect.

On a custom domain, Cloudflare's zone settings can override this. In the
domain's dashboard, set **Caching → Configuration → Browser Cache TTL** to
**Respect Existing Headers**, and after changing it use **Purge Everything**
once.

## Releasing

- Commits to `main` are deployed automatically.
- `kit/v1/` must stay backwards compatible (see `docs/api.md`, section 9).
- Tag releases `vX.Y.Z` and update `CHANGELOG.md`.
