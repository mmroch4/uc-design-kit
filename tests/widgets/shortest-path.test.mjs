/**
 * <uc-widget-shortest-path> against references (docs/plan/widgets-api.md
 * 18.3): on 200 random weighted graphs, Dijkstra's distances (non-negative
 * weights) equal Bellman-Ford's and a Floyd-Warshall reference; with
 * negative weights, Bellman-Ford reports a negative cycle exactly when one is
 * reachable from the source, and otherwise matches the reference.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { collect, random } from "../../widgets/src/core/engine.js";
import { input as fromText } from "../../widgets/src/shortest-path/fixture.js";
import { run } from "../../widgets/src/shortest-path/algorithm.js";
import { randomGraph } from "./graphs.mjs";

/** Floyd-Warshall: { dist from s (null = unreachable), cycle: a negative cycle reachable from s }. */
function reference(g, s) {
  const V = g.vertices;
  const d = Object.fromEntries(V.map((u) => [u, Object.fromEntries(V.map((v) => [v, u === v ? 0 : Infinity]))]));
  for (const e of g.edges) {
    for (const [u, v] of g.directed ? [[e.from, e.to]] : [[e.from, e.to], [e.to, e.from]]) d[u][v] = Math.min(d[u][v], e.weight);
  }
  for (const k of V) for (const i of V) for (const j of V) if (d[i][k] + d[k][j] < d[i][j]) d[i][j] = d[i][k] + d[k][j];
  const cycle = V.some((v) => d[s][v] < Infinity && d[v][v] < 0);
  return { dist: Object.fromEntries(V.map((v) => [v, d[s][v] === Infinity ? null : d[s][v]])), cycle };
}

function check(g, s) {
  const ref = reference(g, s);
  const bf = collect(run, { graph: g, source: s }, { algorithm: "bellman-ford" });
  assert.equal(bf.result.negativeCycle, ref.cycle, "negative cycle reported iff it exists");
  if (!ref.cycle) {
    assert.deepEqual(bf.result.dist, ref.dist, "Bellman-Ford distances");
    for (const [v, p] of Object.entries(bf.result.parent)) assert.ok(p !== undefined && bf.result.dist[p] !== null, `parent of ${v}`);
  }
  if (g.edges.every((e) => e.weight >= 0)) {
    const dj = collect(run, { graph: g, source: s }, { algorithm: "dijkstra" });
    assert.deepEqual(dj.result.dist, bf.result.dist, "Dijkstra = Bellman-Ford");
    assert.deepEqual(dj.steps.at(-1).state.dist, dj.result.dist, "the last step holds the result");
    for (const step of dj.steps) assert.deepEqual(step.aux.pq, step.aux.pq.slice().sort((a, b) => a.split(":")[1] - b.split(":")[1]), "queue shown smallest first");
  } else {
    assert.throws(() => collect(run, { graph: g, source: s }, { algorithm: "dijkstra" }), { name: "InputError", key: "widget.shortest-path.error.negative" });
  }
}

test("shortest-path: edge cases", () => {
  const cases = [
    ["A", false],
    ["A B 0\nB C 0", false],
    ["A B 4\nA C 1\nC B 2\nB D 5\nE", true], // the docs' example, an unreachable vertex
    ["A B 4\nA C 5\nC B -3\nB D 2", true], // a negative edge, no cycle
    ["A B 1\nB C -2\nC B 1", true], // a negative cycle
    ["A B 1\nC D -5\nD C 1", true], // a negative cycle that A cannot reach
    ["A B -1", false], // undirected negative edge: a cycle A–B–A
    ["A B\nB C\nA C", false], // unweighted: weight 1
    ["A A 3\nA B 2\nA B 1", true], // a loop and parallel arcs
  ];
  for (const [text, directed] of cases) {
    const { graph, source } = fromText({ text, directed });
    check(graph, source);
  }
});

test("shortest-path: 200 random graphs, non-negative and negative weights", () => {
  const rng = random(2027);
  for (let i = 0; i < 200; i += 1) {
    const g = randomGraph(rng, { weights: i % 2 ? [0, 9] : [-3, 9] });
    check(g, rng.pick(g.vertices));
  }
});
