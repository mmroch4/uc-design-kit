/**
 * <uc-widget-sort>: six sorting algorithms, step by step
 * (docs/plan/widgets-api.md 17; page docs/pt/widgets/uc-widget-sort.html).
 */
import { ALGORITHMS, PIVOTS, run } from "./algorithm.js";
import { strings } from "./i18n.js";

export default function define(UC) {
  UC.addTranslations("pt", { widget: { sort: strings.pt } });
  UC.addTranslations("en", { widget: { sort: strings.en } });
  const W = UC.widgets;

  class SortWidget extends W.Widget {
    static id = "sort";
    static algorithms = ALGORITHMS;
    static inputAttributes = ["values", "pivot", "bars"];
    static limits = { items: 16 };

    get pivot() {
      const value = this.getAttribute("pivot");
      if (value === null) return "last";
      if (PIVOTS.includes(value)) return value;
      this.warn("pivot");
      return "last";
    }

    parse() {
      return W.parse.values(this.attr("values") ?? "random 8", { max: SortWidget.limits.items, random: this.random });
    }

    steps(input, emit) {
      return run(input, { algorithm: this.algorithm, pivot: this.pivot, random: this.random }, emit);
    }

    draw(step, svg) {
      W.svg.array(svg, step.state.a, { marks: step.marks, pointers: step.pointers, bars: this.hasAttribute("bars") });
    }

    describe(step) {
      return this.t("widget.sort.describe", { values: step.state.a.map((v) => (v === null ? this.t("widget.core.hole") : v)).join(" ") });
    }

    table(step) {
      return {
        head: ["index", "value", "state"].map((key) => this.t(`widget.core.column.${key}`)),
        rows: step.state.a.map((v, i) => [i, v === null ? this.t("widget.core.hole") : v, this.stateName(step.marks[i])]),
      };
    }

    serialize(input) {
      return input.join(" ");
    }
  }

  W.register("uc-widget-sort", SortWidget);
}
