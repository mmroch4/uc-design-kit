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

  /**
   * Editions (docs/api.md 2.10): window.UC_EDITIONS from the file named by
   * UC_COURSE.editions, loaded once with an injected <script> (works from
   * file://). Links are resolved against that file. Calls `done` when ready.
   */
  let editions = null;
  const waiting = [];
  function loadEditions(done) {
    const file = UC.course.editions;
    if (!file) return;
    if (editions) return done();
    waiting.push(done);
    if (waiting.length > 1) return;
    const src = UC.internal.resolvePageHref(file);
    const ready = () => {
      const list = window.UC_EDITIONS;
      if (!Array.isArray(list)) return console.warn(`[uc-kit] ${file} does not define window.UC_EDITIONS`);
      // Relative hrefs are relative to editions.js: prefix them with its folder.
      const folder = src.replace(/[^/]*$/, "");
      const resolve = (href) => (/^([a-z][a-z0-9+.-]*:|\/|#)/i.test(href) ? href : folder + href);
      editions = list.filter((entry) => entry && entry.label && entry.href).map((entry) => ({ label: String(entry.label), href: resolve(String(entry.href)) }));
      waiting.splice(0).forEach((callback) => callback());
    };
    if (window.UC_EDITIONS) return ready();
    const script = h("script", { src });
    script.addEventListener("load", ready);
    script.addEventListener("error", () => console.warn(`[uc-kit] could not load the editions file ${src}`));
    document.head.append(script);
  }

  /**
   * The date of `updated="auto"`: document.lastModified, but only when the
   * server sent Last-Modified (browsers report "now" otherwise, so a value
   * within 5 s of the page load counts as missing) or the page is a file.
   */
  function lastModified() {
    const modified = new Date(document.lastModified);
    if (Number.isNaN(modified.getTime())) return null;
    const loaded = (performance && performance.timeOrigin) || Date.now();
    return window.location.protocol === "file:" || loaded - modified.getTime() > 5000 ? UC.internal.toISO(modified) : null;
  }

  class UCPage extends UC.Element {
    setup() {
      this.classList.add("uc-page");
      this.main = h("main", { id: "uc-main", class: "uc-main", tabindex: "-1" });
      this.main.append(...Array.from(this.childNodes));
      this.navId = uid("uc-nav");
      this.navOpen = false;
      this.mediaQuery = window.matchMedia ? window.matchMedia(MOBILE_QUERY) : null;
      this.onKeydown = (event) => {
        if (event.key === "Escape" && this.editionsOpen) {
          this.setEditionsOpen(false);
          this.querySelector(".uc-page__editions > button")?.focus();
        } else if (event.key === "Escape" && this.navOpen) {
          this.setNavOpen(false);
          this.querySelector(".uc-nav-toggle")?.focus();
        }
      };
      this.addEventListener("keydown", this.onKeydown);
      // The editions menu closes when focus or a click leaves it.
      const closeOutside = (event) => {
        if (this.editionsOpen && !(event.target instanceof Node && event.target.closest && event.target.closest(".uc-page__editions"))) this.setEditionsOpen(false);
      };
      document.addEventListener("click", closeOutside);
      this.addEventListener("focusin", closeOutside);
      // After the first render, so the header exists when the list arrives.
      queueMicrotask(() => loadEditions(() => this.renderEditions()));
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
      if (editions) this.renderEditions();
      if (restoreFocus) this.querySelector(".uc-lang-switch__button")?.focus();
    }

    renderHeader() {
      const course = this.course;
      const home = course.pages.find((page) => page.id === "home") || course.pages[0];
      const { logo: mark } = course;
      // Decorative by default (alt=""): the course name is right next to it.
      const alt = mark && mark.alt ? this.text(mark.alt) : "";
      let logo = null;
      if (mark === "default") logo = icon("tree");
      else if (mark && mark.svg) logo = h("span", { class: "uc-brand__logo", html: mark.svg, role: alt ? "img" : null, "aria-label": alt || null, "aria-hidden": alt ? null : "true" });
      else if (mark) logo = h("img", { src: mark.src, alt, class: "uc-brand__logo", width: 28, height: 28 });

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
        h("div", { class: "uc-header__inner" }, brand, h(
          "div",
          { class: "uc-header__meta" },
          institution,
          this.getAttribute("search") === "off" ? null : UC.internal.searchButton(),
          this.renderLanguageSwitch(),
        )),
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
      const own = this.getAttribute("updated");
      const date = own === "auto" ? lastModified() : own || course.updated;
      const updated = date
        ? h(
            "span",
            { class: "uc-footer__updated" },
            UC.internal.tNodes("footer.updated", {
              date: h("time", { datetime: date }, UC.formatDate(date, "medium")),
            }),
          )
        : null;
      return h("footer", { class: "uc-footer" }, h("div", { class: "uc-footer__inner" }, left, updated));
    }

    /**
     * "Other years" next to the edition in the header, and on an older
     * edition a notice at the top of <main> linking to the current one.
     */
    renderEditions() {
      this.querySelectorAll(".uc-page__editions, .uc-page__edition-notice").forEach((node) => node.remove());
      if (!this.querySelector(".uc-brand")) return;
      this.editionsOpen = false;
      const edition = this.course.edition;
      const others = editions.filter((entry) => entry.label !== edition);
      const brand = this.querySelector(".uc-brand");
      if (others.length && brand) {
        const menuId = uid("uc-editions");
        brand.after(
          h(
            "div",
            { class: "uc-page__editions" },
            h(
              "button",
              { type: "button", class: "uc-page__editions-button", "aria-expanded": "false", "aria-controls": menuId, onClick: () => this.setEditionsOpen(!this.editionsOpen) },
              this.t("editions.other"),
              icon("chevronDown"),
            ),
            h(
              "ul",
              { class: "uc-page__editions-menu", id: menuId, hidden: true },
              others.map((entry) => h("li", {}, h("a", { href: entry.href }, entry.label))),
            ),
          ),
        );
      }
      const current = editions[0];
      if (current && edition && current.label !== edition && editions.some((entry) => entry.label === edition)) {
        this.main.prepend(
          h(
            "p",
            { class: "uc-callout uc-page__edition-notice" },
            `${this.t("editions.notice", { edition })} `,
            h("a", { href: current.href }, this.t("editions.current", { edition: current.label })),
          ),
        );
      }
    }

    setEditionsOpen(open) {
      const box = this.querySelector(".uc-page__editions");
      this.editionsOpen = Boolean(box) && open;
      if (!box) return;
      box.querySelector("button").setAttribute("aria-expanded", String(this.editionsOpen));
      box.querySelector("ul").hidden = !this.editionsOpen;
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
