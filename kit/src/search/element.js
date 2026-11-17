/**
 * <uc-search> — a search field with its results below it, inside the page
 * (docs/architecture/search-api.md 8.2), e.g. at the top of a problems page with
 * scope="problemas/". It is defined here, in uc-search.js, which uc-kit.js
 * loads only when the site has a search index: without one the element stays
 * empty. The index downloads the first time the field gets focus.
 *
 * Attributes: scope (path prefix), label, placeholder, limit (default 10).
 */
(function (UC) {
  "use strict";
  if (!UC) return;

  const { h, uid } = UC.internal;
  const DEFAULT_LIMIT = 10;
  /** Wait before the count is announced, so typing is not interrupted. */
  const ANNOUNCE_DELAY_MS = 700;

  UC.define(
    "uc-search",
    class extends UC.Element {
      setup() {
        this.textContent = "";
        this.classList.add("uc-search");
        const id = uid("uc-search-field");
        this.labelElement = h("label", { class: "uc-search__label", for: id });
        this.input = h("input", { class: "uc-search__input uc-search__field", id, type: "text", enterkeyhint: "search" });
        this.results = UC.internal.searchResults(this.input);
        this.message = h("p", { class: "uc-search__message" });
        this.retry = h("button", { class: "uc-button uc-search__retry", type: "button", hidden: true, onClick: () => this.load() });
        this.append(this.labelElement, this.input, this.message, this.retry, this.results.list);
        this.input.addEventListener("focus", () => this.load());
        this.input.addEventListener("input", () => {
          this.load();
          this.update(true);
        });
        this.input.addEventListener("keydown", (event) => {
          if (event.key === "Escape" && this.input.value) {
            event.preventDefault();
            this.input.value = "";
            this.update(true);
          }
        });
      }

      render() {
        this.labelElement.textContent = this.getAttribute("label") || this.t("search.label");
        this.input.placeholder = this.getAttribute("placeholder") || this.t("search.placeholder");
        this.retry.textContent = this.t("search.retry");
        this.update(false);
      }

      /** Loads the index once; "Loading…" while it downloads, "Try again" if it fails. */
      load() {
        if (this.index || this.loading) return;
        this.loading = true;
        this.show(this.t("search.loading"));
        UC.internal.searchIndex().then(
          (index) => {
            this.loading = false;
            this.index = index;
            this.show("");
            this.update(true);
          },
          () => {
            this.loading = false;
            this.show(this.t("search.failed"), true);
          },
        );
      }

      show(text, failed = false) {
        this.message.textContent = text;
        this.retry.hidden = !failed;
      }

      update(announce) {
        if (!this.index) return;
        const query = this.input.value;
        const result = UC.internal.searchEngine.search(this.index, query, {
          scope: this.getAttribute("scope") || "",
          limit: UC.internal.number(this, "limit", DEFAULT_LIMIT),
        });
        this.results.render(result);
        const text = UC.internal.searchCount(result, query);
        // "No results" is shown; the count only announced (the list shows the results).
        this.show(result.count ? "" : text);
        if (announce && text) UC.internal.announce(text, ANNOUNCE_DELAY_MS);
      }
    },
  );
})(window.UC);
