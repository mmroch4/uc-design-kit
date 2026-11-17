/**
 * svg.plot (docs/architecture/widgets-api.md 16.3, 24): a line chart of growth
 * functions, bundled into <uc-widget-complexity> only (one user).
 *
 *   plot(svg, series, { xmax, ymax, log, guide, dots, yLabel })
 *
 * series: [{ id, label, points: [[x, y], …], state }] drawn as lines that
 * differ by dash pattern as well as by state (never by colour alone), each
 * named at its end. With a linear scale a line that leaves the top is cut
 * there and named with "↑". `log`: base-10 y axis from 1. `guide`: an x with
 * a vertical rule and a dot on every line. `dots`: measured points [{ x, y }].
 */
import { svgEl } from "../dom.js";

const W = 560;
const H = 330;
const [L, R, T, B] = [52, 92, 24, 40];
const DASH = ["", "9 5", "2 4", "12 4 2 4", "5 4", "16 6", "1 3", "10 3 3 3", "6 2"];

function text(className, x, y, content, anchor = "middle") {
  const node = svgEl("text", { class: className, x, y, "text-anchor": anchor });
  node.textContent = content;
  return node;
}

/** Ticks at 1, 2 or 5 × 10^k, at most `most` of them up to max. */
function ticks(max, most) {
  let step = 1;
  for (let k = 0; ; k += 1) {
    step = [1, 2, 5][k % 3] * 10 ** Math.floor(k / 3);
    if (max / step <= most) break;
  }
  const list = [];
  for (let v = step; v <= max + 1e-9; v += step) list.push(v);
  return list;
}

export function plot(svg, series, { xmax = 16, ymax = 1, log = false, guide = null, dots = [], yLabel = "" } = {}) {
  const pw = W - L - R;
  const ph = H - T - B;
  const top = log ? Math.log10(Math.max(ymax, 10)) : Math.max(ymax, 1);
  const px = (x) => L + ((x - 1) / Math.max(xmax - 1, 1)) * pw;
  const py = (y) => T + ph - ((log ? Math.log10(Math.max(y, 1)) : y) / top) * ph;
  svg.__ucKind = "plot";
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  svg.style.minWidth = "288px";
  svg.style.maxWidth = `${W}px`;
  const axes = svgEl("g", { class: "uc-widget__axes" });
  axes.append(svgEl("path", { d: `M${L} ${T}V${T + ph}H${L + pw}`, fill: "none" }));
  for (const x of [1, ...ticks(xmax, 8).filter((x) => x > 1)]) {
    axes.append(svgEl("path", { d: `M${px(x)} ${T + ph}v5`, fill: "none" }), text("uc-widget__tick", px(x), T + ph + 19, String(x)));
  }
  const ys = log ? Array.from({ length: Math.floor(top) }, (_, k) => 10 ** (k + 1)).filter((_, k, all) => all.length <= 6 || k % 2 === 1) : ticks(top, 5);
  for (const y of ys) {
    axes.append(svgEl("path", { class: "uc-widget__grid", d: `M${L} ${py(y)}H${L + pw}`, fill: "none" }));
    axes.append(text("uc-widget__tick", L - 6, py(y) + 4, y >= 1e5 ? `10${String(Math.round(Math.log10(y))).replace(/\d/g, (d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[d])}` : String(y), "end"));
  }
  axes.append(text("uc-widget__tick", L + pw + 14, T + ph + 19, "n", "start"), text("uc-widget__tick", L - 6, T - 10, yLabel, "start"));

  const lines = svgEl("g");
  const labels = [];
  series.forEach(({ id, label, points, state = "default" }, i) => {
    const kept = [];
    let cut = false;
    for (const [x, y] of points) {
      if (!log && y > top) {
        const prev = kept[kept.length - 1];
        if (prev) {
          const [x0, y0] = prev;
          kept.push([x0 + ((top - y0) / (y - y0)) * (x - x0), top]);
        }
        cut = true;
        break;
      }
      kept.push([x, y]);
    }
    const g = svgEl("g", { class: `uc-widget__curve is-${state}`, "data-id": id });
    if (kept.length) {
      g.append(svgEl("path", { d: `M${kept.map(([x, y]) => `${px(x).toFixed(1)} ${py(y).toFixed(1)}`).join("L")}`, fill: "none", "stroke-dasharray": DASH[i % DASH.length] }));
      const [x, y] = kept[kept.length - 1];
      labels.push({ g, x: px(x) + 6, y: py(y) + 4, label: cut ? `${label} ↑` : label });
    }
    lines.append(g);
  });
  // Names at the line ends, pushed apart so they do not overlap.
  labels.sort((a, b) => a.y - b.y);
  labels.forEach((item, i) => {
    if (i && item.y - labels[i - 1].y < 15) item.y = labels[i - 1].y + 15;
    item.g.append(text("uc-widget__series", item.x, item.y, item.label, "start"));
  });
  const marks = svgEl("g");
  if (guide !== null) {
    marks.append(svgEl("path", { class: "uc-widget__guide", d: `M${px(guide)} ${T}V${T + ph}`, fill: "none" }));
    for (const { points, state = "default" } of series) {
      const point = points.find(([x]) => x === guide);
      if (point && (log || point[1] <= top)) marks.append(svgEl("circle", { class: `uc-widget__dot is-${state}`, cx: px(guide), cy: py(point[1]), r: 4 }));
    }
  }
  for (const { x, y } of dots) {
    if (x <= xmax && (log || y <= top)) marks.append(svgEl("rect", { class: "uc-widget__measure", x: px(x) - 5, y: py(y) - 5, width: 10, height: 10 }));
  }
  svg.replaceChildren(axes, lines, marks);
}
