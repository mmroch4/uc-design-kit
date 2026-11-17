/**
 * <uc-grading> — decorates the teacher's list of grade components: generated
 * formula, proportions bar, table of weights and minimums and, with
 * `calculator`, a grade simulation. Weights are read from each item's <data>
 * or, with an <ol data-formulas>, from the formulas (formula.js); an
 * <ul data-rules> lists the pass rules. See docs/api.md, section 3.6, and
 * docs/plan/grading-api.md 3 and 7.
 *
 * Part of uc-grading.js, which uc-kit.js loads when the page has a
 * <uc-grading> (core/modules.js, docs/plan/grading-api.md 2.2).
 */
(function (UC) {
  "use strict";
  // No UC.__duplicate check: that flag stays set after a second copy of uc-kit.js, and UC.define ignores a tag that is already defined.
  if (!UC) return;

  const { h, uid, flag, number, announce, grading } = UC.internal;

  /** "14", "0,1", "25%" → number; NaN otherwise. */
  const parseNumber = (value) => (/^\s*-?\d+([.,]\d+)?\s*%?\s*$/.test(value || "") ? Number(value.replace(",", ".").replace("%", "")) : NaN);
  const fmt = (value, digits = 2) => new Intl.NumberFormat(UC.lang, { maximumFractionDigits: digits }).format(value);
  const pct = (share) => new Intl.NumberFormat(UC.lang, { style: "percent", maximumFractionDigits: 1 }).format(share);
  const listOf = (element) => element.querySelector(":scope > :is(ul, ol):not([data-formulas], [data-rules])");
  const itemsOf = (list) => (list ? Array.from(list.children).filter((item) => item.localName === "li") : []);
  /** The <code> of a formula or rule item, and the rest of the item (its description). */
  const codeOf = (item) => item.querySelector(":scope > code");
  const described = (item) => {
    const copy = item.cloneNode(true);
    codeOf(copy).remove();
    return copy.textContent.trim() ? Array.from(copy.childNodes) : null;
  };
  const warn = (message) => console.warn(`[uc-kit] uc-grading: ${message}`);

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

  /**
   * Share of the final grade that a component carries: from its <data> weights (column null)
   * or from a formula column (its coefficient × its scale ÷ the scale); parts multiply by their parent's.
   */
  const shareIn = (component, column, scale) =>
    component.parent ? component.share * shareIn(component.parent, column, scale) : column ? ((column.coefficients[component.code] || 0) * component.scale) / scale : component.share;

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

  /** The item's content without its <data> and its nested list (a label also drops descriptions and other languages). */
  function contentOf(component, forLabel) {
    const copy = component.item.cloneNode(true);
    copy.querySelectorAll(forLabel ? `data, ul, ol, span:not([lang]), [lang]:not([lang|="${UC.lang}"])` : "data, ul, ol").forEach((node) => node.closest("li") === copy && node.remove());
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
      this.formulasList = this.querySelector(":scope > [data-formulas]");
      this.rulesList = this.querySelector(":scope > [data-rules]");
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
      // Every component and part, in reading order.
      const all = [];
      const walk = (list) => list.forEach((component) => all.push(component) && walk(component.parts));
      walk(components);
      const noFormula = flag(this, "no-formula");
      const formulaItems = itemsOf(this.formulasList);
      const ruleItems = itemsOf(this.rulesList);
      let model = null;
      if (this.formulasList || this.rulesList) {
        try {
          formulaItems.forEach((item, index) => codeOf(item) || grading.fail(`formula ${index + 1} has no <code>.`));
          model = grading.model({
            components: components.map((component) => ({ code: component.code, bonus: component.bonus !== null })),
            parts: all.filter((component) => component.parent).map((component) => component.code),
            formulas: formulaItems.map((item) => codeOf(item).textContent),
            rules: ruleItems.map((item) => (codeOf(item) ? codeOf(item).textContent : null)),
            result: this.getAttribute("result"),
          });
          model.ruleErrors.forEach((message) => message && warn(message));
        } catch (error) {
          warn(error.message);
        }
      }
      // With formulas that do not parse, the teacher's lists stay as written (7.5).
      const fallback = Boolean(this.formulasList && !model);
      const formulas = model && model.result ? model.formulas : null;
      [this.formulasList, this.rulesList].forEach((list) => list && (list.hidden = !fallback));

      const fn = (type) => {
        const label = this.t(`grading.${type}`);
        return label === type ? type : h("abbr", { title: this.t(`grading.${type}Title`) }, label);
      };
      const alias = { RESULT: (formulas && model.result.name) || this.t("grading.formula") };
      const ids = new Map();
      const formulaBlock = formulas
        ? formulas.map((item, index) => [
            noFormula ? null : h("p", { class: "uc-grading__formula", id: item.name && ids.set(item.name, uid("uc-grading-formula")).get(item.name) }, `${item.name || this.t("grading.formula")} = `, grading.print(item.tree, fn)),
            described(formulaItems[index]) && h("p", { class: "uc-grading__note" }, described(formulaItems[index])),
          ])
        : fallback || noFormula
          ? null
          : h("p", { class: "uc-grading__formula" }, formula(components, scale));

      // Rules (7.4): shortcuts (data-min, then pass) first, then the written ones, without repeats.
      const rules = [];
      const seen = new Set();
      const add = (rule, item) => {
        const key = rule && grading.printRule(rule).join("");
        if (!seen.has(key) || !rule) rules.push({ rule, item }), seen.add(key);
      };
      const atLeast = (name, value) => ({ op: ">=", left: { type: "name", name }, right: { type: "number", value } });
      if (model && !fallback) {
        all.forEach((component) => Number.isFinite(component.min) && add(atLeast(component.code, component.min)));
        const pass = number(this, "pass", null);
        if (pass !== null) add(atLeast("RESULT", pass));
        ruleItems.forEach((item, index) => add(model.rules[index], item));
      }
      // The Minimum column also shows "CODE >= n" rules on a component (7.3).
      if (formulas)
        rules.forEach(({ rule }) => {
          const component = rule && /^>=?$/.test(rule.op) && rule.left.type === "name" && rule.right.type === "number" && all.find((one) => one.code === rule.left.name);
          if (component && !Number.isFinite(component.min)) component.min = rule.right.value;
        });

      const columns = formulas ? model.columns || [] : fallback ? [] : null;
      const labelOf = (column, index) => column.name || (columns.length > 1 ? this.t("grading.formulaN", { n: index + 1 }) : this.t("grading.column.weight"));
      // With formulas, the calculator evaluates them and checks every rule (grading-api.md 9).
      this.calc = formulas && { model, rules, all, fn, alias, labels: columns.map((column, index) => labelOf(column, index)) };
      const bar = (column) =>
        h(
          "div",
          { class: "uc-grading__bar", "aria-hidden": "true" },
          weighted.map((component) => {
            const share = shareIn(component, column, scale);
            return share > 0 && h("span", { class: "uc-grading__segment", style: `flex-grow: ${share}` }, component.code);
          }),
        );
      const bars = !columns ? bar(null) : columns.length === 1 ? bar(columns[0]) : columns.length ? h("div", { class: "uc-grading__bars", "aria-hidden": "true" }, columns.map((column, index) => [h("span", { class: "uc-grading__bar-label" }, labelOf(column, index)), bar(column)])) : null;

      this.replaceChildren(
        h(
          "section",
          { class: "uc-grading__section", "aria-labelledby": heading ? this.headingId : null },
          heading,
          formulaBlock,
          bars,
          this.renderTable(components, scale, columns && columns.map((column, index) => ({ column, label: labelOf(column, index), describedby: ids.get(column.name) }))),
          rules.length
            ? [
                h("p", {}, h("strong", {}, this.t("grading.rules"))),
                h(
                  "ul",
                  { class: "uc-grading__rules" },
                  rules.map(({ rule, item }) =>
                    h("li", {}, rule ? [h("span", { class: "uc-mono" }, grading.printRule(rule, fn, alias)), item && described(item) ? [" ", described(item)] : null] : Array.from(item.cloneNode(true).childNodes)),
                  ),
                ),
              ]
            : null,
          flag(this, "calculator") && !fallback ? this.renderCalculator(components, scale) : null,
          this.extra,
        ),
      );
      if (this.result) this.update(components, scale, false);
    }

    /** `columns`: null for the legacy Weight column, else [{ column, label, describedby }] (7.3). */
    renderTable(components, scale, columns) {
      const points = (n) => this.t(n === 1 ? "grading.point" : "grading.points", { n: fmt(n) });
      const rows = [];
      const walk = (list, depth) =>
        list.forEach((component) => {
          let weight;
          const parent = component.parent;
          if (component.bonus !== null) {
            const bonus = component.item.getAttribute("data-bonus");
            weight = this.t("grading.bonus", { max: /%/.test(bonus) ? pct(parseNumber(bonus) / 100) : points(component.bonus) });
          } else if (columns) {
            weight = columns.map(({ column }) => {
              const share = shareIn(component, column, scale);
              if (!share) return "—";
              const amount = Math.round(share * scale * 1000) / 1000;
              return parent ? [pct(share), ` (${this.t("grading.shareOf", { share: pct(component.share), parent: parent.code })})`] : [points(amount), " · ", pct(share)];
            });
          } else {
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
              columns ? (Array.isArray(weight) ? weight : columns.map(() => weight)).map((cell) => h("td", {}, cell)) : h("td", {}, weight),
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
          h(
            "thead",
            {},
            h("tr", {}, ["component", "weight", "minimum"].map((column) =>
              column === "weight" && columns
                ? columns.map(({ label, describedby }) => h("th", { scope: "col", "aria-describedby": describedby }, label))
                : h("th", { scope: "col" }, this.t(`grading.column.${column}`)),
            )),
          ),
          h("tbody", {}, rows),
        ),
      );
    }

    renderCalculator(components, scale) {
      this.result = h("output", { class: "uc-grading__result" });
      this.branches = h("p", { class: "uc-grading__branches" });
      this.checks = h("ul", { class: "uc-grading__checks" });
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
        this.calc && this.branches,
        h("p", {}, this.result),
        this.calc && this.checks,
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
      const calc = this.calc;
      if (calc) this.branches.textContent = "";
      if (calc) this.checks.replaceChildren();
      if (!complete) status = this.t("grading.calculator.incomplete");
      else if (calc) [result, status] = this.simulate(calc, components, scale, values);
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

    /** Formula mode (grading-api.md 9): fills the branches line and the checks, returns [result line, state line]. */
    simulate({ model, rules, all, fn, alias, labels }, components, scale, values) {
      const t = (key, data) => this.t(`grading.calculator.${key}`, data);
      const own = new Map();
      const value = (name) => (own.has(name) ? own.get(name) : gradeOf(all.find((component) => component.code === name), values));
      model.formulas.forEach(({ name, tree }) => name && own.set(name, grading.evaluate(tree, value)));
      const raw = grading.evaluate(model.result.tree, value);
      const bonus = components.reduce((sum, component) => sum + (component.bonus !== null ? values.get(component) : 0), 0);
      // RESULT, and the result formula's name in rules, are the final grade: bonus added, clamped (5.3).
      const grade = Math.max(0, Math.min(scale, raw + bonus));
      if (Number.isNaN(grade)) return ["", t("undefined")];
      own.set("RESULT", grade).set(model.result.name, grade);
      const branches = (model.columns || []).map((column) => grading.evaluate(column.tree, value));
      let result = model.result.name ? t("resultNamed", { name: model.result.name, grade: fmt(grade, 1) }) : t("result", { grade: fmt(grade, 1) });
      if (branches.length > 1) {
        this.branches.textContent = branches.map((branch, index) => t("branch", { name: labels[index], grade: fmt(branch, 1) })).join(" · ");
        result += ` (${t("counts", { name: labels[branches.findIndex((branch) => Math.abs(branch - raw) <= 1e-9)] })})`;
      }
      const checked = rules.map(({ rule }) => (rule ? grading.check(rule, value) : undefined));
      const word = (ok) => t(ok ? "ruleMet" : ok === false ? "ruleFailed" : "unchecked");
      this.checks.append(
        ...rules.map(({ rule, item }, index) =>
          h("li", {}, rule ? [h("span", { "aria-hidden": "true" }, checked[index] ? "✓" : checked[index] === false ? "✗" : "?"), " ", grading.printRule(rule, fn, alias), h("span", { class: "uc-visually-hidden" }, ` (${word(checked[index])})`)] : `${word()}: ${item.textContent.trim()}`),
        ),
      );
      const failed = checked.indexOf(false);
      const status = !rules.length
        ? ""
        : checked.includes(null)
          ? t("undefined")
          : failed >= 0
            ? `${t("fail")} ${t("failRule", { rule: grading.printRule(rules[failed].rule, (type) => this.t(`grading.${type}`), alias).join("") })}`
            : t(checked.includes(undefined) ? "passIf" : "passRules");
      return [result, status];
    }
  }

  UC.define("uc-grading", UCGrading);
})(window.UC);
