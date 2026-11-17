/**
 * The searches of <uc-widget-search>, as step lists
 * (docs/plan/widgets-api.md 6.4). Pure: no DOM, no UC, no Math.random.
 *
 * Input: { a: [values], target }. State: { a }. Cells already ruled out are
 * marked "visited" (•); the cell being compared is "compared"; the answer is
 * "done". Pointers: i (linear), lo, mid, hi (binary). Results: the index of
 * the target or -1 (linear, binary), the first index whose value is ≥ the
 * target (lower bound, from 0 to n).
 */
import { InputError, marksOf, range } from "../core/engine.js";

export const ALGORITHMS = ["linear", "binary", "lower"];

const YES_NO = [["widget.core.yes"], ["widget.core.no"]];
const SIDES = [["widget.search.side.left"], ["widget.search.side.right"], ["widget.search.side.found"]];

/** Binary searches need a sorted array. */
export function isSorted(a) {
  return a.every((v, i) => i === 0 || a[i - 1] <= v);
}

export function run({ a, target: t }, { algorithm = "linear" } = {}, emit) {
  if (!ALGORITHMS.includes(algorithm)) throw new Error(`unknown algorithm ${algorithm}`);
  if (algorithm !== "linear" && !isSorted(a)) throw new InputError("widget.search.error.unsorted");
  const n = a.length;
  const stats = { comparisons: 0 };
  const out = new Set();
  const step = (marks, pointers, line, say, predict) =>
    emit({ state: { a }, marks: { ...marksOf(out, "visited"), ...marks }, pointers, line, say, stats, ...(predict ? { predict } : {}) });

  emit({ state: { a }, marks: {}, pointers: {}, line: null, say: ["widget.search.start", { n, t }], stats });

  if (algorithm === "linear") {
    for (let i = 0; i < n; i += 1) {
      stats.comparisons += 1;
      const hit = a[i] === t;
      const values = { v: a[i], t, i };
      step({ [i]: "compared" }, { i: String(i) }, "compare", [hit ? "widget.search.equal" : "widget.search.notEqual", values], {
        ask: ["widget.search.predict.equal", values],
        options: YES_NO,
        answer: hit ? 0 : 1,
      });
      if (hit) {
        step({ [i]: "done" }, { i: String(i) }, "found", ["widget.search.found", values]);
        return i;
      }
      out.add(i);
    }
    step({}, {}, "missing", ["widget.search.notFound", { t }]);
    return -1;
  }

  if (algorithm === "binary") {
    let lo = 0;
    let hi = n - 1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      const point = { lo: String(lo), mid: String(mid), hi: String(hi) };
      step({ [mid]: "current" }, point, "mid", ["widget.search.mid", { lo, hi, mid, v: a[mid] }]);
      stats.comparisons += 1;
      const values = { v: a[mid], t, mid };
      const side = a[mid] === t ? 2 : a[mid] < t ? 1 : 0;
      const say = [["widget.search.goLeft", values], ["widget.search.goRight", values], ["widget.search.found", { ...values, i: mid }]][side];
      const predict = { ask: ["widget.search.predict.side", values], options: SIDES, answer: side };
      if (side === 2) {
        step({ [mid]: "done" }, point, "found", say, predict);
        return mid;
      }
      // Rule out the half that cannot hold the target.
      range(side ? lo : mid, side ? mid + 1 : hi + 1).forEach((k) => out.add(k));
      if (side) lo = mid + 1;
      else hi = mid - 1;
      step({ [mid]: "compared" }, point, side ? "right" : "left", say, predict);
    }
    step({}, {}, "missing", ["widget.search.notFound", { t }]);
    return -1;
  }

  // Lower bound: the first position whose value is ≥ t (n if none).
  let lo = 0;
  let hi = n;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    const point = { lo: String(lo), mid: String(mid), hi: String(hi) };
    step({ [mid]: "current" }, point, "mid", ["widget.search.lowerMid", { lo, hi, mid, v: a[mid] }]);
    stats.comparisons += 1;
    const less = a[mid] < t;
    const values = { v: a[mid], t, mid };
    range(less ? lo : mid + 1, less ? mid + 1 : hi).forEach((k) => out.add(k));
    if (less) lo = mid + 1;
    else hi = mid;
    step({ [mid]: less ? "compared" : "visited" }, point, less ? "right" : "left", [less ? "widget.search.lowerRight" : "widget.search.lowerLeft", values], {
      ask: ["widget.search.predict.less", values],
      options: YES_NO,
      answer: less ? 0 : 1,
    });
  }
  out.clear();
  step(lo < n ? { [lo]: "done" } : {}, lo < n ? { lo: String(lo) } : {}, "result", [lo < n ? "widget.search.lower" : "widget.search.lowerEnd", { i: lo, v: a[lo], t, n }]);
  return lo;
}
