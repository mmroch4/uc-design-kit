/**
 * The graph model shared by the graph widgets (graph, shortest-path; mst,
 * union-find and toposort in W5). Pure: no DOM, no UC.
 *
 * model(parsed, directed) takes the output of UC.widgets.parse.graph (5.3)
 * and gives every edge a stable id (the element id used by marks: "A-B" as
 * written in the input; a repeated pair gets "A-B'2", "A-B'3"…) and builds
 * the adjacency lists. Neighbours are visited in the order the vertices first
 * appear in the input (documented on the widget pages), so a teacher controls
 * the order by the order of the lines.
 */
import { InputError } from "../core/engine.js";

/** { vertices, edges: [{ id, from, to, weight }], positions, weighted, directed, adj: { v: [{ to, edge, weight }] } }. */
export function model({ vertices, edges, positions = {}, weighted = false }, directed = false) {
  const seen = {};
  const list = edges.map(({ from, to, weight }) => {
    const base = `${from}-${to}`;
    seen[base] = (seen[base] || 0) + 1;
    return { id: seen[base] > 1 ? `${base}'${seen[base]}` : base, from, to, weight: weight ?? 1 };
  });
  const rank = Object.fromEntries(vertices.map((v, i) => [v, i]));
  const adj = Object.fromEntries(vertices.map((v) => [v, []]));
  for (const edge of list) {
    adj[edge.from].push({ to: edge.to, edge: edge.id, weight: edge.weight });
    if (!directed && edge.from !== edge.to) adj[edge.to].push({ to: edge.from, edge: edge.id, weight: edge.weight });
  }
  for (const v of vertices) adj[v].sort((a, b) => rank[a.to] - rank[b.to]);
  return { vertices: vertices.slice(), edges: list, positions, weighted, directed, adj };
}

/**
 * The source vertex: the attribute's value, or the first vertex. Throws
 * InputError (widget.<id>.error.empty / .source) if there is none.
 */
export function source(graph, name, id = "graph") {
  if (!graph.vertices.length) throw new InputError(`widget.${id}.error.empty`);
  const s = name === null || name === undefined || name === "" ? graph.vertices[0] : String(name).trim();
  if (!graph.vertices.includes(s)) throw new InputError(`widget.${id}.error.source`, { v: s });
  return s;
}

/**
 * Up to four options for a "which vertex comes next?" question: the answer
 * and the first other candidates, in input order (keys widget.<id>.vertex).
 */
export function choices(graph, answer, candidates, id = "graph", max = 4) {
  const others = graph.vertices.filter((v) => v !== answer && candidates.includes(v)).slice(0, max - 1);
  const list = graph.vertices.filter((v) => v === answer || others.includes(v));
  return { options: list.map((v) => [`widget.${id}.vertex`, { v }]), answer: list.indexOf(answer) };
}

