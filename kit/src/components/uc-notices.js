/**
 * <uc-notices> — the course notices (UC_COURSE.notices), newest first.
 * Notices beyond `limit` go into a collapsed "Earlier notices (n)" disclosure;
 * notices newer than `new-days` get a "New" badge.
 * Teacher-written children are kept below the list.
 * See docs/api.md, section 3.2.
 */
(function (UC) {
  "use strict";
  if (UC.__duplicate) return;

  const { h, uid, number, diffDays, toISO } = UC.internal;
  const DEFAULT_LIMIT = 5;
  const DEFAULT_NEW_DAYS = 7;

  class UCNotices extends UC.Element {
    static get observedAttributes() {
      return ["limit", "new-days", "heading", "heading-level"];
    }

    setup() {
      this.classList.add("uc-notices");
      this.extra = Array.from(this.childNodes);
      this.headingId = uid("uc-notices-heading");
      this.earlierOpen = false;
    }

    attributeChangedCallback() {
      if (this.__ucSetupDone && this.isConnected) this.render();
    }

    render() {
      const previousEarlier = this.querySelector(":scope > .uc-notices__section > .uc-notices__earlier");
      if (previousEarlier) this.earlierOpen = previousEarlier.open;

      const today = UC.today();
      // A notice dated in the future stays hidden until that day, so it can be written in advance.
      const notices = this.course.notices.filter((notice) => !notice.parsedDate || notice.parsedDate <= today);
      const limit = Math.max(0, Math.floor(number(this, "limit", DEFAULT_LIMIT)));
      const newDays = number(this, "new-days", DEFAULT_NEW_DAYS);
      const renderItem = (notice) => this.renderNotice(notice, today, newDays);

      const heading = UC.internal.heading(this, "uc-notices", this.t("notices.heading"));
      let body;
      if (!notices.length) {
        body = h("p", { class: "uc-notices__empty" }, this.t("notices.empty"));
      } else {
        const recent = notices.slice(0, limit);
        const earlier = notices.slice(limit);
        body = [
          recent.length ? h("ul", { class: "uc-notices__list" }, recent.map(renderItem)) : null,
          earlier.length ? this.renderEarlier(earlier.map(renderItem), Boolean(recent.length)) : null,
        ];
      }

      const section = h(
        "section",
        { class: "uc-notices__section", "aria-labelledby": heading ? this.headingId : null },
        heading,
        body,
        this.extra.length ? h("div", { class: "uc-notices__more" }, this.extra) : null,
      );
      this.replaceChildren(section);
    }

    renderNotice(notice, today, newDays) {
      const date = notice.parsedDate;
      const isNew = Boolean(date) && diffDays(today, date) < newDays;
      return h(
        "li",
        { class: `uc-notices__item${isNew ? " uc-notices__item--new" : ""}` },
        date
          ? h("time", { class: "uc-notices__date", datetime: toISO(date) }, UC.formatDate(date))
          : h("span", { class: "uc-notices__date" }),
        h(
          "div",
          { class: "uc-notices__body" },
          h(
            "p",
            { class: "uc-notices__text" },
            h("span", { html: this.text(notice.text) }),
            isNew ? [" ", h("span", { class: "uc-tag uc-tag--warning uc-notices__badge" }, this.t("notices.new"))] : null,
          ),
          notice.details ? h("p", { class: "uc-notices__details", html: this.text(notice.details) }) : null,
        ),
      );
    }

    renderEarlier(items, hasRecent) {
      const details = h(
        "details",
        { class: `uc-notices__earlier${hasRecent ? "" : " uc-notices__earlier--only"}` },
        h(
          "summary",
          { class: "uc-notices__summary" },
          h("span", {}, this.t("notices.earlier", { count: items.length })),
          UC.internal.icon("chevronDown"),
        ),
        h("ul", { class: "uc-notices__list" }, items),
      );
      details.open = this.earlierOpen;
      return details;
    }
  }

  UC.define("uc-notices", UCNotices);
})(window.UC);
