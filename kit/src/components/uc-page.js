/**
 * <uc-page> — page shell: skip link, header, navigation, main landmark, footer.
 * See docs/api.md, section 3.1.
 */
(function (UC) {
  "use strict";
  if (UC.__duplicate) return;

  const { h, icon, uid, isExternal } = UC.internal;
  const MOBILE_QUERY = "(max-width: 960px)";

  /** Resolves a page's href for the active language. */
  function pageHref(page) {
    return UC.text(page.href);
  }

  function pageLabel(page) {
    return page.label ? UC.text(page.label) : UC.t(`pages.${page.id}`);
  }

  function fileName(path) {
    const name = decodeURIComponent(path.split(/[?#]/)[0].split("/").pop() || "");
    return name || "index.html";
  }

  /** The configured page matching the current URL, if any. */
  function detectCurrentPage() {
    const here = fileName(window.location.pathname);
    return (
      UC.course.pages.find((page) => {
        const hrefs = typeof page.href === "object" && page.href ? Object.values(page.href) : [page.href];
        return hrefs.some((href) => href && fileName(href) === here);
      }) || null
    );
  }

  UC.internal.currentPage = () => {
    const shell = document.querySelector("uc-page[current]");
    const id = shell && shell.getAttribute("current");
    return (id && UC.course.pages.find((page) => page.id === id)) || detectCurrentPage();
  };

  class UCPage extends UC.Element {
    setup() {
      this.classList.add("uc-page");
      this.main = h("main", { id: "uc-main", class: "uc-main", tabindex: "-1" });
      this.main.append(...Array.from(this.childNodes));
      this.navId = uid("uc-nav");
      this.navOpen = false;
      this.mediaQuery = window.matchMedia ? window.matchMedia(MOBILE_QUERY) : null;
      this.onKeydown = (event) => {
        if (event.key === "Escape" && this.navOpen) {
          this.setNavOpen(false);
          this.querySelector(".uc-nav-toggle")?.focus();
        }
      };
      this.addEventListener("keydown", this.onKeydown);
    }

    render() {
      const current = UC.internal.currentPage();
      const restoreFocus = Boolean(document.activeElement && document.activeElement.closest && document.activeElement.closest(".uc-lang-switch"));
      const fullLayout = this.getAttribute("layout") === "full";
      this.classList.toggle("uc-page--full", fullLayout);

      const shell = h(
        "div",
        { class: "uc-shell" },
        fullLayout ? null : this.renderNavigation(current),
        this.main,
      );

      this.replaceChildren(
        h("a", { class: "uc-skip-link", href: "#uc-main" }, this.t("a11y.skipToContent")),
        this.renderHeader(),
        shell,
        this.renderFooter(),
      );
      this.setNavOpen(this.navOpen);
      if (restoreFocus) this.querySelector(".uc-lang-switch__button")?.focus();
    }

    renderHeader() {
      const course = this.course;
      const home = course.pages.find((page) => page.id === "home") || course.pages[0];
      let logo = null;
      if (course.logo === "default") logo = icon("tree");
      else if (course.logo) logo = h("img", { src: course.logo, alt: "", class: "uc-brand__logo", width: 28, height: 28 });

      const brand = h(
        "a",
        { class: "uc-brand", href: home ? pageHref(home) : "index.html" },
        logo,
        h("span", { class: "uc-brand__title" }, this.text(course.title)),
        course.edition ? h("span", { class: "uc-brand__edition" }, course.edition) : null,
      );

      const institution = course.institution
        ? h(
            course.institution.url ? "a" : "span",
            { class: "uc-header__institution", href: course.institution.url || null },
            this.text(course.institution.name),
          )
        : null;

      return h(
        "header",
        { class: "uc-header" },
        h("div", { class: "uc-header__inner" }, brand, h("div", { class: "uc-header__meta" }, institution, this.renderLanguageSwitch())),
      );
    }

    renderLanguageSwitch() {
      const languages = this.course.languages;
      if (languages.length < 2) return null;
      const { tIn } = UC.internal;
      return h(
        "div",
        { class: "uc-lang-switch" },
        languages
          .filter((code) => code !== UC.lang)
          .map((code) => {
            const shortLabel = tIn(code, "language.short");
            const short = shortLabel === "language.short" ? code.toUpperCase() : shortLabel;
            // The accessible name starts with the visible text ("EN"), so speech
            // input users can say what they see (WCAG 2.5.3 Label in Name).
            const action = tIn(code, "a11y.switchLanguage", { language: tIn(code, "language.name") });
            return h(
              "button",
              {
                type: "button",
                class: "uc-lang-switch__button",
                lang: code,
                "data-uc-keep-lang": true,
                "aria-label": `${short}: ${action}`,
                onClick: () => UC.setLanguage(code),
              },
              short,
            );
          }),
      );
    }

    renderNavigation(current) {
      const course = this.course;
      const currentLabel = current ? pageLabel(current) : "";

      const toggle = h(
        "button",
        {
          type: "button",
          class: "uc-nav-toggle",
          "aria-controls": this.navId,
          "aria-expanded": "false",
          onClick: () => this.setNavOpen(!this.navOpen),
        },
        h("span", { class: "uc-nav-toggle__label" }, icon("menu"), h("span", {}, this.t("nav.menu")),
          currentLabel ? h("span", { class: "uc-nav-toggle__current" }, `· ${currentLabel}`) : null),
        h("span", { class: "uc-nav-toggle__chevron" }, icon("chevronDown")),
      );

      const pages = h(
        "ul",
        { class: "uc-nav__list" },
        course.pages.map((page) =>
          h(
            "li",
            {},
            h(
              "a",
              {
                class: "uc-nav__link",
                href: pageHref(page),
                "aria-current": current && page.id === current.id ? "page" : null,
              },
              pageLabel(page),
            ),
          ),
        ),
      );

      let platforms = null;
      const listed = course.platforms.filter((platform) => !platform.hidden);
      if (listed.length) {
        const labelId = `${this.navId}-platforms`;
        platforms = [
          h("p", { class: "uc-nav__group", id: labelId }, this.t("nav.platforms")),
          h(
            "ul",
            { class: "uc-nav__list", "aria-labelledby": labelId },
            listed.map((platform) => {
              const external = isExternal(platform.url);
              return h(
                "li",
                {},
                h(
                  "a",
                  { class: "uc-nav__link", href: platform.url },
                  this.text(platform.label),
                  external ? icon("external") : null,
                  external ? h("span", { class: "uc-visually-hidden" }, ` ${this.t("a11y.external")}`) : null,
                ),
              );
            }),
          ),
        ];
      }

      return h(
        "div",
        { class: "uc-sidebar" },
        toggle,
        h("nav", { class: "uc-nav", id: this.navId, "aria-label": this.t("nav.label") }, pages, platforms),
      );
    }

    renderFooter() {
      const course = this.course;
      const left = course.footer
        ? h("span", { class: "uc-footer__text", html: this.text(course.footer) })
        : h(
            "span",
            { class: "uc-footer__text" },
            [this.text(course.title), course.institution ? this.text(course.institution.name) : null].filter(Boolean).join(" · "),
          );
      const updated = course.updated
        ? h(
            "span",
            { class: "uc-footer__updated" },
            UC.internal.tNodes("footer.updated", {
              date: h("time", { datetime: course.updated }, UC.formatDate(course.updated, "medium")),
            }),
          )
        : null;
      return h("footer", { class: "uc-footer" }, h("div", { class: "uc-footer__inner" }, left, updated));
    }

    setNavOpen(open) {
      this.navOpen = open;
      const toggle = this.querySelector(".uc-nav-toggle");
      if (toggle) toggle.setAttribute("aria-expanded", String(open));
      this.classList.toggle("uc-page--nav-open", open);
    }
  }

  UC.define("uc-page", UCPage);
})(window.UC);
