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
    // Every style sheet applied: under load a <link> added by the kit may still be parsing.
    const sheetsApplied = () => new Promise((resolve) => {
      const started = Date.now();
      const check = () => {
        const pending = Array.from(document.querySelectorAll("link[rel~=stylesheet]")).some((link) => !link.sheet);
        if (!pending || Date.now() - started > 3000) resolve();
        else setTimeout(check, 20);
      };
      check();
    });
    // Then two frames: with prefers-reduced-motion (scripts/check-dom.mjs) uc-kit.css makes every
    // change a 0.01 ms transition, and a style read in the same frame gets its starting value.
    const frames = () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(resolve, 20))));
    const go = () => UC.internal.layoutsReady().then(sheetsApplied).then(frames).then(() => {
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
      // scripts/check-dom.mjs waits for this, so the record never catches a page halfway through its checks.
      document.documentElement.dataset.layoutTests = "done";
    });
    if (document.documentElement.classList.contains("uc-ready")) go();
    else document.addEventListener("uc:ready", go);
  };
  /** A stand-in for a <uc-page> with the given layout attribute (or none). */
  window.fakePage = (layout) => ({ getAttribute: (name) => (name === "layout" ? layout : null) });
})();
