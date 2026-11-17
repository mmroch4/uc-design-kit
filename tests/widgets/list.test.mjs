/**
 * <uc-widget-list> against an array model (docs/architecture/widgets-api.md 18.3):
 * on 200 random operation scripts and the edge cases the final list and the
 * answers equal the model's; in every step the list from head has no cycle
 * and no node outside the drawing.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { collect, random } from "../../widgets/src/core/engine.js";
import { run, contents, MAX_NODES } from "../../widgets/src/list/algorithm.js";

function model(values, ops) {
  const a = values.slice();
  const answers = [];
  for (const { verb, args } of ops) {
    const [x, y] = args.map(Number);
    if (verb === "add-first") answers.push((a.unshift(x), true));
    if (verb === "add-last") answers.push((a.push(x), true));
    if (verb === "insert") answers.push(x >= 0 && x <= a.length ? (a.splice(x, 0, y), true) : false);
    if (verb === "remove-first") answers.push(a.length ? a.shift() : null);
    if (verb === "remove-last") answers.push(a.length ? a.pop() : null);
    if (verb === "remove") answers.push(a.length ? (a.includes(x) ? (a.splice(a.indexOf(x), 1), true) : false) : null);
    if (verb === "search") answers.push(a.indexOf(x));
    if (verb === "reverse") answers.push((a.reverse(), true));
  }
  return { values: a, answers };
}

function check(values, ops) {
  const { steps, result } = collect(run, { values, ops }, {});
  assert.deepEqual(result, model(ops ? values : [], ops ?? values.map((v) => ({ verb: "add-last", args: [String(v)] }))));
  for (const step of steps) {
    const reached = contents(step.state);
    assert.ok(reached.length <= step.state.nodes.length, `no cycle at ${step.say[0]}`);
  }
  assert.deepEqual(contents(steps.at(-1).state), result.values);
}

test("list: edge cases", () => {
  const op = (verb, ...args) => ({ verb, args: args.map(String) });
  check([], null);
  check([], [op("remove-first"), op("remove-last"), op("remove", 3), op("search", 3), op("reverse")]);
  check([1], [op("reverse"), op("remove-last"), op("insert", 0, 5), op("insert", 3, 6)]);
  check([2, 2, 2], [op("remove", 2), op("search", 2), op("insert", 3, 9), op("reverse")]);
});

test("list: 200 random scripts", () => {
  const rng = random(2026);
  const verbs = ["add-first", "add-last", "insert", "remove-first", "remove-last", "remove", "search", "reverse"];
  for (let i = 0; i < 200; i += 1) {
    const values = Array.from({ length: rng.int(0, 5) }, () => rng.int(1, 9));
    const ops = Array.from({ length: rng.int(0, 8) }, () => {
      const verb = rng.pick(verbs);
      const args = verb === "insert" ? [rng.int(-1, 6), rng.int(1, 9)] : ["add-first", "add-last", "remove", "search"].includes(verb) ? [rng.int(1, 9)] : [];
      return { verb, args: args.map(String) };
    });
    if (values.length + ops.length > MAX_NODES) continue;
    check(values, ops);
  }
});

test("list: arguments and size are checked", () => {
  assert.throws(() => collect(run, { values: [], ops: [{ verb: "insert", args: ["1"] }] }, {}), (error) => error.key === "widget.list.error.arg");
  assert.throws(() => collect(run, { values: Array(10).fill(1), ops: [{ verb: "add-first", args: ["1"] }] }, {}), (error) => error.key === "widget.core.error.tooLarge");
});
