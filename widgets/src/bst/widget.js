/**
 * <uc-widget-bst>: a binary search tree, its operations (insert, remove,
 * search, min, max) and its four traversals, step by step
 * (docs/architecture/widgets-api.md 17; page docs/pt/widgets/uc-widget-bst.html).
 */
import { ALGORITHMS, VERBS, MAX_NODES, run } from "./algorithm.js";
import { strings } from "./i18n.js";
import { nodes, childrenText } from "./nodes.js";

export default function define(UC) {
  UC.addTranslations("pt", { widget: { bst: strings.pt } });
  UC.addTranslations("en", { widget: { bst: strings.en } });
  const W = UC.widgets;

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
      return t("describe", { root: root.v, children: childrenText(root, t) });
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
