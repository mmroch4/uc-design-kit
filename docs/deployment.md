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
domain can load the kit, a one-hour cache for the kit (fixes inside `v1` are
picked up within the hour), and basic security headers.

## Releasing

- Commits to `main` are deployed automatically.
- `kit/v1/` must stay backwards compatible (see `docs/api.md`, section 9).
- Tag releases `vX.Y.Z` and update `CHANGELOG.md`.
