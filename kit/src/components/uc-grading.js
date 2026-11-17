/**
 * <uc-grading> — decorates the teacher's list of grade components: generated
 * formula, proportions bar, table of weights and minimums and, with
 * `calculator`, a grade simulation. Weights are read from each item's <data>.
 * See docs/api.md, section 3.6.
 */
(function (UC) {
  "use strict";
  if (UC.__duplicate) return;

  const { h, uid, flag, number, announce } = UC.internal;

  /** "14", "0,1", "25%" → number; NaN otherwise. */
  const parseNumber = (value) => (/^\s*-?\d+([.,]\d+)?\s*%?\s*$/.test(value || "") ? Number(value.replace(",", ".").replace("%", "")) : NaN);
  const fmt = (value, digits = 2) => new Intl.NumberFormat(UC.lang, { maximumFractionDigits: digits }).format(value);
  const pct = (share) => new Intl.NumberFormat(UC.lang, { style: "percent", maximumFractionDigits: 1 }).format(share);
  const listOf = (element) => element.querySelector(":scope > ul, :scope > ol");

  /**
   * Reads a list into components:
   * { item, code, scale, min, bonus, weight, share, data, parts, parent }.
   * Shares are the weights normalised among the non-bonus siblings.
   */
  function parse(list, scale, parent, total) {
    const items = Array.from(list.children).filter((item) => item.localName === "li");
    const components = items.map((item) => {
      const data = Array.from(item.querySelectorAll("data")).find((element) => element.closest("li") === item);
      const own = number(item, "data-scale", scale);
      const bonus = item.getAttribute("data-bonus");
      const component = {
        item,
        code: (item.getAttribute("data-code") || "").trim(),
        scale: own,
        min: parseNumber(item.getAttribute("data-min")),
        bonus: bonus === null ? null : /%/.test(bonus) ? (parseNumber(bonus) / 100) * total : parseNumber(bonus),
        weight: data ? parseNumber(data.value || data.textContent) : NaN,
        data,
        parent,
      };
      const sub = listOf(item);
      component.parts = sub ? parse(sub, own, component, total) : [];
      return component;
    });
    const weighted = components.filter((component) => component.bonus === null);
    const sum = weighted.reduce((acc, component) => acc + (component.weight > 0 ? component.weight : 0), 0);
    weighted.forEach((component) => (component.share = sum > 0 && component.weight > 0 ? component.weight / sum : 0));
    return components;
  }

  /** Coefficient of a top-level component in the final grade, on its own scale. */
  const coefficient = (component, scale) => (component.share * scale) / component.scale;

  /** "Nota = E + AP + P" / "Nota = 0,1 × A + … + B". */
  function formula(components, scale) {
    const terms = components.map((component) => {
      if (component.bonus !== null) return component.code;
      const value = Math.round(coefficient(component, scale) * 1000) / 1000;
      return value === 1 ? component.code : `${fmt(value, 3)} × ${component.code}`;
    });
    return `${UC.t("grading.formula")} = ${terms.join(" + ")}`;
  }

  /** The item's content without its <data> and its nested list. */
  function contentOf(component, forLabel) {
    const copy = component.item.cloneNode(true);
    copy.querySelectorAll(forLabel ? "data, ul, ol, span" : "data, ul, ol").forEach((node) => node.closest("li") === copy && node.remove());
    return forLabel ? copy.textContent.replace(/\s+/g, " ").trim().replace(/[.:;,]$/, "") : Array.from(copy.childNodes);
  }

  /** Leaves (components without parts) and bonus items, in reading order: the calculator's fields. */
  const fields = (components) => components.flatMap((component) => (component.parts.length ? fields(component.parts) : [component]));

  /** Grade of a component from the entered values, on its own scale (parents: weighted mean of parts). */
  function gradeOf(component, values) {
    if (!component.parts.length) return values.get(component);
    return component.parts.reduce((sum, part) => sum + (part.bonus === null ? (part.share * gradeOf(part, values) * component.scale) / part.scale : 0), 0);
  }

  class UCGrading extends UC.Element {
    setup() {
      this.classList.add("uc-grading");
      this.extra = Array.from(this.childNodes);
      this.list = listOf(this);
      this.headingId = uid("uc-grading-heading");
      this.values = new Map();
    }

    render() {
      if (!this.list) return;
      const scale = number(this, "scale", 20);
      const components = parse(this.list, scale, null, scale);
      this.list.hidden = true;
      const label = this.getAttribute("heading");
      const heading =
        label !== null && label.trim().toLowerCase() === "none"
          ? null
          : h(UC.internal.headingTag(this), { class: "uc-grading__heading", id: this.headingId }, label && label.trim() ? label : this.t("grading.heading"));
      const weighted = components.filter((component) => component.bonus === null);

      this.replaceChildren(
        h(
          "section",
          { class: "uc-grading__section", "aria-labelledby": heading ? this.headingId : null },
          heading,
          flag(this, "no-formula") ? null : h("p", { class: "uc-grading__formula" }, formula(components, scale)),
          h(
            "div",
            { class: "uc-grading__bar", "aria-hidden": "true" },
            weighted.map((component) => h("span", { class: "uc-grading__segment", style: `flex-grow: ${component.share}` }, component.code)),
          ),
          this.renderTable(components, scale),
          flag(this, "calculator") ? this.renderCalculator(components, scale) : null,
          this.extra,
        ),
      );
      if (this.result) this.update(components, scale, false);
    }

    renderTable(components, scale) {
      const points = (n) => this.t(n === 1 ? "grading.point" : "grading.points", { n: fmt(n) });
      const rows = [];
      const walk = (list, depth) =>
        list.forEach((component) => {
          let weight;
          if (component.bonus !== null) {
            const bonus = component.item.getAttribute("data-bonus");
            weight = this.t("grading.bonus", { max: /%/.test(bonus) ? pct(parseNumber(bonus) / 100) : points(component.bonus) });
          } else {
            const parent = component.parent;
            let absolute = component.share;
            for (let node = parent; node; node = node.parent) absolute *= node.share;
            // "14 valores · 70 %"; a weight already written as a percentage is not repeated.
            const written = component.data && !parent ? component.data.textContent.trim() : "";
            weight = [written, written && /%/.test(written) ? "" : [written ? " · " : "", pct(absolute)]];
            if (parent) weight.push(` (${this.t("grading.shareOf", { share: pct(component.share), parent: parent.code })})`);
          }
          rows.push(
            h(
              "tr",
              { class: depth ? "uc-grading__sub" : null },
              h("th", { scope: "row" }, component.code ? [h("span", { class: "uc-mono" }, component.code), " "] : null, contentOf(component)),
              h("td", {}, weight),
              h("td", {}, Number.isFinite(component.min) ? this.t("grading.minimumOf", { min: fmt(component.min), scale: fmt(component.scale) }) : "—"),
            ),
          );
          walk(component.parts, depth + 1);
        });
      walk(components, 0);
      return h(
        "div",
        { class: "uc-table" },
        h(
          "table",
          { class: "uc-grading__table" },
          h("caption", { class: "uc-visually-hidden" }, this.t("grading.caption")),
          h("thead", {}, h("tr", {}, ["component", "weight", "minimum"].map((column) => h("th", { scope: "col" }, this.t(`grading.column.${column}`))))),
          h("tbody", {}, rows),
        ),
      );
    }

    renderCalculator(components, scale) {
      this.result = h("output", { class: "uc-grading__result" });
      this.status = h("p", { class: "uc-grading__status" });
      const inputs = fields(components).map((component) => {
        const max = component.bonus !== null ? component.bonus : component.scale;
        const id = uid("uc-grading-input");
        const input = h("input", { id, type: "text", inputmode: "decimal", autocomplete: "off", value: this.values.get(component.item) || "" });
        const error = h("span", { class: "uc-grading__error", id: `${id}-error`, hidden: true }, this.t("grading.calculator.invalid", { scale: fmt(max) }));
        input.addEventListener("input", () => {
          this.values.set(component.item, input.value);
          this.update(components, scale, true);
        });
        component.input = input;
        component.error = error;
        component.max = max;
        return h(
          "div",
          { class: "uc-grading__field" },
          h("label", { for: id }, this.t("grading.calculator.field", { code: component.code, name: contentOf(component, true), scale: fmt(max) })),
          input,
          error,
        );
      });
      return h(
        "fieldset",
        { class: "uc-grading__calculator" },
        h("legend", {}, this.t("grading.calculator.legend")),
        h("div", { class: "uc-grading__fields" }, inputs),
        h("p", {}, this.result),
        this.status,
        h("p", { class: "uc-small uc-muted" }, this.t("grading.calculator.disclaimer")),
      );
    }

    /** Validates the fields and writes the simulated grade. */
    update(components, scale, speak) {
      const values = new Map();
      let complete = true;
      for (const component of fields(components)) {
        const raw = component.input.value.trim();
        const value = parseNumber(raw);
        const invalid = raw !== "" && !(value >= 0 && value <= component.max);
        const { input, error } = component;
        input.setAttribute("aria-invalid", invalid);
        if (invalid) input.setAttribute("aria-describedby", error.id);
        else input.removeAttribute("aria-describedby");
        error.hidden = !invalid;
        // A bonus left empty counts as 0; every other field is needed.
        if (invalid || (raw === "" && component.bonus === null)) complete = false;
        values.set(component, raw === "" ? 0 : value);
      }
      let result = "";
      let status = "";
      if (!complete) status = this.t("grading.calculator.incomplete");
      else {
        const bonus = components.reduce((sum, component) => sum + (component.bonus !== null ? values.get(component) : 0), 0);
        const grade = Math.min(scale, components.reduce((sum, component) => sum + (component.bonus === null ? coefficient(component, scale) * gradeOf(component, values) : 0), 0) + bonus);
        result = this.t("grading.calculator.result", { grade: fmt(grade, 1) });
        const below = [];
        const check = (list) =>
          list.forEach((component) => {
            if (Number.isFinite(component.min) && gradeOf(component, values) < component.min) below.push(component);
            check(component.parts);
          });
        check(components);
        const pass = number(this, "pass", null);
        if (below.length) status = this.t("grading.calculator.belowMin", { code: below[0].code, min: fmt(below[0].min), scale: fmt(below[0].scale) });
        else if (pass !== null) status = grade < pass ? this.t("grading.calculator.belowPass", { pass: fmt(pass) }) : this.t("grading.calculator.pass");
      }
      this.result.textContent = result;
      this.status.textContent = status;
      if (speak) announce([result, status].filter(Boolean).join(". "), 300);
    }
  }

  UC.define("uc-grading", UCGrading);
})(window.UC);
