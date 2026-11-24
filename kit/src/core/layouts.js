/**
 * Layouts of <uc-page> (docs/api.md 8.3, docs/architecture/themes-layouts.md).
 *
 * A page's layout is the first valid value of, in order:
 *   1. its `layout` attribute,
 *   2. `layout` in course.js,
 *   3. `--uc-layout` on :root (a theme with a layout, or the site's theme.css),
 *   4. "sidebar".
 * A value that is not a known layout (or whose style sheet failed to load) is
 * skipped with a console warning, so the next level decides.
 *
 * The layouts of uc-kit.css are always there. The others are files of
 * kit/v1/layouts/, added as a <link> only when a page uses one. A theme with
 * a layout @imports its file, so it arrives with the theme; when the layout
 * comes from the attribute or course.js the kit adds the <link> at the first
 * render. The page is shown once they have loaded (core/bootstrap.js, the
 * same 300 ms wait as the themes and fonts).
 *
 * UC.registerLayout(name, { extends, css }) adds a site's own layout: the
 * structure of a kit layout plus a style sheet. The page gets the classes of
 * both (its kit layout's and its own).
 */
(function (UC) {
  "use strict";
  if (UC.__duplicate) return;

  /** Layouts styled by uc-kit.css. "sidebar" is the default and has no class. */
  const BUILT_IN = ["sidebar", "top", "full"];
  /** Layouts with a file kit/v1/layouts/<name>.css (built from kit/src/layouts/ by scripts/themes.mjs). */
  const FILE_LAYOUTS = ["banner", "docs", "centered"];
  const LAYOUTS = BUILT_IN.concat(FILE_LAYOUTS);
  const DEFAULT = "sidebar";
  const NAME = /^[a-z][a-z0-9-]*$/;

  /** Site layouts: name → { base, chain, css }. `chain` lists the site layouts from the outermost to `name`. */
  const registered = new Map();
  /** Style sheets added or found, by absolute URL → { promise, failed }. */
  const sheets = new Map();
  const warned = new Set();

  function warn(message) {
    if (warned.has(message)) return;
    warned.add(message);
    console.warn(`[uc-kit] ${message}`);
  }

  /** The style sheets a layout needs: its kit file, then the files of the site layouts it builds on. */
  function sheetsOf(name) {
    const site = registered.get(name);
    const base = site ? site.base : name;
    // A kit layout file is not linked when it is already there (imported by a theme): it sets --uc-layout-<name>-loaded.
    const present = getComputedStyle(document.documentElement).getPropertyValue(`--uc-layout-${base}-loaded`).trim();
    const urls = FILE_LAYOUTS.includes(base) && !present ? [UC.internal.kitUrl(`layouts/${base}.css`)] : [];
    if (site) site.chain.forEach((part) => registered.get(part).css && urls.push(registered.get(part).css));
    return urls;
  }

  /** A layout can be used when it is known and none of its style sheets failed. */
  function usable(name) {
    if (!LAYOUTS.includes(name) && !registered.has(name)) return false;
    return sheetsOf(name).every((url) => !(sheets.get(url) || {}).failed);
  }

  /** Adds the <link> of `url` once (unless the page or a theme already links it). */
  function link(url) {
    if (sheets.has(url)) return sheets.get(url).promise;
    const entry = { failed: false };
    const present = Array.from(document.querySelectorAll("link[rel~=stylesheet]")).some((node) => node.href === url);
    if (present) {
      entry.promise = Promise.resolve();
    } else {
      const node = UC.internal.h("link", { rel: "stylesheet", href: url });
      entry.promise = new Promise((resolve) => {
        node.addEventListener("load", resolve);
        node.addEventListener("error", () => {
          entry.failed = true;
          warn(`could not load the layout style sheet ${url}${url.startsWith(UC.internal.kitUrl("")) ? ". Copy the whole kit/v1 folder." : ""}`);
          resolve();
          rerenderPages();
        });
      });
      // After the kit and the themes, before the site's theme.css, which still wins.
      const after = Array.from(document.querySelectorAll('link[rel~=stylesheet][href*="uc-kit"], link[rel~=stylesheet][href*="/themes/"], link[rel~=stylesheet][href*="/layouts/"]')).pop();
      if (after) after.after(node);
      else document.head.append(node);
    }
    sheets.set(url, entry);
    return entry.promise;
  }

  /** Loads the style sheets of layout `name` (nothing for the layouts of uc-kit.css). */
  function load(name) {
    if (usable(name)) sheetsOf(name).forEach(link);
  }

  /**
   * Value of the custom property --uc-<name> on :root, without quotes, or "".
   * Read from the page until the themes and layouts have loaded, then kept:
   * the kit reads each choice once.
   */
  const kept = {};
  let settled = false;
  function themeValue(name) {
    if (name in kept) return kept[name];
    const value = getComputedStyle(document.documentElement).getPropertyValue(`--uc-${name}`).trim().replace(/^(["'])(.*)\1$/, "$2");
    if (settled) kept[name] = value;
    return value;
  }

  /** The layout of a <uc-page> (or of the site, without one), by the precedence above. */
  function resolve(page) {
    const levels = [
      [page && page.getAttribute("layout"), "<uc-page layout>"],
      [UC.course.layout, "course.js layout"],
      [themeValue("layout"), "--uc-layout"],
    ];
    for (const [value, where] of levels) {
      if (!value) continue;
      if (usable(value)) return value;
      // A site layout may be registered by a script after the kit: warn once everything has loaded.
      if (!settled || LAYOUTS.includes(value) || registered.has(value)) continue;
      warn(`${where}: unknown layout "${value}" (layouts: ${LAYOUTS.concat(Array.from(registered.keys())).join(", ")})`);
    }
    return DEFAULT;
  }

  /** The kit layout whose structure `name` uses. */
  function base(name) {
    return registered.has(name) ? registered.get(name).base : name;
  }

  /** Classes for the <uc-page> of layout `name`: .uc-page--<base> (none for sidebar), then one per site layout. */
  function classes(name) {
    const site = registered.get(name);
    const list = base(name) === DEFAULT ? [] : [`uc-page--${base(name)}`];
    return site ? list.concat(site.chain.map((part) => `uc-page--${part}`)) : list;
  }

  /** Renders again the <uc-page> elements whose layout is no longer the one they were drawn with. */
  function rerenderPages() {
    document.querySelectorAll("uc-page").forEach((page) => {
      if (page.__ucSetupDone && page.isConnected && page.layout !== resolve(page)) page.render();
    });
  }

  /**
   * UC.registerLayout(name, { extends, css }) (docs/api.md 7): a site layout
   * with the structure of `extends` (a kit layout or another site layout,
   * default "sidebar") and an optional style sheet `css`, written relative to
   * course.js like the other links of the site. Call it after uc-kit.js.
   */
  UC.registerLayout = function registerLayout(name, options = {}) {
    const parent = options.extends || DEFAULT;
    if (typeof name !== "string" || !NAME.test(name)) return warn(`registerLayout: "${name}" is not a valid name (lower-case letters, digits and "-")`);
    if (LAYOUTS.includes(name)) return warn(`registerLayout: "${name}" is a layout of the kit; choose another name`);
    if (!LAYOUTS.includes(parent) && !registered.has(parent)) return warn(`registerLayout: "${name}" extends the unknown layout "${parent}"`);
    const css = typeof options.css === "string" && options.css ? new URL(UC.internal.resolvePageHref(options.css), document.baseURI).href : null;
    const chain = registered.has(parent) ? registered.get(parent).chain.concat(name) : [name];
    registered.set(name, { base: base(parent), chain, css });
    rerenderPages();
  };

  /** Loads what the pages and the CSS level ask for, until nothing new is being loaded. */
  function loadAll() {
    const css = themeValue("layout");
    if (css) load(css);
    document.querySelectorAll("uc-page").forEach((page) => load(resolve(page)));
    const pending = Array.from(sheets.values(), (entry) => entry.promise);
    return Promise.all(pending).then(() => (sheets.size > pending.length ? loadAll() : undefined));
  }

  let ready = null;
  /**
   * Resolves once the themes (core/themes.js) and every layout style sheet the
   * page needs have loaded or failed, after drawing again the pages whose
   * layout came from the CSS. Never rejects.
   */
  UC.internal.layoutsReady = function layoutsReady() {
    if (!ready) {
      // Scripts after the kit (UC.registerLayout) run before DOMContentLoaded.
      const parsed = new Promise((resolve) => {
        if (document.readyState === "complete") return resolve();
        document.addEventListener("DOMContentLoaded", resolve, { once: true });
        window.addEventListener("load", resolve, { once: true });
      });
      ready = Promise.all([UC.internal.themesReady(), parsed])
        .then(loadAll)
        .then(() => {
          settled = true;
          rerenderPages();
        });
    }
    return ready;
  };

  UC.internal.themeValue = themeValue;
  UC.internal.layouts = { list: LAYOUTS, files: FILE_LAYOUTS, resolve, base, classes, load };
})(window.UC);
