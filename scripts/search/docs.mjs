/** The documentation uses the kit's search (docs/architecture/search-api.md 5). */
import { startServer } from "../lib/server.mjs";
import { equal, test } from "./harness.mjs";

export async function docsChecks(browser) {
  await test("docs: the header button and '/' open the kit's dialog over docs/assets/search-index.js", async () => {
    const server = await startServer();
    const base = `http://127.0.0.1:${server.address().port}`;
    const context = await browser.newContext();
    try {
      const tab = await context.newPage();
      const errors = [];
      tab.on("pageerror", (error) => errors.push(error.message));
      await tab.goto(`${base}/docs/pt/componentes/uc-week.html`, { waitUntil: "load" });
      await tab.waitForSelector(".docs-search-button:not([hidden])");
      await tab.click(".docs-search-button");
      await tab.waitForSelector(".uc-search-dialog[open]");
      await tab.waitForFunction(() => document.querySelectorAll(".uc-search-dialog [role='option']").length === 0 && !/A carregar/.test(document.querySelector(".uc-search-dialog [role='status']").textContent));
      equal(await tab.getAttribute(".uc-search-dialog input", "placeholder"), "Pesquisar na documentação", "placeholder");
      await tab.fill(".uc-search-dialog input", "semanas");
      await tab.waitForSelector(".uc-search-dialog [role='option']");
      const groups = await tab.$$eval(".uc-search-dialog [role='group']", (list) => list.map((group) => group.getAttribute("aria-label") || group.querySelector("[id]").textContent));
      if (!groups.some((label) => / · /.test(label))) throw new Error(`no "Group · Page" labels in ${JSON.stringify(groups.slice(0, 5))}`);
      // Typo tolerance comes from the kit's engine: "semnaas" finds the same pages.
      // Each step waits for its own results: the list of the previous query is still there.
      const firstTitle = (pattern) =>
        tab.waitForFunction((source) => {
          const option = document.querySelector(".uc-search-dialog [role='option']");
          return option && new RegExp(source, "i").test(option.textContent);
        }, pattern);
      await tab.fill(".uc-search-dialog input", "uc-timetable");
      await firstTitle("uc-timetable");
      await tab.fill(".uc-search-dialog input", "semnaas");
      await firstTitle("semana");
      await tab.fill(".uc-search-dialog input", "uc-timetable");
      await firstTitle("uc-timetable");
      await Promise.all([tab.waitForURL(/\/docs\/pt\/componentes\/uc-timetable\.html/), tab.keyboard.press("Enter")]);
      await tab.goto(`${base}/docs/pt/index.html`, { waitUntil: "load" });
      await tab.waitForSelector(".docs-search-button:not([hidden])");
      // "/" works once the kit knows the index exists (it asks when idle).
      equal(await tab.evaluate(() => UC.search.available()), true, "index found");
      await tab.keyboard.press("/");
      await tab.waitForSelector(".uc-search-dialog[open]");
      equal(errors, [], "page errors");
    } finally {
      await context.close();
      server.close();
    }
  });
}
