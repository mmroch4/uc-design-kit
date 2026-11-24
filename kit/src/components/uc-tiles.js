/**
 * <uc-tiles> — home-page mosaic: one card per page of course.js (without
 * the current one), with its `description`. The weeks page's card shows the
 * current teaching week and stands out. `pages="weeks,assessment"` picks and
 * orders the cards. See docs/api.md, section 3.1.
 */
(function (UC) {
  "use strict";
  if (UC.__duplicate) return;

  const { h, pageLabel } = UC.internal;

  class UCTiles extends UC.Element {
    static get observedAttributes() {
      return ["pages"];
    }

    attributeChangedCallback() {
      if (this.__ucSetupDone && this.isConnected) this.render();
    }

    render() {
      this.classList.add("uc-tiles");
      const all = this.course.pages;
      const ids = (this.getAttribute("pages") || "").split(/[\s,]+/).filter(Boolean);
      const pages = ids.length
        ? ids.map((id) => all.find((page) => page.id === id) || console.warn(`[uc-kit] <uc-tiles pages>: no page "${id}" in course.js`))
        : all.filter((page) => page !== UC.internal.currentPage());
      const week = UC.weekOf();
      this.replaceChildren(
        h(
          "ul",
          { class: "uc-tiles__list" },
          pages.filter((page) => page && page.href).map((page) => {
            const now = page.id === "weeks" && week;
            return h(
              "li",
              { class: "uc-tiles__item" },
              h(
                "a",
                { class: `uc-card uc-tiles__link${now ? " uc-tiles__link--now" : ""}`, href: UC.text(page.href) },
                h("span", { class: "uc-tiles__title" }, pageLabel(page)),
                now ? h("span", { class: "uc-tiles__meta" }, `${this.t("weeks.week", { n: week.n })} · ${UC.formatDateRange(week.start, week.end)}`) : null,
                page.description ? h("span", { class: "uc-tiles__text", html: this.text(page.description) }) : null,
              ),
            );
          }),
        ),
      );
    }
  }

  UC.define("uc-tiles", UCTiles);
})(window.UC);
