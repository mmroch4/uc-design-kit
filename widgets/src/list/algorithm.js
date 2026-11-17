/**
 * The singly linked list of <uc-widget-list>, as step lists
 * (docs/plan/widgets-api.md 6.4). Pure: no DOM, no UC, no Math.random.
 *
 * Input: { values, ops }. `values` builds the list without steps; `ops` runs
 * with steps. Without `ops`, every value is added at the end with steps.
 * State: { nodes: [{ id, v, next }] in display order, head, raised: [ids] }.
 * Node ids ("n1", "n2"…) never change, so the drawing keeps each node while
 * the pointers move. A step names its operation's pseudocode in `code`.
 * Result: { values (the final list), answers (one per operation) }.
 */
import { InputError } from "../core/engine.js";

export const ALGORITHMS = ["singly"];
export const VERBS = ["add-first", "add-last", "insert", "remove-first", "remove-last", "remove", "search", "reverse"];
export const MAX_NODES = 10;

const YES_NO = [["widget.core.yes"], ["widget.core.no"]];
const INTEGER = /^[+-]?\d+$/;

/** The values of a state, following next from head. */
export function contents(state) {
  const byId = Object.fromEntries(state.nodes.map((node) => [node.id, node]));
  const out = [];
  for (let id = state.head; id && out.length <= state.nodes.length; id = byId[id].next) out.push(byId[id].v);
  return out;
}

export function run({ values = [], ops = null }, _options, emit) {
  let order = [];
  let head = null;
  let count = 0;
  let code = null;
  const make = (v) => ({ id: `n${(count += 1)}`, v, next: null });
  const at = (k) => {
    let node = head;
    for (let i = 0; i < k; i += 1) node = node.next;
    return node;
  };
  const length = () => order.length;
  const quiet = ops !== null;
  if (quiet) {
    if (values.length > MAX_NODES) throw new InputError("widget.core.error.tooLarge", { max: MAX_NODES });
    order = values.map(make);
    order.forEach((node, i) => (node.next = order[i + 1] || null));
    head = order[0] || null;
  }

  /** Emits a step: pointers are node objects (or null), marks by node object. */
  const step = (line, say, { marks = [], point = {}, raised = [], predict, arrows = {} } = {}) => {
    const pointers = { head: head && head.id };
    for (const [name, node] of Object.entries(point)) if (node) pointers[name] = node.id;
    if (!head) delete pointers.head;
    emit({
      state: { nodes: order.map((node) => ({ id: node.id, v: node.v, next: node.next && node.next.id })), head: head && head.id, raised: raised.map((node) => node.id) },
      marks: Object.fromEntries([...marks.map(([node, state]) => [node.id, state]), ...Object.entries(arrows)]),
      pointers,
      line,
      say,
      aux: { size: length() },
      ...(code ? { code } : {}),
      ...(predict ? { predict } : {}),
    });
  };
  const visited = (until) => {
    const out = [];
    for (let node = head; node && node !== until; node = node.next) out.push([node, "visited"]);
    return out;
  };
  const room = () => {
    if (length() >= MAX_NODES) throw new InputError("widget.core.error.tooLarge", { max: MAX_NODES });
  };
  /** Walks from head to the node at position k (with steps); returns it. */
  const walk = (k, line) => {
    let cur = head;
    step(line, ["widget.list.curHead", { v: cur.v }], { marks: [[cur, "current"]], point: { cur } });
    for (let i = 0; i < k; i += 1) {
      cur = cur.next;
      step(line, ["widget.list.advance", { v: cur.v }], { marks: [...visited(cur), [cur, "current"]], point: { cur } });
    }
    return cur;
  };

  step(null, head ? ["widget.list.start", { n: length(), values: order.map((node) => node.v).join(" → ") }] : ["widget.list.startEmpty"]);

  const list = ops !== null ? ops : values.map((v) => ({ verb: "add-last", args: [String(v)] }));
  const answers = [];
  for (const { verb, args } of list) {
    code = verb;
    const wanted = verb === "insert" ? 2 : ["add-first", "add-last", "remove", "search"].includes(verb) ? 1 : 0;
    if (args.length !== wanted || !args.every((arg) => INTEGER.test(arg))) throw new InputError("widget.list.error.arg", { verb, n: wanted });
    const v = Number(args[wanted - 1]);
    let k = verb === "insert" ? Number(args[0]) : verb === "add-first" ? 0 : verb === "add-last" ? length() : null;

    if (k !== null) {
      // add-first, add-last and insert: one routine, at position k.
      step(null, [`widget.list.${verb === "insert" ? "insert" : verb === "add-first" ? "addFirst" : "addLast"}`, { v, k }]);
      if (k < 0 || k > length()) {
        step(null, ["widget.list.badIndex", { k, n: length() }]);
        answers.push(false);
        continue;
      }
      room();
      const prev = k > 0 ? walk(k - 1, "walk") : null;
      const node = make(v);
      const name = verb === "add-last" ? "cur" : "prev";
      order.splice(order.indexOf(prev) + 1, 0, node);
      step("new", ["widget.list.created", { v }], { marks: [[node, "current"]], raised: [node], point: { [name]: prev, node } });
      node.next = prev ? prev.next : head;
      step("link", [node.next ? "widget.list.linkNext" : "widget.list.linkNull", { v, w: node.next && node.next.v }], { marks: [[node, "current"]], raised: [node], point: { [name]: prev, node }, arrows: { [`${node.id}>`]: "swapped" } });
      if (prev) prev.next = node;
      else head = node;
      step(prev ? "relink" : "head", [prev ? "widget.list.relink" : "widget.list.newHead", { v, p: prev && prev.v }], {
        marks: [[node, "done"]],
        point: { [name]: prev, node },
        arrows: prev ? { [`${prev.id}>`]: "swapped" } : {},
      });
      answers.push(true);
    } else if (verb === "remove-first" || verb === "remove-last" || verb === "remove") {
      step(null, [`widget.list.${verb === "remove" ? "remove" : verb === "remove-first" ? "removeFirst" : "removeLast"}`, { v }]);
      if (!head) {
        step(null, ["widget.list.empty"]);
        answers.push(null);
        continue;
      }
      let prev = null;
      let cur = head;
      if (verb === "remove-last") {
        step("walk", ["widget.list.curHead", { v: cur.v }], { marks: [[cur, "current"]], point: { cur } });
        while (cur.next) {
          prev = cur;
          cur = cur.next;
          step("walk", ["widget.list.advanceLast", { v: cur.v }], { marks: [...visited(cur), [cur, "current"]], point: { prev, cur } });
        }
      } else if (verb === "remove") {
        for (;;) {
          const hit = cur.v === v;
          const values = { v, w: cur.v };
          step("compare", [hit ? "widget.list.equal" : "widget.list.notEqual", values], {
            marks: [...visited(cur), [cur, "compared"]],
            point: { prev, cur },
            predict: { ask: ["widget.list.predict.equal", values], options: YES_NO, answer: hit ? 0 : 1 },
          });
          if (hit) break;
          if (!cur.next) break;
          prev = cur;
          cur = cur.next;
        }
        if (cur.v !== v) {
          step("missing", ["widget.list.notFound", { v }], { marks: visited(null) });
          answers.push(false);
          continue;
        }
      }
      if (prev) prev.next = cur.next;
      else head = cur.next;
      step(prev ? "unlink" : "head", [prev ? (verb === "remove-last" ? "widget.list.unlinkLast" : "widget.list.unlink") : "widget.list.headNext", { v: cur.v, p: prev && prev.v }], {
        marks: [[cur, "compared"]],
        raised: [cur],
        point: { prev, cur },
        arrows: prev ? { [`${prev.id}>`]: "swapped" } : {},
      });
      order.splice(order.indexOf(cur), 1);
      step("free", ["widget.list.removed", { v: cur.v }], { point: { prev } });
      answers.push(verb === "remove" ? true : cur.v);
    } else if (verb === "search") {
      step(null, ["widget.list.search", { v }]);
      let cur = head;
      let index = 0;
      let found = -1;
      while (cur) {
        const hit = cur.v === v;
        const values = { v, w: cur.v, i: index };
        step("compare", [hit ? "widget.list.equal" : "widget.list.notEqual", values], {
          marks: [...visited(cur), [cur, "compared"]],
          point: { cur },
          predict: { ask: ["widget.list.predict.equal", values], options: YES_NO, answer: hit ? 0 : 1 },
        });
        if (hit) {
          found = index;
          step("found", ["widget.list.found", values], { marks: [[cur, "done"]], point: { cur } });
          break;
        }
        cur = cur.next;
        index += 1;
      }
      if (found < 0) step("missing", ["widget.list.notFound", { v }], { marks: visited(null) });
      answers.push(found);
    } else if (verb === "reverse") {
      step(null, ["widget.list.reverse"]);
      let prev = null;
      let cur = head;
      const turned = [];
      step("start", ["widget.list.reverseStart"], { point: { cur } });
      while (cur) {
        const next = cur.next;
        step("next", ["widget.list.saveNext", { v: cur.v, w: next ? next.v : "null" }], { marks: [...turned, [cur, "current"]], point: { prev, cur, next } });
        cur.next = prev;
        step("turn", ["widget.list.turn", { v: cur.v, w: prev ? prev.v : "null" }], { marks: [...turned, [cur, "swapped"]], point: { prev, cur, next }, arrows: { [`${cur.id}>`]: "swapped" } });
        turned.push([cur, "visited"]);
        prev = cur;
        cur = next;
        step("move", ["widget.list.moveOn", { v: prev.v }], { marks: turned, point: { prev, cur } });
      }
      head = prev;
      step("head", ["widget.list.reverseHead", { v: head ? head.v : "null" }], { marks: turned, point: { prev } });
      order = [];
      for (let node = head; node; node = node.next) order.push(node);
      answers.push(true);
    }
  }
  code = null;
  const final = [];
  for (let node = head; node; node = node.next) final.push(node);
  step(null, final.length ? ["widget.list.end", { n: final.length, values: final.map((node) => node.v).join(" → ") }] : ["widget.list.endEmpty"], {
    marks: final.map((node) => [node, "done"]),
  });
  return { values: final.map((node) => node.v), answers };
}
