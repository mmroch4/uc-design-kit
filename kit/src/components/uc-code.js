/**
 * <uc-code> — code block with syntax highlighting, copy, download, an
 * optional editable mode, and either a "Test on…" link (`run="URL"`) or
 * in-page execution with optional tests (`run` without a value), through
 * the runners in core/runners.js.
 * See docs/api.md, section 3.5.
 *
 * Highlighting uses highlight.js from cdnjs, loaded on first use (once per
 * page) with Subresource Integrity. When it cannot load (offline, blocked),
 * the code stays readable as plain text.
 */
(function (UC) {
  "use strict";
  if (UC.__duplicate) return;

  const { h, icon, uid, isExternal, flag, copyText } = UC.internal;

  /* ----------------------------------------------------------------------
   * highlight.js loader
   * -------------------------------------------------------------------- */

  const HLJS_VERSION = "11.9.0";
  const HLJS_BASE = `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/${HLJS_VERSION}`;
  const HLJS_CORE = {
    file: "highlight.min.js",
    integrity: "sha384-F/bZzf7p3Joyp5psL90p/p89AZJsndkSoGwRpXcZhleCWhd8SnRuoYo4d0yirjJp",
  };
  /**
   * Extra grammars (not in the core "common" bundle) with their SRI hashes.
   * The core already includes java, python, c, cpp, javascript, typescript,
   * kotlin, go, rust, sql, bash, json, xml, yaml, markdown and others.
   */
  const HLJS_LANGUAGES = {
    haskell: "sha384-EnLqy/LmA2yShypXJIP5cvUz0S3jJ5l3PnZcMRE6JQdpeNOttU97yyQAsdTusDbl",
    ocaml: "sha384-WhlOQ8tkNAn2N+yTa7njealQ8ue+22g0Zw/iR6A9QtSz0XQZzBebXuAvINaGCpdY",
    prolog: "sha384-UM9Lhdjkj0JpmTGkTvhc3JrFvbPmcGLGqzLsKAMP4hAKxussecmapCxDpWC5fHFu",
    scheme: "sha384-wDAOgnGx0t7X9tTKddfqp7kcfAYVDaQDRdfDD+47IukNBVuVGFldV80H4qDTHPOR",
    scala: "sha384-tbWlb460xfE9lNi4sNjNnZ4Btfos1He7bWO+9UmtNq4TwJ7F7nX8gaR0e6sVJsUk",
    matlab: "sha384-KveG8st4Ls4iaD1XzpsBzVc7g2K6kxnbxlZOy9cH6Knla0ZH9jsloP8nOOs6WYMP",
    x86asm: "sha384-eKsHYF6apOh4wN/zUOnYUx5s4086rCTH2ZG0R09R49HLu6/1Kn/6J7Zn6M8++8On",
    latex: "sha384-0ZgcpgIDZoDPMdyG1FHnl/MByMKt+W52UltboQpuA52+f4pniKOMFXfIfe4K4Byc",
    elixir: "sha384-qMYXRUi/Q9Ukntag3SOX3rOfkgLmmjlGA84X26QeOGixvWyfSGEiKwaw5ZKoSyBH",
    erlang: "sha384-hsThqIkkHew8Pfgbao+v2vLaYUKOUiN8CiPSkJRrmxTe4LcgVjZLC3Rz4z2zMT+X",
    lisp: "sha384-+LHHMbAXOUlvquvrQZ9LW4KeR2nwcsh/lpp7xrWu7KuaDSGgAYBIdm8qCw97I1tq",
    fortran: "sha384-WvivEbuG+ynOu3BbbceJknlKXBqe8Va2Zo7+TgCqtErB61cfboeQHQOyMapYhkUW",
    dockerfile: "sha384-H3wUmCndJNBOuIIzcLSr2zLLZYs8PYuw6qKyENk7THEnYQJvOMDBu42P9XsJSRKw",
  };

  /** Display names and download extensions for common languages and aliases. */
  const LANGUAGES = {
    java: { name: "Java", ext: "java" },
    python: { name: "Python", ext: "py" },
    py: { name: "Python", ext: "py" },
    c: { name: "C", ext: "c" },
    cpp: { name: "C++", ext: "cpp" },
    "c++": { name: "C++", ext: "cpp" },
    js: { name: "JavaScript", ext: "js" },
    javascript: { name: "JavaScript", ext: "js" },
    ts: { name: "TypeScript", ext: "ts" },
    typescript: { name: "TypeScript", ext: "ts" },
    kotlin: { name: "Kotlin", ext: "kt" },
    go: { name: "Go", ext: "go" },
    rust: { name: "Rust", ext: "rs" },
    csharp: { name: "C#", ext: "cs" },
    sql: { name: "SQL", ext: "sql" },
    bash: { name: "Bash", ext: "sh" },
    shell: { name: "Shell", ext: "sh" },
    sh: { name: "Shell", ext: "sh" },
    json: { name: "JSON", ext: "json" },
    xml: { name: "XML", ext: "xml" },
    html: { name: "HTML", ext: "html" },
    css: { name: "CSS", ext: "css" },
    yaml: { name: "YAML", ext: "yaml" },
    markdown: { name: "Markdown", ext: "md" },
    haskell: { name: "Haskell", ext: "hs" },
    ocaml: { name: "OCaml", ext: "ml" },
    prolog: { name: "Prolog", ext: "pl" },
    scheme: { name: "Scheme", ext: "scm" },
    scala: { name: "Scala", ext: "scala" },
    matlab: { name: "MATLAB", ext: "m" },
    latex: { name: "LaTeX", ext: "tex" },
  };

  let corePromise = null;
  const languagePromises = Object.create(null);
  const warned = new Set();

  function warnOnce(message) {
    if (warned.has(message)) return;
    warned.add(message);
    console.warn(`[uc-kit] uc-code: ${message}`);
  }

  function loadScript(file, integrity) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = `${HLJS_BASE}/${file}`;
      script.integrity = integrity;
      script.crossOrigin = "anonymous";
      script.referrerPolicy = "no-referrer";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`could not load ${script.src}`));
      document.head.appendChild(script);
    });
  }

  /** Loads the highlight.js core once per page. Resolves with `hljs`. */
  function loadCore() {
    if (!corePromise) {
      corePromise = window.hljs
        ? Promise.resolve(window.hljs)
        : loadScript(HLJS_CORE.file, HLJS_CORE.integrity).then(() => {
            if (!window.hljs) throw new Error("highlight.js did not define hljs");
            return window.hljs;
          });
    }
    return corePromise;
  }

  /**
   * Resolves with `hljs` once `language` is available, or rejects when the
   * language cannot be highlighted.
   */
  function loadHighlighter(language) {
    return loadCore().then((hljs) => {
      if (hljs.getLanguage(language)) return hljs;
      const integrity = HLJS_LANGUAGES[language];
      if (!integrity) throw new Error(`no highlighting available for "${language}"`);
      if (!languagePromises[language]) {
        languagePromises[language] = loadScript(`languages/${language}.min.js`, integrity);
      }
      return languagePromises[language].then(() => {
        if (!hljs.getLanguage(language)) throw new Error(`highlight.js has no grammar "${language}"`);
        return hljs;
      });
    });
  }

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

  /** Reads the teacher's tests: <ol data-tests><li data-expected="…">name</li></ol>. */
  function readTests(element) {
    const list = Array.from(element.children).find((child) => child.matches("[data-tests]"));
    if (!list) return [];
    return Array.from(list.querySelectorAll("li")).map((item) => ({
      name: item.textContent.trim(),
      expected: item.hasAttribute("data-expected") ? item.getAttribute("data-expected") : "",
    }));
  }

  /** Output lines with trailing spaces and trailing empty lines removed. */
  function outputLines(text) {
    const lines = String(text).replace(/\r\n?/g, "\n").split("\n").map((line) => line.replace(/\s+$/, ""));
    while (lines.length && lines[lines.length - 1] === "") lines.pop();
    return lines;
  }

  function sourceLanguage(source) {
    const code = source && source.querySelector && source.querySelector("code");
    const match = code && /(?:^|\s)(?:language|lang)-(\S+)/.exec(code.className);
    return match ? match[1] : "";
  }

  function downloadText(text, name) {
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    const link = h("a", { href: url, download: name, hidden: true });
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
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
  const HIGHLIGHT_DELAY_MS = 150;
  const TAB = "    ";

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
      this.tests = readTests(this);
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
      return LANGUAGES[this.language] || null;
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
        warnOnce('no <script type="text/plain"> or <pre> child found');
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

    /** Builds the persistent parts once: body, live region, hidden source. */
    build() {
      this.classList.add("uc-code");
      this.classList.toggle("uc-code--editable", this.editable);
      this.header = h("div", { class: "uc-code__header" });
      this.output = h("code", { class: "uc-code__code" });
      this.pre = h("pre", { class: "uc-code__pre" }, this.output);
      this.status = h("span", { class: "uc-visually-hidden", "aria-live": "polite" });

      if (this.editable) {
        this.pre.setAttribute("aria-hidden", "true");
        this.textarea = h("textarea", {
          class: "uc-code__input",
          spellcheck: "false",
          autocapitalize: "off",
          autocomplete: "off",
          wrap: "off",
          // Writing-assistant extensions (Grammarly and similar) would draw over the code.
          "data-gramm": "false",
          "data-gramm_editor": "false",
          "data-enable-grammarly": "false",
          "aria-describedby": this.hintId,
          onInput: () => this.onInput(),
          onKeydown: (event) => this.onKeydown(event),
          // The textarea scrolls (so the browser keeps the caret in view); the highlighted layer follows it.
          onScroll: () => this.syncScroll(),
        });
        this.textarea.value = this.code;
        this.hint = h("p", { class: "uc-code__hint", id: this.hintId });
        this.scroller = h("div", { class: "uc-code__scroll uc-code__editor" }, this.pre, this.textarea);
        this.body = h("div", { class: "uc-code__body", id: this.bodyId }, this.scroller, this.hint);
      } else {
        this.scroller = h("div", { class: "uc-code__scroll", tabindex: "0", role: "group" }, this.pre);
        this.body = h("div", { class: "uc-code__body", id: this.bodyId }, this.scroller);
      }

      this.showPlain();
      this.results = h("div", { class: "uc-code__results", hidden: true });
      this.prepend(this.header, this.body, this.results, this.status);
      // The authored source is kept in the DOM, hidden, so nothing is lost.
      if (this.source.matches("pre")) this.source.hidden = true;
      this.highlight();
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
        actions.push(this.button("download", "download", this.t("code.download"), () => downloadText(this.code, this.downloadName())));
      }
      if (this.editable) actions.push(this.button("reset", "reset", this.t("code.reset"), () => this.onReset()));
      if (this.runMode === "execute" && !UC.internal.canRun(this.language)) {
        warnOnce(`no runner can run "${this.language}": the Run button is not shown`);
      } else if (this.runMode === "execute") {
        const label = this.t(this.running ? "code.running" : this.tests.length ? "code.runTests" : "code.run");
        const button = h(
          "button",
          { type: "button", class: "uc-button uc-button--primary uc-code__run", "data-action": "execute", onClick: () => this.onRun() },
          icon("play"),
          h("span", {}, label),
        );
        if (this.running) button.setAttribute("aria-disabled", "true");
        actions.push(button);
      }
      const run = this.runMode === "link" ? this.getAttribute("run") : null;
      if (run) {
        const external = isExternal(run);
        actions.push(
          h(
            "a",
            { class: "uc-button uc-button--primary uc-code__run", href: run, "data-action": "run" },
            this.t("code.testOn", { platform: platformName(run) }),
            external ? icon("external") : null,
            external ? h("span", { class: "uc-visually-hidden" }, ` ${this.t("a11y.external")}`) : null,
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
        .catch((error) => warnOnce(`${error.message}; showing plain code`));
    }

    /** Writes the highlighted code (synchronous once highlight.js is loaded). */
    paint(hljs) {
      const code = this.code;
      const result = hljs.highlight(code, { language: this.language, ignoreIllegals: true });
      this.output.innerHTML = result.value + (code.endsWith("\n") ? " " : "");
      this.output.className = "uc-code__code hljs";
      this.syncScroll();
    }

    /** Keeps the highlighted layer aligned with the textarea's scroll position. */
    syncScroll() {
      if (!this.textarea) return;
      this.pre.scrollLeft = this.textarea.scrollLeft;
      this.pre.scrollTop = this.textarea.scrollTop;
    }

    /* --- Editing ------------------------------------------------------ */

    onInput() {
      this.code = this.textarea.value;
      // Repaint in the same frame: switching to plain text and back made the block flicker on every key.
      if (this.highlighter) {
        this.paint(this.highlighter);
        return;
      }
      this.showPlain();
      this.syncScroll();
      clearTimeout(this.highlightTimer);
      this.highlightTimer = setTimeout(() => this.highlight(), HIGHLIGHT_DELAY_MS);
    }

    onKeydown(event) {
      if (event.key === "Escape") {
        this.escapePressed = true;
        return;
      }
      if (event.key === "Tab" && !event.shiftKey && !event.altKey && !event.ctrlKey && !event.metaKey && !this.escapePressed) {
        event.preventDefault();
        this.insertText(TAB);
      }
      this.escapePressed = false;
    }

    insertText(text) {
      const area = this.textarea;
      // execCommand keeps the browser's undo history; setRangeText is the fallback.
      let inserted = false;
      try {
        inserted = document.execCommand("insertText", false, text);
      } catch (error) {
        inserted = false;
      }
      if (!inserted) {
        area.setRangeText(text, area.selectionStart, area.selectionEnd, "end");
        this.onInput();
      }
    }

    onReset() {
      this.code = this.original;
      this.textarea.value = this.original;
      if (this.highlighter) this.paint(this.highlighter);
      else {
        this.showPlain();
        this.highlight();
      }
      this.textarea.focus();
      this.textarea.setSelectionRange(0, 0);
    }

    /* --- Running ------------------------------------------------------ */

    /** The files sent to the runner: the student's code plus the hidden harness files. */
    files() {
      if (!this.harness) return { ...this.supportFiles, "": this.code };
      const name = this.getAttribute("filename") || `code.${(this.languageInfo() || { ext: "txt" }).ext}`;
      return { ...this.supportFiles, "": this.harness.code, [name]: this.code };
    }

    /* --- Collapse ----------------------------------------------------- */

    setCollapsed(collapsed) {
      this.collapsed = collapsed;
      this.render();
    }

    onRun() {
      if (this.running) return;
      // Results appear under the code, so a collapsed block opens first.
      this.collapsed = false;
      this.running = true;
      this.result = null;
      this.render();
      this.announce(this.t("code.running"));
      UC.internal
        .runCode({ language: this.language, files: this.files() })
        .then((result) => {
          this.result = { ...result, tests: this.checkTests(result) };
        })
        .catch((error) => {
          this.result = { failed: true, reason: error.message };
        })
        .finally(() => {
          this.running = false;
          this.render();
          this.announce(this.summary());
        });
    }

    /** Compares output line i with test i. Returns null when there are no tests. */
    checkTests(result) {
      if (!this.tests.length) return null;
      const lines = result.ok ? outputLines(result.stdout) : [];
      return this.tests.map((test, index) => {
        const got = index < lines.length ? lines[index] : null;
        return { ...test, got, passed: got !== null && got === test.expected.replace(/\s+$/, "") };
      });
    }

    summary() {
      const result = this.result;
      if (!result) return "";
      if (result.failed) return this.t("code.runFailed", { reason: result.reason });
      if (result.tests) {
        const passed = result.tests.filter((test) => test.passed).length;
        return this.t("code.testsPassed", { passed, total: result.tests.length });
      }
      return result.ok ? this.t("code.output") : this.t("code.error");
    }

    renderResult() {
      if (!this.results) return;
      const result = this.result;
      this.results.hidden = !result;
      if (!result) {
        this.results.replaceChildren();
        return;
      }
      const parts = [];
      if (result.failed) {
        parts.push(h("p", { class: "uc-code__results-error" }, this.t("code.runFailed", { reason: result.reason })));
      } else {
        if (result.tests) {
          const passed = result.tests.filter((test) => test.passed).length;
          const all = passed === result.tests.length;
          parts.push(
            h("p", { class: `uc-code__results-summary${all ? " uc-code__results-summary--passed" : ""}` }, this.summary()),
            h(
              "ol",
              { class: "uc-code__tests" },
              result.tests.map((test) =>
                h(
                  "li",
                  { class: `uc-code__test uc-code__test--${test.passed ? "passed" : "failed"}` },
                  h("span", { class: "uc-code__test-mark", "aria-hidden": "true" }, test.passed ? "✓" : "✗"),
                  h("span", { class: "uc-visually-hidden" }, `${this.t(test.passed ? "code.passed" : "code.failed")}: `),
                  h("span", { class: "uc-code__test-name" }, test.name),
                  test.passed
                    ? null
                    : h(
                        "span",
                        { class: "uc-code__test-detail" },
                        `${this.t("code.expected")}: `,
                        h("code", {}, test.expected || this.t("code.noOutput")),
                        ` · ${this.t("code.got")}: `,
                        h("code", {}, test.got === null || test.got === "" ? this.t("code.noOutput") : test.got),
                      ),
                ),
              ),
            ),
          );
        }
        const showOutput = !result.tests || !result.ok;
        if (showOutput) {
          parts.push(h("p", { class: "uc-code__results-label" }, this.t(result.ok ? "code.output" : "code.error")));
          if (result.stdout || result.ok) parts.push(h("pre", { class: "uc-code__results-output" }, result.stdout || this.t("code.noOutput")));
        }
        if (result.stderr) parts.push(h("pre", { class: "uc-code__results-output uc-code__results-output--stderr" }, result.stderr));
      }
      this.results.replaceChildren(...parts);
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
      if (!copied) this.status.textContent = "";
    }

    announce(message) {
      this.status.textContent = "";
      // A fresh text node after clearing makes screen readers repeat the message.
      setTimeout(() => {
        this.status.textContent = message;
      }, 50);
    }
  }

  UC.define("uc-code", UCCode);
})(window.UC);
