/**
 * uc-widget-core.js: the shared core of the widget library
 * (docs/architecture/widgets-api.md 2.3). Added to the page by the first widget file
 * (bootstrap.js) or preloaded by the page. It installs UC.widgets, loads
 * uc-widget.css from its own folder and runs the queued widget definitions.
 */
import { VERSION, KIT_MIN } from "./version.js";
import { MAX_STEPS, STATES, InputError, TooManySteps, random, clone, range } from "./engine.js";
import * as parse from "./parse.js";
import { array } from "./svg/array.js";
import { tree } from "./svg/tree.js";
import { el, svgEl } from "./dom.js";
import { strings } from "./i18n.js";
import { createWidget } from "./widget.js";

/** True when version "a.b[.c][-x]" is older than "major.minor". */
function older(version, minimum) {
  const [a = 0, b = 0] = String(version || "0").split("-")[0].split(".").map(Number);
  const [c, d] = minimum.split(".").map(Number);
  return a < c || (a === c && b < d);
}

(function install() {
  const UC = window.UC;
  const script = document.currentScript;
  if (!UC || !UC.Element) {
    console.error("[uc-widget] Load uc-kit.js before uc-widget-core.js.");
    return;
  }
  const widgets = UC.widgets || (UC.widgets = { __queue: [] });
  if (widgets.version) {
    // Two copies of the core on one page (e.g. v1/ and v1.0.0/): keep the first.
    if (widgets.version !== VERSION) console.warn(`[uc-widget] widgets ${widgets.version} already loaded; ignoring ${VERSION}.`);
    return;
  }
  if (older(UC.version, KIT_MIN)) console.warn(`[uc-widget] The widgets need kit ${KIT_MIN} or later; this page has ${UC.version}.`);

  if (!document.querySelector('link[href$="uc-widget.css"]')) {
    const folder = script && script.src ? script.src.replace(/[^/]*$/, "") : "";
    document.head.append(el("link", { rel: "stylesheet", href: `${folder}uc-widget.css` }));
  }

  UC.addTranslations("pt", { widget: { core: strings.pt } });
  UC.addTranslations("en", { widget: { core: strings.en } });

  const queue = widgets.__queue || [];
  delete widgets.__queue;
  Object.assign(widgets, {
    version: VERSION,
    MAX_STEPS,
    STATES,
    InputError,
    TooManySteps,
    random,
    parse,
    util: { clone, range, el, svgEl },
    svg: { array, tree },
    Widget: createWidget(UC),
    /** UC.define plus the catalogue rule for names (16.1). */
    register(name, Class) {
      if (!name.includes("-")) throw new Error(`[uc-widget] "${name}" is not a valid element name.`);
      UC.define(name, Class);
    },
  });
  for (const define of queue) {
    try {
      define(UC);
    } catch (error) {
      console.error("[uc-widget] A widget definition failed.", error);
    }
  }
})();
