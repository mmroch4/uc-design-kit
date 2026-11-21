/**
 * <uc-widget-graph>: breadth-first and depth-first search and the connected
 * components of a graph, directed or not (docs/architecture/widgets-api.md 17; page
 * docs/pt/widgets/uc-widget-graph.html).
 */
import { ALGORITHMS, run } from "./algorithm.js";
import { strings } from "./i18n.js";
import { graphWidget } from "./element.js";

export default function define(UC) {
  UC.addTranslations("pt", { widget: { graph: strings.pt } });
  UC.addTranslations("en", { widget: { graph: strings.en } });
  const W = UC.widgets;
  const t = (key, params) => UC.t(`widget.graph.${key}`, params);

  class GraphWidget extends graphWidget(W, "graph", run, t) {
    static algorithms = ALGORITHMS;

    table(step) {
      const { parent = {}, notes } = step.state;
      const tree = this.algorithm !== "components";
      return {
        head: [t("column.vertex"), t(`note.${this.algorithm}`), ...(tree ? [t("column.parent")] : []), this.t("widget.core.column.state")],
        rows: this.input.graph.vertices.map((v) => [v, notes[v] || "—", ...(tree ? [parent[v] ?? "—"] : []), this.stateName(step.marks[v])]),
      };
    }
  }

  W.register("uc-widget-graph", GraphWidget);
}
