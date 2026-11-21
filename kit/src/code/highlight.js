/**
 * <uc-code>, highlighting: highlight.js from cdnjs, loaded on first use (once
 * per page) with Subresource Integrity, plus the display names and download
 * extensions of the languages. When highlight.js cannot load (offline,
 * blocked), the code stays readable as plain text.
 * Part of <uc-code> (code/element.js).
 */
(function (UC) {
  "use strict";
  if (UC.__duplicate) return;

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

  Object.assign(UC.internal, { loadHighlighter, codeLanguages: LANGUAGES });
})(window.UC);
