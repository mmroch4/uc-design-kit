/*
 * A runner that executes nothing: it answers with the request it received,
 * so the documentation can show what <uc-code run> sends to a runner.
 */
(function () {
  "use strict";

  if (!window.UC || !window.UC.registerRunner) {
    console.error("[inspect-runner] Load uc-kit.js before this file.");
    return;
  }

  window.UC.registerRunner("inspect", {
    run(request, options) {
      const files = Object.entries(request.files).map(([name, code]) => {
        const lines = code.split("\n").length;
        return `  ${JSON.stringify(name)}: ${lines} ${lines === 1 ? "line" : "lines"}`;
      });
      const stdout = [
        `language: ${JSON.stringify(request.language)}`,
        "files:",
        ...files,
        `options: ${JSON.stringify(options)}`,
      ].join("\n");
      return Promise.resolve({ ok: true, stdout, stderr: "", duration: 0 });
    },
  });
})();
