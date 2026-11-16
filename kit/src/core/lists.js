/**
 * List semantics for the list blocks.
 *
 * `.uc-links`, `.uc-shortcuts` and `.uc-checklist` remove the list markers
 * (`list-style: none`), and Safari then stops announcing them as lists to
 * VoiceOver. An explicit `role="list"` restores that. Teacher-written roles
 * are left alone.
 */
(function (UC) {
  "use strict";
  if (UC.__duplicate) return;

  const SELECTOR = "ul.uc-links, ul.uc-shortcuts, ul.uc-checklist, ol.uc-links, ol.uc-shortcuts, ol.uc-checklist";

  function mark(root) {
    const lists = root.matches && root.matches(SELECTOR) ? [root] : [...root.querySelectorAll(SELECTOR)];
    for (const list of lists) if (!list.hasAttribute("role")) list.setAttribute("role", "list");
  }

  function start() {
    mark(document);
    // Components may move teacher content around after the page loads.
    new MutationObserver((records) => {
      for (const record of records) record.addedNodes.forEach((node) => node.nodeType === 1 && mark(node));
    }).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})(window.UC);
