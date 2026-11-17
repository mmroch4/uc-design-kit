/**
 * <uc-widget-complexity> (docs/plan/widgets-api.md 18.3): one step per n
 * with every function's value, the overtakes it announces are real order
 * changes, the final ranking is sorted, and the input parser; the size of
 * another widget's input (for the measured points).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { collect } from "../../widgets/src/core/engine.js";
import { run, FUNCTIONS, LABELS, ORDER, DEFAULT, MAX_N, parseFunctions, show } from "../../widgets/src/complexity/algorithm.js";

test("complexity: values, overtakes and ranking for every set of functions", () => {
  const sets = [DEFAULT, ORDER.slice(0, 8), ["n", "n2"], ["2n", "fact", "n3"], ["1"]];
  for (const functions of sets) {
    for (const max of [2, 8, 16, MAX_N]) {
      const { steps, result } = collect(run, { functions, max }, {});
      assert.equal(steps.length, max + 2, "start, one step per n, the end");
      for (let n = 1; n <= max; n += 1) {
        const { state, marks, predict } = steps[n];
        assert.equal(state.n, n);
        for (const id of functions) assert.equal(state.values[id], FUNCTIONS[id](n));
        for (const id of Object.keys(marks)) assert.ok(functions.includes(id));
        if (predict) {
          const ids = predict.options.map(([, { f }]) => functions.find((id) => LABELS[id] === f));
          for (const id of ids) assert.equal(marks[id], "swapped", "the pair asked about is marked");
          const winner = ids[predict.answer];
          const other = ids[1 - predict.answer];
          assert.ok(state.values[winner] > state.values[other], "the answer is the larger one");
        }
      }
      const at = (id) => FUNCTIONS[id](max);
      for (let i = 1; i < result.length; i += 1) assert.ok(at(result[i - 1]) <= at(result[i]), "ranking sorted");
    }
  }
});

test("complexity: 2ⁿ and n² change order at 3 and 5", () => {
  const { steps } = collect(run, { functions: ["n2", "2n"], max: 8 }, {});
  const changes = steps.filter((step) => step.say[0] === "widget.complexity.overtake").map((step) => step.state.n);
  assert.deepEqual(changes, [3, 5]);
  const five = steps.find((step) => step.state.n === 5);
  assert.deepEqual(five.predict.options[five.predict.answer], ["widget.complexity.name", { f: "2ⁿ" }]);
});

test("complexity: parsing and formatting", () => {
  assert.deepEqual(parseFunctions(""), DEFAULT);
  assert.deepEqual(parseFunctions("n2, n"), ["n2", "n"]);
  assert.throws(() => parseFunctions("n4"), { key: "widget.complexity.error.function" });
  assert.throws(() => parseFunctions("n n"), { key: "widget.complexity.error.repeat" });
  assert.equal(show(8), "8");
  assert.equal(show(Math.log2(5)), "2.3");
  assert.equal(show(FUNCTIONS.fact(20)), "2.4·10¹⁸");
});

test("complexity: the size of another widget's input", async () => {
  const { size } = await import("../../widgets/src/complexity/widget.js");
  assert.equal(size([5, 2, 9]), 3);
  assert.equal(size({ values: [1, 2], ops: null }), 2);
  assert.equal(size({ graph: { vertices: ["A", "B"], edges: [{}] } }), 3);
  assert.equal(size({ n: 6 }), 6);
  assert.equal(size(null), 0);
});
