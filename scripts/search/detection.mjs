/**
 * Detecting search-index.js (docs/architecture/search-api.md 7): the
 * configuration, one HEAD per visit, 404, the timeout, the path relative to
 * course.js, search="off", the shortcuts and UC.search, unknown index formats
 * and stale indexes, and file://.
 */
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { ROOT } from "../lib/server.mjs";
import { INDEX, ORIGIN, SEARCH_COURSE as searchCourse, buttonState, equal, headCount, open, page, shell, site, test, waitForButton } from "./harness.mjs";

export async function detectionChecks(browser) {
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
      // The real uc-search.js assigns UC.internal.searchUI when it loads: keep this stub.
      const stub = { open: (options) => options.load().then((index) => window.__opened.push([options.query, index.pages.length])) };
      Object.defineProperty(UC.internal, "searchUI", { get: () => stub, set() {}, configurable: true });
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
}

/** An unknown index format, and indexes older than course.js or made for another course. */
export async function indexFormatChecks(browser) {
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
}

/** file:// (contract 7.2, item 4). */
export async function fileChecks(browser) {
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
}
