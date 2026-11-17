/**
 * <uc-widget-trace> (docs/architecture/widgets-api.md 18.3): the schema check
 * accepts every example of the docs (the JSON inside the demo pages) and
 * rejects broken inputs with the right error key; accepted steps keep the
 * teacher's states, marks and sentences, and a plain first step is added
 * when the first one has marks.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { collect } from "../../widgets/src/core/engine.js";
import { run, lineIds } from "../../widgets/src/trace/algorithm.js";
import { input } from "../../widgets/src/trace/fixture.js";
import { ROOT } from "./helpers.mjs";

const play = (data) => collect(run, input(data), {});
const rejects = (data, key) => assert.throws(() => play(data), (error) => error.name === "InputError" && error.key === key, key);

/** Every JSON input of the docs: demo pages and the widget's page. */
async function examples() {
  const folder = path.join(ROOT, "docs", "demos", "uc-widget-trace");
  const files = (await readdir(folder)).map((name) => path.join(folder, name));
  files.push(path.join(ROOT, "docs", "pt", "widgets", "uc-widget-trace.html"), path.join(ROOT, "docs", "pt", "widgets", "criar.html"));
  const found = [];
  for (const file of files) {
    const html = await readFile(file, "utf8").catch(() => "");
    for (const match of html.matchAll(/<script type="application\/json" data-input>([\s\S]*?)<\/script>/g)) found.push([path.basename(file), match[1]]);
  }
  return found;
}

test("trace: the docs examples are accepted", async () => {
  const list = await examples();
  assert.ok(list.length >= 4, "at least four examples");
  for (const [file, json] of list) {
    const data = JSON.parse(json);
    const { steps } = play(data);
    assert.ok(steps.length >= data.steps.length, `${file}: every step kept`);
    assert.deepEqual(steps[0].marks, {}, `${file}: the first step has no marks`);
    for (const step of steps) for (const line of [].concat(step.line ?? [])) assert.ok(lineIds(input(data)).includes(line), `${file}: line ${line}`);
  }
});

test("trace: steps keep the teacher's data", () => {
  const data = {
    view: "array",
    code: ["a|x = 1", "b c|y = 2"],
    steps: [
      { state: [1, 2], say: "one" },
      { marks: { 0: "current" }, line: ["a", "c"], say: { pt: "dois", en: "two" }, vars: { x: 1 }, pointers: { i: 0 } },
      { state: [2, null], say: { pt: "três" }, predict: { ask: "?", options: ["a", "b"], answer: 1 } },
    ],
  };
  const { steps, result } = play(data);
  assert.equal(steps.length, 3);
  assert.deepEqual(steps[1].state.value, [1, 2], "a step without state keeps the previous one");
  assert.deepEqual(steps[1].marks, { 0: "current" });
  assert.deepEqual(steps[1].pointers, { i: "0" });
  assert.deepEqual(steps[1].line, ["a", "c"]);
  assert.deepEqual(steps[1].aux, { vars: { x: "1" } });
  assert.deepEqual(steps[0].say[1], { pt: "one", en: "one" });
  assert.deepEqual(steps[2].say[1], { pt: "três", en: "três" }, "a missing language takes the one given");
  assert.equal(steps[2].predict.answer, 1);
  assert.deepEqual(result, [2, null]);
  const marked = play({ steps: [{ state: [1], marks: { 0: "done" }, say: "x" }] }).steps;
  assert.equal(marked.length, 2, "a plain first step is added before a marked one");
  assert.deepEqual(marked[0].say, ["widget.trace.start"]);
});

test("trace: broken inputs are rejected", () => {
  const ok = { state: [1], say: "x" };
  rejects(null, "widget.trace.error.json");
  rejects({ view: "list", steps: [ok] }, "widget.trace.error.view");
  rejects({ steps: [] }, "widget.trace.error.steps");
  rejects({ steps: "x" }, "widget.trace.error.steps");
  rejects({ steps: [{ say: "x" }] }, "widget.trace.error.state");
  rejects({ steps: [ok, 3] }, "widget.trace.error.step");
  rejects({ steps: [{ state: { a: 1 }, say: "x" }] }, "widget.trace.error.shape");
  rejects({ view: "grid", steps: [{ state: [1, 2], say: "x" }] }, "widget.trace.error.shape");
  rejects({ view: "tree", steps: [{ state: { l: null }, say: "x" }] }, "widget.trace.error.shape");
  rejects({ view: "graph", steps: [ok] }, "widget.trace.error.graph");
  rejects({ view: "graph", graph: "A B", steps: [{ state: { Z: "1" }, say: "x" }] }, "widget.trace.error.shape");
  rejects({ steps: [{ ...ok, marks: { 0: "red" } }] }, "widget.trace.error.mark");
  rejects({ steps: [{ ...ok, line: "nope" }] }, "widget.trace.error.line");
  rejects({ steps: [{ state: [1] }] }, "widget.trace.error.say");
  rejects({ steps: [{ state: [1], say: { pt: "" } }] }, "widget.trace.error.say");
  rejects({ steps: [{ ...ok, predict: { ask: "?", options: ["a"], answer: 0 } }] }, "widget.trace.error.predict");
  rejects({ steps: [{ ...ok, predict: { ask: "?", options: ["a", "b"], answer: 2 } }] }, "widget.trace.error.predict");
  rejects({ steps: [{ state: Array(17).fill(1), say: "x" }] }, "widget.core.error.tooLarge");
  rejects({ view: "grid", steps: [{ state: Array(10).fill([1]), say: "x" }] }, "widget.core.error.tooLarge");
  const chain = (n) => (n ? { v: n, l: chain(n - 1), r: null } : null);
  rejects({ view: "tree", steps: [{ state: chain(16), say: "x" }] }, "widget.core.error.tooLarge");
  assert.equal(play({ view: "tree", steps: [{ state: chain(15), say: "x" }] }).steps.length, 1);
});
