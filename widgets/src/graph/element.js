/**
 * What the graph widgets share in the browser (graph, shortest-path; W5's
 * graph widgets too): reading the input, writing it back for the editable
 * field and describing the graph in words.
 *
 * The input is the `edges` attribute (lines separated by ";", handy for
 * short graphs and for the editable field) or else the <pre data-input> of
 * section 5.3. `directed` and `source` are attributes.
 */
import { model, source } from "./model.js";

/** { graph, source } of an element; throws InputError (10.4). */
export function readGraph(element, W, id) {
  const own = element.attr("edges");
  const text = own ?? (element.inputNode ? element.inputNode.textContent : "");
  const graph = model(W.parse.graph(String(text).replace(/;/g, "\n")), element.hasAttribute("directed"));
  return { graph, source: source(graph, element.getAttribute("source"), id) };
}

/** The input on one line ("A B 4; A C 1; E; A @ 0,0"), for the editable field. */
export function serializeGraph({ graph }) {
  const used = new Set(graph.edges.flatMap((e) => [e.from, e.to]));
  return [
    ...graph.edges.map((e) => (graph.weighted ? `${e.from} ${e.to} ${e.weight}` : `${e.from} ${e.to}`)),
    ...graph.vertices.filter((v) => !used.has(v)),
    ...Object.entries(graph.positions).map(([v, [x, y]]) => `${v} @ ${x},${y}`),
  ].join("; ");
}

/** "A–B 4, A–C 1" (→ for arcs). */
export function edgeList(graph) {
  const arrow = graph.directed ? "→" : "–";
  return graph.edges.map((e) => `${e.from}${arrow}${e.to}${graph.weighted ? ` ${e.weight}` : ""}`).join(", ") || "—";
}
