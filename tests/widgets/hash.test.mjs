/**
 * <uc-widget-hash> against a reference (docs/plan/widgets-api.md 18.3): on
 * 200 random scripts per algorithm and the edge cases, answers equal a Set
 * model, every key of the model is found afterwards and removed keys are not,
 * the table holds exactly the model's keys, the load factor is n / m, each
 * key sits in its own chain (chaining) or on its probe sequence (open
 * addressing), and the probe counter never decreases.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { collect, random } from "../../widgets/src/core/engine.js";
import { run, hash, ALGORITHMS, MAX_SIZE } from "../../widgets/src/hash/algorithm.js";

const op = (verb, k) => ({ verb, args: [String(k)] });
const keyOf = (text) => (/^[+-]?\d+$/.test(text) ? Number(text) : text);
const sortKeys = (keys) => keys.map(String).sort();

function check(algorithm, values, ops, size, maxLoad) {
  const script = ops ?? values.map((v) => op("insert", v));
  const { steps, result } = collect(run, { values, ops, size, maxLoad }, { algorithm });
  let probes = 0;
  for (const step of steps) {
    assert.ok(step.stats.probes >= probes, "probes never decrease");
    probes = step.stats.probes;
    assert.equal(step.aux.load.split(" = ")[0], `${step.state.n}/${step.state.m}`);
  }
  const last = steps[steps.length - 1].state;
  // The Set model; open addressing may refuse a new key when no free slot is on its probe sequence.
  const set = new Set(ops === null ? [] : values);
  const answers = script.map(({ verb, args }, i) => {
    const k = keyOf(args[0]);
    if (verb === "search") return set.has(k);
    if (verb === "remove") return set.delete(k);
    if (set.has(k)) return false;
    if (result.answers[i] === false) {
      assert.notEqual(algorithm, "chaining", "chaining never refuses a new key");
      return false;
    }
    set.add(k);
    return true;
  });
  assert.deepEqual(result.answers, answers);
  const keys = algorithm === "chaining" ? result.table.flat() : result.table.filter((k) => k !== null);
  assert.deepEqual(sortKeys(keys), sortKeys([...set]));
  assert.equal(last.n, set.size);
  assert.ok(last.m <= MAX_SIZE);
  if (maxLoad !== null && 2 * last.m <= MAX_SIZE) assert.ok(last.n / last.m <= maxLoad, "the table grew in time");
  if (algorithm === "chaining") {
    result.table.forEach((row, i) => row.forEach((k) => assert.equal(hash(k, last.m), i, `${k} in its chain`)));
  } else {
    for (const k of keys) {
      const h = hash(k, last.m);
      const seq = Array.from({ length: last.m }, (_, i) => (algorithm === "quadratic" ? (h + i * i) % last.m : (h + i) % last.m));
      assert.ok(seq.includes(result.table.indexOf(k)), `${k} on its probe sequence`);
    }
  }
  // Every key is found afterwards; removed ones are not.
  const after = [...set, ...script.filter((o) => o.verb === "remove").map((o) => keyOf(o.args[0]))];
  const found = collect(run, { values: ops === null ? [] : values, ops: [...script, ...after.map((k) => op("search", k))], size, maxLoad }, { algorithm }).result.answers;
  assert.deepEqual(found.slice(script.length), after.map((k) => set.has(k)));
}

test("hash: edge cases", () => {
  for (const algorithm of ALGORITHMS) {
    check(algorithm, [], null, 7, 0.75);
    check(algorithm, [], [op("search", 3), op("remove", 3)], 1, null);
    check(algorithm, [5, 5, 5], null, 7, 0.75);
    check(algorithm, [7, 14, 21, 28], [op("remove", 14), op("search", 21), op("insert", 35), op("insert", 14)], 7, null);
    check(algorithm, ["ana", "rui", "eva", "ivo"], [op("remove", "rui"), op("search", "ivo"), op("insert", "rita")], 5, null);
    check(algorithm, [-3, 4, -10], [op("insert", 11), op("search", -3)], 7, 0.5);
    check(algorithm, [1, 2, 3, 4, 5, 6, 7, 8], null, 4, 0.75);
  }
});

test("hash: 200 random scripts per algorithm", () => {
  const rng = random(2026);
  for (const algorithm of ALGORITHMS) {
    for (let i = 0; i < 200; i += 1) {
      const size = rng.int(3, 8);
      const maxLoad = rng.pick([null, 0.5, 0.75, 1]);
      const values = Array.from({ length: rng.int(0, Math.min(size, 5)) }, () => rng.int(0, 40));
      const ops = Array.from({ length: rng.int(0, 10) }, () => op(rng.pick(["insert", "insert", "remove", "search"]), rng.int(0, 40)));
      const keys = new Set([...values, ...ops.filter((o) => o.verb === "insert").map((o) => Number(o.args[0]))]);
      if (keys.size > 12) continue;
      try {
        check(algorithm, [...new Set(values)], rng.int(0, 4) ? ops : null, size, maxLoad);
      } catch (error) {
        if (error.name === "InputError") continue; // a chain longer than 6, or initial keys that do not fit
        throw error;
      }
    }
  }
});
