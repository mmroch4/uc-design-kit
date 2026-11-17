/**
 * <uc-widget-mst> against references (docs/architecture/widgets-api.md 18.3): on
 * 200 random weighted undirected graphs (some disconnected, with loops and
 * parallel edges), Kruskal and Prim give the same total weight as an
 * independent eager Prim on a weight matrix (and as brute force over edge
 * subsets on small graphs), with |V| − c edges that close no cycle.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { collect, random } from "../../widgets/src/core/engine.js";
import { input as fromText } from "../../widgets/src/mst/fixture.js";
import { run, ALGORITHMS } from "../../widgets/src/mst/algorithm.js";
import { randomGraph } from "./graphs.mjs";

function sets(vertices) {
  const parent = Object.fromEntries(vertices.map((v) => [v, v]));
  const find = (v) => (parent[v] === v ? v : (parent[v] = find(parent[v])));
  return { find, union: (a, b) => (find(a) === find(b) ? false : ((parent[find(a)] = find(b)), true)) };
}

function components(g) {
  const { find, union } = sets(g.vertices);
  for (const e of g.edges) union(e.from, e.to);
  return g.vertices.filter((v) => find(v) === v).length;
}

/** Eager Prim, O(V²) on a weight matrix, restarted in each component: the forest's weight. */
function reference(g) {
  const w = {};
  for (const e of g.edges) {
    if (e.from === e.to) continue;
    for (const [a, b] of [[e.from, e.to], [e.to, e.from]]) w[`${a}\n${b}`] = Math.min(w[`${a}\n${b}`] ?? Infinity, e.weight);
  }
  const done = new Set();
  let total = 0;
  for (const s of g.vertices) {
    if (done.has(s)) continue;
    const key = Object.fromEntries(g.vertices.map((v) => [v, Infinity]));
    key[s] = 0;
    for (;;) {
      const u = g.vertices.filter((v) => !done.has(v) && key[v] < Infinity).sort((a, b) => key[a] - key[b])[0];
      if (u === undefined) break;
      done.add(u);
      total += key[u];
      for (const v of g.vertices) if (!done.has(v) && (w[`${u}\n${v}`] ?? Infinity) < key[v]) key[v] = w[`${u}\n${v}`];
    }
  }
  return total;
}

/** Brute force: the lightest set of |V| − c edges with no cycle. */
function bruteForce(g) {
  const k = g.vertices.length - components(g);
  let best = Infinity;
  const pick = (i, chosen, weight) => {
    if (chosen.length === k) {
      const { union } = sets(g.vertices);
      if (chosen.every((e) => union(e.from, e.to))) best = Math.min(best, weight);
      return;
    }
    if (i === g.edges.length || g.edges.length - i < k - chosen.length) return;
    pick(i + 1, [...chosen, g.edges[i]], weight + g.edges[i].weight);
    pick(i + 1, chosen, weight);
  };
  pick(0, [], 0);
  return best;
}

function check(g, source = g.vertices[0]) {
  const want = reference(g);
  if (g.edges.length <= 12) assert.equal(bruteForce(g), want, "the references agree");
  const k = g.vertices.length - components(g);
  for (const algorithm of ALGORITHMS) {
    const { steps, result } = collect(run, { graph: g, source }, { algorithm });
    assert.equal(result.weight, want, `${algorithm}: total weight`);
    assert.equal(result.edges.length, k, `${algorithm}: |V| − c edges`);
    const byId = Object.fromEntries(g.edges.map((e) => [e.id, e]));
    const { union } = sets(g.vertices);
    for (const id of result.edges) assert.ok(byId[id] && union(byId[id].from, byId[id].to), `${algorithm}: ${id} closes no cycle`);
    assert.equal(result.edges.reduce((sum, id) => sum + byId[id].weight, 0), result.weight, `${algorithm}: weight of the edges`);
    const last = steps.at(-1);
    assert.deepEqual(last.state.tree, result.edges, `${algorithm}: the last step holds the tree`);
    for (const id of result.edges) assert.equal(last.marks[id], "done");
    if (algorithm === "prim") {
      for (const step of steps) assert.deepEqual(step.aux.pq, step.aux.pq.slice().sort((a, b) => a.split(" ")[1] - b.split(" ")[1]), "queue smallest first");
    }
  }
}

test("mst: edge cases", () => {
  const cases = [
    "A", // one vertex
    "A\nB\nC", // no edges
    "A B 3", // one edge
    "A B 1\nC D 2\nE", // disconnected: a forest
    "A B 1\nB C 1\nA C 1\nC D 1", // equal weights
    "A B 5\nA B 2\nB A 3", // parallel edges
    "A A 1\nA B 4\nB B 0", // loops
    "A B -2\nB C 3\nA C -1", // negative weights
    "A B\nB C\nC A\nC D", // unweighted: weight 1
    "A B 4\nA C 1\nB C 2\nB D 5\nC D 8\nD E 3\nC E 9", // the docs' example
  ];
  for (const text of cases) {
    const { graph, source } = fromText({ text });
    check(graph, source);
  }
});

test("mst: Prim starts at the source attribute", () => {
  const { graph, source } = fromText({ text: "A B 1\nB C 2\nC D 3", source: "C" });
  const { steps } = collect(run, { graph, source }, { algorithm: "prim" });
  assert.equal(steps[1].marks.C, "current");
});

test("mst: a directed graph is an input error", () => {
  const { graph, source } = fromText({ text: "A B 1", directed: true });
  for (const algorithm of ALGORITHMS) assert.throws(() => collect(run, { graph, source }, { algorithm }), { name: "InputError", key: "widget.mst.error.directed" });
});

test("mst: 200 random graphs", () => {
  const rng = random(2031);
  for (let i = 0; i < 200; i += 1) {
    const g = randomGraph(rng, { weights: i % 3 ? [1, 9] : [-3, 3], directed: false });
    check(g, rng.pick(g.vertices));
  }
});
