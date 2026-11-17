/**
 * <uc-widget-avl> against a reference (docs/architecture/widgets-api.md 18.3): on 200
 * random operation scripts and the edge cases (the four rotation cases, removals
 * that rotate more than once), after every operation the in-order is sorted,
 * every factor is in {-1, 0, 1}, every stored height is right, the contents
 * equal a Set model and search answers match it.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { collect, random } from "../../widgets/src/core/engine.js";
import { run, inorder, MAX_NODES } from "../../widgets/src/avl/algorithm.js";

const isSorted = (a) => a.every((v, i) => i === 0 || a[i - 1] < v);
const op = (verb, v) => ({ verb, args: [String(v)] });

/** Height of a subtree, checking every stored height and factor on the way. */
function balanced(node) {
  if (!node) return 0;
  const l = balanced(node.l);
  const r = balanced(node.r);
  assert.ok(Math.abs(l - r) <= 1, `factor of ${node.v} is ${l - r}`);
  assert.equal(node.h, 1 + Math.max(l, r), `height of ${node.v}`);
  return node.h;
}

function check(values, ops) {
  const script = ops ?? values.map((v) => op("insert", v));
  const set = new Set(ops === null ? [] : values);
  const answers = [];
  for (const { verb, args } of script) {
    const v = Number(args[0]);
    if (verb === "insert") answers.push(!set.has(v) && (set.add(v), true));
    if (verb === "remove") answers.push(set.delete(v));
    if (verb === "search") answers.push(set.has(v));
  }
  const { steps, result } = collect(run, { values, ops }, {});
  for (const step of steps) assert.ok(isSorted(inorder(step.state.root)), `in-order sorted at ${step.say[0]}`);
  // The tree is an AVL tree at the start of every operation and at the end.
  for (const step of steps) if (step.line === null) balanced(step.state.root);
  assert.deepEqual(result, { inorder: [...set].sort((a, b) => a - b), answers });
}

test("avl: the four cases and the edge cases", () => {
  check([], null);
  check([1, 2, 3], null); // RR
  check([3, 2, 1], null); // LL
  check([3, 1, 2], null); // LR
  check([1, 3, 2], null); // RL
  check([5, 5, 5], null);
  check([10, 20, 30, 25, 28, 5, 4], null);
  check([7], [op("remove", 7), op("search", 7), op("remove", 7)]);
  // A removal that rotates twice on the way up (Fibonacci tree).
  check([8, 5, 11, 3, 7, 10, 12, 2, 4, 6, 9, 1], [op("remove", 12), op("remove", 9)]);
  check([50, 30, 70, 20, 40, 60, 80, 10], [op("remove", 60), op("remove", 80), op("remove", 30), op("insert", 45)]);
});

test("avl: 200 random scripts", () => {
  const rng = random(2026);
  const verbs = ["insert", "insert", "remove", "search"];
  for (let i = 0; i < 200; i += 1) {
    const values = [...new Set(Array.from({ length: rng.int(0, 10) }, () => rng.int(1, 40)))];
    const ops = Array.from({ length: rng.int(0, 10) }, () => op(rng.pick(verbs), rng.int(1, 40)));
    if (new Set([...values, ...ops.filter((o) => o.verb === "insert").map((o) => Number(o.args[0]))]).size > MAX_NODES) continue;
    check(values, rng.int(0, 4) ? ops : null);
  }
});

test("avl: inserting 1..15 in order keeps the tree perfectly balanced", () => {
  const values = Array.from({ length: 15 }, (_, i) => i + 1);
  const { steps } = collect(run, { values, ops: null }, {});
  assert.equal(balanced(steps[steps.length - 1].state.root), 4);
});
