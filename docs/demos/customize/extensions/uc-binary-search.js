/*
 * <uc-binary-search>: steps through a binary search on a sorted list.
 * A level 3 extension written for the documentation's fictional course.
 *
 * Attributes:
 *   values  sorted integers separated by spaces (required)
 *   target  the value to look for (required)
 *
 * The element's children are the fallback shown without JavaScript. They are
 * kept, hidden, once the widget is built.
 */
(function () {
  "use strict";

  // The kit must be loaded first: fail loudly, not silently.
  if (!window.UC || !window.UC.Element) {
    console.error("[uc-binary-search] Load uc-kit.js before this extension.");
    return;
  }

  const UC = window.UC;

  /* ---------- 1. Interface texts, namespaced so they never clash with the kit's ---------- */

  UC.addTranslations("pt", {
    binarySearch: {
      label: "Pesquisa binária de {target}",
      step: "Passo",
      reset: "Recomeçar",
      start: "Procura-se {target}. Carregar em Passo para começar.",
      range: "Passo {n}: posições {lo} a {hi}, meio na posição {mid} com {value}.",
      right: "{value} é menor do que {target}: continua à direita.",
      left: "{value} é maior do que {target}: continua à esquerda.",
      found: "Encontrado na posição {mid} em {n} passos.",
      missing: "{target} não está na lista.",
      noValues: "Faltam os atributos values e target.",
    },
  });

  UC.addTranslations("en", {
    binarySearch: {
      label: "Binary search for {target}",
      step: "Step",
      reset: "Start again",
      start: "Looking for {target}. Press Step to begin.",
      range: "Step {n}: positions {lo} to {hi}, middle at position {mid} holding {value}.",
      right: "{value} is less than {target}: go right.",
      left: "{value} is greater than {target}: go left.",
      found: "Found at position {mid} in {n} steps.",
      missing: "{target} is not in the list.",
      noValues: "The values and target attributes are missing.",
    },
  });

  /* ---------- 2. Helpers ---------- */

  /** Creates an element with attributes and children (text is never parsed as HTML). */
  function el(tag, attributes, ...children) {
    const node = document.createElement(tag);
    Object.entries(attributes || {}).forEach(([name, value]) => node.setAttribute(name, value));
    node.append(...children);
    return node;
  }

  /** Every comparison of a binary search for `target` in the sorted `values`. */
  function search(values, target) {
    const steps = [];
    let lo = 0;
    let hi = values.length - 1;
    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      const outcome = values[mid] === target ? "found" : values[mid] < target ? "right" : "left";
      steps.push({ lo, hi, mid, outcome });
      if (outcome === "found") break;
      if (outcome === "right") lo = mid + 1;
      else hi = mid - 1;
    }
    return steps;
  }

  /* ---------- 3. The component ---------- */

  class UCBinarySearch extends UC.Element {
    /** Once: read the attributes, keep the fallback, build the fixed structure. */
    setup() {
      this.values = (this.getAttribute("values") || "").trim().split(/\s+/).filter(Boolean).map(Number);
      this.target = Number(this.getAttribute("target"));
      this.valid = this.values.length > 0 && this.values.every(Number.isFinite) && this.hasAttribute("target");

      this.fallback = el("div", { class: "uc-binary-search__fallback" }, ...Array.from(this.childNodes));
      this.append(this.fallback);
      if (!this.valid) {
        this.message = el("p", { class: "uc-binary-search__message" });
        this.append(this.message);
        return;
      }
      this.fallback.hidden = true;

      this.steps = search(this.values, this.target);
      this.current = -1; // no step shown yet

      this.cells = this.values.map((value, index) =>
        el(
          "li",
          { class: "uc-binary-search__cell" },
          el("span", { class: "uc-binary-search__index" }, String(index)),
          el("span", { class: "uc-binary-search__value" }, String(value)),
        ),
      );
      this.status = el("p", { class: "uc-binary-search__status", "aria-live": "polite" });
      this.stepButton = el("button", { type: "button", class: "uc-button uc-button--sm uc-button--primary" });
      this.resetButton = el("button", { type: "button", class: "uc-button uc-button--sm" });
      this.stepButton.addEventListener("click", () => this.next());
      this.resetButton.addEventListener("click", () => this.reset());

      this.widget = el(
        "div",
        { class: "uc-binary-search__widget", role: "group" },
        el("ol", { class: "uc-binary-search__cells" }, ...this.cells),
        this.status,
        el("div", { class: "uc-binary-search__actions" }, this.stepButton, this.resetButton),
      );
      this.append(this.widget);
    }

    /** On connection and after every language change: texts and state, never new content. */
    render() {
      if (!this.valid) {
        this.message.textContent = this.t("binarySearch.noValues");
        return;
      }
      const step = this.steps[this.current] || null;
      const done = this.current === this.steps.length - 1;

      this.widget.setAttribute("aria-label", this.t("binarySearch.label", { target: this.target }));
      this.stepButton.textContent = this.t("binarySearch.step");
      this.resetButton.textContent = this.t("binarySearch.reset");
      // aria-disabled instead of disabled: the button keeps the keyboard focus.
      this.stepButton.setAttribute("aria-disabled", String(done));

      this.cells.forEach((cell, index) => {
        let state = "";
        if (step && (index < step.lo || index > step.hi)) state = "out";
        if (step && index === step.mid) state = step.outcome === "found" ? "found" : "mid";
        if (state) cell.dataset.state = state;
        else delete cell.dataset.state;
      });

      this.status.textContent = step ? this.describe(step) : this.t("binarySearch.start", { target: this.target });
    }

    describe(step) {
      const params = { ...step, n: this.current + 1, value: this.values[step.mid], target: this.target };
      const sentences = [this.t("binarySearch.range", params)];
      sentences.push(this.t(`binarySearch.${step.outcome}`, params));
      if (step.outcome !== "found" && this.current === this.steps.length - 1) {
        sentences.push(this.t("binarySearch.missing", params));
      }
      return sentences.join(" ");
    }

    next() {
      if (this.current >= this.steps.length - 1) return;
      this.current += 1;
      this.render();
    }

    reset() {
      this.current = -1;
      this.render();
    }
  }

  UC.define("uc-binary-search", UCBinarySearch);
})();
