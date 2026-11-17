/**
 * <uc-widget-heap> against a reference (docs/plan/widgets-api.md 18.3): on
 * 200 random scripts and the edge cases, the heap property holds after every
 * operation (max and min), extract / peek answers equal a sorted-array model,
 * heapify gives a heap with the same values and heapsort equals the sorted copy.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { collect, random } from "../../widgets/src/core/engine.js";
import { run, isHeap, MAX_ITEMS } from "../../widgets/src/heap/algorithm.js";

const sorted = (a, kind) => a.slice().sort((x, y) => (kind === "max" ? y - x : x - y));
const op = (verb, v) => ({ verb, args: v === undefined ? [] : [String(v)] });

/** Runs the script one operation more each time, so the heap is checked after every operation. */
function check(values, ops, kind) {
  const model = values.slice();
  const answers = [];
  for (let k = 0; k <= ops.length; k += 1) {
    const { steps, result } = collect(run, { values, ops: ops.slice(0, k), kind }, { algorithm: "operations" });
    const last = steps[steps.length - 1].state;
    assert.ok(isHeap(last.a, last.n, kind), `heap after ${k} operations`);
    assert.deepEqual(sorted(result.heap, kind), sorted(model, kind), "same values as the model");
    assert.deepEqual(result.answers, answers);
    if (k === ops.length) break;
    const { verb, args } = ops[k];
    if (verb === "insert") {
      model.push(Number(args[0]));
      answers.push(Number(args[0]));
    } else {
      const top = model.length ? sorted(model, kind)[0] : null;
      answers.push(top);
      if (verb === "extract" && model.length) model.splice(model.indexOf(top), 1);
    }
  }
}

test("heap operations: edge cases", () => {
  for (const kind of ["max", "min"]) {
    check([], [op("extract"), op("peek"), op("insert", 3), op("extract"), op("extract")], kind);
    check([5], [op("insert", 5), op("insert", 5), op("extract"), op("peek")], kind);
    check([1, 2, 3, 4, 5, 6, 7], [op("extract"), op("extract"), op("insert", 0), op("insert", 9)], kind);
    check([7, 6, 5, 4, 3, 2, 1], [op("extract"), op("insert", 8)], kind);
  }
});

test("heap operations: 200 random scripts", () => {
  const rng = random(2026);
  for (let i = 0; i < 200; i += 1) {
    const kind = rng.pick(["max", "min"]);
    const values = Array.from({ length: rng.int(0, 8) }, () => rng.int(-5, 30));
    const ops = Array.from({ length: rng.int(0, 7) }, () => {
      const verb = rng.pick(["insert", "insert", "extract", "peek"]);
      return op(verb, verb === "insert" ? rng.int(-5, 30) : undefined);
    });
    if (values.length + ops.length > MAX_ITEMS) continue;
    check(values, ops, kind);
  }
});

test("heap: inserting each value (no ops) builds a heap", () => {
  const { steps, result } = collect(run, { values: [4, 9, 2, 7, 5], ops: null, kind: "max" }, { algorithm: "operations" });
  assert.ok(isHeap(result.heap, result.heap.length, "max"));
  assert.deepEqual(result.answers, [4, 9, 2, 7, 5]);
  assert.deepEqual(steps[0].state.a, []);
});

test("heapify and heapsort: 200 random arrays and the edge cases", () => {
  const rng = random(7);
  const inputs = [[], [1], [3, 3, 3], [1, 2, 3, 4, 5], [5, 4, 3, 2, 1]];
  for (let i = 0; i < 200; i += 1) inputs.push(Array.from({ length: rng.int(0, MAX_ITEMS) }, () => rng.int(-20, 99)));
  for (const values of inputs) {
    for (const kind of ["max", "min"]) {
      const heap = collect(run, { values, ops: null, kind }, { algorithm: "heapify" }).result;
      assert.ok(isHeap(heap, heap.length, kind), "heapify gives a heap");
      assert.deepEqual(heap.slice().sort((a, b) => a - b), values.slice().sort((a, b) => a - b));
      const { steps, result } = collect(run, { values, ops: null, kind }, { algorithm: "heapsort" });
      const expected = values.slice().sort((a, b) => a - b);
      assert.deepEqual(result, kind === "max" ? expected : expected.slice().reverse());
      for (const step of steps) assert.deepEqual(step.state.a.slice().sort((a, b) => a - b), expected.slice().sort((a, b) => a - b), "the values are kept in every step");
      assert.ok(Object.values(steps[steps.length - 1].marks).every((state) => state === "done"));
    }
  }
});
