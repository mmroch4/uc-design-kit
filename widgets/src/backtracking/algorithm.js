/**
 * The backtracking searches of <uc-widget-backtracking>, as step lists
 * (docs/plan/widgets-api.md 6.4). Pure: no DOM, no UC, no Math.random.
 *
 * - "queens": input { n, all }. State { board } (n × n, "Q" or null). One
 *   step per try of a cell (row by row, columns left to right): a cut when a
 *   queen already on the board attacks it (the tried cell compared, the
 *   attacking queen swapped), else the queen is placed (current; the others
 *   visited). Coming back to a row takes its queen away. Stops at the first
 *   solution, or finds them all with `all`. Aux: `stack` (the queens, one per
 *   row), `output` (the solutions, as the column of each row), `cuts`.
 * - "subsets": input { values, target }. State { root }, the search tree so
 *   far: nodes { id, label, kids }, id = the decisions from the root ("1"
 *   take, "0" leave), label "+v" / "−v". One step per node. With a target,
 *   a branch is cut when its sum passes the target, or cannot reach it with
 *   the values left. Leaves that reach the end are solutions (done).
 * - "permutations": input { values } (distinct tokens). Same tree, a node
 *   per element placed; only unused elements are tried, so nothing is cut.
 *
 * Result: the solutions (queens: arrays of columns; subsets: arrays of the
 * chosen positions; permutations: arrays of values).
 */
import { InputError } from "../core/engine.js";

export const ALGORITHMS = ["queens", "subsets", "permutations"];
export const LIMITS = { n: 8, subsets: 4, permutations: 3 };
const K = "widget.backtracking";
const YES_NO = [["widget.core.yes"], ["widget.core.no"]];
// Spaces inside the braces, so "{1}" is not read as a placeholder of the sentence.
const set = (list) => (list.length ? `{ ${list.join(", ")} }` : "{ }");

export function run(input, { algorithm = "queens" } = {}, emit) {
  if (!ALGORITHMS.includes(algorithm)) throw new Error(`unknown algorithm ${algorithm}`);
  return algorithm === "queens" ? queens(input, emit) : tree(input, algorithm, emit);
}

function queens({ n, all = false }, emit) {
  if (!Number.isInteger(n) || n < 1 || n > LIMITS.n) throw new InputError(`${K}.error.n`, { max: LIMITS.n });
  const board = Array.from({ length: n }, () => Array(n).fill(null));
  const cols = []; // cols[r] = the column of the queen in row r
  const solutions = [];
  let cuts = 0;
  const placed = () => Object.fromEntries(cols.map((c, r) => [`${r},${c}`, "visited"]));
  const step = (marks, line, say, predict) =>
    emit({ state: { board }, marks, line, say, aux: { stack: cols.map((c, r) => `(${r}, ${c})`), output: solutions.map((s) => s.join(" ")), cuts }, ...(predict ? { predict } : {}) });

  step({}, null, [`${K}.start.queens${all ? "All" : ""}`, { n }]);

  const solve = (r) => {
    if (r === n) {
      solutions.push(cols.slice());
      if (all) step(Object.fromEntries(cols.map((c, row) => [`${row},${c}`, "done"])), "solution", [`${K}.solution`, { k: solutions.length, cols: cols.join(" ") }]);
      return !all;
    }
    for (let c = 0; c < n; c += 1) {
      // No question on the empty board: every cell of row 0 is free.
      const predictOf = (yes) => (r ? { ask: [`${K}.predict.queen`, { r, c }], options: YES_NO, answer: yes ? 0 : 1 } : undefined);
      const qr = cols.findIndex((qc, row) => qc === c || Math.abs(qc - c) === r - row);
      if (qr >= 0) {
        cuts += 1;
        const kind = cols[qr] === c ? "column" : "diagonal";
        step({ ...placed(), [`${qr},${cols[qr]}`]: "swapped", [`${r},${c}`]: "compared" }, "cut", [`${K}.attack.${kind}`, { r, c, qr, qc: cols[qr] }], predictOf(false));
        continue;
      }
      cols.push(c);
      board[r][c] = "Q";
      step({ ...placed(), [`${r},${c}`]: "current" }, "place", [`${K}.place`, { r, c }], predictOf(true));
      if (solve(r + 1)) return true;
      cols.pop();
      board[r][c] = null;
      step({ ...placed(), [`${r},${c}`]: "compared" }, "remove", [`${K}.remove`, { r, c }]);
    }
    return false;
  };
  solve(0);

  const k = solutions.length;
  if (!k) step({}, null, [`${K}.end.none`, { n, cuts }]);
  else if (!all) step(Object.fromEntries(cols.map((c, r) => [`${r},${c}`, "done"])), "solution", [`${K}.end.first`, { cols: cols.join(" "), cuts }]);
  else step({}, null, [`${K}.end.all`, { n, k, cuts }]);
  return solutions;
}

function tree({ values, target = null }, algorithm, emit) {
  const subsets = algorithm === "subsets";
  const max = subsets ? LIMITS.subsets : LIMITS.permutations;
  if (!values.length || values.length > max) throw new InputError(`${K}.error.values`, { max });
  if (subsets && !values.every((v) => Number.isInteger(v) && v > 0)) throw new InputError(`${K}.error.positive`);
  if (!subsets && new Set(values).size !== values.length) throw new InputError(`${K}.error.repeated`);
  const n = values.length;
  const root = { id: "r", label: subsets ? "{ }" : "[ ]", kids: [] };
  const marks = {}; // kept between steps: cuts (compared) and solutions (done)
  const solutions = [];
  let cuts = 0;
  const step = (path, line, say, predict) => {
    const active = {};
    for (const node of path) active[node.id] = "visited";
    active[path[path.length - 1].id] = marks[path[path.length - 1].id] || "current";
    emit({ state: { root }, marks: path.length > 1 ? { ...marks, ...active } : { ...marks }, line, say, aux: { output: solutions.map((s) => (subsets ? set(s.map((i) => values[i])) : s.join(" "))), ...(subsets && target !== null ? { cuts } : {}) }, ...(predict ? { predict } : {}) });
  };

  step([root], null, [`${K}.start.${algorithm}${target === null ? "" : "Target"}`, { values: values.join(" "), n, t: target }]);

  if (subsets) {
    const total = values.reduce((s, v) => s + v, 0);
    if (target !== null && total < target) {
      marks.r = "compared";
      cuts = 1;
      step([root], "cut", [`${K}.rootShort`, { total, t: target }]);
    } else {
      const visit = (i, chosen, sum, path) => {
        if (i === n) return;
        const rest = values.slice(i + 1).reduce((s, v) => s + v, 0);
        for (const take of [true, false]) {
          const v = values[i];
          const s = sum + (take ? v : 0);
          const parent = path[path.length - 1];
          const node = { id: `${parent.id}${take ? 1 : 0}`, label: `${take ? "+" : "−"}${v}`, kids: [] };
          parent.kids.push(node);
          const list = take ? [...chosen, i] : chosen;
          const p = { v, set: set(list.map((k) => values[k])), s, t: target, rest };
          const cut = target !== null && (s > target || s + rest < target);
          const predict = target === null ? undefined : { ask: [`${K}.predict.${take ? "take" : "leave"}`, { v }], options: YES_NO, answer: cut ? 0 : 1 };
          const here = [...path, node];
          if (cut) {
            cuts += 1;
            marks[node.id] = "compared";
            step(here, "cut", [`${K}.${s > target ? "over" : "short"}`, p], predict);
          } else if (i === n - 1) {
            solutions.push(list);
            marks[node.id] = "done";
            step(here, [take ? "take" : "leave", "leaf"], [`${K}.${take ? "take" : "leave"}Leaf`, p], predict);
          } else {
            step(here, take ? "take" : "leave", [`${K}.${take ? "take" : "leave"}`, p], predict);
            visit(i + 1, list, s, here);
          }
        }
      };
      visit(0, [], 0, [root]);
    }
  } else {
    const visit = (current, path) => {
      for (const v of values) {
        if (current.includes(v)) continue;
        const parent = path[path.length - 1];
        const node = { id: `${parent.id}.${values.indexOf(v)}`, label: String(v), kids: [] };
        parent.kids.push(node);
        const list = [...current, v];
        const here = [...path, node];
        if (list.length === n) {
          solutions.push(list);
          marks[node.id] = "done";
          step(here, ["place", "leaf"], [`${K}.permutation`, { v, list: list.join(" ") }]);
        } else {
          step(here, "place", [`${K}.placeValue`, { v, list: list.join(" ") }]);
          visit(list, here);
        }
      }
    };
    visit([], [root]);
  }

  const k = solutions.length;
  const list = solutions.map((s) => (subsets ? set(s.map((i) => values[i])) : s.join(" "))).join("; ");
  const end = subsets ? (target === null ? "subsets" : k ? "target" : "noTarget") : "permutations";
  emit({ state: { root }, marks: { ...marks }, line: null, say: [`${K}.end.${end}`, { k, list, t: target, cuts }], aux: { output: list ? list.split("; ") : [], ...(subsets && target !== null ? { cuts } : {}) } });
  return solutions;
}
