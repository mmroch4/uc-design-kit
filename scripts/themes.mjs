/**
 * Ready-made themes, layout style sheets and the starter theme.css
 * (docs/api.md 8.1 to 8.3, docs/architecture/themes-layouts.md 5).
 *
 *   - Minifies every kit/src/themes/<name>.css into kit/v1/themes/<name>.css.
 *     The names must be the THEMES list of kit/src/core/themes.js, which
 *     `theme` in course.js is checked against. Each of its LAYOUT_THEMES must
 *     declare --uc-layout, and every @import of a theme must name a file of
 *     kit/src/layouts/ (kept as written: "../layouts/<name>.css").
 *   - Minifies every kit/src/layouts/<name>.css into kit/v1/layouts/<name>.css.
 *     The names must be the FILE_LAYOUTS list of kit/src/core/layouts.js, and
 *     each file must declare --uc-layout-<name>-loaded: 1 on :root.
 *   - Writes the starter theme.css from kit/src/css/base/tokens.css: every
 *     token, commented out, with the kit's value, grouped as in tokens.css.
 *     It goes to template/theme.css (the theme.css of a new site),
 *     docs/downloads/theme.css (the download of "Criar um tema") and
 *     docs/assets/theme-starter.js (the same text, for the theme customiser,
 *     which exports the complete file; a script, so it works from file://).
 *
 * Run by scripts/build.mjs.
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { transform } from "esbuild";
import { writeOutputs } from "./lib/budgets.mjs";
import { ROOT } from "./lib/server.mjs";

const SOURCE = path.join(ROOT, "kit/src/themes");
const LAYOUTS = path.join(ROOT, "kit/src/layouts");

/** The names of the .css files of `dir` (none when it does not exist), sorted. */
async function cssNames(dir) {
  const files = await readdir(dir).catch(() => []);
  return files.filter((file) => file.endsWith(".css")).map((file) => file.replace(/\.css$/, "")).sort();
}

/** The array literal `const <name> = [...]` of a kit source file, or null. */
async function listIn(file, name) {
  const match = new RegExp(`const ${name} = (\\[[^\\]]*\\])`).exec(await readFile(path.join(ROOT, file), "utf8"));
  return match ? JSON.parse(match[1]) : null;
}

const sameNames = (list, names) => Array.isArray(list) && JSON.stringify(list.slice().sort()) === JSON.stringify(names);

/** Portuguese titles for the groups of tokens.css (its comments are in English). */
const GROUPS = {
  "Colour: accent (overridden by UC_COURSE.accentColor)": "Cor de destaque (o accentColor do course.js prevalece sobre esta)",
  "Colour: neutrals": "Neutros: texto, bordas e fundos",
  "Colour: warning / assessment": "Aviso e avaliação",
  "Colour: success (self-check feedback)": "Sucesso e erro (respostas das perguntas)",
  Typography: "Tipografia",
  "Shape and space": "Forma e espaço",
  Layout: "Layout",
};

const HEADER = `/*
 * theme.css: o tema deste site. É carregado depois do kit, por isso
 * qualquer regra aqui ganha às do kit. Guia: "Criar um tema" na documentação
 * (https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/criar-tema.html).
 *
 * 1. A cor de destaque muda-se no course.js (accentColor), e um tema pronto
 *    também (theme: "compact", "serif" ou "high-contrast").
 * 2. Nível 1, tokens: abaixo estão todos, com o valor do kit e comentados.
 *    Para mudar um, tirar as marcas de comentário do início e do fim da
 *    linha e mudar o valor. Linhas comentadas não mudam nada.
 * 3. Nível 2, CSS livre, com as classes estáveis dos componentes, no fim do
 *    ficheiro. Exemplo: .uc-week__title { font-weight: 600; }
 */
`;

/** The starter theme.css: tokens.css with every declaration commented out. */
export function starterTheme(tokensCss, version) {
  const out = [HEADER.replace("o tema deste site.", `o tema deste site (UC Design Kit ${version}).`)];
  const body = tokensCss.replace(/^\/\*[^]*?\*\/\s*/, "");
  for (const raw of body.split("\n")) {
    const line = raw.trimEnd();
    const group = /^(\s*)\/\* (.+) \*\/$/.exec(line);
    const declaration = /^(\s*)(--uc-[a-z0-9-]+):\s*(.+?);(\s*\/\*.*\*\/)?$/.exec(line);
    if (declaration) {
      out.push(`${declaration[1]}/* ${declaration[2]}: ${declaration[3]}; */`);
    } else if (group) {
      // Group titles are translated; other notes of tokens.css are left out.
      if (GROUPS[group[2]]) out.push(`${group[1]}/* ${GROUPS[group[2]]} */`);
    } else if (/^@media/.test(line)) {
      out.push("/* Ecrãs estreitos (telemóveis): valores que o kit troca abaixo de 760 px. */", line);
    } else if (!/^\s*\/\*/.test(line)) {
      out.push(line);
    }
  }
  return `${out.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd()}\n\n/* Nível 2: CSS livre. */\n`;
}

async function minify(name, content, version, kind = "theme") {
  const result = await transform(content, {
    loader: "css",
    minify: true,
    target: "esnext",
    charset: "utf8",
    legalComments: "none",
    banner: `/*! UC Design Kit ${version} | ${kind} "${name}" | MIT License | https://github.com/mmroch4/uc-design-kit */`,
  });
  return result.code;
}

/** Builds the themes, the layouts and the starter file. Returns the number of problems (or, with `check`, out-of-date files). */
export async function buildThemes({ check = false } = {}) {
  const { version } = JSON.parse(await readFile(path.join(ROOT, "package.json"), "utf8"));
  const names = await cssNames(SOURCE);
  const layouts = await cssNames(LAYOUTS);
  let problems = 0;
  const problem = (message) => {
    console.error(message);
    problems += 1;
  };
  if (!sameNames(await listIn("kit/src/core/themes.js", "THEMES"), names)) problem(`kit/src/core/themes.js: THEMES must list the files of kit/src/themes (${names.join(", ")}).`);
  if (!sameNames(await listIn("kit/src/core/layouts.js", "FILE_LAYOUTS"), layouts)) problem(`kit/src/core/layouts.js: FILE_LAYOUTS must list the files of kit/src/layouts (${layouts.join(", ") || "none"}).`);
  const layoutThemes = (await listIn("kit/src/core/themes.js", "LAYOUT_THEMES")) || [];

  const themes = {};
  for (const name of names) {
    const source = await readFile(path.join(SOURCE, `${name}.css`), "utf8");
    if (layoutThemes.includes(name) && !/--uc-layout\s*:/.test(source)) problem(`kit/src/themes/${name}.css: a theme with a layout must declare --uc-layout.`);
    for (const [, url] of source.matchAll(/@import\s+(?:url\()?["']([^"']+)["']/g)) {
      const match = /^\.\.\/layouts\/([a-z0-9-]+)\.css$/.exec(url);
      if (!match || !layouts.includes(match[1])) problem(`kit/src/themes/${name}.css: @import "${url}" must be "../layouts/<name>.css" with a file in kit/src/layouts.`);
    }
    themes[`${name}.css`] = await minify(name, source, version);
  }
  problems += await writeOutputs(themes, "kit/v1/themes", { check });

  const layoutFiles = {};
  for (const name of layouts) {
    const source = await readFile(path.join(LAYOUTS, `${name}.css`), "utf8");
    // The kit adds no <link> for a layout whose file is already there (a theme's @import): it looks for this property.
    if (!new RegExp(`--uc-layout-${name}-loaded\\s*:\\s*1\\s*;`).test(source)) problem(`kit/src/layouts/${name}.css: must declare --uc-layout-${name}-loaded: 1 on :root.`);
    layoutFiles[`${name}.css`] = await minify(name, source, version, "layout");
  }
  if (layouts.length) problems += await writeOutputs(layoutFiles, "kit/v1/layouts", { check });

  const starter = starterTheme(await readFile(path.join(ROOT, "kit/src/css/base/tokens.css"), "utf8"), version);
  const script = `/* Built by scripts/themes.mjs from kit/src/css/base/tokens.css. Do not edit by hand. */\nwindow.UC_DOCS_THEME_STARTER = ${JSON.stringify(starter)};\n`;
  problems += await writeOutputs({ "theme.css": starter }, "template", { check });
  problems += await writeOutputs({ "theme.css": starter }, "docs/downloads", { check });
  problems += await writeOutputs({ "theme-starter.js": script }, "docs/assets", { check });
  return problems;
}
