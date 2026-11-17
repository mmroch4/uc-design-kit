/**
 * <uc-widget-sort> against a reference (docs/architecture/widgets-api.md 18.3): for
 * every algorithm, 200 random inputs from a fixed seed and the classic edge
 * cases. The result and the last step equal a sorted copy; in every step the
 * array plus the values held aside are the input's values; counters never
 * decrease.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { collect, random } from "../../widgets/src/core/engine.js";
import { ALGORITHMS, COUNTING_RANGE, PIVOTS, run } from "../../widgets/src/sort/algorithm.js";

const sorted = (values) => values.slice().sort((a, b) => a - b);

/** The values of a step: the array without holes, plus x, the halves or the counts. */
function heldValues(step) {
  const values = step.state.a.filter((v) => v !== null);
  const aux = step.aux || {};
  if (typeof aux.x === "number") values.push(aux.x);
  for (const half of [aux.left, aux.right]) if (half) values.push(...half);
  for (const entry of aux.count || []) {
    if (step.state.a.some((v) => v === null)) {
      const [, v, c] = /^(-?\d+) ×(\d+)$/.exec(entry);
      for (let i = 0; i < Number(c); i += 1) values.push(Number(v));
    }
  }
  return sorted(values);
}

const EDGES = [[], [7], [3, 3, 3, 3], [2, 1, 2, 1, 2], [1, 2, 3, 4, 5, 6], [6, 5, 4, 3, 2, 1], [-5, 0, 5, -10, 99, -99], [0, 0], [16, 1, 15, 2, 14, 3, 13, 4, 12, 5, 11, 6, 10, 7, 9, 8]];

function check(input, options) {
  // Counting sort refuses a range wider than COUNTING_RANGE (tested below).
  if (options.algorithm === "counting" && input.length && Math.max(...input) - Math.min(...input) >= COUNTING_RANGE) return;
  const { steps, result } = collect(run, input, { ...options, random: random(1) });
  const expected = sorted(input);
  assert.deepEqual(result, expected, `result of ${JSON.stringify(input)}`);
  assert.deepEqual(steps.at(-1).state.a, expected, "last step");
  assert.ok(Object.values(steps.at(-1).marks).every((m) => m === "done") && Object.keys(steps.at(-1).marks).length === input.length, "every cell done at the end");
  let previous = {};
  for (const step of steps) {
    if (options.algorithm !== "counting" || !step.aux?.count?.length || step.state.a.some((v) => v === null)) {
      assert.deepEqual(heldValues(step), expected, `values kept in ${step.say[0]}`);
    }
    for (const [key, value] of Object.entries(step.stats)) assert.ok(value >= (previous[key] ?? 0), `${key} never decreases`);
    previous = step.stats;
  }
}

for (const algorithm of ALGORITHMS) {
  const pivots = algorithm === "quick" ? PIVOTS : [undefined];
  for (const pivot of pivots) {
    const options = pivot ? { algorithm, pivot } : { algorithm };
    test(`sort ${algorithm}${pivot ? ` (${pivot} pivot)` : ""}: edge cases`, () => {
      for (const input of EDGES) check(input, options);
    });
    test(`sort ${algorithm}${pivot ? ` (${pivot} pivot)` : ""}: 200 random inputs`, () => {
      const rng = random(2026);
      for (let i = 0; i < 200; i += 1) {
        const n = rng.int(0, 16);
        const input = Array.from({ length: n }, () => rng.int(-20, 60));
        check(input, options);
      }
    });
  }
}

test("counting sort rejects a wide range", () => {
  assert.throws(() => collect(run, [0, 500], { algorithm: "counting" }), (error) => error.key === "widget.sort.error.range");
});
