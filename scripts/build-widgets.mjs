/**
 * Builds the widget library (docs/plan/widgets-api.md 18.1) into widgets/v1/:
 *
 *   uc-widget-core.js     widgets/src/core/index.js, bundled (ES modules → one IIFE)
 *   uc-widget-<name>.js   widgets/src/bootstrap.js + widgets/src/<name>/widget.js
 *   uc-widget.css         widgets/src/core/uc-widget.css + every <name>/<name>.css
 *   catalog.json          every widgets/src/<name>/meta.json, with the gzip size
 *
 * Every file is minified with a source map (sources under ../src). It fails
 * when a file is over its gzip budget (18.2), prints every size, and with
 * --check reports out-of-date files instead of writing them. It also fills
 * the catalogue cards of the docs page (<!-- widgets:catalog --> markers).
 * Called by scripts/build.mjs; the kit build is not touched.
 */
import { readFile, writeFile, mkdir, readdir, stat } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "widgets", "src");
const OUT = path.join(ROOT, "widgets", "v1");
const CATALOG_PAGE = path.join(ROOT, "docs", "pt", "widgets", "index.html");
const KB = 1024;
/** Gzip budgets (docs/plan/widgets-api.md 18.2). */
export const BUDGETS = { core: 12 * KB, widget: 8 * KB, css: 4 * KB };

const gzip = (text) => gzipSync(text, { level: 9 }).length;
const kb = (bytes) => `${(bytes / KB).toFixed(1)} KB`;

/** Widget folders: every widgets/src/<name>/ with a meta.json. */
export async function widgetNames() {
  const names = [];
  for (const entry of await readdir(SRC, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name === "core") continue;
    if (await stat(path.join(SRC, entry.name, "meta.json")).catch(() => null)) names.push(entry.name);
  }
  return names.sort();
}

async function bundle({ stdin, entry, outName, banner, loader = "js" }) {
  const result = await build({
    ...(stdin ? { stdin: { contents: stdin, resolveDir: SRC, sourcefile: `${outName}.entry.${loader}`, loader } } : { entryPoints: [entry] }),
    bundle: true,
    format: loader === "js" ? "iife" : undefined,
    minify: true,
    target: "esnext",
    charset: "utf8",
    legalComments: "none",
    sourcemap: "external",
    outfile: path.join(OUT, outName),
    write: false,
    banner: { [loader]: banner },
    logLevel: "silent",
  });
  const files = {};
  for (const file of result.outputFiles) {
    const name = path.basename(file.path);
    if (name.endsWith(".map")) {
      // Paths relative to widgets/v1/; the entry stub is not a real file.
      const map = JSON.parse(file.text);
      map.sources = map.sources.map((source) => source.replace(/^.*\.entry\.(js|css)$/, "(entry)"));
      files[name] = `${JSON.stringify(map)}\n`;
    } else {
      files[name] = file.text.endsWith("\n") ? file.text : `${file.text}\n`;
    }
  }
  return files;
}

/** Replaces the part of `content` between the widgets:catalog markers. */
function fillCatalog(content, catalog) {
  const start = "<!-- widgets:catalog -->";
  const end = "<!-- /widgets:catalog -->";
  const from = content.indexOf(start);
  const to = content.indexOf(end);
  if (from < 0 || to < 0) return content;
  const indent = content.slice(content.lastIndexOf("\n", from) + 1, from);
  const esc = (text) => String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const status = { experimental: "Experimental", stable: "Estável" };
  const cards = catalog.widgets.map((widget) => {
    const href = path.relative(path.dirname(CATALOG_PAGE), path.join(ROOT, widget.page)).split(path.sep).join("/");
    return [
      `<li class="uc-card docs-widget-card">`,
      `  <h3><a href="${esc(href)}">${esc(widget.title.pt)}</a> <code>&lt;${esc(widget.name)}&gt;</code></h3>`,
      `  <p>${esc(widget.summary.pt)}</p>`,
      `  <p class="docs-widget-card__meta"><span class="uc-tag">${esc(status[widget.status] || widget.status)}</span> <span class="uc-tag">Vaga ${widget.wave}</span> ${widget.courses.map((course) => `<span class="uc-tag uc-tag--accent">${esc(course)}</span>`).join(" ")}</p>`,
      `  <p class="docs-widget-card__meta">Algoritmos: ${widget.algorithms.map((name) => `<code>${esc(name)}</code>`).join(", ")} · ${(widget.gzip / KB).toFixed(1)} KB gzip</p>`,
      `</li>`,
    ];
  });
  const lines = [start, `<ul class="docs-widget-cards" role="list">`, ...cards.flat().map((line) => `  ${line}`), `</ul>`, end];
  return content.slice(0, from) + lines.map((line, i) => (i ? indent : "") + line).join("\n") + content.slice(to + end.length);
}

export async function buildWidgets({ check = false } = {}) {
  const { VERSION, KIT_MIN } = await import(pathToFileURL(path.join(SRC, "core", "version.js")).href);
  const banner = (what) => `/*! UC Design Kit widgets ${VERSION} | ${what} | MIT License | https://github.com/mmroch4/uc-design-kit\n * Built by scripts/build-widgets.mjs from widgets/src. Do not edit by hand. */`;
  const names = await widgetNames();
  const outputs = {
    ...(await bundle({ entry: path.join(SRC, "core", "index.js"), outName: "uc-widget-core.js", banner: banner("core") })),
  };
  const metas = [];
  for (const name of names) {
    const meta = JSON.parse(await readFile(path.join(SRC, name, "meta.json"), "utf8"));
    const stdin = `import define from "./${name}/widget.js";\nimport { boot } from "./bootstrap.js";\nboot(${JSON.stringify(meta.name)}, define);\n`;
    Object.assign(outputs, await bundle({ stdin, outName: `${meta.name}.js`, banner: banner(meta.name) }));
    metas.push(meta);
  }
  const cssParts = ['@import "./core/uc-widget.css";'];
  for (const name of names) {
    if (await stat(path.join(SRC, name, `${name}.css`)).catch(() => null)) cssParts.push(`@import "./${name}/${name}.css";`);
  }
  Object.assign(outputs, await bundle({ stdin: cssParts.join("\n"), outName: "uc-widget.css", banner: banner("styles"), loader: "css" }));

  const catalog = {
    version: VERSION,
    kit: `>=${KIT_MIN}`,
    widgets: metas.map(({ test, ...meta }) => ({
      name: meta.name,
      file: `${meta.name}.js`,
      ...meta,
      gzip: gzip(outputs[`${meta.name}.js`]),
    })),
  };
  outputs["catalog.json"] = `${JSON.stringify(catalog, null, 2)}\n`;

  let failed = 0;
  await mkdir(OUT, { recursive: true });
  for (const [name, content] of Object.entries(outputs)) {
    const target = path.join(OUT, name);
    const previous = await readFile(target, "utf8").catch(() => "");
    if (previous === content) continue;
    if (check) {
      console.error(`widgets/v1/${name} is out of date. Run: npm run build`);
      failed += 1;
    } else {
      await writeFile(target, content);
      console.log(`wrote widgets/v1/${name} (${kb(content.length)})`);
    }
  }

  const sizes = [
    ["uc-widget-core.js", BUDGETS.core, "Make the core smaller or raise the budget in docs/plan/widgets-api.md 18.2 first."],
    ...metas.map((meta) => [`${meta.name}.js`, BUDGETS.widget, `Make ${meta.name} smaller (docs/plan/widgets-api.md 18.2).`]),
    ["uc-widget.css", BUDGETS.css, "Make the widget styles smaller (docs/plan/widgets-api.md 18.2)."],
  ];
  for (const [name, budget, advice] of sizes) {
    const size = gzip(outputs[name]);
    const line = `${name}: ${kb(size)} gzipped (budget ${budget / KB} KB)`;
    if (size > budget) {
      console.error(`${line}: over budget. ${advice}`);
      failed += 1;
    } else {
      console.log(line);
    }
  }

  const page = await readFile(CATALOG_PAGE, "utf8").catch(() => null);
  if (page !== null) {
    const filled = fillCatalog(page, catalog);
    if (filled !== page) {
      if (check) {
        console.error("docs/pt/widgets/index.html: the catalogue is out of date. Run: npm run build");
        failed += 1;
      } else {
        await writeFile(CATALOG_PAGE, filled);
        console.log("wrote docs/pt/widgets/index.html (catalogue)");
      }
    }
  }
  return failed;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  buildWidgets({ check: process.argv.includes("--check") }).then(
    (failed) => (process.exitCode = failed ? 1 : 0),
    (error) => {
      console.error(error);
      process.exitCode = 1;
    },
  );
}
