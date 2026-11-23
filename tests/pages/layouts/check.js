/*
 * Assertions for the layout test pages (docs/architecture/themes-layouts.md 8).
 * window.layoutTests(fn) runs fn(test, equal) once the themes and layouts have
 * loaded; each result is a line of #results and a failure is a console error,
 * which makes npm test fail.
 */
(function () {
  "use strict";
  window.layoutTests = function (run) {
    // After the kit drew the page (uc:ready), as core/bootstrap.js does.
    const go = () => UC.internal.layoutsReady().then(() => {
      const results = document.getElementById("results");
      const test = (name, fn) => {
        let detail = "";
        try {
          fn();
        } catch (error) {
          detail = error.message;
          console.error(`FAIL ${name}: ${detail}`);
        }
        const item = document.createElement("li");
        item.textContent = `${detail ? "✗" : "✓"} ${name}${detail ? ` — ${detail}` : ""}`;
        results.append(item);
      };
      const equal = (actual, expected) => {
        const a = JSON.stringify(actual);
        const e = JSON.stringify(expected);
        if (a !== e) throw new Error(`expected ${e}, got ${a}`);
      };
      run(test, equal);
    });
    if (document.documentElement.classList.contains("uc-ready")) go();
    else document.addEventListener("uc:ready", go);
  };
  /** A stand-in for a <uc-page> with the given layout attribute (or none). */
  window.fakePage = (layout) => ({ getAttribute: (name) => (name === "layout" ? layout : null) });
})();
