/**
 * <uc-widget-toposort> against references (docs/plan/widgets-api.md 18.3):
 * for Kahn and DFS, on 200 random DAGs (arcs that follow a random order) and
 * 200 random digraphs, a cycle is reported iff one exists (reference:
 * reachability by Floyd-Warshall); the reported cycle is a real cycle; with
 * no cycle the output is a permutation of the vertices that respects every
 * arc.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { collect, random } from "../../widgets/src/core/engine.js";
import { input as fromText } from "../../widgets/src/toposort/fixture.js";
import { run, ALGORITHMS } from "../../widgets/src/toposort/algorithm.js";
import { model } from "../../widgets/src/graph/model.js";
import { randomGraph } from "./graphs.mjs";

/** True when some vertex reaches itself by one or more arcs. */
function hasCycle(g) {
  const reach = Object.fromEntries(g.vertices.map((u) => [u, Object.fromEntries(g.vertices.map((v) => [v, false]))]));
  for (const e of g.edges) reach[e.from][e.to] = true;
  for (const k of g.vertices) for (const i of g.vertices) for (const j of g.vertices) if (reach[i][k] && reach[k][j]) reach[i][j] = true;
  return g.vertices.some((v) => reach[v][v]);
}

function check(g) {
  const cyclic = hasCycle(g);
  for (const algorithm of ALGORITHMS) {
    const { steps, result } = collect(run, { graph: g }, { algorithm });
    assert.equal(result.cycle !== null, cyclic, `${algorithm}: a cycle is reported iff it exists`);
    if (cyclic) {
      const c = result.cycle;
      assert.ok(c.length >= 1 && new Set(c).size === c.length, `${algorithm}: cycle without repeats`);
      c.forEach((v, i) => assert.ok(g.edges.some((e) => e.from === v && e.to === c[(i + 1) % c.length]), `${algorithm}: arc ${v} → ${c[(i + 1) % c.length]}`));
      for (const v of c) assert.equal(steps.at(-1).marks[v], "current", `${algorithm}: cycle marked`);
    } else {
      assert.deepEqual(result.order.slice().sort(), g.vertices.slice().sort(), `${algorithm}: a permutation`);
      const at = Object.fromEntries(result.order.map((v, i) => [v, i]));
      for (const e of g.edges) assert.ok(at[e.from] < at[e.to], `${algorithm}: ${e.from} → ${e.to} respected`);
      assert.deepEqual(steps.at(-1).state.order, result.order, `${algorithm}: the last step holds the order`);
      assert.deepEqual(steps.at(-1).aux.output, result.order);
    }
  }
}

/** A random DAG: arcs go forward in a shuffled order of the vertices. */
function randomDag(rng) {
  const g = randomGraph(rng, { directed: true });
  const rank = Object.fromEntries(rng.shuffle(g.vertices.slice()).map((v, i) => [v, i]));
  const edges = g.edges
    .filter((e) => e.from !== e.to)
    .map((e) => (rank[e.from] < rank[e.to] ? { from: e.from, to: e.to, weight: null } : { from: e.to, to: e.from, weight: null }));
  return model({ vertices: g.vertices, edges, positions: {}, weighted: false }, true);
}

test("toposort: edge cases", () => {
  const cases = [
    "A", // one vertex
    "A\nB\nC", // no arcs
    "A A", // a loop
    "A B\nB A", // a 2-cycle
    "A B\nA B\nB C", // parallel arcs
    "A B\nB C\nC D\nD B\nA E", // a cycle after a source
    "C A\nB A\nA D\nE", // isolated vertex, several sources
    "Prog1 Prog2\nProg1 EDados\nMD EDados\nProg2 POO\nEDados Algo\nPOO ES\nAlgo ES", // the docs' example
  ];
  for (const text of cases) check(fromText({ text }).graph);
});

test("toposort: the graph is always directed", () => {
  const { graph } = fromText({ text: "A B\nB A", directed: false });
  assert.equal(graph.directed, true);
});

test("toposort: 200 random DAGs and 200 random digraphs", () => {
  const rng = random(2033);
  for (let i = 0; i < 200; i += 1) {
    check(randomDag(rng));
    check(randomGraph(rng, { directed: true }));
  }
});
