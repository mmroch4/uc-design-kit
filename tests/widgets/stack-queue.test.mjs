/**
 * <uc-widget-stack-queue> against an array model (docs/plan/widgets-api.md
 * 18.3): for the stack and the queue, in an array and in a list, on 200
 * random scripts and the edge cases the final contents and the answers equal
 * the model's (overflow on a full array changes nothing; underflow answers
 * null), and the drawn cells always hold exactly the model's values.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { collect, random } from "../../widgets/src/core/engine.js";
import { run, VERBS } from "../../widgets/src/stack-queue/algorithm.js";

function model(algorithm, values, ops, cap) {
  const a = values.slice();
  const answers = [];
  for (const { verb, args } of ops) {
    if (verb === "push" || verb === "enqueue") answers.push(a.length < cap ? (a.push(Number(args[0])), true) : false);
    else if (!a.length) answers.push(null);
    else if (verb === "peek") answers.push(algorithm === "stack" ? a.at(-1) : a[0]);
    else answers.push(algorithm === "stack" ? a.pop() : a.shift());
  }
  return { values: a, answers };
}

const sorted = (a) => a.slice().sort((x, y) => x - y);

function check(algorithm, impl, values, ops, capacity) {
  const input = { values, ops, impl, capacity };
  const { steps, result } = collect(run, input, { algorithm });
  const add = algorithm === "stack" ? "push" : "enqueue";
  const cap = impl === "array" ? capacity : 10;
  assert.deepEqual(result, model(algorithm, ops ? values : [], ops ?? values.map((v) => ({ verb: add, args: [String(v)] })), cap));
  const last = steps.at(-1).state;
  const drawn = last.impl === "array" ? last.a.filter((v) => v !== null) : last.nodes.map((node) => node.v);
  assert.deepEqual(sorted(drawn), sorted(result.values), "the drawing holds the final values");
}

for (const algorithm of ["stack", "queue"]) {
  for (const impl of ["array", "list"]) {
    test(`${algorithm} in ${impl}: edge cases`, () => {
      const [add, take] = VERBS[algorithm];
      check(algorithm, impl, [], null, 4);
      check(algorithm, impl, [], [{ verb: take, args: [] }, { verb: "peek", args: [] }], 4);
      check(algorithm, impl, [1, 2, 3, 4], [{ verb: impl === "array" ? add : "peek", args: impl === "array" ? ["5"] : [] }, { verb: take, args: [] }, { verb: add, args: ["6"] }], 4);
      check(algorithm, impl, [9], [{ verb: take, args: [] }, { verb: take, args: [] }, { verb: add, args: ["1"] }], 1);
    });
    test(`${algorithm} in ${impl}: 200 random scripts`, () => {
      const rng = random(2026);
      const verbs = VERBS[algorithm];
      for (let i = 0; i < 200; i += 1) {
        const capacity = rng.int(1, 8);
        const values = Array.from({ length: rng.int(0, capacity) }, () => rng.int(1, 9));
        let size = values.length;
        const ops = [];
        for (let k = rng.int(0, 12); k > 0; k -= 1) {
          const verb = rng.pick([verbs[0], verbs[0], verbs[1], verbs[2]]);
          if (verb === verbs[0] && impl === "list" && size >= 10) continue;
          size += verb === verbs[0] ? 1 : verb === verbs[1] ? -1 : 0;
          size = Math.max(0, Math.min(size, impl === "array" ? capacity : 10));
          ops.push({ verb, args: verb === verbs[0] ? [String(rng.int(1, 9))] : [] });
        }
        check(algorithm, impl, values, rng.int(0, 4) ? ops : null, capacity);
      }
    });
  }
}
