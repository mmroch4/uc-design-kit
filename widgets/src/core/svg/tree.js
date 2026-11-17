/**
 * svg.tree (docs/plan/widgets-api.md 16.3): a binary or n-ary tree, drawn
 * top-down. Binary trees use the in-order layout (one column per node, so
 * keys stay sorted left to right and leaves never overlap); n-ary trees
 * (recursion) put each leaf in its own column and a parent above the middle
 * of its children. Nodes are kept by key between steps and moved with a
 * transform, so CSS transitions animate insertions and rotations.
 *
 * Options:
 *   children(node)  the children; binary trees keep `null` for a missing
 *                   left child (default: [node.l, node.r])
 *   binary          in-order layout (default true)
 *   key(node)       the element id used by marks (default String(node.v))
 *   label(node)     the text in the node (default String(node.v))
 *   note(node)      an optional second line under the node (a return value)
 *   marks, pointers the step's marks and pointers (pointer → node key)
 *   empty           the text drawn for an empty tree
 *
 * An edge takes the state of its lower node when that node is current,
 * visited or done, so the path to a node shows without extra marks.
 */
import { svgEl } from "../dom.js";

const H = 40; // node height
const LEVEL = 76; // distance between levels
const GAP = 10;
const PAD = 6;
const TOP = 28; // room for the markers above the root
const MARKER = { visited: "•", done: "✓" };
const PATH = ["current", "visited", "done"];

function text(className, x, y, content = "") {
  const node = svgEl("text", { class: className, x, y, "text-anchor": "middle" });
  node.textContent = content;
  return node;
}

export function tree(svg, root, options = {}) {
  const {
    children = (node) => [node.l, node.r],
    binary = true,
    key = (node) => String(node.v),
    label = (node) => String(node.v),
    note = () => "",
    marks = {},
    pointers = {},
    empty = "",
  } = options;

  // Layout: column and depth of every node.
  const placed = [];
  let column = 0;
  let width = H;
  let noteWidth = 0;
  const place = (node, depth, parent) => {
    const item = { node, depth, parent, id: key(node), text: label(node), note: note(node) };
    width = Math.max(width, item.text.length * 10 + 16);
    if (item.note !== "") noteWidth = Math.max(noteWidth, String(item.note).length * 9 + 6);
    placed.push(item);
    const kids = children(node) || [];
    if (binary) {
      if (kids[0]) place(kids[0], depth + 1, item);
      item.col = column++;
      if (kids[1]) place(kids[1], depth + 1, item);
    } else {
      const own = kids.filter(Boolean).map((kid) => place(kid, depth + 1, item));
      item.col = own.length ? (own[0].col + own[own.length - 1].col) / 2 : column++;
    }
    return item;
  };
  if (root) place(root, 0, null);

  const step = width + noteWidth + GAP; // a note sits right of its node
  const depth = Math.max(0, ...placed.map((item) => item.depth));
  const cols = Math.max(column, 1);
  const w = cols * step - GAP + 2 * PAD;
  const h = TOP + depth * LEVEL + H + PAD;
  svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
  svg.style.minWidth = `${Math.min(cols * 34, 34 * 16)}px`;
  svg.style.maxWidth = `${w}px`; // never drawn larger than 1:1 (labels at 18 px)
  const x = (item) => PAD + item.col * step + width / 2;
  const y = (item) => TOP + item.depth * LEVEL;

  if (svg.__ucKind !== "tree") {
    svg.__ucKind = "tree";
    svg.replaceChildren();
    svg.__ucEdges = svgEl("g", { class: "uc-widget__edges" });
    svg.__ucNodes = svgEl("g");
    svg.__ucNodeMap = new Map();
    svg.append(svg.__ucEdges, svg.__ucNodes);
  }

  svg.__ucEdges.replaceChildren(
    ...placed
      .filter((item) => item.parent)
      .map((item) => {
        const state = PATH.includes(marks[item.id]) ? marks[item.id] : "default";
        return svgEl("line", { class: `uc-widget__edge is-${state}`, x1: x(item.parent), y1: y(item.parent) + H, x2: x(item), y2: y(item) });
      }),
  );

  // Pointer labels: every pointer naming a node, beside it.
  const byNode = {};
  for (const [name, id] of Object.entries(pointers)) (byNode[id] = byNode[id] || []).push(name);

  const map = svg.__ucNodeMap;
  const seen = new Set();
  for (const item of placed) {
    seen.add(item.id);
    let g = map.get(item.id);
    if (!g) {
      g = svgEl("g");
      g.append(
        svgEl("rect", { class: "uc-widget__box", y: 0, height: H, rx: H / 2 }),
        svgEl("rect", { class: "uc-widget__ring", y: 4, height: H - 8, rx: H / 2 - 4 }),
        text("uc-widget__value", 0, H / 2 + 6),
        text("uc-widget__marker", 0, -8),
        text("uc-widget__note", 0, H / 2 + 5),
        text("uc-widget__pointer", 0, -8),
      );
      map.set(item.id, g);
    }
    svg.__ucNodes.append(g);
    const state = marks[item.id] || "default";
    const [box, ring, value, marker, noteText, pointer] = g.children;
    g.setAttribute("class", `uc-widget__item is-${state}`);
    g.style.transform = `translate(${x(item)}px, ${y(item)}px)`;
    g.dataset.id = item.id;
    box.setAttribute("x", -width / 2);
    box.setAttribute("width", width);
    ring.setAttribute("x", -width / 2 + 4);
    ring.setAttribute("width", width - 8);
    value.textContent = item.text;
    marker.setAttribute("x", width / 2 - 2);
    marker.textContent = MARKER[state] || "";
    noteText.setAttribute("x", width / 2 + 4);
    noteText.setAttribute("text-anchor", "start");
    noteText.textContent = item.note;
    pointer.setAttribute("x", -width / 2);
    pointer.setAttribute("text-anchor", "end");
    pointer.textContent = (byNode[item.id] || []).join(",");
  }
  for (const [id, g] of map) {
    if (!seen.has(id)) {
      g.remove();
      map.delete(id);
    }
  }

  svg.__ucEmpty?.remove();
  svg.__ucEmpty = null;
  if (!root && empty) {
    svg.setAttribute("viewBox", `0 0 160 ${TOP + H + PAD}`);
    svg.__ucEmpty = text("uc-widget__pointer", 80, TOP + H / 2 + 6, empty);
    svg.append(svg.__ucEmpty);
  }
}
