#!/usr/bin/env node
/**
 * Builds kit/v1/uc-kit.js and kit/v1/uc-kit.css from the files listed in
 * kit/src/manifest.json: the files are concatenated in order (no modules, no
 * transpilation) and minified with esbuild. Each output has a source map
 * (uc-kit.js.map, uc-kit.css.map) that embeds the original sources, so the
 * browser's developer tools show the readable files from kit/src.
 *
 * It then fills the generated parts of the documentation pages and writes the
 * search index (scripts/docs.mjs), writes the documentation for language
 * models (llms.txt, llms-full.txt and a .md per page, scripts/llms.mjs), and
 * packs template/ into docs/downloads/uc-template.zip (scripts/template-zip.mjs).
 * The examples whose course.js has `search` get their search-index.js from
 * template/uc-site.py (scripts/example-indexes.mjs).
 *
 * It builds the widget library into widgets/v1/ (scripts/build-widgets.mjs),
 * and the ready-made themes into kit/v1/themes/ with the starter theme.css
 * (scripts/themes.mjs).
 *
 * It also verifies the frozen releases (kit/vX.Y.Z/, made by
 * scripts/snapshot.mjs): their files must match the SHA256SUMS written when
 * they were created, because browsers cache them for a year.
 *
 * The version has one source, "version" in package.json. The build writes it
 * into kit/src/core/namespace.js (UC.version), widgets/src/core/version.js
 * (VERSION) and template/uc-site.py (VERSION) before anything else; with
 * --check it fails when one of them says something else.
 *
 * It fails when uc-kit.js (50 KB gzipped), uc-grading.js (8 KB) or
 * uc-search.js (6 KB) is over its size budget (scripts/lib/budgets.mjs) and
 * prints the sizes on every run.
 *
 * Usage: node scripts/build.mjs [--check]
 *   --check  exits with an error when kit/v1, a documentation page or the
 *            template zip is out of date, or a release was modified (used in CI).
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { transform } from "esbuild";
import { KIT, WIDGETS, listReleases, verifyRelease } from "./releases.mjs";
import { buildDocs, buildSearchIndex } from "./docs.mjs";
import { buildTemplateZip } from "./template-zip.mjs";
import { buildLlms } from "./llms.mjs";
import { buildWidgets } from "./build-widgets.mjs";
import { buildExampleIndexes } from "./example-indexes.mjs";
import { buildThemes } from "./themes.mjs";
import { KIT_BUDGETS, checkBudgets, writeOutputs } from "./lib/budgets.mjs";
import { ROOT } from "./lib/server.mjs";

const SRC = path.join(KIT, "src");

/* ---------- one version ---------- */

/** The files that repeat package.json's version, and the text that holds it. */
const VERSION_COPIES = [
  ["kit/src/core/namespace.js", /(\bversion: ")([^"]*)(")/],
  ["widgets/src/core/version.js", /(\bexport const VERSION = ")([^"]*)(")/],
  ["template/uc-site.py", /(^VERSION = ")([^"]*)(")/m],
];

/**
 * Writes package.json's version into every copy (or, with `check`, reports the
 * copies that differ). Returns the number of problems.
 */
async function syncVersion({ check = false } = {}) {
  const { version } = JSON.parse(await readFile(path.join(ROOT, "package.json"), "utf8"));
  let problems = 0;
  for (const [file, pattern] of VERSION_COPIES) {
    const target = path.join(ROOT, file);
    const content = await readFile(target, "utf8");
    const match = pattern.exec(content);
    if (!match) {
      console.error(`${file}: the version was not found (expected ${pattern}).`);
      problems += 1;
      continue;
    }
    if (match[2] === version) continue;
    if (check) {
      console.error(`${file} says version "${match[2]}", package.json says "${version}". Run: npm run build`);
      problems += 1;
    } else {
      await writeFile(target, content.replace(pattern, `$1${version}$3`));
      console.log(`wrote version ${version} into ${file}`);
    }
  }
  return problems;
}

/* ---------- source maps for the concatenation ---------- */

const BASE64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

/** Encodes one integer as a source map Base64 VLQ. */
function vlq(value) {
  let rest = value < 0 ? (-value << 1) | 1 : value << 1;
  let out = "";
  do {
    let digit = rest & 31;
    rest >>>= 5;
    if (rest > 0) digit |= 32;
    out += BASE64[digit];
  } while (rest > 0);
  return out;
}

/**
 * Concatenates the files and returns the code with an inline source map that
 * maps every line back to its file. esbuild reads that map and composes it
 * with the minification, so the final map points at kit/src.
 */
function concatenate(files) {
  const lines = [];
  const mappings = [];
  let previous = { source: 0, line: 0 };
  files.forEach(({ content }, source) => {
    content.split("\n").forEach((text, line) => {
      lines.push(text);
      mappings.push(
        "A" + vlq(source - previous.source) + vlq(line - previous.line) + "A",
      );
      previous = { source, line };
    });
  });
  const map = {
    version: 3,
    sources: files.map(({ name }) => `../src/${name}`),
    sourcesContent: files.map(({ content }) => content),
    names: [],
    mappings: mappings.join(";"),
  };
  const comment = (body) => `/*# sourceMappingURL=data:application/json;base64,${body} */`;
  return `${lines.join("\n")}\n${comment(Buffer.from(JSON.stringify(map)).toString("base64"))}\n`;
}

/* ---------- bundles ---------- */

async function bundle(names, kind, outName) {
  const pkg = JSON.parse(await readFile(path.join(ROOT, "package.json"), "utf8"));
  const files = await Promise.all(
    names.map(async (name) => ({
      name,
      content: (await readFile(path.join(SRC, name), "utf8")).trimEnd(),
    })),
  );
  if (kind === "css" && files.some(({ content }) => /^@import/m.test(content))) {
    // @import must precede every other rule; keep imports out of kit sources.
    throw new Error("kit/src CSS files must not use @import");
  }
  const result = await transform(concatenate(files), {
    loader: kind,
    minify: true,
    // No syntax lowering: the code runs as written in kit/src.
    target: "esnext",
    charset: "utf8",
    legalComments: "none",
    sourcemap: "external",
    sourcefile: outName,
    banner:
      `/*! UC Design Kit ${pkg.version} | MIT License | https://github.com/mmroch4/uc-design-kit\n` +
      ` * Built by scripts/build.mjs from kit/src (see ${outName}.map). Do not edit by hand. */`,
  });
  const map = JSON.parse(result.map);
  map.file = outName;
  const code = `${result.code}${kind === "css" ? `/*# sourceMappingURL=${outName}.map */` : `//# sourceMappingURL=${outName}.map`}\n`;
  return { [outName]: code, [`${outName}.map`]: `${JSON.stringify(map)}\n` };
}

async function main() {
  const check = process.argv.includes("--check");
  // First: the bundles, the widgets and the template zip read these copies.
  const versionProblems = await syncVersion({ check });
  const manifest = JSON.parse(await readFile(path.join(SRC, "manifest.json"), "utf8"));
  const outputs = {
    ...(await bundle(manifest.js, "js", "uc-kit.js")),
    ...(await bundle(manifest.grading, "js", "uc-grading.js")),
    ...(await bundle(manifest.search, "js", "uc-search.js")),
    ...(await bundle(manifest.css, "css", "uc-kit.css")),
  };
  let failed = versionProblems > 0;
  if ((await writeOutputs(outputs, "kit/v1", { check })) > 0) failed = true;
  const budgets = KIT_BUDGETS.map(({ name, budget, where }) => ({
    name,
    content: outputs[name],
    budget,
    advice: `Make the new code smaller or raise the budget in ${where} first.`,
  }));
  if (checkBudgets(budgets) > 0) failed = true;
  // Before the template zip, which packs template/theme.css.
  if ((await buildThemes({ check })) > 0) failed = true;
  // Widgets first: they fill the catalogue page that the docs and llms steps read.
  if ((await buildWidgets({ check })) > 0) failed = true;
  if ((await buildDocs({ check })) > 0) failed = true;
  if ((await buildSearchIndex({ check })) > 0) failed = true;
  if ((await buildExampleIndexes({ check })) > 0) failed = true;
  if ((await buildLlms({ check })) > 0) failed = true;
  if ((await buildTemplateZip({ check })) > 0) failed = true;
  for (const [base, label] of [[KIT, "kit"], [WIDGETS, "widgets"]]) {
    for (const release of await listReleases(base)) {
      const problems = await verifyRelease(release, base);
      for (const problem of problems) console.error(`${label}/${release}: ${problem}`);
      if (problems.length) failed = true;
    }
  }
  if (failed) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
