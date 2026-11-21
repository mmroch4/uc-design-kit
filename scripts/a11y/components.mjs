/**
 * Behaviour of the components, each checked where the page has the
 * component: copy, collapsible code, <uc-question>, running code, "Mark as
 * done", the language switch, a[data-auth], "My class" of <uc-timetable>, the
 * search of <uc-summaries>, the filters of <uc-problems>, sortable tables,
 * "Outros anos" and the phone menu of <uc-page>.
 */
import { firstVisible, focusedMatches, liveText, open } from "./helpers.mjs";

/** Component behaviours, each checked where the page has the component. */
export async function checkBehaviour(browser, origin, relative) {
  const problems = [];
  const { context, page } = await open(browser, origin, relative);

  const copy = await firstVisible(page, ".uc-code__button--copy, .uc-copy-block__button");
  if (copy) {
    await copy.focus();
    await page.keyboard.press("Enter");
    await page.waitForTimeout(250);
    if (!(await focusedMatches(page, ".uc-code__button--copy, .uc-copy-block__button"))) problems.push("copy: the button lost focus after copying");
    if (!/Copiado|Copied/.test(await liveText(page))) problems.push("copy: no 'Copiado' announcement in a live region");
  }

  const toggle = await firstVisible(page, ".uc-code__toggle");
  if (toggle) {
    const before = await toggle.getAttribute("aria-expanded");
    await toggle.focus();
    await page.keyboard.press("Enter");
    await page.waitForTimeout(100);
    const after = await page.evaluate(() => document.activeElement && document.activeElement.getAttribute("aria-expanded"));
    if (after === null) problems.push("collapsible code: the toggle lost focus");
    else if (after === before) problems.push("collapsible code: aria-expanded did not change");
  }

  const question = await firstVisible(page, "uc-question");
  if (question) {
    const check = await question.$(".uc-question__check");
    await check.focus();
    await page.keyboard.press("Enter");
    await page.waitForTimeout(150);
    const feedback = await question.$eval(".uc-question__feedback", (node) => ({ live: node.getAttribute("aria-live"), text: node.textContent.trim() }));
    if (feedback.live !== "polite" || !feedback.text) problems.push("question: feedback is not announced in a polite live region");
  }

  // In-page JavaScript runs in a Web Worker, with no network: its end must be announced.
  const run = await firstVisible(page, 'uc-code[data-lang="js"] button.uc-code__run');
  if (run) {
    await run.focus();
    await page.keyboard.press("Enter");
    await page.waitForFunction(() => !document.querySelector(".uc-code__run[aria-disabled='true']"), null, { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(150);
    if (!/Execução terminada|testes passaram|Run finished|tests passed/.test(await liveText(page))) problems.push("run: the end of the run is not announced");
    if (!(await focusedMatches(page, ".uc-code__run"))) problems.push("run: the run button lost focus");
  }

  const done = await page.$(".uc-exercise__toggle");
  if (done) {
    await page.evaluate(() => document.querySelectorAll("uc-exercise details").forEach((details) => (details.open = true)));
    const before = await done.getAttribute("aria-pressed");
    await done.focus();
    await page.keyboard.press("Enter");
    await page.waitForTimeout(100);
    const state = await page.evaluate(() => document.activeElement && document.activeElement.getAttribute("aria-pressed"));
    if (state === null) problems.push("exercise: 'Mark as done' lost focus");
    else if (state === before) problems.push("exercise: aria-pressed did not change");
  }

  const language = await page.$(".uc-lang-switch__button");
  if (language) {
    const target = await language.getAttribute("lang");
    await language.focus();
    await page.keyboard.press("Enter");
    await page.waitForTimeout(200);
    const lang = await page.evaluate(() => document.documentElement.lang);
    if (lang !== target) problems.push(`language switch: <html lang> is "${lang}", expected "${target}"`);
    if (!(await focusedMatches(page, ".uc-lang-switch__button"))) problems.push("language switch: focus was lost");
  }

  // a[data-auth]: the need to log in is text, the lock is decoration.
  const auth = await page.evaluate(() =>
    Array.from(document.querySelectorAll("a[data-auth]"))
      .filter((link) => !link.closest("[hidden]"))
      .map((link) => ({
        label: (link.querySelector(".uc-auth-label") || {}).textContent || "",
        icon: Boolean(link.querySelector("svg.uc-auth-icon[aria-hidden='true']")),
        count: link.querySelectorAll(".uc-auth-label").length,
      })),
  );
  for (const link of auth) {
    if (!/autenticação|login/i.test(link.label) || link.count !== 1) problems.push(`data-auth: a link has ${link.count} hidden labels ("${link.label.trim()}")`);
    if (!link.icon) problems.push("data-auth: the lock icon is missing or not aria-hidden");
  }
  await context.close();

  problems.push(...(await checkClassFilter(browser, origin, relative)));
  problems.push(...(await checkSummariesSearch(browser, origin, relative)));
  problems.push(...(await checkProblems(browser, origin, relative)));
  problems.push(...(await checkSortableAndEditions(browser, origin, relative)));

  if (relative.includes("uc-page") || relative.startsWith("examples/")) {
    const phone = await open(browser, origin, relative, { viewport: { width: 390, height: 844 } });
    const menu = await phone.page.$(".uc-nav-toggle");
    if (menu) {
      await menu.focus();
      await phone.page.keyboard.press("Enter");
      const opened = await menu.getAttribute("aria-expanded");
      await phone.page.keyboard.press("Tab");
      await phone.page.keyboard.press("Escape");
      const closed = await menu.getAttribute("aria-expanded");
      if (opened !== "true" || closed !== "false") problems.push(`phone menu: aria-expanded went ${opened} then ${closed}`);
      if (!(await focusedMatches(phone.page, ".uc-nav-toggle"))) problems.push("phone menu: Escape did not return focus to the menu button");
    }
    await phone.context.close();
  }
  return problems;
}

/** "My class" of <uc-timetable class-filter>, on pages that have one. */
async function checkClassFilter(browser, origin, relative) {
  const problems = [];
  const { context, page } = await open(browser, origin, relative);
  const select = await firstVisible(page, ".uc-timetable__filters select");
  if (!select) {
    await context.close();
    return problems;
  }
  const choice = await select.evaluate((node) => node.options[node.options.length - 1].value);
  const label = await select.evaluate((node) => (node.labels[0] ? node.labels[0].textContent.trim() : ""));
  if (!label) problems.push("class filter: the select has no visible <label>");
  const box = await select.boundingBox();
  if (box && box.height < 44) problems.push(`class filter: the select is ${Math.round(box.height)}px tall (44px minimum)`);
  await select.focus();
  // A closed select changes value with the arrow keys; End picks the last class.
  await page.keyboard.press("End");
  await page.waitForTimeout(250);
  const value = await select.evaluate((node) => node.value);
  if (value !== choice) problems.push(`class filter: End did not choose the last class (value "${value}")`);
  if (!(await focusedMatches(page, ".uc-timetable__filters select"))) problems.push("class filter: the select lost focus");
  if (!(await liveText(page)).includes(choice)) problems.push(`class filter: "${choice}" was not announced`);
  const state = await page.evaluate((code) => {
    const rows = Array.from(document.querySelectorAll("uc-timetable [data-class][data-type]"));
    const filtered = rows.filter((row) => row.closest("uc-timetable").querySelector(".uc-timetable__filters"));
    return {
      wrong: filtered.filter((row) => !row.hidden && row.dataset.class !== code && rows.some((other) => other.dataset.type === row.dataset.type && other.dataset.class === code)).length,
      shown: filtered.filter((row) => !row.hidden && row.dataset.class === code).length,
    };
  }, choice);
  if (state.wrong) problems.push(`class filter: ${state.wrong} rows of other classes are still shown`);
  if (!state.shown) problems.push(`class filter: no row of ${choice} is shown`);
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(300);
  const kept = await page.evaluate(() => document.querySelector(".uc-timetable__filters select")?.value);
  if (kept !== choice) problems.push(`class filter: the choice was not kept after a reload ("${kept}")`);
  await context.close();
  return problems;
}

/** The search field of <uc-summaries search>, on pages that have one. */
async function checkSummariesSearch(browser, origin, relative) {
  const problems = [];
  const { context, page } = await open(browser, origin, relative);
  const input = await firstVisible(page, ".uc-summaries__search input");
  if (!input) {
    await context.close();
    return problems;
  }
  const box = await input.boundingBox();
  if (box && box.height < 44) problems.push(`summaries search: the field is ${Math.round(box.height)}px tall (44px minimum)`);
  if (!(await input.evaluate((node) => (node.labels[0] ? node.labels[0].textContent.trim() : "")))) problems.push("summaries search: the field has no visible <label>");
  // The first word of the first summary, typed without its accents.
  const word = await page.evaluate(() => {
    const body = document.querySelector(".uc-summaries__item .uc-summaries__body strong, .uc-summaries__item .uc-summaries__body");
    return (body.textContent.match(/[\p{L}]{4,}/u) || [""])[0].normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  });
  await input.focus();
  await page.keyboard.type(word.toUpperCase());
  await page.waitForTimeout(500);
  if (!(await focusedMatches(page, ".uc-summaries__search input"))) problems.push("summaries search: focus left the field");
  if (!/\d+ (de|of) \d+/.test(await liveText(page))) problems.push("summaries search: the number of results is not announced");
  const state = await page.evaluate(() => {
    const root = document.querySelector(".uc-summaries__search").closest("uc-summaries");
    return {
      marks: root.querySelectorAll("mark").length,
      breaks: Array.from(root.querySelectorAll(".uc-summaries__break")).filter((node) => !node.hidden).length,
    };
  });
  if (!state.marks) problems.push(`summaries search: "${word}" is not highlighted`);
  if (state.breaks) problems.push("summaries search: breaks are still shown while searching");
  await page.keyboard.press("Escape");
  await page.waitForTimeout(100);
  if (await input.evaluate((node) => node.value)) problems.push("summaries search: Escape did not clear the field");
  await context.close();
  return problems;
}

/** The filters and "Resolvido" checkboxes of <uc-problems>, on pages that have them. */
async function checkProblems(browser, origin, relative) {
  const problems = [];
  const { context, page } = await open(browser, origin, relative);
  // The last button of the first group (a type): its tag must be on every problem left.
  const button = await firstVisible(page, ".uc-problems__filters .uc-filters__group:first-child .uc-filters__button:last-child");
  if (button) {
    const box = await button.boundingBox();
    if (box && box.height < 44) problems.push(`problem filters: a button is ${Math.round(box.height)}px tall (44px minimum)`);
    await button.focus();
    await page.keyboard.press("Enter");
    await page.waitForTimeout(200);
    if ((await button.getAttribute("aria-pressed")) !== "true") problems.push("problem filters: Enter did not set aria-pressed");
    if (!(await focusedMatches(page, ".uc-problems__filters .uc-filters__button"))) problems.push("problem filters: the button lost focus");
    if (!/\d+ (de|of) \d+/.test(await liveText(page))) problems.push("problem filters: the number of problems is not announced");
    const wrong = await button.evaluate((node) =>
      Array.from(node.closest("uc-problems").querySelectorAll(".uc-problems__item"))
        .filter((item) => !item.hidden)
        .filter((item) => !Array.from(item.querySelectorAll(".uc-problems__tags .uc-tag")).some((tag) => tag.textContent === node.textContent)).length,
    );
    if (wrong) problems.push(`problem filters: ${wrong} problems that do not match "${await button.textContent()}" are still shown`);
  }
  const checkbox = await firstVisible(page, ".uc-problems__solved input");
  if (checkbox) {
    const box = await page.locator(".uc-problems__solved").first().boundingBox();
    if (box && box.height < 44) problems.push(`problems: the "Resolvido" label is ${Math.round(box.height)}px tall (44px minimum)`);
    const name = await checkbox.getAttribute("aria-label");
    if (!/^(Resolvido|Solved): .+/.test(name || "")) problems.push(`problems: the checkbox name does not name the problem ("${name}")`);
    await checkbox.focus();
    await page.keyboard.press("Space");
    await page.waitForTimeout(100);
    if (!(await checkbox.isChecked())) problems.push("problems: Space did not check 'Resolvido'");
    await page.reload({ waitUntil: "load" });
    await page.waitForTimeout(300);
    const kept = await page.evaluate(() => Array.from(document.querySelectorAll(".uc-problems__solved input")).some((input) => input.checked));
    if (!kept) problems.push("problems: 'Resolvido' was not kept after a reload");
  }
  await context.close();
  return problems;
}

/** Sortable table headers and the "Outros anos" disclosure, on pages that have them. */
async function checkSortableAndEditions(browser, origin, relative) {
  const problems = [];
  const { context, page } = await open(browser, origin, relative);
  const sort = await firstVisible(page, ".uc-sort-button");
  if (sort) {
    const box = await sort.boundingBox();
    if (box && box.height < 44) problems.push(`sortable table: a header button is ${Math.round(box.height)}px tall (44px minimum)`);
    const state = () => sort.evaluate((node) => node.closest("th").getAttribute("aria-sort"));
    await sort.focus();
    await page.keyboard.press("Enter");
    await page.waitForTimeout(150);
    const first = await state();
    await page.keyboard.press("Enter");
    await page.waitForTimeout(150);
    const second = await state();
    if (!first || !second || first === second) problems.push(`sortable table: aria-sort went ${first} then ${second}`);
    if (!(await focusedMatches(page, ".uc-sort-button"))) problems.push("sortable table: the header button lost focus");
    if (!/Ordenado por|Sorted by/.test(await liveText(page))) problems.push("sortable table: the new order is not announced");
  }
  const editions = await firstVisible(page, ".uc-page__editions-button");
  if (editions) {
    await editions.focus();
    await page.keyboard.press("Enter");
    await page.waitForTimeout(100);
    const opened = await editions.getAttribute("aria-expanded");
    const shown = await page.locator(".uc-page__editions-menu a").first().isVisible();
    await page.keyboard.press("Escape");
    await page.waitForTimeout(100);
    const closed = await editions.getAttribute("aria-expanded");
    if (opened !== "true" || !shown || closed !== "false") problems.push(`editions: aria-expanded went ${opened} then ${closed} (list shown: ${shown})`);
    if (!(await focusedMatches(page, ".uc-page__editions-button"))) problems.push("editions: Escape did not return focus to the button");
  }
  await context.close();
  return problems;
}
