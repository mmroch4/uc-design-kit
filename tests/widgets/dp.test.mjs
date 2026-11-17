/**
 * <uc-widget-dp> against references (docs/plan/widgets-api.md 18.3): on 200
 * random inputs per problem, the table equals a straightforward reference
 * and the reconstruction is valid — the LCS is a common subsequence of that
 * length; the edit operations turn a into b and their count is the
 * distance; the knapsack items fit and reach the best value of a brute force
 * over every subset; the coins add up to the amount with the fewest coins of
 * a breadth-first search (and "∞" exactly when no change exists).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { collect, random } from "../../widgets/src/core/engine.js";
import { run, check, INFINITY } from "../../widgets/src/dp/algorithm.js";

const rng = random(2027);
const word = (alphabet, min, max) => Array.from({ length: rng.int(min, max) }, () => rng.pick([...alphabet])).join("");

function lcsTable(a, b) {
  const t = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 1; i <= a.length; i += 1) for (let j = 1; j <= b.length; j += 1) t[i][j] = a[i - 1] === b[j - 1] ? t[i - 1][j - 1] + 1 : Math.max(t[i - 1][j], t[i][j - 1]);
  return t;
}

function editTable(a, b) {
  const t = Array.from({ length: a.length + 1 }, (_, i) => Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
  for (let i = 1; i <= a.length; i += 1) for (let j = 1; j <= b.length; j += 1) t[i][j] = Math.min(t[i - 1][j] + 1, t[i][j - 1] + 1, t[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return t;
}

function knapsackTable(w, v, W) {
  const t = [Array(W + 1).fill(0)];
  for (let i = 1; i <= w.length; i += 1) t.push(Array.from({ length: W + 1 }, (_, c) => (w[i - 1] > c ? t[i - 1][c] : Math.max(t[i - 1][c], t[i - 1][c - w[i - 1]] + v[i - 1]))));
  return t;
}

/** Fewest coins for every amount 0..A by breadth-first search over sums (null = impossible). */
function coinsBfs(coins, A) {
  const best = Array(A + 1).fill(null);
  best[0] = 0;
  let frontier = [0];
  for (let k = 1; frontier.length; k += 1) {
    const next = [];
    for (const x of frontier) for (const m of coins) if (x + m <= A && best[x + m] === null) {
      best[x + m] = k;
      next.push(x + m);
    }
    frontier = next;
  }
  return best;
}

const isSubsequence = (s, of) => {
  let k = 0;
  for (const ch of of) if (ch === s[k]) k += 1;
  return k === s.length;
};

const lastTable = (steps) => steps.at(-1).state.t;
const pathOk = (steps) => {
  for (const step of steps) for (const state of Object.values(step.marks)) assert.ok(["current", "compared", "done"].includes(state));
};

test("lcs: table and a common subsequence of the right length on 200 inputs", () => {
  for (let k = 0; k < 200; k += 1) {
    const a = word("ABCD", 1, 8);
    const b = word("ABCD", 1, 8);
    const { steps, result } = collect(run, { a, b }, { algorithm: "lcs" });
    const reference = lcsTable(a, b);
    assert.deepEqual(lastTable(steps), reference, `${a} ${b}`);
    assert.equal(result.value, reference[a.length][b.length]);
    assert.equal(result.lcs.length, result.value);
    assert.ok(isSubsequence(result.lcs, a) && isSubsequence(result.lcs, b), `${result.lcs} in ${a} and ${b}`);
    assert.equal(steps.length, 3 + a.length * b.length + Object.keys(steps.at(-1).marks).length);
    pathOk(steps);
  }
});

test("edit-distance: table and operations that turn a into b on 200 inputs", () => {
  for (let k = 0; k < 200; k += 1) {
    const a = word("ABC", 1, 8);
    const b = word("ABC", 1, 8);
    const { steps, result } = collect(run, { a, b }, { algorithm: "edit-distance" });
    const reference = editTable(a, b);
    assert.deepEqual(lastTable(steps), reference, `${a} ${b}`);
    assert.equal(result.value, reference[a.length][b.length]);
    // Walk the operations: keep and sub consume a[i] and write b[j]; del consumes a[i]; ins writes b[j].
    let read = "";
    let written = "";
    for (const { op, i, j } of result.ops) {
      if (op !== "ins") read += a[i - 1];
      if (op !== "del") written += b[j - 1];
      if (op === "keep") assert.equal(a[i - 1], b[j - 1]);
      if (op === "sub") assert.notEqual(a[i - 1], b[j - 1]);
    }
    assert.equal(read, a);
    assert.equal(written, b);
    assert.equal(result.ops.filter(({ op }) => op !== "keep").length, result.value);
    pathOk(steps);
  }
});

test("knapsack: table and items that reach the brute-force best on 200 inputs", () => {
  for (let k = 0; k < 200; k += 1) {
    const n = rng.int(1, 8);
    const w = Array.from({ length: n }, () => rng.int(1, 6));
    const v = Array.from({ length: n }, () => rng.int(1, 9));
    const W = rng.int(1, 8);
    const { steps, result } = collect(run, { weights: w, values: v, capacity: W }, { algorithm: "knapsack" });
    assert.deepEqual(lastTable(steps), knapsackTable(w, v, W));
    let best = 0;
    for (let mask = 0; mask < 1 << n; mask += 1) {
      let weight = 0;
      let value = 0;
      for (let i = 0; i < n; i += 1) if (mask & (1 << i)) {
        weight += w[i];
        value += v[i];
      }
      if (weight <= W) best = Math.max(best, value);
    }
    assert.equal(result.value, best);
    assert.ok(result.items.reduce((s, i) => s + w[i - 1], 0) <= W, "the items fit");
    assert.equal(result.items.reduce((s, i) => s + v[i - 1], 0), best);
    assert.equal(new Set(result.items).size, result.items.length);
    pathOk(steps);
  }
});

test("coins: table, fewest coins and impossible amounts on 200 inputs", () => {
  for (let k = 0; k < 200; k += 1) {
    const coins = rng.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, rng.int(1, 6));
    const A = rng.int(1, 8);
    const { steps, result } = collect(run, { coins, amount: A }, { algorithm: "coins" });
    const best = coinsBfs(coins, A);
    assert.deepEqual(lastTable(steps), [best.map((x) => (x === null ? INFINITY : x))], `${coins} ${A}`);
    if (best[A] === null) {
      assert.equal(result.value, INFINITY);
      assert.deepEqual(result.used, []);
    } else {
      assert.equal(result.value, best[A]);
      assert.equal(result.used.length, best[A]);
      assert.equal(result.used.reduce((s, m) => s + m, 0), A);
      assert.ok(result.used.every((m) => coins.includes(m)));
    }
    pathOk(steps);
  }
});

test("dp: predict asks the value of last-row cells, with the answer among three numbers", () => {
  const { steps } = collect(run, { a: "ABCBDAB", b: "BDCABA" }, { algorithm: "lcs" });
  const asked = steps.filter((step) => step.predict);
  assert.equal(asked.length, 6);
  const positions = new Set();
  for (const step of asked) {
    const values = step.predict.options.map(([, { v }]) => v);
    assert.ok(values.every((x) => x >= 0));
    positions.add(step.predict.answer);
  }
  assert.ok(positions.size > 1, "the answer is not always in the same place");
  // Coins: every finite cell is asked; ∞ is never asked.
  const coins = collect(run, { coins: [2, 4], amount: 7 }, { algorithm: "coins" }).steps;
  assert.deepEqual(coins.filter((s) => s.predict).map((s) => s.predict.ask[1].cell), ["dp[2]", "dp[4]", "dp[6]"]);
});

test("dp: the classic examples", () => {
  assert.equal(collect(run, { a: "ABCBDAB", b: "BDCABA" }, { algorithm: "lcs" }).result.value, 4);
  assert.equal(collect(run, { a: "KITTEN", b: "SITTING" }, { algorithm: "edit-distance" }).result.value, 3);
  const knap = collect(run, { weights: [1, 3, 4, 5], values: [1, 4, 5, 7], capacity: 7 }, { algorithm: "knapsack" }).result;
  assert.equal(knap.value, 9);
  assert.deepEqual(knap.items, [2, 3]);
  // Greedy would give 4 + 1 + 1; the table gives 3 + 3.
  assert.deepEqual(collect(run, { coins: [1, 3, 4], amount: 6 }, { algorithm: "coins" }).result.used, [3, 3]);
});

test("dp: inputs out of the limits are refused", () => {
  const refuses = (input, algorithm, key) => assert.throws(() => check(input, algorithm), (error) => error.key === `widget.dp.error.${key}`);
  refuses({ a: "ABCDEFGHI", b: "A" }, "lcs", "string");
  refuses({ a: "", b: "A" }, "edit-distance", "string");
  refuses({ weights: [1, 2], values: [1], capacity: 3 }, "knapsack", "items");
  refuses({ weights: [0], values: [1], capacity: 3 }, "knapsack", "positive");
  refuses({ weights: [1], values: [1], capacity: 9 }, "knapsack", "capacity");
  refuses({ coins: [1, 1], amount: 3 }, "coins", "coins");
  refuses({ coins: [1, 2, 3, 4, 5, 6, 7], amount: 3 }, "coins", "coins");
  refuses({ coins: [1], amount: 9 }, "coins", "amount");
  assert.doesNotThrow(() => check({ a: "AÇÃO", b: "AÇO" }, "lcs"));
});
