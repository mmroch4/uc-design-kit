/**
 * Documentation for language models (https://llmstxt.org/).
 *
 * A teacher can ask an LLM to build or edit a course site; the model needs
 * the documentation as plain text. From the hand-written pages this writes:
 *
 *   docs/<lang>/**.md   one Markdown file next to every documentation page
 *   llms.txt            index: what the kit is, the rules, a link per page
 *   llms-full.txt       every page in sidebar order, then docs/api.md
 *
 * The Markdown is converted from the page's <article>: headings, prose,
 * lists, tables, code blocks and the code of each live demo. Links point to
 * the published site (Markdown versions for documentation pages). Run by
 * scripts/build.mjs; with --check, out-of-date files fail.
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { ROOT, DOCS, loadNav, navPages } from "./docs.mjs";

export const SITE = "https://uc-design-kit.miguelrocha.dev/";
const RULES_PAGE = "pt/llm.html";
const RULES_ID = "regras";

/* ---------- a small HTML parser (the pages are well-formed, hand-written HTML) ---------- */

const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);
const RAW = new Set(["script", "style", "textarea"]);
const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", hellip: "…", mdash: "—", ndash: "–" };

export function decode(text) {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, name) => {
    if (name[0] === "#") return String.fromCodePoint(name[1].toLowerCase() === "x" ? parseInt(name.slice(2), 16) : Number(name.slice(1)));
    return ENTITIES[name] ?? match;
  });
}

function parseAttributes(text) {
  const attributes = {};
  for (const match of text.matchAll(/([\w:-]+)(?:\s*=\s*"([^"]*)")?/g)) attributes[match[1].toLowerCase()] = decode(match[2] ?? "");
  return attributes;
}

/** Parses HTML into { tag, attributes, children } nodes; text nodes are strings. */
export function parse(html) {
  const root = { tag: "#root", attributes: {}, children: [] };
  const stack = [root];
  const pattern = /<!--[\s\S]*?-->|<\/([a-zA-Z][\w-]*)\s*>|<([a-zA-Z][\w-]*)((?:\s+[^>]*?)?)\s*(\/?)>|[^<]+|</g;
  let match;
  while ((match = pattern.exec(html))) {
    const [token, closing, opening, attributeText, selfClosing] = match;
    const parent = stack[stack.length - 1];
    if (token.startsWith("<!--")) continue;
    if (closing) {
      const tag = closing.toLowerCase();
      const index = stack.map((node) => node.tag).lastIndexOf(tag);
      if (index > 0) stack.length = index;
    } else if (opening) {
      const tag = opening.toLowerCase();
      const node = { tag, attributes: parseAttributes(attributeText || ""), children: [] };
      parent.children.push(node);
      if (RAW.has(tag)) {
        const end = html.indexOf(`</${tag}`, pattern.lastIndex);
        node.children.push(html.slice(pattern.lastIndex, end === -1 ? html.length : end));
        pattern.lastIndex = end === -1 ? html.length : html.indexOf(">", end) + 1;
      } else if (!VOID.has(tag) && !selfClosing) {
        stack.push(node);
      }
    } else {
      parent.children.push(decode(token));
    }
  }
  return root;
}

const hasClass = (node, name) => (node.attributes.class || "").split(/\s+/).includes(name);
const elements = (node) => node.children.filter((child) => typeof child !== "string");
function find(node, test) {
  for (const child of elements(node)) {
    if (test(child)) return child;
    const found = find(child, test);
    if (found) return found;
  }
  return null;
}
/** Text exactly as written (for code). */
function rawText(node) {
  return typeof node === "string" ? node : node.children.map(rawText).join("");
}

/* ---------- Markdown ---------- */

/** Absolute URL for a link found in `file`; documentation pages point to their .md version. */
function resolveUrl(href, file) {
  if (!href || /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(href)) return href;
  if (href.startsWith("#")) return href;
  const [target, hash] = href.split("#");
  let absolute = path.resolve(path.dirname(file), target);
  const relative = path.relative(ROOT, absolute).split(path.sep).join("/");
  const isDoc = absolute.startsWith(DOCS + path.sep) && /^docs\/[a-z]{2}\/.*\.html$/.test(relative);
  const url = SITE + (isDoc ? relative.replace(/\.html$/, ".md") : relative);
  return hash ? `${url}#${hash}` : url;
}

const INLINE_SKIP = new Set(["script", "style", "noscript", "svg", "iframe", "button"]);

/** Inline Markdown of a node's children: text, code, emphasis, links. */
function inline(node, ctx) {
  let out = "";
  for (const child of node.children) {
    if (typeof child === "string") {
      // A tag name written as text ("O <head> de cada página") reads as code.
      out += child.replace(/\s+/g, " ").replace(/<\/?[a-z][\w-]*>/g, "`$&`");
      continue;
    }
    const { tag } = child;
    if (INLINE_SKIP.has(tag) || hasClass(child, "uc-visually-hidden")) continue;
    if (tag === "code" || tag === "kbd") {
      const text = rawText(child).replace(/\s+/g, " ");
      out += text.includes("`") ? `\`\` ${text} \`\`` : `\`${text}\``;
    } else if (tag === "strong" || tag === "b") out += wrap(inline(child, ctx), "**");
    else if (tag === "em" || tag === "i") out += wrap(inline(child, ctx), "*");
    else if (tag === "sup") out += `^${inline(child, ctx)}`;
    else if (tag === "br") out += "\n";
    else if (tag === "a") {
      const text = inline(child, ctx).trim();
      const url = resolveUrl(child.attributes.href, ctx.file);
      out += url ? `[${text}](${url})` : text;
    } else if (tag === "img") {
      // Decorative images (alt="") carry no information.
      if (child.attributes.alt) out += `![${child.attributes.alt}](${resolveUrl(child.attributes.src, ctx.file)})`;
    } else if (hasClass(child, "docs-component__name")) out += `**${inline(child, ctx).trim()}**: `;
    else out += inline(child, ctx);
  }
  return out;
}

function wrap(text, mark) {
  const trimmed = text.trim();
  return trimmed ? `${text.match(/^\s*/)[0]}${mark}${trimmed}${mark}${text.match(/\s*$/)[0]}` : text;
}

const clean = (text) => text.replace(/[ \t]+/g, " ").replace(/ *\n */g, "\n").trim();

function fence(code, lang) {
  const lines = code.replace(/^\n+|\s+$/g, "").split("\n");
  const indent = Math.min(...lines.filter((line) => line.trim()).map((line) => line.match(/^ */)[0].length));
  const body = lines.map((line) => line.slice(Number.isFinite(indent) ? indent : 0)).join("\n");
  const ticks = body.includes("```") ? "````" : "```";
  return `${ticks}${lang || ""}\n${body}\n${ticks}`;
}

const LANGS = { js: "js", javascript: "js", html: "html", css: "css", sh: "sh", bash: "sh", json: "json", java: "java", python: "python", py: "python", text: "text", plaintext: "text" };

function codeBlock(node) {
  const pre = find(node, (child) => child.tag === "pre");
  const lang = LANGS[node.attributes.lang] || node.attributes.lang || "";
  const code = rawText(pre || node);
  const name = node.attributes.filename ? `\`${node.attributes.filename}\`:\n\n` : "";
  return name + fence(code, lang);
}

function table(node, ctx) {
  const rows = [];
  (function collect(parent) {
    for (const child of elements(parent)) {
      if (child.tag === "tr") rows.push(elements(child).filter((cell) => cell.tag === "td" || cell.tag === "th"));
      else if (child.tag !== "caption") collect(child);
    }
  })(node);
  if (!rows.length) return "";
  const cells = rows.map((row) => row.map((cell) => clean(inline(cell, ctx)).replace(/\n/g, " ").replace(/\|/g, "\\|") || " "));
  const width = Math.max(...cells.map((row) => row.length));
  const line = (row) => `| ${Array.from({ length: width }, (_, i) => row[i] ?? " ").join(" | ")} |`;
  return [line(cells[0]), `| ${Array(width).fill("---").join(" | ")} |`, ...cells.slice(1).map(line)].join("\n");
}

function list(node, ctx, depth) {
  const ordered = node.tag === "ol";
  let index = Number(node.attributes.start) || 1;
  const items = [];
  for (const item of elements(node).filter((child) => child.tag === "li")) {
    const marker = ordered ? `${index++}.` : "-";
    const inlineChildren = { ...item, children: item.children.filter((child) => typeof child === "string" || !["ul", "ol", "uc-code", "pre", "div", "p"].includes(child.tag)) };
    const blocks = elements(item).filter((child) => ["ul", "ol", "uc-code", "pre", "div", "p"].includes(child.tag));
    let text = clean(inline(inlineChildren, ctx));
    const inner = blocks.map((child) => (child.tag === "ul" || child.tag === "ol" ? list(child, ctx, depth + 1) : block(child, ctx))).filter(Boolean);
    if (!text && inner.length && !["ul", "ol"].includes(blocks[0].tag)) text = inner.shift();
    const pad = " ".repeat(marker.length + 1);
    const body = [text, ...inner].filter(Boolean).join("\n\n").split("\n").map((line, i) => (i === 0 ? line : line ? pad + line : line)).join("\n");
    items.push(`${marker} ${body}`);
  }
  return items.join("\n");
}

/** Block-level Markdown of one node. */
function block(node, ctx) {
  if (typeof node === "string") return clean(node.replace(/\s+/g, " "));
  const { tag } = node;
  if (INLINE_SKIP.has(tag) || hasClass(node, "docs-badges") || hasClass(node, "docs-demo__open")) return "";
  const heading = tag.match(/^h([1-6])$/);
  if (heading) return `${"#".repeat(Number(heading[1]))} ${clean(inline(node, ctx))}`;
  if (tag === "p") {
    if (hasClass(node, "docs-eyebrow")) return "";
    return clean(inline(node, ctx));
  }
  if (tag === "uc-code") return codeBlock(node);
  if (tag === "pre") return fence(rawText(node), "");
  if (tag === "ul" || tag === "ol") return list(node, ctx, 0);
  if (tag === "table") return table(node, ctx);
  if (tag === "hr") return "---";
  if (tag === "img") return inline({ children: [node] }, ctx);
  if (tag === "dl") {
    return elements(node)
      .map((child) => (child.tag === "dt" ? `**${clean(inline(child, ctx))}**` : `: ${clean(inline(child, ctx))}`))
      .join("\n");
  }
  if (tag === "details") {
    const summary = find(node, (child) => child.tag === "summary");
    const rest = { ...node, children: node.children.filter((child) => child !== summary) };
    return [summary ? `**${clean(inline(summary, ctx))}**` : "", blocks(rest, ctx)].filter(Boolean).join("\n\n");
  }
  if (tag === "figure") {
    const image = find(node, (child) => child.tag === "img");
    const caption = find(node, (child) => child.tag === "figcaption");
    return [image ? inline({ children: [image] }, ctx) : "", caption ? `*${clean(inline(caption, ctx))}*` : ""].filter(Boolean).join("\n\n");
  }
  if (hasClass(node, "docs-demo")) {
    const frame = find(node, (child) => child.tag === "iframe");
    const code = find(node, (child) => child.tag === "uc-code");
    const title = frame ? (frame.attributes.title || "").replace(/^[^:]*:\s*/, "") : "";
    const demo = frame ? resolveUrl(frame.attributes.src, ctx.file) : "";
    return [`Exemplo${title ? ` (${title})` : ""}${demo ? `, [demonstração ao vivo](${demo})` : ""}:`, code ? codeBlock(code) : ""].filter(Boolean).join("\n\n");
  }
  if (hasClass(node, "uc-callout")) {
    return blocks(node, ctx)
      .split("\n")
      .map((line) => (line ? `> ${line}` : ">"))
      .join("\n");
  }
  if (tag === "a") return clean(inline({ children: [node] }, ctx));
  // A container whose children are all inline content is a paragraph.
  const isInline = node.children.every((child) => typeof child === "string" || ["a", "code", "strong", "em", "span", "kbd", "b", "i", "br", "sup", "img"].includes(child.tag));
  if (isInline) return clean(inline(node, ctx));
  return blocks(node, ctx);
}

function blocks(node, ctx) {
  const parts = [];
  let run = { tag: "#run", attributes: {}, children: [] };
  const flush = () => {
    const text = clean(inline(run, ctx));
    if (text) parts.push(text);
    run = { tag: "#run", attributes: {}, children: [] };
  };
  for (const child of node.children) {
    const isInline = typeof child === "string" || ["a", "code", "strong", "em", "span", "kbd", "b", "i", "br", "sup"].includes(child.tag);
    if (isInline) {
      run.children.push(child);
      continue;
    }
    flush();
    const md = block(child, ctx);
    if (md) parts.push(md);
  }
  flush();
  return parts.join("\n\n");
}

/** Markdown of a documentation page: its <article>, with a link to the HTML page. */
export function pageMarkdown(content, file) {
  const article = content.match(/<article\b[^>]*>([\s\S]*?)<\/article>/);
  if (!article) throw new Error(`${file}: no <article>`);
  const tree = parse(article[1]);
  const url = SITE + path.relative(ROOT, file).split(path.sep).join("/");
  let md = blocks(tree, { file });
  // The page's h1 first, then where it lives.
  md = md.replace(/^(# .*)\n/, `$1\n\nFonte: ${url}\n`);
  return `${md.replace(/\n{3,}/g, "\n\n").trim()}\n`;
}

/** Markdown of one section (h2#id up to the next h2) of a page. */
function sectionMarkdown(content, file, id) {
  const section = content.match(new RegExp(`<h2 id="${id}">[\\s\\S]*?(?=<h2\\b|<\\/article>)`));
  if (!section) throw new Error(`${file}: no <h2 id="${id}">`);
  return blocks(parse(section[0].replace(/^<h2[^>]*>[\s\S]*?<\/h2>/, "")), { file }).trim();
}

/* ---------- outputs ---------- */

const LLMS_INTRO = `# UC Design Kit

> A small, dependency-free kit of web components (\`<uc-page>\`, \`<uc-weeks>\`, \`<uc-deadlines>\`…) and CSS for university course ("unidade curricular") websites. Static HTML, CSS and JavaScript: no build step, works from \`file://\`. Content is written in HTML; the values that change every year (dates, team, deadlines, notices) live in one \`course.js\` file. The documentation is in European Portuguese; code, element and attribute names are in English.

To build or edit a course site, read the rules below, then the pages you need. Everything in one file: ${SITE}llms-full.txt. The contract (English): ${SITE}docs/api.md is mirrored at the end of llms-full.txt. A starter site: ${SITE}docs/downloads/uc-template.zip. A complete real site: ${SITE}examples/edados-2526/index.html.
`;

async function render(nav, lang) {
  const files = new Map();
  const pages = [];
  for (const page of navPages(nav, lang)) {
    const file = path.join(DOCS, page.path);
    const content = await readFile(file, "utf8");
    const md = pageMarkdown(content, file);
    const description = decode((content.match(/<meta name="description" content="([^"]*)"/) || [])[1] || "");
    files.set(file.replace(/\.html$/, ".md"), md);
    pages.push({ ...page, md, description, url: SITE + `docs/${page.path.replace(/\.html$/, ".md")}` });
  }
  const rulesFile = path.join(DOCS, RULES_PAGE);
  const rules = sectionMarkdown(await readFile(rulesFile, "utf8"), rulesFile, RULES_ID);

  const index = [LLMS_INTRO, `## Regras\n\n${rules}`];
  for (const group of nav.languages[lang].groups) {
    const lines = pages.filter((page) => page.group === group.title).map((page) => `- [${page.title}](${page.url})${page.description ? `: ${page.description}` : ""}`);
    index.push(`## ${group.title}\n\n${lines.join("\n")}`);
  }
  index.push(`## Optional\n\n- [Contrato da API (docs/api.md, inglês)](${SITE}docs/api.md): the normative list of components, attributes, course.js fields, tokens and the JavaScript API.\n- [Exemplo completo: Estruturas de Dados 2025/26](https://github.com/mmroch4/uc-design-kit/tree/main/examples/edados-2526): source of a real course site.`);
  files.set(path.join(ROOT, "llms.txt"), `${index.join("\n\n")}\n`);

  const api = await readFile(path.join(DOCS, "api.md"), "utf8");
  const full = [
    LLMS_INTRO,
    `## Regras\n\n${rules}`,
    ...pages.map((page) => `<!-- ${page.url} -->\n\n${page.md.trim()}`),
    `<!-- ${SITE}docs/api.md -->\n\n${api.trim()}`,
  ];
  files.set(path.join(ROOT, "llms-full.txt"), `${full.join("\n\n---\n\n")}\n`);
  return files;
}

/** Writes the .md pages, llms.txt and llms-full.txt. Returns the number of out-of-date files in check mode. */
export async function buildLlms({ check = false } = {}) {
  const nav = await loadNav();
  let problems = 0;
  // One language for now: llms.txt describes the Portuguese documentation.
  const files = await render(nav, "pt");
  for (const [file, content] of files) {
    const previous = await readFile(file, "utf8").catch(() => null);
    if (previous === content) continue;
    const name = path.relative(ROOT, file).split(path.sep).join("/");
    if (check) {
      console.error(`${name} is out of date. Run: npm run build`);
      problems += 1;
    } else {
      await writeFile(file, content);
      if (!name.startsWith("docs/pt/")) console.log(`wrote ${name} (${(content.length / 1024).toFixed(1)} KB)`);
    }
  }
  return problems;
}
