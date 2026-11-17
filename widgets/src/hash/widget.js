/**
 * <uc-widget-hash>: a hash table with separate chaining, linear probing or
 * quadratic probing; insert, search and remove, the load factor and the
 * table growing (docs/plan/widgets-api.md 17; page docs/pt/widgets/uc-widget-hash.html).
 */
import { ALGORITHMS, VERBS, MAX_SIZE, MAX_KEYS, MAX_WORD, run } from "./algorithm.js";
import { strings } from "./i18n.js";
import { grid } from "../core/svg/grid.js";

const DELETED = "✕";

export default function define(UC) {
  UC.addTranslations("pt", { widget: { hash: strings.pt } });
  UC.addTranslations("en", { widget: { hash: strings.en } });
  const W = UC.widgets;
  const t = (key, params) => UC.t(`widget.hash.${key}`, params);

  /** The keys of each slot as text: a chain, a key, empty or deleted. */
  const slots = (state) =>
    state.rows
      ? state.rows.map((row) => (row.length ? row.join(" → ") : t("nothing")))
      : state.a.map((key, i) => (state.del[i] ? t("deletedCell") : key === null ? t("nothing") : String(key)));

  class HashWidget extends W.Widget {
    static id = "hash";
    static algorithms = ALGORITHMS;
    static inputAttributes = ["values", "ops", "size", "max-load"];
    static limits = { items: MAX_SIZE };
    static editAttribute = "ops";
    static editLabel = "widget.hash.edit";

    pseudocode(block) {
      const probe = t(`probe.${this.algorithm === "quadratic" ? "quadratic" : "linear"}`);
      return super.pseudocode(block).map((line) => line.replace("{probe}", probe));
    }

    parse() {
      const size = (this.getAttribute("size") ?? "7").trim();
      if (!/^\d+$/.test(size) || Number(size) < 1 || Number(size) > MAX_SIZE) throw new W.InputError("widget.hash.error.size");
      const load = (this.getAttribute("max-load") ?? "0.75").trim();
      if (load !== "none" && !(Number(load) > 0 && Number(load) <= 4)) throw new W.InputError("widget.hash.error.load");
      const values = W.parse.values(this.attr("values") ?? "random 5 1..99", { max: MAX_KEYS, random: this.random, text: true });
      const long = values.find((key) => String(key).length > MAX_WORD);
      if (long !== undefined) throw new W.InputError("widget.hash.error.long", { key: long, max: MAX_WORD });
      const ops = this.attr("ops");
      return { values, ops: ops === null ? null : W.parse.ops(ops, VERBS), size: Number(size), maxLoad: load === "none" ? null : Number(load) };
    }

    steps(input, emit) {
      return run(input, { algorithm: this.algorithm }, emit);
    }

    draw(step, svg) {
      const { state } = step;
      if (state.rows) grid(svg, state.rows, { rowHeads: state.rows.map((_, i) => i), marks: step.marks, chain: true });
      else {
        W.svg.array(svg, state.a.map((key, i) => (state.del[i] ? DELETED : key)), { marks: step.marks, pointers: step.pointers });
        // A word longer than a cell is squeezed to fit (svg.array cells have a fixed width).
        for (const label of svg.querySelectorAll(".uc-widget__value")) {
          if (label.textContent.length > 3) label.setAttribute("textLength", 38);
          else label.removeAttribute("textLength");
          label.setAttribute("lengthAdjust", "spacingAndGlyphs");
        }
      }
    }

    captionText() {
      const own = this.getAttribute("caption") || this.captionTemplate;
      return own ? super.captionText() : `${t("title")} · ${super.captionText()}`;
    }

    describe(step) {
      const { state } = step;
      return t("describe", { m: state.m, n: state.n, slots: slots(state).map((keys, i) => t("slotText", { i, keys })).join(" ") });
    }

    table(step) {
      return {
        head: [this.t("widget.core.column.index"), t("column.keys"), this.t("widget.core.column.state")],
        rows: slots(step.state).map((keys, i) => [i, keys, this.stateName(step.marks[i])]),
      };
    }

    serialize() {
      return this.attr("ops") || "";
    }
  }

  W.register("uc-widget-hash", HashWidget);
}
