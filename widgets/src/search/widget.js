/**
 * <uc-widget-search>: linear search, binary search and the lower bound,
 * step by step (docs/architecture/widgets-api.md 17; page
 * docs/pt/widgets/uc-widget-search.html).
 */
import { ALGORITHMS, run } from "./algorithm.js";
import { strings } from "./i18n.js";

export default function define(UC) {
  UC.addTranslations("pt", { widget: { search: strings.pt } });
  UC.addTranslations("en", { widget: { search: strings.en } });
  const W = UC.widgets;
  const INTEGER = /^[+-]?\d+$/;

  class SearchWidget extends W.Widget {
    static id = "search";
    static algorithms = ALGORITHMS;
    static inputAttributes = ["values", "target"];
    static limits = { items: 16 };
    static editLabel = "widget.search.edit";

    /** values="1 3 5 7" target="5", or values="1 3 5 7 : 5" (the editable field's syntax). */
    parse() {
      const [list, after] = String(this.attr("values") ?? "random 10").split(":");
      const text = list.trim();
      let a = W.parse.values(text, { max: SearchWidget.limits.items, random: this.random });
      if (text.startsWith("random") && this.algorithm !== "linear") a = a.sort((x, y) => x - y);
      const given = (after ?? this.getAttribute("target") ?? "").trim();
      if (given && !INTEGER.test(given)) throw new W.InputError("widget.core.error.notInteger", { token: given });
      const target = given ? Number(given) : a.length ? a[Math.floor((a.length * 2) / 3)] : 0;
      return { a, target };
    }

    steps(input, emit) {
      return run(input, { algorithm: this.algorithm }, emit);
    }

    draw(step, svg) {
      W.svg.array(svg, step.state.a, { marks: step.marks, pointers: step.pointers });
    }

    describe(step) {
      return this.t("widget.search.describe", { values: step.state.a.join(" "), t: this.input.target });
    }

    table(step) {
      return {
        head: ["index", "value", "state"].map((key) => this.t(`widget.core.column.${key}`)),
        rows: step.state.a.map((v, i) => [i, v, this.stateName(step.marks[i])]),
      };
    }

    serialize(input) {
      return `${input.a.join(" ")} : ${input.target}`;
    }
  }

  W.register("uc-widget-search", SearchWidget);
}
