/**
 * Graph traversals of <uc-widget-graph>, as step lists
 * (docs/architecture/widgets-api.md 6.4). Pure: no DOM, no UC, no Math.random.
 *
 * Input: { graph, source } where graph is model() of ./model.js (edge ids,
 * adjacency lists in input order). meta.json and the tests write it as text
 * ({ text, directed, source }, see ./fixture.js). Marks: vertex names and edge ids. State:
 * the algorithm's arrays plus `notes` (the text drawn beside each vertex).
 *
 * - "bfs": breadth-first search from the source with a queue; notes are the
 *   distances (∞ until discovered). Result: { dist, parent, order }.
 * - "dfs": recursive depth-first search from the source; the call stack is
 *   the panel's stack; notes are the visit numbers. Result: { order, parent }.
 * - "components": connected components (edges taken both ways when the graph
 *   is directed), one BFS per new component; notes are the component
 *   numbers. Result: { comp, count }.
 *
 * Tree edges end as "done" with the vertices they reach; unreached vertices
 * stay "default".
 */
import { model, choices } from "./model.js";

export const ALGORITHMS = ["bfs", "dfs", "components"];
export const INFINITY = "∞";

export function run({ graph, source }, { algorithm = "bfs" } = {}, emit) {
  if (!ALGORITHMS.includes(algorithm)) throw new Error(`unknown algorithm ${algorithm}`);
  const arrow = graph.directed && algorithm !== "components" ? "→" : "–";
  const vm = {}; // vertex marks that last
  const em = {}; // edge marks that last
  const notes = Object.fromEntries(graph.vertices.map((v) => [v, ""]));
  const order = [];
  const n = graph.vertices.length;
  const m = graph.edges.length;
  const counter = { edges: 0 };
  let state = { notes };
  let aux = {};
  const step = (extra, line, say, more = {}) =>
    emit({ state, marks: { ...vm, ...em, ...extra }, line, say, code: algorithm, stats: { edges: counter.edges }, aux, ...more });
  const finish = (reached, say) => {
    for (const v of reached) vm[v] = "done";
    for (const id of Object.keys(em)) em[id] = "done";
    emit({ state, marks: { ...vm, ...em }, line: null, say, code: algorithm, stats: { edges: counter.edges }, aux });
  };

  emit({
    state,
    marks: {},
    line: null,
    say: [`widget.graph.start.${algorithm}${graph.directed ? "Directed" : ""}`, { s: source, n, m }],
    code: algorithm,
    stats: { edges: 0 },
    aux: {},
  });

  if (algorithm === "bfs") {
    const dist = Object.fromEntries(graph.vertices.map((v) => [v, null]));
    const parent = {};
    const queue = [source];
    state = { dist, parent, notes };
    aux = { queue, order };
    for (const v of graph.vertices) notes[v] = INFINITY;
    dist[source] = 0;
    notes[source] = "0";
    vm[source] = "visited";
    step({}, "init", ["widget.graph.bfs.init", { s: source }]);
    let last = null;
    while (queue.length) {
      if (last) vm[last] = "done";
      const u = queue[0];
      const predict = queue.length > 1 ? { ask: ["widget.graph.predict.dequeue"], ...choices(graph, u, queue) } : undefined;
      queue.shift();
      order.push(u);
      vm[u] = "current";
      step({}, "pop", ["widget.graph.bfs.pop", { u, d: dist[u] }], predict ? { predict } : {});
      for (const { to: v, edge } of graph.adj[u]) {
        counter.edges += 1;
        const p = { u, v, arrow, d: dist[u] + 1 };
        if (dist[v] === null) {
          dist[v] = dist[u] + 1;
          parent[v] = u;
          notes[v] = String(dist[v]);
          queue.push(v);
          vm[v] = "visited";
          em[edge] = "visited";
          step({ [edge]: "current" }, "visit", ["widget.graph.bfs.new", p]);
        } else {
          step({ [v]: v === u ? "current" : "compared", [edge]: "compared" }, "check", ["widget.graph.bfs.old", { ...p, d: dist[v] }]);
        }
      }
      last = u;
    }
    const reached = graph.vertices.filter((v) => dist[v] !== null);
    const lost = graph.vertices.filter((v) => dist[v] === null);
    finish(reached, [
      lost.length ? "widget.graph.bfs.endLost" : "widget.graph.bfs.end",
      { list: reached.map((v) => `${v} ${dist[v]}`).join(", "), lost: lost.join(", ") },
    ]);
    return { dist, parent, order };
  }

  if (algorithm === "dfs") {
    const parent = {};
    const stack = [];
    state = { order, parent, notes };
    aux = { stack, order };
    const seen = new Set();
    const visit = (u) => {
      seen.add(u);
      order.push(u);
      stack.push(u);
      notes[u] = String(order.length);
      vm[u] = "current";
      step({}, "visit", ["widget.graph.dfs.visit", { u, k: order.length }]);
      for (const { to: v, edge } of graph.adj[u]) {
        counter.edges += 1;
        const p = { u, v, arrow };
        if (seen.has(v)) {
          step({ [v]: v === u ? "current" : "compared", [edge]: "compared" }, "check", ["widget.graph.dfs.old", p]);
          continue;
        }
        const unseen = graph.vertices.filter((w) => !seen.has(w));
        em[edge] = "visited";
        parent[v] = u;
        vm[u] = "visited";
        step({ [edge]: "current", [v]: "compared" }, "down", ["widget.graph.dfs.down", p], {
          predict: unseen.length > 1 ? { ask: ["widget.graph.predict.next", { u }], ...choices(graph, v, unseen) } : undefined,
        });
        visit(v);
        vm[u] = "current";
        step({}, "back", ["widget.graph.dfs.back", { u, v }]);
      }
      stack.pop();
      vm[u] = "done";
      step({}, "end", ["widget.graph.dfs.end", { u }]);
    };
    visit(source);
    const lost = graph.vertices.filter((v) => !seen.has(v));
    finish(order, [lost.length ? "widget.graph.dfs.summaryLost" : "widget.graph.dfs.summary", { list: order.join(" "), lost: lost.join(", ") }]);
    return { order, parent };
  }

  // components: edges both ways, one BFS per component.
  const both = graph.directed ? model({ vertices: graph.vertices, edges: graph.edges }, false) : graph;
  const comp = Object.fromEntries(graph.vertices.map((v) => [v, null]));
  const groups = [];
  const queue = [];
  state = { comp, notes };
  aux = { queue };
  let k = 0;
  for (const s of graph.vertices) {
    if (comp[s] !== null) continue;
    k += 1;
    const free = graph.vertices.filter((v) => comp[v] === null);
    comp[s] = k;
    notes[s] = String(k);
    queue.push(s);
    vm[s] = "visited";
    const group = [s];
    step({}, "new", ["widget.graph.components.new", { s, k }], {
      predict: k > 1 && free.length > 1 ? { ask: ["widget.graph.predict.component", { k }], ...choices(graph, s, free) } : undefined,
    });
    while (queue.length) {
      const u = queue.shift();
      vm[u] = "current";
      const found = [];
      const edges = {};
      for (const { to: v, edge } of both.adj[u]) {
        counter.edges += 1;
        edges[edge] = "compared";
        if (comp[v] !== null) continue;
        comp[v] = k;
        notes[v] = String(k);
        queue.push(v);
        vm[v] = "visited";
        em[edge] = "visited";
        edges[edge] = "current";
        found.push(v);
        group.push(v);
      }
      step(edges, "visit", found.length ? ["widget.graph.components.found", { u, list: found.join(", "), k }] : ["widget.graph.components.none", { u }]);
      vm[u] = "visited";
    }
    for (const v of group) vm[v] = "done";
    for (const id of Object.keys(em)) em[id] = "done";
    groups.push(group);
    step({}, "close", ["widget.graph.components.close", { k, list: group.join(", ") }]);
  }
  finish(graph.vertices, [
    k === 1 ? "widget.graph.components.one" : "widget.graph.components.end",
    { k, list: groups.map((group) => `{${group.join(", ")}}`).join(" ") },
  ]);
  return { comp, count: k };
}
