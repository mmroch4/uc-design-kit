/**
 * <uc-widget-stack-queue>: a stack or a queue, in an array (the queue as a
 * circular buffer) or in a linked list, operation by operation
 * (docs/plan/widgets-api.md 17; page docs/pt/widgets/uc-widget-stack-queue.html).
 */
import { ALGORITHMS, IMPLS, VERBS, MAX_ITEMS, run } from "./algorithm.js";
import { strings } from "./i18n.js";
import { list } from "../core/svg/list.js";

export default function define(UC) {
  UC.addTranslations("pt", { widget: { "stack-queue": strings.pt } });
  UC.addTranslations("en", { widget: { "stack-queue": strings.en } });
  const W = UC.widgets;
  const t = (key, params) => UC.t(`widget.stack-queue.${key}`, params);

  class StackQueueWidget extends W.Widget {
    static id = "stack-queue";
    static algorithms = ALGORITHMS;
    static inputAttributes = ["values", "ops", "impl", "capacity"];
    static limits = { items: MAX_ITEMS.array };
    static editAttribute = "ops";
    static editLabel = "widget.stack-queue.edit";

    get impl() {
      const value = this.getAttribute("impl");
      if (value === null) return "array";
      if (IMPLS.includes(value)) return value;
      this.warn("impl");
      return "array";
    }

    get capacity() {
      const value = this.getAttribute("capacity");
      if (value === null) return 8;
      const n = Number(value);
      if (Number.isInteger(n) && n >= 1 && n <= MAX_ITEMS.array) return n;
      this.warn("capacity");
      return 8;
    }

    captionText() {
      return this.getAttribute("caption") || this.captionTemplate ? super.captionText() : `${super.captionText()} ${t(`impl.${this.impl}`)}`;
    }

    parse() {
      const impl = this.impl;
      const values = W.parse.values(this.attr("values") ?? "", { max: impl === "array" ? this.capacity : MAX_ITEMS.list, random: this.random });
      const ops = this.attr("ops");
      return { values, ops: ops === null ? null : W.parse.ops(ops, VERBS[this.algorithm]), impl, capacity: this.capacity };
    }

    steps(input, emit) {
      return run(input, { algorithm: this.algorithm }, emit);
    }

    draw(step, svg) {
      const { state } = step;
      if (state.impl === "array") W.svg.array(svg, state.a, { marks: step.marks, pointers: step.pointers });
      else list(svg, state.nodes, { marks: step.marks, pointers: step.pointers, raised: state.raised, empty: this.algorithm === "stack" ? "top = null" : "front = back = null" });
    }

    /** The items, bottom → top or front → back. */
    items(step) {
      const { state, pointers } = step;
      if (state.impl === "list") {
        const linked = state.nodes.filter((node) => !state.raised.includes(node.id)).map((node) => node.v);
        return this.algorithm === "stack" ? linked.reverse() : linked;
      }
      if (this.algorithm === "stack") return state.a.filter((v) => v !== null);
      const out = [];
      if (pointers.back === undefined) return out;
      for (let k = Number(pointers.front); ; k = (k + 1) % state.a.length) {
        out.push(state.a[k]);
        if (k === Number(pointers.back)) return out;
      }
    }

    describe(step) {
      const items = this.items(step);
      return t("describe", { name: this.captionText(), n: items.length, values: items.join(" ") || "—" });
    }

    table(step) {
      if (step.state.impl === "list") {
        const ids = step.state.nodes.map((node) => node.id);
        return {
          head: ["index", "value", "state"].map((key) => this.t(`widget.core.column.${key}`)),
          rows: step.state.nodes.map((node, i) => [i, node.v, this.stateName(step.marks[ids[i]])]),
        };
      }
      return {
        head: ["index", "value", "state"].map((key) => this.t(`widget.core.column.${key}`)),
        rows: step.state.a.map((v, i) => [i, v === null ? this.t("widget.core.hole") : v, this.stateName(step.marks[i])]),
      };
    }
  }

  W.register("uc-widget-stack-queue", StackQueueWidget);
}
