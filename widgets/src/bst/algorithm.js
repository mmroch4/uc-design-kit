/**
 * The binary search tree of <uc-widget-bst>, as step lists
 * (docs/architecture/widgets-api.md 6.4). Pure: no DOM, no UC, no Math.random.
 *
 * Input: { values, ops }. State: { root }, nodes { v, l, r }. Element ids are
 * the values (a BST holds each value once).
 *
 * - "operations": `values` builds the tree without steps and `ops` runs with
 *   steps (insert, remove, search, min, max); without `ops`, every value is
 *   inserted with steps into an empty tree (5.2). Each step names the
 *   operation's pseudocode in `code`. Result: { inorder, answers }.
 * - "preorder", "inorder", "postorder", "levelorder": `values` builds the
 *   tree and the traversal runs with steps; aux.output is the output so far,
 *   aux.stack the calls (depth first), aux.queue the queue (level order).
 *   Result: the output.
 */
import { InputError } from "../core/engine.js";

export const ALGORITHMS = ["operations", "preorder", "inorder", "postorder", "levelorder"];
export const VERBS = ["insert", "remove", "search", "min", "max"];
export const MAX_NODES = 15;

const SIDES = [["widget.bst.side.left"], ["widget.bst.side.right"], ["widget.bst.side.equal"]];

export function inorder(node, out = []) {
  if (node) {
    inorder(node.l, out);
    out.push(node.v);
    inorder(node.r, out);
  }
  return out;
}

const size = (node) => (node ? 1 + size(node.l) + size(node.r) : 0);

/** Inserts without steps; returns the root. */
export function insertQuiet(root, v) {
  if (!root) return { v, l: null, r: null };
  let n = root;
  while (n.v !== v) {
    const side = v < n.v ? "l" : "r";
    if (!n[side]) {
      n[side] = { v, l: null, r: null };
      break;
    }
    n = n[side];
  }
  return root;
}

export function run({ values = [], ops = null }, { algorithm = "operations" } = {}, emit) {
  if (!ALGORITHMS.includes(algorithm)) throw new Error(`unknown algorithm ${algorithm}`);
  const state = { root: null };
  const quiet = algorithm !== "operations" || ops !== null;
  if (quiet) for (const v of values) state.root = insertQuiet(state.root, v);
  if (size(state.root) > MAX_NODES) throw new InputError("widget.core.error.tooLarge", { max: MAX_NODES });

  let code = algorithm === "operations" ? null : algorithm;
  const step = (marks, line, say, extra = {}) => emit({ state, marks, line, say, ...(code ? { code } : {}), ...extra });
  const pathMarks = (path, last, lastState) => {
    const marks = {};
    for (const node of path) marks[node.v] = "visited";
    if (last) marks[last.v] = lastState;
    return marks;
  };

  if (algorithm !== "operations") return traverse(state, algorithm, step);

  const n = size(state.root);
  step({}, null, state.root ? ["widget.bst.start", { n, root: state.root.v }] : ["widget.bst.startEmpty"]);
  const list = ops !== null ? ops : values.map((v) => ({ verb: "insert", args: [String(v)] }));
  const answers = [];

  /** Walks down from the root towards v with compare steps; returns { node, parent, path }. */
  const descend = (v, stopAtEqual = true) => {
    const path = [];
    let node = state.root;
    let parent = null;
    while (node) {
      const side = v === node.v ? 2 : v < node.v ? 0 : 1;
      const values = { v, n: node.v };
      step(pathMarks(path, node, side === 2 && stopAtEqual ? "done" : "compared"), side === 2 ? "found" : side ? "right" : "left",
        [["widget.bst.goLeft", values], ["widget.bst.goRight", values], ["widget.bst.equal", values]][side],
        { predict: { ask: ["widget.bst.predict.side", values], options: SIDES, answer: side } });
      if (side === 2) return { node, parent, path };
      path.push(node);
      parent = node;
      node = side ? node.r : node.l;
    }
    return { node: null, parent, path };
  };

  for (const { verb, args } of list) {
    code = verb;
    const needsValue = verb === "insert" || verb === "remove" || verb === "search";
    if (needsValue && (args.length !== 1 || !/^[+-]?\d+$/.test(args[0]))) throw new InputError("widget.bst.error.arg", { verb });
    const v = Number(args[0]);

    if (verb === "insert") {
      step({}, null, ["widget.bst.insert", { v }]);
      if (!state.root) {
        if (size(state.root) >= MAX_NODES) throw new InputError("widget.core.error.tooLarge", { max: MAX_NODES });
        state.root = { v, l: null, r: null };
        step({ [v]: "done" }, "place", ["widget.bst.root", { v }]);
        answers.push(true);
        continue;
      }
      const { node, parent, path } = descend(v, false);
      if (node) {
        step(pathMarks(path, node, "current"), "dup", ["widget.bst.duplicate", { v }]);
        answers.push(false);
        continue;
      }
      if (size(state.root) >= MAX_NODES) throw new InputError("widget.core.error.tooLarge", { max: MAX_NODES });
      parent[v < parent.v ? "l" : "r"] = { v, l: null, r: null };
      step({ ...pathMarks(path), [v]: "done" }, "place", [v < parent.v ? "widget.bst.placeLeft" : "widget.bst.placeRight", { v, n: parent.v }]);
      answers.push(true);
    } else if (verb === "search") {
      step({}, null, ["widget.bst.search", { v }]);
      const { node, path } = descend(v);
      if (!node) step(pathMarks(path), "missing", ["widget.bst.notFound", { v }]);
      answers.push(Boolean(node));
    } else if (verb === "min" || verb === "max") {
      const side = verb === "min" ? "l" : "r";
      step({}, null, [`widget.bst.${verb}`]);
      if (!state.root) {
        step({}, "found", ["widget.bst.emptyTree"]);
        answers.push(null);
        continue;
      }
      const path = [];
      let node = state.root;
      while (node[side]) {
        step(pathMarks(path, node, "current"), "walk", [`widget.bst.${verb}Walk`, { n: node.v }]);
        path.push(node);
        node = node[side];
      }
      step(pathMarks(path, node, "done"), "found", [`widget.bst.${verb}Found`, { n: node.v }]);
      answers.push(node.v);
    } else if (verb === "remove") {
      step({}, null, ["widget.bst.remove", { v }]);
      const { node, parent, path } = descend(v);
      if (!node) {
        step(pathMarks(path), "missing", ["widget.bst.notFound", { v }]);
        answers.push(false);
        continue;
      }
      const replace = (child) => {
        if (!parent) state.root = child;
        else if (parent.l === node) parent.l = child;
        else parent.r = child;
      };
      if (!node.l || !node.r) {
        const child = node.l || node.r;
        step(pathMarks(path, node, "current"), child ? "one" : "leaf", [child ? "widget.bst.oneChild" : "widget.bst.leaf", { v, c: child && child.v }]);
        replace(child);
        step(child ? { [child.v]: "swapped" } : {}, child ? "one" : "leaf", [child ? "widget.bst.lifted" : "widget.bst.removed", { v, c: child && child.v }]);
      } else {
        step(pathMarks(path, node, "current"), "succ", ["widget.bst.twoChildren", { v }]);
        let sParent = node;
        let s = node.r;
        while (s.l) {
          step({ [v]: "current", [s.v]: "compared" }, "succ", ["widget.bst.succWalk", { n: s.v }]);
          sParent = s;
          s = s.l;
        }
        step({ [v]: "current", [s.v]: "compared" }, "succ", ["widget.bst.succFound", { s: s.v, v }]);
        node.v = s.v;
        if (sParent === node) sParent.r = s.r;
        else sParent.l = s.r;
        step({ [s.v]: "swapped" }, "copy", ["widget.bst.copied", { s: s.v, v }]);
      }
      answers.push(true);
    }
  }
  code = null;
  const order = inorder(state.root);
  step({}, null, order.length ? ["widget.bst.end", { n: order.length, order: order.join(" ") }] : ["widget.bst.endEmpty"]);
  return { inorder: order, answers };
}

/** The four traversals, one step per call and per output. */
function traverse(state, algorithm, step) {
  const root = state.root;
  const output = [];
  const printed = () => Object.fromEntries(output.map((v) => [v, "done"]));
  const all = inorder(root);
  const ask = (v) => {
    const left = all.filter((x) => !output.includes(x) && x !== v);
    const options = [v, ...left.slice(0, 2)].sort((a, b) => a - b);
    return { ask: ["widget.bst.predict.next"], options: options.map((x) => ["widget.core.value", { v: x }]), answer: options.indexOf(v) };
  };
  step({}, null, root ? [algorithm === "levelorder" ? "widget.bst.traverseLevel" : "widget.bst.traverse", { n: all.length, root: root.v }] : ["widget.bst.emptyTree"], { aux: { output: [] } });
  if (!root) return output;

  if (algorithm === "levelorder") {
    const queue = [root];
    const aux = () => ({ output: output.slice(), queue: queue.map((node) => node.v) });
    step({ [root.v]: "visited" }, "start", ["widget.bst.enqueueRoot", { v: root.v }], { aux: aux() });
    while (queue.length) {
      const node = queue.shift();
      const predict = ask(node.v);
      output.push(node.v);
      const marks = { ...printed(), ...Object.fromEntries(queue.map((q) => [q.v, "visited"])), [node.v]: "current" };
      step(marks, ["take", "print"], ["widget.bst.dequeue", { v: node.v }], { aux: aux(), predict });
      const kids = [node.l, node.r].filter(Boolean);
      if (kids.length) {
        queue.push(...kids);
        step({ ...printed(), ...Object.fromEntries(queue.map((q) => [q.v, "visited"])) }, "push",
          [kids.length === 2 ? "widget.bst.enqueueTwo" : "widget.bst.enqueueOne", { a: kids[0].v, b: kids[1] && kids[1].v, v: node.v }], { aux: aux() });
      }
    }
  } else {
    const stack = [];
    const aux = () => ({ output: output.slice(), stack: stack.slice() });
    const marks = (node) => ({ ...printed(), ...Object.fromEntries(stack.map((v) => [v, "visited"])), [node.v]: "current" });
    const print = (node) => {
      const predict = ask(node.v);
      output.push(node.v);
      step(marks(node), "print", ["widget.bst.print", { v: node.v }], { aux: aux(), predict });
    };
    const visit = (node, line) => {
      if (!node) return;
      stack.push(node.v);
      // Pre-order prints on entry: one step for the call and the output.
      if (algorithm === "preorder") {
        const predict = ask(node.v);
        output.push(node.v);
        step(marks(node), [line, "print"].filter(Boolean), ["widget.bst.callPrint", { v: node.v }], { aux: aux(), predict });
      } else {
        step(marks(node), line, ["widget.bst.call", { v: node.v }], { aux: aux() });
      }
      visit(node.l, "left");
      if (algorithm === "inorder") print(node);
      visit(node.r, "right");
      if (algorithm === "postorder") print(node);
      stack.pop();
    };
    visit(root, null);
  }
  step(printed(), null, ["widget.bst.traversed", { order: output.join(" ") }], { aux: { output: output.slice(), ...(algorithm === "levelorder" ? { queue: [] } : { stack: [] }) } });
  return output;
}
