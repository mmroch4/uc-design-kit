/*
 * Loaded after ../course.js by the preview pages of the theme customiser
 * (docs/pt/personalizar/tema.html) and linked from "Escolher um tema"
 * (docs/pt/personalizar/temas.html).
 *
 *   - ?theme=a,b and ?layout=name choose the themes and the layout as a
 *     teacher would, with `theme` and `layout` in course.js, so the kit loads
 *     the theme files (and the layout of a theme) and waits for them. The
 *     query is kept in the links of the navigation, so the whole demo course
 *     can be visited with the same choice.
 *   - The navigation of <uc-page> points to these copies, which have the page
 *     shell, instead of the plain demo pages. Hrefs are relative to course.js.
 *   - Inside the customiser, the tokens to set on <html> arrive by postMessage,
 *     which also works from file:// (where the parent cannot reach into the
 *     frame). This page asks for them as soon as it starts and says which file
 *     it is.
 */
(function () {
  "use strict";

  const NAME = /^[a-z][a-z0-9-]*$/;
  const params = new URLSearchParams(window.location.search);
  const query = new URLSearchParams();
  // ../course.js already copies ?theme= as one name; a list is split here.
  const themes = (params.get("theme") || "").split(",").filter((name) => NAME.test(name));
  if (themes.length) {
    window.UC_COURSE.theme = themes.length === 1 ? themes[0] : themes;
    query.set("theme", themes.join(","));
  }
  const layout = params.get("layout");
  if (layout && NAME.test(layout)) {
    window.UC_COURSE.layout = layout;
    query.set("layout", layout);
  }
  const search = query.toString() ? `?${query}` : "";

  window.UC_COURSE.pages = [
    { id: "home", href: `theme/index.html${search}`, description: "Esta semana, avisos e próximas datas." },
    { id: "weeks", href: `theme/semanas.html${search}`, description: "Guiões, slides e exercícios de cada semana." },
    { id: "assessment", href: `theme/avaliacao.html${search}`, description: "Componentes, datas e regras da nota final." },
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
