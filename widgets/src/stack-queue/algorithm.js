/**
 * The stack and the queue of <uc-widget-stack-queue>, as step lists
 * (docs/plan/widgets-api.md 6.4). Pure: no DOM, no UC, no Math.random.
 *
 * Input: { values, ops, impl: "array" | "list", capacity }. `values` fills
 * the structure without steps when `ops` is given; otherwise every value is
 * pushed / enqueued with steps.
 *
 * - impl "array": state { impl, a } with `null` for free cells; the queue is
 *   a circular buffer (front, back wrap around). Fixed capacity: a push or
 *   an enqueue on a full array is an overflow and changes nothing.
 * - impl "list": state { impl, nodes, head, raised } as in uc-widget-list;
 *   the stack's top is the first node, the queue has front and back.
 *
 * Result: { values (bottom → top, or front → back), answers }.
 */
import { InputError } from "../core/engine.js";

export const ALGORITHMS = ["stack", "queue"];
export const IMPLS = ["array", "list"];
export const VERBS = { stack: ["push", "pop", "peek"], queue: ["enqueue", "dequeue", "peek"] };
export const MAX_ITEMS = { array: 16, list: 10 };

const INTEGER = /^[+-]?\d+$/;

export function run({ values = [], ops = null, impl = "array", capacity = 8 }, { algorithm = "stack" } = {}, emit) {
  if (!ALGORITHMS.includes(algorithm)) throw new Error(`unknown algorithm ${algorithm}`);
  const stack = algorithm === "stack";
  const add = stack ? "push" : "enqueue";
  const cap = impl === "array" ? capacity : MAX_ITEMS.list;
  if (impl === "array" && (capacity < 1 || capacity > MAX_ITEMS.array)) throw new InputError("widget.core.error.tooLarge", { max: MAX_ITEMS.array });
  if (ops !== null && values.length > cap) throw new InputError("widget.core.error.tooLarge", { max: cap });

  // The model: an array of items, bottom → top (stack) or front → back (queue).
  // Array implementation: cells and the index of the front (queue) / bottom 0 (stack).
  const a = Array(impl === "array" ? capacity : 0).fill(null);
  let front = 0;
  let items = [];
  let count = 0;
  let code = null;
  const make = (v) => ({ id: `n${(count += 1)}`, v });
  const index = (k) => (stack ? k : (front + k) % capacity); // array cell of the k-th item

  const sync = () => {
    if (impl === "array") {
      a.fill(null);
      items.forEach((item, k) => (a[index(k)] = item.v));
    }
  };
  /** Pointers and the drawn state. `extra` are list nodes not linked yet. */
  const step = (line, say, { marks = {}, raised = null, gone = null } = {}) => {
    const n = items.length;
    let state;
    let pointers = {};
    if (impl === "array") {
      state = { impl, a: a.slice() };
      if (n) pointers = stack ? { top: String(n - 1) } : { front: String(index(0)), back: String(index(n - 1)) };
      else if (!stack) pointers = { front: String(front) };
    } else {
      // Linked: the stack's head is the top, so the nodes are drawn top first.
      const linked = stack ? items.slice().reverse() : items.slice();
      const nodes = linked.map((item, k) => ({ id: item.id, v: item.v, next: linked[k + 1] ? linked[k + 1].id : null }));
      if (raised) {
        const node = { id: raised.id, v: raised.v, next: raised.next === undefined ? null : raised.next };
        if (stack) nodes.unshift(node);
        else nodes.push(node);
      }
      if (gone) nodes.unshift({ id: gone.id, v: gone.v, next: null }); // taken out of the top / front
      state = { impl, nodes, head: linked.length ? linked[0].id : null, raised: [raised, gone].filter(Boolean).map((node) => node.id) };
      if (n) pointers = stack ? { top: linked[0].id } : { front: linked[0].id, back: linked[n - 1].id };
    }
    emit({ state, marks, pointers, line, say, aux: { size: n }, ...(code ? { code } : {}) });
  };
  const markItem = (k, state) => ({ [impl === "array" ? String(index(k)) : items[k].id]: state });

  if (ops !== null) {
    items = values.map(make);
    sync();
  }
  const list = impl === "list" ? "List" : "";
  step(null, [`widget.stack-queue.${items.length ? "start" : "startEmpty"}${list}.${algorithm}`, { n: items.length, c: cap }]);

  const script = ops !== null ? ops : values.map((v) => ({ verb: add, args: [String(v)] }));
  const answers = [];
  for (const { verb, args } of script) {
    if (!VERBS[algorithm].includes(verb)) throw new InputError("widget.core.error.verb", { verb, verbs: VERBS[algorithm].join(", ") });
    const wanted = verb === add ? 1 : 0;
    if (args.length !== wanted || !args.every((arg) => INTEGER.test(arg))) throw new InputError("widget.stack-queue.error.arg", { verb, n: wanted });
    code = `${algorithm}-${impl}`;
    const v = Number(args[0]);
    const n = items.length;

    if (verb === add) {
      step(null, [`widget.stack-queue.${verb}`, { v }]);
      if (n >= cap) {
        if (impl === "list") throw new InputError("widget.core.error.tooLarge", { max: cap });
        step("full", ["widget.stack-queue.full", { v, c: cap }]);
        answers.push(false);
        continue;
      }
      const item = make(v);
      if (impl === "array") {
        const k = stack ? n : index(n);
        items.push(item);
        sync();
        step("write", [stack ? "widget.stack-queue.writeTop" : front + n >= capacity ? "widget.stack-queue.writeWrap" : "widget.stack-queue.writeBack", { v, k }], { marks: { [k]: "swapped" } });
      } else {
        const neighbour = stack ? items[n - 1] : null;
        step("new", ["widget.stack-queue.created", { v }], { marks: { [item.id]: "current" }, raised: { ...item, next: neighbour ? neighbour.id : null } });
        items.push(item);
        step("link", [stack ? (n ? "widget.stack-queue.linkTop" : "widget.stack-queue.firstTop") : n ? "widget.stack-queue.linkBack" : "widget.stack-queue.firstBack", { v, w: n ? items[n - 1].v : null }], {
          marks: { [item.id]: "done", ...(n && !stack ? { [`${items[n - 1].id}>`]: "swapped" } : {}) },
        });
      }
      answers.push(true);
    } else {
      step(null, [`widget.stack-queue.${verb === "peek" ? `peek.${algorithm}` : verb}`]);
      if (!n) {
        step("empty", [`widget.stack-queue.empty.${algorithm}`]);
        answers.push(null);
        continue;
      }
      const k = stack ? n - 1 : 0;
      const item = items[k];
      step("read", [`widget.stack-queue.read.${algorithm}`, { v: item.v }], { marks: markItem(k, verb === "peek" ? "done" : "compared") });
      answers.push(item.v);
      if (verb === "peek") continue;
      if (impl === "array") {
        const cell = index(k);
        items.splice(k, 1);
        if (!stack) front = (front + 1) % capacity;
        sync();
        step("move", [stack ? "widget.stack-queue.topDown" : "widget.stack-queue.frontOn", { v: item.v, k: cell }], { marks: {} });
      } else {
        items.splice(k, 1);
        step("move", [stack ? "widget.stack-queue.topNext" : "widget.stack-queue.frontNext", { v: item.v }], { marks: { [item.id]: "compared" }, gone: item });
      }
    }
  }
  code = null;
  const done = {};
  items.forEach((_, k) => Object.assign(done, markItem(k, "done")));
  step(null, [items.length ? `widget.stack-queue.end.${algorithm}` : "widget.stack-queue.endEmpty", { n: items.length, values: items.map((item) => item.v).join(" ") }], { marks: done });
  return { values: items.map((item) => item.v), answers };
}
