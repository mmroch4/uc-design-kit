/**
 * <uc-widget-dp>: dynamic programming tables filled cell by cell, then the
 * reconstruction path from the answer back: longest common subsequence, edit
 * distance, 0/1 knapsack and coin change (docs/architecture/widgets-api.md 5.4, 17;
 * page docs/pt/widgets/uc-widget-dp.html).
 */
import { ALGORITHMS, LIMITS, run, check } from "./algorithm.js";
import { strings } from "./i18n.js";
import { grid } from "../core/svg/grid.js";

/** The attributes of each problem, with their defaults. */
const DEFAULTS = {
  lcs: { a: "ABCBDAB", b: "BDCABA" },
  "edit-distance": { a: "GATO", b: "PATOS" },
  knapsack: { weights: "1 3 4 5", values: "1 4 5 7", capacity: "7" },
  coins: { coins: "1 3 4", amount: "6" },
};

export default function define(UC) {
  UC.addTranslations("pt", { widget: { dp: strings.pt } });
  UC.addTranslations("en", { widget: { dp: strings.en } });
  const W = UC.widgets;
  const t = (key, params) => UC.t(`widget.dp.${key}`, params);

  class DpWidget extends W.Widget {
    static id = "dp";
    static algorithms = ALGORITHMS;
    static inputAttributes = ["problem", "a", "b", "weights", "values", "capacity", "coins", "amount"];
    static limits = { rows: 9, cols: 9 };
    static editLabel = "widget.dp.field";

    /** `problem` names the algorithm; the `algorithms` toggle still wins. */
    get algorithm() {
      const problem = this.getAttribute("problem");
      if (problem && !ALGORITHMS.includes(problem)) this.warn("problem");
      return !this.chosen && ALGORITHMS.includes(problem) ? problem : super.algorithm;
    }

    attributeChangedCallback(name, previous, value) {
      if (name === "problem") this.chosen = null;
      // A student's edit is in the old problem's form: drop it.
      if (this.built && (name === "problem" || name === "algorithm")) this.overrides = {};
      super.attributeChangedCallback(name, previous, value);
    }

    choose(name) {
      const text = (problem) => problem === "lcs" || problem === "edit-distance";
      if (!text(name) || !text(this.algorithm)) this.overrides = {};
      super.choose(name);
    }

    /** The editable field holds every datum of the problem, parts separated by ":". */
    get editName() {
      return "data";
    }

    parse() {
      const problem = this.algorithm;
      const own = DEFAULTS[problem];
      const read = (name) => (this.getAttribute(name) ?? own[name]).trim();
      const ints = (text, max) => W.parse.values(text, { max, random: this.random });
      const edited = this.attr("data");
      const text = problem === "lcs" || problem === "edit-distance";
      const parts = edited === null ? Object.keys(own).map(read) : edited.trim().split(text ? /[\s:]+/ : ":").map((part) => part.trim());
      if (parts.length !== Object.keys(own).length) throw new W.InputError(`widget.dp.error.form.${text ? "text" : problem}`);
      let input;
      if (text) input = { a: parts[0], b: parts[1] };
      else if (problem === "knapsack") input = { weights: ints(parts[0], LIMITS.items), values: ints(parts[1], LIMITS.items), capacity: Number(parts[2]) };
      else input = { coins: ints(parts[0], LIMITS.coins), amount: Number(parts[1]) };
      return check(input, problem);
    }

    serialize(input) {
      if (input.a !== undefined) return `${input.a} ${input.b}`;
      if (input.weights) return `${input.weights.join(" ")} : ${input.values.join(" ")} : ${input.capacity}`;
      return `${input.coins.join(" ")} : ${input.amount}`;
    }

    steps(input, emit) {
      return run(input, { algorithm: this.algorithm }, emit);
    }

    /** Row and column headers of the table. */
    heads() {
      const input = this.input;
      const range = (n) => Array.from({ length: n + 1 }, (_, i) => i);
      if (input.a !== undefined) return { rowHeads: ["ε", ...input.a], colHeads: ["ε", ...input.b] };
      if (input.weights) return { rowHeads: range(input.weights.length).map((i) => `i=${i}`), colHeads: range(input.capacity) };
      return { rowHeads: ["dp"], colHeads: range(input.amount) };
    }

    draw(step, svg) {
      grid(svg, step.state.t, { ...this.heads(), marks: step.marks });
      // At least 240 px wide (not the 300 of svg.grid), so a 9-column table fits a 320 px screen without scrolling.
      svg.style.minWidth = `${Math.min(240, svg.viewBox.baseVal.width)}px`;
    }

    describe(step) {
      const { rowHeads, colHeads } = this.heads();
      const rows = step.state.t.map((row, r) => `${rowHeads[r]}: ${row.map((v) => v ?? "—").join(" ")}`);
      return t("describe", { r: rowHeads.length, c: colHeads.length, cols: colHeads.join(" "), rows: rows.join("; ") });
    }

    table(step) {
      const { rowHeads, colHeads } = this.heads();
      return {
        head: [t("row"), ...colHeads.map(String)],
        rows: step.state.t.map((row, r) => [
          rowHeads[r],
          ...row.map((v, c) => {
            const mark = step.marks[`${r},${c}`];
            return `${v ?? "—"}${mark ? ` (${this.stateName(mark)})` : ""}`;
          }),
        ]),
      };
    }
  }

  W.register("uc-widget-dp", DpWidget);
}
