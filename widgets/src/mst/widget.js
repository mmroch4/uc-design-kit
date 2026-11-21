/**
 * <uc-widget-mst>: minimum spanning tree (or forest) of an undirected
 * graph by Kruskal (sorted edges and union-find) and Prim (lazy priority
 * queue of edges) (docs/architecture/widgets-api.md 17; page
 * docs/pt/widgets/uc-widget-mst.html). Same input as the graph widget
 * (../graph/element.js).
 */
import { ALGORITHMS, run } from "./algorithm.js";
import { strings } from "./i18n.js";
import { graphWidget } from "../graph/element.js";

export default function define(UC) {
  UC.addTranslations("pt", { widget: { mst: strings.pt } });
  UC.addTranslations("en", { widget: { mst: strings.en } });
  const W = UC.widgets;
  const t = (key, params) => UC.t(`widget.mst.${key}`, params);

  class MstWidget extends graphWidget(W, "mst", run, t) {
    static algorithms = ALGORITHMS;

    /** The graph, the sets (the notes) and the edges in the tree so far. */
    describe(step) {
      const list = step.state.tree.map((id) => this.input.graph.edges.find((e) => e.id === id)).map((e) => `${e.from}–${e.to} ${e.weight}`);
      return super.describe(step) + (list.length ? t("describeTree", { list: list.join(", ") }) : "");
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
  }

  W.register("uc-widget-mst", MstWidget);
}
