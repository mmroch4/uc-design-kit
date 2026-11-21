/**
 * <uc-widget-shortest-path>: Dijkstra (with its priority queue) and
 * Bellman-Ford from a source vertex (docs/architecture/widgets-api.md 17; page
 * docs/pt/widgets/uc-widget-shortest-path.html). Same input as the graph
 * widget (../graph/element.js).
 */
import { ALGORITHMS, run } from "./algorithm.js";
import { strings } from "./i18n.js";
import { graphWidget } from "../graph/element.js";

export default function define(UC) {
  UC.addTranslations("pt", { widget: { "shortest-path": strings.pt } });
  UC.addTranslations("en", { widget: { "shortest-path": strings.en } });
  const W = UC.widgets;
  const t = (key, params) => UC.t(`widget.shortest-path.${key}`, params);

  class ShortestPathWidget extends graphWidget(W, "shortest-path", run, t) {
    static algorithms = ALGORITHMS;

    table(step) {
      const { parent, notes } = step.state;
      return {
        head: [t("column.vertex"), "dist", t("column.parent"), this.t("widget.core.column.state")],
        rows: this.input.graph.vertices.map((v) => [v, notes[v] || "—", parent[v] ?? "—", this.stateName(step.marks[v])]),
      };
    }
  }

  W.register("uc-widget-shortest-path", ShortestPathWidget);
}
