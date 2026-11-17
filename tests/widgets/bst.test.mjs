/**
 * <uc-widget-bst> against a reference (docs/architecture/widgets-api.md 18.3): on
 * 200 random operation scripts and the edge cases, the in-order of the tree
 * is sorted after every step, the final contents equal a Set model, search /
 * min / max answers match the model; the four traversals equal reference
 * traversals, and the last step marks every node done.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { collect, random } from "../../widgets/src/core/engine.js";
import { run, inorder, insertQuiet, MAX_NODES } from "../../widgets/src/bst/algorithm.js";

const isSorted = (a) => a.every((v, i) => i === 0 || a[i - 1] < v);

function model(values, ops) {
  const set = new Set(values);
  const answers = [];
  for (const { verb, args } of ops) {
    const v = Number(args[0]);
    if (verb === "insert") answers.push(!set.has(v) && (set.add(v), true));
    if (verb === "remove") answers.push(set.delete(v));
    if (verb === "search") answers.push(set.has(v));
    if (verb === "min") answers.push(set.size ? Math.min(...set) : null);
    if (verb === "max") answers.push(set.size ? Math.max(...set) : null);
  }
  return { inorder: [...set].sort((a, b) => a - b), answers };
}

function check(values, ops) {
  const { steps, result } = collect(run, { values, ops }, { algorithm: "operations" });
  for (const step of steps) assert.ok(isSorted(inorder(step.state.root)), `in-order sorted at ${step.say[0]}`);
  assert.deepEqual(result, model(ops === null ? [] : values, ops ?? values.map((v) => ({ verb: "insert", args: [String(v)] }))));
}

test("bst operations: edge cases", () => {
  check([], null);
  check([], [{ verb: "min", args: [] }, { verb: "remove", args: ["3"] }, { verb: "search", args: ["3"] }]);
  check([7], [{ verb: "remove", args: ["7"] }, { verb: "max", args: [] }]);
  check([5, 5, 5], null);
  check([1, 2, 3, 4, 5], [{ verb: "remove", args: ["1"] }, { verb: "remove", args: ["5"] }, { verb: "remove", args: ["3"] }]);
  check([50, 30, 70, 20, 40, 60, 80], [{ verb: "remove", args: ["50"] }, { verb: "remove", args: ["60"] }, { verb: "remove", args: ["70"] }]);
});

test("bst operations: 200 random scripts", () => {
  const rng = random(2026);
  const verbs = ["insert", "insert", "remove", "search", "min", "max"];
  for (let i = 0; i < 200; i += 1) {
    const values = [...new Set(Array.from({ length: rng.int(0, 8) }, () => rng.int(1, 30)))];
    const ops = Array.from({ length: rng.int(0, 10) }, () => {
      const verb = rng.pick(verbs);
      return { verb, args: verb === "min" || verb === "max" ? [] : [String(rng.int(1, 30))] };
    });
    if (new Set([...values, ...ops.filter((o) => o.verb === "insert").map((o) => Number(o.args[0]))]).size > MAX_NODES) continue;
    check(values, rng.int(0, 4) ? ops : null);
  }
});

function reference(root, order) {
  const out = [];
  if (order === "levelorder") {
    const queue = root ? [root] : [];
    while (queue.length) {
      const node = queue.shift();
      out.push(node.v);
      queue.push(...[node.l, node.r].filter(Boolean));
    }
    return out;
  }
  (function visit(node) {
    if (!node) return;
    if (order === "preorder") out.push(node.v);
    visit(node.l);
    if (order === "inorder") out.push(node.v);
    visit(node.r);
    if (order === "postorder") out.push(node.v);
  })(root);
  return out;
}

for (const order of ["preorder", "inorder", "postorder", "levelorder"]) {
  test(`bst ${order}: 200 random trees`, () => {
    const rng = random(7);
    for (let i = 0; i < 200; i += 1) {
      const values = Array.from({ length: rng.int(0, 15) }, () => rng.int(1, 99));
      let root = null;
      for (const v of values) root = insertQuiet(root, v);
      const { steps, result } = collect(run, { values, ops: null }, { algorithm: order });
      assert.deepEqual(result, reference(root, order));
      assert.deepEqual(steps.at(-1).aux.output, result);
      assert.equal(Object.values(steps.at(-1).marks).filter((m) => m === "done").length, result.length, "every node done at the end");
    }
  });
}

test("bst refuses more than 15 nodes and bad arguments", () => {
  const many = Array.from({ length: 16 }, (_, i) => i);
  assert.throws(() => collect(run, { values: many, ops: null }, {}), (error) => error.key === "widget.core.error.tooLarge");
  assert.throws(() => collect(run, { values: [], ops: [{ verb: "insert", args: [] }] }, {}), (error) => error.key === "widget.bst.error.arg");
});
