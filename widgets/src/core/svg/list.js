/**
 * svg.list (docs/plan/widgets-api.md 16.3): linked nodes, each a value cell
 * and a "next" cell, with pointer arrows. Used by uc-widget-list and
 * uc-widget-stack-queue (two widgets, so it is bundled into them, not the
 * core: 16.3).
 *
 *   nodes      [{ id, v, next }] in display order; `next` is a node id or
 *              null (drawn as a slash in the next cell). An arrow to the
 *              node on the right is straight; any other arrow is an arc,
 *              above when it goes right, below when it goes left (reversal).
 *   marks      states by node id
 *   pointers   { name: id } labels under the nodes (head, tail, cur…)
 *   raised     ids drawn above the row (a node not linked yet)
 *   empty      the text drawn when there is no node
 *
 * Node groups are kept by id between steps and moved with a CSS transform.
 */
import { svgEl } from "../dom.js";

const VW = 44; // value cell
const NW = 22; // next cell
const NODE = VW + NW;
const GAP = 30;
const H = 40;
const PAD = 6;
const TOP = 24; // room for markers
const RAISE = 64; // raised nodes sit this much higher
const MARKER = { current: "▼", visited: "•", done: "✓" };

function text(className, x, y, content = "") {
  const node = svgEl("text", { class: className, x, y, "text-anchor": "middle" });
  node.textContent = content;
  return node;
}

/** A small arrowhead at (x, y) pointing along (dx, dy). */
function head(x, y, dx, dy) {
  const length = Math.hypot(dx, dy) || 1;
  const [ux, uy] = [dx / length, dy / length];
  const point = (back, side) => `${x - ux * back - uy * side},${y - uy * back + ux * side}`;
  return svgEl("polygon", { points: `${x},${y} ${point(8, 4)} ${point(8, -4)}` });
}

export function list(svg, nodes, { marks = {}, pointers = {}, raised = [], empty = "" } = {}) {
  const anyRaised = nodes.some((node) => raised.includes(node.id));
  const row = TOP + (anyRaised ? RAISE : 0);
  const n = nodes.length;
  const width = Math.max(n * (NODE + GAP) - GAP + 40, 160) + 2 * PAD;
  const pointerY = row + H + 34;
  svg.setAttribute("viewBox", `0 0 ${width} ${pointerY + 30}`);
  svg.style.minWidth = `${Math.max(n, 3) * 52}px`;
  svg.style.maxWidth = `${width}px`;

  if (svg.__ucKind !== "list") {
    svg.__ucKind = "list";
    svg.replaceChildren();
    svg.__ucArrows = svgEl("g", { class: "uc-widget__edges" });
    svg.__ucNodes = svgEl("g");
    svg.__ucPointers = svgEl("g", { class: "uc-widget__pointers" });
    svg.__ucNodeMap = new Map();
    svg.append(svg.__ucNodes, svg.__ucArrows, svg.__ucPointers);
  }

  const slot = {};
  nodes.forEach((node, i) => {
    slot[node.id] = { x: PAD + i * (NODE + GAP), y: raised.includes(node.id) ? TOP : row };
  });

  const map = svg.__ucNodeMap;
  const seen = new Set();
  for (const node of nodes) {
    seen.add(node.id);
    let g = map.get(node.id);
    if (!g) {
      g = svgEl("g");
      g.append(
        svgEl("rect", { class: "uc-widget__box", width: NODE, height: H, rx: 4 }),
        svgEl("rect", { class: "uc-widget__ring", x: 4, y: 4, width: NODE - 8, height: H - 8, rx: 2 }),
        svgEl("line", { class: "uc-widget__divider", x1: VW, y1: 0, x2: VW, y2: H }),
        svgEl("line", { class: "uc-widget__divider", x1: VW + 3, y1: H - 3, x2: NODE - 3, y2: 3 }),
        text("uc-widget__value", VW / 2, H / 2 + 6),
        text("uc-widget__marker", NODE / 2, -8),
      );
      map.set(node.id, g);
    }
    svg.__ucNodes.append(g);
    const state = marks[node.id] || "default";
    const [, , , slash, value, marker] = g.children;
    g.setAttribute("class", `uc-widget__item is-${state}`);
    g.style.transform = `translate(${slot[node.id].x}px, ${slot[node.id].y}px)`;
    g.dataset.id = node.id;
    slash.style.display = node.next === null || node.next === undefined ? "" : "none";
    value.textContent = String(node.v);
    marker.textContent = MARKER[state] || "";
  }
  for (const [id, g] of map) {
    if (!seen.has(id)) {
      g.remove();
      map.delete(id);
    }
  }

  // Arrows from each next cell to the node it points to.
  const arrows = [];
  for (const node of nodes) {
    const to = slot[node.next];
    if (!to) continue;
    const from = slot[node.id];
    const sx = from.x + VW + NW / 2;
    const sy = from.y + H / 2;
    const state = marks[`${node.id}>`] || "default";
    const g = svgEl("g", { class: `uc-widget__edge is-${state}` });
    if (to.y === from.y && to.x === from.x + NODE + GAP) {
      g.append(svgEl("line", { x1: sx, y1: sy, x2: to.x - 1, y2: sy }), head(to.x - 1, sy, 1, 0));
    } else {
      const below = to.x < from.x && to.y === from.y;
      const ex = to.x + NODE / 2;
      const ey = below ? to.y + H + 1 : to.y < from.y ? to.y + H + 1 : to.y - 1;
      const cx = (sx + ex) / 2;
      const cy = below ? Math.max(sy, ey) + 36 : to.y > from.y ? from.y - 10 : Math.min(sy, ey) - 36;
      g.append(svgEl("path", { d: `M${sx} ${sy} Q${cx} ${cy} ${ex} ${ey}`, fill: "none" }), head(ex, ey, ex - cx, ey - cy));
    }
    arrows.push(g);
  }
  svg.__ucArrows.replaceChildren(...arrows);

  // Pointer labels under the nodes (several names on one node share a label).
  const byNode = {};
  for (const [name, id] of Object.entries(pointers)) if (slot[id]) (byNode[id] = byNode[id] || []).push(name);
  const labels = Object.entries(byNode).map(([id, names]) => {
    const x = slot[id].x + VW / 2;
    const g = svgEl("g", { class: "uc-widget__pointer-group" });
    g.append(svgEl("line", { class: "uc-widget__edge", x1: x, y1: pointerY - 16, x2: x, y2: slot[id].y + H + 4 }), head(x, slot[id].y + H + 4, 0, -1), text("uc-widget__pointer", x, pointerY, names.join(", ")));
    return g;
  });
  if (!n && empty) labels.push(text("uc-widget__pointer", width / 2, row + H / 2 + 6, empty));
  svg.__ucPointers.replaceChildren(...labels);
}
