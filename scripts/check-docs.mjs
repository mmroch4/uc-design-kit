#!/usr/bin/env node
/**
 * Checks the documentation site (docs/ and the landing page) without a browser.
 *
 *   - navigation: every page under docs/<lang>/ is in docs/nav.json and every
 *     nav entry exists
 *   - headings: every h2 of an article has an id, and ids are unique ("Nesta página")
 *   - links: local href/src targets exist; #anchors into documentation pages exist
 *   - coverage: a component page's "Atributos" table (h2#atributos) lists exactly
 *     the attributes of that component in docs/api.md, section 3
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
