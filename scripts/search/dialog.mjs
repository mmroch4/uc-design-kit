/** The search engine, the dialog and <uc-search> (docs/architecture/search-api.md 7.3, 8.2, 9, 10). */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ROOT } from "../lib/server.mjs";
import { ORIGIN, RICH_INDEX, SEARCH_COURSE as searchCourse, equal, open, page, shell, site, test, waitForButton } from "./harness.mjs";

export async function dialogChecks(browser) {
  const words = JSON.parse(await readFile(path.join(ROOT, "tests/search/words.json"), "utf8"));
  const course = {
    ...searchCourse,
    languages: ["pt", "en"],
    deadlines: [{ id: "t1", title: { pt: "Teste de árvores", en: "Trees test" }, date: "2025-11-05", kind: "assessment", url: "arvores.html#avl" }],
    notices: [
      { date: "2025-10-01", text: "Aulas de <a href=\"heaps.html\">heaps</a> mudam de sala." },
      { date: "2099-01-01", text: "Aviso futuro sobre heaps." },
    ],
  };
  const files = (extra = {}) => ({
    "/index.html": page({ course, body: shell() }),
    "/arvores.html": page({ course, body: '<uc-page><h1>Árvores</h1><div style="height:2000px"></div><details><summary>Mais</summary><h2 id="avl">Árvores AVL</h2></details></uc-page>' }),
    "/scoped.html": page({ course, body: '<uc-page><h1>Problemas</h1><uc-search scope="problemas/" limit="3" label="Pesquisar nos problemas"></uc-search></uc-page>' }),
    "/search-index.js": RICH_INDEX(),
    ...extra,
  });
  const state = (tab) =>
    tab.evaluate(() => {
      const dialog = document.querySelector(".uc-search-dialog");
      const input = dialog && dialog.querySelector("input");
      return {
        open: Boolean(dialog && dialog.open),
        status: dialog ? dialog.querySelector("[role='status']").textContent : null,
        groups: dialog ? Array.from(dialog.querySelectorAll("[role='group']"), (group) => document.getElementById(group.getAttribute("aria-labelledby")).textContent) : [],
        titles: dialog ? Array.from(dialog.querySelectorAll(".uc-search__title"), (node) => node.textContent) : [],
        active: input && input.getAttribute("aria-activedescendant") ? document.getElementById(input.getAttribute("aria-activedescendant")).querySelector(".uc-search__title").textContent : null,
        expanded: input ? input.getAttribute("aria-expanded") : null,
      };
    });
  const type = async (tab, text) => {
    await tab.fill(".uc-search-dialog input", text);
    await tab.waitForTimeout(50);
  };

  await test("words: tests/search/words.json (cases and stop words) as in uc-site.py", async () => {
    const { context } = await site(browser, files());
    const { tab } = await open(context, `${ORIGIN}/index.html`);
    await waitForButton(tab, "shown");
    await tab.evaluate(() => UC.search.open());
    await tab.waitForFunction(() => UC.internal.searchEngine);
    const result = await tab.evaluate((data) => {
      const engine = UC.internal.searchEngine;
      return {
        cases: data.cases.map((item) => engine.words(item.text).join(" ")),
        stop: [...engine.stopWords].sort(),
      };
    }, words);
    equal(result.cases, words.cases.map((item) => item.words), "words");
    equal(result.stop, [...words.stopWords].sort(), "stop words");
    await context.close();
  });

  await test("engine: prefix, one typo from 5 letters, every term, ranking, language, scope, limit", async () => {
    const { context } = await site(browser, files());
    const { tab } = await open(context, `${ORIGIN}/index.html`);
    await waitForButton(tab, "shown");
    await tab.evaluate(() => UC.search.open());
    await tab.waitForFunction(() => UC.internal.searchEngine && window.UC_SEARCH_INDEX);
    const titles = (query, options) =>
      tab.evaluate(([q, o]) => UC.internal.searchEngine.search(window.UC_SEARCH_INDEX, q, o).groups.flatMap((group) => group.results.map((result) => result.title)), [query, options]);
    const arv = await titles("arv");
    equal([arv[0], arv.includes("Teste de árvores"), arv[arv.length - 1]], ["Árvores", true, "Heaps e filas"], "title and heading first, text last; deadlines searched");
    equal(await titles("arvroe avl"), ["Árvores AVL"], "typo and every term");
    equal(await titles("arv avl xyz"), [], "a missing term");
    equal(await titles("hep"), [], "no typo under 5 letters");
    equal((await titles("heaps")).includes("Aulas de heaps mudam de sala."), true, "past notice");
    equal((await titles("futuro")).length, 0, "future notice hidden");
    equal((await titles("trees")).length, 0, "English page in Portuguese");
    equal((await titles("portugues")), ["Árvores (pt)"], "Portuguese page");
    equal(await titles("problema", { scope: "problemas/", limit: 3 }), ["Problema 1", "Problema 2", "Problema 3"], "scope and limit");
    equal((await titles("problema")).length, 14, "no limit under 50");
    await tab.evaluate(() => UC.setLanguage("en"));
    equal((await titles("trees")).slice(0, 2), ["Trees", "Trees test"], "English after switching");
    const marks = await tab.evaluate(() => UC.internal.searchEngine.highlight("As <b>árvores</b> de Árvore", ["arvor"]).map((node) => (typeof node === "string" ? node : `[${node.textContent}]`)).join(""));
    equal(marks, "As <b>[árvores]</b> de [Árvore]", "highlight as text nodes");
    await context.close();
  });

  await test("dialog: loading, results grouped, arrows, Enter on another page", async () => {
    const { context, requests } = await site(browser, files({ "/search-index.js": { body: RICH_INDEX(), delay: 600 } }));
    const { tab } = await open(context, `${ORIGIN}/index.html`);
    await waitForButton(tab, "shown");
    await tab.focus(".uc-search-button");
    await tab.keyboard.press("Enter");
    await tab.waitForSelector(".uc-search-dialog[open]");
    equal((await state(tab)).status, "A carregar…", "loading status");
    await tab.waitForFunction(() => document.querySelector(".uc-search-dialog [role='status']").textContent !== "A carregar…", null, { timeout: 4000 });
    equal(await tab.evaluate(() => document.activeElement.matches(".uc-search-dialog input[role='combobox']")), true, "focus in the field");
    await type(tab, "arvores");
    let now = await state(tab);
    equal([now.groups[0], now.groups.includes("Prazos")], ["Árvores", true], "groups");
    equal([now.active, now.expanded], ["Árvores", "true"], "first option active");
    if (!/^\d+ resultados$/.test(now.status)) throw new Error(`count status: ${now.status}`);
    await tab.keyboard.press("ArrowDown");
    equal((await state(tab)).active, now.titles[1], "ArrowDown");
    await tab.keyboard.press("ArrowUp");
    await tab.keyboard.press("ArrowUp");
    equal((await state(tab)).active, now.titles[now.titles.length - 1], "ArrowUp wraps");
    await type(tab, "zzzz");
    now = await state(tab);
    equal([now.status, now.expanded, now.titles.length], ["Sem resultados para «zzzz».", "false", 0], "no results");
    await type(tab, "avl");
    await Promise.all([tab.waitForURL(`${ORIGIN}/arvores.html#avl`), tab.keyboard.press("Enter")]);
    equal(requests.filter((line) => line === "GET /search-index.js").length, 1, "index requests");
    await context.close();
  });

  await test("dialog: Esc and the backdrop close it and focus goes back; the query stays", async () => {
    const { context } = await site(browser, files());
    const { tab } = await open(context, `${ORIGIN}/index.html`);
    await waitForButton(tab, "shown");
    await tab.click(".uc-search-button");
    await tab.waitForSelector(".uc-search-dialog[open]");
    await type(tab, "heap");
    await tab.keyboard.press("Escape");
    equal([(await state(tab)).open, await tab.evaluate(() => document.activeElement.matches(".uc-search-button"))], [false, true], "Esc");
    await tab.keyboard.press("Control+k");
    await tab.waitForSelector(".uc-search-dialog[open]");
    equal(await tab.inputValue(".uc-search-dialog input"), "heap", "query kept");
    await tab.mouse.click(5, 600);
    await tab.waitForTimeout(100);
    equal((await state(tab)).open, false, "backdrop");
    await tab.evaluate(() => UC.search.open("avl"));
    await tab.waitForSelector(".uc-search-dialog[open]");
    equal((await state(tab)).active, "Árvores AVL", "UC.search.open(query)");
    await context.close();
  });

  await test("dialog: a result on this page opens <details>, flashes and focuses the target", async () => {
    const { context } = await site(browser, files());
    const { tab } = await open(context, `${ORIGIN}/arvores.html`);
    await waitForButton(tab, "shown");
    await tab.evaluate(() => UC.search.open("avl rot"));
    await tab.waitForFunction(() => document.querySelector(".uc-search-dialog [aria-selected='true']"));
    await tab.keyboard.press("Enter");
    await tab.waitForTimeout(150);
    const result = await tab.evaluate(() => [location.hash, document.querySelector("details").open, document.activeElement.id, document.getElementById("avl").classList.contains("uc-target-flash"), document.querySelector(".uc-search-dialog").open]);
    equal(result, ["#avl", true, "avl", true, false], "hash, details, focus, flash, closed");
    await context.close();
  });

  await test("dialog: a failed index shows the message and a retry button that works", async () => {
    const { context } = await site(browser, files());
    const { tab } = await open(context, `${ORIGIN}/index.html`);
    await waitForButton(tab, "shown");
    let fail = true;
    await tab.route(`${ORIGIN}/search-index.js`, (route) => (fail && route.request().method() === "GET" ? route.fulfill({ status: 500, body: "" }) : route.fallback()));
    await tab.evaluate(() => UC.search.open("avl"));
    await tab.waitForSelector(".uc-search__retry:not([hidden])");
    equal((await state(tab)).status, "Não foi possível carregar a pesquisa.", "failed status");
    equal(await tab.evaluate(() => document.activeElement.matches(".uc-search__retry")), true, "focus on retry");
    fail = false;
    await tab.keyboard.press("Enter");
    await tab.waitForFunction(() => document.querySelector(".uc-search-dialog [aria-selected='true']"), null, { timeout: 3000 });
    equal((await state(tab)).active, "Árvores AVL", "after retry");
    await context.close();
  });

  await test("dialog: uc-search.js that cannot load is announced; the index date and the English strings", async () => {
    const { context } = await site(browser, files());
    const { tab } = await open(context, `${ORIGIN}/index.html`);
    await waitForButton(tab, "shown");
    await tab.route(`${ORIGIN}/kit/v1/uc-search.js`, (route) => route.fulfill({ status: 404, body: "" }));
    await tab.evaluate(() => UC.search.open());
    await tab.waitForFunction(() => /Não foi possível/.test(document.querySelector("[data-uc-announcer]")?.textContent || ""), null, { timeout: 3000 });
    equal(await tab.evaluate(() => document.querySelector(".uc-search-button").hasAttribute("aria-busy")), false, "not busy after the failure");
    await tab.unroute(`${ORIGIN}/kit/v1/uc-search.js`);
    await tab.evaluate(() => UC.setLanguage("en"));
    await tab.evaluate(() => UC.search.open("trees"));
    await tab.waitForFunction(() => document.querySelector(".uc-search-dialog [aria-selected='true']"), null, { timeout: 3000 });
    const texts = await tab.evaluate(() => [document.querySelector(".uc-search-dialog input").placeholder, document.querySelector(".uc-search-dialog__date").textContent, document.querySelector(".uc-search-dialog").getAttribute("aria-labelledby") && document.getElementById(document.querySelector(".uc-search-dialog").getAttribute("aria-labelledby")).textContent]);
    equal(texts, ["Search pages, classes, exercises…", "Index of 20 Nov 2025", "Search the site"], "English strings");
    await context.close();
  });

  await test("<uc-search>: empty without an index; with one, scope, limit, Esc and the announced count", async () => {
    const without = await site(browser, files({ "/search-index.js": { status: 404 } }));
    const none = await open(without.context, `${ORIGIN}/scoped.html`);
    await waitForButton(none.tab, "none");
    equal(await none.tab.evaluate(() => [document.querySelector("uc-search").innerHTML, customElements.get("uc-search") === undefined]), ["", true], "nothing rendered or loaded");
    await without.context.close();

    const { context, requests } = await site(browser, files());
    const { tab } = await open(context, `${ORIGIN}/scoped.html`);
    await tab.waitForSelector("uc-search input[role='combobox']");
    equal(requests.includes("GET /search-index.js"), false, "index not loaded before focus");
    equal(await tab.evaluate(() => document.querySelector("uc-search label").textContent), "Pesquisar nos problemas", "label");
    await tab.fill("uc-search input", "problema");
    await tab.waitForFunction(() => document.querySelectorAll("uc-search [role='option']").length > 0, null, { timeout: 3000 });
    const titles = await tab.evaluate(() => Array.from(document.querySelectorAll("uc-search .uc-search__title"), (node) => node.textContent));
    equal(titles, ["Problema 1", "Problema 2", "Problema 3"], "scope and limit");
    await tab.waitForFunction(() => /3 resultados/.test(document.querySelector("[data-uc-announcer]")?.textContent || ""), null, { timeout: 3000 });
    await tab.focus("uc-search input");
    await tab.keyboard.press("Escape");
    equal(await tab.evaluate(() => [document.querySelector("uc-search input").value, document.querySelectorAll("uc-search [role='option']").length]), ["", 0], "Esc clears");
    await tab.fill("uc-search input", "arvores");
    await tab.waitForTimeout(100);
    equal(await tab.evaluate(() => document.querySelector("uc-search .uc-search__message").textContent), "Sem resultados para «arvores».", "out of scope");
    await context.close();
  });
}
