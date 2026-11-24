/**
 * Ready-made themes (docs/api.md 8.1 and 8.3): `theme` in course.js names one
 * or more files of kit/v1/themes/. Each is added as a <link> right after
 * uc-kit.css, so the teacher's theme.css, loaded later, still wins. A theme
 * already linked by the page is not added again. The page is shown once they
 * have loaded (core/bootstrap.js), within the same wait as the fonts.
 *
 * Two kinds of theme: themes with a layout (LAYOUT_THEMES) also choose the
 * layout of <uc-page> with --uc-layout and @import its file; token themes only
 * change tokens and combine with any of them. A list keeps one theme with a
 * layout: the last one. "classic" is the kit's own look, already in
 * uc-kit.css, so naming it downloads nothing.
 */
(function (UC) {
  "use strict";
  if (UC.__duplicate) return;

  const THEMES = ["classic", "institutional", "handbook", "compact", "serif", "high-contrast"];
  const LAYOUT_THEMES = ["classic", "institutional", "handbook"];
  const DEFAULT_THEME = "classic";

  const known = [].concat(UC.course.theme || []).filter((name) => {
    if (THEMES.includes(name)) return true;
    console.warn(`[uc-kit] course.js: unknown theme "${name}" (themes: ${THEMES.join(", ")})`);
    return false;
  });
  const withLayout = known.filter((name) => LAYOUT_THEMES.includes(name));
  if (withLayout.length > 1) {
    console.warn(`[uc-kit] course.js: only one theme with a layout can be used; "${withLayout[withLayout.length - 1]}" wins over ${withLayout.slice(0, -1).map((name) => `"${name}"`).join(", ")}`);
  }
  const names = known.filter((name, index) => (!LAYOUT_THEMES.includes(name) || name === withLayout[withLayout.length - 1]) && name !== DEFAULT_THEME && known.indexOf(name) === index);

  const linked = (name) => Array.from(document.querySelectorAll("link[rel~=stylesheet]")).some((link) => new RegExp(`themes/${name}\\.css([?#]|$)`).test(link.href));
  let anchor = document.querySelector('link[rel~=stylesheet][href*="uc-kit"]');
  const loads = names.filter((name) => !linked(name)).map((name) => {
    const link = UC.internal.h("link", { rel: "stylesheet", href: UC.internal.kitUrl(`themes/${name}.css`) });
    const loaded = new Promise((resolve) => {
      link.addEventListener("load", resolve);
      link.addEventListener("error", () => {
        console.warn(`[uc-kit] could not load the theme ${link.href}. Copy the whole kit/v1 folder.`);
        resolve();
      });
    });
    if (anchor) anchor.after(link);
    else document.head.prepend(link);
    anchor = link;
    return loaded;
  });

  const ready = Promise.all(loads);
  /** Resolves once the themes of course.js have loaded or failed; never rejects. */
  UC.internal.themesReady = () => ready;
  UC.internal.themes = THEMES;
  UC.internal.layoutThemes = LAYOUT_THEMES;
})(window.UC);
