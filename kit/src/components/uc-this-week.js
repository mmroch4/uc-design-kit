/**
 * <uc-this-week> — "This week" card for the home page: week number and
 * dates, deadlines this week and next, and a link to the week on the weeks
 * page. Over HTTP(S) it also fetches the weeks page and shows the current
 * week's title and <dl> rows (progressive enhancement). Outside the semester
 * it shows the next relevant date. See docs/api.md, section 3.3.
 */
(function (UC) {
  "use strict";
  if (UC.__duplicate) return;

  const { h, uid, addDays, toISO, deadlinesBetween, deadlineTime } = UC.internal;
  const UPCOMING_LIMIT = 3;

  /** Inline elements kept when copying rows from the weeks page, with their allowed attributes. */
  const ALLOWED = {
    a: ["href", "lang"],
    strong: ["lang"],
    b: ["lang"],
    em: ["lang"],
    i: ["lang"],
    code: ["lang"],
    span: ["lang"],
    time: ["datetime", "lang"],
    br: [],
  };
  const URL_ATTRIBUTES = ["href"];

  /**
   * Copies the children of `source` (a node of a fetched document) keeping
   * text and a small set of inline elements; anything else is unwrapped.
   * Relative links are resolved against `baseUrl`; script URLs are dropped.
   */
  function copyInline(source, baseUrl) {
    const result = document.createDocumentFragment();
    source.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        result.append(node.textContent);
        return;
      }
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      const name = node.localName;
      if (!(name in ALLOWED)) {
        if (name !== "script" && name !== "style" && name !== "template") result.append(copyInline(node, baseUrl));
        return;
      }
      const copy = document.createElement(name);
      ALLOWED[name].forEach((attribute) => {
        let value = node.getAttribute(attribute);
        if (value === null) return;
        if (URL_ATTRIBUTES.includes(attribute)) {
          try {
            const url = new URL(value, baseUrl);
            if (!/^(https?|mailto|file):$/.test(url.protocol)) return;
            value = url.href;
          } catch (error) {
            return;
          }
        }
        copy.setAttribute(attribute, value);
      });
      copy.append(copyInline(node, baseUrl));
      result.append(copy);
    });
    return result;
  }

  /** The `weeks` page href from the configuration, or null. */
  function weeksPageHref() {
    const page = UC.course.pages.find((entry) => entry.id === "weeks");
    return page ? UC.text(page.href) : null;
  }

  /** Dated deadlines (day or month precision) on or after `from`, in date order. */
  function upcomingDeadlines(from) {
    return UC.course.deadlines.filter((deadline) => {
      const { precision, date } = deadline.parsed;
      if (precision === "day") return (deadline.endDate || date) >= from;
      if (precision === "month") return new Date(date.getFullYear(), date.getMonth() + 1, 1) > from;
      return false;
    });
  }

  function parseHtml(html) {
    return new DOMParser().parseFromString(html, "text/html");
  }

  /* The weeks page cache, saved per course (core/storage.js); without storage the card just waits for the fetch. */
  const readCache = (url) => UC.internal.storage.get("weeks-page", url, { legacy: `uc:weeks-page:${url}` });
  const writeCache = (url, html) => UC.internal.storage.set("weeks-page", url, html);

  class UCThisWeek extends UC.Element {
    static get observedAttributes() {
      return ["source", "kind", "heading-level"];
    }

    /** Keeps only the deadlines whose kind is listed in the `kind` attribute (all when absent). */
    ofKinds(deadlines) {
      const kinds = (this.getAttribute("kind") || "").split(/\s+/).filter(Boolean);
      return kinds.length ? deadlines.filter((deadline) => kinds.includes(deadline.kind)) : deadlines;
    }

    attributeChangedCallback() {
      this.fetched = null;
      if (this.__ucSetupDone && this.isConnected) this.render();
    }

    setup() {
      this.classList.add("uc-this-week");
      this.extra = Array.from(this.childNodes);
      this.headingId = uid("uc-this-week");
      this.fetched = null; // { url, promise, doc } once a fetch has started
    }

    render() {
      const calendar = UC.internal.calendar();
      const today = UC.today();
      const first = calendar.weeks[0];
      const last = calendar.weeks[calendar.weeks.length - 1];

      let content;
      if (!first) content = this.renderOutside(null, this.ofKinds(upcomingDeadlines(today)).slice(0, UPCOMING_LIMIT));
      else if (today < first.monday) content = this.renderOutside("before", this.ofKinds(upcomingDeadlines(today)).slice(0, 1), first);
      else if (today >= addDays(last.monday, 7)) content = this.renderOutside("after", this.ofKinds(upcomingDeadlines(today)).slice(0, UPCOMING_LIMIT));
      else content = this.renderInside(calendar, today);

      this.replaceChildren(
        h("section", { class: "uc-card uc-card--accent uc-this-week__card", "aria-labelledby": this.headingId }, content, this.extra),
      );
    }

    heading(key, meta) {
      return h(
        "div",
        { class: "uc-this-week__header" },
        h(UC.internal.headingTag(this), { class: "uc-this-week__heading", id: this.headingId }, this.t(key)),
        meta ? h("span", { class: "uc-this-week__meta" }, meta) : null,
      );
    }

    /** Card content during the semester: a teaching week or a break week. */
    renderInside(calendar, today) {
      const monday = UC.internal.mondayOf(today);
      const week = calendar.weeks.find((item) => +item.monday === +monday) || null;
      const pause = week ? null : calendar.breaks.find((item) => +item.monday === +monday) || null;
      const nextWeek = week ? week : calendar.weeks.find((item) => item.monday > monday);

      let meta;
      if (week) {
        meta = [this.t("weeks.week", { n: week.n }), " · ", this.timeRange(week.start, week.end)];
      } else {
        const label = pause && pause.label ? `${this.text(pause.label)}, ` : "";
        meta = [this.timeRange(pause.start, pause.end), ` · ${label}${this.t("weeks.noClasses")}`];
      }

      const items = [];
      if (week) items.push(...this.fetchedItems(week.n));
      this.ofKinds(deadlinesBetween(monday, addDays(monday, 14))).forEach((deadline) => items.push(this.deadlineItem(deadline)));

      return [
        this.heading("weeks.thisWeek", meta),
        week ? this.fetchedTitle(week.n) : null,
        items.length ? h("div", { class: "uc-this-week__items" }, items) : null,
        nextWeek ? this.weekLink(nextWeek.n) : null,
      ];
    }

    /** Card content before the semester starts, after it ends, or without a calendar. */
    renderOutside(when, deadlines, firstWeek) {
      let message = null;
      if (when === "before") {
        message = UC.internal.tNodes("weeks.beforeStart", {
          date: h("time", { datetime: toISO(firstWeek.start) }, UC.formatDate(firstWeek.start, "long")),
        });
      } else if (when === "after") {
        message = this.t("weeks.afterEnd");
      } else if (!deadlines.length) {
        message = this.t("deadlines.empty");
      }
      return [
        this.heading("weeks.nextUp"),
        message ? h("p", { class: "uc-this-week__message" }, message) : null,
        deadlines.length ? h("div", { class: "uc-this-week__items" }, deadlines.map((deadline) => this.deadlineItem(deadline))) : null,
        when === "before" ? this.weekLink(firstWeek.n) : null,
      ];
    }

    timeRange(start, end) {
      return h("time", { datetime: toISO(start) }, UC.formatDateRange(start, end));
    }

    item(label, title, detail) {
      return h(
        "div",
        { class: "uc-this-week__item" },
        h("span", { class: "uc-this-week__label" }, label),
        title,
        detail,
      );
    }

    deadlineItem(deadline) {
      const titleText = this.text(deadline.title);
      const title = deadline.url
        ? h("a", { class: "uc-this-week__title", href: deadline.url }, titleText)
        : h("span", { class: "uc-this-week__title" }, titleText);
      const detail = h(
        "span",
        { class: "uc-this-week__detail" },
        deadlineTime(deadline, "uc-this-week__date"),
        deadline.note ? [" · ", h("span", { html: this.text(deadline.note) })] : null,
        deadline.links.map((link) => [" · ", h("a", { href: link.url }, this.text(link.label))]),
      );
      return this.item(UC.t(`kinds.${deadline.kind}`), title, detail);
    }

    weekLink(n) {
      const base = weeksPageHref();
      if (!base) return null;
      return h(
        "p",
        { class: "uc-this-week__more" },
        h("a", { class: "uc-this-week__link", href: `${base.split("#")[0]}#week-${n}` }, this.t("weeks.seeWeek", { n })),
      );
    }

    /* ---- Progressive enhancement: the current week from the weeks page ---- */

    sourceUrl() {
      const source = this.getAttribute("source") || weeksPageHref();
      if (!source) return null;
      try {
        return new URL(source, window.location.href);
      } catch (error) {
        return null;
      }
    }

    /** The fetched <uc-week n="n"> element, or null (starting the fetch when needed). */
    sourceWeek(n) {
      if (!/^https?:$/.test(window.location.protocol)) return null;
      const url = this.sourceUrl();
      if (!url || !/^https?:$/.test(url.protocol)) return null;
      if (!this.fetched || this.fetched.url !== url.href) this.startFetch(url);
      const doc = this.fetched.doc;
      return doc ? doc.querySelector(`uc-week[n="${CSS.escape(String(n))}"]`) : null;
    }

    startFetch(url) {
      // The last copy of the weeks page is kept in localStorage, so the card is complete
      // on the first render and does not grow (layout shift) when the fetch returns.
      const cached = readCache(url.href);
      const state = { url: url.href, doc: cached ? parseHtml(cached) : null };
      this.fetched = state;
      fetch(url.href, { credentials: "same-origin" })
        .then((response) => (response.ok ? response.text() : Promise.reject(new Error(String(response.status)))))
        .then((html) => {
          if (this.fetched !== state || html === cached) return;
          writeCache(url.href, html);
          state.doc = parseHtml(html);
          if (this.isConnected) this.render();
        })
        .catch(() => {
          /* Enhancement only: without the weeks page the card still shows dates and deadlines. */
        });
    }

    fetchedTitle(n) {
      const week = this.sourceWeek(n);
      if (!week) return null;
      const title = week.getAttribute(`title-${UC.lang}`) || week.getAttribute("title");
      return title ? h("p", { class: "uc-this-week__week-title" }, title) : null;
    }

    /**
     * One item per <dt> of the week's <dl> (direct children), with its <dd>
     * values. <div> groups inside the <dl> are allowed, as in HTML.
     */
    fetchedItems(n) {
      const week = this.sourceWeek(n);
      if (!week) return [];
      const base = this.fetched.url;
      const entries = [];
      Array.from(week.children)
        .filter((child) => child.localName === "dl")
        .forEach((list) => {
          Array.from(list.children).forEach((child) => {
            if (child.localName === "div") entries.push(...child.children);
            else entries.push(child);
          });
        });

      const groups = [];
      entries.forEach((entry) => {
        const lang = entry.getAttribute("lang");
        if (entry.localName === "dt") {
          groups.push({ label: copyInline(entry, base), lang, values: [] });
        } else if (entry.localName === "dd" && groups.length) {
          groups[groups.length - 1].values.push(h("span", { class: "uc-this-week__detail", lang }, copyInline(entry, base)));
        }
      });
      return groups.map((group) => {
        const item = this.item(group.label, null, group.values);
        if (group.lang) item.setAttribute("lang", group.lang);
        return item;
      });
    }
  }

  UC.define("uc-this-week", UCThisWeek);
})(window.UC);
