/*
 * my-widget-gcd.js: a widget of your own, without any build step.
 * <my-widget-gcd a="48" b="18"> shows Euclid's algorithm step by step,
 * with the same player, narration, pseudocode, text view and predict mode
 * as the catalogue widgets.
 *
 * To make your own: copy this file next to your pages, rename the element
 * (keep a hyphen; use your course's prefix, e.g. "edados-…", never
 * "uc-widget-…", which is the catalogue's), then change the four marked
 * parts: STRINGS, run(), parse() and draw().
 *
 * In the page, after the kit, load the widget core first, then this file:
 *   <script src="https://uc-design-kit.miguelrocha.dev/widgets/v1/uc-widget-core.js" defer></script>
 *   <script src="my-widget-gcd.js" defer></script>
 *
 * Guide: https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/criar.html
 * Contract: docs/plan/widgets-api.md (sections 6 and 16).
 */
(function () {
  "use strict";

  /* 1. STRINGS: every sentence in pt and en, under widget.<id>. A step's
        sentence is a key and its values ({a}, {b}), never a finished
        string, so the language switch works. Pseudocode lines are
        "<id>|<text>"; a step highlights the line with its id. */
  var STRINGS = {
    pt: {
      caption: { euclid: "Algoritmo de Euclides" },
      describe: "a = {a}, b = {b}.",
      start: "mdc({a}, {b}): enquanto b ≠ 0, (a, b) passa a (b, a mod b).",
      divide: "{a} mod {b} = {r}: (a, b) passa a ({b}, {r}).",
      end: "b = 0: o máximo divisor comum é {a}.",
      ask: "Quanto é {a} mod {b}?",
      value: "{v}",
      error: { number: "a e b têm de ser inteiros de 0 a 9999, e não ambos 0." },
      code: { euclid: ["|mdc(a, b):", "loop|  enquanto b ≠ 0:", "divide|    (a, b) = (b, a mod b)", "end|  devolver a"] },
    },
    en: {
      caption: { euclid: "Euclid's algorithm" },
      describe: "a = {a}, b = {b}.",
      start: "gcd({a}, {b}): while b ≠ 0, (a, b) becomes (b, a mod b).",
      divide: "{a} mod {b} = {r}: (a, b) becomes ({b}, {r}).",
      end: "b = 0: the greatest common divisor is {a}.",
      ask: "What is {a} mod {b}?",
      value: "{v}",
      error: { number: "a and b must be integers from 0 to 9999, not both 0." },
      code: { euclid: ["|gcd(a, b):", "loop|  while b ≠ 0:", "divide|    (a, b) = (b, a mod b)", "end|  return a"] },
    },
  };

  /* 2. run(): the algorithm, run once, emitting every step. Keep it pure
        (no page, no Math.random): the same input gives the same steps.
        A step: { state, marks, pointers, line, say, predict }. The first
        step has no marks; the last one is the result. */
  function run(input, options, emit) {
    var a = input.a;
    var b = input.b;
    var key = function (name) { return "widget.gcd." + name; };
    emit({ state: { a: a, b: b }, marks: {}, line: null, say: [key("start"), { a: a, b: b }] });
    while (b !== 0) {
      var r = a % b;
      // Three answers to choose from, the right one among them.
      var choices = r > 0 ? [r - 1, r, r + 1] : [0, 1, 2];
      emit({
        state: { a: b, b: r },
        marks: { 0: "swapped", 1: r === 0 ? "done" : "current" },
        pointers: { a: "0", b: "1" },
        line: "divide",
        say: [key("divide"), { a: a, b: b, r: r }],
        predict: { ask: [key("ask"), { a: a, b: b }], options: choices.map(function (v) { return [key("value"), { v: v }]; }), answer: choices.indexOf(r) },
      });
      a = b;
      b = r;
    }
    emit({ state: { a: a, b: 0 }, marks: { 0: "done" }, pointers: { a: "0", b: "1" }, line: "end", say: [key("end"), { a: a }] });
    return a;
  }

  function define(UC) {
    var W = UC.widgets;
    UC.addTranslations("pt", { widget: { gcd: STRINGS.pt } });
    UC.addTranslations("en", { widget: { gcd: STRINGS.en } });

    class GcdWidget extends W.Widget {
      static id = "gcd"; // the namespace of the strings: widget.gcd.*
      static algorithms = ["euclid"];
      static inputAttributes = ["a", "b"]; // changing them rebuilds the widget

      /* 3. parse(): attributes → the input of run(). Throw
            W.InputError(key) for bad input: the widget shows the message
            and the text you wrote inside the element. */
      parse() {
        var a = Number(this.getAttribute("a") || "48");
        var b = Number(this.getAttribute("b") || "18");
        var ok = function (n) { return Number.isInteger(n) && n >= 0 && n <= 9999; };
        if (!ok(a) || !ok(b) || a + b === 0) throw new W.InputError("widget.gcd.error.number");
        return { a: a, b: b };
      }

      steps(input, emit) {
        return run(input, {}, emit);
      }

      /* 4. draw(): one step into the <svg>. The core primitives draw the
            states with colour, outline and a marker: W.svg.array (cells),
            W.svg.tree (trees). */
      draw(step, svg) {
        W.svg.array(svg, [step.state.a, step.state.b], { marks: step.marks, pointers: step.pointers });
      }

      /* The drawing in words (the svg's label) and the text view's table. */
      describe(step) {
        return UC.t("widget.gcd.describe", step.state);
      }

      table(step) {
        return { head: ["a", "b"], rows: [[step.state.a, step.state.b]] };
      }
    }

    W.register("my-widget-gcd", GcdWidget);
  }

  // Run now if the widget core is loaded, otherwise when it loads.
  var UC = window.UC;
  if (!UC || !UC.Element) {
    console.error("[my-widget-gcd] Load uc-kit.js and uc-widget-core.js before my-widget-gcd.js.");
    return;
  }
  var widgets = UC.widgets || (UC.widgets = { __queue: [] });
  if (widgets.version) define(UC);
  else widgets.__queue.push(define);
})();
