/**
 * The binary heap of <uc-widget-heap>, as step lists
 * (docs/plan/widgets-api.md 6.4). Pure: no DOM, no UC, no Math.random.
 *
 * Input: { values, ops, kind } with kind "max" (default) or "min". State:
 * { a, ids, n }: the array, a stable id per value (so the tree drawing can
 * slide a value when it moves) and the heap size (heapsort keeps the sorted
 * part after it). Marks and pointers are array indexes.
 *
 * - "operations": `values` builds the heap without steps (bottom-up) and
 *   `ops` runs with steps (insert, extract, peek); without `ops`, every value
 *   is inserted with steps into an empty heap (5.2). Result: { heap, answers }.
 * - "heapify": `values` as given, then the bottom-up build. Result: the heap.
 * - "heapsort": the build, then the largest (smallest) value swapped to the
 *   end, again and again. Result: the sorted array.
 */
import { InputError } from "../core/engine.js";

export const ALGORITHMS = ["operations", "heapify", "heapsort"];
export const VERBS = ["insert", "extract", "peek"];
export const KINDS = ["max", "min"];
export const MAX_ITEMS = 15;

const YES_NO = [["widget.core.yes"], ["widget.core.no"]];
export const parent = (i) => (i - 1) >> 1;

/** True when a may sit above b in a heap of this kind. */
export const above = (kind, a, b) => (kind === "min" ? a <= b : a >= b);

/** True when a[0..n) is a heap. */
export function isHeap(a, n, kind) {
  for (let i = 1; i < n; i += 1) if (!above(kind, a[parent(i)], a[i])) return false;
  return true;
}

export function run({ values = [], ops = null, kind = "max" }, { algorithm = "operations" } = {}, emit) {
  if (!ALGORITHMS.includes(algorithm)) throw new Error(`unknown algorithm ${algorithm}`);
  if (!KINDS.includes(kind)) throw new Error(`unknown kind ${kind}`);
  if (values.length > MAX_ITEMS) throw new InputError("widget.core.error.tooLarge", { max: MAX_ITEMS });
  const op = kind === "max" ? ">" : "<";
  const better = (x, y) => (kind === "max" ? x > y : x < y);
  let next = 0;
  const state = { a: [], ids: [], n: 0 };
  const push = (v) => {
    state.a.push(v);
    state.ids.push(`h${next++}`);
    state.n += 1;
  };
  let code = algorithm;
  const step = (marks, line, say, extra = {}) => emit({ state, marks, line, say, code, aux: { size: state.n }, ...extra });
  const swap = (i, j) => {
    for (const list of [state.a, state.ids]) [list[i], list[j]] = [list[j], list[i]];
  };
  const doneFrom = (k) => Object.fromEntries(state.a.map((_, i) => [i, "done"]).slice(k));

  /** Moves a[i] down within the heap size n; `sorted` marks the finished tail. */
  const siftDown = (i, sorted = {}) => {
    const { a } = state;
    for (;;) {
      const l = 2 * i + 1;
      const r = l + 1;
      if (l >= state.n) {
        step({ ...sorted, [i]: "done" }, "leaf", ["widget.heap.leaf", { v: a[i] }]);
        return;
      }
      const c = r < state.n && better(a[r], a[l]) ? r : l;
      const marks = { ...sorted, [i]: "current", [l]: "compared" };
      if (r < state.n) marks[r] = "compared";
      const go = better(a[c], a[i]);
      const p = { v: a[i], c: a[c], op };
      step(marks, "child", [r < state.n ? `widget.heap.child.${kind}` : "widget.heap.onlyChild", p], {
        predict: { ask: ["widget.heap.predict.down", p], options: YES_NO, answer: go ? 0 : 1 },
      });
      if (!go) {
        step({ ...sorted, [i]: "done" }, "stop", ["widget.heap.stays", p]);
        return;
      }
      swap(i, c);
      step({ ...sorted, [i]: "swapped", [c]: "swapped" }, "swap", ["widget.heap.down", p]);
      i = c;
    }
  };

  const siftUp = (i) => {
    const { a } = state;
    while (i > 0) {
      const p = parent(i);
      const go = better(a[i], a[p]);
      const params = { v: a[i], p: a[p], op };
      step({ [i]: "current", [p]: "compared" }, "up", [go ? "widget.heap.rises" : "widget.heap.settles", params], {
        predict: { ask: ["widget.heap.predict.up", params], options: YES_NO, answer: go ? 0 : 1 },
      });
      if (!go) return i;
      swap(i, p);
      step({ [i]: "swapped", [p]: "swapped" }, "swap", ["widget.heap.up", params]);
      i = p;
    }
    return i;
  };

  /** The bottom-up build, with steps (or quiet, for the initial heap of "operations"). */
  const build = (quiet) => {
    for (let i = (state.n >> 1) - 1; i >= 0; i -= 1) {
      if (quiet) {
        quietDown(i);
        continue;
      }
      step({ [i]: "current" }, "loop", ["widget.heap.fix", { i, v: state.a[i] }]);
      siftDown(i);
    }
  };
  const quietDown = (i) => {
    const { a } = state;
    for (;;) {
      const l = 2 * i + 1;
      const c = l + 1 < state.n && better(a[l + 1], a[l]) ? l + 1 : l;
      if (l >= state.n || !better(a[c], a[i])) return;
      swap(i, c);
      i = c;
    }
  };

  if (algorithm !== "operations" || ops !== null) values.forEach(push);

  if (algorithm === "heapify" || algorithm === "heapsort") {
    code = "heapify";
    step({}, null, ["widget.heap.start", { n: state.n, values: state.a.join(" ") || "—" }]);
    build(false);
    step({}, null, [state.n ? "widget.heap.built" : "widget.heap.empty", { top: state.a[0] }]);
    if (algorithm === "heapify") return state.a.slice();
    code = "heapsort";
    while (state.n > 1) {
      const end = state.n - 1;
      const p = { top: state.a[0], last: state.a[end], end };
      swap(0, end);
      state.n = end;
      const options = [...new Set([p.top, p.last, state.a[1]])].sort((x, y) => x - y);
      step({ ...doneFrom(end + 1), 0: "swapped", [end]: "swapped" }, "last", ["widget.heap.toEnd", p], {
        predict: { ask: ["widget.heap.predict.end", { end }], options: options.map((v) => ["widget.core.value", { v }]), answer: options.indexOf(p.top) },
      });
      siftDown(0, doneFrom(end));
    }
    state.n = 0;
    step(doneFrom(0), "end", ["widget.heap.sorted", { values: state.a.join(" ") }]);
    return state.a.slice();
  }

  build(true);
  step({}, null, state.n ? ["widget.heap.startOps", { n: state.n, top: state.a[0] }] : ["widget.heap.empty"]);
  const list = ops !== null ? ops : values.map((v) => ({ verb: "insert", args: [String(v)] }));
  const answers = [];
  for (const { verb, args } of list) {
    code = verb;
    if (verb === "insert") {
      if (args.length !== 1 || !/^[+-]?\d+$/.test(args[0])) throw new InputError("widget.heap.error.arg", { verb });
      if (state.n >= MAX_ITEMS) throw new InputError("widget.core.error.tooLarge", { max: MAX_ITEMS });
      const v = Number(args[0]);
      push(v);
      const i = state.n - 1;
      step({ [i]: "current" }, "place", ["widget.heap.insert", { v, i }]);
      const at = siftUp(i);
      step({ [at]: "done" }, "end", ["widget.heap.placed", { v, i: at }]);
      answers.push(v);
      continue;
    }
    if (!state.n) {
      step({}, "top", ["widget.heap.emptyOp", { verb }]);
      answers.push(null);
      continue;
    }
    const top = state.a[0];
    answers.push(top);
    if (verb === "peek") {
      step({ 0: "done" }, "top", ["widget.heap.peek", { top }]);
      continue;
    }
    step({ 0: "current" }, "top", ["widget.heap.extract", { top }]);
    const last = state.n - 1;
    swap(0, last);
    state.a.pop();
    state.ids.pop();
    state.n -= 1;
    if (!state.n) {
      step({}, "move", ["widget.heap.extractLast", { top }]);
      continue;
    }
    step({ 0: "swapped" }, "move", ["widget.heap.moved", { top, v: state.a[0] }]);
    siftDown(0);
  }
  code = null;
  step({}, null, state.n ? ["widget.heap.end", { n: state.n, values: state.a.join(" ") }] : ["widget.heap.endEmpty"]);
  return { heap: state.a.slice(), answers };
}
