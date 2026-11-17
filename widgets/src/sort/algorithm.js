/**
 * The sorting algorithms of <uc-widget-sort>, as step lists
 * (docs/architecture/widgets-api.md 6.4). Pure: no DOM, no UC, no Math.random.
 *
 * Each step's state is { a }: the array, where `null` is an empty cell (a
 * value held outside the array: x in insertion sort, the two halves in merge
 * sort, the counts in counting sort, all shown in `aux`). So the values in
 * `a` plus the values in `aux` are always the input's values.
 */
import { InputError, marksOf, range } from "../core/engine.js";

export const ALGORITHMS = ["bubble", "selection", "insertion", "merge", "quick", "counting"];
export const PIVOTS = ["last", "first", "middle", "random"];
/** Counting sort keeps one count per value between the minimum and the maximum. */
export const COUNTING_RANGE = 100;

const YES_NO = [["widget.core.yes"], ["widget.core.no"]];
const SWAPS = ["bubble", "selection", "quick"];

/** Pointers as element ids; negative or missing ones are left out. */
function pointers(named) {
  const out = {};
  for (const [name, index] of Object.entries(named)) if (index !== undefined && index >= 0) out[name] = String(index);
  return out;
}

export function run(input, { algorithm = "bubble", pivot = "last", random } = {}, emit) {
  if (!ALGORITHMS.includes(algorithm)) throw new Error(`unknown algorithm ${algorithm}`);
  const a = input.slice();
  const n = a.length;
  const done = new Set();
  const stats = algorithm === "counting" ? { writes: 0 } : SWAPS.includes(algorithm) ? { comparisons: 0, swaps: 0 } : { comparisons: 0, writes: 0 };
  const emptyAux = { insertion: { x: null }, merge: { left: [], right: [] }, counting: { count: [] } }[algorithm];
  let aux = emptyAux;

  /** Emits a step; elements already in their final place keep the "done" mark. */
  const step = ({ marks = {}, point = {}, line = null, say, predict, keepDone = true }) => {
    const all = keepDone ? marksOf(done, "done") : {};
    emit({ state: { a }, marks: { ...all, ...marks }, pointers: pointers(point), line, say, stats, ...(aux ? { aux } : {}), ...(predict ? { predict } : {}) });
  };
  const swap = (i, j) => {
    [a[i], a[j]] = [a[j], a[i]];
    stats.swaps += 1;
  };

  step({ say: n ? ["widget.sort.start", { n }] : ["widget.sort.empty"], keepDone: false });

  const sorts = {
    bubble() {
      for (let end = n - 1; end > 0; end -= 1) {
        for (let j = 0; j < end; j += 1) {
          stats.comparisons += 1;
          const larger = a[j] > a[j + 1];
          const values = { a: a[j], b: a[j + 1] };
          step({
            marks: marksOf([j, j + 1], "compared"),
            point: { j },
            line: "compare",
            say: [larger ? "widget.sort.greater" : "widget.sort.notGreater", values],
            predict: { ask: ["widget.sort.predict.swap", values], options: YES_NO, answer: larger ? 0 : 1 },
          });
          if (larger) {
            swap(j, j + 1);
            step({ marks: marksOf([j, j + 1], "swapped"), point: { j }, line: "swap", say: ["widget.sort.swap", values] });
          }
        }
        done.add(end);
      }
    },

    selection() {
      for (let i = 0; i < n - 1; i += 1) {
        let min = i;
        step({ marks: { [i]: "current" }, point: { i, min }, line: "min", say: ["widget.sort.selectStart", { i, v: a[i] }] });
        for (let j = i + 1; j < n; j += 1) {
          stats.comparisons += 1;
          const smaller = a[j] < a[min];
          const values = { a: a[j], b: a[min] };
          step({
            marks: { [min]: "current", [j]: "compared" },
            point: { i, j, min },
            line: "compare",
            say: [smaller ? "widget.sort.newMin" : "widget.sort.notMin", values],
            predict: { ask: ["widget.sort.predict.min", values], options: YES_NO, answer: smaller ? 0 : 1 },
          });
          if (smaller) min = j;
        }
        if (min !== i) {
          const values = { a: a[i], b: a[min] };
          swap(i, min);
          step({ marks: marksOf([i, min], "swapped"), point: { i, min }, line: "swap", say: ["widget.sort.swap", values] });
        } else {
          step({ marks: { [i]: "current" }, point: { i, min }, line: "swap", say: ["widget.sort.inPlace", { v: a[i] }] });
        }
        done.add(i);
      }
    },

    insertion() {
      const sortedPart = (to) => marksOf(range(0, to + 1).filter((k) => a[k] !== null), "visited");
      for (let i = 1; i < n; i += 1) {
        const x = a[i];
        a[i] = null;
        aux = { x };
        step({ marks: sortedPart(i), point: { i }, line: "take", say: ["widget.sort.take", { x, i }] });
        let j = i - 1;
        while (j >= 0) {
          stats.comparisons += 1;
          const larger = a[j] > x;
          const values = { a: a[j], x };
          step({
            marks: { ...sortedPart(i), [j]: "compared" },
            point: { j },
            line: "compare",
            say: [larger ? "widget.sort.shiftYes" : "widget.sort.shiftNo", values],
            predict: { ask: ["widget.sort.predict.shift", values], options: YES_NO, answer: larger ? 0 : 1 },
          });
          if (!larger) break;
          a[j + 1] = a[j];
          a[j] = null;
          stats.writes += 1;
          step({ marks: { ...sortedPart(i), [j + 1]: "swapped" }, point: { j }, line: "shift", say: ["widget.sort.shift", { a: a[j + 1], to: j + 1 }] });
          j -= 1;
        }
        a[j + 1] = x;
        stats.writes += 1;
        aux = { x: null };
        step({ marks: { ...sortedPart(i), [j + 1]: "swapped" }, line: "insert", say: ["widget.sort.insert", { x, k: j + 1 }] });
      }
    },

    merge() {
      const sort = (lo, hi) => {
        if (lo >= hi) return;
        const mid = (lo + hi) >> 1;
        step({ marks: marksOf(range(lo, hi + 1), "visited"), point: { lo, mid, hi }, line: "split", say: ["widget.sort.split", { lo, mid, mid1: mid + 1, hi }] });
        sort(lo, mid);
        sort(mid + 1, hi);
        const left = a.slice(lo, mid + 1);
        const right = a.slice(mid + 1, hi + 1);
        for (let k = lo; k <= hi; k += 1) a[k] = null;
        aux = { left, right };
        step({ point: { lo, hi }, line: "merge", say: ["widget.sort.mergeStart", { lo, hi }] });
        for (let k = lo; k <= hi; k += 1) {
          const filled = marksOf(range(lo, k), "visited");
          if (left.length && right.length) {
            stats.comparisons += 1;
            const values = { a: left[0], b: right[0] };
            const fromLeft = left[0] <= right[0];
            a[k] = (fromLeft ? left : right).shift();
            stats.writes += 1;
            step({
              marks: { ...filled, [k]: "swapped" },
              point: { k },
              line: "compare",
              say: ["widget.sort.mergeTake", { ...values, v: a[k], k }],
              predict:
                values.a === values.b
                  ? undefined
                  : { ask: ["widget.sort.predict.merge", values], options: [["widget.core.value", { v: values.a }], ["widget.core.value", { v: values.b }]], answer: fromLeft ? 0 : 1 },
            });
          } else {
            a[k] = (left.length ? left : right).shift();
            stats.writes += 1;
            step({ marks: { ...filled, [k]: "swapped" }, point: { k }, line: "copy", say: ["widget.sort.mergeRest", { v: a[k], k }] });
          }
        }
        aux = { left: [], right: [] };
      };
      sort(0, n - 1);
    },

    quick() {
      const sort = (lo, hi) => {
        if (lo > hi) return;
        if (lo === hi) {
          done.add(lo);
          return;
        }
        const choice = { last: hi, first: lo, middle: (lo + hi) >> 1, random: random ? random.int(lo, hi) : hi }[pivot] ?? hi;
        if (choice !== hi) {
          swap(choice, hi);
          step({ marks: marksOf([choice, hi], "swapped"), point: { lo, hi }, line: "pivot", say: ["widget.sort.pivotMove", { v: a[hi] }] });
        }
        const p = a[hi];
        step({ marks: { ...marksOf(range(lo, hi), "visited"), [hi]: "current" }, point: { lo, hi }, line: "pivot", say: ["widget.sort.pivot", { v: p, lo, hi }] });
        let i = lo;
        for (let j = lo; j < hi; j += 1) {
          stats.comparisons += 1;
          const less = a[j] < p;
          const values = { a: a[j], p };
          step({
            marks: { [hi]: "current", [j]: "compared" },
            point: { i, j },
            line: "compare",
            say: [less ? "widget.sort.less" : "widget.sort.notLess", values],
            predict: { ask: ["widget.sort.predict.less", values], options: YES_NO, answer: less ? 0 : 1 },
          });
          if (less) {
            if (i !== j) {
              const moved = { a: a[j], b: a[i] };
              swap(i, j);
              step({ marks: { [hi]: "current", ...marksOf([i, j], "swapped") }, point: { i, j }, line: "swap", say: ["widget.sort.swap", moved] });
            }
            i += 1;
          }
        }
        if (i !== hi) swap(i, hi);
        done.add(i);
        step({ marks: i !== hi ? marksOf([hi], "swapped") : {}, point: { i }, line: "place", say: ["widget.sort.place", { v: p, i }] });
        sort(lo, i - 1);
        sort(i + 1, hi);
      };
      sort(0, n - 1);
    },

    counting() {
      if (!n) return;
      const min = Math.min(...a);
      const max = Math.max(...a);
      if (max - min + 1 > COUNTING_RANGE) throw new InputError("widget.sort.error.range", { max: COUNTING_RANGE });
      const count = new Array(max - min + 1).fill(0);
      const listed = () => count.map((c, v) => [v + min, c]).filter(([, c]) => c > 0).map(([v, c]) => `${v} ×${c}`);
      aux = { count: [] };
      step({ line: "init", say: ["widget.sort.countInit", { min, max }] });
      for (let i = 0; i < n; i += 1) {
        count[a[i] - min] += 1;
        aux = { count: listed() };
        step({ marks: { [i]: "current" }, point: { i }, line: "count", say: ["widget.sort.count", { v: a[i], c: count[a[i] - min] }] });
      }
      a.fill(null);
      step({ line: "clear", say: ["widget.sort.countClear"] });
      let k = 0;
      for (let v = min; v <= max; v += 1) {
        while (count[v - min] > 0) {
          a[k] = v;
          count[v - min] -= 1;
          stats.writes += 1;
          aux = { count: listed() };
          step({ marks: { ...marksOf(range(0, k), "visited"), [k]: "swapped" }, point: { k }, line: "write", say: ["widget.sort.countWrite", { v, k }] });
          k += 1;
        }
      }
    },
  };

  sorts[algorithm]();
  aux = emptyAux;
  for (let k = 0; k < n; k += 1) done.add(k);
  const summary =
    algorithm === "counting"
      ? ["widget.sort.done.counting", { ...stats }]
      : SWAPS.includes(algorithm)
        ? ["widget.sort.done.swaps", { ...stats }]
        : ["widget.sort.done.writes", { ...stats }];
  step({ say: n ? summary : ["widget.sort.empty"] });
  return a;
}
