/**
 * <uc-widget-toposort>: topological sort of a directed graph by Kahn's
 * algorithm (in-degrees and a queue) and by DFS (finishing order), with
 * cycle detection (docs/architecture/widgets-api.md 17; page
 * docs/pt/widgets/uc-widget-toposort.html). Same input as the graph widget
 * (../graph/element.js), but the graph is always directed: the `directed`
 * attribute is not needed, and there is no source.
 */
import { ALGORITHMS, run } from "./algorithm.js";
import { strings } from "./i18n.js";
import { graphWidget } from "../graph/element.js";

export default function define(UC) {
  UC.addTranslations("pt", { widget: { toposort: strings.pt } });
  UC.addTranslations("en", { widget: { toposort: strings.en } });
  const W = UC.widgets;
  const t = (key, params) => UC.t(`widget.toposort.${key}`, params);

  class ToposortWidget extends graphWidget(W, "toposort", run, t, true) {
    static algorithms = ALGORITHMS;
    static inputAttributes = ["edges"];

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
  }

  W.register("uc-widget-toposort", ToposortWidget);
}
