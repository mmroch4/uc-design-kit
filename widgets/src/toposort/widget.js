/**
 * <uc-widget-toposort>: topological sort of a directed graph by Kahn's
 * algorithm (in-degrees and a queue) and by DFS (finishing order), with
 * cycle detection (docs/plan/widgets-api.md 17; page
 * docs/pt/widgets/uc-widget-toposort.html). Same input as the graph widget
 * (../graph/element.js), but the graph is always directed: the `directed`
 * attribute is not needed, and there is no source.
 */
import { ALGORITHMS, run } from "./algorithm.js";
import { strings } from "./i18n.js";
import { readGraph, serializeGraph, edgeList } from "../graph/element.js";
import { model } from "../graph/model.js";
import { graph as drawGraph } from "../core/svg/graph.js";

export default function define(UC) {
  UC.addTranslations("pt", { widget: { toposort: strings.pt } });
  UC.addTranslations("en", { widget: { toposort: strings.en } });
  const W = UC.widgets;
  const t = (key, params) => UC.t(`widget.toposort.${key}`, params);

  class ToposortWidget extends W.Widget {
    static id = "toposort";
    static algorithms = ALGORITHMS;
    static inputAttributes = ["edges"];
    static limits = { vertices: 10, edges: 20 };
    static editLabel = "widget.toposort.edit";

    parse() {
      const { graph } = readGraph(this, W, "toposort");
      return { graph: model(graph, true) };
    }

    steps(input, emit) {
      return run(input, { algorithm: this.algorithm }, emit);
    }

    draw(step, svg) {
      drawGraph(svg, this.input.graph, { marks: step.marks, notes: step.state.notes });
    }

    describe(step) {
      const { graph } = this.input;
      const notes = Object.entries(step.state.notes).filter(([, note]) => note !== "");
      return (
        t("describe", { kind: t("kind.directed"), n: graph.vertices.length, m: graph.edges.length, edges: edgeList(graph) }) +
        (notes.length ? t("describeNotes", { notes: notes.map(([v, note]) => `${v} ${note}`).join(", ") }) : "")
      );
    }

    table(step) {
      const kahn = this.algorithm === "kahn";
      const { notes } = step.state;
      const stack = step.aux.stack || [];
      return {
        head: [t("column.vertex"), t(kahn ? "column.indegree" : "column.situation"), this.t("widget.core.column.state")],
        rows: this.input.graph.vertices.map((v) => [
          v,
          kahn ? notes[v] || "—" : t(`colour.${step.state.order.includes(v) ? "done" : stack.includes(v) ? "stack" : "new"}`),
          this.stateName(step.marks[v]),
        ]),
      };
    }

    serialize(input) {
      return serializeGraph(input);
    }
  }

  W.register("uc-widget-toposort", ToposortWidget);
}
