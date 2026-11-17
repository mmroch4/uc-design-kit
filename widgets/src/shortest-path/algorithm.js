/**
 * Single-source shortest paths of <uc-widget-shortest-path>, as step lists
 * (docs/architecture/widgets-api.md 6.4). Pure: no DOM, no UC, no Math.random.
 *
 * Input: { graph, source } as in the graph widget (../graph/model.js);
 * an unweighted graph has weight 1 on every edge. Marks: vertex names and
 * edge ids. State: { dist, parent, notes } (dist null = ∞).
 *
 * - "dijkstra": with a priority queue of (distance, vertex) pairs and lazy
 *   deletion (an old pair is skipped when it leaves the queue), the version
 *   most courses code with a library queue. Negative weights are an input
 *   error. Aux `pq`: the pairs, smallest first.
 * - "bellman-ford": |V| − 1 rounds over every edge in input order (both
 *   ways when undirected), stopping early after a round with no change,
 *   then one more pass that finds a negative cycle reachable from the source.
 *
 * Result: { dist, parent, negativeCycle }. The last step marks the
 * shortest-path tree "done" (none when there is a negative cycle).
 */
import { InputError } from "../core/engine.js";
import { choices } from "../graph/model.js";

export const ALGORITHMS = ["dijkstra", "bellman-ford"];
export const INFINITY = "∞";
const ID = "shortest-path";
const K = `widget.${ID}`;
const YES_NO = [["widget.core.yes"], ["widget.core.no"]];

export function run({ graph, source }, { algorithm = "dijkstra" } = {}, emit) {
  if (!ALGORITHMS.includes(algorithm)) throw new Error(`unknown algorithm ${algorithm}`);
  const bad = graph.edges.find((e) => e.weight < 0);
  if (algorithm === "dijkstra" && bad) throw new InputError(`${K}.error.negative`, { edge: `${bad.from} ${bad.to} ${bad.weight}` });
  const arrow = graph.directed ? "→" : "–";
  const dist = Object.fromEntries(graph.vertices.map((v) => [v, null]));
  const parent = {};
  const via = {}; // the edge id that gave dist[v]
  const notes = Object.fromEntries(graph.vertices.map((v) => [v, ""]));
  const state = { dist, parent, notes };
  const vm = {};
  const stats = { edges: 0, relaxations: 0 };
  const pq = [];
  const aux = algorithm === "dijkstra" ? { pq: [] } : { round: 0 };
  const order = (a, b) => a[0] - b[0] || graph.vertices.indexOf(a[1]) - graph.vertices.indexOf(b[1]);
  const show = () => {
    if (aux.pq) aux.pq = pq.sort(order).map(([d, v]) => `${v}:${d}`);
  };
  const tree = () => Object.fromEntries(Object.values(via).map((id) => [id, "visited"]));
  const step = (extra, line, say, more = {}) => {
    show();
    emit({ state, marks: { ...vm, ...tree(), ...extra }, line, say, code: algorithm, stats, aux, ...more });
  };

  emit({
    state,
    marks: {},
    line: null,
    say: [`${K}.start.${algorithm}`, { s: source, n: graph.vertices.length, m: graph.edges.length }],
    code: algorithm,
    stats,
    aux: algorithm === "dijkstra" ? { pq: [] } : { round: 0 },
  });
  for (const v of graph.vertices) notes[v] = INFINITY;
  dist[source] = 0;
  notes[source] = "0";

  /** Tries the edge u → v; true when dist[v] improved. */
  const relax = (u, v, edge, weight) => {
    stats.edges += 1;
    const p = { u, v, w: weight, wt: weight < 0 ? `(${weight})` : weight, arrow, du: dist[u] ?? INFINITY, dv: dist[v] ?? INFINITY, nd: dist[u] === null ? INFINITY : dist[u] + weight };
    if (dist[u] === null) {
      step({ [edge]: "compared", [u]: "compared" }, "relax", [`${K}.unreached`, p]);
      return false;
    }
    const better = dist[v] === null || dist[u] + weight < dist[v];
    const predict = dist[v] !== null && u !== v ? { ask: [`${K}.predict.relax`, p], options: YES_NO, answer: better ? 0 : 1 } : undefined;
    if (!better) {
      step({ [edge]: "compared", [v]: "compared" }, "relax", [`${K}.keep`, p], { predict });
      return false;
    }
    dist[v] = dist[u] + weight;
    parent[v] = u;
    via[v] = edge;
    notes[v] = String(dist[v]);
    stats.relaxations += 1;
    step({ [edge]: "current", [v]: "swapped" }, "update", [`${K}.update`, p], { predict });
    return true;
  };

  let negativeCycle = false;
  if (algorithm === "dijkstra") {
    pq.push([0, source]);
    vm[source] = "visited";
    step({}, "init", [`${K}.init`, { s: source }]);
    const fixed = new Set();
    while (pq.length) {
      pq.sort(order);
      const [d, u] = pq[0];
      const live = pq.filter(([dd, v]) => !fixed.has(v) && dd === dist[v]).map(([, v]) => v);
      const predict = live.length > 1 && !fixed.has(u) ? { ask: [`${K}.predict.pop`], ...choices(graph, u, live, ID) } : undefined;
      pq.shift();
      if (fixed.has(u) || d > dist[u]) {
        step({ [u]: "compared" }, "stale", [`${K}.stale`, { u, d, du: dist[u] }]);
        continue;
      }
      fixed.add(u);
      vm[u] = "current";
      step({}, "pop", [`${K}.pop`, { u, d }], { predict });
      for (const { to: v, edge, weight } of graph.adj[u]) {
        if (fixed.has(v)) {
          stats.edges += 1;
          step({ [edge]: "compared", [v]: "compared" }, "edge", [`${K}.fixed`, { u, v, arrow }]);
          continue;
        }
        if (relax(u, v, edge, weight)) {
          pq.push([dist[v], v]);
          vm[v] = "visited";
          step({ [v]: "visited" }, "push", [`${K}.push`, { v, d: dist[v] }]);
        }
      }
      vm[u] = "done";
    }
  } else {
    const list = graph.edges.flatMap((e) => (graph.directed || e.from === e.to ? [[e.from, e.to, e]] : [[e.from, e.to, e], [e.to, e.from, e]]));
    vm[source] = "visited";
    step({}, "init", [`${K}.init`, { s: source }]);
    const rounds = graph.vertices.length - 1;
    for (let r = 1; r <= rounds; r += 1) {
      aux.round = r;
      step({}, "round", [`${K}.round`, { r, total: rounds }]);
      let changed = false;
      for (const [u, v, e] of list) {
        if (relax(u, v, e.id, e.weight)) {
          changed = true;
          vm[v] = "visited";
        }
      }
      if (!changed) {
        step({}, "stop", [`${K}.stop`, { r }]);
        break;
      }
    }
    aux.round = null;
    step({}, "check", [`${K}.check`, {}]);
    for (const [u, v, e] of list) {
      stats.edges += 1;
      if (dist[u] !== null && dist[u] + e.weight < (dist[v] ?? Infinity)) {
        negativeCycle = true;
        emit({
          state,
          marks: { [e.id]: "current", [v]: "current", [u]: "compared" },
          line: "cycle",
          say: [`${K}.cycle`, { u, v, arrow, w: e.weight }],
          code: algorithm,
          stats,
          aux,
        });
        return { dist, parent, negativeCycle };
      }
    }
  }

  const reached = graph.vertices.filter((v) => dist[v] !== null);
  const lost = graph.vertices.filter((v) => dist[v] === null);
  const marks = {};
  for (const v of reached) marks[v] = "done";
  for (const id of Object.values(via)) marks[id] = "done";
  show();
  emit({
    state,
    marks,
    line: null,
    say: [lost.length ? `${K}.endLost` : `${K}.end`, { s: source, list: reached.map((v) => `${v} ${dist[v]}`).join(", "), lost: lost.join(", ") }],
    code: algorithm,
    stats,
    aux,
  });
  return { dist, parent, negativeCycle };
}
