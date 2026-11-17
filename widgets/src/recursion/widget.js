/**
 * <uc-widget-recursion>: the tree of recursive calls and the call stack of
 * factorial, Fibonacci and the Towers of Hanoi (docs/architecture/widgets-api.md 17;
 * page docs/pt/widgets/uc-widget-recursion.html).
 */
import { ALGORITHMS, MAX_N, run } from "./algorithm.js";
import { strings } from "./i18n.js";

export default function define(UC) {
  UC.addTranslations("pt", { widget: { recursion: strings.pt } });
  UC.addTranslations("en", { widget: { recursion: strings.en } });
  const W = UC.widgets;
  const DEFAULT_N = { factorial: 5, fibonacci: 4, hanoi: 3 };

  /** Every node of the call tree, in call order. */
  const calls = (node, out = []) => {
    if (node) {
      out.push(node);
      node.kids.forEach((kid) => calls(kid, out));
    }
    return out;
  };

  class RecursionWidget extends W.Widget {
    static id = "recursion";
    static algorithms = ALGORITHMS;
    static inputAttributes = ["n"];
    static limits = { items: 8 };
    static editLabel = "widget.recursion.edit";

    parse() {
      const text = (this.attr("n") ?? String(DEFAULT_N[this.algorithm])).trim();
      if (!/^\d+$/.test(text)) throw new W.InputError("widget.recursion.error.n", { min: this.algorithm === "hanoi" ? 1 : 0 });
      const n = Number(text);
      if (n > MAX_N[this.algorithm]) throw new W.InputError("widget.core.error.tooLarge", { max: MAX_N[this.algorithm] });
      return { n };
    }

    steps(input, emit) {
      return run(input, { algorithm: this.algorithm }, emit);
    }

    draw(step, svg) {
      W.svg.tree(svg, step.state.root, {
        binary: false,
        children: (node) => node.kids,
        key: (node) => node.id,
        label: (node) => node.call,
        note: (node) => (node.value === null || this.algorithm === "hanoi" ? "" : `= ${node.value}`),
        marks: step.marks,
      });
    }

    describe(step) {
      const t = (key, params) => this.t(`widget.recursion.${key}`, params);
      return t("describe", {
        calls: calls(step.state.root)
          .map((node) => (node.value === null ? t("open", { call: node.call }) : t("returns", { call: node.call, value: node.value })))
          .join("; "),
      });
    }

    table(step) {
      return {
        head: [this.t("widget.recursion.column.call"), this.t("widget.recursion.column.value"), this.t("widget.core.column.state")],
        rows: calls(step.state.root).map((node) => [node.call, node.value === null ? "—" : node.value, this.stateName(step.marks[node.id])]),
      };
    }

    serialize(input) {
      return String(input.n);
    }
  }

  W.register("uc-widget-recursion", RecursionWidget);
}
