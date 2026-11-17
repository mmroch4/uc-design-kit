/**
 * Minimum spanning trees of <uc-widget-mst>, as step lists
 * (docs/architecture/widgets-api.md 6.4). Pure: no DOM, no UC, no Math.random.
 *
 * Input: { graph, source } as in the graph widget (../graph/model.js); the
 * graph must be undirected (a directed one is an input error); an
 * unweighted graph has weight 1 on every edge. On a disconnected graph both
 * algorithms build a minimum spanning forest. Marks: vertex names and edge
 * ids. State: { notes, tree, rejected, total }: `tree` and `rejected` are
 * edge ids, `notes` the text beside each vertex.
 *
 * - "kruskal": the edges sorted by weight (stable: input order on ties,
 *   aux `edges`, the ones still to see), then each edge joins two sets of a
 *   union-find (union: the set of v under the representative of u) or is
 *   rejected because it would close a cycle; stops when the tree has
 *   |V| − 1 edges. Notes: the representative of each vertex's set, "[A]".
 * - "prim": lazy version from `source`, with a priority queue of edges
 *   (aux `pq`, smallest first, insertion order on ties): an edge whose two
 *   ends are already in the tree is skipped when it leaves the queue. When
 *   the queue empties and vertices are left (another component), it starts
 *   again at the first vertex outside the tree (line `restart`).
 *
 * Result: { edges: [edge ids of the tree, in the order they joined], weight }.
 */
import { InputError } from "../core/engine.js";

export const ALGORITHMS = ["kruskal", "prim"];
const K = "widget.mst";
const YES_NO = [["widget.core.yes"], ["widget.core.no"]];

export function run({ graph, source }, { algorithm = "kruskal" } = {}, emit) {
  if (!ALGORITHMS.includes(algorithm)) throw new Error(`unknown algorithm ${algorithm}`);
  if (graph.directed) throw new InputError(`${K}.error.directed`);
  const V = graph.vertices;
  const notes = Object.fromEntries(V.map((v) => [v, ""]));
  const tree = [];
  const rejected = [];
  const state = { notes, tree, rejected, total: 0 };
  const vm = {}; // vertex marks that last
  const stats = { edges: 0 };
  const aux = algorithm === "kruskal" ? { edges: [], weight: 0 } : { pq: [], weight: 0 };
  const label = (e, u = e.from, v = e.to) => `${u}–${v}`;
  const chip = (e, u, v) => `${label(e, u, v)} ${e.weight}`;
  const step = (extra, line, say, more = {}) => {
    const em = Object.fromEntries(tree.map((id) => [id, "visited"]));
    emit({ state, marks: { ...vm, ...em, ...extra }, line, say, code: algorithm, stats, aux, ...more });
  };
  const add = (e) => {
    tree.push(e.id);
    state.total += e.weight;
    aux.weight = state.total;
  };

  emit({ state, marks: {}, line: null, say: [`${K}.start.${algorithm}`, { s: source, n: V.length, m: graph.edges.length }], code: algorithm, stats, aux: { ...aux } });

  if (algorithm === "kruskal") {
    const parent = Object.fromEntries(V.map((v) => [v, v]));
    const size = Object.fromEntries(V.map((v) => [v, 1]));
    const find = (v) => (parent[v] === v ? v : find(parent[v]));
    const show = () => V.forEach((v) => (notes[v] = `[${find(v)}]`));
    show();
    step({}, "init", [`${K}.init`, {}]);
    const sorted = graph.edges.slice().sort((a, b) => a.weight - b.weight);
    aux.edges = sorted.map((e) => chip(e));
    step({}, "sort", [`${K}.sort`, { list: aux.edges.join(", ") }]);
    for (const e of sorted) {
      if (tree.length === V.length - 1) {
        step({}, "stop", [`${K}.stop`, { k: tree.length }]);
        break;
      }
      aux.edges.shift();
      stats.edges += 1;
      const [ru, rv] = [find(e.from), find(e.to)];
      const p = { e: label(e), w: e.weight, u: e.from, v: e.to, ru, rv, t: state.total + e.weight };
      step({ [e.id]: "current", [e.from]: "compared", [e.to]: "compared" }, "check", [`${K}.check`, p]);
      const predict = { ask: [`${K}.predict.join`, p], options: YES_NO, answer: ru === rv ? 1 : 0 };
      if (ru === rv) {
        rejected.push(e.id);
        step({ [e.id]: "compared", [e.from]: "compared", [e.to]: "compared" }, "cycle", [`${K}.${e.from === e.to ? "loop" : "cycle"}`, p], { predict });
        continue;
      }
      // Union by size: the smaller set goes under the larger one's representative (v's under u's on a tie).
      const [big, small] = size[ru] < size[rv] ? [rv, ru] : [ru, rv];
      parent[small] = big;
      size[big] += size[small];
      Object.assign(p, { big, small });
      add(e);
      show();
      vm[e.from] = vm[e.to] = "visited";
      step({ [e.id]: "current" }, "union", [`${K}.union`, p], { predict });
    }
  } else {
    const inTree = new Set();
    const pq = []; // [edge, from (in the tree), to, insertion number]
    let seq = 0;
    const show = () => (aux.pq = pq.sort((a, b) => a[0].weight - b[0].weight || a[3] - b[3]).map(([e, u, v]) => chip(e, u, v)));
    /** Puts u in the tree (a step) and its edges to outside vertices in the queue (a step, if any). */
    const enter = (u, extra, line, say, predict) => {
      inTree.add(u);
      vm[u] = "current";
      step(extra, line, say, { predict });
      const pushed = {};
      const list = [];
      for (const { to, edge } of graph.adj[u]) {
        if (inTree.has(to)) continue;
        const e = graph.edges.find((x) => x.id === edge);
        pq.push([e, u, to, (seq += 1)]);
        pushed[edge] = "compared";
        list.push(chip(e, u, to));
      }
      show();
      if (list.length) step(pushed, "push", [`${K}.push`, { v: u, list: list.join(", ") }]);
      vm[u] = "visited";
    };
    let first = true;
    while (inTree.size < V.length) {
      if (!pq.length) {
        const s = first ? source : V.find((v) => !inTree.has(v));
        enter(s, {}, first ? "init" : "restart", [first ? `${K}.initPrim` : `${K}.restart`, { s }]);
        first = false;
        continue;
      }
      const [e, u, v] = pq.shift();
      show();
      stats.edges += 1;
      const p = { e: label(e, u, v), w: e.weight, u, v, t: state.total + e.weight };
      const predict = { ask: [`${K}.predict.join`, p], options: YES_NO, answer: inTree.has(v) ? 1 : 0 };
      if (inTree.has(v)) {
        rejected.push(e.id);
        step({ [e.id]: "compared", [v]: "compared" }, "skip", [`${K}.skip`, p], { predict });
        continue;
      }
      add(e);
      enter(v, { [e.id]: "current" }, "add", [`${K}.add`, p], predict);
    }
  }

  // The result: the tree edges and every vertex.
  const marks = {};
  for (const v of V) marks[v] = "done";
  for (const id of tree) marks[id] = "done";
  const parts = countParts(graph);
  const byId = Object.fromEntries(graph.edges.map((e) => [e.id, e]));
  emit({
    state,
    marks,
    line: null,
    say: [parts > 1 ? `${K}.endForest` : `${K}.end`, { list: tree.map((id) => `${label(byId[id])} ${byId[id].weight}`).join(", ") || "—", w: state.total, c: parts }],
    code: algorithm,
    stats,
    aux,
  });
  return { edges: tree.slice(), weight: state.total };
}

/** The number of connected components. */
function countParts(graph) {
  const group = Object.fromEntries(graph.vertices.map((v) => [v, v]));
  const find = (v) => (group[v] === v ? v : (group[v] = find(group[v])));
  for (const e of graph.edges) group[find(e.from)] = find(e.to);
  return graph.vertices.filter((v) => find(v) === v).length;
}
