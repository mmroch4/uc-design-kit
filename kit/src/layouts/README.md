# Layout style sheets

One file per layout of `<uc-page>` that is not in `uc-kit.css`
(`docs/architecture/themes-layouts.md` 3). `scripts/themes.mjs` minifies each
`<name>.css` into `kit/v1/layouts/<name>.css`; the build fails when the files
here and `FILE_LAYOUTS` in `kit/src/core/layouts.js` differ.

A theme with a layout imports its file with a relative URL, kept as written:

```css
/* kit/src/themes/institutional.css */
@import "../layouts/banner.css";
```

Every rule is wrapped in `:where()` and scoped to `.uc-page--<name>`, like the
rest of the kit, so a site's `theme.css` always wins.
