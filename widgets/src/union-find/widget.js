/**
 * <uc-widget-union-find>: disjoint sets (union-find) with union by size and
 * path compression, or without them, drawn as the parent array above the
 * forest (docs/architecture/widgets-api.md 17; page
 * docs/pt/widgets/uc-widget-union-find.html).
 *
 * The forest is one n-ary svg.tree (core) under a hidden root, so the trees
 * stand side by side and every node slides when it moves; the hidden root
 * and its edges are removed after drawing.
 */
import { ALGORITHMS, VERBS, MAX_ITEMS, rootOf, run } from "./algorithm.js";
import { strings } from "./i18n.js";

const GAP = 12; // between the array and the forest
const HIDDEN = "__root";
const LEVEL = 76; // svg.tree's distance between levels
const TOP_EDGE = "68"; // y1 of the edges that leave svg.tree's root (TOP 28 + node height 40)

export default function define(UC) {
  UC.addTranslations("pt", { widget: { "union-find": strings.pt } });
  UC.addTranslations("en", { widget: { "union-find": strings.en } });
  const W = UC.widgets;
  const t = (key, params) => UC.t(`widget.union-find.${key}`, params);

  class UnionFindWidget extends W.Widget {
    static id = "union-find";
    static algorithms = ALGORITHMS;
    static inputAttributes = ["n", "ops"];
    static limits = { items: MAX_ITEMS };
    static editAttribute = "ops";
    static editLabel = "widget.union-find.edit";

    captionText() {
      const own = this.getAttribute("caption") || this.captionTemplate;
      return own ? super.captionText() : `${t("title")} · ${super.captionText()}`;
    }

    parse() {
      const value = (this.getAttribute("n") ?? "8").trim();
      if (!/^\d+$/.test(value) || Number(value) < 1 || Number(value) > MAX_ITEMS) throw new W.InputError("widget.union-find.error.n", { max: MAX_ITEMS });
      const ops = this.attr("ops");
      return { n: Number(value), ops: ops === null || !ops.trim() ? null : W.parse.ops(ops, VERBS) };
    }

    steps(input, emit) {
      return run(input, { algorithm: this.algorithm }, emit);
    }

    /** The parent array on top and the forest below, each in a nested <svg>. */
    draw(step, svg) {
      const { parent, size } = step.state;
      if (svg.__ucKind !== "union-find") {
        svg.__ucKind = "union-find";
        svg.replaceChildren(W.util.svgEl("svg"), W.util.svgEl("svg"));
      }
      const [top, bottom] = svg.children;
      W.svg.array(top, parent, { marks: step.marks });
      const node = (i) => ({ i, kids: parent.map((p, j) => j).filter((j) => j !== i && parent[j] === i).map(node) });
      const roots = parent.map((p, i) => i).filter((i) => parent[i] === i);
      const sized = this.algorithm !== "naive";
      W.svg.tree(
        bottom,
        { i: HIDDEN, kids: roots.map(node) },
        {
          binary: false,
          children: (item) => item.kids,
          key: (item) => String(item.i),
          label: (item) => (item.i === HIDDEN ? "" : String(item.i)),
          note: (item) => (sized && item.i !== HIDDEN && parent[item.i] === item.i ? `(${size[item.i]})` : ""),
          marks: step.marks,
        },
      );
      bottom.__ucNodeMap.get(HIDDEN).style.display = "none";
      for (const line of bottom.querySelectorAll(".uc-widget__edges line")) if (line.getAttribute("y1") === TOP_EDGE) line.remove();
      const [, , tw, full] = bottom.getAttribute("viewBox").split(" ").map(Number);
      const th = full - LEVEL;
      bottom.setAttribute("viewBox", `0 ${LEVEL} ${tw} ${th}`);

      const [, , aw, ah] = top.getAttribute("viewBox").split(" ").map(Number);
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

    /** "{0 1 3} {2}" grouped by root, smallest root first. */
    sets(parent) {
      const groups = {};
      parent.forEach((_, i) => (groups[rootOf(parent, i)] = groups[rootOf(parent, i)] || []).push(i));
      return Object.entries(groups).map(([r, list]) => `${r}: { ${list.join(" ")} }`);
    }

    describe(step) {
      const { parent } = step.state;
      const sets = this.sets(parent);
      return t("describe", { k: sets.length, sets: sets.join("; "), parent: parent.join(", ") });
    }

    table(step) {
      const { parent, size } = step.state;
      const sized = this.algorithm !== "naive";
      return {
        head: [t("column.element"), t("column.parent"), t("column.root"), ...(sized ? [t("column.size")] : []), this.t("widget.core.column.state")],
        rows: parent.map((p, i) => [i, p, rootOf(parent, i), ...(sized ? [p === i ? size[i] : "—"] : []), this.stateName(step.marks[i])]),
      };
    }

    serialize(input) {
      return input.ops ? input.ops.map(({ verb, args }) => [verb, ...args].join(" ")).join("; ") : this.attr("ops") || "";
    }
  }

  W.register("uc-widget-union-find", UnionFindWidget);
}
