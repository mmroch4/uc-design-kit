/**
 * <uc-widget-trace>: the teacher's own steps, checked and turned into the
 * step format (docs/plan/widgets-api.md 5.4, 6.2). Pure: no DOM, no UC.
 *
 * Input: { data, graph }. `data` is the JSON of the element's
 * <script type="application/json" data-input>:
 *
 *   {
 *     "view": "array" | "tree" | "graph" | "grid",
 *     "graph": "A B 4; A C 1",  "directed": true,      (graph view)
 *     "rowHeads": [...], "colHeads": [...],            (grid view, optional)
 *     "code": ["|for i = 1 to n − 1:", "take|  x = a[i]"] or { "pt": [...], "en": [...] },
 *     "steps": [
 *       { "state": …, "marks": { "0": "current" }, "pointers": { "i": "0" },
 *         "line": "take", "say": "…" or { "pt": "…", "en": "…" },
 *         "vars": { "i": 1, "x": 2 },
 *         "predict": { "ask": "…", "options": ["…", "…"], "answer": 0 } }
 *     ]
 *   }
 *
 * The state of a step depends on the view: array = a list of values (null =
 * empty cell); tree = { v, l, r } (binary) or { v, children: [...] }
 * (n-ary), with an optional `id` per node (the mark key; default the value)
 * and `note`, or null; graph = notes beside the vertices ({ "A": "0" }), the
 * graph itself being `graph` (built by the widget, or fixture.js in tests,
 * with model()); grid = a list of rows. A step without `state` keeps the
 * previous one. When the first step has marks, a plain first step is added.
 *
 * Errors are InputError with keys widget.trace.error.* (the step number
 * from 1) or widget.core.error.tooLarge.
 */
import { InputError, STATES } from "../core/engine.js";

export const ALGORITHMS = ["trace"];
export const VIEWS = ["array", "tree", "graph", "grid"];
const K = "widget.trace";
const LIMIT = { array: 16, tree: 15, grid: 9 };

const fail = (key, params = {}) => {
  throw new InputError(`${K}.error.${key}`, params);
};
const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);

/** A sentence in every language: a string, or { pt, en, … }; missing languages take the first one given. */
function text(value, n, what) {
  if (typeof value === "string" && value.trim()) return { pt: value, en: value };
  if (isObject(value)) {
    const given = Object.values(value).find((item) => typeof item === "string" && item.trim());
    if (given) return { ...value, pt: value.pt || given, en: value.en || given };
  }
  return fail(what, { n });
}

/** The pseudocode line ids of `data.code` (every language). */
export function lineIds({ data }) {
  const code = data && data.code;
  const lists = Array.isArray(code) ? [code] : isObject(code) ? Object.values(code).filter(Array.isArray) : [];
  return lists.flat().flatMap((line) => String(line).split("|")[0].split(" ")).filter(Boolean);
}

function countNodes(node, n, seen = new Set()) {
  if (node === null || node === undefined) return 0;
  if (!isObject(node) || !("v" in node)) fail("shape", { n, view: "tree" });
  if (seen.has(node)) fail("shape", { n, view: "tree" });
  seen.add(node);
  const kids = Array.isArray(node.children) ? node.children : [node.l, node.r];
  return 1 + kids.reduce((sum, kid) => sum + countNodes(kid, n, seen), 0);
}

/** Checks a step's state against the view; throws InputError. */
function checkState(state, view, n, graph) {
  if (view === "array") {
    if (!Array.isArray(state)) fail("shape", { n, view });
    if (state.length > LIMIT.array) throw new InputError("widget.core.error.tooLarge", { max: LIMIT.array });
  } else if (view === "tree") {
    if (countNodes(state, n) > LIMIT.tree) throw new InputError("widget.core.error.tooLarge", { max: LIMIT.tree });
  } else if (view === "grid") {
    if (!Array.isArray(state) || !state.every(Array.isArray)) fail("shape", { n, view });
    if (state.length > LIMIT.grid || state.some((row) => row.length > LIMIT.grid)) throw new InputError("widget.core.error.tooLarge", { max: LIMIT.grid });
  } else if (!isObject(state) || Object.keys(state).some((v) => !graph.vertices.includes(v))) {
    fail("shape", { n, view });
  }
}

export function run({ data, graph = null }, { algorithm = "trace" } = {}, emit) {
  if (!ALGORITHMS.includes(algorithm)) throw new Error(`unknown algorithm ${algorithm}`);
  if (!isObject(data)) fail("json", { detail: "{ … }" });
  const view = data.view ?? "array";
  if (!VIEWS.includes(view)) fail("view", { view: String(view) });
  if (view === "graph" && !graph) fail("graph");
  if (!Array.isArray(data.steps) || !data.steps.length) fail("steps");
  const ids = new Set(lineIds({ data }));

  let state = view === "graph" ? {} : undefined;
  const steps = data.steps.map((raw, i) => {
    const n = i + 1;
    if (!isObject(raw)) fail("step", { n });
    if ("state" in raw) state = raw.state;
    if (state === undefined) fail("state", { n });
    checkState(state, view, n, graph);
    const marks = raw.marks ?? {};
    if (!isObject(marks)) fail("step", { n });
    for (const value of Object.values(marks)) if (!STATES.includes(value)) fail("mark", { n, state: String(value) });
    const lines = [].concat(raw.line ?? []);
    for (const line of lines) if (!ids.has(line)) fail("line", { n, line: String(line) });
    const step = {
      state: { value: state },
      marks: Object.fromEntries(Object.entries(marks).map(([key, value]) => [String(key), value])),
      pointers: isObject(raw.pointers) ? Object.fromEntries(Object.entries(raw.pointers).map(([key, value]) => [key, String(value)])) : {},
      line: lines.length > 1 ? lines : lines[0] ?? null,
      say: [`${K}.text`, text(raw.say, n, "say")],
    };
    if (isObject(raw.vars)) step.aux = { vars: Object.fromEntries(Object.entries(raw.vars).map(([key, value]) => [key, String(value)])) };
    if (raw.predict !== undefined) {
      const p = raw.predict;
      const ok = isObject(p) && Array.isArray(p.options) && p.options.length >= 2 && p.options.length <= 4 && Number.isInteger(p.answer) && p.answer >= 0 && p.answer < p.options.length;
      if (!ok) fail("predict", { n });
      step.predict = { ask: [`${K}.text`, text(p.ask, n, "predict")], options: p.options.map((option) => [`${K}.text`, text(String(option), n, "predict")]), answer: p.answer };
    }
    return step;
  });

  if (Object.keys(steps[0].marks).length || steps[0].predict) {
    emit({ state: steps[0].state, marks: {}, line: null, say: [`${K}.start`] });
  }
  steps.forEach(emit);
  return steps[steps.length - 1].state.value;
}
