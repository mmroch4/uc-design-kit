/**
 * <uc-widget-complexity>: growth functions side by side as n grows, and the
 * real counts of another widget on the page (docs/architecture/widgets-api.md 17,
 * 24; page docs/pt/widgets/uc-widget-complexity.html).
 *
 * Measured points come from the `points` attribute ("n:count …") and, with
 * for="<id>", from that widget: each time it reaches its last step (uc:
 * widgetdone) its counter (`measure`, default its first one) is added at n =
 * the size of its input. They are drawn over the steps, not part of them.
 */
import { ALGORITHMS, MAX_N, FUNCTIONS, LABELS, EXPONENTIAL, show, parseFunctions, run } from "./algorithm.js";
import { strings } from "./i18n.js";
import { plot } from "../core/svg/plot.js";

/** n of another widget's input: an array's length, its values, a graph's |V| + |E|, or its n. */
export function size(input) {
  if (Array.isArray(input)) return input.length;
  if (!input || typeof input !== "object") return 0;
  if (Array.isArray(input.values)) return input.values.length;
  if (input.graph) return input.graph.vertices.length + input.graph.edges.length;
  return Number.isInteger(input.n) ? input.n : 0;
}

export default function define(UC) {
  UC.addTranslations("pt", { widget: { complexity: strings.pt } });
  UC.addTranslations("en", { widget: { complexity: strings.en } });
  const W = UC.widgets;
  const t = (key, params) => UC.t(`widget.complexity.${key}`, params);

  class ComplexityWidget extends W.Widget {
    static id = "complexity";
    static algorithms = ALGORITHMS;
    static inputAttributes = ["functions", "max", "scale", "for", "measure", "points"];
    static editLabel = "widget.complexity.edit";

    get log() {
      const value = this.getAttribute("scale");
      if (value && value !== "linear" && value !== "log") this.warn("scale");
      return value === "log";
    }

    parse() {
      this.listen();
      const max = (this.getAttribute("max") ?? "16").trim();
      if (!/^\d+$/.test(max) || Number(max) < 2 || Number(max) > MAX_N) throw new W.InputError("widget.complexity.error.max", { max: MAX_N });
      const points = [];
      for (const pair of (this.getAttribute("points") || "").split(/[\s,]+/).filter(Boolean)) {
        const match = /^(\d+):(\d+(?:\.\d+)?)$/.exec(pair);
        if (!match) throw new W.InputError("widget.complexity.error.point", { pair });
        points.push({ x: Number(match[1]), y: Number(match[2]) });
      }
      this.given = points;
      return { functions: parseFunctions(this.attr("functions")), max: Number(max) };
    }

    steps(input, emit) {
      return run(input, { algorithm: this.algorithm }, emit);
    }

    /** The points to draw: the attribute's and the measured ones (same n: the latest wins). */
    get dots() {
      const all = new Map();
      for (const point of [...(this.given || []), ...(this.measured || [])]) all.set(point.x, point);
      return [...all.values()].sort((a, b) => a.x - b.x);
    }

    get dotLabel() {
      const key = this.getAttribute("measure") || this.measureKey;
      return key ? UC.t(`widget.core.stat.${key}`) : t("measured");
    }

    /** Listens once for the widget named by `for` reaching its last step. */
    listen() {
      if (this.listening) return;
      this.listening = true;
      this.measured = [];
      document.addEventListener("uc:widgetdone", (event) => {
        const id = this.getAttribute("for");
        if (!id || event.target.id !== id || !this.stepList.length) return;
        const { stats = {}, input } = event.detail;
        const key = this.getAttribute("measure") || Object.keys(stats)[0];
        const n = size(input);
        if (!key || !(key in stats) || !n) return;
        this.measureKey = key;
        this.measured = this.measured.filter((point) => point.x !== n).concat({ x: n, y: stats[key] });
        this.paint();
        this.live.textContent = t("added", { n, count: stats[key], stat: UC.t(`widget.core.stat.${key}`) });
      });
    }

    draw(step, svg) {
      const { functions, max } = this.input;
      const last = step === this.stepList[this.stepList.length - 1];
      const upto = last ? max : step.state.n;
      const tall = functions.filter((id) => !EXPONENTIAL.includes(id));
      const height = (ids) => Math.max(1, ...ids.map((id) => FUNCTIONS[id](max)), ...this.dots.filter((p) => p.x <= max).map((p) => p.y));
      const series = functions.map((id) => ({
        id,
        label: LABELS[id],
        state: step.marks[id] || "default",
        points: Array.from({ length: upto }, (_, i) => [i + 1, FUNCTIONS[id](i + 1)]),
      }));
      plot(svg, series, {
        xmax: max,
        ymax: height(this.log || !tall.length ? functions : tall),
        log: this.log,
        guide: last || !upto ? null : upto,
        dots: this.dots,
        yLabel: this.dots.length ? `■ ${this.dotLabel}` : "",
      });
    }

    describe(step) {
      const { functions, max } = this.input;
      const text = t("describe", { list: functions.map((id) => LABELS[id]).join(", "), max, scale: t(this.log ? "log" : "linear") });
      const dots = this.dots.map((p) => `${p.x}: ${p.y}`).join(", ");
      return `${text} ${UC.t(step.say[0], step.say[1])}${dots ? ` ${t("describeDots", { stat: this.dotLabel, list: dots })}` : ""}`;
    }

    table(step) {
      const n = step.state.n;
      const rows = n ? this.input.functions.map((id) => [LABELS[id], show(step.state.values[id])]) : [];
      for (const p of this.dots) rows.push([`${this.dotLabel} (n = ${p.x})`, show(p.y)]);
      return { head: [t("column.function"), t("column.value", { n: n || "—" })], rows };
    }

    serialize(input) {
      return input.functions.join(" ");
    }
  }

  W.register("uc-widget-complexity", ComplexityWidget);
}
