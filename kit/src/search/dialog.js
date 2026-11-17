/**
 * The search dialog (docs/plan/search-api.md 7.3, 7.4, 9, 10): a modal
 * <dialog> with the field, the results grouped by page, a status line
 * (loading, failed with a retry button, no results, the count for screen
 * readers) and the index date. Registered as UC.internal.searchUI, which
 * core/search-loader.js calls on every open.
 */
(function (UC) {
  "use strict";
  if (!UC) return;

  const { h, icon, uid, fragment } = UC.internal;
  const CLOSE_ICON =
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6 6 18"/></svg>';

  let parts = null;
  let index = null;
  let load = null;
  let opener = null;
  /** False when a result on this page took focus: closing must not move it back. */
  let returnFocus = true;

  function build() {
    const titleId = uid("uc-search-title");
    const input = h("input", { class: "uc-search__input", type: "text", enterkeyhint: "search" });
    const close = h("button", { class: "uc-search-dialog__close", type: "button", onClick: () => dialog.close() }, fragment(CLOSE_ICON), h("span", { class: "uc-visually-hidden" }));
    const status = h("p", { class: "uc-search__status", role: "status" });
    const retry = h("button", { class: "uc-button uc-search__retry", type: "button", hidden: true, onClick: () => start() });
    const footer = h("div", { class: "uc-search-dialog__footer" }, h("span", { class: "uc-search-dialog__date" }), h("span", { class: "uc-search-dialog__keys", "aria-hidden": "true" }));
    const leave = (samePage) => {
      returnFocus = !samePage;
      dialog.close();
    };
    const results = UC.internal.searchResults(input, leave);
    const dialog = h(
      "dialog",
      { class: "uc-search-dialog", "aria-labelledby": titleId },
      h("h2", { class: "uc-visually-hidden", id: titleId }),
      h("div", { class: "uc-search-dialog__bar" }, icon("search"), input, close),
      // tabindex: a long list scrolls, and a scrollable region must be
      // reachable with the keyboard (the options themselves are not tab stops).
      h("div", { class: "uc-search-dialog__body", tabindex: "0" }, status, retry, results.list),
      footer,
    );
    input.addEventListener("input", update);
    // A click on the backdrop (outside the box) closes the dialog.
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener("close", () => {
      if (returnFocus && opener && opener.isConnected && typeof opener.focus === "function") opener.focus();
      returnFocus = true;
    });
    document.body.append(dialog);
    parts = { dialog, input, close, status, retry, footer, results, titleId };
  }

  /** Strings in the active language (it may have changed since the last open). */
  function label() {
    const { dialog, input, close, retry, footer } = parts;
    dialog.querySelector(`#${parts.titleId}`).textContent = UC.t("search.label");
    input.setAttribute("aria-label", UC.t("search.label"));
    input.placeholder = UC.t("search.placeholder");
    close.lastChild.textContent = UC.t("search.close");
    retry.textContent = UC.t("search.retry");
    footer.lastChild.textContent = UC.t("search.keys");
    const date = index && new Date(index.generated);
    footer.firstChild.textContent = date && !Number.isNaN(date.getTime()) ? UC.t("search.indexDate", { date: UC.formatDate(date, "medium") }) : "";
  }

  function setStatus(text, { quiet = false, failed = false } = {}) {
    parts.status.textContent = text;
    // The count is for screen readers only: the list shows the results.
    parts.status.classList.toggle("uc-visually-hidden", quiet);
    parts.retry.hidden = !failed;
  }

  function update() {
    if (!index) return;
    const query = parts.input.value;
    const result = UC.internal.searchEngine.search(index, query);
    parts.results.render(result);
    setStatus(UC.internal.searchCount(result, query), { quiet: result.count > 0 });
  }

  /** Loads the index (at once when it is already there), then searches. */
  function start() {
    if (index) return update();
    setStatus(UC.t("search.loading"));
    load().then(
      (loaded) => {
        index = loaded;
        label();
        update();
      },
      () => {
        setStatus(UC.t("search.failed"), { failed: true });
        parts.retry.focus();
      },
    );
  }

  UC.internal.searchUI = {
    /** Opens the dialog. `load()` returns a Promise of the index; `opener` gets focus back on close. */
    open(options) {
      if (!parts) build();
      load = options.load;
      opener = options.opener;
      label();
      const { dialog, input } = parts;
      if (options.query || !dialog.open) input.value = options.query || input.value;
      if (!dialog.open) dialog.showModal();
      input.focus();
      input.select();
      start();
    },
  };
})(window.UC);
