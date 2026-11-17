/**
 * <uc-widget-avl>: an AVL tree, its insertions and removals with heights,
 * balance factors and the four rotations, step by step
 * (docs/plan/widgets-api.md 17; page docs/pt/widgets/uc-widget-avl.html).
 */
import { ALGORITHMS, VERBS, MAX_NODES, factor, run } from "./algorithm.js";
import { strings } from "./i18n.js";

export default function define(UC) {
  UC.addTranslations("pt", { widget: { avl: strings.pt } });
  UC.addTranslations("en", { widget: { avl: strings.en } });
  const W = UC.widgets;
  const t = (key, params) => UC.t(`widget.avl.${key}`, params);
  const signed = (node) => {
    const f = factor(node);
    return f > 0 ? `+${f}` : String(f);
  };

  /** Every node of a tree, in order. */
  const nodes = (node, out = []) => {
    if (node) {
      nodes(node.l, out);
      out.push(node);
      nodes(node.r, out);
    }
    return out;
  };

  class AvlWidget extends W.Widget {
    static id = "avl";
    static algorithms = ALGORITHMS;
    static inputAttributes = ["values", "ops"];
    static limits = { items: MAX_NODES };
    static editLabel = "widget.avl.edit";

    parse() {
      const values = W.parse.values(this.attr("values") ?? "random 7", { max: MAX_NODES, random: this.random });
      const ops = this.attr("ops");
      return { values, ops: ops === null ? null : W.parse.ops(ops, VERBS) };
    }

    steps(input, emit) {
      return run(input, {}, emit);
    }

    draw(step, svg) {
      W.svg.tree(svg, step.state.root, { marks: step.marks, note: signed, empty: this.t("widget.core.tree.empty") });
    }

    describe(step) {
      const root = step.state.root;
      if (!root) return t("startEmpty");
      const children = nodes(root)
        .filter((node) => node.l || node.r)
        .map((node) => {
          const a = node.l && node.l.v;
          const b = node.r && node.r.v;
          return t("children", { v: node.v, kids: node.l && node.r ? t("and", { a, b }) : node.l ? t("leftOnly", { a }) : t("rightOnly", { b }) });
        });
      const factors = nodes(root).map((node) => `${node.v} ${signed(node)}`).join(", ");
      return `${t("describe", { root: root.v, children: children.join(" ") })} ${t("factors", { list: factors })}`;
    }

    table(step) {
      const none = t("none");
      return {
        head: ["node", "left", "right", "factor"].map((key) => t(`column.${key}`)).concat(this.t("widget.core.column.state")),
        rows: nodes(step.state.root).map((node) => [node.v, node.l ? node.l.v : none, node.r ? node.r.v : none, signed(node), this.stateName(step.marks[node.v])]),
      };
    }

    serialize(input) {
      return input.values.join(" ");
    }
  }

  W.register("uc-widget-avl", AvlWidget);
}
