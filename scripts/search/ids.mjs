/** Automatic heading ids (docs/architecture/search-api.md 6) and the start-up jump to #hash. */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ROOT } from "../lib/server.mjs";
import { ORIGIN, equal, open, page, site, test } from "./harness.mjs";

export async function idChecks(browser) {
  const cases = JSON.parse(await readFile(path.join(ROOT, "tests/search/slugs.json"), "utf8"));
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
}

/** #hash after start-up (contract 6, last paragraph). */
export async function hashChecks(browser) {
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
}
