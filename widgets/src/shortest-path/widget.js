/**
 * <uc-widget-shortest-path>: Dijkstra (with its priority queue) and
 * Bellman-Ford from a source vertex (docs/plan/widgets-api.md 17; page
 * docs/pt/widgets/uc-widget-shortest-path.html). Same input as the graph
 * widget (../graph/element.js).
 */
import { ALGORITHMS, run } from "./algorithm.js";
import { strings } from "./i18n.js";
import { readGraph, serializeGraph, edgeList } from "../graph/element.js";
import { graph as drawGraph } from "../core/svg/graph.js";

export default function define(UC) {
  UC.addTranslations("pt", { widget: { "shortest-path": strings.pt } });
  UC.addTranslations("en", { widget: { "shortest-path": strings.en } });
  const W = UC.widgets;
  const t = (key, params) => UC.t(`widget.shortest-path.${key}`, params);

  class ShortestPathWidget extends W.Widget {
    static id = "shortest-path";
    static algorithms = ALGORITHMS;
    static inputAttributes = ["edges", "directed", "source"];
    static limits = { vertices: 10, edges: 20 };
    static editLabel = "widget.shortest-path.edit";

    parse() {
      return readGraph(this, W, "shortest-path");
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
        t("describe", { kind: t(`kind.${graph.directed ? "directed" : "undirected"}`), n: graph.vertices.length, m: graph.edges.length, edges: edgeList(graph) }) +
        (notes.length ? t("describeNotes", { notes: notes.map(([v, note]) => `${v} ${note}`).join(", ") }) : "")
      );
    }

    table(step) {
      const { parent, notes } = step.state;
      return {
        head: [t("column.vertex"), "dist", t("column.parent"), this.t("widget.core.column.state")],
        rows: this.input.graph.vertices.map((v) => [v, notes[v] || "—", parent[v] ?? "—", this.stateName(step.marks[v])]),
      };
    }

    serialize(input) {
      return serializeGraph(input);
    }
  }

  W.register("uc-widget-shortest-path", ShortestPathWidget);
}
