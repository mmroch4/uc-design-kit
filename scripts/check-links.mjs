#!/usr/bin/env node
/**
 * External link checker (maintainers, not teachers).
 *
 * Collects the external links (http/https) of the HTML pages and course.js
 * files under examples/, template/ and docs/, and requests each one once.
 * A link is broken when the server answers 404, 410 or another 4xx/5xx
 * that a GET confirms, or does not answer at all. Skipped:
 *   - links with data-auth (they answer with a login page),
 *   - paths with evaluation/ (student data, never requested),
 *   - mailto:, reserved example domains (example.org, example.com…),
 *     localhost and the generated "Editar no GitHub" links of the docs.
 * Requests to one host are spaced one per second (the DCC server blocks
 * bursts); different hosts are checked in parallel.
 *
 * Runs weekly in GitHub Actions (.github/workflows/links.yml), never on pull
 * requests: the workflow turns the report into one issue labelled
 * "broken-links". Teachers, who have no npm, use the W3C Link Checker (see
 * the "Publicar" documentation page).
 *
 * Usage: node scripts/check-links.mjs [--list] [--report FILE] [filter ...]
 *   --list         only print the links that would be checked
 *   --report FILE  write the Markdown report of broken links to FILE
 *   filter         substrings of the source file paths to keep
 * Exit code 1 when a link is broken.
 */
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIRS = ["examples", "template", "docs"];
const IGNORED_DIRS = new Set(["node_modules", ".git", "screenshots", "downloads"]);
const SKIPPED_HOSTS = /(^|\.)(example\.(org|com|net)|localhost|127\.0\.0\.1)$/i;
const HOST_INTERVAL_MS = 1000;
const TIMEOUT_MS = 20000;
const USER_AGENT = "uc-design-kit-link-checker (+https://github.com/mmroch4/uc-design-kit)";

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true }).catch(() => [])) {
    if (IGNORED_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else if (/\.html$|(^|[\\/])course\.js$|editions\.js$/.test(full)) out.push(full);
  }
  return out;
}

/** External URLs of one file: `href="…"` of <a> without data-auth, and quoted URLs in .js. */
function extract(text, file) {
  const urls = [];
  if (file.endsWith(".html")) {
    // Code samples show markup as text (&lt;a …&gt;), so only real tags match.
    for (const match of text.matchAll(/<a\b[^>]*>/gi)) {
      const tag = match[0];
      if (/\sdata-auth\b/i.test(tag)) continue;
      const href = /\shref\s*=\s*"([^"]*)"/i.exec(tag) || /\shref\s*=\s*'([^']*)'/i.exec(tag);
      if (href) urls.push(href[1].replace(/&amp;/g, "&"));
    }
  } else {
    for (const match of text.matchAll(/["'`](https?:\/\/[^"'`\s]+)["'`]/g)) {
      // A URL inside HTMLText with data-auth is skipped too.
      const before = text.slice(Math.max(0, match.index - 200), match.index);
      if (/<a\b[^>]*data-auth[^>]*$/i.test(before)) continue;
      urls.push(match[1]);
    }
  }
  return urls.filter((url) => {
    if (!/^https?:\/\//i.test(url)) return false;
    try {
      const parsed = new URL(url);
      // "Edit this page" links of the documentation are generated from the file paths.
      if (/^\/mmroch4\/uc-design-kit\/edit\//.test(parsed.pathname)) return false;
      return !SKIPPED_HOSTS.test(parsed.hostname) && !/(^|\/)evaluation\//.test(parsed.pathname);
    } catch {
      return false;
    }
  });
}

async function collect(filters) {
  const links = new Map(); // url (without #fragment) → Set of source files
  for (const dir of DIRS) {
    for (const file of await walk(path.join(ROOT, dir))) {
      const relative = path.relative(ROOT, file).split(path.sep).join("/");
      if (filters.length && !filters.some((filter) => relative.includes(filter))) continue;
      for (const url of extract(await readFile(file, "utf8"), file)) {
        const key = url.split("#")[0];
        if (!links.has(key)) links.set(key, new Set());
        links.get(key).add(relative);
      }
    }
  }
  return links;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function request(url, method) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, { method, redirect: "follow", signal: controller.signal, headers: { "User-Agent": USER_AGENT, Accept: "*/*" } });
    if (method === "GET") response.body?.cancel().catch(() => {});
    return { status: response.status };
  } catch (error) {
    return { status: 0, error: error.name === "AbortError" ? "timeout" : error.cause?.code || error.message };
  } finally {
    clearTimeout(timer);
  }
}

/** HEAD first; servers that refuse or mishandle HEAD get a GET. */
async function check(url) {
  const head = await request(url, "HEAD");
  if (head.status >= 200 && head.status < 400) return head;
  await sleep(HOST_INTERVAL_MS);
  return request(url, "GET");
}

/** 401/403/429 mean "reachable, but not for a robot": reported apart, not as broken. */
const isBroken = (result) => result.status === 0 || (result.status >= 400 && ![401, 403, 429].includes(result.status));

async function main() {
  const args = process.argv.slice(2);
  const reportIndex = args.indexOf("--report");
  const report = reportIndex >= 0 ? args[reportIndex + 1] : null;
  const filters = args.filter((arg, index) => !arg.startsWith("--") && index !== reportIndex + 1);
  const links = await collect(filters);

  if (args.includes("--list")) {
    for (const [url, files] of links) console.log(`${url}  (${[...files].join(", ")})`);
    console.log(`\n${links.size} external links.`);
    return;
  }

  // One queue per host, run in parallel; one request per second within a host.
  const byHost = new Map();
  for (const url of links.keys()) {
    const host = new URL(url).host;
    if (!byHost.has(host)) byHost.set(host, []);
    byHost.get(host).push(url);
  }
  const results = new Map();
  await Promise.all(
    [...byHost.values()].map(async (urls) => {
      for (const [index, url] of urls.entries()) {
        if (index) await sleep(HOST_INTERVAL_MS);
        const result = await check(url);
        results.set(url, result);
        console.log(`${isBroken(result) ? "FAIL" : result.status >= 400 ? "warn" : "ok  "} ${result.status || result.error} ${url}`);
      }
    }),
  );

  const broken = [...results].filter(([, result]) => isBroken(result));
  const blocked = [...results].filter(([, result]) => !isBroken(result) && result.status >= 400);
  console.log(`\n${links.size - broken.length}/${links.size} external links answered (${blocked.length} refused the robot).`);

  if (report) {
    const line = ([url, result]) => `- ${url} — ${result.status || result.error}\n  ${[...links.get(url)].map((file) => `\`${file}\``).join(", ")}`;
    const text = [
      `The weekly link check found **${broken.length}** broken external link${broken.length === 1 ? "" : "s"} (of ${links.size}).`,
      "",
      ...broken.map(line),
      "",
      blocked.length ? `Answered but refused the robot (check by hand if in doubt):\n\n${blocked.map(line).join("\n")}\n` : "",
      "_Generated by `scripts/check-links.mjs`. Links with `data-auth` and `evaluation/` paths are not checked._",
    ].join("\n");
    await writeFile(report, text);
  }
  process.exitCode = broken.length ? 1 : 0;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
