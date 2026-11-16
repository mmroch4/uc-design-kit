/**
 * <uc-team> — the teaching team from UC_COURSE.team, as cards or a table.
 * See docs/api.md, section 3.4.
 */
(function (UC) {
  "use strict";
  if (UC.__duplicate) return;

  const { h, uid } = UC.internal;
  const BUILTIN_ROLES = ["coordinator", "lecturer", "assistant"];

  /** Translated label of a member's role (built-in id or LocalizedText). */
  function roleLabel(role) {
    if (!role) return "";
    if (typeof role === "string" && BUILTIN_ROLES.includes(role)) return UC.t(`team.roles.${role}`);
    return UC.text(role);
  }

  /** All the strings a role can be matched by in the `role` filter, lowercased. */
  function roleKeys(role) {
    if (!role) return [];
    const values = typeof role === "object" ? Object.values(role) : [role];
    return values.filter((value) => typeof value === "string").map((value) => value.trim().toLowerCase());
  }

  const classList = (member) => (Array.isArray(member.classes) ? member.classes.join(", ") : "");

  /** Name, linked to the personal page when there is one. */
  function nameNode(member, className) {
    return member.url
      ? h("a", { class: className, href: member.url }, member.name)
      : h("span", { class: className }, member.name);
  }

  /** Secondary line with office and e-mail, or null when neither is set. */
  function contactNode(member, className) {
    const parts = [];
    if (member.office) parts.push(h("span", {}, member.office));
    if (member.email) parts.push(h("a", { href: `mailto:${member.email}` }, member.email));
    if (!parts.length) return null;
    const separated = parts.flatMap((part, index) => (index ? [" · ", part] : [part]));
    return h("span", { class: className }, separated);
  }

  class UCTeam extends UC.Element {
    setup() {
      this.classList.add("uc-team");
      this.extra = Array.from(this.childNodes);
      this.headingId = uid("uc-team-heading");
      // The public `role` attribute (a team-role filter) collides with the
      // ARIA role attribute, so it is moved to data-role once read.
      if (this.hasAttribute("role")) {
        this.dataset.role = this.getAttribute("role");
        this.removeAttribute("role");
      }
    }

    /** Team members after the `role` filter. */
    members() {
      const filter = (this.dataset.role || "").trim().toLowerCase();
      const wanted = filter ? filter.split(/\s+/) : null;
      const team = this.course.team.filter((member) => member && member.name);
      if (!wanted) return team;
      return team.filter((member) => roleKeys(member.role).some((key) => wanted.includes(key)));
    }

    render() {
      const members = this.members();
      this.hidden = members.length === 0 && this.extra.length === 0;
      if (this.hidden) {
        this.replaceChildren();
        return;
      }

      const headingAttr = this.getAttribute("heading");
      const headingText = headingAttr && headingAttr !== "none" ? headingAttr : this.t("team.heading");
      const showHeading = headingAttr !== "none";
      const view = this.getAttribute("view") === "table" ? this.renderTable(members) : this.renderCards(members);

      this.replaceChildren(
        h(
          "section",
          {
            class: "uc-team__section",
            "aria-labelledby": showHeading ? this.headingId : null,
            "aria-label": showHeading ? null : headingText,
          },
          showHeading ? h(UC.internal.headingTag(this), { class: "uc-team__heading", id: this.headingId }, headingText) : null,
          members.length ? view : null,
          ...this.extra,
        ),
      );
    }

    renderCards(members) {
      return h(
        "ul",
        { class: "uc-team__cards uc-grid" },
        members.map((member) => {
          const role = roleLabel(member.role);
          const classes = classList(member);
          const details = [role, classes].filter(Boolean).join(" · ");
          return h(
            "li",
            { class: "uc-team__card uc-card" },
            nameNode(member, "uc-team__name"),
            details ? h("span", { class: "uc-team__role" }, details) : null,
            contactNode(member, "uc-team__contact"),
          );
        }),
      );
    }

    renderTable(members) {
      const column = (key) => h("th", { scope: "col" }, this.t(`team.column.${key}`));
      return h(
        "div",
        { class: "uc-team__table uc-table" },
        h(
          "table",
          {},
          h("thead", {}, h("tr", {}, column("name"), column("role"), column("classes"))),
          h(
            "tbody",
            {},
            members.map((member) =>
              h(
                "tr",
                {},
                h("td", { class: "uc-team__person" }, nameNode(member, "uc-team__name"), contactNode(member, "uc-team__contact")),
                h("td", {}, roleLabel(member.role)),
                h("td", { class: "uc-team__classes uc-mono" }, classList(member)),
              ),
            ),
          ),
        ),
      );
    }
  }

  UC.define("uc-team", UCTeam);
})(window.UC);
