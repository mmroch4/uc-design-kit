/**
 * Disjoint sets of <uc-widget-union-find>, as step lists
 * (docs/architecture/widgets-api.md 6.4). Pure: no DOM, no UC, no Math.random.
 *
 * Input: { n, ops }: the elements 0 … n − 1, each in its own set, and the
 * operations `union a b`, `find a`, `connected a b` (ops null: a default
 * script that joins neighbours, then pairs of sets, then asks). State:
 * { parent, size }; marks are element indexes, as in the parent array.
 *
 * - "compression": union by size and path compression (the version to use).
 * - "size": union by size only.
 * - "naive": parent[find(a)] = find(b), no compression, so trees can grow
 *   into long chains.
 *
 * Each step names its pseudocode block (step.code): find or
 * find-compression, union or union-size, connected. Aux: `sets` (how many
 * sets) and `height` (the tallest tree, in edges). Result: { parent,
 * answers } with the answer of every find and connected.
 */
import { InputError } from "../core/engine.js";

export const ALGORITHMS = ["compression", "size", "naive"];
export const VERBS = ["union", "find", "connected"];
export const MAX_ITEMS = 16;
const ARITY = { union: 2, find: 1, connected: 2 };
const K = "widget.union-find";
const YES_NO = [["widget.core.yes"], ["widget.core.no"]];
const elem = (v) => [`${K}.elem`, { v }];

/** The script used when there is no `ops`: neighbours, then pairs of sets, then a find and a question. */
export function defaultOps(n) {
  const ops = [];
  for (let k = 1; k < n; k *= 2) for (let i = 0; i + k < n; i += 2 * k) ops.push({ verb: "union", args: [String(i), String(i + k)] });
  if (n > 1) ops.push({ verb: "find", args: [String(n - 1)] }, { verb: "connected", args: ["1", String(n - 1)] });
  return ops;
}

/** The root of x without changing anything. */
export function rootOf(parent, x) {
  while (parent[x] !== x) x = parent[x];
  return x;
}

/** Tallest tree, in edges. */
export function height(parent) {
  let best = 0;
  parent.forEach((_, x) => {
    let d = 0;
    while (parent[x] !== x) {
      x = parent[x];
      d += 1;
    }
    best = Math.max(best, d);
  });
  return best;
}

export function run({ n = 8, ops = null }, { algorithm = "compression" } = {}, emit) {
  if (!ALGORITHMS.includes(algorithm)) throw new Error(`unknown algorithm ${algorithm}`);
  if (!Number.isInteger(n) || n < 1 || n > MAX_ITEMS) throw new InputError(`${K}.error.n`, { max: MAX_ITEMS });
  const script = ops ?? defaultOps(n);
  const list = script.map(({ verb, args }) => {
    const text = [verb, ...args].join(" ");
    if (!VERBS.includes(verb)) throw new InputError("widget.core.error.verb", { verb, verbs: VERBS.join(", ") });
    if (args.length !== ARITY[verb] || args.some((a) => !/^\d+$/.test(a) || Number(a) >= n)) throw new InputError(`${K}.error.arg`, { op: text, last: n - 1 });
    return { verb, args: args.map(Number) };
  });

  const bySize = algorithm !== "naive";
  const compress = algorithm === "compression";
  const parent = Array.from({ length: n }, (_, i) => i);
  const size = Array(n).fill(1);
  const state = { parent, size };
  const aux = () => ({ sets: parent.filter((p, i) => p === i).length, height: height(parent) });
  const step = (marks, code, line, say, more = {}) => emit({ state, marks, line, say, code, aux: aux(), ...more });
  const answers = [];

  emit({ state, marks: {}, line: null, say: [`${K}.start.${algorithm}`, { n, last: n - 1 }], code: compress ? "find-compression" : "find", aux: aux() });

  /** find(x) with one step per move up, then the compression. */
  const find = (x) => {
    const block = compress ? "find-compression" : "find";
    const path = [x];
    const visited = {};
    let r = x;
    while (parent[r] !== r) {
      visited[r] = "visited";
      step({ ...visited, [r]: "current" }, block, "up", [`${K}.up`, { v: r, p: parent[r], x }]);
      r = parent[r];
      path.push(r);
    }
    step({ ...visited, [r]: "current" }, block, "root", path.length > 1 ? [`${K}.root`, { r, x, path: path.join(" → ") }] : [`${K}.rootSelf`, { r }]);
    if (compress) {
      for (const y of path.slice(0, -2)) {
        parent[y] = r;
        step({ [y]: "swapped", [r]: "current" }, block, "compress", [`${K}.compress`, { v: y, r }]);
      }
    }
    return r;
  };

  for (const { verb, args } of list) {
    const [a, b] = args;
    if (verb === "find") {
      answers.push(find(a));
      continue;
    }
    const block = verb === "connected" ? "connected" : bySize ? "union-size" : "union";
    step({ [a]: "current", ...(b !== a ? { [b]: "current" } : {}) }, block, verb === "union" ? "roots" : null, [`${K}.op.${verb}`, { a, b }]);
    const ra = find(a);
    const rb = find(b);
    if (verb === "connected") {
      const same = ra === rb;
      answers.push(same);
      step({ [ra]: "done", [rb]: "done" }, block, "answer", [`${K}.${same ? "same" : "apart"}`, { a, b, ra, rb }], {
        predict: { ask: [`${K}.predict.connected`, { a, b }], options: YES_NO, answer: same ? 0 : 1 },
      });
      continue;
    }
    if (ra === rb) {
      step({ [ra]: "done" }, block, "same", [`${K}.already`, { a, b, r: ra }]);
      continue;
    }
    let [top, child] = [rb, ra]; // naive: parent[find(a)] = find(b)
    let predict;
    if (bySize) {
      [top, child] = size[ra] < size[rb] ? [rb, ra] : [ra, rb];
      const options = [ra, rb];
      predict = { ask: [`${K}.predict.link`, { ra, rb, sa: size[ra], sb: size[rb] }], options: options.map(elem), answer: options.indexOf(top) };
    }
    parent[child] = top;
    size[top] += size[child];
    step({ [child]: "swapped", [top]: "current" }, block, "link", [`${K}.${bySize ? (size[top] === 2 * size[child] ? "linkTie" : "linkSize") : "link"}`, { child, top, sc: size[child], st: size[top] - size[child], n: size[top] }], { predict });
  }

  const roots = parent.map((p, i) => i).filter((i) => parent[i] === i);
  emit({
    state,
    marks: Object.fromEntries(roots.map((r) => [r, "done"])),
    line: null,
    say: [`${K}.${roots.length > 1 ? "end" : "endOne"}`, { k: roots.length, sets: roots.map((r) => `{ ${parent.map((_, i) => i).filter((i) => rootOf(parent, i) === r).join(" ")} }`).join(" "), h: height(parent) }],
    code: compress ? "find-compression" : "find",
    aux: aux(),
  });
  return { parent: parent.slice(), answers };
}
