/**
 * <uc-widget-union-find> against references (docs/plan/widgets-api.md
 * 18.3): on 200 random operation scripts per variant, the answers of find
 * and connected and the final sets equal a naive labelling; after every
 * step the parent array is a forest whose roots carry their set's size;
 * union by size keeps every tree at most log2(n) tall; path compression
 * leaves every node of a find path pointing at the root.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { collect, random } from "../../widgets/src/core/engine.js";
import { run, rootOf, height, defaultOps, ALGORITHMS } from "../../widgets/src/union-find/algorithm.js";

/** Labels: label[i] = the set of i; union relabels. */
function reference(n, ops) {
  const label = Array.from({ length: n }, (_, i) => i);
  const answers = [];
  for (const { verb, args } of ops) {
    const [a, b] = args.map(Number);
    if (verb === "union") {
      const from = label[a];
      for (let i = 0; i < n; i += 1) if (label[i] === from) label[i] = label[b];
    } else if (verb === "connected") answers.push(label[a] === label[b]);
    else answers.push(label[a]);
  }
  return { label, answers };
}

function check(n, ops, algorithm) {
  const { steps, result } = collect(run, { n, ops }, { algorithm });
  const ref = reference(n, ops ?? defaultOps(n));
  const script = ops ?? defaultOps(n);
  let k = 0;
  script.forEach((op, i) => {
    if (op.verb === "union") return;
    const answer = result.answers[k];
    if (op.verb === "connected") assert.equal(answer, ref.answers[k], `connected ${op.args}`);
    else {
      // find(a) is a's root at that moment: the root after running the script up to it.
      const before = collect(run, { n, ops: script.slice(0, i + 1) }, { algorithm }).result.parent;
      assert.equal(answer, rootOf(before, Number(op.args[0])), `find ${op.args}`);
    }
    k += 1;
  });
  // Same partition as the labelling.
  for (let i = 0; i < n; i += 1) {
    for (let j = 0; j < n; j += 1) {
      assert.equal(rootOf(result.parent, i) === rootOf(result.parent, j), ref.label[i] === ref.label[j], `${i} ~ ${j}`);
    }
  }
  for (const step of steps) {
    const { parent, size } = step.state;
    const count = {};
    parent.forEach((_, i) => (count[rootOf(parent, i)] = (count[rootOf(parent, i)] || 0) + 1));
    if (algorithm !== "naive") {
      for (const [r, c] of Object.entries(count)) assert.equal(size[r], c, "a root holds its set's size");
      assert.ok(height(parent) <= Math.floor(Math.log2(n)), "union by size: height ≤ log2 n");
    }
    assert.equal(step.aux.sets, Object.keys(count).length, "aux sets");
  }
  assert.deepEqual(steps.at(-1).state.parent, result.parent, "the last step holds the result");
  return steps;
}

function randomOps(rng, n, count) {
  return Array.from({ length: count }, () => {
    const verb = rng.pick(["union", "union", "find", "connected"]);
    const arg = () => String(rng.int(0, n - 1));
    return { verb, args: verb === "find" ? [arg()] : [arg(), arg()] };
  });
}

test("union-find: edge cases", () => {
  for (const algorithm of ALGORITHMS) {
    check(1, null, algorithm);
    check(1, [{ verb: "union", args: ["0", "0"] }, { verb: "find", args: ["0"] }, { verb: "connected", args: ["0", "0"] }], algorithm);
    check(16, null, algorithm);
    check(5, [], algorithm);
    const chain = Array.from({ length: 7 }, (_, i) => ({ verb: "union", args: [String(i), String(i + 1)] }));
    check(8, [...chain, { verb: "find", args: ["0"] }, { verb: "find", args: ["0"] }], algorithm);
  }
  assert.throws(() => collect(run, { n: 4, ops: [{ verb: "union", args: ["1"] }] }, {}), { name: "InputError", key: "widget.union-find.error.arg" });
  assert.throws(() => collect(run, { n: 4, ops: [{ verb: "find", args: ["4"] }] }, {}), { name: "InputError", key: "widget.union-find.error.arg" });
  assert.throws(() => collect(run, { n: 17, ops: null }, {}), { name: "InputError", key: "widget.union-find.error.n" });
});

test("union-find: naive unions of a chain make a tall tree, union by size does not", () => {
  const chain = Array.from({ length: 7 }, (_, i) => ({ verb: "union", args: [String(i), String(i + 1)] }));
  const naive = collect(run, { n: 8, ops: chain }, { algorithm: "naive" }).result.parent;
  const sized = collect(run, { n: 8, ops: chain }, { algorithm: "size" }).result.parent;
  assert.equal(height(naive), 7);
  assert.equal(height(sized), 1);
});

test("union-find: path compression points the find path at the root", () => {
  const ops = [
    ...Array.from({ length: 5 }, (_, i) => ({ verb: "union", args: [String(i), String(i + 1)] })),
    { verb: "find", args: ["0"] },
  ];
  const { steps } = collect(run, { n: 6, ops }, { algorithm: "compression" });
  const after = steps.at(-1).state.parent;
  for (let i = 0; i < 6; i += 1) assert.ok(after[i] === rootOf(after, i), `${i} points at the root`);
});

test("union-find: 200 random scripts per variant", () => {
  const rng = random(2028);
  for (const algorithm of ALGORITHMS) {
    for (let i = 0; i < 200; i += 1) {
      const n = rng.int(1, 16);
      check(n, randomOps(rng, n, rng.int(0, 14)), algorithm);
    }
  }
});
