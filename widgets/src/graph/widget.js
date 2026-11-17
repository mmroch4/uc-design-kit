/**
 * <uc-widget-graph>: breadth-first and depth-first search and the connected
 * components of a graph, directed or not (docs/plan/widgets-api.md 17; page
 * docs/pt/widgets/uc-widget-graph.html).
 */
import { ALGORITHMS, run } from "./algorithm.js";
import { strings } from "./i18n.js";
import { readGraph, serializeGraph, edgeList } from "./element.js";
import { graph as drawGraph } from "../core/svg/graph.js";

export default function define(UC) {
  UC.addTranslations("pt", { widget: { graph: strings.pt } });
  UC.addTranslations("en", { widget: { graph: strings.en } });
  const W = UC.widgets;
  const t = (key, params) => UC.t(`widget.graph.${key}`, params);

  class GraphWidget extends W.Widget {
    static id = "graph";
    static algorithms = ALGORITHMS;
    static inputAttributes = ["edges", "directed", "source"];
    static limits = { vertices: 10, edges: 20 };
    static editLabel = "widget.graph.edit";

    parse() {
      return readGraph(this, W, "graph");
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
      const { parent = {}, notes } = step.state;
      const tree = this.algorithm !== "components";
      return {
        head: [t("column.vertex"), t(`note.${this.algorithm}`), ...(tree ? [t("column.parent")] : []), this.t("widget.core.column.state")],
        rows: this.input.graph.vertices.map((v) => [v, notes[v] || "—", ...(tree ? [parent[v] ?? "—"] : []), this.stateName(step.marks[v])]),
      };
    }

    serialize(input) {
      return serializeGraph(input);
    }
  }

  W.register("uc-widget-graph", GraphWidget);
}
