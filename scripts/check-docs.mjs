#!/usr/bin/env node
/**
 * Checks the documentation site (docs/ and the landing page) without a browser.
 *
 *   - navigation: every page under docs/<lang>/ is in docs/nav.json and every
 *     nav entry exists
 *   - headings: every h2 of an article has an id, and ids are unique ("Nesta página")
 *   - links: local href/src targets exist; #anchors into documentation pages exist
 *   - coverage: a component page's "Atributos" table (h2#atributos) lists exactly
 *     the attributes of that component in docs/api.md, section 3; the course.js
 *     page lists exactly the types, fields and built-in pages of section 2;
 *     every CSS building block of section 4 is named in a heading of the
 *     Estilos "Blocos" pages or the Typography page;
 *     the Tokens page has a row for every token of section 5 (ranges expanded
 *     from kit/src/css) and no token unknown to api.md and the kit's CSS
 *
 * Components of api.md without a page are listed as pending. With --strict
 * (used once every component has a page) they fail the check.
 *
 * Usage: node scripts/check-docs.mjs [--strict]
 */
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { ROOT, DOCS, loadNav, navPages, listDocPages, headingsOf, stripTags, walk } from "./docs.mjs";

const strict = process.argv.includes("--strict");
const problems = [];
const rel = (file) => path.relative(ROOT, file).split(path.sep).join("/");

async function exists(file) {
  try {
    return await stat(file);
  } catch {
    return null;
  }
}

/* ---------- api.md: components and their attributes ---------- */

/** Map of component name → attribute names, read from docs/api.md section 3. */
export async function apiComponents() {
  const api = await readFile(path.join(ROOT, "docs/api.md"), "utf8");
  const section = api.split(/^## /m).find((part) => part.startsWith("3. Components"));
  const components = new Map();
  for (const block of section.split(/^#### /m).slice(1)) {
    const name = block.match(/^`<([a-z0-9-]+)>`/);
    if (!name) continue;
    const attributes = new Set();
    let inTable = false;
    for (const line of block.split("\n")) {
      if (/^\|\s*Attribute\s*\|/.test(line)) {
        inTable = true;
        continue;
      }
      if (inTable && line.startsWith("|")) {
        const cell = line.split("|")[1];
        if (/^\s*-+\s*$/.test(cell)) continue;
        for (const match of cell.matchAll(/`([^`]+)`/g)) attributes.add(match[1]);
      } else {
        inTable = false;
      }
      // Components with one or two attributes describe them in a sentence: "Attributes: `multiple` (…)".
      const sentence = line.match(/^Attributes?:(.*)$/);
      if (sentence) for (const match of sentence[1].matchAll(/`([a-z][a-z0-9-]*)`/g)) attributes.add(match[1]);
    }
    components.set(name[1], attributes);
  }
  return components;
}

/** Attribute names in the page's "Atributos" table: the first <code> of each body row. */
function documentedAttributes(content) {
  const section = content.match(/<h2 id="atributos">[\s\S]*?(?=<h2\b|<\/article>)/);
  if (!section) return null;
  const names = new Set();
  for (const row of section[0].matchAll(/<tr>\s*<td>([\s\S]*?)<\/td>/g)) {
    for (const code of row[1].matchAll(/<code>([\s\S]*?)<\/code>/g)) names.add(stripTags(code[1]));
  }
  return names;
}

/* ---------- api.md section 2: course.js ---------- */

// Subsection of api.md section 2 → id of the h2 of the course.js page that
// documents it. The first column of the subsection's first table is compared
// with the first <code> of each row of the tables in that h2 section.
const COURSE_PAGE = "pt/course-js.html";
const COURSE_SECTIONS = { "2.1": "tipos", "2.2": "campos", "2.3": "paginas", "2.4": "equipa", "2.5": "prazos", "2.6": "avisos" };

/** Map of subsection number ("2.2") → names in the first column of its first table. */
export async function apiCourseTables() {
  const api = await readFile(path.join(ROOT, "docs/api.md"), "utf8");
  const section = api.split(/^## /m).find((part) => part.startsWith("2. Course configuration"));
  const tables = new Map();
  for (const block of section.split(/^### /m).slice(1)) {
    const number = block.match(/^(\d+\.\d+)\s/);
    if (!number) continue;
    const names = new Set();
    let started = false;
    for (const line of block.split("\n")) {
      if (!line.startsWith("|")) {
        if (started) break;
        continue;
      }
      const cell = line.split("|")[1];
      if (!started) {
        started = true; // header row
        continue;
      }
      if (/^\s*-+\s*$/.test(cell)) continue;
      const code = cell.match(/`([^`]+)`/);
      if (code) names.add(code[1]);
    }
    if (names.size) tables.set(number[1], names);
  }
  return tables;
}

/** First <code> of each body row of the tables between <h2 id="…"> and the next h2. */
function sectionRowNames(content, id) {
  const section = content.match(new RegExp(`<h2 id="${id}">[\\s\\S]*?(?=<h2\\b|<\\/article>)`));
  if (!section) return null;
  const names = new Set();
  for (const row of section[0].matchAll(/<tr>\s*<td>([\s\S]*?)<\/td>/g)) {
    const code = row[1].match(/<code>([\s\S]*?)<\/code>/);
    if (code) names.add(stripTags(code[1]));
  }
  return names;
}

async function checkCoursePage() {
  const file = path.join(DOCS, COURSE_PAGE);
  if (!(await exists(file))) return;
  const content = await readFile(file, "utf8");
  for (const [number, expected] of await apiCourseTables()) {
    const id = COURSE_SECTIONS[number];
    if (!id) {
      problems.push(`docs/api.md: section ${number} has no section on ${rel(file)} (add it to COURSE_SECTIONS)`);
      continue;
    }
    const listed = sectionRowNames(content, id);
    if (!listed) {
      problems.push(`${rel(file)}: no <h2 id="${id}"> section (docs/api.md ${number})`);
      continue;
    }
    for (const name of expected) if (!listed.has(name)) problems.push(`${rel(file)}: "${name}" from docs/api.md ${number} is not documented in #${id}`);
    for (const name of listed) if (!expected.has(name)) problems.push(`${rel(file)}: "${name}" in #${id} is not in docs/api.md ${number}`);
  }
}

/* ---------- api.md section 4: CSS building blocks ---------- */

// Pages that document the building blocks. Each name in the first column of
// api.md section 4 must appear as a <code> inside an h2 or h3 of one of them
// (".uc-card" and "uc-card" are the same name). uc-lead, uc-prose and
// uc-content live on the Typography page.
const BLOCK_PAGES = ["pt/estilos/layout.html", "pt/estilos/superficies.html", "pt/estilos/elementos.html", "pt/estilos/tipografia.html"];
// On these, every uc-… class in a heading must be a name or a variant of section 4.
const BLOCK_PAGES_STRICT = new Set(BLOCK_PAGES.slice(0, 3));

/** Names in the first column of api.md section 4, and every `uc-…` class named anywhere in it (variants). */
export async function apiBlocks() {
  const api = await readFile(path.join(ROOT, "docs/api.md"), "utf8");
  const section = api.split(/^## /m).find((part) => part.startsWith("4. CSS building blocks"));
  const names = new Set();
  const known = new Set();
  for (const line of section.split("\n")) {
    if (!line.startsWith("|")) continue;
    const [, first, use = ""] = line.split("|");
    if (/^\s*(-+|Class)\s*$/.test(first)) continue;
    for (const match of first.matchAll(/`([^`]+)`/g)) names.add(match[1].trim());
    for (const match of `${first} ${use}`.matchAll(/`\.?(uc-[a-z0-9_-]+)`/g)) known.add(match[1]);
  }
  for (const name of names) known.add(name);
  return { names, known };
}

/** Text of each <code> inside the article's h2/h3 headings, without a leading ".". */
function headingCodes(content) {
  const article = content.match(/<article\b[^>]*>([\s\S]*?)<\/article>/);
  const codes = new Set();
  for (const heading of article ? article[1].matchAll(/<h([23])\b[^>]*>([\s\S]*?)<\/h\1>/g) : []) {
    for (const code of heading[2].matchAll(/<code>([\s\S]*?)<\/code>/g)) codes.add(stripTags(code[1]).replace(/^\./, ""));
  }
  return codes;
}

async function checkBlockPages() {
  const { names, known } = await apiBlocks();
  const documented = new Set();
  for (const page of BLOCK_PAGES) {
    const file = path.join(DOCS, page);
    if (!(await exists(file))) {
      problems.push(`docs/${page}: missing (CSS building blocks, docs/api.md section 4)`);
      continue;
    }
    for (const code of headingCodes(await readFile(file, "utf8"))) {
      documented.add(code);
      if (BLOCK_PAGES_STRICT.has(page) && /^uc-/.test(code) && !known.has(code)) problems.push(`${rel(file)}: "${code}" in a heading is not in docs/api.md section 4`);
    }
  }
  for (const name of names) {
    if (!documented.has(name)) problems.push(`docs/api.md section 4: "${name}" is not in an h2/h3 <code> of ${BLOCK_PAGES.map((page) => page.split("/").pop()).join(", ")}`);
  }
}

/* ---------- api.md section 5: design tokens ---------- */

// The Tokens page lists one token per table row (first <code> of the row).
// It must list every token of api.md section 5; a row may also name a token
// the kit's CSS defines or reads without it being in api.md (internal ones).
const TOKENS_PAGE = "pt/estilos/tokens.html";

/**
 * Tokens in the first column of the tables of api.md section 5: exact names,
 * plus ranges ("`--uc-space-1` … `--uc-space-12`") as a name prefix.
 * "`--uc-radius-sm` / `-md` / `-lg`" names three tokens.
 */
export async function apiTokens() {
  const api = await readFile(path.join(ROOT, "docs/api.md"), "utf8");
  const section = api.split(/^## /m).find((part) => part.startsWith("5. Design tokens"));
  const names = new Set();
  const prefixes = [];
  let inTable = false;
  for (const line of section.split("\n")) {
    if (!line.startsWith("|")) {
      inTable = false;
      continue;
    }
    const cell = line.split("|")[1];
    if (!inTable) {
      inTable = true; // header row
      continue;
    }
    if (/^\s*-+\s*$/.test(cell)) continue;
    const codes = Array.from(cell.matchAll(/`([^`]+)`/g), (match) => match[1]);
    const full = codes.filter((code) => code.startsWith("--uc-"));
    if (cell.includes("…") && full.length === 2) {
      prefixes.push(commonPrefix(full[0], full[1]));
      for (const name of full) names.add(name);
      continue;
    }
    let last = null;
    for (const code of codes) {
      if (code.startsWith("--uc-")) {
        last = code;
        names.add(code);
      } else if (last && /^-[a-z0-9]+$/.test(code)) {
        names.add(last.replace(/-[a-z0-9]+$/, code)); // `-md` after `--uc-radius-sm`
      }
    }
  }
  return { names, prefixes };
}

/** Longest common prefix of two token names, cut after its last "-". */
function commonPrefix(a, b) {
  let length = 0;
  while (length < a.length && a[length] === b[length]) length += 1;
  return a.slice(0, a.lastIndexOf("-", length - 1) + 1);
}

/** Every --uc-* name the kit's CSS defines or reads. */
async function kitTokens() {
  const names = new Set();
  const files = (await walk(path.join(ROOT, "kit/src/css"))).filter((file) => file.endsWith(".css"));
  for (const file of files) {
    for (const match of (await readFile(file, "utf8")).matchAll(/--uc-[a-z0-9-]*[a-z0-9]/g)) names.add(match[0]);
  }
  return names;
}

async function checkTokensPage() {
  const file = path.join(DOCS, TOKENS_PAGE);
  if (!(await exists(file))) return;
  const article = (await readFile(file, "utf8")).match(/<article\b[^>]*>([\s\S]*?)<\/article>/);
  const listed = new Set();
  for (const row of article ? article[1].matchAll(/<tr>\s*<td>([\s\S]*?)<\/td>/g) : []) {
    const code = row[1].match(/<code>([\s\S]*?)<\/code>/);
    if (code && stripTags(code[1]).startsWith("--uc-")) listed.add(stripTags(code[1]));
  }
  const { names, prefixes } = await apiTokens();
  const kit = await kitTokens();
  // A range of api.md stands for every token of the kit with that prefix.
  const expected = new Set(names);
  for (const name of kit) if (prefixes.some((prefix) => name.startsWith(prefix))) expected.add(name);
  for (const name of expected) if (!listed.has(name)) problems.push(`${rel(file)}: token "${name}" from docs/api.md section 5 has no row`);
  for (const name of listed) {
    if (!expected.has(name) && !kit.has(name)) problems.push(`${rel(file)}: token "${name}" is neither in docs/api.md section 5 nor in kit/src/css`);
  }
}

/* ---------- links ---------- */

function idsOf(content) {
  return new Set(Array.from(content.matchAll(/\sid="([^"]+)"/g), (match) => match[1]));
}

async function checkLinks(file, content, cache) {
  // Code samples (<pre>) show markup; their href="…" are text, not links.
  const markup = content.replace(/<pre\b[\s\S]*?<\/pre>/g, "");
  for (const match of markup.matchAll(/\s(?:href|src)="([^"]*)"/g)) {
    const value = match[1];
    if (!value || /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(value)) continue;
    const [target, hash] = value.split("#");
    const pathname = target.split("?")[0];
    let targetFile = pathname ? path.resolve(path.dirname(file), decodeURIComponent(pathname)) : file;
    const info = await exists(targetFile);
    if (!info) {
      problems.push(`${rel(file)}: broken link ${value}`);
      continue;
    }
    if (info.isDirectory()) targetFile = path.join(targetFile, "index.html");
    // Anchors are checked only in documentation pages (example pages create ids at run time).
    if (!hash || !targetFile.endsWith(".html") || !(targetFile.startsWith(DOCS + path.sep) || targetFile === path.join(ROOT, "index.html"))) continue;
    if (!cache.has(targetFile)) cache.set(targetFile, idsOf(await readFile(targetFile, "utf8")));
    if (!cache.get(targetFile).has(decodeURIComponent(hash))) problems.push(`${rel(file)}: missing anchor ${value}`);
  }
}

/* ---------- main ---------- */

async function main() {
  const nav = await loadNav();
  const pages = await listDocPages(nav);
  const components = await apiComponents();
  const documented = new Set();
  const idCache = new Map();

  for (const lang of Object.keys(nav.languages)) {
    const entries = navPages(nav, lang);
    const inNav = new Set(entries.map((entry) => path.join(DOCS, entry.path)));
    for (const entry of entries) {
      if (!(await exists(path.join(DOCS, entry.path)))) problems.push(`docs/nav.json: ${entry.path} does not exist`);
      if (entry.component && !components.has(entry.component)) problems.push(`docs/nav.json: ${entry.component} is not a component in docs/api.md`);
    }
    for (const page of pages.filter((item) => item.lang === lang)) {
      if (!inNav.has(page.file)) problems.push(`${rel(page.file)}: not in docs/nav.json`);
    }

    for (const entry of entries.filter((item) => item.component)) {
      const file = path.join(DOCS, entry.path);
      if (!(await exists(file))) continue;
      const content = await readFile(file, "utf8");
      const listed = documentedAttributes(content);
      if (!listed) {
        problems.push(`${rel(file)}: no <h2 id="atributos"> section`);
        continue;
      }
      const expected = components.get(entry.component);
      for (const name of expected) if (!listed.has(name)) problems.push(`${rel(file)}: attribute "${name}" from docs/api.md is not documented`);
      for (const name of listed) if (!expected.has(name)) problems.push(`${rel(file)}: attribute "${name}" is not in docs/api.md`);
      documented.add(entry.component);
    }
  }

  await checkCoursePage();
  await checkBlockPages();
  await checkTokensPage();

  const files = [...pages.map((page) => page.file), path.join(ROOT, "index.html")];
  for (const file of files) {
    const content = await readFile(file, "utf8");
    const headings = headingsOf(content);
    const seen = new Set();
    for (const heading of headings) {
      if (seen.has(heading.id)) problems.push(`${rel(file)}: duplicate heading id "${heading.id}"`);
      seen.add(heading.id);
    }
    // Every section (h2) needs an id for "Nesta página"; an h3 without one (e.g. in a card) is not listed.
    const article = content.match(/<article\b[^>]*>([\s\S]*?)<\/article>/);
    for (const match of article ? article[1].matchAll(/<h2(?![^>]*\bid=)[^>]*>([\s\S]*?)<\/h2>/g) : []) {
      problems.push(`${rel(file)}: <h2> "${stripTags(match[1])}" has no id`);
    }
    await checkLinks(file, content, idCache);
  }
  const demos = (await walk(path.join(DOCS, "demos"))).filter((file) => file.endsWith(".html"));
  for (const file of demos) await checkLinks(file, await readFile(file, "utf8"), idCache);

  const pending = Array.from(components.keys()).filter((name) => !documented.has(name));
  if (pending.length) {
    const line = `${pending.length} component(s) without a documentation page: ${pending.join(", ")}`;
    if (strict) problems.push(line);
    else console.log(`pending: ${line}`);
  }

  for (const problem of problems) console.error(`✗ ${problem}`);
  console.log(`${problems.length ? "FAIL" : "ok  "} docs: ${files.length} pages, ${documented.size}/${components.size} components documented`);
  process.exitCode = problems.length ? 1 : 0;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
