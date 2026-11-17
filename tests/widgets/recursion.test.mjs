/**
 * <uc-widget-recursion> against a reference (docs/plan/widgets-api.md 18.3):
 * n! and Fibonacci for every allowed n, Hanoi with 2^n − 1 legal moves that
 * end with every disk on C; the call tree has one node per call and the call
 * stack is empty at the end.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { collect } from "../../widgets/src/core/engine.js";
import { run, MAX_N } from "../../widgets/src/recursion/algorithm.js";

const size = (node) => (node ? 1 + node.kids.reduce((sum, kid) => sum + size(kid), 0) : 0);
const fact = (n) => (n <= 1 ? 1 : n * fact(n - 1));
const fib = (n) => (n <= 1 ? n : fib(n - 1) + fib(n - 2));
const fibCalls = (n) => (n <= 1 ? 1 : 1 + fibCalls(n - 1) + fibCalls(n - 2));

test("factorial: n! for n = 0..8", () => {
  for (let n = 0; n <= MAX_N.factorial; n += 1) {
    const { steps, result } = collect(run, { n }, { algorithm: "factorial" });
    assert.equal(result, fact(n));
    assert.equal(size(steps.at(-1).state.root), Math.max(1, n));
    assert.deepEqual(steps.at(-1).aux.stack, []);
  }
});

test("fibonacci: values and number of calls for n = 0..6", () => {
  for (let n = 0; n <= MAX_N.fibonacci; n += 1) {
    const { steps, result } = collect(run, { n }, { algorithm: "fibonacci" });
    assert.equal(result, fib(n));
    assert.equal(size(steps.at(-1).state.root), fibCalls(n));
    assert.equal(steps.at(-1).state.root.value, fib(n));
  }
});

test("hanoi: 2^n − 1 legal moves for n = 1..4", () => {
  for (let n = 1; n <= MAX_N.hanoi; n += 1) {
    const { result } = collect(run, { n }, { algorithm: "hanoi" });
    assert.equal(result.length, 2 ** n - 1);
    const pegs = { A: Array.from({ length: n }, (_, i) => n - i), B: [], C: [] };
    for (const move of result) {
      const [from, to] = move.split("→");
      const disk = pegs[from].pop();
      assert.ok(disk !== undefined && (!pegs[to].length || pegs[to].at(-1) > disk), `legal move ${move}`);
      pegs[to].push(disk);
    }
    assert.deepEqual(pegs.C, Array.from({ length: n }, (_, i) => n - i));
  }
});

test("recursion refuses arguments that do not fit", () => {
  assert.throws(() => collect(run, { n: 7 }, { algorithm: "fibonacci" }), (error) => error.key === "widget.core.error.tooLarge");
  assert.throws(() => collect(run, { n: 0 }, { algorithm: "hanoi" }), (error) => error.key === "widget.recursion.error.n");
});
