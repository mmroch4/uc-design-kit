/**
 * The fake site of the search checks: pages made up here and served from a
 * fake origin by Playwright, so each check can choose how the server answers,
 * plus the small test runner (test, equal) and the header-button helpers.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ROOT, contentType } from "../lib/server.mjs";

export const ORIGIN = "http://kit.test";

export const INDEX = (fields = {}) =>
  `window.UC_SEARCH_INDEX = ${JSON.stringify({
    v: 1,
    generator: "uc-site.py test",
    generated: "2025-11-20T10:00:00Z",
    course: "T1",
    languages: ["pt"],
    pages: [{ t: "Início", p: "index.html", s: [{ i: "", h: "", x: "Olá", w: "ola" }] }],
    ...fields,
  })};\n`;

/** An index with enough pages to rank, filter by language and scope. */
export const RICH_INDEX = (fields = {}) =>
  INDEX({
    languages: ["pt", "en"],
    pages: [
      { t: "Início", p: "index.html", g: "home", s: [{ i: "", h: "", x: "Bem-vindo à cadeira.", w: "bem-vindo cadeira" }, { i: "heaps", h: "Heaps e filas", x: "Uma heap guarda a árvore num vetor.", w: "heap guarda arvore vetor" }] },
      { t: "Árvores", p: "arvores.html", s: [{ i: "", h: "", x: "Texto sobre árvores.", w: "texto arvores" }, { i: "avl", h: "Árvores AVL", x: "Rotações.", w: "rotacoes" }] },
      { t: "Trees", p: "trees.html", l: "en", s: [{ i: "", h: "", x: "Trees in English.", w: "trees english" }] },
      { t: "Árvores (pt)", p: "so-pt.html", l: "pt", s: [{ i: "", h: "", x: "Só em português.", w: "portugues arvores" }] },
      ...Array.from({ length: 14 }, (_, n) => ({ t: `Problema ${n + 1}`, p: `problemas/p${n + 1}.html`, s: [{ i: "", h: "", x: `Enunciado do problema ${n + 1} sobre listas.`, w: `enunciado problema ${n + 1} listas` }] })),
    ],
    ...fields,
  });

/** The course of a site with search on, and a page shell with a heading and a text field. */
export const SEARCH_COURSE = { title: "T", code: "T1", search: true };
export const shell = (attrs = "") => `<uc-page${attrs}><h1>T</h1><p><input id="field" aria-label="campo"></p></uc-page>`;

/** A page of the fake site. `course` is the UC_COURSE object; `kit` is "/kit/v1/" relative. */
export function page({ body = "", course = { title: "T", code: "T1" }, defer = false, depth = 0 } = {}) {
  const up = "../".repeat(depth);
  return `<!doctype html><html lang="pt"><head><meta charset="utf-8"><title>T</title>
<link rel="stylesheet" href="${up}kit/v1/uc-kit.css">
<script>window.UC_COURSE = ${JSON.stringify(course)};</script>
<script src="${up}kit/v1/uc-kit.js"${defer ? " defer" : ""}></script></head>
<body>${body}
<script>window.__authored = Array.from(document.querySelectorAll("uc-page h2, uc-page h3"));</script></body></html>`;
}

const results = { passed: 0, failures: 0 };

/** Runs one named check and prints "ok" or "FAIL" with the error. */
export async function test(name, fn) {
  try {
    await fn();
    results.passed += 1;
    console.log(`ok   ${name}`);
  } catch (error) {
    results.failures += 1;
    console.log(`FAIL ${name}\n       ✗ ${error.message}`);
  }
}

/** The number of checks that passed and failed so far. */
export const summary = () => ({ ...results });

export function equal(actual, expected, what = "value") {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) throw new Error(`${what}: expected ${e}, got ${a}`);
}

/**
 * A browser context serving the fake site: `files` maps paths ("/index.html")
 * to a body, or to { status, body, hang, delay }. /kit/ comes from this checkout.
 * Returns the context and the list of requests (method + path) it saw.
 */
export async function site(browser, files, options = {}) {
  const context = await browser.newContext(options);
  const requests = [];
  await context.route(`${ORIGIN}/**`, async (route) => {
    const request = route.request();
    const pathname = decodeURIComponent(new URL(request.url()).pathname);
    requests.push(`${request.method()} ${pathname}`);
    if (pathname.startsWith("/kit/")) {
      try {
        const body = await readFile(path.join(ROOT, pathname));
        return route.fulfill({ status: 200, body, headers: { "Content-Type": contentType(pathname) } });
      } catch {
        return route.fulfill({ status: 404, body: "" });
      }
    }
    const entry = files[pathname];
    if (entry === undefined) return route.fulfill({ status: 404, body: "Not found" });
    const { status = 200, body = "", hang = false, delay = 0 } = typeof entry === "string" ? { body: entry } : entry;
    if (hang) return; // never answered: the kit's timeout must give up
    if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
    return route.fulfill({ status, body, headers: { "Content-Type": path.extname(pathname) ? contentType(pathname) : "text/html; charset=utf-8" } });
  });
  return { context, requests };
}

/** Opens a page and waits until the kit revealed it. Console warnings and errors are collected. */
export async function open(context, url) {
  const tab = await context.newPage();
  const messages = [];
  tab.on("console", (message) => messages.push(`${message.type()}: ${message.text()}`));
  tab.on("pageerror", (error) => messages.push(`pageerror: ${error.message}`));
  await tab.goto(url, { waitUntil: "load" });
  await tab.waitForFunction(() => document.documentElement.classList.contains("uc-visible"), null, { timeout: 5000 });
  return { tab, messages };
}

export const headCount = (requests, file = "/search-index.js") => requests.filter((line) => line === `HEAD ${file}`).length;
export const buttonState = (tab) =>
  tab.evaluate(() => {
    const button = document.querySelector(".uc-search-button");
    if (!button) return "none";
    return button.classList.contains("uc-search-button--pending") ? "pending" : "shown";
  });
export const waitForButton = (tab, state) =>
  tab.waitForFunction(
    (wanted) => {
      const button = document.querySelector(".uc-search-button");
      const now = !button ? "none" : button.classList.contains("uc-search-button--pending") ? "pending" : "shown";
      return now === wanted;
    },
    state,
    { timeout: 8000 },
  );
