/**
 * <uc-widget-heap>: a binary heap (max or min) drawn as its array and as its
 * tree, one above the other; insert, extract, peek, the bottom-up build and
 * heapsort (docs/plan/widgets-api.md 17; page docs/pt/widgets/uc-widget-heap.html).
 */
import { ALGORITHMS, VERBS, KINDS, MAX_ITEMS, parent, run } from "./algorithm.js";
import { strings } from "./i18n.js";

const GAP = 12; // between the array and the tree

export default function define(UC) {
  UC.addTranslations("pt", { widget: { heap: strings.pt } });
  UC.addTranslations("en", { widget: { heap: strings.en } });
  const W = UC.widgets;
  const t = (key, params) => UC.t(`widget.heap.${key}`, params);

  /** The heap part of a state as tree nodes { i, l, r } (index i). */
  const node = (i, n) => (i < n ? { i, l: node(2 * i + 1, n), r: node(2 * i + 2, n) } : null);

  class HeapWidget extends W.Widget {
    static id = "heap";
    static algorithms = ALGORITHMS;
    static inputAttributes = ["values", "ops", "kind"];
    static limits = { items: MAX_ITEMS };
    static editLabel = "widget.heap.edit";

    get kind() {
      const value = this.getAttribute("kind");
      if (value === null) return "max";
      if (KINDS.includes(value)) return value;
      this.warn("kind");
      return "max";
    }

    captionText() {
      const own = this.getAttribute("caption") || this.captionTemplate;
      return own ? super.captionText() : `${super.captionText()} (${t(`kind.${this.kind}`)})`;
    }

    pseudocode(block) {
      const kind = this.kind;
      return super.pseudocode(block).map((line) => line.replace(/\{op\}/g, kind === "max" ? ">" : "<").replace(/\{best\}/g, t(`best.${kind}`)));
    }

    parse() {
      const values = W.parse.values(this.attr("values") ?? "random 7", { max: MAX_ITEMS, random: this.random });
      const ops = this.attr("ops");
      return { values, ops: ops === null || this.algorithm !== "operations" ? null : W.parse.ops(ops, VERBS), kind: this.kind };
    }

    steps(input, emit) {
      return run(input, { algorithm: this.algorithm }, emit);
    }

    /** The array on top and the tree of the heap part below, each in a nested <svg>. */
    draw(step, svg) {
      const { a, ids, n } = step.state;
      if (svg.__ucKind !== "heap") {
        svg.__ucKind = "heap";
        svg.replaceChildren(W.util.svgEl("svg"), W.util.svgEl("svg"));
      }
      const [top, bottom] = svg.children;
      const marks = {};
      for (const [i, state] of Object.entries(step.marks)) if (Number(i) < n) marks[ids[i]] = state;
      W.svg.array(top, a, { marks: step.marks, pointers: step.pointers });
      W.svg.tree(bottom, node(0, n), {
        key: (item) => ids[item.i],
        label: (item) => String(a[item.i]),
        marks,
        empty: t("empty"),
      });
      const box = (part) => part.getAttribute("viewBox").split(" ").map(Number);
      const [, , aw, ah] = box(top);
      const [, , tw, th] = box(bottom);
      const width = Math.max(aw, tw);
      const place = (part, w, h, y) => {
        for (const [name, value] of Object.entries({ x: (width - w) / 2, y, width: w, height: h })) part.setAttribute(name, value);
      };
      place(top, aw, ah, 0);
      place(bottom, tw, th, ah + GAP);
      svg.setAttribute("viewBox", `0 0 ${width} ${ah + GAP + th}`);
      svg.style.minWidth = top.style.minWidth;
      svg.style.maxWidth = `${width}px`;
    }

    describe(step) {
      const { a, n } = step.state;
      const text = t("describe", { n, values: a.slice(0, n).join(" ") || "—" });
      return n < a.length ? text + t("describeSorted", { values: a.slice(n).join(" ") }) : text;
    }

    table(step) {
      const { a, n } = step.state;
      return {
        head: [this.t("widget.core.column.index"), this.t("widget.core.column.value"), t("column.parent"), this.t("widget.core.column.state")],
        rows: a.map((v, i) => [i, v, i && i < n ? a[parent(i)] : "—", this.stateName(step.marks[i])]),
      };
    }

    serialize(input) {
      return input.values.join(" ");
    }
  }

  W.register("uc-widget-heap", HeapWidget);
}
