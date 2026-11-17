/**
 * Copy buttons for preformatted text: <pre data-copy>.
 *
 * Meant for things students paste somewhere else, such as the input and output
 * of a problem's examples. The <pre> is wrapped in .uc-copy-block, which holds a
 * small button in its top-right corner. The button copies the text exactly as
 * written (line breaks included) and confirms with a check mark and a polite
 * screen-reader announcement. Without JavaScript the <pre> shows as before.
 */
(function (UC) {
  "use strict";
  if (UC.__duplicate) return;

  const { h, icon, copyText, announce } = UC.internal;

  const SELECTOR = "pre[data-copy]";
  const RESET_MS = 2000;
  const enhanced = new WeakSet();

  /** The button's accessible name: data-copy="..." names what is copied ("Input"). */
  function labelFor(pre) {
    const what = pre.getAttribute("data-copy").trim();
    return what ? UC.t("code.copyNamed", { name: what }) : UC.t("code.copy");
  }

  function setState(button, copied) {
    button.replaceChildren(icon(copied ? "check" : "copy"));
    button.classList.toggle("is-copied", copied);
  }

  function enhance(pre) {
    if (enhanced.has(pre) || pre.closest("uc-code")) return;
    enhanced.add(pre);

    const label = labelFor(pre);
    const button = h("button", {
      type: "button",
      class: "uc-button uc-copy-block__button",
      "aria-label": label,
      title: label,
    });
    setState(button, false);

    let timer = null;
    button.addEventListener("click", () => {
      copyText(pre.textContent)
        .then(() => {
          setState(button, true);
          announce(UC.t("code.copied"));
          clearTimeout(timer);
          timer = setTimeout(() => setState(button, false), RESET_MS);
        })
        .catch(() => announce(UC.t("code.copyFailed")));
    });

    const wrapper = h("div", { class: "uc-copy-block" });
    pre.replaceWith(wrapper);
    wrapper.append(pre, button);
  }

  function scan(root) {
    if (root.matches && root.matches(SELECTOR)) enhance(root);
    if (root.querySelectorAll) root.querySelectorAll(SELECTOR).forEach(enhance);
  }

  function start() {
    scan(document);
    // Content added later (components that render teacher HTML) gets buttons too.
    new MutationObserver((records) => {
      for (const record of records) record.addedNodes.forEach((node) => node.nodeType === 1 && scan(node));
    }).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})(window.UC);
