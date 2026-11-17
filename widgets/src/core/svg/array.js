/**
 * svg.array (docs/architecture/widgets-api.md 16.3): a row of cells, or bars, with
 * indexes, pointer labels and the state markers of section 13. The groups of
 * the cells are kept between steps, so colour changes are CSS transitions.
 * `null` is an empty cell (a value taken out of the array).
 */
import { svgEl } from "../dom.js";

const W = 44; // cell width
const H = 44; // cell height
const GAP = 6;
const PAD = 4;
const TOP = 34; // room for the ▼ / ✓ markers and the swap arc
const BAR = 120; // tallest bar
const MARKER = { current: "▼", visited: "•", done: "✓" };

function text(className, x, y, content = "") {
  const node = svgEl("text", { class: className, x, y, "text-anchor": "middle" });
  node.textContent = content;
  return node;
}

export function array(svg, values, { marks = {}, pointers = {}, bars = false } = {}) {
  const n = values.length;
  const height = bars ? BAR : H;
  const indexY = TOP + height + 20;
  const pointerY = indexY + 20;
  const width = Math.max(n * (W + GAP) - GAP, W) + 2 * PAD;
  svg.setAttribute("viewBox", `0 0 ${width} ${pointerY + 6}`);
  svg.style.minWidth = `${Math.max(n, 4) * 30}px`;
  svg.style.maxWidth = `${width * 1.25}px`; // small arrays are not blown up

  // Groups are rebuilt only when the size or the view changes.
  const key = `array:${n}:${bars}`;
  if (svg.__ucKind !== key) {
    svg.__ucKind = key;
    svg.replaceChildren();
    svg.__ucCells = values.map((_, i) => {
      const g = svgEl("g", { transform: `translate(${PAD + i * (W + GAP)} 0)` });
      const box = svgEl("rect", { class: "uc-widget__box", x: 0, width: W, rx: 4 });
      const ring = svgEl("rect", { class: "uc-widget__ring", x: 4, width: W - 8, rx: 2 });
      g.append(box, ring, text("uc-widget__value", W / 2, 0), text("uc-widget__marker", W / 2, TOP - 8), text("uc-widget__index", W / 2, indexY, i));
      svg.append(g);
      return g;
    });
    svg.__ucArc = svgEl("g", { class: "uc-widget__arc" });
    svg.__ucPointers = svgEl("g", { class: "uc-widget__pointers" });
    svg.append(svg.__ucArc, svg.__ucPointers);
  }

  const max = Math.max(1, ...values.map((v) => (typeof v === "number" ? Math.abs(v) : 0)));
  values.forEach((value, i) => {
    const g = svg.__ucCells[i];
    const state = marks[String(i)] || "default";
    const [box, ring, label, marker] = g.children;
    g.setAttribute("class", `uc-widget__item is-${state}${value === null ? " is-hole" : ""}`);
    g.dataset.id = String(i);
    const h = bars && typeof value === "number" ? Math.max(28, (Math.abs(value) / max) * BAR) : height;
    const y = TOP + height - h;
    box.setAttribute("y", y);
    box.setAttribute("height", h);
    ring.setAttribute("y", y + 4);
    ring.setAttribute("height", Math.max(0, h - 8));
    label.setAttribute("y", bars ? TOP + height - 10 : TOP + height / 2 + 6);
    label.textContent = value === null ? "" : String(value);
    marker.setAttribute("y", y - 8);
    marker.textContent = MARKER[state] || "";
  });

  // A swap: an arc between the two swapped cells, with ⇄ on top.
  const swapped = values.map((_, i) => i).filter((i) => marks[String(i)] === "swapped");
  svg.__ucArc.replaceChildren();
  if (swapped.length === 2) {
    const [a, b] = swapped.map((i) => PAD + i * (W + GAP) + W / 2);
    const top = bars ? 6 : 8;
    svg.__ucArc.append(
      svgEl("path", { d: `M${a} ${TOP - 2} Q${(a + b) / 2} ${top - 10} ${b} ${TOP - 2}`, fill: "none" }),
      text("uc-widget__marker", (a + b) / 2, top + 6, "⇄"),
    );
  }

  // Pointer labels under the indexes; several pointers on one cell share a label.
  const byCell = {};
  for (const [name, id] of Object.entries(pointers)) {
    if (Number(id) >= 0 && Number(id) < n) (byCell[id] = byCell[id] || []).push(name);
  }
  svg.__ucPointers.replaceChildren(
    ...Object.entries(byCell).map(([id, names]) => text("uc-widget__pointer", PAD + Number(id) * (W + GAP) + W / 2, pointerY, names.join(","))),
  );
}
