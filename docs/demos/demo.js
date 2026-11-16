/*
 * Loaded by every demo page. When the demo is shown inside an <iframe> of a
 * documentation page, it reports its content height to the parent, so the
 * iframe grows and shrinks with it (for example when a week is opened).
 * postMessage works from file:// too, where the parent cannot read the frame.
 */
(function () {
  "use strict";
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
