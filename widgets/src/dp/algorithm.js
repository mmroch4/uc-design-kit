/**
 * The dynamic programming tables of <uc-widget-dp>, as step lists
 * (docs/plan/widgets-api.md 6.4). Pure: no DOM, no UC, no Math.random.
 *
 * Input (the fields of the chosen problem; the others are ignored):
 *   lcs, edit-distance  { a, b }                     strings, 1–8 characters
 *   knapsack            { weights, values, capacity } 1–8 items, capacity 1–8
 *   coins               { coins, amount }             1–6 distinct coins, amount 1–8
 * The algorithm is the problem. State: { t } — the table, rows of cells,
 * `null` for a cell not filled yet and "∞" for an impossible amount. Marks
 * are grid cells "r,c". One step fills the base cells, then one step per
 * cell (the cell current, the cells it reads compared); then one step per
 * cell of the reconstruction path, from the answer back (the path done).
 *
 * Result: { value, table, and the reconstruction } — lcs: the string;
 * edit-distance: the path of operations, first to last ({ op, i, j }, op one
 * of keep, sub, del, ins); knapsack: the items taken (numbers from 1);
 * coins: the coins used (none when the amount is impossible).
 */
import { InputError } from "../core/engine.js";

export const ALGORITHMS = ["lcs", "edit-distance", "knapsack", "coins"];
export const LIMITS = { chars: 8, items: 8, capacity: 8, coins: 6, amount: 8 };
export const INFINITY = "∞";
const K = "widget.dp";

/**
 * The predict question for a cell: its value among three consecutive numbers
 * (never negative); where the answer sits among them depends on the cell, so
 * it is not always the middle one.
 */
function ask(cell, v, shift) {
  if (!Number.isFinite(v)) return undefined;
  const low = Math.max(0, v - (shift % 3));
  const options = [low, low + 1, low + 2];
  return { ask: [`${K}.predict`, { cell }], options: options.map((x) => ["widget.core.value", { v: x }]), answer: options.indexOf(v) };
}

export function run(input, { algorithm = "lcs" } = {}, emit) {
  if (!ALGORITHMS.includes(algorithm)) throw new Error(`unknown algorithm ${algorithm}`);
  const coins = algorithm === "coins";
  const text = algorithm === "lcs" || algorithm === "edit-distance";
  const a = text ? [...input.a] : [];
  const b = text ? [...input.b] : [];
  const w = input.weights || [];
  const val = input.values || [];
  const coinList = coins ? input.coins.slice().sort((x, y) => x - y) : [];
  const rows = coins ? 1 : text ? a.length + 1 : w.length + 1;
  const cols = coins ? input.amount + 1 : text ? b.length + 1 : input.capacity + 1;

  // dp is the working table (Infinity allowed); t is what the steps show.
  const dp = Array.from({ length: rows }, () => Array(cols).fill(null));
  const t = Array.from({ length: rows }, () => Array(cols).fill(null));
  const set = (r, c, v) => {
    dp[r][c] = v;
    t[r][c] = v === Infinity ? INFINITY : v;
  };
  const state = { t };
  const path = [];
  const out = [];
  const aux = () => {
    if (algorithm === "lcs") return { lcs: out.slice() };
    if (algorithm === "edit-distance") return { ops: out.slice() };
    if (coins) return { coins: coinList.slice(), used: out.slice() };
    return { items: w.map((p, i) => `${i + 1}: p=${p} v=${val[i]}`), taken: out.slice() };
  };
  const pathMarks = () => Object.fromEntries(path.map((id) => [id, "done"]));
  const step = (marks, line, say, predict) => emit({ state, marks, line, say, aux: aux(), ...(predict ? { predict } : {}) });
  const id = (r, c) => `${r},${c}`;
  const name = (r, c) => (coins ? `dp[${c}]` : `dp[${r}][${c}]`);
  const show = (v) => (v === Infinity ? INFINITY : v);

  const start = { a: input.a, b: input.b, r: rows, c: cols, n: w.length, W: input.capacity, A: input.amount, coins: coinList.join(" ") };
  step({}, null, [`${K}.start.${algorithm}`, start]);

  // Base cells: row 0 and column 0 (coins: dp[0]).
  const base = {};
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      if (coins ? c === 0 : r === 0 || c === 0) {
        set(r, c, algorithm === "edit-distance" ? r + c : 0);
        base[id(r, c)] = "current";
      }
    }
  }
  step(base, "base", [`${K}.base.${algorithm}`, {}]);

  // Filling, row by row.
  const last = rows - 1;
  for (let r = coins ? 0 : 1; r < rows; r += 1) {
    for (let c = 1; c < cols; c += 1) {
      const cell = name(r, c);
      let v;
      let marks;
      let line;
      let say;
      if (text) {
        const p = { i: r, j: c, x: a[r - 1], y: b[c - 1], cell, d: name(r - 1, c - 1), u: name(r - 1, c), l: name(r, c - 1), dv: dp[r - 1][c - 1], uv: dp[r - 1][c], lv: dp[r][c - 1] };
        if (a[r - 1] === b[c - 1]) {
          v = dp[r - 1][c - 1] + (algorithm === "lcs" ? 1 : 0);
          marks = { [id(r - 1, c - 1)]: "compared" };
          line = algorithm === "lcs" ? "match" : "same";
          say = [`${K}.${line}`, { ...p, v }];
        } else {
          v = algorithm === "lcs" ? Math.max(p.uv, p.lv) : 1 + Math.min(p.dv, p.uv, p.lv);
          marks = { [id(r - 1, c)]: "compared", [id(r, c - 1)]: "compared" };
          if (algorithm !== "lcs") marks[id(r - 1, c - 1)] = "compared";
          line = algorithm === "lcs" ? "max" : "min";
          say = [`${K}.${algorithm === "lcs" ? "differ" : "edit"}`, { ...p, v }];
        }
      } else if (coins) {
        const fit = coinList.filter((m) => m <= c);
        marks = {};
        for (const m of fit) marks[id(0, c - m)] = "compared";
        if (!fit.length) {
          v = Infinity;
          line = "none";
          say = [`${K}.none`, { x: c, cell }];
        } else {
          const best = Math.min(...fit.map((m) => dp[0][c - m]));
          v = best + 1;
          line = "min";
          say = [`${K}.coin`, { cell, reads: fit.map((m) => name(0, c - m)).join(", "), vals: fit.map((m) => show(dp[0][c - m])).join(", "), v: show(v) }];
        }
      } else {
        const p = { k: r, p: w[r - 1], q: val[r - 1], c, cell, u: name(r - 1, c), uv: dp[r - 1][c] };
        marks = { [id(r - 1, c)]: "compared" };
        if (w[r - 1] > c) {
          v = dp[r - 1][c];
          line = "skip";
          say = [`${K}.skip`, { ...p, v }];
        } else {
          const back = dp[r - 1][c - w[r - 1]];
          v = Math.max(dp[r - 1][c], back + val[r - 1]);
          marks[id(r - 1, c - w[r - 1])] = "compared";
          line = "max";
          say = [`${K}.fit`, { ...p, l: name(r - 1, c - w[r - 1]), lv: back, v }];
        }
      }
      set(r, c, v);
      marks[id(r, c)] = "current";
      step(marks, line, say, coins || r === last ? ask(cell, v, r + c) : undefined);
    }
  }

  // Reconstruction, from the answer back.
  let r = last;
  let c = cols - 1;
  const value = dp[r][c];
  const result = { value: show(value), table: t.map((row) => row.slice()) };
  const visit = (line, say) => {
    path.push(id(r, c));
    step({ ...pathMarks(), [id(r, c)]: "current" }, line, say);
  };
  if (algorithm === "lcs") {
    while (r > 0 && c > 0) {
      const cell = name(r, c);
      if (a[r - 1] === b[c - 1]) {
        out.unshift(a[r - 1]);
        visit("take", [`${K}.take`, { cell, x: a[r - 1], i: r, j: c }]);
        r -= 1;
        c -= 1;
      } else if (dp[r - 1][c] >= dp[r][c - 1]) {
        visit("up", [`${K}.up`, { cell, u: name(r - 1, c), uv: dp[r - 1][c], lv: dp[r][c - 1] }]);
        r -= 1;
      } else {
        visit("left", [`${K}.left`, { cell, l: name(r, c - 1), uv: dp[r - 1][c], lv: dp[r][c - 1] }]);
        c -= 1;
      }
    }
    visit("back", [`${K}.stop`, { cell: name(r, c) }]);
    result.lcs = out.join("");
    step(pathMarks(), null, [`${K}.end.lcs`, { v: value, s: result.lcs || "—" }]);
  } else if (algorithm === "edit-distance") {
    const ops = [];
    while (r > 0 || c > 0) {
      const cell = name(r, c);
      const x = a[r - 1];
      const y = b[c - 1];
      if (r > 0 && c > 0 && x === y && dp[r][c] === dp[r - 1][c - 1]) {
        ops.unshift({ op: "keep", i: r, j: c });
        visit("keep", [`${K}.keep`, { cell, x }]);
        r -= 1;
        c -= 1;
      } else if (r > 0 && c > 0 && dp[r][c] === dp[r - 1][c - 1] + 1) {
        ops.unshift({ op: "sub", i: r, j: c });
        out.unshift(`${x}→${y}`);
        visit("sub", [`${K}.sub`, { cell, x, y }]);
        r -= 1;
        c -= 1;
      } else if (r > 0 && dp[r][c] === dp[r - 1][c] + 1) {
        ops.unshift({ op: "del", i: r, j: c });
        out.unshift(`−${x}`);
        visit("del", [`${K}.del`, { cell, x }]);
        r -= 1;
      } else {
        ops.unshift({ op: "ins", i: r, j: c });
        out.unshift(`+${y}`);
        visit("ins", [`${K}.ins`, { cell, y }]);
        c -= 1;
      }
    }
    visit("back", [`${K}.stop`, { cell: name(0, 0) }]);
    result.ops = ops;
    step(pathMarks(), null, [value ? `${K}.end.edit` : `${K}.end.equal`, { v: value, a: input.a, b: input.b, ops: out.join(", ") }]);
  } else if (coins) {
    result.used = [];
    if (value !== Infinity) {
      while (c > 0) {
        const m = coinList.find((coin) => coin <= c && dp[0][c - coin] + 1 === dp[0][c]);
        out.push(m);
        result.used.push(m);
        visit("use", [`${K}.use`, { cell: name(0, c), v: dp[0][c], from: name(0, c - m), m, rest: c - m }]);
        c -= m;
      }
      visit("back", [`${K}.stop`, { cell: name(0, 0) }]);
    }
    step(pathMarks(), null, value === Infinity ? [`${K}.end.impossible`, { A: input.amount, coins: coinList.join(" ") }] : [`${K}.end.coins`, { A: input.amount, v: value, used: out.join(" + ") }]);
  } else {
    result.items = [];
    for (; r > 0; r -= 1) {
      const p = { cell: name(r, c), v: dp[r][c], u: name(r - 1, c), uv: dp[r - 1][c], k: r, p: w[r - 1], q: val[r - 1] };
      if (dp[r][c] !== dp[r - 1][c]) {
        result.items.unshift(r);
        out.unshift(r);
        visit("take", [`${K}.takeItem`, { ...p, rest: c - w[r - 1] }]);
        c -= w[r - 1];
      } else {
        visit("leave", [`${K}.leaveItem`, p]);
      }
    }
    visit("back", [`${K}.stop`, { cell: name(0, c) }]);
    const weight = result.items.reduce((sum, k) => sum + w[k - 1], 0);
    step(pathMarks(), null, [result.items.length ? `${K}.end.knapsack` : `${K}.end.empty`, { v: value, items: out.join(", "), p: weight, W: input.capacity }]);
  }
  return result;
}

/** Checks a parsed input against the limits; throws InputError. */
export function check(input, algorithm) {
  const fail = (key, params) => {
    throw new InputError(`${K}.error.${key}`, params);
  };
  if (algorithm === "lcs" || algorithm === "edit-distance") {
    for (const s of [input.a, input.b]) if (!/^\S{1,8}$/u.test(s) || [...s].length > LIMITS.chars) fail("string", { max: LIMITS.chars });
  } else if (algorithm === "knapsack") {
    const { weights, values, capacity } = input;
    if (!weights.length || weights.length > LIMITS.items || weights.length !== values.length) fail("items", { max: LIMITS.items });
    if (![...weights, ...values].every((x) => x > 0)) fail("positive", {});
    if (!Number.isInteger(capacity) || capacity < 1 || capacity > LIMITS.capacity) fail("capacity", { max: LIMITS.capacity });
  } else {
    const { coins, amount } = input;
    if (!coins.length || coins.length > LIMITS.coins || new Set(coins).size !== coins.length || !coins.every((x) => x > 0)) fail("coins", { max: LIMITS.coins });
    if (!Number.isInteger(amount) || amount < 1 || amount > LIMITS.amount) fail("amount", { max: LIMITS.amount });
  }
  return input;
}
