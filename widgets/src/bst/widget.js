/**
 * <uc-widget-bst>: a binary search tree, its operations (insert, remove,
 * search, min, max) and its four traversals, step by step
 * (docs/architecture/widgets-api.md 17; page docs/pt/widgets/uc-widget-bst.html).
 */
import { ALGORITHMS, VERBS, MAX_NODES, run } from "./algorithm.js";
import { strings } from "./i18n.js";

export default function define(UC) {
  UC.addTranslations("pt", { widget: { bst: strings.pt } });
  UC.addTranslations("en", { widget: { bst: strings.en } });
  const W = UC.widgets;

  /** Every node of a tree, in order. */
  const nodes = (node, out = []) => {
    if (node) {
      nodes(node.l, out);
      out.push(node);
      nodes(node.r, out);
    }
    return out;
  };

  class BstWidget extends W.Widget {
    static id = "bst";
    static algorithms = ALGORITHMS;
    static inputAttributes = ["values", "ops"];
    static limits = { items: MAX_NODES };
    static editLabel = "widget.bst.edit";

    parse() {
      const values = W.parse.values(this.attr("values") ?? "random 7", { max: MAX_NODES, random: this.random });
      const ops = this.attr("ops");
      return { values, ops: ops === null || this.algorithm !== "operations" ? null : W.parse.ops(ops, VERBS) };
    }

    steps(input, emit) {
      return run(input, { algorithm: this.algorithm }, emit);
    }

    draw(step, svg) {
      W.svg.tree(svg, step.state.root, { marks: step.marks, empty: this.t("widget.core.tree.empty") });
    }

    describe(step) {
      const root = step.state.root;
      if (!root) return this.t("widget.bst.startEmpty");
      const t = (key, params) => this.t(`widget.bst.${key}`, params);
      const children = nodes(root)
        .filter((node) => node.l || node.r)
        .map((node) => {
          const a = node.l && node.l.v;
          const b = node.r && node.r.v;
          const kids = node.l && node.r ? t("and", { a, b }) : node.l ? t("leftOnly", { a }) : t("rightOnly", { b });
          return t("children", { v: node.v, kids });
        });
      return t("describe", { root: root.v, children: children.join(" ") });
    }

    table(step) {
      const none = this.t("widget.bst.none");
      return {
        head: ["node", "left", "right"].map((key) => this.t(`widget.bst.column.${key}`)).concat(this.t("widget.core.column.state")),
        rows: nodes(step.state.root).map((node) => [node.v, node.l ? node.l.v : none, node.r ? node.r.v : none, this.stateName(step.marks[node.v])]),
      };
    }

    serialize(input) {
      return input.values.join(" ");
    }
  }

  W.register("uc-widget-bst", BstWidget);
}
