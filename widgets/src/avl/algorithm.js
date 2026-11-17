/**
 * The AVL tree of <uc-widget-avl>, as step lists (docs/architecture/widgets-api.md
 * 6.4). Pure: no DOM, no UC, no Math.random.
 *
 * Input: { values, ops }. State: { root }, nodes { v, l, r, h } (h: height,
 * a leaf has 1). Element ids are the values. Balance factor = height(left) −
 * height(right). `values` builds the tree without steps and `ops` runs with
 * steps (insert, remove, search); without `ops`, every value is inserted with
 * steps into an empty tree (5.2). After an insertion or a removal the path is
 * walked back up: each node's height and factor are updated, a factor of ±2
 * is fixed with one or two rotations, and the walk stops where the height of
 * the subtree did not change. Result: { inorder, answers }.
 */
import { InputError } from "../core/engine.js";
import { inorder } from "../bst/algorithm.js";

export { inorder };
export const ALGORITHMS = ["operations"];
export const VERBS = ["insert", "remove", "search"];
export const MAX_NODES = 15;
/** The four cases, in the order of the predict options. */
export const CASES = ["LL", "RR", "LR", "RL"];

const SIDES = [["widget.avl.side.left"], ["widget.avl.side.right"], ["widget.avl.side.equal"]];

export const height = (node) => (node ? node.h : 0);
export const factor = (node) => height(node.l) - height(node.r);
const fix = (node) => {
  node.h = 1 + Math.max(height(node.l), height(node.r));
  return node;
};
const size = (node) => (node ? 1 + size(node.l) + size(node.r) : 0);

function rotateRight(z) {
  const y = z.l;
  z.l = y.r;
  y.r = fix(z);
  return fix(y);
}

function rotateLeft(z) {
  const y = z.r;
  z.r = y.l;
  y.l = fix(z);
  return fix(y);
}

/** The case of an unbalanced node (factor ±2). */
export function caseOf(node) {
  const f = factor(node);
  if (f > 1) return factor(node.l) >= 0 ? "LL" : "LR";
  return factor(node.r) <= 0 ? "RR" : "RL";
}

/** Rebalances a node without steps; returns the subtree root. */
function balance(node) {
  fix(node);
  if (Math.abs(factor(node)) < 2) return node;
  const c = caseOf(node);
  if (c === "LR") node.l = rotateLeft(node.l);
  if (c === "RL") node.r = rotateRight(node.r);
  return c === "LL" || c === "LR" ? rotateRight(node) : rotateLeft(node);
}

/** Inserts without steps; returns the root. */
export function insertQuiet(node, v) {
  if (!node) return { v, l: null, r: null, h: 1 };
  if (v === node.v) return node;
  if (v < node.v) node.l = insertQuiet(node.l, v);
  else node.r = insertQuiet(node.r, v);
  return balance(node);
}

export function run({ values = [], ops = null }, options = {}, emit) {
  const state = { root: null };
  if (ops !== null) for (const v of values) state.root = insertQuiet(state.root, v);
  if (size(state.root) > MAX_NODES) throw new InputError("widget.core.error.tooLarge", { max: MAX_NODES });

  let code = null;
  const step = (marks, line, say, extra = {}) => emit({ state, marks, line, say, code, ...extra });
  const pathMarks = (path, last, lastState) => {
    const marks = {};
    for (const node of path) marks[node.v] = "visited";
    if (last) marks[last.v] = lastState;
    return marks;
  };

  const n = size(state.root);
  step({}, null, state.root ? ["widget.avl.start", { n, root: state.root.v }] : ["widget.avl.startEmpty"]);
  const list = ops !== null ? ops : values.map((v) => ({ verb: "insert", args: [String(v)] }));
  const answers = [];

  /** Walks down from the root towards v with compare steps; returns { node, path } (path: the nodes above). */
  const descend = (v, stopAtEqual = true) => {
    const path = [];
    let node = state.root;
    while (node) {
      const side = v === node.v ? 2 : v < node.v ? 0 : 1;
      const values = { v, n: node.v };
      step(pathMarks(path, node, side === 2 && stopAtEqual ? "done" : "compared"), side === 2 ? "found" : side ? "right" : "left",
        [["widget.avl.goLeft", values], ["widget.avl.goRight", values], ["widget.avl.equal", values]][side],
        { predict: { ask: ["widget.avl.predict.side", values], options: SIDES, answer: side } });
      if (side === 2) return { node, path };
      path.push(node);
      node = side ? node.r : node.l;
    }
    return { node: null, path };
  };

  /** Links `child` where `node` was, below path[k - 1] (or as the root). */
  const relink = (path, k, node, child) => {
    const parent = k > 0 ? path[k - 1] : null;
    if (!parent) state.root = child;
    else if (parent.l === node) parent.l = child;
    else parent.r = child;
  };

  /** Walks the path back up, from its last node: heights, factors, rotations. */
  const retrace = (path) => {
    for (let k = path.length - 1; k >= 0; k -= 1) {
      const node = path[k];
      const before = node.h;
      fix(node);
      const f = factor(node);
      const p = { n: node.v, h: node.h, f: f > 0 ? `+${f}` : String(f) };
      if (Math.abs(f) < 2) {
        const same = node.h === before;
        step({ [node.v]: same ? "done" : "current" }, same ? "stop" : "update", [same ? "widget.avl.same" : "widget.avl.update", p]);
        if (same) return;
        continue;
      }
      const c = caseOf(node);
      const child = f > 0 ? node.l : node.r;
      step({ [node.v]: "current", [child.v]: "compared" }, "case", [`widget.avl.case.${c}`, { ...p, c: child.v }], {
        predict: { ask: ["widget.avl.predict.rotation", p], options: CASES.map((name) => [`widget.avl.rotation.${name}`]), answer: CASES.indexOf(c) },
      });
      let top;
      if (c === "LR" || c === "RL") {
        const g = c === "LR" ? child.r : child.l;
        if (c === "LR") node.l = rotateLeft(child);
        else node.r = rotateRight(child);
        step({ [g.v]: "swapped", [child.v]: "swapped" }, "rotate", [c === "LR" ? "widget.avl.left" : "widget.avl.right", { n: child.v, c: g.v }]);
      }
      const up = c === "LL" || c === "LR" ? node.l : node.r;
      top = c === "LL" || c === "LR" ? rotateRight(node) : rotateLeft(node);
      relink(path, k, node, top);
      step({ [up.v]: "swapped", [node.v]: "swapped" }, "rotate", [c === "LL" || c === "LR" ? "widget.avl.right" : "widget.avl.left", { n: node.v, c: up.v }]);
      if (top.h === before) {
        step({ [top.v]: "done" }, "stop", ["widget.avl.same", { n: top.v, h: top.h, f: factor(top) > 0 ? `+${factor(top)}` : String(factor(top)) }]);
        return;
      }
    }
  };

  for (const { verb, args } of list) {
    code = verb;
    if (args.length !== 1 || !/^[+-]?\d+$/.test(args[0])) throw new InputError("widget.avl.error.arg", { verb });
    const v = Number(args[0]);

    if (verb === "insert") {
      step({}, null, ["widget.avl.insert", { v }]);
      if (!state.root) {
        state.root = { v, l: null, r: null, h: 1 };
        step({ [v]: "done" }, "place", ["widget.avl.root", { v }]);
        answers.push(true);
        continue;
      }
      const { node, path } = descend(v, false);
      if (node) {
        step(pathMarks(path, node, "current"), "dup", ["widget.avl.duplicate", { v }]);
        answers.push(false);
        continue;
      }
      if (size(state.root) >= MAX_NODES) throw new InputError("widget.core.error.tooLarge", { max: MAX_NODES });
      const parent = path[path.length - 1];
      parent[v < parent.v ? "l" : "r"] = { v, l: null, r: null, h: 1 };
      step({ ...pathMarks(path), [v]: "done" }, "place", [v < parent.v ? "widget.avl.placeLeft" : "widget.avl.placeRight", { v, n: parent.v }]);
      answers.push(true);
      retrace(path);
    } else if (verb === "search") {
      step({}, null, ["widget.avl.search", { v }]);
      const { node, path } = descend(v);
      if (!node) step(pathMarks(path), "missing", ["widget.avl.notFound", { v }]);
      answers.push(Boolean(node));
    } else {
      step({}, null, ["widget.avl.remove", { v }]);
      const { node, path } = descend(v);
      if (!node) {
        step(pathMarks(path), "missing", ["widget.avl.notFound", { v }]);
        answers.push(false);
        continue;
      }
      answers.push(true);
      if (!node.l || !node.r) {
        const child = node.l || node.r;
        step(pathMarks(path, node, "current"), child ? "one" : "leaf", [child ? "widget.avl.oneChild" : "widget.avl.leaf", { v, c: child && child.v }]);
        relink(path, path.length, node, child);
        step(child ? { [child.v]: "swapped" } : {}, child ? "one" : "leaf", [child ? "widget.avl.lifted" : "widget.avl.removed", { v, c: child && child.v }]);
        retrace(path);
        continue;
      }
      step(pathMarks(path, node, "current"), "succ", ["widget.avl.twoChildren", { v }]);
      const sPath = [...path, node];
      let s = node.r;
      while (s.l) {
        step({ [v]: "current", [s.v]: "compared" }, "succ", ["widget.avl.succWalk", { n: s.v }]);
        sPath.push(s);
        s = s.l;
      }
      step({ [v]: "current", [s.v]: "compared" }, "succ", ["widget.avl.succFound", { s: s.v, v }]);
      node.v = s.v;
      const sParent = sPath[sPath.length - 1];
      if (sParent === node) sParent.r = s.r;
      else sParent.l = s.r;
      step({ [s.v]: "swapped" }, "copy", ["widget.avl.copied", { s: s.v, v }]);
      retrace(sPath);
    }
  }
  code = null;
  const order = inorder(state.root);
  step({}, null, order.length ? ["widget.avl.end", { n: order.length, order: order.join(" ") }] : ["widget.avl.endEmpty"]);
  return { inorder: order, answers };
}
