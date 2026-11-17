/**
 * svg.grid (docs/architecture/widgets-api.md 16.3): rows of cells, with an optional
 * header cell at the start of each row and optional column headers. With
 * `chain`, rows are lists: only the cells that exist are drawn, joined by
 * arrows from the header (a hash table with chaining). Bundled into
 * uc-widget-hash; dp and backtracking (W5) will import it too, and the core
 * takes it then if the budget allows (rule 16.3).
 *
 *   rows       [[value, …], …]; `null` is an empty cell (not drawn in a chain)
 *   rowHeads   labels of the row header cells (ids "0", "1", …)
 *   colHeads   labels above the columns
 *   marks      states by id: a cell is "r,c", a row header "r"
 *   chain      draw rows as linked lists
 *
 * Cell groups are kept by id between steps, so state changes are CSS
 * transitions; the state markers of section 13 sit above each cell.
 */
import { svgEl } from "../dom.js";

const MIN_W = 44;
const H = 40;
const GAP = 8;
const LINK = 30; // the gap of a chain, room for an arrow
const ROW = H + 18; // room for the marker above each row
const PAD = 6;
const MARKER = { current: "▼", visited: "•", done: "✓" };

function text(className, x, y, content = "") {
  const node = svgEl("text", { class: className, x, y, "text-anchor": "middle" });
  node.textContent = content;
  return node;
}

/** A cell group: box, ring, value, marker. */
function cell(round) {
  const g = svgEl("g");
  g.append(
    svgEl("rect", { class: "uc-widget__box", height: H, rx: round ? H / 2 : 4 }),
    svgEl("rect", { class: "uc-widget__ring", x: 4, y: 4, height: H - 8, rx: round ? H / 2 - 4 : 2 }),
    text("uc-widget__value", 0, H / 2 + 6),
    text("uc-widget__marker", 0, -5),
  );
  return g;
}

export function grid(svg, rows, { rowHeads = null, colHeads = null, marks = {}, chain = false } = {}) {
  // Every cell is as wide as the longest label (words in a hash table).
  const labels = [...rows.flat(), ...(rowHeads || [])].map((value) => String(value ?? ""));
  const W = Math.max(MIN_W, ...labels.map((label) => label.length * 11 + 14));
  const step = W + (chain ? LINK : GAP);
  const left = PAD + (rowHeads ? step : 0);
  const top = (colHeads ? 22 : 0) + 18;
  const cols = Math.max(1, colHeads ? colHeads.length : 0, ...rows.map((row) => row.length));
  const width = left + cols * step - (chain ? LINK : GAP) + PAD;
  const height = top + rows.length * ROW - 18 + PAD;
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.style.minWidth = `${Math.min(width, 300)}px`;
  svg.style.maxWidth = `${width * 1.25}px`;

  if (svg.__ucKind !== "grid") {
    svg.__ucKind = "grid";
    svg.replaceChildren();
    svg.__ucLinks = svgEl("g", { class: "uc-widget__edges" });
    svg.__ucCells = svgEl("g");
    svg.__ucHeads = svgEl("g");
    svg.__ucMap = new Map();
    svg.append(svg.__ucLinks, svg.__ucCells, svg.__ucHeads);
  }

  const seen = new Set();
  const put = (id, x, y, value, round) => {
    seen.add(id);
    let g = svg.__ucMap.get(id);
    if (!g) {
      g = cell(round);
      svg.__ucMap.set(id, g);
    }
    svg.__ucCells.append(g);
    const state = marks[id] || "default";
    g.setAttribute("class", `uc-widget__item is-${state}`);
    g.setAttribute("transform", `translate(${x} ${y})`);
    g.dataset.id = id;
    const [box, ring, label, marker] = g.children;
    box.setAttribute("width", W);
    ring.setAttribute("width", W - 8);
    label.setAttribute("x", W / 2);
    label.textContent = value === null ? "" : String(value);
    marker.setAttribute("x", W / 2);
    marker.textContent = MARKER[state] || "";
  };
  const links = [];
  const arrow = (x1, x2, y) => {
    links.push(svgEl("line", { class: "uc-widget__edge", x1, y1: y, x2: x2 - 6, y2: y }), svgEl("path", { class: "uc-widget__edge", d: `M${x2} ${y}l-8 -4v8z` }));
  };

  rows.forEach((row, r) => {
    const y = top + r * ROW;
    if (rowHeads) put(String(r), PAD, y, rowHeads[r], false);
    row.forEach((value, c) => {
      if (chain && value === null) return;
      const x = left + c * step;
      put(`${r},${c}`, x, y, value, chain);
      if (chain) arrow(x - LINK + 2, x - 2, y + H / 2);
    });
  });
  svg.__ucLinks.replaceChildren(...links);
  svg.__ucHeads.replaceChildren(...(colHeads || []).map((label, c) => text("uc-widget__index", left + c * step + W / 2, 16, label)));
  for (const [id, g] of svg.__ucMap) {
    if (!seen.has(id)) {
      g.remove();
      svg.__ucMap.delete(id);
    }
  }
}
