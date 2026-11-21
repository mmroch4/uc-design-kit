/**
 * What the graph widgets share in the browser (graph, shortest-path, mst,
 * toposort and trace): the base class graphWidget, which reads the input and
 * writes it back for the editable field, and the graph in words.
 *
 * The input is the `edges` attribute (lines separated by ";", handy for
 * short graphs and for the editable field) or else the <pre data-input> of
 * section 5.3. `directed` and `source` are attributes.
 */
import { model, source } from "./model.js";
import { graph as drawGraph } from "../core/svg/graph.js";

/** "A–B 4, A–C 1" (→ for arcs). */
export function edgeList(graph) {
  const arrow = graph.directed ? "→" : "–";
  return graph.edges.map((e) => `${e.from}${arrow}${e.to}${graph.weighted ? ` ${e.weight}` : ""}`).join(", ") || "—";
}

/**
 * The base class of the graph widgets (graph, shortest-path, mst, toposort):
 * the graph input, the run of the widget's algorithm, the drawing with the
 * step's notes, the description in words (the graph, then the notes with
 * the widget's string describeNotes) and the editable field. `t` reads the
 * widget's own strings; `directed` makes every graph directed (toposort).
 * Each widget adds its table.
 */
export function graphWidget(W, id, run, t, directed = false) {
  return class extends W.Widget {
    static id = id;
    static inputAttributes = ["edges", "directed", "source"];
    static limits = { vertices: 10, edges: 20 };
    static editLabel = `widget.${id}.edit`;

    /** { graph, source }; throws InputError (10.4). */
    parse() {
      const text = this.attr("edges") ?? this.inputNode?.textContent ?? "";
      const graph = model(W.parse.graph(String(text).replace(/;/g, "\n")), directed || this.hasAttribute("directed"));
      return { graph, source: source(graph, this.getAttribute("source"), id) };
    }

    steps(input, emit) {
      return run(input, { algorithm: this.algorithm }, emit);
    }

    draw(step, svg) {
      drawGraph(svg, this.input.graph, { marks: step.marks, notes: step.state.notes });
    }

    /** The graph (kind, sizes, edges) and the step's notes ("A 0, B 4"), if any. */
    describe(step) {
      const { graph } = this.input;
      const notes = Object.entries(step.state.notes).filter(([, note]) => note !== "");
      return (
        t("describe", { kind: t(graph.directed ? "kind.directed" : "kind.undirected"), n: graph.vertices.length, m: graph.edges.length, edges: edgeList(graph) }) +
        (notes.length ? t("describeNotes", { notes: notes.map(([v, note]) => `${v} ${note}`).join(", ") }) : "")
      );
    }

    /** The input on one line ("A B 4; A C 1; E; A @ 0,0"), for the editable field. */
    serialize({ graph }) {
      const used = new Set(graph.edges.flatMap((e) => [e.from, e.to]));
      return [
        ...graph.edges.map((e) => (graph.weighted ? `${e.from} ${e.to} ${e.weight}` : `${e.from} ${e.to}`)),
        ...graph.vertices.filter((v) => !used.has(v)),
        ...Object.entries(graph.positions).map(([v, [x, y]]) => `${v} @ ${x},${y}`),
      ].join("; ");
    }
  };
}
