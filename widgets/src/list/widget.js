/**
 * <uc-widget-list>: a singly linked list and its operations, pointer by
 * pointer (docs/plan/widgets-api.md 17; page docs/pt/widgets/uc-widget-list.html).
 */
import { ALGORITHMS, VERBS, MAX_NODES, run } from "./algorithm.js";
import { strings } from "./i18n.js";
import { list } from "../core/svg/list.js";

export default function define(UC) {
  UC.addTranslations("pt", { widget: { list: strings.pt } });
  UC.addTranslations("en", { widget: { list: strings.en } });
  const W = UC.widgets;

  /** The nodes of a state in list order (from head). */
  const ordered = (state) => {
    const byId = Object.fromEntries(state.nodes.map((node) => [node.id, node]));
    const out = [];
    for (let id = state.head; id && byId[id] && out.length < state.nodes.length; id = byId[id].next) out.push(byId[id]);
    return out;
  };

  class ListWidget extends W.Widget {
    static id = "list";
    static algorithms = ALGORITHMS;
    static inputAttributes = ["values", "ops"];
    static limits = { items: MAX_NODES };
    static editAttribute = "ops";
    static editLabel = "widget.list.edit";

    parse() {
      const values = W.parse.values(this.attr("values") ?? "random 4 1..20", { max: MAX_NODES, random: this.random });
      const ops = this.attr("ops");
      return { values, ops: ops === null ? null : W.parse.ops(ops, VERBS) };
    }

    steps(input, emit) {
      return run(input, {}, emit);
    }

    draw(step, svg) {
      list(svg, step.state.nodes, { marks: step.marks, pointers: step.pointers, raised: step.state.raised, empty: "head = null" });
    }

    describe(step) {
      const nodes = ordered(step.state);
      return nodes.length ? this.t("widget.list.describe", { values: nodes.map((node) => node.v).join(" → ") + " → null" }) : this.t("widget.list.describeEmpty");
    }

    table(step) {
      const byId = Object.fromEntries(step.state.nodes.map((node) => [node.id, node]));
      return {
        head: ["position", "value", "next"].map((key) => this.t(`widget.list.column.${key}`)).concat(this.t("widget.core.column.state")),
        rows: ordered(step.state).map((node, i) => [i, node.v, node.next ? byId[node.next].v : "null", this.stateName(step.marks[node.id])]),
      };
    }

    serialize() {
      return this.attr("ops") || "";
    }
  }

  W.register("uc-widget-list", ListWidget);
}
