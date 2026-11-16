/**
 * <uc-guide> — lab guide wrapper: breadcrumbs, an "On this page" table of
 * contents built from the guide's <h2> elements and a progress indicator
 * counting completed <uc-exercise> elements. See docs/api.md, section 3.5.
 *
 * Structure:
 *
 *   <uc-guide class="uc-guide">
 *     <nav class="uc-guide__crumbs">…</nav>
 *     <div class="uc-guide__layout">
 *       <aside class="uc-guide__aside">progress · table of contents</aside>
 *       <div class="uc-guide__content">…teacher content…</div>
 *     </div>
 *   </uc-guide>
 *
 * The aside comes first in reading order (a summary of the page before the
 * page); on wide containers CSS places it in a sticky right-hand column, on
 * narrow ones only the progress stays visible above the content.
 */
(function (UC) {
  "use strict";
  if (UC.__duplicate) return;

  const { h, uid, number } = UC.internal;
  const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
  /** A heading is "current" once its top passes this fraction of the viewport height. */
  const ACTIVE_LINE = 0.3;

  function slugify(text) {
    return (
      text
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "section"
    );
  }

  function uniqueId(base) {
    let candidate = base;
    for (let suffix = 2; document.getElementById(candidate); suffix += 1) candidate = `${base}-${suffix}`;
    return candidate;
  }

  function prefersReducedMotion() {
    return Boolean(window.matchMedia && window.matchMedia(REDUCED_MOTION_QUERY).matches);
  }

  function weeksPage() {
    return UC.course.pages.find((page) => page.id === "weeks") || null;
  }

  class UCGuide extends UC.Element {
    setup() {
      this.classList.add("uc-guide");
      this.content = h("div", { class: "uc-guide__content" }, ...Array.from(this.childNodes));
      this.aside = h("aside", { class: "uc-guide__aside" });
      this.layout = h("div", { class: "uc-guide__layout" }, this.aside, this.content);
      this.tocLabelId = uid("uc-guide-toc");
      this.progressLabelId = uid("uc-guide-progress");
      this.activeId = null;

      this.addEventListener("uc:exercisechange", () => this.updateProgress());
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      if (this.observer) this.observer.disconnect();
      this.observer = null;
    }

    render() {
      this.headings = Array.from(this.content.querySelectorAll("h2")).filter((heading) => !UC.internal.isHiddenByLanguage(heading));
      this.headings.forEach((heading) => {
        if (!heading.id) heading.id = uniqueId(slugify(UC.internal.visibleText(heading)));
      });

      this.progress = this.renderProgress();
      this.toc = this.hasAttribute("no-toc") ? null : this.renderToc();
      this.aside.replaceChildren(...[this.progress, this.toc].filter(Boolean));

      // Only the breadcrumbs are replaced: the layout (and the teacher content) never leaves the DOM.
      const crumbs = this.renderCrumbs();
      if (this.layout.parentNode !== this) this.replaceChildren(this.layout);
      if (this.crumbs) this.crumbs.remove();
      this.crumbs = crumbs;
      if (crumbs) this.prepend(crumbs);
      this.updateProgress();
      this.updateActive();
      if (this.isConnected) this.observeHeadings();
    }

    /* ---------- Breadcrumbs ---------- */

    renderCrumbs() {
      const items = [];
      const week = number(this, "week", null);
      const page = weeksPage();
      const weeksHref = page ? UC.text(page.href) : UC.internal.builtinPages.weeks;

      if (page) {
        const label = page.label ? UC.text(page.label) : this.t("pages.weeks");
        items.push(h("a", { href: weeksHref }, label));
      }
      if (week !== null) {
        items.push(h("a", { href: `${weeksHref}#week-${week}` }, this.t("weeks.week", { n: week })));
      }
      if (!items.length) return null;

      const title = this.pageTitle();
      if (title) items.push(h("span", { "aria-current": "page" }, title));

      return h(
        "nav",
        { class: "uc-guide__crumbs", "aria-label": this.t("guide.breadcrumb") },
        h("ol", { class: "uc-guide__crumbs-list" }, items.map((item) => h("li", { class: "uc-guide__crumb" }, item))),
      );
    }

    /** Text of the guide's first <h1> visible in the active language. */
    pageTitle() {
      const heading = Array.from(this.content.querySelectorAll("h1")).find((h1) => !UC.internal.isHiddenByLanguage(h1));
      return heading ? UC.internal.visibleText(heading) : "";
    }

    /* ---------- Progress ---------- */

    renderProgress() {
      return h(
        "div",
        { class: "uc-guide__progress" },
        h("p", { class: "uc-guide__progress-text", id: this.progressLabelId }),
        h("progress", { class: "uc-guide__progress-bar", max: 1, value: 0, "aria-labelledby": this.progressLabelId }),
      );
    }

    updateProgress() {
      if (!this.progress) return;
      const exercises = UC.internal.exercisesIn(this);
      const total = exercises.length;
      const done = exercises.filter(UC.internal.isExerciseDone).length;
      this.progress.hidden = total === 0;
      this.classList.toggle("uc-guide--no-aside", total === 0 && !this.toc);
      if (!total) return;
      const text = this.progress.querySelector(".uc-guide__progress-text");
      text.replaceChildren(
        ...UC.internal.tNodes("guide.progress", {
          done: h("strong", { class: "uc-guide__progress-count" }, String(done)),
          total: String(total),
        }),
      );
      const bar = this.progress.querySelector(".uc-guide__progress-bar");
      bar.max = total;
      bar.value = done;
    }

    /* ---------- Table of contents ---------- */

    renderToc() {
      if (!this.headings.length) return null;
      return h(
        "nav",
        { class: "uc-guide__toc", "aria-labelledby": this.tocLabelId },
        h("p", { class: "uc-guide__toc-label", id: this.tocLabelId }, this.t("guide.onThisPage")),
        h(
          "ol",
          { class: "uc-guide__toc-list" },
          this.headings.map((heading) =>
            h(
              "li",
              { class: "uc-guide__toc-item" },
              h(
                "a",
                { class: "uc-guide__toc-link", href: `#${heading.id}`, onClick: (event) => this.goTo(event, heading) },
                UC.internal.visibleText(heading),
              ),
            ),
          ),
        ),
      );
    }

    /** Scrolls to a section (smoothly unless reduced motion is preferred) and moves focus to it. */
    goTo(event, heading) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      heading.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
      if (!heading.hasAttribute("tabindex")) heading.setAttribute("tabindex", "-1");
      heading.focus({ preventScroll: true });
      try {
        window.history.pushState(null, "", `#${heading.id}`);
      } catch (error) {
        /* Some browsers refuse history changes on file:// URLs. */
      }
    }

    /** Highlights the section in view. Uses IntersectionObserver only (no scroll listeners). */
    observeHeadings() {
      if (this.observer) this.observer.disconnect();
      this.observer = null;
      if (!this.toc || !("IntersectionObserver" in window)) return;
      const bottomMargin = `-${Math.round((1 - ACTIVE_LINE) * 100)}%`;
      this.observer = new IntersectionObserver(() => this.updateActive(), {
        rootMargin: `0px 0px ${bottomMargin} 0px`,
        threshold: [0, 1],
      });
      this.headings.forEach((heading) => this.observer.observe(heading));
    }

    updateActive() {
      if (!this.toc) return;
      const line = window.innerHeight * ACTIVE_LINE;
      let active = null;
      for (const heading of this.headings) {
        if (heading.getBoundingClientRect().top <= line) active = heading;
        else break;
      }
      this.activeId = active ? active.id : null;
      this.toc.querySelectorAll(".uc-guide__toc-link").forEach((link) => {
        if (link.getAttribute("href") === `#${this.activeId}`) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    }
  }

  UC.define("uc-guide", UCGuide);
})(window.UC);
