/*
 * Loaded after ../course.js by the preview pages of the theme customiser
 * (docs/pt/personalizar/tema.html).
 *
 *   - The navigation of <uc-page> points to these copies, which have the page
 *     shell, instead of the plain demo pages. Hrefs are relative to course.js.
 *   - The customiser sends the tokens to set on <html> by postMessage, which
 *     also works from file:// (where the parent cannot reach into the frame).
 *     This page asks for them as soon as it starts and says which file it is.
 */
(function () {
  "use strict";

  window.UC_COURSE.pages = [
    { id: "home", href: "theme/index.html" },
    { id: "weeks", href: "theme/semanas.html" },
    { id: "assessment", href: "theme/avaliacao.html" },
  ];

  if (window.parent === window) return;
  const TOKEN = /^--uc-[a-z0-9-]+$/;

  window.addEventListener("message", (event) => {
    const data = event.data;
    if (event.source !== window.parent || !data || data.type !== "uc-docs:theme" || !Array.isArray(data.tokens)) return;
    const style = document.documentElement.style;
    data.tokens.forEach(([name, value]) => {
      if (!TOKEN.test(name)) return;
      if (value === null) style.removeProperty(name);
      else style.setProperty(name, String(value));
    });
  });

  const file = window.location.pathname.split("/").pop() || "index.html";
  window.parent.postMessage({ type: "uc-docs:theme-ready", file }, "*");
})();
