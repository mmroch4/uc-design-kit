/**
 * <uc-summaries> — decorates the teacher's numbered list of lecture
 * summaries: date with weekday, link to the matching week, semester breaks
 * between items, "Última aula" / "Prevista" states and, with `search`, an
 * accent-insensitive search that highlights matches. See docs/api.md,
 * section 3.3.
 */
(function (UC) {
  "use strict";
  if (UC.__duplicate) return;

  const { h, uid, flag, announce, normalise, firstTime, localiseTime, parseDay, otherLanguage } = UC.internal;

  /** Text nodes of `root` that are shown in the active language. */
  function visibleTextNodes(root) {
    const nodes = [];
    const walk = (node) => {
      for (const child of node.childNodes) {
        if (child.nodeType === 3) nodes.push(child);
        else if (child.nodeType === 1 && !otherLanguage(child) && !child.classList.contains("uc-summaries__number")) walk(child);
      }
    };
    walk(root);
    return nodes;
  }

  /**
   * Ranges [start, end) of `query` (already normalised) in `text`, ignoring
   * case and accents, as indices of `text`.
   */
  function findMatches(text, query) {
    if (!query) return [];
    let folded = "";
    const starts = [];
    const ends = [];
    let index = 0;
    for (const char of text) {
      const piece = normalise(char) || (char.trim() ? "" : " ");
      for (let i = 0; i < piece.length; i += 1) {
        starts.push(index);
        ends.push(index + char.length);
      }
      folded += piece;
      index += char.length;
    }
    const ranges = [];
    for (let at = folded.indexOf(query); at !== -1; at = folded.indexOf(query, at + query.length)) {
      ranges.push([starts[at], ends[at + query.length - 1]]);
    }
    return ranges;
  }

  /** Wraps the matches of `query` in the visible text of `root` with <mark>. */
  function highlight(root, query) {
    visibleTextNodes(root).forEach((node) => {
      const ranges = findMatches(node.data, query);
      for (let i = ranges.length - 1; i >= 0; i -= 1) {
        const [start, end] = ranges[i];
        const match = node.splitText(start);
        match.splitText(end - start);
        const mark = h("mark", { class: "uc-summaries__mark" });
        match.replaceWith(mark);
        mark.append(match);
      }
    });
  }

  /** Removes the <mark> elements added by `highlight`. */
  function clearHighlight(root) {
    root.querySelectorAll("mark.uc-summaries__mark").forEach((mark) => {
      const parent = mark.parentNode;
      mark.replaceWith(...mark.childNodes);
      parent.normalize();
    });
  }

  class UCSummaries extends UC.Element {
    setup() {
      this.classList.add("uc-summaries");
      this.list = Array.from(this.children).find((child) => child.localName === "ol" || child.localName === "ul") || null;
      this.extra = Array.from(this.childNodes).filter((node) => node !== this.list);
      this.headingId = uid("uc-summaries-heading");
      this.generated = [];
      if (!this.list) return;
      this.list.classList.add("uc-summaries__list");
      this.start = this.list.localName === "ol" && this.list.hasAttribute("start") ? Number(this.list.getAttribute("start")) || 1 : 1;
      this.items = Array.from(this.list.children)
        .filter((item) => item.localName === "li")
        .map((element) => this.prepare(element));

      if (flag(this, "search")) {
        const id = uid("uc-summaries-search");
        this.label = h("label", { for: id });
        this.input = h("input", { id, type: "search", autocomplete: "off", spellcheck: "false" });
        this.input.addEventListener("input", () => this.filter(true));
        this.input.addEventListener("keydown", (event) => {
          if (event.key !== "Escape" || !this.input.value) return;
          event.preventDefault();
          this.input.value = "";
          this.filter(true);
        });
        this.search = h("p", { class: "uc-summaries__search" }, this.label, this.input);
      }
      this.empty = h("p", { class: "uc-summaries__empty", hidden: true });
    }

    /**
     * Splits an item into a date column (the first <time>, the week link and
     * the state) and its body, once. Returns { element, aside, body, time, date }.
     */
    prepare(element) {
      element.classList.add("uc-summaries__item");
      const found = firstTime(element);
      const aside = h("div", { class: "uc-summaries__aside" });
      const body = h("div", { class: "uc-summaries__body" });
      if (found && found.element.parentElement === element) {
        // The date leads the item: it moves to the date column with the separator after it.
        const next = found.element.nextSibling;
        aside.append(found.element);
        if (next && next.nodeType === 3) next.data = next.data.replace(/^\s*[·:,.—–-]?\s*/, "");
      }
      const number = this.list.localName === "ol" ? h("span", { class: "uc-summaries__number" }) : null;
      body.append(...[number, ...Array.from(element.childNodes)].filter(Boolean));
      element.append(aside, body);
      if (found) found.element.classList.add("uc-summaries__date");
      return { element, aside, body, number, time: found ? found.element : null, date: found ? found.date : null, extras: [] };
    }

    render() {
      if (!this.list) return;
      this.generated.forEach((node) => node.remove());
      this.generated = [];
      const today = UC.today();
      const weeksPage = UC.course.pages.find((page) => page.id === "weeks");
      const weeksHref = weeksPage && !flag(this, "no-weeks") ? UC.text(weeksPage.href) : null;

      // Numbers from the original position among the items shown in the active language.
      let number = this.start;
      this.items.forEach((item) => {
        if (otherLanguage(item.element)) return;
        item.element.value = number;
        if (item.number) item.number.textContent = `${number}. `;
        number += 1;
      });

      const dated = this.items.filter((item) => item.date && !otherLanguage(item.element));
      const past = dated.filter((item) => item.date <= today);
      const last = past.reduce((best, item) => (!best || item.date >= best.date ? item : best), null);

      this.items.forEach((item) => {
        item.extras.forEach((node) => node.remove());
        item.extras = [];
        const planned = Boolean(item.date && item.date > today);
        item.element.classList.toggle("uc-summaries__item--planned", planned);
        item.element.classList.toggle("uc-summaries__item--last", item === last);
        if (!item.date) return;
        if (item.time) localiseTime(item.time, "weekday");
        const week = UC.weekOf(item.date);
        if (week && weeksHref) {
          item.extras.push(h("a", { class: "uc-summaries__week", href: `${weeksHref.split("#")[0]}#week-${week.n}` }, this.t("weeks.week", { n: week.n })));
        }
        if (item === last || planned) {
          item.extras.push(
            h("span", { class: `uc-tag ${planned ? "uc-tag--muted" : "uc-tag--accent"} uc-summaries__state` }, this.t(planned ? "summaries.planned" : "summaries.last")),
          );
        }
        item.aside.append(...item.extras);
      });

      // Display order, then the breaks between two items that straddle them.
      const descending = this.getAttribute("order") === "desc";
      const ordered = descending ? [...this.items].reverse() : this.items;
      ordered.forEach((item) => this.list.append(item.element));
      if (!flag(this, "no-breaks")) this.renderBreaks(ordered, descending);

      const label = this.getAttribute("heading");
      const heading =
        label !== null && label.trim().toLowerCase() === "none"
          ? null
          : h(UC.internal.headingTag(this), { class: "uc-summaries__heading", id: this.headingId }, label && label.trim() ? label : this.t("summaries.heading"));
      if (this.label) this.label.textContent = this.t("summaries.search");
      this.empty.textContent = this.t("summaries.none");
      this.replaceChildren(
        h("section", { class: "uc-summaries__section", "aria-labelledby": heading ? this.headingId : null }, heading, this.search, this.list, this.empty, this.extra),
      );
      this.filter(false);
    }

    renderBreaks(ordered, descending) {
      const breaks = ((UC.course.semester && UC.course.semester.breaks) || [])
        .map((item) => ({ start: parseDay(item.start), end: parseDay(item.end), label: item.label }))
        .filter((item) => item.start && item.end)
        .sort((a, b) => (descending ? b.start - a.start : a.start - b.start));
      let previous = null;
      ordered.forEach((item) => {
        if (!item.date) return;
        if (previous) {
          const [early, late] = descending ? [item.date, previous.date] : [previous.date, item.date];
          breaks
            .filter((gap) => early < gap.start && late > gap.end)
            .forEach((gap) => {
              const node = h(
                "li",
                { class: "uc-summaries__break", "data-uc-generated": "" },
                this.t("summaries.break", {
                  label: gap.label ? this.text(gap.label) : this.t("weeks.noClasses"),
                  dates: UC.formatDateRange(gap.start, gap.end),
                }),
              );
              item.element.before(node);
              this.generated.push(node);
            });
        }
        previous = item;
      });
    }

    /** Shows the items that match the search, highlights the matches and (when typing) announces the count. */
    filter(speak) {
      const query = this.input ? normalise(this.input.value) : "";
      const total = this.items.filter((item) => !otherLanguage(item.element)).length;
      let count = 0;
      this.items.forEach((item) => {
        clearHighlight(item.body);
        const match = !query || findMatches(visibleTextNodes(item.body).map((node) => node.data).join(""), query).length > 0;
        item.element.hidden = !match;
        if (match && !otherLanguage(item.element)) count += 1;
        if (match && query) highlight(item.body, query);
      });
      this.generated.forEach((node) => (node.hidden = Boolean(query)));
      this.empty.hidden = !query || count > 0;
      if (speak) {
        announce(count ? this.t("summaries.count", { shown: count, total }) : this.t("summaries.none"), 300);
      }
    }
  }

  Object.assign(UC.internal, { findMatches });
  UC.define("uc-summaries", UCSummaries);
})(window.UC);
