/**
 * <uc-widget-backtracking>: N queens on a board, subsets (with an optional
 * target sum and its cuts) and permutations on the search tree
 * (docs/architecture/widgets-api.md 17; page docs/pt/widgets/uc-widget-backtracking.html).
 */
import { ALGORITHMS, LIMITS, run } from "./algorithm.js";
import { strings } from "./i18n.js";
import { grid } from "../core/svg/grid.js";

const DEFAULT_VALUES = { subsets: "1 2 3", permutations: "A B C" };

export default function define(UC) {
  UC.addTranslations("pt", { widget: { backtracking: strings.pt } });
  UC.addTranslations("en", { widget: { backtracking: strings.en } });
  const W = UC.widgets;
  const t = (key, params) => UC.t(`widget.backtracking.${key}`, params);

  /** Every node of the search tree, with its path of labels from the root. */
  const nodes = (node, path = [], out = []) => {
    const here = node.id === "r" ? [] : [...path, node.label];
    out.push({ node, path: here });
    node.kids.forEach((kid) => nodes(kid, here, out));
    return out;
  };

  class BacktrackingWidget extends W.Widget {
    static id = "backtracking";
    static algorithms = ALGORITHMS;
    static inputAttributes = ["n", "all", "values", "target"];
    static limits = { n: LIMITS.n };
    static editLabel = "widget.backtracking.edit";

    get editName() {
      return this.algorithm === "queens" ? "n" : "values";
    }

    parse() {
      const algorithm = this.algorithm;
      if (algorithm === "queens") {
        const text = (this.attr("n") ?? "4").trim();
        if (!/^\d+$/.test(text) || Number(text) < 1 || Number(text) > LIMITS.n) throw new W.InputError("widget.backtracking.error.n", { max: LIMITS.n });
        return { n: Number(text), all: this.hasAttribute("all") };
      }
      const [list, after] = (this.attr("values") ?? DEFAULT_VALUES[algorithm]).split(":");
      const subsets = algorithm === "subsets";
      const values = W.parse.values(list, { max: subsets ? LIMITS.subsets : LIMITS.permutations, random: this.random, text: !subsets });
      if (!subsets) return { values };
      const goal = (after ?? this.getAttribute("target") ?? "").trim();
      if (goal && !/^\d+$/.test(goal)) throw new W.InputError("widget.backtracking.error.positive");
      return { values, target: goal ? Number(goal) : null };
    }

    serialize(input) {
      if (input.n !== undefined) return String(input.n);
      return input.values.join(" ") + (input.target === null || input.target === undefined ? "" : ` : ${input.target}`);
    }

    steps(input, emit) {
      return run(input, { algorithm: this.algorithm }, emit);
    }

    draw(step, svg) {
      const { board, root } = step.state;
      if (board) {
        const heads = board.map((_, i) => i);
        grid(svg, board, { rowHeads: heads, colHeads: heads, marks: step.marks });
        svg.style.minWidth = `${Math.min(240, svg.viewBox.baseVal.width)}px`; // an 8 × 8 board fits 320 px
      } else {
        W.svg.tree(svg, root, { binary: false, children: (node) => node.kids, key: (node) => node.id, label: (node) => node.label, marks: step.marks });
      }
    }

    describe(step) {
      const { board, root } = step.state;
      if (board) {
        const queens = board.flatMap((row, r) => row.map((cell, c) => (cell ? `(${r}, ${c})` : null))).filter(Boolean);
        return t("describeBoard", { n: board.length, list: queens.join(", ") || t("none") });
      }
      const all = nodes(root);
      const active = all.filter(({ node }) => ["current", "visited"].includes(step.marks[node.id])).pop();
      return t("describeTree", { count: all.length, path: active ? `${root.label} ${active.path.join(" ")}` : root.label });
    }

    table(step) {
      const { board, root } = step.state;
      const state = this.t("widget.core.column.state");
      if (board) {
        return {
          head: [t("column.row"), t("column.queen"), state],
          rows: board.map((row, r) => {
            const c = row.indexOf("Q");
            return [r, c < 0 ? "—" : c, c < 0 ? "—" : this.stateName(step.marks[`${r},${c}`])];
          }),
        };
      }
      return { head: [t("column.path"), state], rows: nodes(root).map(({ node, path }) => [path.join(" ") || root.label, this.stateName(step.marks[node.id])]) };
    }
  }

  W.register("uc-widget-backtracking", BacktrackingWidget);
}
