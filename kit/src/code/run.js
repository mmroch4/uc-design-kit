/**
 * <uc-code run>, in-page execution: the Run button, the files sent to the
 * runner (core/runners.js), the teacher's tests (output line i against test
 * i) and the results under the code.
 * Part of <uc-code> (code/element.js): these methods are mixed into its class.
 */
(function (UC) {
  "use strict";
  if (UC.__duplicate) return;

  const { h, icon } = UC.internal;

  /** Output lines with trailing spaces and trailing empty lines removed. */
  function outputLines(text) {
    const lines = String(text).replace(/\r\n?/g, "\n").split("\n").map((line) => line.replace(/\s+$/, ""));
    while (lines.length && lines[lines.length - 1] === "") lines.pop();
    return lines;
  }

  UC.internal.codeRun = {
    /** Reads the teacher's tests: <ol data-tests><li data-expected="…">name</li></ol>. */
    readTests() {
      const list = Array.from(this.children).find((child) => child.matches("[data-tests]"));
      if (!list) return [];
      return Array.from(list.querySelectorAll("li")).map((item) => ({
        name: item.textContent.trim(),
        expected: item.hasAttribute("data-expected") ? item.getAttribute("data-expected") : "",
      }));
    },

    /** "Run" / "Run tests" / "Running…", or null (with a warning) when no runner can run the language. */
    renderRunButton() {
      if (!UC.internal.canRun(this.language)) {
        this.warnOnce(`no runner can run "${this.language}": the Run button is not shown`);
        return null;
      }
      const label = this.t(this.running ? "code.running" : this.tests.length ? "code.runTests" : "code.run");
      const button = h(
        "button",
        { type: "button", class: "uc-button uc-button--primary uc-code__run", "data-action": "execute", onClick: () => this.onRun() },
        icon("play"),
        h("span", {}, label),
      );
      if (this.running) button.setAttribute("aria-disabled", "true");
      return button;
    },

    /** The files sent to the runner: the student's code plus the hidden harness files. */
    files() {
      if (!this.harness) return { ...this.supportFiles, "": this.code };
      const name = this.getAttribute("filename") || `code.${(this.languageInfo() || { ext: "txt" }).ext}`;
      return { ...this.supportFiles, "": this.harness.code, [name]: this.code };
    },

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
    },

    /** Compares output line i with test i. Returns null when there are no tests. */
    checkTests(result) {
      if (!this.tests.length) return null;
      const lines = result.ok ? outputLines(result.stdout) : [];
      return this.tests.map((test, index) => {
        const got = index < lines.length ? lines[index] : null;
        return { ...test, got, passed: got !== null && got === test.expected.replace(/\s+$/, "") };
      });
    },

    summary() {
      const result = this.result;
      if (!result) return "";
      if (result.failed) return this.t("code.runFailed", { reason: result.reason });
      if (result.tests) {
        const passed = result.tests.filter((test) => test.passed).length;
        return this.t("code.testsPassed", { passed, total: result.tests.length });
      }
      return this.t(result.ok ? "code.runFinished" : "code.runFinishedError");
    },

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
        if (result.tests) parts.push(...this.renderTests(result.tests));
        const showOutput = !result.tests || !result.ok;
        if (showOutput) {
          parts.push(h("p", { class: "uc-code__results-label" }, this.t(result.ok ? "code.output" : "code.error")));
          if (result.stdout || result.ok) parts.push(h("pre", { class: "uc-code__results-output" }, result.stdout || this.t("code.noOutput")));
        }
        if (result.stderr) parts.push(h("pre", { class: "uc-code__results-output uc-code__results-output--stderr" }, result.stderr));
      }
      this.results.replaceChildren(...parts);
    },

    /** "2 of 3 tests passed" and one line per test, with expected and actual output when it failed. */
    renderTests(tests) {
      const all = tests.every((test) => test.passed);
      return [
        h("p", { class: `uc-code__results-summary${all ? " uc-code__results-summary--passed" : ""}` }, this.summary()),
        h(
          "ol",
          { class: "uc-code__tests" },
          tests.map((test) =>
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
      ];
    },
  };
})(window.UC);
