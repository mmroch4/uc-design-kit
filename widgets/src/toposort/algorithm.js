/**
 * Topological sort of <uc-widget-toposort>, as step lists
 * (docs/architecture/widgets-api.md 6.4). Pure: no DOM, no UC, no Math.random.
 *
 * Input: { graph } as in the graph widget (../graph/model.js), always
 * directed (the widget builds the model with directed = true). Marks:
 * vertex names and edge ids. State: { notes, order }.
 *
 * - "kahn": in-degrees (the notes); a FIFO queue (aux `queue`) starts with
 *   the vertices of in-degree 0 in input order; each vertex that leaves it
 *   goes to the output (aux `output`) and removes its arcs. If vertices are
 *   left, they are in a cycle or after one: the steps name one such cycle,
 *   found by walking back along arcs between the vertices left.
 * - "dfs": recursive DFS from each unvisited vertex in input order; a vertex
 *   on the call stack (aux `stack`) is "visited", the one being explored
 *   "current"; a finished vertex is "done" and goes to the front of the
 *   order (aux `output`). An arc to a vertex on the stack closes a cycle:
 *   the arc is "swapped" and the run stops.
 *
 * Result: { order, cycle }: cycle is null or its vertices in arc order
 * (the last one has an arc to the first); order is partial when there is
 * a cycle.
 */
export const ALGORITHMS = ["kahn", "dfs"];
const K = "widget.toposort";
const COLOURS = ["new", "stack", "done"]; // a vertex not visited yet, on the call stack, finished

export function run({ graph }, { algorithm = "kahn" } = {}, emit) {
  if (!ALGORITHMS.includes(algorithm)) throw new Error(`unknown algorithm ${algorithm}`);
  const V = graph.vertices;
  const notes = Object.fromEntries(V.map((v) => [v, ""]));
  const order = [];
  const state = { notes, order };
  const vm = {};
  const em = {};
  const stats = { edges: 0 };
  const aux = algorithm === "kahn" ? { queue: [], output: order } : { stack: [], output: order };
  const step = (extra, line, say, more = {}) => emit({ state, marks: { ...vm, ...em, ...extra }, line, say, code: algorithm, stats, aux, ...more });
  const ring = (cycle) => [...cycle, cycle[0]].join(" → ");
  /** The last step with a cycle: its vertices and arcs current, the rest as they are. */
  const fail = (cycle, arcs, say, line, extra = {}, more = {}) => {
    for (const v of cycle) vm[v] = "current";
    for (const id of arcs) em[id] = "current";
    step(extra, line, say, more);
    return { order, cycle };
  };

  emit({ state, marks: {}, line: null, say: [`${K}.start.${algorithm}`, { n: V.length, m: graph.edges.length }], code: algorithm, stats, aux });

  if (algorithm === "kahn") {
    const indeg = Object.fromEntries(V.map((v) => [v, 0]));
    for (const e of graph.edges) indeg[e.to] += 1;
    for (const v of V) notes[v] = String(indeg[v]);
    const queue = aux.queue;
    for (const v of V.filter((x) => !indeg[x])) {
      queue.push(v);
      vm[v] = "visited";
    }
    step({}, "init", queue.length ? [`${K}.init`, { list: queue.join(", ") }] : [`${K}.initNone`, {}]);
    while (queue.length) {
      const u = queue.shift();
      order.push(u);
      vm[u] = "current";
      step({}, "pop", [`${K}.pop`, { u, list: order.join(" ") }]);
      for (const { to: v, edge } of graph.adj[u]) {
        stats.edges += 1;
        indeg[v] -= 1;
        notes[v] = String(indeg[v]);
        em[edge] = "visited";
        const zero = indeg[v] === 0;
        if (zero) {
          queue.push(v);
          vm[v] = "visited";
        }
        step({ [edge]: "current", [v]: zero ? "visited" : "swapped" }, zero ? "push" : "dec", [`${K}.${zero ? "push" : "dec"}`, { u, v, d: indeg[v] }], {
          predict: { ask: [`${K}.predict.zero`, { u, v }], options: [["widget.core.yes"], ["widget.core.no"]], answer: zero ? 0 : 1 },
        });
      }
      vm[u] = "done";
    }
    const left = V.filter((v) => indeg[v] > 0);
    if (left.length) {
      // Every vertex left has an arc from another vertex left: walk back until one repeats.
      const back = (v) => graph.edges.find((e) => e.to === v && indeg[e.from] > 0);
      const walk = [left[0]];
      while (!walk.slice(0, -1).includes(walk.at(-1))) walk.push(back(walk.at(-1)).from);
      const cycle = walk.slice(walk.indexOf(walk.at(-1)) + 1).reverse();
      for (const v of left) vm[v] = "compared";
      return fail(cycle, cycle.map((v, i) => graph.edges.find((e) => e.from === v && e.to === cycle[(i + 1) % cycle.length]).id), [`${K}.cycle`, { list: left.join(", "), ring: ring(cycle), order: order.join(" ") || "—" }], "cycle");
    }
  } else {
    const stack = aux.stack;
    const colour = Object.fromEntries(V.map((v) => [v, 0])); // 0 unvisited, 1 on the stack, 2 finished
    let found = null;
    /** Puts u on the stack with the step that says why (`first`: [extra marks, line, say, predict]). */
    const visit = (u, [extra, line, say, predict]) => {
      colour[u] = 1;
      stack.push(u);
      vm[u] = "current";
      step(extra, line, say, { predict });
      for (const { to: v, edge } of graph.adj[u]) {
        stats.edges += 1;
        const p = { u, v };
        const predict = { ask: [`${K}.predict.state`, p], options: COLOURS.map((c) => [`${K}.colour.${c}`]), answer: colour[v] };
        if (colour[v] === 1) {
          const cycle = stack.slice(stack.indexOf(v));
          const arcs = cycle.slice(0, -1).map((w, i) => graph.adj[w].find((a) => a.to === cycle[i + 1]).edge);
          found = fail(cycle, arcs, [`${K}.back`, { ...p, ring: ring(cycle) }], "back", { [edge]: "swapped" }, { predict });
          return true;
        }
        if (colour[v] === 2) {
          step({ [edge]: "compared", [v]: "compared" }, "arc", [`${K}.finished`, p], { predict });
          continue;
        }
        em[edge] = "visited";
        vm[u] = "visited";
        if (visit(v, [{ [edge]: "current" }, ["down", "enter"], [`${K}.down`, p], predict])) return true;
        vm[u] = "current";
      }
      colour[u] = 2;
      stack.pop();
      order.unshift(u);
      vm[u] = "done";
      step({}, "done", [`${K}.done`, { u, list: order.join(" ") }]);
      return false;
    };
    for (const s of V) {
      if (!colour[s] && visit(s, [{}, ["root", "enter"], [`${K}.root`, { u: s }]])) return found;
    }
  }

  const marks = {};
  for (const v of V) marks[v] = "done";
  for (const e of graph.edges) marks[e.id] = "done";
  emit({ state, marks, line: null, say: [`${K}.end`, { list: order.join(" ") || "—" }], code: algorithm, stats, aux });
  return { order, cycle: null };
}
