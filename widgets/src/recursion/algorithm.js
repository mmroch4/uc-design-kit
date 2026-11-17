/**
 * The recursive calls of <uc-widget-recursion>, as step lists
 * (docs/architecture/widgets-api.md 6.4). Pure: no DOM, no UC, no Math.random.
 *
 * Input: { n }. State: { root } — the recursion tree so far, nodes
 * { id, call, value, kids }: `call` is the call as written ("fib(4)"),
 * `value` the returned value once known (null before). One step per call
 * (the new node is current, the active calls are visited and listed in
 * aux.stack) and one per return (done, with its value). Hanoi also keeps the
 * three pegs (aux.pegs) and the moves (aux.output).
 */
import { InputError } from "../core/engine.js";

export const ALGORITHMS = ["factorial", "fibonacci", "hanoi"];
/** The largest argument each algorithm draws readably (5.5). */
export const MAX_N = { factorial: 8, fibonacci: 6, hanoi: 4 };

/** n, value pairs for the predict options: the answer and two near numbers. */
function near(value) {
  const options = [...new Set([value, value + 1, Math.max(0, value - 1), value * 2])].slice(0, 3).sort((a, b) => a - b);
  return { options: options.map((v) => ["widget.core.value", { v }]), answer: options.indexOf(value) };
}

export function run({ n }, { algorithm = "factorial" } = {}, emit) {
  if (!ALGORITHMS.includes(algorithm)) throw new Error(`unknown algorithm ${algorithm}`);
  if (!Number.isInteger(n) || n < (algorithm === "hanoi" ? 1 : 0)) throw new InputError("widget.recursion.error.n", { min: algorithm === "hanoi" ? 1 : 0 });
  if (n > MAX_N[algorithm]) throw new InputError("widget.core.error.tooLarge", { max: MAX_N[algorithm] });

  const state = { root: null };
  const stack = [];
  const marks = {};
  const pegs = { A: [], B: [], C: [] };
  const moves = [];
  let count = 0;
  const aux = () => (algorithm === "hanoi" ? { stack: stack.map((node) => node.call), pegs: ["A", "B", "C"].map((p) => `${p}: ${pegs[p].join(" ") || "—"}`), output: moves.slice() } : { stack: stack.map((node) => node.call) });
  const step = (line, say, extra = {}) => emit({ state, marks: { ...marks, ...(extra.marks || {}) }, line, say, aux: aux(), ...(extra.predict ? { predict: extra.predict } : {}) });

  /** Opens a call: a new node under the caller. */
  const enter = (call, line) => {
    const node = { id: `c${(count += 1)}`, call, value: null, kids: [] };
    if (stack.length) stack[stack.length - 1].kids.push(node);
    else state.root = node;
    for (const open of stack) marks[open.id] = "visited";
    stack.push(node);
    marks[node.id] = "current";
    step(line, ["widget.recursion.call", { call }]);
    return node;
  };
  /** Closes a call with its value. */
  const leave = (node, value, line, say, predict) => {
    node.value = value;
    stack.pop();
    marks[node.id] = "done";
    if (stack.length) marks[stack[stack.length - 1].id] = "current";
    step(line, say, predict ? { predict } : {});
    return value;
  };

  step(null, [`widget.recursion.start.${algorithm}`, { n }]);

  let result;
  if (algorithm === "factorial") {
    const fact = (k, line) => {
      const node = enter(`fact(${k})`, line);
      if (k <= 1) return leave(node, 1, "base", ["widget.recursion.factBase", { k }]);
      const r = fact(k - 1, "call");
      const value = k * r;
      return leave(node, value, "return", ["widget.recursion.factReturn", { k, r, value }], { ask: ["widget.recursion.predict.value", { call: node.call }], ...near(value) });
    };
    result = fact(n, null);
  } else if (algorithm === "fibonacci") {
    const fib = (k, line) => {
      const node = enter(`fib(${k})`, line);
      if (k <= 1) return leave(node, k, "base", ["widget.recursion.fibBase", { k }]);
      const a = fib(k - 1, "left");
      const b = fib(k - 2, "right");
      const value = a + b;
      return leave(node, value, "return", ["widget.recursion.fibReturn", { k, a, b, value }], { ask: ["widget.recursion.predict.value", { call: node.call }], ...near(value) });
    };
    result = fib(n, null);
  } else {
    for (let d = n; d >= 1; d -= 1) pegs.A.push(d);
    const move = (from, to) => {
      const disk = pegs[from].pop();
      if (pegs[to].length && pegs[to][pegs[to].length - 1] < disk) throw new Error("illegal move");
      pegs[to].push(disk);
      moves.push(`${from}→${to}`);
      return disk;
    };
    const hanoi = (k, from, to, via, line) => {
      const node = enter(`h(${k},${from},${to})`, line);
      if (k === 1) {
        const disk = move(from, to);
        return leave(node, 1, "base", ["widget.recursion.hanoiBase", { disk, from, to }]);
      }
      hanoi(k - 1, from, via, to, "left");
      const disk = move(from, to);
      marks[node.id] = "current";
      step("move", ["widget.recursion.hanoiMove", { disk, from, to }]);
      hanoi(k - 1, via, to, from, "right");
      return leave(node, 2 ** k - 1, "return", ["widget.recursion.hanoiReturn", { k, from, to, moves: 2 ** k - 1 }]);
    };
    hanoi(n, "A", "C", "B", null);
    result = moves.slice();
  }
  for (const id of Object.keys(marks)) marks[id] = "done";
  step(null, [`widget.recursion.end.${algorithm}`, { n, value: algorithm === "hanoi" ? moves.length : result, calls: count }]);
  return result;
}
