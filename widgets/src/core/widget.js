/**
 * UC.widgets.Widget (docs/plan/widgets-api.md 16.2): the base class of every
 * widget. A widget declares parse(), steps(), draw() and, optionally,
 * describe(), table(), panel(), pseudocode() and serialize(); this class
 * provides the rest: lazy build, fallback, player, keyboard, narration,
 * pseudocode panel, state panel, text view, predict, editable, error notes,
 * language switch, events and the element methods of section 15.
 */
import { el, icon } from "./dom.js";
import { collect, random, decimals, MAX_STEPS } from "./engine.js";

const COMMON = ["algorithm", "algorithms", "speed", "controls", "editable", "predict", "start", "seed", "caption"];
const SPEED = { min: 200, max: 5000, fallback: 900 };
let counter = 0;

/* ---------- building lazily (2.4) ---------- */

const waiting = new Set();
let observer = null;

function watch(widget) {
  if (!("IntersectionObserver" in window)) {
    queueMicrotask(() => widget.build());
    return;
  }
  waiting.add(widget);
  observer =
    observer ||
    new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            waiting.delete(entry.target);
            entry.target.build();
          } else if (entry.target.built) {
            entry.target.pause(); // playing stops when the widget leaves the screen (8.1)
          }
        }
      },
      { rootMargin: "200px" },
    );
  observer.observe(widget);
}

window.addEventListener("beforeprint", () => waiting.forEach((widget) => widget.build()));

/** Picks the node whose lang matches the page language, then one without lang. */
function byLanguage(nodes, lang) {
  const base = (lang || "").split("-")[0];
  return (
    nodes.find((node) => node.getAttribute("lang") === lang) ||
    nodes.find((node) => (node.getAttribute("lang") || "").split("-")[0] === base) ||
    nodes.find((node) => !node.getAttribute("lang")) ||
    null
  );
}

export function createWidget(UC) {
  /** The sentence of a [key, params] pair. */
  const local = (text) => decimals(text, UC.lang);
  const say = (pair) => (pair ? local(UC.t(pair[0], pair[1])) : "");

  class Widget extends UC.Element {
    static id = "";
    static algorithms = [];
    static inputAttributes = [];
    static limits = {};
    /** The attribute the editable field changes (12) and the key of its label. */
    static editAttribute = null;
    static editLabel = "widget.core.edit.label";

    static get observedAttributes() {
      return COMMON.concat(this.inputAttributes);
    }

    /* ---------- hooks with defaults ---------- */

    describe(step) {
      return `${this.captionText()}. ${say(step.say)}`;
    }

    table() {
      return null;
    }

    panel() {
      return null;
    }

    pseudocode(algorithm) {
      const id = this.constructor.id;
      const lines = UC.t(algorithm ? `widget.${id}.code.${algorithm}` : `widget.${id}.code`);
      return Array.isArray(lines) ? lines : [];
    }

    serialize() {
      return this.attr(this.editName) || "";
    }

    get editName() {
      return this.constructor.editAttribute || this.constructor.inputAttributes[0];
    }

    /* ---------- options ---------- */

    /** An attribute, or the student's edit of it (12). */
    attr(name) {
      return name in this.overrides ? this.overrides[name] : this.getAttribute(name);
    }

    warn(name) {
      if (this.warned.has(name)) return;
      this.warned.add(name);
      console.warn(`[uc-widget] <${this.localName}>: invalid ${name}="${this.getAttribute(name)}", using the default.`, this);
    }

    get algorithm() {
      const list = this.constructor.algorithms;
      const value = this.chosen || this.getAttribute("algorithm");
      if (!list.length) return null;
      if (value && list.includes(value)) return value;
      if (value) this.warn("algorithm");
      return list[0];
    }

    get speed() {
      const value = this.getAttribute("speed");
      if (value === null) return SPEED.fallback;
      const ms = Number.parseInt(value, 10);
      if (!Number.isFinite(ms)) {
        this.warn("speed");
        return SPEED.fallback;
      }
      return Math.min(SPEED.max, Math.max(SPEED.min, ms));
    }

    get compact() {
      const value = this.getAttribute("controls");
      if (value && value !== "full" && value !== "compact") this.warn("controls");
      return value === "compact";
    }

    get seed() {
      const value = this.getAttribute("seed");
      if (value === null) return 1;
      if (!/^-?\d+$/.test(value.trim())) {
        this.warn("seed");
        return 1;
      }
      return Number(value);
    }

    /** The algorithms offered as toggle buttons (attribute `algorithms`), if more than one. */
    get offered() {
      const list = this.constructor.algorithms;
      const names = (this.getAttribute("algorithms") || "").split(/[\s,]+/).filter(Boolean);
      const valid = names.filter((name) => list.includes(name));
      if (valid.length < names.length) this.warn("algorithms");
      return valid.length > 1 ? valid : [];
    }

    choose(name) {
      if (name === this.algorithm) return;
      this.chosen = name;
      this.pause();
      this.compute();
    }

    startIndex() {
      const value = (this.getAttribute("start") || "0").trim();
      if (value === "end") return this.stepList.length - 1;
      if (!/^\d+$/.test(value)) {
        this.warn("start");
        return 0;
      }
      return Number(value);
    }

    /** Name of a visual state in words ("comparado"). */
    stateName(state) {
      return UC.t(`widget.core.stateName.${state || "default"}`);
    }

    /* ---------- element methods (15) ---------- */

    get step() {
      return this.index;
    }

    get total() {
      return this.stepList.length;
    }

    get result() {
      return this.output;
    }

    go(n) {
      this.build();
      this.pause();
      if (this.stepList.length) this.show(n === "end" ? this.stepList.length - 1 : Number(n) || 0);
    }

    next() {
      this.build();
      this.pause();
      this.forward(true);
    }

    back() {
      this.build();
      this.pause();
      if (this.index > 0) this.show(this.index - 1, { announce: true });
    }

    reset() {
      this.build();
      this.pause();
      this.clearPredictions();
      this.show(0, { announce: true });
    }

    play() {
      this.build();
      if (this.timer || this.stepList.length < 2) return;
      if (this.index >= this.stepList.length - 1) this.show(0);
      this.timer = window.setInterval(() => {
        if (!this.forward(false) && !this.pending) this.pause(true);
      }, this.speed);
      this.live.textContent = UC.t("widget.core.playing");
      this.updatePlayer();
    }

    pause(announce = false) {
      if (!this.timer) return;
      window.clearInterval(this.timer);
      this.timer = null;
      this.updatePlayer();
      if (announce) this.announce();
    }

    /* ---------- lifecycle ---------- */

    setup() {
      counter += 1;
      this.uid = `ucw${counter}`;
      this.classList.add("uc-widget");
      this.overrides = {};
      this.warned = new Set();
      this.stepList = [];
      this.index = 0;
      this.output = undefined;
      this.answered = new Set();
      this.score = { right: 0, asked: 0 };
      const children = Array.from(this.childNodes);
      const matches = (node, selector) => node.nodeType === 1 && node.matches(selector);
      this.codes = children.filter((node) => matches(node, "pre[data-pseudocode]"));
      this.inputNode = children.find((node) => matches(node, "[data-input]")) || null;
      this.captionTemplate = children.find((node) => matches(node, "template[data-caption]")) || null;
      const rest = children.filter((node) => !this.codes.includes(node) && node !== this.inputNode && node !== this.captionTemplate);
      this.fallback = el("div", { class: "uc-widget__fallback" }, rest);
      this.prepend(this.fallback);
      watch(this);
    }

    render() {
      if (this.built) this.refresh();
    }

    attributeChangedCallback(name, previous, value) {
      if (this.built && previous !== value) {
        this.warned.delete(name);
        if (name === "algorithm") this.chosen = null;
        this.pause();
        this.compute();
      }
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      this.pause();
    }

    /** Builds the widget once: the DOM, then the steps. Never throws to the page. */
    build() {
      if (this.built) return;
      this.built = true;
      waiting.delete(this);
      try {
        this.makeDom();
      } catch (error) {
        console.error(`[uc-widget] <${this.localName}> could not be built.`, error);
        return;
      }
      this.compute();
    }

    /** Parses the input and runs the algorithm. Throws InputError / TooManySteps. */
    run() {
      this.random = random(this.seed);
      const input = this.parse();
      const { steps, result } = collect((data, options, emit) => this.steps(data, emit), input);
      return { input, steps, result };
    }

    /** (Re)computes the steps; on failure shows the error note and the fallback (10.4). */
    compute() {
      let run;
      try {
        run = this.run();
      } catch (error) {
        this.fail(error);
        return false;
      }
      this.accept(run);
      this.show(Math.min(this.startIndex(), this.stepList.length - 1));
      return true;
    }

    accept({ input, steps, result }) {
      this.input = input;
      this.stepList = steps;
      this.output = result;
      this.error = null;
      this.clearPredictions();
      this.textList = null;
      this.figure.hidden = false;
      this.fallback.hidden = true;
      this.errorNote.hidden = true;
      if (this.inputNode) this.inputNode.hidden = true;
      if (this.field) this.field.value = this.serialize(input);
      this.refresh();
    }

    fail(error) {
      this.error = this.errorMessage(error);
      console.warn(`[uc-widget] <${this.localName}>: ${error.message}`, this, error && error.name === "InputError" ? error.params : error);
      this.stepList = [];
      this.figure.hidden = true;
      this.fallback.hidden = false;
      this.errorNote.hidden = false;
      this.errorNote.textContent = UC.t(this.error[0], this.error[1]);
    }

    errorMessage(error) {
      // By name: a widget file bundles its own copy of InputError.
      if (error && error.name === "InputError") {
        return error.key.startsWith("widget.core.error.tooLarge") || error.key.startsWith("widget.core.error.tooManySteps")
          ? [error.key, error.params]
          : ["widget.core.error.input", { detail: UC.t(error.key, error.params) }];
      }
      if (error && error.name === "TooManySteps") return ["widget.core.error.tooManySteps", { max: MAX_STEPS }];
      console.error(`[uc-widget] <${this.localName}> failed.`, error);
      return ["widget.core.error.build", {}];
    }

    /* ---------- structure (7.1) ---------- */

    makeDom() {
      const id = (part) => `${this.uid}-${part}`;
      const button = (name, action, className = "uc-button") =>
        el("button", { type: "button", class: `${className} uc-widget__${name}`, onClick: action });

      this.caption = el("figcaption", { class: "uc-widget__caption", id: id("caption") });
      this.choices = this.offered.map((name) =>
        el("button", { type: "button", class: "uc-button uc-button--sm", "aria-pressed": "false", "data-algorithm": name, onClick: () => this.choose(name) }),
      );
      this.choiceBox = el("div", { class: "uc-widget__choices", role: "group", hidden: !this.choices.length }, this.choices);
      this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      this.svg.setAttribute("class", "uc-widget__svg");
      this.svg.setAttribute("role", "img");
      this.svg.setAttribute("focusable", "false");
      this.stage = el("div", { class: "uc-widget__stage", tabindex: "0", role: "group", "aria-labelledby": id("caption"), "aria-describedby": id("say") }, this.svg);
      this.codeTitle = el("p", { class: "uc-widget__heading", id: id("code") });
      this.codeBox = el("div", { class: "uc-widget__code", role: "group", "aria-labelledby": id("code") }, this.codeTitle);
      this.panelBox = el("dl", { class: "uc-widget__panel" });
      this.sayLine = el("p", { class: "uc-widget__say", id: id("say") });
      this.predictBox = el("div", { class: "uc-widget__predict", hidden: true });

      this.backButton = button("back", () => this.back());
      this.stepButton = button("step", () => this.next());
      this.counter = el("output", { class: "uc-widget__counter" });
      const controls = [this.backButton, this.stepButton];
      if (!this.compact) {
        this.playButton = button("play", () => (this.timer ? this.pause(true) : this.play()), "uc-button uc-button--primary");
        this.resetButton = button("reset", () => this.reset());
        this.scrubber = el("input", {
          type: "range",
          class: "uc-widget__scrubber",
          min: "0",
          onInput: () => {
            this.pause();
            this.show(Number(this.scrubber.value));
          },
          onChange: () => this.announce(),
        });
        controls.unshift(this.playButton);
        controls.push(this.resetButton, this.scrubber);
      }
      this.player = el("div", { class: "uc-widget__player", role: "group" }, controls, this.counter);

      this.scoreLine = el("p", { class: "uc-widget__score", hidden: !this.hasAttribute("predict") });
      this.feedback = el("p", { class: "uc-widget__feedback" });
      this.textButton = el("button", {
        type: "button",
        class: "uc-button uc-button--sm uc-widget__text-toggle",
        "aria-expanded": "false",
        "aria-controls": id("text"),
        onClick: () => this.toggleText(),
      });
      this.tools = el("div", { class: "uc-widget__tools" }, this.textButton);
      if (this.hasAttribute("editable")) this.tools.append(this.makeEditor(id));
      this.textBox = el("div", { class: "uc-widget__text", id: id("text"), hidden: true });

      const side = el("div", { class: "uc-widget__side" }, this.codeBox, this.panelBox);
      this.figure = el(
        "figure",
        { class: "uc-widget__figure", "aria-labelledby": id("caption") },
        this.caption,
        this.choiceBox,
        el("div", { class: "uc-widget__body" }, this.stage, side),
        this.sayLine,
        this.predictBox,
        this.player,
        el("div", { class: "uc-widget__score-box" }, this.scoreLine, this.feedback),
        this.tools,
        this.textBox,
      );
      this.errorNote = el("p", { class: "uc-widget__error", hidden: true });
      this.live = el("p", { class: "uc-visually-hidden", "aria-live": "polite", "aria-atomic": "true" });
      this.codeHolder = el("div", { hidden: true }, this.codes);
      this.codeBox.append(this.codeHolder);
      this.fallback.before(this.errorNote);
      this.append(this.figure, this.live);
      this.addEventListener("keydown", (event) => this.onKey(event));
      document.addEventListener("visibilitychange", () => document.hidden && this.pause());
    }

    makeEditor(id) {
      this.field = el("input", { type: "text", class: "uc-widget__field", id: id("field"), spellcheck: "false", autocomplete: "off" });
      this.fieldLabel = el("label", { for: id("field") });
      this.fieldError = el("p", { class: "uc-widget__field-error", id: id("field-error"), hidden: true });
      this.runButton = el("button", { type: "submit", class: "uc-button uc-button--sm" });
      this.restoreButton = el("button", { type: "button", class: "uc-button uc-button--sm", onClick: () => this.edit(null) });
      return el(
        "form",
        {
          class: "uc-widget__edit",
          onSubmit: (event) => {
            event.preventDefault();
            this.edit(this.field.value);
          },
        },
        this.fieldLabel,
        el("span", { class: "uc-widget__edit-row" }, this.field, this.runButton, this.restoreButton),
        this.fieldError,
      );
    }

    /* ---------- texts (every language change) ---------- */

    captionText() {
      const value = this.getAttribute("caption");
      if (value) return value;
      if (this.captionTemplate) {
        const span = byLanguage(Array.from(this.captionTemplate.content.querySelectorAll("[lang]")), UC.lang);
        if (span) return span.textContent.trim();
      }
      const id = this.constructor.id;
      return UC.t(this.algorithm ? `widget.${id}.caption.${this.algorithm}` : `widget.${id}.caption`);
    }

    refresh() {
      if (this.error) {
        this.errorNote.textContent = UC.t(this.error[0], this.error[1]);
        return;
      }
      const t = (key, params) => UC.t(`widget.core.${key}`, params);
      this.caption.textContent = this.captionText();
      this.codeTitle.textContent = t("code");
      this.player.setAttribute("aria-label", t("controls"));
      this.label(this.backButton, "back", t("back"));
      this.label(this.stepButton, "step", t("step"));
      if (this.resetButton) this.label(this.resetButton, "reset", t("reset"));
      if (this.scrubber) this.scrubber.setAttribute("aria-label", t("scrubber"));
      this.textButton.textContent = t("textView");
      this.choiceBox.setAttribute("aria-label", t("algorithm"));
      const id = this.constructor.id;
      for (const button of this.choices) {
        button.textContent = UC.t(`widget.${id}.caption.${button.dataset.algorithm}`);
        button.setAttribute("aria-pressed", String(button.dataset.algorithm === this.algorithm));
      }
      if (this.field) {
        this.fieldLabel.textContent = UC.t(this.constructor.editLabel);
        this.runButton.textContent = t("edit.run");
        this.restoreButton.textContent = t("edit.restore");
      }
      this.renderCode(this.currentBlock());
      this.textList = null;
      if (this.pending !== undefined && this.pending !== null) this.ask(this.pending, false);
      if (this.stepList.length) this.paint();
    }

    label(button, name, text) {
      button.replaceChildren(icon(name), el("span", { class: "uc-widget__label" }, text));
    }

    /* ---------- pseudocode (9) ---------- */

    /** Renders the pseudocode of `block`: an algorithm, or the operation a step names in `step.code`. */
    renderCode(block = this.codeBlock || this.algorithm) {
      this.codeBlock = block;
      const algorithm = block;
      const fitting = this.codes.filter((pre) => !pre.dataset.algorithm || pre.dataset.algorithm.split(/\s+/).includes(algorithm));
      const own = byLanguage(fitting, UC.lang);
      const defaults = this.pseudocode(algorithm);
      const known = new Set(defaults.flatMap((line) => line.split("|")[0].split(" ")).filter(Boolean));
      this.codeBox.querySelector(":scope > .uc-widget__pre")?.remove();
      this.codeHolder.append(...this.codes);
      let pre;
      if (own) {
        pre = own;
        for (const node of pre.querySelectorAll("[data-line]")) {
          for (const name of node.dataset.line.split(/\s+/)) {
            if (!known.has(name) && !this.warned.has(`line:${name}`)) {
              this.warned.add(`line:${name}`);
              console.warn(`[uc-widget] <${this.localName}>: unknown pseudocode line id "${name}".`, this);
            }
          }
        }
      } else {
        pre = el(
          "pre",
          {},
          el(
            "code",
            {},
            defaults.map((line) => {
              const cut = line.indexOf("|");
              const name = line.slice(0, cut);
              return el("span", { class: "uc-widget__line", "data-line": name || null }, line.slice(cut + 1));
            }),
          ),
        );
      }
      pre.classList.add("uc-widget__pre");
      this.codeBox.append(pre);
      this.codeLines = Array.from(pre.querySelectorAll("[data-line]"));
      this.codeBox.hidden = !pre.textContent.trim();
    }

    /* ---------- one step on screen ---------- */

    show(n, { announce = false, forward = false } = {}) {
      const last = this.stepList.length - 1;
      const previous = this.index;
      this.index = Math.max(0, Math.min(last, n));
      this.closePredict();
      this.paint();
      if (announce) this.announce();
      this.dispatchEvent(new CustomEvent("uc:widgetstep", { bubbles: true, detail: { widget: this.localName, step: this.index, total: this.stepList.length } }));
      if (forward && this.index === last && previous !== last) {
        // stats and input: what <uc-widget-complexity for> plots (24.6).
        const detail = { widget: this.localName, total: this.stepList.length, stats: this.stepList[last].stats || {}, input: this.input };
        this.dispatchEvent(new CustomEvent("uc:widgetdone", { bubbles: true, detail }));
      }
    }

    currentBlock() {
      const step = this.stepList[this.index];
      return (step && step.code) || this.algorithm;
    }

    paint() {
      const step = this.stepList[this.index];
      if (!step) return;
      if (this.currentBlock() !== this.codeBlock) this.renderCode(this.currentBlock());
      this.draw(step, this.svg);
      this.svg.setAttribute("aria-label", local(this.describe(step)));
      this.sayLine.textContent = say(step.say);
      const lines = new Set([].concat(step.line || []));
      for (const node of this.codeLines) {
        const on = node.dataset.line.split(/\s+/).some((name) => lines.has(name));
        node.classList.toggle("is-current", on);
        if (on) node.setAttribute("aria-current", "true");
        else node.removeAttribute("aria-current");
      }
      this.renderPanel(step);
      this.updatePlayer();
      if (!this.textBox.hidden) this.renderText();
    }

    updatePlayer() {
      if (!this.counter) return;
      const total = this.stepList.length;
      const n = this.index + 1;
      this.counter.textContent = UC.t(this.compact ? "widget.core.counterShort" : "widget.core.counter", { n, total });
      this.backButton.disabled = this.index <= 0;
      this.stepButton.disabled = this.index >= total - 1;
      if (this.playButton) this.label(this.playButton, this.timer ? "pause" : "play", UC.t(this.timer ? "widget.core.pause" : "widget.core.play"));
      if (this.scrubber) {
        this.scrubber.max = String(Math.max(0, total - 1));
        this.scrubber.value = String(this.index);
        const step = this.stepList[this.index];
        this.scrubber.setAttribute("aria-valuetext", `${UC.t("widget.core.counter", { n, total })}: ${step ? say(step.say) : ""}`);
      }
      if (this.scoreLine && !this.scoreLine.hidden) this.scoreLine.textContent = UC.t("widget.core.predict.score", { right: this.score.right, total: this.score.asked });
    }

    announce() {
      const step = this.stepList[this.index];
      if (step) this.live.textContent = UC.t("widget.core.announce", { n: this.index + 1, total: this.stepList.length, say: say(step.say) });
    }

    /* ---------- state panel (10.1) ---------- */

    renderPanel(step) {
      const custom = this.panel(step);
      if (custom) {
        this.panelBox.replaceChildren(...[].concat(custom));
        return;
      }
      const id = this.constructor.id;
      const rows = [];
      for (const [key, value] of Object.entries(step.stats || {})) {
        rows.push(el("div", { class: "uc-widget__stat" }, el("dt", {}, UC.t(`widget.core.stat.${key}`)), el("dd", { class: "uc-mono" }, local(value))));
      }
      for (const [key, value] of Object.entries(step.aux || {})) {
        const core = ["output", "stack", "queue"].includes(key);
        let content;
        if (Array.isArray(value)) {
          const items = key === "stack" ? value.slice().reverse() : value;
          content = items.length
            ? el(
                "ol",
                { class: `uc-widget__chips uc-widget__chips--${key}` },
                items.map((item, i) => el("li", {}, String(item), i === 0 && key !== "output" && core ? el("span", { class: "uc-widget__tag" }, ` ${UC.t(key === "stack" ? "widget.core.top" : "widget.core.front")}`) : null)),
              )
            : UC.t(key === "output" ? "widget.core.nothingYet" : "widget.core.empty");
        } else {
          content = value === null || value === undefined ? "—" : local(value);
        }
        rows.push(el("div", { class: "uc-widget__aux" }, el("dt", {}, UC.t(core ? `widget.core.${key}` : `widget.${id}.aux.${key}`)), el("dd", { class: "uc-mono" }, content)));
      }
      this.panelBox.replaceChildren(...rows);
      this.panelBox.hidden = rows.length === 0;
    }

    /* ---------- text view (10.3) ---------- */

    toggleText() {
      const open = this.textBox.hidden;
      this.textBox.hidden = !open;
      this.textButton.setAttribute("aria-expanded", String(open));
      if (open) this.renderText();
    }

    renderText() {
      if (!this.textList) {
        this.textList = el("ol", { class: "uc-widget__steps" }, this.stepList.map((step) => el("li", {}, say(step.say))));
        this.textTable = el("div", { class: "uc-widget__table uc-table" });
        this.textResult = el("p", { class: "uc-widget__result" });
        this.textBox.replaceChildren(el("p", { class: "uc-widget__heading" }, UC.t("widget.core.steps")), this.textList, this.textTable, this.textResult);
      }
      Array.from(this.textList.children).forEach((item, i) => {
        if (i === this.index) item.setAttribute("aria-current", "step");
        else item.removeAttribute("aria-current");
      });
      const step = this.stepList[this.index];
      const data = this.table(step);
      this.textTable.replaceChildren();
      if (data) {
        this.textTable.append(
          el(
            "table",
            {},
            el("caption", {}, `${UC.t("widget.core.state")} · ${UC.t("widget.core.counter", { n: this.index + 1, total: this.stepList.length })}`),
            el("thead", {}, el("tr", {}, data.head.map((cell) => el("th", { scope: "col" }, cell)))),
            el("tbody", {}, data.rows.map((row) => el("tr", {}, row.map((cell) => el("td", {}, local(cell)))))),
          ),
        );
      }
      const last = this.stepList[this.stepList.length - 1];
      this.textResult.replaceChildren(el("strong", {}, `${UC.t("widget.core.result")}: `), say(last.say));
    }

    /* ---------- predict (11) ---------- */

    clearPredictions() {
      this.answered = new Set();
      this.score = { right: 0, asked: 0 };
      if (this.feedback) this.feedback.textContent = "";
    }

    /** Moves one step forward, asking first when the step has a question. */
    forward(announce) {
      const n = this.index + 1;
      if (n >= this.stepList.length) return false;
      if (this.ask(n, true)) return false;
      this.show(n, { announce, forward: true });
      return true;
    }

    ask(n, focus) {
      const question = this.stepList[n] && this.stepList[n].predict;
      if (!this.hasAttribute("predict") || !question || (focus && this.answered.has(n))) return false;
      this.pause();
      this.pending = n;
      const options = question.options.map((option, i) =>
        el("button", { type: "button", class: "uc-button uc-widget__option", onClick: () => this.answer(i) }, say(option)),
      );
      this.predictBox.replaceChildren(
        el("p", { class: "uc-widget__question" }, el("strong", {}, `${UC.t("widget.core.predict.question")} `), say(question.ask)),
        el("div", { class: "uc-widget__options", role: "group", "aria-label": UC.t("widget.core.predict.question") }, options),
      );
      this.predictBox.hidden = false;
      if (focus) options[0].focus();
      return true;
    }

    answer(choice) {
      const n = this.pending;
      const question = this.stepList[n].predict;
      const correct = choice === question.answer;
      this.answered.add(n);
      this.score.asked += 1;
      if (correct) this.score.right += 1;
      this.show(n, { forward: true });
      const sentence = say(this.stepList[n].say);
      const text = correct ? `${UC.t("widget.core.predict.right")} ${sentence}` : UC.t("widget.core.predict.wrong", { say: sentence });
      this.feedback.textContent = text;
      this.live.textContent = text;
      this.updatePlayer();
      (this.stepButton.disabled ? this.backButton : this.stepButton).focus();
      this.dispatchEvent(
        new CustomEvent("uc:widgetpredict", { bubbles: true, detail: { widget: this.localName, step: n, correct, right: this.score.right, asked: this.score.asked } }),
      );
    }

    closePredict() {
      this.pending = null;
      if (this.predictBox && !this.predictBox.hidden) {
        const hadFocus = this.predictBox.contains(document.activeElement);
        this.predictBox.hidden = true;
        this.predictBox.replaceChildren();
        if (hadFocus) this.stepButton.focus();
      }
    }

    /* ---------- editable (12) ---------- */

    edit(text) {
      const name = this.editName;
      const before = this.overrides;
      this.overrides = text === null ? {} : { ...before, [name]: text };
      let run;
      try {
        run = this.run();
      } catch (error) {
        this.overrides = before;
        const [key, params] = this.errorMessage(error);
        const message = UC.t(key, params);
        this.fieldError.textContent = message;
        this.fieldError.hidden = false;
        this.field.setAttribute("aria-invalid", "true");
        this.field.setAttribute("aria-describedby", this.fieldError.id);
        this.live.textContent = message;
        return;
      }
      this.fieldError.hidden = true;
      this.field.removeAttribute("aria-invalid");
      this.field.removeAttribute("aria-describedby");
      this.pause();
      this.accept(run);
      this.show(0, { announce: true });
    }

    /* ---------- keyboard (8.2) ---------- */

    onKey(event) {
      const target = event.target;
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (target.closest(".uc-widget__predict, .uc-widget__edit, .uc-widget__text") || target === this.scrubber) return;
      const last = this.stepList.length - 1;
      switch (event.key) {
        case "ArrowRight":
          this.next();
          break;
        case "ArrowLeft":
          this.back();
          break;
        case "Home":
          this.pause();
          this.show(0, { announce: true });
          break;
        case "End":
          this.pause();
          this.show(last, { announce: true, forward: true });
          break;
        case " ":
          if (target !== this.stage) return;
          if (this.timer) this.pause(true);
          else this.play();
          break;
        case "Escape":
          if (!this.timer) return;
          this.pause(true);
          break;
        default:
          return;
      }
      event.preventDefault();
    }
  }

  return Widget;
}
