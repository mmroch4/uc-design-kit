/**
 * The first lines of every uc-widget-<name>.js (docs/architecture/widgets-api.md
 * 2.3): queue the widget's definition and add uc-widget-core.js from the
 * same folder, once per page. No global other than UC.widgets is written.
 */
export function boot(name, define) {
  const UC = window.UC;
  if (!UC || !UC.Element) {
    console.error(`[uc-widget] Load uc-kit.js before ${name}.js.`);
    return;
  }
  const widgets = UC.widgets || (UC.widgets = { __queue: [] });
  if (widgets.version) {
    define(UC);
    return;
  }
  widgets.__queue.push(define);
  if (document.querySelector('script[data-uc-widget-core], script[src$="/uc-widget-core.js"], script[src="uc-widget-core.js"]')) return;
  const own = document.currentScript && document.currentScript.src;
  const script = document.createElement("script");
  script.src = own ? own.replace(/[^/]*$/, "uc-widget-core.js") : "uc-widget-core.js";
  script.dataset.ucWidgetCore = "";
  document.head.append(script);
}
