/**
 * <uc-problems> — decorates problem lists grouped in series (<section>s with
 * a heading and a list): judge and type tags, the series deadline, filters by
 * type and judge (`filters`) and a "Resolvido" checkbox per problem saved in
 * the browser (`track`), the languages a problem is tested in
 * (`data-languages`), hints in a <details> and a card layout (`cards`).
 * See docs/api.md, section 3.7.
 */
(function (UC) {
  "use strict";
  if (UC.__duplicate) return;

  const { h, uid, flag, announce, normalise, otherLanguage, storage, filterBar, deadlineStatus, withTime, deadlineTimes } = UC.internal;

  const TYPES = ["main", "extra", "challenge"];
  const TYPE_TONE = { extra: "uc-tag--accent", challenge: "uc-tag--warning" };

  /** The platform of a data-judge value: by id, else by label ignoring case and accents. */
  function platformOf(value) {
    const wanted = normalise(value);
    return (
      UC.course.platforms.find((platform) => platform.id === value) ||
      UC.course.platforms.find((platform) => normalise(UC.text(platform.label)) === wanted) ||
      null
    );
  }

  /** The `track` id of an item: data-id, else <judge>:<first <code>>, else the link's resolved URL. */
  function problemId(item, judge) {
    if (item.dataset.id) return item.dataset.id;
    const code = item.querySelector("code");
    if (code && code.textContent.trim()) return [judge, code.textContent.trim()].filter(Boolean).join(":");
    const link = item.querySelector("a[href]");
    return link ? link.href : normalise(item.textContent);
  }

  /** "Prazo: 12 out, 23:59 · Encerrado", from a deadline in course.js (a series of <uc-problems>, or <uc-problem>). */
  function deadlineLine(element, deadline, className) {
    const { precision, date } = deadline.parsed;
    const when = date && precision === "day" ? withTime(UC.formatDate(date), deadlineTimes(deadline)) : UC.formatDate(deadline.date);
    const { status, days } = deadlineStatus(deadline, UC.today());
    const text =
      status === "done"
        ? element.t("problems.closed")
        : status === "today"
          ? element.t("assessment.today")
          : status === "upcoming"
            ? days === 1
              ? element.t("assessment.tomorrow")
              : element.t("assessment.inDays", { count: days })
            : null;
    const tone = status === "done" ? "uc-tag--muted" : "uc-tag--warning";
    return h(
      "p",
      { class: className },
      element.t("problems.deadline", { date: when }),
      text ? [" ", h("span", { class: `uc-tag ${tone}` }, text)] : null,
    );
  }

  class UCProblems extends UC.Element {
    setup() {
      this.classList.add("uc-problems");
      this.headingId = uid("uc-problems-heading");
      this.content = Array.from(this.childNodes);
      const sections = Array.from(this.children).filter((child) => child.localName === "section");
      const lone = Array.from(this.children).find((child) => child.localName === "ol" || child.localName === "ul");
      const wrappers = sections.length ? sections : lone ? [null] : [];
      this.series = wrappers.map((section) => this.prepareSeries(section, section ? section.querySelector("ol, ul") : lone));
      this.items = this.series.flatMap((series) => series.items);
      this.empty = h("p", { class: "uc-problems__empty", hidden: true });

      if (flag(this, "track")) {
        // Another list of the same page (an index and a series) marked the same problem.
        this.onChange = (event) => {
          if (event.target === this) return;
          this.items.filter((item) => item.id === event.detail.id).forEach((item) => this.mark(item, event.detail.solved));
          this.series.forEach((series) => this.progress(series));
        };
      }
    }

    connectedCallback() {
      super.connectedCallback();
      if (this.onChange) document.addEventListener("uc:problemchange", this.onChange);
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      if (this.onChange) document.removeEventListener("uc:problemchange", this.onChange);
    }

    prepareSeries(section, list) {
      const series = { section, items: [], deadline: null, progressNode: null, meta: null };
      if (section) {
        section.classList.add("uc-problems__series");
        series.meta = h("div", { class: "uc-problems__meta" });
        const heading = section.querySelector("h2, h3, h4, h5, h6");
        if (heading) heading.after(series.meta);
        else section.prepend(series.meta);
        const id = section.dataset.deadline;
        if (id) {
          series.deadline = UC.course.deadlines.find((deadline) => deadline.id === id) || null;
          if (!series.deadline) console.warn(`[uc-kit] <uc-problems>: no deadline with id "${id}" in course.js.`);
        }
      }
      if (!list) return series;
      list.classList.add("uc-problems__list");
      series.items = Array.from(list.children)
        .filter((element) => element.localName === "li")
        .map((element) => this.prepareItem(element, series));
      // The same languages on every problem: said once, under the series heading.
      const keys = series.items.map((item) => item.languages.join());
      if (series.meta && keys.length > 1 && keys[0] && keys.every((key) => key === keys[0])) series.languages = series.items[0].languages;
      return series;
    }

    prepareItem(element, series) {
      element.classList.add("uc-problems__item");
      const value = (element.dataset.judge || "").trim();
      const platform = value ? platformOf(value) : null;
      const judge = platform ? platform.id || normalise(UC.text(platform.label)) : normalise(value);
      const type = TYPES.includes(element.dataset.type) ? element.dataset.type : "main";
      const link = element.querySelector("a");
      const name = (link || element).textContent.trim().replace(/\s+/g, " ");
      const weight = element.querySelector("data[value]");
      if (weight) {
        weight.classList.add("uc-tag", "uc-problems__weight");
        if (!weight.textContent.trim()) weight.textContent = `${weight.value} %`;
      }
      const code = element.querySelector("code");
      const hints = Array.from(element.children).find((child) => child.localName === "details");
      if (hints) {
        hints.classList.add("uc-problems__hints");
        const summary = hints.querySelector("summary");
        hints.hidden = !summary || hints.textContent.trim() === summary.textContent.trim();
        hints.remove();
      }
      const languages = (element.dataset.languages || "").split(",").map((language) => language.trim()).filter(Boolean);
      const langs = h("span", { class: "uc-problems__languages" });
      const body = h("span", { class: "uc-problems__body" }, Array.from(element.childNodes));
      const tags = h("span", { class: "uc-problems__tags" });
      element.append(body, tags, langs, hints || "");
      const item = { element, series, value, platform, judge, type, name, tags, code, languages, langs, id: problemId(element, judge), solved: false };
      if (flag(this, "track")) {
        item.checkbox = h("input", { type: "checkbox", onChange: () => this.toggle(item) });
        item.solvedText = h("span", {});
        element.prepend(h("label", { class: "uc-problems__solved" }, item.checkbox, item.solvedText));
        this.mark(item, storage.get("solved", item.id) === "1");
      }
      return item;
    }

    mark(item, solved) {
      item.solved = solved;
      if (item.checkbox) item.checkbox.checked = solved;
      item.element.classList.toggle("uc-problems__item--solved", solved);
    }

    toggle(item) {
      const solved = item.checkbox.checked;
      if (solved) storage.set("solved", item.id, "1");
      else storage.remove("solved", item.id);
      this.items.filter((other) => other.id === item.id).forEach((other) => this.mark(other, solved));
      this.series.forEach((series) => this.progress(series));
      this.dispatchEvent(new CustomEvent("uc:problemchange", { bubbles: true, detail: { id: item.id, solved } }));
    }

    /** "3 de 5 resolvidos" under the series heading (not live: the checkbox state is read by itself). */
    progress(series) {
      if (!series.progressNode) return;
      const items = series.items.filter((item) => !otherLanguage(item.element));
      series.progressNode.textContent = this.t("problems.progress", { done: items.filter((item) => item.solved).length, total: items.length });
    }

    render() {
      this.items.forEach((item) => {
        const tags = [];
        const cards = flag(this, "cards");
        // With `cards`, the judge tag carries the problem code and links to the judge: "Mooshak PC033".
        const url = cards && item.platform && item.platform.url;
        if (item.value) {
          tags.push(
            h(url ? "a" : "span", { class: "uc-tag uc-tag--muted uc-problems__judge", href: url || null }, item.platform ? this.text(item.platform.label) : item.value, cards && item.code ? [" ", item.code] : null),
          );
        }
        item.langs.replaceChildren(...(item.series.languages ? [] : this.languages(item.languages)));
        item.langs.hidden = !item.langs.firstChild;
        if (item.type !== "main") tags.push(h("span", { class: `uc-tag ${TYPE_TONE[item.type]} uc-problems__type` }, this.t(`problems.types.${item.type}`)));
        item.tags.replaceChildren(...tags);
        if (item.checkbox) {
          item.solvedText.textContent = this.t("problems.solved");
          item.checkbox.setAttribute("aria-label", this.t("problems.solvedNamed", { name: item.name }));
        }
      });
      this.series.forEach((series) => {
        if (!series.meta) return;
        series.meta.replaceChildren();
        if (series.deadline) series.meta.append(this.deadlineLine(series.deadline));
        if (series.languages) series.meta.append(h("p", { class: "uc-problems__languages" }, this.languages(series.languages)));
        if (flag(this, "track") && series.items.length) {
          series.progressNode = h("p", { class: "uc-problems__progress" });
          series.meta.append(series.progressNode);
          this.progress(series);
        }
        series.meta.hidden = !series.meta.firstChild;
      });

      const bar = flag(this, "filters") ? this.filterBar() : null;
      const label = this.getAttribute("heading");
      const heading =
        label && label.trim() && label.trim().toLowerCase() !== "none"
          ? h(UC.internal.headingTag(this), { class: "uc-problems__heading", id: this.headingId }, label)
          : null;
      this.empty.textContent = this.t("problems.none");
      this.replaceChildren(
        h(heading ? "section" : "div", { class: "uc-problems__section", "aria-labelledby": heading ? this.headingId : null }, heading, bar, this.content, this.empty),
      );
      this.filter(false);
    }

    /** "Testado em" and one tag per language. */
    languages(list) {
      return list.length ? [this.t("problems.languages"), " ", list.map((language) => h("span", { class: "uc-tag uc-tag--muted" }, language))].flat() : [];
    }

    deadlineLine(deadline) {
      return deadlineLine(this, deadline, "uc-problems__deadline");
    }

    /** The filter bar: one group per attribute with two or more values, rebuilt per render (language). */
    filterBar() {
      const previous = this.bar;
      const groups = [];
      const types = TYPES.filter((type) => this.items.some((item) => item.type === type));
      if (types.length > 1) {
        groups.push({ id: "type", label: this.t("problems.type"), options: types.map((type) => ({ value: type, label: this.t(`problems.types.${type}`) })) });
      }
      const judges = new Map();
      this.items.forEach((item) => {
        if (item.judge && !judges.has(item.judge)) judges.set(item.judge, item.platform ? this.text(item.platform.label) : item.value);
      });
      if (judges.size > 1) {
        groups.push({ id: "judge", label: this.t("problems.judge"), options: Array.from(judges, ([value, label]) => ({ value, label })) });
      }
      if (!groups.length) {
        this.bar = null;
        return null;
      }
      groups.forEach((group) => {
        group.options.unshift({ value: "", label: this.t("problems.all") });
        group.value = previous ? previous.value(group.id) || "" : "";
      });
      this.bar = filterBar({ label: this.t("problems.filters"), groups, onChange: () => this.filter(true) });
      this.bar.element.classList.add("uc-problems__filters");
      return this.bar.element;
    }

    /** Shows the problems of the chosen type and judge; hides series left empty; announces the count. */
    filter(speak) {
      const type = this.bar ? this.bar.value("type") || "" : "";
      const judge = this.bar ? this.bar.value("judge") || "" : "";
      let shown = 0;
      let total = 0;
      this.items.forEach((item) => {
        const match = (!type || item.type === type) && (!judge || item.judge === judge);
        item.element.hidden = !match;
        if (otherLanguage(item.element)) return;
        total += 1;
        if (match) shown += 1;
      });
      this.series.forEach((series) => {
        if (series.section && series.items.length) series.section.hidden = series.items.every((item) => item.element.hidden);
      });
      this.empty.hidden = shown > 0 || !total;
      if (speak) announce(this.t("problems.count", { shown, total }));
    }
  }

  UC.define("uc-problems", UCProblems);

  /**
   * <uc-problem code="PI013" judge="mooshak" deadline="aula05" track> — the
   * header of one problem statement: the judge and code (a link to the
   * platform), the deadline of its series, "Submeter no …" and "Resolvido",
   * stored under the same key as the problem in <uc-problems track>.
   */
  class UCProblem extends UC.Element {
    setup() {
      this.classList.add("uc-problem");
      this.code = (this.getAttribute("code") || "").trim();
      const value = (this.getAttribute("judge") || "").trim();
      this.platform = value ? platformOf(value) : null;
      const judge = this.platform ? this.platform.id || normalise(UC.text(this.platform.label)) : normalise(value);
      this.problemId = this.getAttribute("data-id") || [judge, this.code].filter(Boolean).join(":");
      this.judgeLabel = value;
      const id = this.getAttribute("deadline");
      this.deadline = id ? UC.course.deadlines.find((deadline) => deadline.id === id) || null : null;
      if (id && !this.deadline) console.warn(`[uc-kit] <uc-problem>: no deadline with id "${id}" in course.js.`);
      if (flag(this, "track")) {
        this.checkbox = h("input", { type: "checkbox", onChange: () => this.toggle() });
        this.onChange = (event) => {
          if (event.target !== this && event.detail.id === this.problemId) this.mark(event.detail.solved);
        };
      }
    }

    connectedCallback() {
      super.connectedCallback();
      if (this.onChange) document.addEventListener("uc:problemchange", this.onChange);
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      if (this.onChange) document.removeEventListener("uc:problemchange", this.onChange);
    }

    mark(solved) {
      this.checkbox.checked = solved;
      this.classList.toggle("uc-problem--solved", solved);
    }

    toggle() {
      const solved = this.checkbox.checked;
      if (solved) storage.set("solved", this.problemId, "1");
      else storage.remove("solved", this.problemId);
      this.mark(solved);
      this.dispatchEvent(new CustomEvent("uc:problemchange", { bubbles: true, detail: { id: this.problemId, solved } }));
    }

    render() {
      const label = this.platform ? this.text(this.platform.label) : this.judgeLabel;
      const url = this.platform && this.platform.url;
      const seal = label || this.code
        ? h(url ? "a" : "span", { class: "uc-tag uc-tag--muted uc-problem__judge", href: url || null }, [label, this.code].filter(Boolean).join(" "))
        : null;
      const meta = h("div", { class: "uc-problem__meta" }, seal, this.deadline ? deadlineLine(this, this.deadline, "uc-problem__deadline") : null);
      const submit = url
        ? h("a", { class: "uc-button uc-button--primary uc-problem__submit", href: url }, this.t("exercise.submitOn", { platform: label }))
        : null;
      let solved = null;
      if (this.checkbox) {
        this.checkbox.setAttribute("aria-label", this.t("problems.solvedNamed", { name: this.code || document.title }));
        solved = h("label", { class: "uc-problems__solved uc-problem__solved" }, this.checkbox, h("span", {}, this.t("problems.solved")));
        this.mark(storage.get("solved", this.problemId) === "1");
      }
      const actions = submit || solved ? h("div", { class: "uc-problem__actions" }, submit, solved) : null;
      this.replaceChildren(meta, actions || "");
    }
  }

  UC.define("uc-problem", UCProblem);
})(window.UC);
