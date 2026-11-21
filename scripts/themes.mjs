/**
 * Ready-made themes and the starter theme.css (docs/api.md 8.1 and 8.2).
 *
 *   - Minifies every kit/src/themes/<name>.css into kit/v1/themes/<name>.css.
 *     The names must be the THEMES list of kit/src/core/themes.js, which
 *     `theme` in course.js is checked against.
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

async function minify(name, content, version) {
  const result = await transform(content, {
    loader: "css",
    minify: true,
    target: "esnext",
    charset: "utf8",
    legalComments: "none",
    banner: `/*! UC Design Kit ${version} | theme "${name}" | MIT License | https://github.com/mmroch4/uc-design-kit */`,
  });
  return result.code;
}

/** Builds the themes and the starter file. Returns the number of problems (or, with `check`, out-of-date files). */
export async function buildThemes({ check = false } = {}) {
  const { version } = JSON.parse(await readFile(path.join(ROOT, "package.json"), "utf8"));
  const files = (await readdir(SOURCE)).filter((file) => file.endsWith(".css")).sort();
  const names = files.map((file) => file.replace(/\.css$/, ""));
  const listed = /const THEMES = (\[[^\]]*\])/.exec(await readFile(path.join(ROOT, "kit/src/core/themes.js"), "utf8"));
  let problems = 0;
  if (!listed || JSON.stringify(JSON.parse(listed[1]).slice().sort()) !== JSON.stringify(names)) {
    console.error(`kit/src/core/themes.js: THEMES must list the files of kit/src/themes (${names.join(", ")}).`);
    problems += 1;
  }
  const themes = {};
  for (const file of files) {
    themes[file] = await minify(file.replace(/\.css$/, ""), await readFile(path.join(SOURCE, file), "utf8"), version);
  }
  problems += await writeOutputs(themes, "kit/v1/themes", { check });

  const starter = starterTheme(await readFile(path.join(ROOT, "kit/src/css/base/tokens.css"), "utf8"), version);
  const script = `/* Built by scripts/themes.mjs from kit/src/css/base/tokens.css. Do not edit by hand. */\nwindow.UC_DOCS_THEME_STARTER = ${JSON.stringify(starter)};\n`;
  problems += await writeOutputs({ "theme.css": starter }, "template", { check });
  problems += await writeOutputs({ "theme.css": starter }, "docs/downloads", { check });
  problems += await writeOutputs({ "theme-starter.js": script }, "docs/assets", { check });
  return problems;
}
