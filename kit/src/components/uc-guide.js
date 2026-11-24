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

  const { h, uid, number, anchors, isHiddenByLanguage, visibleText, exercisesIn, isExerciseDone } = UC.internal;
  const { scrollspy } = UC.internal;

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

      this.addEventListener("uc:exercisechange", () => this.updateProgress());
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      if (this.spy) this.spy.disconnect();
      this.spy = null;
    }

    render() {
      this.headings = Array.from(this.content.querySelectorAll("h2")).filter((heading) => !isHiddenByLanguage(heading));
      this.headings.forEach((heading) => {
        // Inside <uc-page> core/anchors.js already gave every <h2> an id; this
        // covers a guide used without <uc-page>.
        if (!heading.id) heading.id = anchors.uniqueId(anchors.slugify(visibleText(heading)));
      });

      // Layout "docs": the page's "On this page" column lists the headings, and
      // the progress goes to its top (themes-layouts.md 6.2).
      const page = this.closest("uc-page");
      this.column = page && page.tocColumn && page.tocColumn.isConnected ? page.tocColumn : null;
      if (this.progress) this.progress.remove();
      this.progress = this.renderProgress();
      this.toc = this.hasAttribute("no-toc") || this.column ? null : this.renderToc();
      if (this.column) this.column.prepend(this.progress);
      this.aside.replaceChildren(...[this.column ? null : this.progress, this.toc].filter(Boolean));

      // Only the breadcrumbs are replaced: the layout (and the teacher content) never leaves the DOM.
      const crumbs = this.renderCrumbs();
      this.renderWeekLabel();
      this.renderPager();
      if (this.layout.parentNode !== this) this.replaceChildren(this.layout);
      if (this.crumbs) this.crumbs.remove();
      this.crumbs = crumbs;
      if (crumbs) this.prepend(crumbs);
      this.updateProgress();
      if (this.spy) this.spy.disconnect();
      this.spy = this.toc && this.isConnected ? scrollspy(this.headings, (heading) => scrollspy.markCurrent(this.toc.querySelectorAll(".uc-guide__toc-link"), heading)) : null;
    }

    /* ---------- Breadcrumbs ---------- */

    renderCrumbs() {
      const items = [];
      const week = number(this, "week", null);
      // parent="assessment": the first crumb is that page of course.js (an exam guide), with no week.
      const parentId = this.getAttribute("parent");
      const parent = parentId && parentId !== "weeks" ? UC.course.pages.find((entry) => entry.id === parentId) || null : null;
      const page = parent || weeksPage();
      const weeksHref = page ? UC.text(page.href) : UC.internal.resolvePageHref(UC.internal.builtinPages.weeks);

      if (page) {
        const label = page.label ? UC.text(page.label) : this.t(`pages.${page.id}`);
        items.push(h("a", { href: weeksHref }, label));
      }
      if (week !== null && !parent) {
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

    /** week-label: "Semana 6 · 20–24 out" above the guide's <h1>, from course.js. */
    renderWeekLabel() {
      if (this.weekLabel) this.weekLabel.remove();
      this.weekLabel = null;
      const week = number(this, "week", null);
      if (week === null || !this.hasAttribute("week-label")) return;
      const heading = Array.from(this.content.querySelectorAll("h1")).find((h1) => !isHiddenByLanguage(h1));
      if (!heading) return;
      const span = UC.weekDates(week);
      this.weekLabel = h(
        "p",
        { class: "uc-eyebrow uc-guide__week" },
        this.t("weeks.week", { n: week }),
        span ? [" · ", h("time", { datetime: UC.internal.toISO(span.start) }, UC.formatDateRange(span.start, span.end))] : null,
      );
      heading.before(this.weekLabel);
    }

    /** prev / next: links to the previous and next guides after the content. */
    renderPager() {
      if (this.pager) this.pager.remove();
      this.pager = null;
      const links = ["prev", "next"]
        .filter((name) => this.getAttribute(name))
        .map((name) => h("a", { class: `uc-guide__pager-link uc-guide__pager-link--${name}`, href: this.getAttribute(name), rel: name }, this.t(`guide.${name}`)));
      if (!links.length) return;
      this.pager = h("nav", { class: "uc-guide__pager", "aria-label": this.t("guide.pager") }, links);
      this.content.append(this.pager);
    }

    /** Text of the guide's first <h1> visible in the active language. */
    pageTitle() {
      const heading = Array.from(this.content.querySelectorAll("h1")).find((h1) => !isHiddenByLanguage(h1));
      return heading ? visibleText(heading) : "";
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
      const exercises = exercisesIn(this);
      const total = exercises.length;
      const done = exercises.filter(isExerciseDone).length;
      this.progress.hidden = total === 0;
      this.classList.toggle("uc-guide--no-aside", (total === 0 || Boolean(this.column)) && !this.toc);
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
                { class: "uc-guide__toc-link", href: `#${heading.id}`, onClick: (event) => scrollspy.goTo(event, heading) },
                visibleText(heading),
              ),
            ),
          ),
        ),
      );
    }
  }

  UC.define("uc-guide", UCGuide);
})(window.UC);
