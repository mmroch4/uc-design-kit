#!/usr/bin/env node
/**
 * Checks of the site search foundations in uc-kit.js (docs/plan/search-api.md
 * sections 6 to 8, phase S1), in a real browser:
 *
 *   - automatic heading ids: every case of tests/search/slugs.json (shared
 *     with template/uc-site.py), with the kit loaded in <head> and with defer
 *   - the start-up jump to #hash and its .uc-target-flash
 *   - detecting search-index.js: no request without `search`; one HEAD per
 *     visit (sessionStorage), 2xx = yes, 404 or a 5 s timeout = no; the index
 *     path is relative to course.js; over file:// the index is loaded instead
 *   - the header button (placeholder while pending, removed on "no",
 *     search="off"), the shortcuts Ctrl K, ⌘K and "/", UC.search, the
 *     uc:searchready event, uc-search.js loaded on open, unknown index
 *     formats and the stale-index warnings
 *
 * The pages are made up here and served from a fake origin by Playwright, so
 * each check can choose how the server answers.
 *
 * Usage: node scripts/check-search.mjs
 */
import { readFile, mkdtemp, writeFile, rm, mkdir } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ORIGIN = "http://kit.test";
const TYPES = { ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".html": "text/html; charset=utf-8", ".woff2": "font/woff2", ".map": "application/json" };

const INDEX = (fields = {}) =>
  `window.UC_SEARCH_INDEX = ${JSON.stringify({
    v: 1,
    generator: "uc-site.py test",
    generated: "2025-11-20T10:00:00Z",
    course: "T1",
    languages: ["pt"],
    pages: [{ t: "Início", p: "index.html", s: [{ i: "", h: "", x: "Olá", w: "ola" }] }],
    ...fields,
  })};\n`;

/** A page of the fake site. `course` is the UC_COURSE object; `kit` is "/kit/v1/" relative. */
function page({ body = "", course = { title: "T", code: "T1" }, defer = false, depth = 0 } = {}) {
  const up = "../".repeat(depth);
  return `<!doctype html><html lang="pt"><head><meta charset="utf-8"><title>T</title>
<link rel="stylesheet" href="${up}kit/v1/uc-kit.css">
<script>window.UC_COURSE = ${JSON.stringify(course)};</script>
<script src="${up}kit/v1/uc-kit.js"${defer ? " defer" : ""}></script></head>
<body>${body}
<script>window.__authored = Array.from(document.querySelectorAll("uc-page h2, uc-page h3"));</script></body></html>`;
}

let failures = 0;
let passed = 0;
async function test(name, fn) {
  try {
    await fn();
    passed += 1;
    console.log(`ok   ${name}`);
  } catch (error) {
    failures += 1;
    console.log(`FAIL ${name}\n       ✗ ${error.message}`);
  }
}
function equal(actual, expected, what = "value") {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) throw new Error(`${what}: expected ${e}, got ${a}`);
}

/**
 * A browser context serving the fake site: `files` maps paths ("/index.html")
 * to a body, or to { status, body, hang, delay }. /kit/ comes from this checkout.
 * Returns the context and the list of requests (method + path) it saw.
 */
async function site(browser, files, options = {}) {
  const context = await browser.newContext(options);
  const requests = [];
  await context.route(`${ORIGIN}/**`, async (route) => {
    const request = route.request();
    const pathname = decodeURIComponent(new URL(request.url()).pathname);
    requests.push(`${request.method()} ${pathname}`);
    if (pathname.startsWith("/kit/")) {
      try {
        const body = await readFile(path.join(ROOT, pathname));
        return route.fulfill({ status: 200, body, headers: { "Content-Type": TYPES[path.extname(pathname)] || "application/octet-stream" } });
      } catch {
        return route.fulfill({ status: 404, body: "" });
      }
    }
    const entry = files[pathname];
    if (entry === undefined) return route.fulfill({ status: 404, body: "Not found" });
    const { status = 200, body = "", hang = false, delay = 0 } = typeof entry === "string" ? { body: entry } : entry;
    if (hang) return; // never answered: the kit's timeout must give up
    if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
    return route.fulfill({ status, body, headers: { "Content-Type": TYPES[path.extname(pathname)] || "text/html; charset=utf-8" } });
  });
  return { context, requests };
}

/** Opens a page and waits until the kit revealed it. Console warnings and errors are collected. */
async function open(context, url) {
  const tab = await context.newPage();
  const messages = [];
  tab.on("console", (message) => messages.push(`${message.type()}: ${message.text()}`));
  tab.on("pageerror", (error) => messages.push(`pageerror: ${error.message}`));
  await tab.goto(url, { waitUntil: "load" });
  await tab.waitForFunction(() => document.documentElement.classList.contains("uc-visible"), null, { timeout: 5000 });
  return { tab, messages };
}

const headCount = (requests, file = "/search-index.js") => requests.filter((line) => line === `HEAD ${file}`).length;
const buttonState = (tab) =>
  tab.evaluate(() => {
    const button = document.querySelector(".uc-search-button");
    if (!button) return "none";
    return button.classList.contains("uc-search-button--pending") ? "pending" : "shown";
  });
const waitForButton = (tab, state) =>
  tab.waitForFunction(
    (wanted) => {
      const button = document.querySelector(".uc-search-button");
      const now = !button ? "none" : button.classList.contains("uc-search-button--pending") ? "pending" : "shown";
      return now === wanted;
    },
    state,
    { timeout: 8000 },
  );

async function main() {
  const cases = JSON.parse(await readFile(path.join(ROOT, "tests/search/slugs.json"), "utf8"));
  const browser = await chromium.launch();
  try {
    /* ---------- Automatic ids (contract 6) ---------- */
    for (const defer of [false, true]) {
      const files = {};
      cases.forEach((item, n) => {
        files[`/slug-${n}.html`] = page({ defer, body: `<uc-page>${item.html}</uc-page>`, course: { title: "T", languages: item.languages || ["pt"] } });
      });
      const { context } = await site(browser, files);
      for (const [n, item] of cases.entries()) {
        await test(`ids${defer ? " (defer)" : ""}: ${item.about}`, async () => {
          const { tab } = await open(context, `${ORIGIN}/slug-${n}.html`);
          equal(await tab.evaluate(() => window.__authored.map((heading) => heading.id)), item.ids, "ids");
          await tab.close();
        });
      }
      await context.close();
    }

    await test("ids: a file of one language takes its ids from that language", async () => {
      const course = { title: "T", languages: ["pt", "en"], pages: [{ id: "about", href: { pt: "sobre.html", en: "about.html" } }] };
      const body = '<uc-page><h2><span lang="pt">Árvores</span><span lang="en">Trees</span></h2></uc-page>';
      const { context } = await site(browser, { "/about.html": page({ course, body }), "/sobre.html": page({ course, body }) });
      const ids = [];
      for (const file of ["about", "sobre"]) {
        const { tab } = await open(context, `${ORIGIN}/${file}.html`);
        ids.push(await tab.evaluate(() => window.__authored[0].id));
      }
      equal(ids, ["trees", "arvores"], "ids");
      await context.close();
    });

    await test("ids: headings outside <uc-page> get none; <uc-guide> keeps its table of contents", async () => {
      const body = '<h2>Fora</h2><uc-page><uc-guide><h1>Guia</h1><h2>Exercício 1</h2><h2>Exercício 1</h2></uc-guide></uc-page>';
      const { context } = await site(browser, { "/guide.html": page({ body }) });
      const { tab } = await open(context, `${ORIGIN}/guide.html`);
      equal(await tab.evaluate(() => [document.querySelector("body > h2").id, ...Array.from(document.querySelectorAll(".uc-guide__toc-link"), (a) => a.getAttribute("href"))]), ["", "#exercicio-1", "#exercicio-1-2"], "ids and links");
      await context.close();
    });

    /* ---------- #hash after start-up (contract 6, last paragraph) ---------- */
    await test("hash: the target is scrolled to and flashed for 2 s", async () => {
      const body = `<uc-page><div style="height: 3000px"></div><h2>Exercício 2</h2><div style="height: 3000px"></div></uc-page>`;
      const { context } = await site(browser, { "/hash.html": page({ body }) });
      const { tab } = await open(context, `${ORIGIN}/hash.html#exercicio-2`);
      await tab.waitForFunction(() => document.getElementById("exercicio-2").classList.contains("uc-target-flash"), null, { timeout: 2000 });
      const top = await tab.evaluate(() => document.getElementById("exercicio-2").getBoundingClientRect().top);
      if (Math.abs(top) > 2) throw new Error(`the heading is ${top}px from the top`);
      await tab.waitForFunction(() => !document.getElementById("exercicio-2").classList.contains("uc-target-flash"), null, { timeout: 4000 });
      await context.close();
    });

    /* ---------- Detection (contract 7) ---------- */
    const searchCourse = { title: "T", code: "T1", search: true };
    const shell = (attrs = "") => `<uc-page${attrs}><h1>T</h1><p><input id="field" aria-label="campo"></p></uc-page>`;

    await test("off: without search no request and no button", async () => {
      const { context, requests } = await site(browser, { "/index.html": page({ body: shell() }), "/search-index.js": INDEX() });
      const { tab } = await open(context, `${ORIGIN}/index.html`);
      await tab.waitForTimeout(2000);
      equal(requests.filter((line) => /search/.test(line)), [], "search requests");
      equal(await buttonState(tab), "none", "button");
      equal(await tab.evaluate(() => UC.course.search), null, "UC.course.search");
      equal(await tab.evaluate(() => UC.search.available()), false, "available()");
      await context.close();
    });

    await test("config: search true and an object are normalised", async () => {
      const files = {
        "/a.html": page({ course: { title: "T", search: true } }),
        "/b.html": page({ course: { title: "T", search: { index: " dados/i.js ", exclude: ["x/", 3] } } }),
        "/c.html": page({ course: { title: "T", search: "yes" } }),
      };
      const { context } = await site(browser, files);
      const values = [];
      for (const name of ["a", "b", "c"]) {
        const { tab } = await open(context, `${ORIGIN}/${name}.html`);
        values.push(await tab.evaluate(() => UC.course.search));
      }
      equal(values, [{ index: "search-index.js", exclude: [] }, { index: "dados/i.js", exclude: ["x/"] }, null], "UC.course.search");
      await context.close();
    });

    await test("found: one HEAD per visit, button shown, uc:searchready, sessionStorage", async () => {
      const files = { "/index.html": page({ course: searchCourse, body: shell() }), "/other.html": page({ course: searchCourse, body: shell() }), "/search-index.js": INDEX() };
      const { context, requests } = await site(browser, files);
      await context.addInitScript(() => document.addEventListener("uc:searchready", () => (window.__ready = true)));
      const { tab } = await open(context, `${ORIGIN}/index.html`);
      await waitForButton(tab, "shown");
      equal(await tab.evaluate(async () => [window.__ready, sessionStorage.getItem("uc:T1:search"), await UC.search.available()]), [true, "1", true], "event, storage, available()");
      const button = await tab.evaluate(() => {
        const b = document.querySelector(".uc-search-button");
        return [b.textContent, b.getAttribute("aria-haspopup"), b.getAttribute("aria-keyshortcuts"), b.nextElementSibling && b.nextElementSibling.className];
      });
      equal(button, ["PesquisarCtrl K", "dialog", "Control+K Meta+K /", null], "button");
      // The next page of the visit: the button is there at once, no new request, and the event.
      await tab.goto(`${ORIGIN}/other.html`);
      equal(await buttonState(tab), "shown", "button on the next page");
      await tab.waitForFunction(() => window.__ready === true, null, { timeout: 3000 });
      await tab.waitForTimeout(1800);
      equal(headCount(requests), 1, "HEAD requests");
      equal(requests.includes("GET /search-index.js"), false, "index downloaded before opening");
      await context.close();
    });

    await test("missing: placeholder while pending, then no button; 404 remembered", async () => {
      const files = { "/index.html": page({ course: searchCourse, body: shell() }), "/other.html": page({ course: searchCourse, body: shell() }), "/search-index.js": { status: 404, delay: 1500 } };
      const { context, requests } = await site(browser, files);
      const { tab } = await open(context, `${ORIGIN}/index.html`);
      equal(await buttonState(tab), "pending", "button before the answer");
      const hidden = await tab.evaluate(() => getComputedStyle(document.querySelector(".uc-search-button")).visibility);
      equal(hidden, "hidden", "placeholder visibility");
      await waitForButton(tab, "none");
      equal(await tab.evaluate(() => sessionStorage.getItem("uc:T1:search")), "0", "storage");
      await tab.goto(`${ORIGIN}/other.html`);
      equal(await buttonState(tab), "none", "button on the next page");
      await tab.waitForTimeout(1800);
      equal(headCount(requests), 1, "HEAD requests");
      await context.close();
    });

    await test("timeout: no answer within 5 s means no search", async () => {
      const files = { "/index.html": page({ course: searchCourse, body: shell() }), "/search-index.js": { hang: true } };
      const { context } = await site(browser, files);
      const { tab } = await open(context, `${ORIGIN}/index.html`);
      const started = Date.now();
      await waitForButton(tab, "none");
      if (Date.now() - started < 3000) throw new Error("gave up before the timeout");
      equal(await tab.evaluate(() => UC.search.available()), false, "available()");
      await context.close();
    });

    await test("path: the index is relative to course.js, from a page in a subfolder", async () => {
      const course = { title: "T", code: "T1", search: { index: "dados/indice.js" } };
      const files = { "/aulas/a1.html": page({ course, depth: 1, body: shell() }), "/dados/indice.js": INDEX() };
      // course.js is inline here, so the kit resolves against the page: emulate course.js in the root.
      files["/aulas/a1.html"] = files["/aulas/a1.html"].replace(/<script>window\.UC_COURSE = .*?<\/script>/, '<script src="../course.js"></script>');
      files["/course.js"] = `window.UC_COURSE = ${JSON.stringify(course)};`;
      const { context, requests } = await site(browser, files);
      const { tab } = await open(context, `${ORIGIN}/aulas/a1.html`);
      await waitForButton(tab, "shown");
      equal(headCount(requests, "/dados/indice.js"), 1, "HEAD of /dados/indice.js");
      await context.close();
    });

    await test('search="off": no button and no shortcut on that page', async () => {
      const files = { "/index.html": page({ course: searchCourse, body: shell(' search="off"') }), "/search-index.js": INDEX() };
      const { context, requests } = await site(browser, files);
      const { tab } = await open(context, `${ORIGIN}/index.html`);
      await tab.waitForFunction(() => sessionStorage.getItem("uc:T1:search") === "1", null, { timeout: 5000 });
      equal(await buttonState(tab), "none", "button");
      await tab.keyboard.press("Control+k");
      await tab.waitForTimeout(300);
      equal(requests.some((line) => line.includes("uc-search.js")), false, "uc-search.js loaded");
      await context.close();
    });

    await test("open: shortcuts load uc-search.js and the index once; '/' types in fields", async () => {
      const files = { "/index.html": page({ course: searchCourse, body: shell() }), "/search-index.js": INDEX() };
      const { context, requests } = await site(browser, files);
      const { tab } = await open(context, `${ORIGIN}/index.html`);
      await waitForButton(tab, "shown");
      await tab.evaluate(() => {
        window.__opened = [];
        UC.internal.searchUI = { open: (options) => window.__opened.push([options.query, options.index.pages.length]) };
      });
      await tab.focus("#field");
      await tab.keyboard.press("/");
      await tab.waitForTimeout(300);
      equal(await tab.evaluate(() => [window.__opened.length, document.getElementById("field").value]), [0, "/"], "'/' in a field");
      await tab.keyboard.press("Control+k");
      await tab.waitForFunction(() => window.__opened.length === 1, null, { timeout: 3000 });
      await tab.evaluate(() => document.activeElement.blur());
      await tab.keyboard.press("/");
      await tab.keyboard.press("Meta+k");
      await tab.click(".uc-search-button");
      await tab.evaluate(() => UC.search.open("árvore"));
      await tab.waitForFunction(() => window.__opened.length === 5, null, { timeout: 3000 });
      equal(await tab.evaluate(() => window.__opened[4]), ["árvore", 1], "query and index");
      equal(requests.filter((line) => line === "GET /kit/v1/uc-search.js").length, 1, "uc-search.js requests");
      equal(requests.filter((line) => line === "GET /search-index.js").length, 1, "index requests");
      await context.close();
    });

    await test("open: the real uc-search.js registers the search interface", async () => {
      const files = { "/index.html": page({ course: searchCourse, body: shell() }), "/search-index.js": INDEX() };
      const { context } = await site(browser, files);
      const { tab } = await open(context, `${ORIGIN}/index.html`);
      await waitForButton(tab, "shown");
      await tab.evaluate(() => UC.search.open());
      equal(await tab.evaluate(() => typeof (UC.internal.searchUI && UC.internal.searchUI.open)), "function", "searchUI.open");
      await context.close();
    });

    await test("index: an unknown format removes the button; stale and foreign indexes warn", async () => {
      const course = { ...searchCourse, updated: "2025-11-25" };
      const files = {
        "/v2.html": page({ course: searchCourse, body: shell() }),
        "/old.html": page({ course, body: shell() }),
      };
      const contextV2 = await site(browser, { ...files, "/search-index.js": INDEX({ v: 2 }) });
      const v2 = await open(contextV2.context, `${ORIGIN}/v2.html`);
      await waitForButton(v2.tab, "shown");
      await v2.tab.evaluate(() => UC.search.open());
      await waitForButton(v2.tab, "none");
      if (!v2.messages.some((line) => line.startsWith("warning:") && line.includes("not a search index"))) throw new Error("no warning for format 2");
      await contextV2.context.close();

      const contextOld = await site(browser, { ...files, "/search-index.js": INDEX({ course: "OUTRA" }) });
      const old = await open(contextOld.context, `${ORIGIN}/old.html`);
      await waitForButton(old.tab, "shown");
      await old.tab.evaluate(() => UC.search.open());
      await old.tab.waitForTimeout(200);
      const warnings = old.messages.filter((line) => line.startsWith("warning:"));
      if (!warnings.some((line) => line.includes("older than course.js (updated 2025-11-25)"))) throw new Error(`no stale warning in ${JSON.stringify(warnings)}`);
      if (!warnings.some((line) => line.includes('made for "OUTRA"'))) throw new Error(`no course warning in ${JSON.stringify(warnings)}`);
      await contextOld.context.close();
    });

    /* ---------- file:// (contract 7.2, item 4) ---------- */
    await test("file://: the index is loaded at once, no HEAD; without it no button and no error", async () => {
      const dir = await mkdtemp(path.join(os.tmpdir(), "uc-search-"));
      try {
        const kit = pathToFileURL(path.join(ROOT, "kit/v1/")).href;
        for (const [name, withIndex] of [["com", true], ["sem", false]]) {
          await mkdir(path.join(dir, name));
          const html = page({ body: shell() }).replace(/"kit\/v1\//g, `"${kit}`).replace(/<script>window\.UC_COURSE = .*?<\/script>/, '<script src="course.js"></script>');
          await writeFile(path.join(dir, name, "index.html"), html);
          await writeFile(path.join(dir, name, "course.js"), `window.UC_COURSE = ${JSON.stringify(searchCourse)};`);
          if (withIndex) await writeFile(path.join(dir, name, "search-index.js"), INDEX());
        }
        const context = await browser.newContext();
        const withIndex = await open(context, pathToFileURL(path.join(dir, "com/index.html")).href);
        await waitForButton(withIndex.tab, "shown");
        const without = await open(context, pathToFileURL(path.join(dir, "sem/index.html")).href);
        await waitForButton(without.tab, "none");
        const errors = [...withIndex.messages, ...without.messages].filter((line) => line.startsWith("pageerror"));
        equal(errors, [], "page errors");
        await context.close();
      } finally {
        await rm(dir, { recursive: true, force: true });
      }
    });
  } finally {
    await browser.close();
  }
  console.log(`\n${passed}/${passed + failures} search checks passed.`);
  process.exitCode = failures ? 1 : 0;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
