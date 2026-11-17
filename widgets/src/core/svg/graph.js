/**
 * svg.graph (docs/plan/widgets-api.md 16.3, 24): vertices, edges or arcs,
 * weights and a note beside each vertex (a distance, a visit number). It is
 * bundled into each graph widget, not the core (section 24.1).
 *
 *   graph(svg, g, { marks, notes })
 *
 * `g` is model() of widgets/src/graph/model.js: { vertices, edges: [{ id,
 * from, to, weight }], positions, weighted, directed }. Marks are keyed by
 * vertex name and edge id; notes by vertex name.
 *
 * Layout: the positions of the input (`A @ x,y`, grid units) when every
 * vertex has one; otherwise a force-directed layout (deterministic, started
 * from a circle, vertices with a position stay put), or the circle itself
 * when it has fewer crossings. Computed once per graph and kept, so the
 * vertices never move between steps.
 */
import { svgEl } from "../dom.js";

const R = 20; // vertex radius
const MIN = 84; // smallest distance between two vertices
const UNIT = 90; // pixels per grid unit of a written position
const PAD = 36; // room for notes and loops around the drawing
const MARKER = { visited: "•", done: "✓" };

function text(className, x, y, content, anchor = "middle") {
  const node = svgEl("text", { class: className, x, y, "text-anchor": anchor });
  node.textContent = content;
  return node;
}

/** True when segments pq and rs cross (not at a shared end). */
function cross([p, q], [r, s]) {
  const side = (a, b, c) => Math.sign((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]));
  return side(p, q, r) * side(p, q, s) < 0 && side(r, s, p) * side(r, s, q) < 0;
}

function crossings(edges, at) {
  let count = 0;
  const lines = edges.filter((e) => e.from !== e.to);
  for (let i = 0; i < lines.length; i += 1) {
    for (let j = i + 1; j < lines.length; j += 1) {
      const a = lines[i];
      const b = lines[j];
      if (a.from === b.from || a.from === b.to || a.to === b.from || a.to === b.to) continue;
      if (cross([at[a.from], at[a.to]], [at[b.from], at[b.to]])) count += 1;
    }
  }
  return count;
}

const L = 1.6; // ideal edge length, grid units

/**
 * { name: [x, y] } in grid units (see the header). Without written
 * positions, each connected component is laid out alone and the components
 * are put side by side, in rows about 6 units wide, in input order.
 * Exported for the tests.
 */
export function layout(vertices, edges, positions = {}) {
  const fixed = vertices.filter((v) => positions[v]);
  if (fixed.length === vertices.length) return Object.fromEntries(vertices.map((v) => [v, positions[v].slice()]));
  if (fixed.length) return spring(vertices, edges, positions);
  const group = Object.fromEntries(vertices.map((v) => [v, v]));
  const find = (v) => (group[v] === v ? v : (group[v] = find(group[v])));
  for (const { from, to } of edges) group[find(from)] = find(to);
  const at = {};
  let x = 0;
  let y = 0;
  let row = 0;
  for (const root of vertices.filter((v) => find(v) === v)) {
    const own = vertices.filter((v) => find(v) === root);
    const part = spring(own, edges.filter((e) => own.includes(e.from)), {});
    const xs = own.map((v) => part[v][0]);
    const ys = own.map((v) => part[v][1]);
    const [w, h] = [Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)];
    if (x && x + w > 6) [x, y, row] = [0, y + row + 1.2, 0];
    for (const v of own) at[v] = [part[v][0] - Math.min(...xs) + x, part[v][1] - Math.min(...ys) + y];
    x += w + 1.2;
    row = Math.max(row, h);
  }
  return at;
}

/** Force-directed layout of one group of vertices (vertices with a position stay put). */
function spring(vertices, edges, positions) {
  const n = vertices.length;
  const fixed = vertices.filter((v) => positions[v]);
  const radius = n < 2 ? 0 : L / (2 * Math.sin(Math.PI / Math.max(n, 3)));
  const centre = fixed.length ? [0, 1].map((k) => fixed.reduce((sum, v) => sum + positions[v][k], 0) / fixed.length) : [radius, radius];
  const circle = {};
  vertices.forEach((v, i) => {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    circle[v] = positions[v] ? positions[v].slice() : [centre[0] + radius * Math.cos(angle), centre[1] + radius * Math.sin(angle)];
  });
  const at = Object.fromEntries(vertices.map((v) => [v, circle[v].slice()]));
  const ROUNDS = 240;
  for (let round = 0; round < ROUNDS; round += 1) {
    const move = Object.fromEntries(vertices.map((v) => [v, [0, 0]]));
    const push = (v, dx, dy, f) => {
      move[v][0] += dx * f;
      move[v][1] += dy * f;
    };
    for (let i = 0; i < n; i += 1) {
      for (let j = i + 1; j < n; j += 1) {
        const a = vertices[i];
        const b = vertices[j];
        let dx = at[a][0] - at[b][0];
        let dy = at[a][1] - at[b][1];
        if (!dx && !dy) dx = 0.01 * (j - i);
        const d = Math.hypot(dx, dy);
        const f = (L * L) / (d * d);
        push(a, dx, dy, f);
        push(b, dx, dy, -f);
      }
    }
    for (const { from, to } of edges) {
      if (from === to) continue;
      const dx = at[from][0] - at[to][0];
      const dy = at[from][1] - at[to][1];
      const f = Math.hypot(dx, dy) / L;
      push(from, dx, dy, -f);
      push(to, dx, dy, f);
    }
    const heat = (0.25 * L * (ROUNDS - round)) / ROUNDS;
    for (const v of vertices) {
      if (positions[v]) continue;
      // A little gravity keeps the drawing compact.
      const [gx, gy] = [centre[0] - at[v][0], centre[1] - at[v][1]];
      const dx = move[v][0] + 0.05 * gx;
      const dy = move[v][1] + 0.05 * gy;
      const d = Math.hypot(dx, dy) || 1;
      const step = Math.min(d, heat);
      at[v][0] += (dx / d) * step;
      at[v][1] += (dy / d) * step;
    }
  }
  return !fixed.length && crossings(edges, circle) < crossings(edges, at) ? circle : at;
}

/** Pixel positions: the layout scaled so that no two vertices are closer than MIN. */
function place(g) {
  const at = layout(g.vertices, g.edges, g.positions);
  const names = Object.keys(at);
  let near = Infinity;
  for (let i = 0; i < names.length; i += 1) {
    for (let j = i + 1; j < names.length; j += 1) near = Math.min(near, Math.hypot(at[names[i]][0] - at[names[j]][0], at[names[i]][1] - at[names[j]][1]));
  }
  const all = names.every((v) => g.positions[v]);
  const scale = near === Infinity || !near ? UNIT : Math.max(all ? UNIT : 0, MIN / near);
  const xs = names.map((v) => at[v][0] * scale);
  const ys = names.map((v) => at[v][1] * scale);
  const [left, top] = [Math.min(...xs, Infinity), Math.min(...ys, Infinity)];
  const px = {};
  names.forEach((v, i) => (px[v] = [xs[i] - left + PAD + R, ys[i] - top + PAD + R]));
  const span = (list, low) => (list.length ? Math.max(...list) - low : 0);
  // 24 more on the right: the notes are written right of the vertices.
  return { px, w: span(xs, left) + 2 * (PAD + R) + 24, h: span(ys, top) + 2 * (PAD + R) };
}

export function graph(svg, g, { marks = {}, notes = {} } = {}) {
  const signature = JSON.stringify([g.vertices, g.edges, g.positions, g.directed]);
  if (svg.__ucKind !== signature) {
    svg.__ucKind = signature;
    const { px, w, h } = place(g);
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.style.minWidth = `${Math.min(w, 288)}px`;
    svg.style.maxWidth = `${w}px`;
    const edgeLayer = svgEl("g");
    const weightLayer = svgEl("g");
    const vertexLayer = svgEl("g");
    svg.replaceChildren(edgeLayer, weightLayer, vertexLayer);
    svg.__ucEdges = {};
    svg.__ucVertices = {};
    const pairs = new Set(g.edges.map((e) => `${e.from}\n${e.to}`));
    for (const edge of g.edges) {
      const [x1, y1] = px[edge.from];
      const [x2, y2] = px[edge.to];
      const group = svgEl("g", { "data-id": edge.id });
      let d;
      let label;
      if (edge.from === edge.to) {
        d = `M${x1 - 10} ${y1 - R + 3}C${x1 - 34} ${y1 - R - 42} ${x1 + 34} ${y1 - R - 42} ${x1 + 10} ${y1 - R + 3}`;
        label = [x1, y1 - R - 40];
      } else {
        const len = Math.hypot(x2 - x1, y2 - y1);
        const [ux, uy] = [(x2 - x1) / len, (y2 - y1) / len];
        // Two arcs between the same vertices bend apart; one edge is straight.
        const bend = g.directed && pairs.has(`${edge.to}\n${edge.from}`) ? 22 : 0;
        const [mx, my] = [(x1 + x2) / 2 + uy * bend, (y1 + y2) / 2 - ux * bend];
        const toward = (x, y, fx, fy, r) => {
          const l = Math.hypot(fx - x, fy - y);
          return [x + ((fx - x) / l) * r, y + ((fy - y) / l) * r];
        };
        const [sx, sy] = toward(x1, y1, mx, my, R);
        const [tx, ty] = toward(x2, y2, mx, my, R + (g.directed ? 2 : 0));
        d = `M${sx} ${sy}Q${2 * mx - (sx + tx) / 2} ${2 * my - (sy + ty) / 2} ${tx} ${ty}`;
        label = [mx, my];
        if (g.directed) {
          const [bx, by] = toward(tx, ty, mx, my, 1);
          const [vx, vy] = [tx - bx, ty - by];
          const head = (k) => [tx - vx * 11 + vy * k, ty - vy * 11 - vx * k].join(" ");
          group.append(svgEl("path", { d: `M${tx} ${ty}L${head(5)}L${head(-5)}Z`, stroke: "none" }));
        }
      }
      group.prepend(svgEl("path", { d, fill: "none" }));
      edgeLayer.append(group);
      svg.__ucEdges[edge.id] = group;
      if (g.weighted) {
        const value = String(edge.weight);
        const box = svgEl("rect", { class: "uc-widget__weight-box", x: label[0] - value.length * 4.5 - 4, y: label[1] - 10, width: value.length * 9 + 8, height: 20, rx: 4 });
        weightLayer.append(box, text("uc-widget__weight", label[0], label[1] + 5, value));
      }
    }
    for (const v of g.vertices) {
      const [x, y] = px[v];
      const group = svgEl("g", { "data-id": v, transform: `translate(${x} ${y})` });
      group.append(
        svgEl("circle", { class: "uc-widget__box", r: R }),
        text("uc-widget__value", 0, 6, v),
        text("uc-widget__marker", R - 2, -R + 2, "", "start"),
        text("uc-widget__note", R - 2, R + 12, "", "start"),
      );
      vertexLayer.append(group);
      svg.__ucVertices[v] = group;
    }
  }
  for (const [id, group] of Object.entries(svg.__ucEdges)) group.setAttribute("class", `uc-widget__edge is-${marks[id] || "default"}`);
  for (const [v, group] of Object.entries(svg.__ucVertices)) {
    const state = marks[v] || "default";
    group.setAttribute("class", `uc-widget__item is-${state}`);
    group.children[2].textContent = MARKER[state] || "";
    group.children[3].textContent = notes[v] ?? "";
  }
}
