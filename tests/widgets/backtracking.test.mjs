/**
 * <uc-widget-backtracking> against references (docs/architecture/widgets-api.md
 * 18.3): N-queens counts 1, 0, 0, 2, 10, 4, 40, 92 for n = 1..8, every
 * solution valid; subsets equal a brute force over every subset (all 2^n
 * without a target, those with the sum with one); permutations are all n!,
 * in lexicographic order of the input order; the search trees stay small.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { collect, random, MAX_STEPS } from "../../widgets/src/core/engine.js";
import { run } from "../../widgets/src/backtracking/algorithm.js";

const COUNTS = [1, 0, 0, 2, 10, 4, 40, 92];
const size = (node) => 1 + node.kids.reduce((sum, kid) => sum + size(kid), 0);
const validQueens = (cols) => cols.every((c, r) => cols.every((d, s) => s === r || (c !== d && Math.abs(c - d) !== Math.abs(r - s))));

test("queens: number of solutions for n = 1..8 and every solution valid", () => {
  for (let n = 1; n <= 8; n += 1) {
    // Without the step cap: n = 7, 8 with `all` emit more than MAX_STEPS steps.
    let count = 0;
    const solutions = run({ n, all: true }, { algorithm: "queens" }, () => {
      count += 1;
    });
    assert.equal(solutions.length, COUNTS[n - 1], `n = ${n}`);
    assert.equal(new Set(solutions.map((s) => s.join())).size, solutions.length);
    for (const cols of solutions) assert.ok(cols.length === n && validQueens(cols), `${cols}`);
    if (n <= 6) assert.ok(count <= MAX_STEPS, `n = ${n} with all fits the step cap (${count})`);
  }
});

test("queens: the first solution, and none for n = 2, 3", () => {
  for (let n = 1; n <= 8; n += 1) {
    const { steps, result } = collect(run, { n, all: false }, { algorithm: "queens" });
    assert.equal(result.length, n === 2 || n === 3 ? 0 : 1);
    if (result.length) {
      assert.ok(validQueens(result[0]));
      const board = steps.at(-1).state.board;
      result[0].forEach((c, r) => assert.equal(board[r][c], "Q"));
      assert.equal(Object.values(steps.at(-1).marks).filter((s) => s === "done").length, n);
    }
    for (const step of steps) assert.ok(step.state.board.flat().filter(Boolean).length <= n);
  }
});

test("queens: every try asks whether the cell is free, with the right answer", () => {
  const { steps } = collect(run, { n: 5, all: false }, { algorithm: "queens" });
  for (const step of steps.filter((s) => s.predict)) {
    const free = step.line === "place";
    assert.equal(step.predict.answer, free ? 0 : 1);
  }
});

/** Every subset of the positions 0..n-1, as arrays of positions. */
const allSubsets = (n) => Array.from({ length: 1 << n }, (_, mask) => Array.from({ length: n }, (_, i) => i).filter((i) => mask & (1 << i)));
const key = (list) => list.map((s) => s.join(",")).sort().join(" | ");

test("subsets: every subset without a target, those with the sum with one, on 200 inputs", () => {
  const rng = random(31);
  for (let k = 0; k < 200; k += 1) {
    const n = rng.int(1, 4);
    const values = Array.from({ length: n }, () => rng.int(1, 9));
    const target = k % 4 === 0 ? null : rng.int(1, 20);
    const { steps, result } = collect(run, { values, target }, { algorithm: "subsets" });
    const expected = allSubsets(n).filter((s) => target === null || s.reduce((sum, i) => sum + values[i], 0) === target);
    assert.equal(key(result), key(expected), `${values} : ${target}`);
    const tree = size(steps.at(-1).state.root);
    assert.ok(tree <= 2 ** (n + 1) - 1, "tree size");
    if (target === null) assert.equal(tree, 2 ** (n + 1) - 1);
    // One step per node below the root, plus the start and the end (and the root's own cut).
    assert.equal(steps.length, tree + 1 + (steps.at(-1).marks.r === "compared" ? 1 : 0));
  }
});

test("subsets: predict asks whether a branch is cut, only with a target", () => {
  const plain = collect(run, { values: [1, 2, 3], target: null }, { algorithm: "subsets" }).steps;
  assert.equal(plain.filter((s) => s.predict).length, 0);
  const cut = collect(run, { values: [3, 1, 4, 2], target: 5 }, { algorithm: "subsets" }).steps;
  for (const step of cut.filter((s) => s.predict)) assert.equal(step.predict.answer, step.line === "cut" ? 0 : 1);
});

test("permutations: all n!, in lexicographic order of the input", () => {
  const perms = (list) => (list.length <= 1 ? [list] : list.flatMap((x, i) => perms([...list.slice(0, i), ...list.slice(i + 1)]).map((p) => [x, ...p])));
  for (const values of [["A"], ["B", "A"], ["C", "A", "B"], [3, 1, 2]]) {
    const { steps, result } = collect(run, { values }, { algorithm: "permutations" });
    assert.deepEqual(result, perms(values));
    const fact = [1, 1, 2, 6][values.length];
    assert.equal(result.length, fact);
    assert.ok(size(steps.at(-1).state.root) <= 16);
    assert.ok(steps.every((s) => !Object.values(s.marks).includes("compared")), "no cuts");
  }
});

test("backtracking: inputs out of the limits are refused", () => {
  const refuses = (input, algorithm, key) => assert.throws(() => collect(run, input, { algorithm }), (error) => error.key === `widget.backtracking.error.${key}`);
  refuses({ n: 9 }, "queens", "n");
  refuses({ n: 0 }, "queens", "n");
  refuses({ values: [1, 2, 3, 4, 5], target: null }, "subsets", "values");
  refuses({ values: [0, 2], target: null }, "subsets", "positive");
  refuses({ values: ["A", "A"] }, "permutations", "repeated");
  refuses({ values: ["A", "B", "C", "D"] }, "permutations", "values");
});
