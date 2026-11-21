/*
 * Loaded by every demo page. When the demo is shown inside an <iframe> of a
 * documentation page, it reports its content height to the parent, so the
 * iframe grows and shrinks with it (for example when a week is opened).
 * postMessage works from file:// too, where the parent cannot read the frame.
 */
(function () {
  "use strict";

  /*
   * ?theme=compact (or serif, high-contrast) puts that ready-made theme on
   * the demo, right after uc-kit.css, as a teacher's page would have it. The
   * section gallery of the documentation uses it to show a section in each
   * theme. Only lower-case names are accepted, so the URL cannot load
   * anything other than a file of kit/v1/themes/.
   */
  const script = document.currentScript;
  const theme = new URLSearchParams(location.search).get("theme");
  if (script && theme && /^[a-z][a-z-]*$/.test(theme)) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = new URL(`../../kit/v1/themes/${theme}.css`, script.src).href;
    const kit = document.querySelector('link[rel="stylesheet"][href$="uc-kit.css"]');
    if (kit) kit.after(link);
    else document.head.append(link);
  }

  if (window.parent === window) return;
  document.documentElement.classList.add("demo-framed");

  let last = 0;
  function report() {
    const height = Math.ceil(document.documentElement.getBoundingClientRect().height);
    if (height === last) return;
    last = height;
    window.parent.postMessage({ type: "uc-docs:demo-height", height }, "*");
  }

  new ResizeObserver(report).observe(document.documentElement);
  window.addEventListener("load", report);
})();
