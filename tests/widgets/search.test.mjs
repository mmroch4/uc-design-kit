/**
 * <uc-widget-search> against a reference (docs/architecture/widgets-api.md 18.3):
 * indexOf for the linear search, a value check for the binary search and a
 * naive lower bound, on 200 random inputs and the edge cases; lo ≤ mid ≤ hi
 * on every step that has a mid; binary searches refuse unsorted arrays.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { collect, random } from "../../widgets/src/core/engine.js";
import { ALGORITHMS, run } from "../../widgets/src/search/algorithm.js";

const sorted = (values) => values.slice().sort((a, b) => a - b);
const lowerBound = (a, t) => {
  const i = a.findIndex((v) => v >= t);
  return i < 0 ? a.length : i;
};

function check(a, target, algorithm) {
  const { steps, result } = collect(run, { a, target }, { algorithm });
  if (algorithm === "linear") assert.equal(result, a.indexOf(target), `linear ${a} ${target}`);
  else if (algorithm === "binary") {
    if (a.includes(target)) assert.equal(a[result], target, `binary finds ${target} in ${a}`);
    else assert.equal(result, -1, `binary: ${target} not in ${a}`);
  } else assert.equal(result, lowerBound(a, target), `lower bound of ${target} in ${a}`);
  for (const step of steps) {
    const p = step.pointers || {};
    if (p.mid !== undefined) assert.ok(Number(p.lo) <= Number(p.mid) && Number(p.mid) <= Number(p.hi), `lo ≤ mid ≤ hi in ${step.say[0]}`);
    assert.deepEqual(step.state.a, a, "the array never changes");
  }
  const marks = Object.entries(steps.at(-1).marks).filter(([, m]) => m === "done");
  if (result >= 0 && result < a.length) assert.deepEqual(marks.map(([k]) => Number(k)), [result], "the answer is done");
}

const EDGES = [[[], 3], [[7], 7], [[7], 3], [[3, 3, 3, 3], 3], [[1, 2, 2, 2, 5], 2], [[1, 2, 3, 4, 5, 6], 0], [[1, 2, 3, 4, 5, 6], 9], [[-9, -5, 0, 5], -5]];

for (const algorithm of ALGORITHMS) {
  test(`search ${algorithm}: edge cases`, () => {
    for (const [a, t] of EDGES) check(a, t, algorithm);
  });
  test(`search ${algorithm}: 200 random inputs`, () => {
    const rng = random(2026);
    for (let i = 0; i < 200; i += 1) {
      const n = rng.int(0, 16);
      const raw = Array.from({ length: n }, () => rng.int(-10, 30));
      const a = algorithm === "linear" ? raw : sorted(raw);
      check(a, rng.int(-12, 32), algorithm);
    }
  });
}

test("binary searches refuse an unsorted array", () => {
  for (const algorithm of ["binary", "lower"]) {
    assert.throws(() => collect(run, { a: [3, 1, 2], target: 1 }, { algorithm }), (error) => error.key === "widget.search.error.unsorted");
  }
});
