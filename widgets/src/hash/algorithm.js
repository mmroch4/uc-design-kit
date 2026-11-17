/**
 * The hash table of <uc-widget-hash>, as step lists
 * (docs/architecture/widgets-api.md 6.4). Pure: no DOM, no UC, no Math.random.
 *
 * Input: { values, ops, size, maxLoad }. Keys are integers or words; the
 * hash of a key is code(k) mod m, where code(k) is the integer itself or,
 * for a word, the sum of its character codes.
 *
 * - "chaining": state { m, n, rows }: one list of keys per slot. Marks: the
 *   slot "i" and the chain cell "i,j".
 * - "linear", "quadratic": open addressing, state { m, n, a, del }: a[i] is a
 *   key or null, del[i] marks a deleted cell (a tombstone, skipped by
 *   searches and reused by insertions). Probe i of key k: (h + i) mod m or
 *   (h + i²) mod m, at most m probes. Marks: the index "i".
 *
 * `values` builds the table without steps and `ops` runs with steps (insert,
 * remove, search); without `ops`, every value is inserted with steps (5.2).
 * After an insertion, if n / m > maxLoad (null: never) and 2m ≤ 16, the table
 * doubles and every key is inserted again, one step each. stats.probes
 * counts the cells looked at. Result: { table: keys by slot, answers }.
 */
import { InputError } from "../core/engine.js";

export const ALGORITHMS = ["chaining", "linear", "quadratic"];
export const VERBS = ["insert", "remove", "search"];
export const MAX_SIZE = 16;
export const MAX_KEYS = 16;
export const MAX_CHAIN = 6;
/** Longest key, in characters (a cell holds about four; longer words are squeezed). */
export const MAX_WORD = 6;

/** code(k): the integer, or the sum of the character codes of a word. */
export const code = (key) => (typeof key === "number" ? key : [...key].reduce((sum, ch) => sum + ch.codePointAt(0), 0));
export const hash = (key, m) => ((code(key) % m) + m) % m;
const fixed = (x) => Math.round(x * 100) / 100;

export function run({ values = [], ops = null, size = 7, maxLoad = 0.75 }, { algorithm = "chaining" } = {}, emit) {
  if (!ALGORITHMS.includes(algorithm)) throw new Error(`unknown algorithm ${algorithm}`);
  const chaining = algorithm === "chaining";
  const quadratic = algorithm === "quadratic";
  const empty = (m) => (chaining ? { m, n: 0, rows: Array.from({ length: m }, () => []) } : { m, n: 0, a: Array(m).fill(null), del: Array(m).fill(false) });
  let state = empty(size);
  const stats = { probes: 0 };
  let block = null;
  const load = () => `${state.n}/${state.m} = ${fixed(state.n / state.m)}`;
  const step = (marks, line, say, extra = {}) => emit({ state, marks, line, say, code: block, stats, aux: { load: load() }, ...extra });
  const params = (key) => ({ k: key, c: code(key), m: state.m, h: hash(key, state.m) });

  /** Open addressing: the probe sequence of a key. */
  const probe = (h, i) => (quadratic ? (h + i * i) % state.m : (h + i) % state.m);

  /** Quiet insertion (initial values, rehash); returns the slot or -1 (full or duplicate). */
  const place = (key) => {
    const h = hash(key, state.m);
    if (chaining) {
      if (state.rows[h].includes(key)) return -1;
      if (state.rows[h].length >= MAX_CHAIN) throw new InputError("widget.hash.error.chain", { max: MAX_CHAIN });
      state.rows[h].push(key);
      state.n += 1;
      return h;
    }
    let free = -1;
    for (let i = 0; i < state.m; i += 1) {
      const j = probe(h, i);
      if (state.a[j] === key && !state.del[j]) return -1;
      if (state.a[j] === null || state.del[j]) {
        if (free < 0) free = j;
        if (state.a[j] === null) break;
      }
    }
    if (free >= 0) {
      state.a[free] = key;
      state.del[free] = false;
      state.n += 1;
    }
    return free;
  };

  /** Doubles the table when the load passes maxLoad: one step per key moved, or quietly. */
  const grow = (quiet = false) => {
    while (maxLoad !== null && state.n / state.m > maxLoad) {
      const p = { load: fixed(state.n / state.m), max: maxLoad, m: state.m, to: 2 * state.m };
      if (2 * state.m > MAX_SIZE) {
        if (!quiet) step({}, "grow", ["widget.hash.cannotGrow", { ...p, size: MAX_SIZE }]);
        return;
      }
      const keys = chaining ? state.rows.flat() : state.a.filter((key, i) => key !== null && !state.del[i]);
      state = empty(2 * state.m);
      if (!quiet) step({}, "grow", ["widget.hash.grow", p]);
      for (const key of keys) {
        const j = place(key);
        if (!quiet) step(chaining ? { [`${j},${state.rows[j].length - 1}`]: "done" } : { [j]: "done" }, "rehash", ["widget.hash.moved", { ...params(key), j }]);
      }
    }
  };

  /**
   * Looks for a key with steps. Open addressing: returns { at, free } (the
   * key's index or -1, the first reusable index or -1); chaining: { at } (the
   * position in the chain or -1) and the slot h.
   */
  const find = (key, forInsert) => {
    const p = params(key);
    if (chaining) {
      const row = state.rows[p.h];
      step({ [p.h]: "current" }, "hash", ["widget.hash.slot", p]);
      for (let j = 0; j < row.length; j += 1) {
        stats.probes += 1;
        const hit = row[j] === key;
        step({ [p.h]: "visited", [`${p.h},${j}`]: hit ? "done" : "compared" }, hit ? "found" : "next", [hit ? "widget.hash.chainHit" : "widget.hash.chainMiss", { ...p, x: row[j] }]);
        if (hit) return { h: p.h, at: j };
      }
      step({ [p.h]: "visited" }, "end", [forInsert ? "widget.hash.chainEnd" : "widget.hash.notFound", p]);
      return { h: p.h, at: -1 };
    }
    step({ [p.h]: "current" }, "hash", ["widget.hash.home", p], { pointers: { h: p.h } });
    let free = -1;
    const seen = {};
    for (let i = 0; i < state.m; i += 1) {
      const j = probe(p.h, i);
      stats.probes += 1;
      const extra = { pointers: { h: p.h, j } };
      const q = { ...p, i, j, x: state.a[j] };
      const marks = { ...seen, [j]: "compared" };
      if (state.a[j] === null) {
        step({ ...seen, [j]: "current" }, "empty", [forInsert && free < 0 ? "widget.hash.free" : "widget.hash.emptyCell", q], extra);
        return { at: -1, free: free < 0 ? j : free };
      }
      if (state.del[j]) {
        if (free < 0) free = j;
        step(marks, "next", ["widget.hash.deleted", q], extra);
      } else if (state.a[j] === key) {
        step({ ...seen, [j]: "done" }, "found", ["widget.hash.hit", q], extra);
        return { at: j, free };
      } else {
        step(marks, "next", [quadratic ? "widget.hash.busyQuadratic" : "widget.hash.busy", { ...q, next: probe(p.h, i + 1) }], extra);
      }
      seen[j] = "visited";
    }
    step(seen, "full", ["widget.hash.allProbed", p]);
    return { at: -1, free };
  };

  if (values.length > MAX_KEYS) throw new InputError("widget.core.error.tooLarge", { max: MAX_KEYS });
  if (ops !== null) {
    for (const key of values) {
      const present = chaining ? state.rows.some((row) => row.includes(key)) : state.a.includes(key);
      if (!present && place(key) < 0) throw new InputError("widget.hash.error.full", { m: state.m });
      grow(true);
    }
  }
  step({}, null, [state.n ? "widget.hash.start" : "widget.hash.startEmpty", { n: state.n, m: state.m }]);
  const list = ops !== null ? ops : values.map((v) => ({ verb: "insert", args: [String(v)] }));
  const answers = [];
  for (const { verb, args } of list) {
    block = chaining ? `chain-${verb}` : verb;
    if (args.length !== 1) throw new InputError("widget.hash.error.arg", { verb });
    if (args[0].length > MAX_WORD) throw new InputError("widget.hash.error.long", { key: args[0], max: MAX_WORD });
    const key = /^[+-]?\d+$/.test(args[0]) ? Number(args[0]) : args[0];
    step({}, null, [`widget.hash.${verb}`, { k: key }]);
    const found = find(key, verb === "insert");

    if (verb === "search") {
      answers.push(found.at >= 0);
      continue;
    }
    if (verb === "remove") {
      answers.push(found.at >= 0);
      if (found.at < 0) continue;
      state.n -= 1;
      if (chaining) {
        state.rows[found.h].splice(found.at, 1);
        step({ [found.h]: "done" }, "unlink", ["widget.hash.unlinked", { k: key, h: found.h }]);
      } else {
        state.del[found.at] = true;
        step({ [found.at]: "done" }, "mark", ["widget.hash.tombstone", { k: key, j: found.at }]);
      }
      continue;
    }
    // insert
    if (found.at >= 0) {
      step({}, "found", ["widget.hash.duplicate", { k: key }]);
      answers.push(false);
      continue;
    }
    if (state.n >= MAX_KEYS) throw new InputError("widget.core.error.tooLarge", { max: MAX_KEYS });
    if (chaining) {
      if (state.rows[found.h].length >= MAX_CHAIN) throw new InputError("widget.hash.error.chain", { max: MAX_CHAIN });
      state.rows[found.h].push(key);
      state.n += 1;
      step({ [`${found.h},${state.rows[found.h].length - 1}`]: "done" }, "add", ["widget.hash.appended", { k: key, h: found.h }]);
    } else if (found.free < 0) {
      step({}, "full", ["widget.hash.full", { k: key }]);
      answers.push(false);
      continue;
    } else {
      const reused = state.del[found.free];
      state.a[found.free] = key;
      state.del[found.free] = false;
      state.n += 1;
      step({ [found.free]: "done" }, "add", [reused ? "widget.hash.reused" : "widget.hash.stored", { k: key, j: found.free }]);
    }
    answers.push(true);
    grow();
  }
  block = null;
  const table = chaining ? state.rows.map((row) => row.slice()) : state.a.map((key, i) => (state.del[i] ? null : key));
  step({}, null, ["widget.hash.end", { n: state.n, m: state.m, load: fixed(state.n / state.m) }]);
  return { table, answers };
}
