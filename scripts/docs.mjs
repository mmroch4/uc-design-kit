/**
 * Fills the generated parts of the documentation pages (docs/<lang>/**.html)
 * and of the landing page (index.html). The pages are hand-written HTML; the
 * parts that would otherwise be copied between pages live between markers and
 * are rewritten here from docs/nav.json and the demo files:
 *
 *   <!-- docs:header -->  … <!-- /docs:header -->   top bar (every page)
 *   <!-- docs:sidebar --> … <!-- /docs:sidebar -->  section navigation
 *   <!-- docs:toc -->     … <!-- /docs:toc -->      "Nesta página", from the article's h2/h3
 *   <!-- docs:pager -->   … <!-- /docs:pager -->    previous / next and "edit on GitHub"
 *   <!-- docs:demo src="../../demos/x/y.html" title="…" height="240" -->
 *     … <!-- /docs:demo -->                         live demo (iframe) + its code
 *
 * The code of a demo is the part of the demo file between <!-- demo:start -->
 * and <!-- demo:end -->, so the code shown is always the code that runs.
 * The output is committed, so the site needs no build step and works from
 * file://. Run by scripts/build.mjs; with --check, out-of-date pages fail.
 */
import { readFile, writeFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const DOCS = path.join(ROOT, "docs");
const LANDING = path.join(ROOT, "index.html");
const DEMO_START = "<!-- demo:start -->";
const DEMO_END = "<!-- demo:end -->";

/* ---------- helpers ---------- */

const toPosix = (file) => file.split(path.sep).join("/");

export function escapeHtml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function stripTags(html) {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

/** Link from the page `from` to the file `to` (both absolute paths). */
function href(from, to) {
  return toPosix(path.relative(path.dirname(from), to));
}

function parseAttributes(text) {
  const attributes = {};
  for (const match of text.matchAll(/([\w-]+)="([^"]*)"/g)) attributes[match[1]] = match[2];
  return attributes;
}

/** Removes the indentation common to every non-empty line. */
function dedent(lines) {
  const indents = lines.filter((line) => line.trim()).map((line) => line.match(/^ */)[0].length);
  const common = indents.length ? Math.min(...indents) : 0;
  return lines.map((line) => line.slice(common));
}

/** Indents every line except those inside a <pre> (whose spaces are content). */
function indentBlock(html, indent) {
  let inPre = false;
  return html
    .split("\n")
    .map((line) => {
      const out = line && !inPre ? indent + line : line;
      const opens = (line.match(/<pre\b/g) || []).length;
      const closes = (line.match(/<\/pre>/g) || []).length;
      if (opens !== closes) inPre = opens > closes;
      return out;
    })
    .join("\n");
}

export async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  const files = await Promise.all(
    entries.map((entry) => {
      const full = path.join(dir, entry.name);
      return entry.isDirectory() ? walk(full) : [full];
    }),
  );
  return files.flat();
}

/* ---------- navigation ---------- */

export async function loadNav() {
  return JSON.parse(await readFile(path.join(DOCS, "nav.json"), "utf8"));
}

/** Flat list of the pages of one language, in sidebar order. */
export function navPages(nav, lang) {
  return nav.languages[lang].groups.flatMap((group) => group.pages.map((page) => ({ ...page, group: group.title })));
}

/** Every documentation page on disk, with its language: docs/<lang>/**.html. */
export async function listDocPages(nav) {
  const pages = [];
  for (const lang of Object.keys(nav.languages)) {
    for (const file of await walk(path.join(DOCS, lang))) {
      if (file.endsWith(".html")) pages.push({ file, lang });
    }
  }
  return pages.sort((a, b) => a.file.localeCompare(b.file));
}

/* ---------- icons ---------- */

const ICONS = {
  logo:
    '<svg class="docs-brand__mark" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
    '<rect width="24" height="24" rx="6" fill="currentColor"/>' +
    '<path d="M7 8h10M7 12h10M7 16h6" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>',
  github:
    '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.7 5.4-5.26 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z"/></svg>',
  menu:
    '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  arrowLeft:
    '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false"><path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  arrowRight:
    '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};

/* ---------- generators ---------- */

function pageTitle(page) {
  return page.code ? `<code>${escapeHtml(page.title)}</code>` : escapeHtml(page.title);
}

function header(ctx) {
  const { file, labels, nav, lang, hasSidebar } = ctx;
  const docsHome = path.join(DOCS, nav.languages[lang].home);
  const inDocs = file.startsWith(DOCS + path.sep);
  return [
    `<a class="docs-skip" href="#content">${labels.skip}</a>`,
    `<header class="docs-header">`,
    `  <div class="docs-header__inner">`,
    hasSidebar
      ? `    <button class="docs-header__menu" type="button" aria-expanded="false" aria-controls="docs-sidebar" hidden>${ICONS.menu}<span class="uc-visually-hidden">${labels.menu}</span></button>`
      : null,
    `    <a class="docs-brand" href="${href(file, LANDING)}">${ICONS.logo}<span>UC Design Kit</span></a>`,
    `    <nav class="docs-header__nav" aria-label="Principal">`,
    `      <a href="${href(file, docsHome)}"${inDocs ? ' aria-current="true"' : ""}>${labels.docs}</a>`,
    `      <a href="${href(file, path.join(ROOT, "examples/edados-2526/index.html"))}">${labels.example}</a>`,
    `      <a class="docs-header__icon" href="${nav.repository}">${ICONS.github}<span class="uc-visually-hidden">GitHub</span></a>`,
    `    </nav>`,
    `  </div>`,
    `</header>`,
  ]
    .filter((line) => line !== null)
    .join("\n");
}

function sidebar(ctx) {
  const { file, nav, lang, labels } = ctx;
  const lines = [`<nav class="docs-sidebar" id="docs-sidebar" aria-label="${labels.sections}">`];
  nav.languages[lang].groups.forEach((group, index) => {
    const id = `docs-nav-${index + 1}`;
    lines.push(`  <div class="docs-sidebar__group">`);
    lines.push(`    <p class="docs-sidebar__title" id="${id}">${escapeHtml(group.title)}</p>`);
    lines.push(`    <ul class="docs-sidebar__list" aria-labelledby="${id}">`);
    for (const page of group.pages) {
      const target = path.join(DOCS, page.path);
      const current = target === file ? ' aria-current="page"' : "";
      lines.push(`      <li><a href="${href(file, target)}"${current}>${pageTitle(page)}</a></li>`);
    }
    lines.push(`    </ul>`);
    lines.push(`  </div>`);
  });
  lines.push(`</nav>`);
  return lines.join("\n");
}

/** The article's h2/h3 headings that have an id, in order. */
export function headingsOf(content) {
  const article = content.match(/<article\b[^>]*>([\s\S]*?)<\/article>/);
  if (!article) return [];
  // Demo blocks are generated and contain no headings; skip them anyway.
  const body = article[1].replace(/<!-- docs:demo[\s\S]*?<!-- \/docs:demo -->/g, "");
  return Array.from(body.matchAll(/<h([23])\b[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/g), (match) => ({
    level: Number(match[1]),
    id: match[2],
    text: stripTags(match[3]),
  }));
}

function toc(ctx) {
  const { content, labels } = ctx;
  const lines = [
    `<nav class="docs-toc" aria-labelledby="docs-toc-title">`,
    `  <p class="docs-toc__title" id="docs-toc-title">${labels.onThisPage}</p>`,
    `  <ul class="docs-toc__list">`,
  ];
  for (const heading of headingsOf(content)) {
    const nested = heading.level === 3 ? ' class="docs-toc__sub"' : "";
    lines.push(`    <li${nested}><a href="#${heading.id}">${escapeHtml(heading.text)}</a></li>`);
  }
  lines.push(`  </ul>`, `</nav>`);
  return lines.join("\n");
}

function pager(ctx) {
  const { file, nav, lang, labels } = ctx;
  const pages = navPages(nav, lang);
  const index = pages.findIndex((page) => path.join(DOCS, page.path) === file);
  const previous = index > 0 ? pages[index - 1] : null;
  const next = index >= 0 && index < pages.length - 1 ? pages[index + 1] : null;
  const link = (page, kind) => {
    const icon = kind === "previous" ? ICONS.arrowLeft : ICONS.arrowRight;
    return [
      `  <a class="docs-pager__link docs-pager__link--${kind}" href="${href(file, path.join(DOCS, page.path))}" rel="${kind === "previous" ? "prev" : "next"}">`,
      `    <span class="docs-pager__label">${kind === "previous" ? icon : ""}${labels[kind]}${kind === "next" ? icon : ""}</span>`,
      `    <span class="docs-pager__title">${pageTitle(page)}</span>`,
      `  </a>`,
    ].join("\n");
  };
  const editUrl = `${nav.repository}/edit/main/${toPosix(path.relative(ROOT, file))}`;
  return [
    `<footer class="docs-footer">`,
    `  <nav class="docs-pager" aria-label="${labels.previous} / ${labels.next}">`,
    previous ? indentBlock(link(previous, "previous"), "  ") : null,
    next ? indentBlock(link(next, "next"), "  ") : null,
    `  </nav>`,
    `  <p class="docs-footer__edit"><a href="${editUrl}">${labels.edit}</a></p>`,
    `</footer>`,
  ]
    .filter((line) => line !== null)
    .join("\n");
}

/** The code between <!-- demo:start --> and <!-- demo:end --> (several pairs are joined). */
export function demoSnippet(source, name) {
  const parts = [];
  let rest = source;
  for (;;) {
    const start = rest.indexOf(DEMO_START);
    if (start === -1) break;
    const end = rest.indexOf(DEMO_END, start);
    if (end === -1) throw new Error(`${name}: ${DEMO_START} without ${DEMO_END}`);
    const lines = rest.slice(start + DEMO_START.length, end).split("\n").slice(1, -1);
    parts.push(dedent(lines).join("\n").trimEnd());
    rest = rest.slice(end + DEMO_END.length);
  }
  if (!parts.length) throw new Error(`${name}: no ${DEMO_START} … ${DEMO_END} block`);
  return parts.join("\n\n");
}

async function demo(ctx, attributes) {
  const { file, labels } = ctx;
  if (!attributes.src || !attributes.title) throw new Error(`${toPosix(path.relative(ROOT, file))}: docs:demo needs src and title`);
  const [demoPath] = attributes.src.split(/[?#]/);
  const demoFile = path.resolve(path.dirname(file), demoPath);
  const snippet = demoSnippet(await readFile(demoFile, "utf8"), toPosix(path.relative(ROOT, demoFile)));
  const id = `demo-${toPosix(path.relative(path.join(DOCS, "demos"), demoFile)).replace(/\.html$/, "").replace(/[^a-z0-9]+/gi, "-")}`;
  const height = Number(attributes.height) || 200;
  return [
    `<div class="docs-demo" id="${id}">`,
    `  <div class="docs-demo__panel docs-demo__panel--preview" data-label="${labels.preview}">`,
    `    <iframe class="docs-demo__frame" src="${escapeHtml(attributes.src)}" title="${labels.demo}: ${escapeHtml(attributes.title)}" loading="lazy" style="height: ${height}px"></iframe>`,
    `  </div>`,
    `  <div class="docs-demo__panel docs-demo__panel--code" data-label="${labels.code}">`,
    `    <uc-code lang="html" no-download><pre><code>${escapeHtml(snippet)}</code></pre></uc-code>`,
    `  </div>`,
    `  <a class="docs-demo__open" href="${escapeHtml(attributes.src)}">${labels.openDemo}</a>`,
    `</div>`,
  ].join("\n");
}

const GENERATORS = { header, sidebar, toc, pager, demo };

/* ---------- page filling ---------- */

const REGION = /^([ \t]*)<!-- docs:([a-z]+)((?:\s+[\w-]+="[^"]*")*) -->\n[\s\S]*?^\1<!-- \/docs:\2 -->/gm;

/** Returns the page with every generated region rewritten. */
export async function fillPage(content, ctx) {
  const regions = Array.from(content.matchAll(REGION));
  let out = "";
  let last = 0;
  for (const match of regions) {
    const [whole, indent, name, attributeText] = match;
    const generate = GENERATORS[name];
    if (!generate) throw new Error(`${toPosix(path.relative(ROOT, ctx.file))}: unknown region docs:${name}`);
    const body = await generate({ ...ctx, content }, parseAttributes(attributeText));
    out += content.slice(last, match.index);
    out += `${indent}<!-- docs:${name}${attributeText} -->\n${indentBlock(body, indent)}\n${indent}<!-- /docs:${name} -->`;
    last = match.index + whole.length;
  }
  return out + content.slice(last);
}

/**
 * Rewrites the generated regions of every documentation page and of the
 * landing page. Returns the number of problems (out-of-date files in check mode).
 */
export async function buildDocs({ check = false } = {}) {
  const nav = await loadNav();
  const targets = (await listDocPages(nav)).map(({ file, lang }) => ({ file, lang }));
  targets.push({ file: LANDING, lang: "pt" });
  let problems = 0;
  for (const { file, lang } of targets) {
    const content = await readFile(file, "utf8");
    const ctx = {
      file,
      lang,
      nav,
      labels: nav.languages[lang].labels,
      hasSidebar: /<!-- docs:sidebar -->/.test(content),
    };
    const filled = await fillPage(content, ctx);
    if (filled === content) continue;
    const name = toPosix(path.relative(ROOT, file));
    if (check) {
      console.error(`${name} is out of date. Run: npm run build`);
      problems += 1;
    } else {
      await writeFile(file, filled);
      console.log(`wrote ${name}`);
    }
  }
  return problems;
}
