/**
 * <uc-code> — code block with syntax highlighting, copy, download, an
 * optional editable mode, and either a "Test on…" link (`run="URL"`) or
 * in-page execution with optional tests (`run` without a value), through
 * the runners in core/runners.js.
 * See docs/api.md, section 3.5.
 *
 * The element is split by concern, in the order of the manifest:
 *   code/highlight.js  highlight.js loader and the language table
 *   code/editor.js     the editable mode (mixed into the class below)
 *   code/run.js        in-page execution and tests (mixed into the class below)
 *   code/element.js    this file: source, header, display, copy, collapse
 */
(function (UC) {
  "use strict";
  if (UC.__duplicate) return;

  const { h, icon, uid, flag, copyText, externalMark, downloadFile, loadHighlighter, codeLanguages, codeEditor, codeRun } = UC.internal;
  const warned = new Set();

  /* ----------------------------------------------------------------------
   * Source text helpers
   * -------------------------------------------------------------------- */

  /**
   * Normalises authored code: drops one leading newline, a trailing
   * whitespace-only line and the indentation common to every non-blank line.
   */
  function normalizeSource(raw) {
    let lines = raw.replace(/\r\n?/g, "\n").replace(/^\n/, "").split("\n");
    if (lines.length > 1 && lines[lines.length - 1].trim() === "") lines = lines.slice(0, -1);
    const indents = lines.filter((line) => line.trim() !== "").map((line) => line.match(/^[ \t]*/)[0].length);
    const common = indents.length ? Math.min(...indents) : 0;
    return lines.map((line) => line.slice(common)).join("\n");
  }

  /** Finds the authored source element: <script type="text/plain"> or <pre> (not the harness). */
  function findSource(element) {
    for (const child of element.children) {
      if (child.matches('script[type="text/plain"]:not([data-harness])') || child.matches("pre")) return child;
    }
    return null;
  }

  function sourceLanguage(source) {
    const code = source && source.querySelector && source.querySelector("code");
    const match = code && /(?:^|\s)(?:language|lang)-(\S+)/.exec(code.className);
    return match ? match[1] : "";
  }

  /** Label of the platform that hosts `url` (from UC_COURSE.platforms), else its host. */
  function platformName(url) {
    let host = "";
    try {
      host = new URL(url, window.location.href).host;
    } catch (error) {
      return url;
    }
    const platform = UC.course.platforms.find((entry) => {
      try {
        return new URL(entry.url, window.location.href).host === host;
      } catch (error) {
        return false;
      }
    });
    return platform ? UC.text(platform.label) : host;
  }

  const COPY_RESET_MS = 2000;

  /* ----------------------------------------------------------------------
   * Component
   * -------------------------------------------------------------------- */

  class UCCode extends UC.Element {
    setup() {
      // `lang` holds a programming language, which is not a valid BCP 47 tag
      // and would change how assistive technology reads the generated
      // interface. It is moved to data-lang once read.
      if (this.hasAttribute("lang")) {
        this.dataset.lang = this.getAttribute("lang");
        this.removeAttribute("lang");
      }
      this.source = findSource(this);
      const raw = this.source ? (this.source.matches("script") ? this.source.textContent : (this.source.querySelector("code") || this.source).textContent) : "";
      this.original = normalizeSource(raw);
      this.code = this.original;
      this.language = (this.dataset.lang || sourceLanguage(this.source) || "").trim().toLowerCase();
      this.copied = false;
      this.copyTimer = null;
      this.highlightTimer = null;
      this.escapePressed = false;
      this.hintId = uid("uc-code-hint");
      this.titleId = uid("uc-code-title");
      this.bodyId = uid("uc-code-body");
      // `collapsible` adds a show/hide toggle to the header; `collapsed` starts it closed.
      this.collapsed = this.collapsible && flag(this, "collapsed");
      // In-page execution: optional hidden files and tests. A harness script
      // without `filename` is the entry file; with one, it is a support file.
      this.harness = null;
      this.supportFiles = {};
      for (const child of this.children) {
        if (!child.matches('script[type="text/plain"][data-harness]')) continue;
        const name = child.getAttribute("filename");
        const code = normalizeSource(child.textContent);
        if (name) this.supportFiles[name] = code;
        else if (!this.harness) this.harness = { code };
      }
      this.tests = this.readTests();
      this.running = false;
      this.result = null;
    }

    /** "execute" for `run` without a value, "link" for `run="URL"`, else null. */
    get runMode() {
      if (!this.hasAttribute("run")) return null;
      const value = this.getAttribute("run").trim();
      return value === "" || value === "run" ? "execute" : "link";
    }

    get editable() {
      return flag(this, "editable");
    }

    get collapsible() {
      return flag(this, "collapsible");
    }

    languageInfo() {
      return codeLanguages[this.language] || null;
    }

    title() {
      const filename = this.getAttribute("filename");
      if (filename) return filename;
      const info = this.languageInfo();
      return info ? info.name : this.language;
    }

    downloadName() {
      const filename = this.getAttribute("filename");
      if (filename) return filename;
      const info = this.languageInfo();
      return `code.${info ? info.ext : "txt"}`;
    }

    render() {
      if (!this.source) {
        this.warnOnce('no <script type="text/plain"> or <pre> child found');
        return;
      }
      if (!this.body) this.build();

      const focused = document.activeElement;
      const focusedAction = focused && this.header && this.header.contains(focused) ? focused.dataset.action : null;

      this.header.replaceChildren(...this.renderHeader());
      this.header.hidden = this.header.childElementCount === 0;
      const title = this.title();
      if (this.editable) {
        this.textarea.setAttribute("aria-label", title ? `${this.t("code.editable")}: ${title}` : this.t("code.editable"));
        this.hint.textContent = this.t("code.tabHint");
      } else if (title) {
        this.scroller.setAttribute("aria-labelledby", this.titleId);
      } else {
        this.scroller.removeAttribute("aria-labelledby");
      }

      this.renderResult();
      this.classList.toggle("uc-code--collapsed", this.collapsed);
      this.body.hidden = this.collapsed;
      if (this.collapsed) this.results.hidden = true;
      if (focusedAction) this.header.querySelector(`[data-action="${focusedAction}"]`)?.focus();
    }

    /** Builds the persistent parts once: body and hidden source. */
    build() {
      this.classList.add("uc-code");
      this.classList.toggle("uc-code--editable", this.editable);
      this.header = h("div", { class: "uc-code__header" });
      this.output = h("code", { class: "uc-code__code" });
      this.pre = h("pre", { class: "uc-code__pre" }, this.output);

      if (this.editable) this.buildEditor();
      else {
        this.scroller = h("div", { class: "uc-code__scroll", role: "group" }, this.pre);
        this.body = h("div", { class: "uc-code__body", id: this.bodyId }, this.scroller);
        this.watchOverflow();
      }

      this.showPlain();
      this.results = h("div", { class: "uc-code__results", hidden: true });
      this.prepend(this.header, this.body, this.results);
      // The authored source is kept in the DOM, hidden, so nothing is lost.
      if (this.source.matches("pre")) this.source.hidden = true;
      this.highlight();
    }

    /**
     * A read-only block is a Tab stop only while its code is wider than the box,
     * so keyboard users can scroll it; a block that fits is skipped, like wide
     * tables (core/tables.js).
     */
    watchOverflow() {
      const update = () => {
        const overflows = this.scroller.scrollWidth > this.scroller.clientWidth + 1;
        if (overflows) this.scroller.setAttribute("tabindex", "0");
        else this.scroller.removeAttribute("tabindex");
      };
      if ("ResizeObserver" in window) {
        const observer = new ResizeObserver(update);
        observer.observe(this.scroller);
        observer.observe(this.pre);
      } else {
        this.scroller.setAttribute("tabindex", "0");
      }
      update();
    }

    renderHeader() {
      const parts = [];
      const title = this.title();
      if (this.collapsible) {
        parts.push(
          h(
            "button",
            {
              type: "button",
              class: "uc-code__toggle",
              "data-action": "toggle",
              "aria-expanded": String(!this.collapsed),
              "aria-controls": this.bodyId,
              onClick: () => this.setCollapsed(!this.collapsed),
            },
            h("span", { class: "uc-code__chevron" }, icon("chevronDown")),
            h("span", { class: "uc-code__title", id: this.titleId }, title || this.t("code.code")),
          ),
        );
      } else if (title) {
        parts.push(h("span", { class: "uc-code__title", id: this.titleId }, title));
      }

      const actions = [];
      if (!flag(this, "no-copy")) {
        actions.push(
          this.button("copy", this.copied ? "check" : "copy", this.t(this.copied ? "code.copied" : "code.copy"), () => this.onCopy()),
        );
      }
      if (!flag(this, "no-download")) {
        actions.push(this.button("download", "download", this.t("code.download"), () => downloadFile(this.code, this.downloadName(), "text/plain")));
      }
      if (this.editable) actions.push(this.button("reset", "reset", this.t("code.reset"), () => this.onReset()));
      const runButton = this.runMode === "execute" && this.renderRunButton();
      if (runButton) actions.push(runButton);
      const run = this.runMode === "link" ? this.getAttribute("run") : null;
      if (run) {
        actions.push(
          h(
            "a",
            { class: "uc-button uc-button--primary uc-code__run", href: run, "data-action": "run" },
            this.t("code.testOn", { platform: platformName(run) }),
            externalMark(run),
          ),
        );
      }
      if (actions.length) parts.push(h("div", { class: "uc-code__actions" }, actions));
      return parts;
    }

    button(action, iconName, label, onClick) {
      return h(
        "button",
        { type: "button", class: `uc-button uc-code__button uc-code__button--${action}`, "data-action": action, onClick },
        icon(iconName),
        h("span", {}, label),
      );
    }

    /* --- Display ------------------------------------------------------ */

    /** Shows the code as plain text (also keeps the editor overlay aligned). */
    showPlain() {
      // A trailing newline would not be rendered by <pre>; keep both layers the same height.
      this.output.textContent = this.code.endsWith("\n") ? `${this.code} ` : this.code;
      this.output.className = "uc-code__code";
    }

    highlight() {
      if (!this.language) return;
      const code = this.code;
      loadHighlighter(this.language)
        .then((hljs) => {
          if (code !== this.code) return; // Outdated: a newer edit will highlight again.
          this.highlighter = hljs;
          this.paint(hljs);
        })
        .catch((error) => this.warnOnce(`${error.message}; showing plain code`));
    }

    /** Writes the highlighted code (synchronous once highlight.js is loaded). */
    paint(hljs) {
      const code = this.code;
      const result = hljs.highlight(code, { language: this.language, ignoreIllegals: true });
      this.output.innerHTML = result.value + (code.endsWith("\n") ? " " : "");
      this.output.className = "uc-code__code hljs";
      this.syncScroll();
    }

    /* --- Collapse ----------------------------------------------------- */

    setCollapsed(collapsed) {
      this.collapsed = collapsed;
      this.render();
    }

    /* --- Copy --------------------------------------------------------- */

    onCopy() {
      copyText(this.code)
        .then(() => {
          this.setCopied(true);
          this.announce(this.t("code.copied"));
          clearTimeout(this.copyTimer);
          this.copyTimer = setTimeout(() => this.setCopied(false), COPY_RESET_MS);
        })
        .catch(() => this.announce(this.t("code.copyFailed")));
    }

    setCopied(copied) {
      this.copied = copied;
      this.render();
    }

    /** Announces through the page's shared live region (core/announce.js). */
    announce(message) {
      UC.internal.announce(message);
    }

    /** Warns once per page about the same problem. */
    warnOnce(message) {
      if (warned.has(message)) return;
      warned.add(message);
      console.warn(`[uc-kit] uc-code: ${message}`);
    }
  }

  Object.assign(UCCode.prototype, codeEditor, codeRun);

  UC.define("uc-code", UCCode);
})(window.UC);
