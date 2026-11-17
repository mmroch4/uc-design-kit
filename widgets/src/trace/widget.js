/**
 * <uc-widget-trace>: plays the teacher's own steps (JSON) with the array,
 * tree, graph or grid drawing, with the same player, narration, text view
 * and predict mode as every widget (docs/plan/widgets-api.md 5.4; page
 * docs/pt/widgets/uc-widget-trace.html).
 */
import { ALGORITHMS, run } from "./algorithm.js";
import { strings } from "./i18n.js";
import { model } from "../graph/model.js";
import { edgeList } from "../graph/element.js";
import { graph as drawGraph } from "../core/svg/graph.js";
import { grid } from "../core/svg/grid.js";

export default function define(UC) {
  UC.addTranslations("pt", { widget: { trace: strings.pt } });
  UC.addTranslations("en", { widget: { trace: strings.en } });
  const W = UC.widgets;
  const t = (key, params) => UC.t(`widget.trace.${key}`, params);
  const kids = (node) => (Array.isArray(node.children) ? node.children : [node.l, node.r]);
  const nary = (node) => Boolean(node) && (Array.isArray(node.children) || kids(node).some(nary));
  const key = (node) => String(node.id ?? node.v);
  /** Nodes in pre-order: [node, …]. */
  const walk = (node, list = []) => {
    if (node) {
      list.push(node);
      kids(node).forEach((kid) => walk(kid, list));
    }
    return list;
  };

  class TraceWidget extends W.Widget {
    static id = "trace";
    static algorithms = ALGORITHMS;
    static editAttribute = "steps";
    static editLabel = "widget.trace.edit";

    parse() {
      const source = "steps" in this.overrides ? this.overrides.steps : this.inputNode ? this.inputNode.textContent : "";
      let data;
      try {
        data = JSON.parse(source);
      } catch (error) {
        throw new W.InputError("widget.trace.error.json", { detail: error.message });
      }
      const graph = data && data.view === "graph" && data.graph ? model(W.parse.graph(String(data.graph).replace(/;/g, "\n")), Boolean(data.directed)) : null;
      return { data, graph };
    }

    steps(input, emit) {
      return run(input, { algorithm: this.algorithm }, emit);
    }

    get view() {
      return (this.input && this.input.data.view) || "array";
    }

    pseudocode() {
      const code = this.input && this.input.data.code;
      if (Array.isArray(code)) return code;
      if (code && typeof code === "object") return code[UC.lang] || code[(UC.lang || "").split("-")[0]] || Object.values(code)[0] || [];
      return [];
    }

    draw(step, svg) {
      const value = step.state.value;
      const { marks, pointers } = step;
      const data = this.input.data;
      if (this.view === "array") W.svg.array(svg, value, { marks, pointers });
      else if (this.view === "grid") grid(svg, value, { marks, rowHeads: data.rowHeads || null, colHeads: data.colHeads || null });
      else if (this.view === "graph") drawGraph(svg, this.input.graph, { marks, notes: value });
      else {
        W.svg.tree(svg, value, {
          binary: !nary(value),
          children: kids,
          key,
          label: (node) => String(node.v),
          note: (node) => (node.note === undefined ? "" : String(node.note)),
          marks,
          pointers,
          empty: t("describe.empty"),
        });
      }
    }

    describe(step) {
      const value = step.state.value;
      const show = (v) => (v === null || v === undefined ? "_" : String(v));
      if (this.view === "array") return t("describe.array", { values: value.map(show).join(" ") || t("describe.empty") });
      if (this.view === "grid") return t("describe.grid", { r: value.length, c: Math.max(0, ...value.map((row) => row.length)), rows: value.map((row) => row.map(show).join(" ")).join(" / ") });
      if (this.view === "graph") {
        const { graph } = this.input;
        const notes = Object.entries(value).map(([v, note]) => `${v} ${note}`);
        return `${t("describe.graph", { n: graph.vertices.length, m: graph.edges.length, edges: edgeList(graph) })}${notes.length ? ` ${notes.join(", ")}.` : ""}`;
      }
      const nodes = walk(value).map((node) => `${node.v} (${kids(node).filter(Boolean).map((kid) => kid.v).join(", ") || "—"})`);
      return t("describe.tree", { nodes: nodes.join("; ") || t("describe.empty") });
    }

    table(step) {
      const value = step.state.value;
      const state = this.t("widget.core.column.state");
      const name = (id) => this.stateName(step.marks[id]);
      if (this.view === "array") return { head: [this.t("widget.core.column.index"), this.t("widget.core.column.value"), state], rows: value.map((v, i) => [i, v ?? "—", name(i)]) };
      if (this.view === "graph") return { head: [this.t("widget.trace.column.node"), t("column.note"), state], rows: this.input.graph.vertices.map((v) => [v, value[v] ?? "—", name(v)]) };
      if (this.view === "tree") return { head: [t("column.node"), t("column.note"), state], rows: walk(value).map((node) => [node.v, node.note ?? "—", name(key(node))]) };
      const heads = this.input.data.colHeads;
      const width = Math.max(0, ...value.map((row) => row.length));
      return {
        head: [t("column.row"), ...(heads || Array.from({ length: width }, (_, c) => c))],
        rows: value.map((row, r) => [this.input.data.rowHeads ? this.input.data.rowHeads[r] : r, ...row.map((v, c) => `${v ?? "—"}${step.marks[`${r},${c}`] ? ` (${name(`${r},${c}`)})` : ""}`)]),
      };
    }

    /** The step's variables ("vars"), if any. */
    panel(step) {
      const vars = step.aux && step.aux.vars;
      if (!vars || !Object.keys(vars).length) return null;
      this.panelBox.hidden = false;
      return Object.entries(vars).map(([name, value]) => W.util.el("div", { class: "uc-widget__stat" }, W.util.el("dt", { class: "uc-mono" }, name), W.util.el("dd", { class: "uc-mono" }, value)));
    }

    serialize() {
      return "steps" in this.overrides ? this.overrides.steps : this.inputNode ? this.inputNode.textContent.trim() : "";
    }
  }

  W.register("uc-widget-trace", TraceWidget);
}
