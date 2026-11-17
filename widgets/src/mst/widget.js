/**
 * <uc-widget-mst>: minimum spanning tree (or forest) of an undirected
 * graph by Kruskal (sorted edges and union-find) and Prim (lazy priority
 * queue of edges) (docs/architecture/widgets-api.md 17; page
 * docs/pt/widgets/uc-widget-mst.html). Same input as the graph widget
 * (../graph/element.js).
 */
import { ALGORITHMS, run } from "./algorithm.js";
import { strings } from "./i18n.js";
import { readGraph, serializeGraph, edgeList } from "../graph/element.js";
import { graph as drawGraph } from "../core/svg/graph.js";

export default function define(UC) {
  UC.addTranslations("pt", { widget: { mst: strings.pt } });
  UC.addTranslations("en", { widget: { mst: strings.en } });
  const W = UC.widgets;
  const t = (key, params) => UC.t(`widget.mst.${key}`, params);

  class MstWidget extends W.Widget {
    static id = "mst";
    static algorithms = ALGORITHMS;
    static inputAttributes = ["edges", "directed", "source"];
    static limits = { vertices: 10, edges: 20 };
    static editLabel = "widget.mst.edit";

    parse() {
      return readGraph(this, W, "mst");
    }

    steps(input, emit) {
      return run(input, { algorithm: this.algorithm }, emit);
    }

    draw(step, svg) {
      drawGraph(svg, this.input.graph, { marks: step.marks, notes: step.state.notes });
    }

    describe(step) {
      const { graph } = this.input;
      const { notes, tree } = step.state;
      const byId = Object.fromEntries(graph.edges.map((e) => [e.id, e]));
      const sets = graph.vertices.filter((v) => notes[v]).map((v) => `${v} ${notes[v]}`);
      return (
        t("describe", { kind: t("kind.undirected"), n: graph.vertices.length, m: graph.edges.length, edges: edgeList(graph) }) +
        (sets.length ? t("describeSets", { list: sets.join(", ") }) : "") +
        (tree.length ? t("describeTree", { list: tree.map((id) => `${byId[id].from}–${byId[id].to} ${byId[id].weight}`).join(", ") }) : "")
      );
    }

    table(step) {
      const { tree, rejected } = step.state;
      return {
        head: [t("column.edge"), t("column.weight"), t("column.tree")],
        rows: this.input.graph.edges.map((e) => [
          `${e.from}–${e.to}`,
          e.weight,
          tree.includes(e.id) ? this.t("widget.core.yes") : rejected.includes(e.id) ? this.t("widget.core.no") : "—",
        ]),
      };
    }

    serialize(input) {
      return serializeGraph(input);
    }
  }

  W.register("uc-widget-mst", MstWidget);
}
