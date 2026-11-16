#!/usr/bin/env node
/**
 * Builds kit/v1/uc-kit.js and kit/v1/uc-kit.css from the files listed in
 * kit/src/manifest.json: the files are concatenated in order (no modules, no
 * transpilation) and minified with esbuild. Each output has a source map
 * (uc-kit.js.map, uc-kit.css.map) that embeds the original sources, so the
 * browser's developer tools show the readable files from kit/src.
 *
 * It then fills the generated parts of the documentation pages and writes the
 * search index (scripts/docs.mjs), and packs template/ into
 * docs/downloads/uc-template.zip (scripts/template-zip.mjs).
 *
 * It also verifies the frozen releases (kit/vX.Y.Z/, made by
 * scripts/snapshot.mjs): their files must match the SHA256SUMS written when
 * they were created, because browsers cache them for a year.
 *
 * Usage: node scripts/build.mjs [--check]
 *   --check  exits with an error when kit/v1, a documentation page or the
 *            template zip is out of date, or a release was modified (used in CI).
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { transform } from "esbuild";
import { KIT, listReleases, verifyRelease } from "./releases.mjs";
import { buildDocs, buildSearchIndex } from "./docs.mjs";
import { buildTemplateZip } from "./template-zip.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(KIT, "src");
const OUT = path.join(KIT, "v1");

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
  const manifest = JSON.parse(await readFile(path.join(SRC, "manifest.json"), "utf8"));
  const outputs = {
    ...(await bundle(manifest.js, "js", "uc-kit.js")),
    ...(await bundle(manifest.css, "css", "uc-kit.css")),
  };
  await mkdir(OUT, { recursive: true });
  let failed = false;
  for (const [name, content] of Object.entries(outputs)) {
    const target = path.join(OUT, name);
    const previous = await readFile(target, "utf8").catch(() => "");
    if (previous === content) continue;
    if (check) {
      console.error(`kit/v1/${name} is out of date. Run: npm run build`);
      failed = true;
    } else {
      await writeFile(target, content);
      console.log(`wrote kit/v1/${name} (${(content.length / 1024).toFixed(1)} KB)`);
    }
  }
  if ((await buildDocs({ check })) > 0) failed = true;
  if ((await buildSearchIndex({ check })) > 0) failed = true;
  if ((await buildTemplateZip({ check })) > 0) failed = true;
  for (const release of await listReleases()) {
    const problems = await verifyRelease(release);
    for (const problem of problems) console.error(`kit/${release}: ${problem}`);
    if (problems.length) failed = true;
  }
  if (failed) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
