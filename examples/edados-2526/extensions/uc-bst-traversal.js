/*
 * <uc-bst-traversal> — animated traversal of a small binary search tree.
 *
 * ─────────────────────────────────────────────────────────────────────────
 *  HOW TO WRITE AND LOAD AN EXTENSION (for teachers)
 * ─────────────────────────────────────────────────────────────────────────
 *  An extension is an ordinary JavaScript file that defines one new HTML
 *  element with the kit's public API (docs/api.md, section 7). Nothing to
 *  install and no build step: copy this file, rename it, change it.
 *
 *  1. Load it in the page, AFTER the kit and also with `defer`, so that
 *     `window.UC` already exists when it runs (plus its stylesheet, if any):
 *
 *       <link rel="stylesheet" href="../../../kit/v1/uc-kit.css">
 *       <link rel="stylesheet" href="../extensions/uc-bst-traversal.css">
 *       <script src="../course.js"></script>
 *       <script src="../../../kit/v1/uc-kit.js" defer></script>
 *       <script src="../extensions/uc-bst-traversal.js" defer></script>
 *
 *  2. Use the element in the page. Whatever you write inside it is the
 *     fallback shown when JavaScript is off (and kept, hidden, afterwards):
 *
 *       <uc-bst-traversal values="5 3 8 1 4 7 9">
 *         <p>Pré-ordem: 5 3 1 4 8 7 9 …</p>
 *       </uc-bst-traversal>
 *
 *  3. The rules every component follows, built-in or not:
 *     - extend `UC.Element` and register with `UC.define(name, class)`;
 *       the name must contain a hyphen (custom elements require it);
 *     - `setup()` runs once: build the fixed structure and keep the
 *       teacher's children; `render()` runs on connection and after every
 *       language change: refresh the texts, never duplicate content;
 *     - interface texts come from `UC.addTranslations(lang, {...})` and
 *       `this.t(key)`, so the element follows the language switch;
 *     - styles use only the `--uc-*` tokens (colours, spacing, fonts), so
 *       the element follows the course's accent colour and theme.css;
 *     - real <button>s for actions (keyboard and screen readers for free),
 *       an `aria-live` region for changes, `prefers-reduced-motion` honoured.
 *
 * ─────────────────────────────────────────────────────────────────────────
 *  THIS ELEMENT
 * ─────────────────────────────────────────────────────────────────────────
 *  Attributes:
 *    values  (required) space-separated integers, inserted in that order into
 *            an empty BST. Duplicates are ignored. Keep it small (up to ~15
 *            values) so the drawing stays readable on a phone.
 *    orders  traversals offered, in order: any of "pre in post level".
 *            Default "pre in post level".
 *    speed   milliseconds between steps when playing. Default 900.
 *
 *  Controls: choose the traversal, Play/Pause, Step, Reset. The node being
 *  visited is filled with the accent colour, visited nodes are tinted, and
 *  the panel shows the output so far, the call stack (depth-first orders) or
 *  the queue (level order), and the pseudocode of the chosen traversal.
 */
(function () {
  "use strict";

  // The kit must be loaded first (see step 1 above). Fail loudly, not silently.
  if (!window.UC || !window.UC.Element) {
    console.error("[uc-bst-traversal] Load uc-kit.js before this extension.");
    return;
  }

  const UC = window.UC;
  const SVG_NS = "http://www.w3.org/2000/svg";
  const ALL_ORDERS = ["pre", "in", "post", "level"];
  const DEFAULT_SPEED = 900;

  /* ----------------------------------------------------------------------
   * 1. Interface texts, one dictionary per language.
   *    Keys are namespaced ("bstTraversal.…") so they never clash with the
   *    kit's own keys. {placeholders} are filled by this.t(key, params).
   * -------------------------------------------------------------------- */

  UC.addTranslations("pt", {
    bstTraversal: {
      label: "Demonstração animada de percursos em árvore",
      kind: "Demonstração",
      orderGroup: "Tipo de percurso",
      orders: { pre: "Pré-ordem", in: "Em-ordem", post: "Pós-ordem", level: "Largura" },
      play: "Reproduzir",
      pause: "Pausar",
      step: "Passo",
      reset: "Reiniciar",
      stepLabel: "Passo",
      output: "Saída",
      stack: "Pilha de chamadas",
      call: "visitar({v})",
      queue: "Fila",
      nothingYet: "Ainda nada.",
      empty: "Vazia.",
      start: "Carrega em Reproduzir ou Passo para começar.",
      visit: "Visita o nó {v}.",
      complete: "Percurso completo: todos os nós visitados.",
      announce: "{order}, passo {n} de {total}: nó {v}. Saída: {seq}.",
      announceReset: "{order}. Nenhum nó visitado.",
      treeLabel: "Árvore binária de pesquisa com raiz {root}. {children}",
      treeChildren: "Filhos de {v}: {kids}.",
      none: "nenhum",
      nodeCurrent: "a visitar",
      nodeVisited: "já visitado",
      noValues: "Indica os valores da árvore no atributo values.",
      pseudo: {
        pre: "visitar(n):\n  se n == null: voltar\n  imprimir n      <- primeiro\n  visitar(n.esq)\n  visitar(n.dir)",
        in: "visitar(n):\n  se n == null: voltar\n  visitar(n.esq)\n  imprimir n      <- no meio\n  visitar(n.dir)",
        post: "visitar(n):\n  se n == null: voltar\n  visitar(n.esq)\n  visitar(n.dir)\n  imprimir n      <- no fim",
        level: "fila.enqueue(raiz)\nenquanto fila não vazia:\n  n = fila.dequeue()\n  imprimir n\n  enqueue(n.esq), enqueue(n.dir)",
      },
    },
  });

  UC.addTranslations("en", {
    bstTraversal: {
      label: "Animated tree traversal demo",
      kind: "Demo",
      orderGroup: "Traversal",
      orders: { pre: "Pre-order", in: "In-order", post: "Post-order", level: "Level order" },
      play: "Play",
      pause: "Pause",
      step: "Step",
      reset: "Reset",
      stepLabel: "Step",
      output: "Output",
      stack: "Call stack",
      call: "visit({v})",
      queue: "Queue",
      nothingYet: "Nothing yet.",
      empty: "Empty.",
      start: "Press Play or Step to start.",
      visit: "Visit node {v}.",
      complete: "Traversal complete: every node visited.",
      announce: "{order}, step {n} of {total}: node {v}. Output: {seq}.",
      announceReset: "{order}. No node visited.",
      treeLabel: "Binary search tree with root {root}. {children}",
      treeChildren: "Children of {v}: {kids}.",
      none: "none",
      nodeCurrent: "being visited",
      nodeVisited: "visited",
      noValues: "Give the tree's values in the values attribute.",
      pseudo: {
        pre: "visit(n):\n  if n == null: return\n  print n         <- first\n  visit(n.left)\n  visit(n.right)",
        in: "visit(n):\n  if n == null: return\n  visit(n.left)\n  print n         <- middle\n  visit(n.right)",
        post: "visit(n):\n  if n == null: return\n  visit(n.left)\n  visit(n.right)\n  print n         <- last",
        level: "queue.enqueue(root)\nwhile queue not empty:\n  n = queue.dequeue()\n  print n\n  enqueue(n.left), enqueue(n.right)",
      },
    },
  });

  /* ----------------------------------------------------------------------
   * 2. The data structure: plain functions, no DOM. Easy to read and test.
   * -------------------------------------------------------------------- */

  /** Builds a BST by inserting the values in order. Nodes: { v, left, right, parent, depth }. */
  function buildBst(values) {
    let root = null;
    for (const v of values) {
      if (root === null) {
        root = { v, left: null, right: null, parent: null, depth: 0 };
        continue;
      }
      let node = root;
      while (v !== node.v) {
        const side = v < node.v ? "left" : "right";
        if (!node[side]) {
          node[side] = { v, left: null, right: null, parent: node, depth: node.depth + 1 };
          break;
        }
        node = node[side];
      }
    }
    return root;
  }

  /** Every node, in in-order (sorted) order. */
  function inOrderNodes(node, out = []) {
    if (!node) return out;
    inOrderNodes(node.left, out);
    out.push(node);
    inOrderNodes(node.right, out);
    return out;
  }

  /** Path from the root down to `node`: the recursive calls active while visiting it. */
  function pathTo(node) {
    const path = [];
    for (let n = node; n; n = n.parent) path.unshift(n);
    return path;
  }

  /**
   * The steps of one traversal. Each step is { node, aux } where `aux` is the
   * auxiliary structure right after the visit: the call stack (depth-first)
   * or the queue (level order), as an array of values.
   */
  function traversalSteps(root, order) {
    const steps = [];
    if (!root) return steps;

    if (order === "level") {
      const queue = [root];
      while (queue.length) {
        const node = queue.shift();
        if (node.left) queue.push(node.left);
        if (node.right) queue.push(node.right);
        steps.push({ node, aux: queue.map((n) => String(n.v)) });
      }
      return steps;
    }

    (function visit(node) {
      if (!node) return;
      const record = () => steps.push({ node, aux: pathTo(node).map((n) => String(n.v)) });
      if (order === "pre") record();
      visit(node.left);
      if (order === "in") record();
      visit(node.right);
      if (order === "post") record();
    })(root);
    return steps;
  }

  /**
   * Horizontal position of every node, from 0 to 1.
   * Shallow trees: each node sits in the middle of its parent's half, which
   * gives the familiar symmetric drawing. Deeper trees (more than 3 levels below the root):
   * one column per node in sorted order, so leaves never overlap.
   */
  function layout(root) {
    const nodes = inOrderNodes(root);
    const depth = Math.max(0, ...nodes.map((n) => n.depth));
    const x = new Map();
    if (depth <= 3) {
      (function place(node, lo, hi) {
        if (!node) return;
        const mid = (lo + hi) / 2;
        x.set(node, mid);
        place(node.left, lo, mid);
        place(node.right, mid, hi);
      })(root, 0, 1);
    } else {
      nodes.forEach((node, i) => x.set(node, (i + 0.5) / nodes.length));
    }
    return { nodes, depth, x };
  }

  /** Parses values="8 3 10" into unique integers, keeping their order. */
  function parseValues(text) {
    const seen = new Set();
    return (text || "")
      .split(/[\s,;]+/)
      .map((token) => Number.parseInt(token, 10))
      .filter((v) => Number.isFinite(v) && !seen.has(v) && seen.add(v));
  }

  /* ----------------------------------------------------------------------
   * 3. Small DOM helpers.
   * -------------------------------------------------------------------- */

  function el(tag, attrs = {}, ...children) {
    const node = document.createElement(tag);
    for (const [name, value] of Object.entries(attrs)) {
      if (name.startsWith("on")) node.addEventListener(name.slice(2).toLowerCase(), value);
      else if (value !== null && value !== undefined && value !== false) node.setAttribute(name, value === true ? "" : value);
    }
    node.append(...children.flat().filter((c) => c !== null && c !== undefined));
    return node;
  }

  function svg(tag, attrs = {}) {
    const node = document.createElementNS(SVG_NS, tag);
    for (const [name, value] of Object.entries(attrs)) node.setAttribute(name, value);
    return node;
  }

  /** Simple inline icons (decorative: hidden from screen readers). */
  const ICONS = {
    tree: '<circle cx="14" cy="5" r="3"/><circle cx="6" cy="22" r="3"/><circle cx="22" cy="22" r="3"/><path d="M12.5 7.5 7.5 19.5M15.5 7.5l5 12"/>',
    play: '<path d="M7 5v14l12-7z" fill="currentColor" stroke="none"/>',
    pause: '<rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none"/><rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none"/>',
    step: '<path d="m9 6 6 6-6 6"/>',
    reset: '<path d="M4 12a8 8 0 1 0 2.3-5.6M4 4v4h4"/>',
  };

  function icon(name) {
    const box = name === "tree" ? "0 0 28 28" : "0 0 24 24";
    const span = el("span", { class: "uc-bst-traversal__icon", "aria-hidden": "true" });
    span.innerHTML = `<svg width="16" height="16" viewBox="${box}" fill="none" stroke="currentColor" stroke-width="2" focusable="false">${ICONS[name]}</svg>`;
    return span;
  }

  function prefersReducedMotion() {
    return Boolean(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }

  /* ----------------------------------------------------------------------
   * 4. The component.
   * -------------------------------------------------------------------- */

  class UCBstTraversal extends UC.Element {
    /** Once: read the attributes, keep the fallback, build the fixed structure. */
    setup() {
      this.classList.add("uc-bst-traversal");

      this.root = buildBst(parseValues(this.getAttribute("values")));
      const requested = (this.getAttribute("orders") || ALL_ORDERS.join(" ")).split(/\s+/);
      this.orders = requested.filter((o) => ALL_ORDERS.includes(o));
      if (!this.orders.length) this.orders = ALL_ORDERS.slice();
      this.speed = Math.max(200, Number.parseInt(this.getAttribute("speed"), 10) || DEFAULT_SPEED);

      // State: the chosen traversal, the current step (-1 = not started), playing or not.
      this.order = this.orders[0];
      this.step = -1;
      this.timer = null;
      this.steps = {};
      this.orders.forEach((o) => (this.steps[o] = traversalSteps(this.root, o)));

      // The teacher's fallback is kept (hidden), never thrown away.
      this.fallback = el("div", { class: "uc-bst-traversal__fallback", hidden: true }, ...Array.from(this.childNodes));

      if (!this.root) {
        console.warn("[uc-bst-traversal] The values attribute is empty or has no numbers.");
        this.fallback.hidden = false; // nothing to animate: keep showing the teacher's text
        this.message = el("p", { class: "uc-muted" });
        this.append(this.fallback, this.message);
        return;
      }

      this.buildStructure();
    }

    buildStructure() {
      // Header: kind label and the traversal choice (toggle buttons, aria-pressed).
      this.kindLabel = el("span", { class: "uc-bst-traversal__kind-text" });
      this.orderButtons = this.orders.map((order) =>
        el("button", { type: "button", class: "uc-bst-traversal__order", "data-order": order, onClick: () => this.choose(order) }),
      );
      this.orderGroup = el("div", { class: "uc-bst-traversal__orders", role: "group" }, this.orderButtons);
      const head = el(
        "div",
        { class: "uc-bst-traversal__head" },
        el("span", { class: "uc-bst-traversal__kind" }, icon("tree"), this.kindLabel),
        this.orderGroup,
      );

      // Stage: the drawing and the playback buttons.
      this.drawing = this.drawTree();
      this.playButton = el("button", { type: "button", class: "uc-button uc-button--primary uc-bst-traversal__play", onClick: () => this.togglePlay() });
      this.stepButton = el("button", { type: "button", class: "uc-button", onClick: () => this.stepOnce() });
      this.resetButton = el("button", { type: "button", class: "uc-button", onClick: () => this.reset() });
      const stage = el(
        "div",
        { class: "uc-bst-traversal__stage" },
        this.drawing,
        el("div", { class: "uc-bst-traversal__controls" }, this.playButton, this.stepButton, this.resetButton),
      );

      // Panel: step and caption, output, auxiliary structure, pseudocode.
      this.stepTitle = el("span", { class: "uc-bst-traversal__label" });
      this.stepCount = el("span", { class: "uc-mono uc-bst-traversal__count" });
      this.caption = el("span", {});
      this.outputTitle = el("span", { class: "uc-bst-traversal__label" });
      this.outputList = el("ol", { class: "uc-bst-traversal__chips" });
      this.auxTitle = el("span", { class: "uc-bst-traversal__label" });
      this.auxList = el("ol", { class: "uc-bst-traversal__chips uc-bst-traversal__chips--aux" });
      this.pseudo = el("pre", { class: "uc-bst-traversal__pseudo", tabindex: "0" });
      const panel = el(
        "div",
        { class: "uc-bst-traversal__panel" },
        el("div", { class: "uc-bst-traversal__row" }, this.stepTitle, el("span", {}, this.stepCount, " · ", this.caption)),
        el("div", { class: "uc-bst-traversal__row" }, this.outputTitle, this.outputList),
        el("div", { class: "uc-bst-traversal__row" }, this.auxTitle, this.auxList),
        this.pseudo,
      );

      // One polite live region. It is updated on user actions and at the end of
      // playback, not on every automatic tick, so a screen reader is not flooded.
      this.live = el("p", { class: "uc-visually-hidden", "aria-live": "polite", "aria-atomic": "true" });

      this.widget = el("div", { class: "uc-bst-traversal__widget", role: "group" }, head, el("div", { class: "uc-bst-traversal__body" }, stage, panel));
      this.append(this.fallback, this.widget, this.live);
    }

    /**
     * Draws the tree once; update() only changes the classes of the nodes.
     *
     * Edges are one SVG stretched over the whole drawing (horizontal positions
     * in %, so it follows the width). Nodes are HTML circles of a fixed size
     * placed with left: x%, so the numbers stay readable on a phone instead of
     * shrinking with the drawing. The drawing as a whole is one image for
     * assistive technology, described in words by describeTree().
     */
    drawTree() {
      const { nodes, depth, x } = layout(this.root);
      const ROW = 94; // vertical distance between levels, in px
      const PAD = 30; // space above the root and below the deepest level, in px
      const height = PAD * 2 + depth * ROW;
      const left = (node) => x.get(node) * 100;
      const top = (node) => PAD + node.depth * ROW;

      const drawing = el("div", { class: "uc-bst-traversal__drawing", role: "img", style: `height: ${height}px` });

      const edges = svg("svg", {
        class: "uc-bst-traversal__edges",
        viewBox: `0 0 100 ${height}`,
        preserveAspectRatio: "none",
        "aria-hidden": "true",
        focusable: "false",
      });
      nodes.forEach((node) => {
        if (!node.parent) return;
        edges.append(
          svg("line", {
            x1: left(node.parent), y1: top(node.parent), x2: left(node), y2: top(node),
            "vector-effect": "non-scaling-stroke", // keeps lines 2px thick however the SVG is stretched
          }),
        );
      });
      drawing.append(edges);

      this.nodeShapes = new Map();
      nodes.forEach((node) => {
        const circle = el(
          "span",
          { class: "uc-bst-traversal__node", "aria-hidden": "true", style: `left: ${left(node)}%; top: ${top(node)}px` },
          String(node.v),
        );
        drawing.append(circle);
        this.nodeShapes.set(node, circle);
      });
      this.drawingBox = drawing;
      return drawing;
    }

    /** On connection and language change: refresh every text, then the state. */
    render() {
      if (!this.root) {
        if (this.message) this.message.textContent = this.t("bstTraversal.noValues");
        return;
      }
      this.widget.setAttribute("aria-label", this.t("bstTraversal.label"));
      this.orderGroup.setAttribute("aria-label", this.t("bstTraversal.orderGroup"));
      this.kindLabel.textContent = this.t("bstTraversal.kind");
      this.orderButtons.forEach((button) => (button.textContent = this.t(`bstTraversal.orders.${button.dataset.order}`)));
      this.setButton(this.stepButton, "step", this.t("bstTraversal.step"));
      this.setButton(this.resetButton, "reset", this.t("bstTraversal.reset"));
      this.stepTitle.textContent = this.t("bstTraversal.stepLabel");
      this.outputTitle.textContent = this.t("bstTraversal.output");
      this.drawingBox.setAttribute("aria-label", this.describeTree());
      this.update();
    }

    /** "Binary search tree with root 5. Children of 5: 3 and 8. …" */
    describeTree() {
      const parts = inOrderNodes(this.root)
        .filter((n) => n.left || n.right)
        .sort((a, b) => a.depth - b.depth)
        .map((n) => {
          const kids = [n.left, n.right].map((k) => (k ? String(k.v) : this.t("bstTraversal.none"))).join(", ");
          return this.t("bstTraversal.treeChildren", { v: n.v, kids });
        });
      return this.t("bstTraversal.treeLabel", { root: this.root.v, children: parts.join(" ") });
    }

    setButton(button, iconName, label) {
      button.replaceChildren(icon(iconName), document.createTextNode(label));
    }

    /** Brings the whole view in line with the state (order, step, playing). */
    update() {
      const steps = this.steps[this.order];
      const current = this.step >= 0 ? steps[this.step] : null;
      const visited = steps.slice(0, this.step + 1).map((s) => s.node);

      this.orderButtons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.order === this.order)));
      this.setButton(this.playButton, this.timer ? "pause" : "play", this.t(this.timer ? "bstTraversal.pause" : "bstTraversal.play"));

      // Nodes: one class per state; the colours live in the CSS.
      this.nodeShapes.forEach((group, node) => {
        const isCurrent = current && node === current.node;
        group.classList.toggle("is-current", Boolean(isCurrent));
        group.classList.toggle("is-visited", !isCurrent && visited.includes(node));
      });

      this.stepCount.textContent = `${this.step + 1}/${steps.length}`;
      if (!current) this.caption.textContent = this.t("bstTraversal.start");
      else if (this.step === steps.length - 1) this.caption.textContent = this.t("bstTraversal.complete");
      else this.caption.textContent = this.t("bstTraversal.visit", { v: current.node.v });

      this.fillChips(this.outputList, visited.map((n) => String(n.v)), this.t("bstTraversal.nothingYet"));

      // Before the first step the queue holds the root; the call stack is empty.
      const isLevel = this.order === "level";
      const values = current ? current.aux : isLevel ? [String(this.root.v)] : [];
      const aux = isLevel ? values : values.map((v) => this.t("bstTraversal.call", { v }));
      this.auxTitle.textContent = this.t(isLevel ? "bstTraversal.queue" : "bstTraversal.stack");
      this.fillChips(this.auxList, aux, this.t("bstTraversal.empty"));

      this.pseudo.textContent = this.t(`bstTraversal.pseudo.${this.order}`);
      this.pseudo.setAttribute("aria-label", this.t(`bstTraversal.orders.${this.order}`));
    }

    fillChips(list, items, emptyText) {
      list.replaceChildren(...items.map((text) => el("li", {}, text)));
      list.dataset.empty = emptyText;
      list.classList.toggle("is-empty", items.length === 0);
    }

    /** Tells screen-reader users where the traversal is. */
    announce() {
      const steps = this.steps[this.order];
      const order = this.t(`bstTraversal.orders.${this.order}`);
      if (this.step < 0) {
        this.live.textContent = this.t("bstTraversal.announceReset", { order });
        return;
      }
      this.live.textContent = this.t("bstTraversal.announce", {
        order,
        n: this.step + 1,
        total: steps.length,
        v: steps[this.step].node.v,
        seq: steps.slice(0, this.step + 1).map((s) => s.node.v).join(" "),
      });
    }

    /* ---------- Actions (one per button) ---------- */

    choose(order) {
      this.stop();
      this.order = order;
      this.step = -1;
      this.update();
      this.announce();
    }

    /** Advances one step; returns false at the end. */
    advance() {
      if (this.step >= this.steps[this.order].length - 1) return false;
      this.step += 1;
      return true;
    }

    stepOnce() {
      this.stop();
      this.advance();
      this.update();
      this.announce();
    }

    reset() {
      this.stop();
      this.step = -1;
      this.update();
      this.announce();
    }

    togglePlay() {
      if (this.timer) {
        this.stop();
        this.update();
        this.announce();
        return;
      }
      if (this.step >= this.steps[this.order].length - 1) this.step = -1; // play again from the start
      // With reduced motion the steps still advance (the user asked for it), but
      // the CSS turns off the colour fades and the "pop" of the current node.
      this.timer = window.setInterval(() => {
        if (!this.advance()) {
          this.stop();
          this.announce();
        }
        this.update();
      }, prefersReducedMotion() ? Math.max(this.speed, 1200) : this.speed);
      this.advance();
      this.update();
    }

    stop() {
      if (this.timer) window.clearInterval(this.timer);
      this.timer = null;
    }

    /** Always clean up timers when the element leaves the page. */
    disconnectedCallback() {
      super.disconnectedCallback();
      this.stop();
    }
  }

  UC.define("uc-bst-traversal", UCBstTraversal);
})();
