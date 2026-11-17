/**
 * Lazily loaded modules (docs/architecture/grading-api.md 2.2). Heavy blocks that few
 * pages use live in their own file next to uc-kit.js and are loaded only when
 * the page has one of their elements: at start, or later when a script adds
 * one. Also the shared script loader that the search uses for uc-search.js.
 *
 * Adding a module: one line in MODULES, one list in kit/src/manifest.json and
 * one budget line in scripts/build.mjs.
 */
(function (UC) {
  "use strict";
  if (UC.__duplicate) return;

  const MODULES = { grading: { file: "uc-grading.js", tags: "uc-grading" } };

  /** The kit's own files sit next to uc-kit.js: the src of its script, else the page. */
  const kitScript = document.currentScript || Array.from(document.scripts).find((item) => /uc-kit(\.min)?\.js([?#]|$)/.test(item.src));
  const kitUrl = (file) => new URL(file, kitScript ? kitScript.src : document.baseURI).href;

  /** Adds a classic <script> once per URL (works on file://). A failed load can be retried. */
  const scripts = new Map();
  function loadScript(src) {
    if (!scripts.has(src)) {
      scripts.set(
        src,
        new Promise((resolve, reject) => {
          const script = UC.internal.h("script", { src });
          script.addEventListener("load", resolve);
          script.addEventListener("error", () => {
            scripts.delete(src);
            script.remove();
            reject(new Error(`could not load ${src}`));
          });
          document.head.append(script);
        }),
      );
    }
    return scripts.get(src);
  }

  /** Promise per module, once. On a network error the teacher's HTML stays as the content. */
  const loading = new Map();
  function loadModule(name) {
    const module = MODULES[name];
    if (!module) return Promise.reject(new Error(`unknown kit module "${name}"`));
    if (!loading.has(name)) {
      loading.set(
        name,
        loadScript(kitUrl(module.file)).catch((error) => {
          console.warn(`[uc-kit] could not load ${module.file} next to uc-kit.js. Copy the whole kit/v1 folder.`);
          throw error;
        }),
      );
    }
    return loading.get(name);
  }

  /** Loads every module whose elements are in the page; returns the loads started now. */
  function scan() {
    const started = [];
    for (const name of Object.keys(MODULES)) {
      if (!loading.has(name) && document.querySelector(MODULES[name].tags)) started.push(loadModule(name).catch(() => {}));
    }
    if (observer && loading.size === Object.keys(MODULES).length) observer.disconnect();
    return started;
  }

  let observer = null;
  let startResolve;
  const start = new Promise((resolve) => (startResolve = resolve));

  function begin() {
    startResolve(Promise.all(scan()));
    if (loading.size < Object.keys(MODULES).length && typeof MutationObserver === "function") {
      observer = new MutationObserver(scan);
      observer.observe(document, { childList: true, subtree: true });
    }
  }

  Object.assign(UC.internal, {
    kitUrl,
    loadScript,
    loadModule,
    /** Resolves once the modules the page needed at start have loaded or failed; never rejects. */
    modulesReady: () => start,
  });

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", begin);
  else begin();
})(window.UC);
