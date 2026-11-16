/**
 * Code runners: the pluggable back ends that execute code for
 * <uc-code run>. See docs/api.md, section 7.1.
 *
 * A runner is an object with a `run(request, options)` method returning a
 * Promise of a result:
 *
 *   request = {
 *     language: "java",              // the block's language (data-lang)
 *     files: { "": "...", "BTree.java": "..." },  // "" is the entry file
 *   }
 *   result  = { ok: true, stdout: "...", stderr: "...", duration: 314 }
 *
 * `options` is the runner's own section of UC_COURSE.runner (for example
 * `runner.codapi`). Pages never talk to a provider directly: they only say
 * `<uc-code run>`, and course.js picks the provider, so a course can move
 * from the public Codapi service to a self-hosted one (or to Judge0, or to
 * an in-browser engine) by changing configuration only.
 */
(function (UC) {
  "use strict";
  if (UC.__duplicate) return;

  const registry = new Map();

  /** Default configuration, merged under UC_COURSE.runner. */
  const DEFAULTS = {
    provider: "codapi",
    languages: { javascript: "browser", js: "browser" },
    codapi: {
      url: "https://api.codapi.org/v1",
      // Block language → Codapi sandbox name, when they differ.
      sandboxes: { c: "gcc", "c++": "cpp", py: "python" },
      timeout: 20000,
    },
    browser: { timeout: 5000 },
  };

  /**
   * Registers (or replaces) a runner under `name`.
   * @param {string} name
   * @param {{ run: function(object, object): Promise<object> }} runner
   */
  UC.registerRunner = function registerRunner(name, runner) {
    if (!name || !runner || typeof runner.run !== "function") {
      console.warn("[uc-kit] UC.registerRunner(name, runner): runner needs a run(request, options) method");
      return;
    }
    registry.set(String(name), runner);
  };

  function config() {
    const own = (UC.course && UC.course.runner) || {};
    const merged = { ...DEFAULTS, ...own };
    merged.languages = { ...DEFAULTS.languages, ...(own.languages || {}) };
    Object.keys(DEFAULTS).forEach((key) => {
      if (DEFAULTS[key] && typeof DEFAULTS[key] === "object" && key !== "languages") {
        merged[key] = { ...DEFAULTS[key], ...(own[key] || {}) };
      }
    });
    return merged;
  }

  /**
   * Runs code with the runner configured for `request.language`.
   * Always resolves to a result object; failures to reach the runner reject
   * with an Error whose message can be shown to the student.
   */
  UC.internal.runCode = function runCode(request) {
    const settings = config();
    const name = settings.languages[request.language] || settings.provider;
    const runner = registry.get(name);
    if (!runner) return Promise.reject(new Error(`unknown runner "${name}"`));
    return Promise.resolve(runner.run(request, settings[name] || {})).then((result) => ({
      ok: Boolean(result && result.ok),
      stdout: String((result && result.stdout) || ""),
      stderr: String((result && result.stderr) || ""),
      duration: Number((result && result.duration) || 0),
    }));
  };

  /** Whether a runner is configured and registered for `language`. */
  UC.internal.canRun = function canRun(language) {
    const settings = config();
    return registry.has(settings.languages[language] || settings.provider);
  };

  /* ----------------------------------------------------------------------
   * Built-in runner: Codapi (https://codapi.org), public or self-hosted.
   * -------------------------------------------------------------------- */

  UC.registerRunner("codapi", {
    run(request, options) {
      const sandbox = (options.sandboxes && options.sandboxes[request.language]) || request.language;
      const controller = typeof AbortController === "function" ? new AbortController() : null;
      const timer = controller ? setTimeout(() => controller.abort(), options.timeout) : null;
      return fetch(`${String(options.url).replace(/\/$/, "")}/exec`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sandbox, command: "run", files: request.files }),
        signal: controller ? controller.signal : undefined,
      })
        .then((response) =>
          response.json().catch(() => ({})).then((body) => {
            // Codapi answers 4xx with a JSON body for unknown sandboxes and limits.
            if (!response.ok && !body.stderr) throw new Error(`HTTP ${response.status}`);
            return body;
          }),
        )
        .catch((error) => {
          throw new Error(error.name === "AbortError" ? "timeout" : error.message);
        })
        .finally(() => clearTimeout(timer));
    },
  });

  /* ----------------------------------------------------------------------
   * Built-in runner: JavaScript in a Web Worker (no network, no DOM).
   * -------------------------------------------------------------------- */

  const WORKER_SOURCE = `
    self.onmessage = (event) => {
      const out = [], err = [];
      const show = (value) => typeof value === "string" ? value : (() => { try { return JSON.stringify(value); } catch (e) { return String(value); } })();
      const line = (args) => args.map(show).join(" ");
      console.log = console.info = (...args) => out.push(line(args));
      console.error = console.warn = (...args) => err.push(line(args));
      const started = Date.now();
      let ok = true;
      try { (0, eval)(event.data); } catch (error) { ok = false; err.push(String(error)); }
      self.postMessage({ ok, stdout: out.join("\\n"), stderr: err.join("\\n"), duration: Date.now() - started });
    };
  `;

  UC.registerRunner("browser", {
    run(request, options) {
      const files = request.files || {};
      // The entry file runs last, after any helper files.
      const code = Object.keys(files)
        .sort((a, b) => (a === "" ? 1 : b === "" ? -1 : 0))
        .map((name) => files[name])
        .join("\n;\n");
      return new Promise((resolve, reject) => {
        let worker;
        try {
          worker = new Worker(URL.createObjectURL(new Blob([WORKER_SOURCE], { type: "text/javascript" })));
        } catch (error) {
          reject(new Error("workers unavailable"));
          return;
        }
        const timer = setTimeout(() => {
          worker.terminate();
          reject(new Error("timeout"));
        }, options.timeout);
        worker.onmessage = (event) => {
          clearTimeout(timer);
          worker.terminate();
          resolve(event.data);
        };
        worker.onerror = (event) => {
          clearTimeout(timer);
          worker.terminate();
          resolve({ ok: false, stdout: "", stderr: event.message || "error", duration: 0 });
        };
        worker.postMessage(code);
      });
    },
  });
})(window.UC);
