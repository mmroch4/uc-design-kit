/**
 * Links that need a login: <a data-auth> or <a data-auth="SIGARRA">.
 *
 * The kit adds a decorative lock after the text and a visually hidden
 * "(Requer autenticação)" / "(Requer autenticação: SIGARRA)", so the need to
 * log in is shown and also read by screen readers. It works on page HTML, on
 * HTMLText from course.js and inside components (UC.Element runs the page
 * enhancements after each render). The hidden text follows the active
 * language and is replaced, never duplicated. Without JavaScript the link is
 * an ordinary link. See docs/architecture/blocks-api.md 5.2.
 */
(function (UC) {
  "use strict";
  if (UC.__duplicate) return;

  const { h, icon } = UC.internal;
  const SELECTOR = "a[data-auth]";

  function labelText(link) {
    const system = link.getAttribute("data-auth").trim();
    return ` (${system ? UC.t("a11y.requiresLoginAt", { system }) : UC.t("a11y.requiresLogin")})`;
  }

  function enhanceLink(link) {
    let label = link.querySelector(":scope > .uc-auth-label");
    if (!label) {
      const lock = icon("lock");
      lock.classList.add("uc-auth-icon");
      label = h("span", { class: "uc-visually-hidden uc-auth-label" });
      link.append(lock, label);
    }
    label.textContent = labelText(link);
  }

  function enhanceAuthLinks(root) {
    if (!root) return;
    if (root.matches && root.matches(SELECTOR)) enhanceLink(root);
    if (root.querySelectorAll) root.querySelectorAll(SELECTOR).forEach(enhanceLink);
  }

  UC.internal.registerEnhancer(enhanceAuthLinks);
  document.addEventListener("uc:ready", () => enhanceAuthLinks(document));
  document.addEventListener("uc:languagechange", () => enhanceAuthLinks(document));
})(window.UC);
