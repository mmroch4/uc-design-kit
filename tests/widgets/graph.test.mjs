/**
 * <uc-widget-graph> against references (docs/architecture/widgets-api.md 18.3): on
 * 200 random graphs (directed and not) and the edge cases, BFS distances
 * equal a reference BFS, DFS visits each reachable vertex once in the order
 * of a reference recursive DFS along tree edges, and the components equal a
 * naive labelling. Also UC.widgets.parse.graph on real inputs (5.3) and the
 * automatic layout of svg.graph.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { collect, random } from "../../widgets/src/core/engine.js";
import { graph as parseGraph } from "../../widgets/src/core/parse.js";
import { input as fromText } from "../../widgets/src/graph/fixture.js";
import { run } from "../../widgets/src/graph/algorithm.js";
import { layout } from "../../widgets/src/core/svg/graph.js";
import { randomGraph } from "./graphs.mjs";

const neighbours = (g, v) => g.adj[v].map((a) => a.to);

function referenceBfs(g, s) {
  const dist = Object.fromEntries(g.vertices.map((v) => [v, null]));
  dist[s] = 0;
  const queue = [s];
  while (queue.length) {
    const u = queue.shift();
    for (const v of neighbours(g, u)) if (dist[v] === null) queue.push(v), (dist[v] = dist[u] + 1);
  }
  return dist;
}

function referenceDfs(g, s) {
  const order = [];
  const visit = (u) => {
    order.push(u);
    for (const v of neighbours(g, u)) if (!order.includes(v)) visit(v);
  };
  visit(s);
  return order;
}

function referenceComponents(g) {
  const label = Object.fromEntries(g.vertices.map((v) => [v, null]));
  let k = 0;
  for (const s of g.vertices) {
    if (label[s] !== null) continue;
    k += 1;
    label[s] = k;
    let changed = true;
    while (changed) {
      changed = false;
      for (const e of g.edges) {
        for (const [a, b] of [[e.from, e.to], [e.to, e.from]]) {
          if (label[a] === k && label[b] === null) (label[b] = k), (changed = true);
        }
      }
    }
  }
  return { label, k };
}

function check(g, s) {
  const bfs = collect(run, { graph: g, source: s }, { algorithm: "bfs" });
  assert.deepEqual(bfs.result.dist, referenceBfs(g, s), "BFS distances");
  for (const [v, p] of Object.entries(bfs.result.parent)) assert.equal(bfs.result.dist[v], bfs.result.dist[p] + 1, "BFS tree edge");
  assert.deepEqual(bfs.steps.at(-1).state.dist, bfs.result.dist, "the last step holds the result");

  const dfs = collect(run, { graph: g, source: s }, { algorithm: "dfs" });
  assert.deepEqual(dfs.result.order, referenceDfs(g, s), "DFS order");
  assert.equal(new Set(dfs.result.order).size, dfs.result.order.length, "each vertex visited once");
  for (const [v, p] of Object.entries(dfs.result.parent)) assert.ok(neighbours(g, p).includes(v), "DFS tree edge is an edge");

  const comp = collect(run, { graph: g, source: s }, { algorithm: "components" });
  const ref = referenceComponents(g);
  assert.equal(comp.result.count, ref.k, "number of components");
  assert.deepEqual(comp.result.comp, ref.label, "component of each vertex");
}

test("graph: edge cases", () => {
  const cases = [
    ["A", false],
    ["A A", false],
    ["A B\nB A\nA B", true],
    ["A B\nC D\nE", false],
    ["A B\nB C\nC A\nC D\nE", true],
    ["D A\nC A\nB A", true], // nothing reachable from D's neighbours back
  ];
  for (const [text, directed] of cases) {
    const { graph, source } = fromText({ text, directed });
    check(graph, source);
  }
});

test("graph: 200 random graphs", () => {
  const rng = random(2026);
  for (let i = 0; i < 200; i += 1) {
    const g = randomGraph(rng);
    check(g, rng.pick(g.vertices));
  }
});

test("parse.graph reads the inputs of the docs", () => {
  const g = parseGraph("A B 4\nA C 1\nC B 2      # comments start with #\nB D 5\nE          # an isolated vertex\nA @ 0,0    # optional position\n");
  assert.deepEqual(g.vertices, ["A", "B", "C", "D", "E"]);
  assert.equal(g.edges.length, 4);
  assert.equal(g.weighted, true);
  assert.deepEqual(g.positions, { A: [0, 0] });
  assert.throws(() => parseGraph("A B 4\nB C"), { name: "InputError", key: "widget.core.error.weight" });
  assert.throws(() => parseGraph("A B x"), { name: "InputError", key: "widget.core.error.line" });
  assert.throws(() => parseGraph("A B C D"), { name: "InputError", key: "widget.core.error.line" });
  assert.throws(() => parseGraph(Array.from({ length: 11 }, (_, i) => `v${i}`).join("\n")), { key: "widget.core.error.tooLarge" });
  assert.throws(() => parseGraph(Array.from({ length: 21 }, (_, i) => `A B${i % 5}`).join("\n")), { key: "widget.core.error.tooLarge" });
});

test("model: repeated edges get their own ids; neighbours in input order", () => {
  const g = fromText({ text: "C A\nA B\nA B\nB A" }).graph;
  assert.deepEqual(g.edges.map((e) => e.id), ["C-A", "A-B", "A-B'2", "B-A"]);
  assert.deepEqual(neighbours(g, "A"), ["C", "B", "B", "B"]);
  assert.throws(() => fromText({ text: "A B", source: "Z" }), { key: "widget.graph.error.source" });
});

test("svg.graph layout: deterministic, every vertex apart, written positions kept", () => {
  const rng = random(7);
  for (let i = 0; i < 60; i += 1) {
    const g = randomGraph(rng);
    const a = layout(g.vertices, g.edges, {});
    assert.deepEqual(layout(g.vertices, g.edges, {}), a, "same layout twice");
    for (let x = 0; x < g.vertices.length; x += 1) {
      for (let y = x + 1; y < g.vertices.length; y += 1) {
        const [p, q] = [a[g.vertices[x]], a[g.vertices[y]]];
        assert.ok(Math.hypot(p[0] - q[0], p[1] - q[1]) > 0.3, "vertices apart");
      }
    }
  }
  const at = layout(["A", "B", "C"], [{ from: "A", to: "B" }], { A: [0, 0], B: [2, 0], C: [1, 2] });
  assert.deepEqual(at, { A: [0, 0], B: [2, 0], C: [1, 2] });
  const some = layout(["A", "B", "C"], [{ from: "A", to: "B" }, { from: "B", to: "C" }], { A: [0, 0] });
  assert.deepEqual(some.A, [0, 0], "a written position stays");
});
