/**
 * <uc-problems> — decorates problem lists grouped in series (<section>s with
 * a heading and a list): judge and type tags, the series deadline, filters by
 * type and judge (`filters`) and a "Resolvido" checkbox per problem saved in
 * the browser (`track`). See docs/api.md, section 3.7.
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
      const body = h("span", { class: "uc-problems__body" }, Array.from(element.childNodes));
      const tags = h("span", { class: "uc-problems__tags" });
      element.append(body, tags);
      const item = { element, series, value, platform, judge, type, name, tags, id: problemId(element, judge), solved: false };
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
        if (item.value) tags.push(h("span", { class: "uc-tag uc-tag--muted uc-problems__judge" }, item.platform ? this.text(item.platform.label) : item.value));
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

    /** "Prazo: 12 out, 23:59 · Encerrado", from the series' deadline in course.js. */
    deadlineLine(deadline) {
      const { precision, date } = deadline.parsed;
      const when = date && precision === "day" ? withTime(UC.formatDate(date), deadlineTimes(deadline)) : UC.formatDate(deadline.date);
      const { status, days } = deadlineStatus(deadline, UC.today());
      const text =
        status === "done"
          ? this.t("problems.closed")
          : status === "today"
            ? this.t("assessment.today")
            : status === "upcoming"
              ? days === 1
                ? this.t("assessment.tomorrow")
                : this.t("assessment.inDays", { count: days })
              : null;
      const tone = status === "done" ? "uc-tag--muted" : "uc-tag--warning";
      return h(
        "p",
        { class: "uc-problems__deadline" },
        this.t("problems.deadline", { date: when }),
        text ? [" ", h("span", { class: `uc-tag ${tone}` }, text)] : null,
      );
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
})(window.UC);
