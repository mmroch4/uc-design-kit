/*
 * Behaviour of the documentation pages. Everything here is progressive
 * enhancement: without JavaScript the sidebar, "Nesta página", the demos and
 * their code are all still on the page (see docs.css, html:not(.docs-js)).
 *
 *   - demo blocks: "Pré-visualização / Código" tabs, iframe height from the demo
 *   - sliding menu for the sidebar on narrow screens
 *   - "Nesta página": highlights the section being read
 *   - search (Ctrl K, ⌘K or /): a dialog over the index that npm run build
 *     writes to docs/assets/search-index.js, loaded on first use
 */
(function () {
  "use strict";

  const root = document.documentElement;
  root.classList.add("docs-js");
  // docs/assets/docs.js → docs/: page paths in the search index are relative to it.
  const docsRoot = document.currentScript ? new URL("../", document.currentScript.src) : null;

  /* ---------- demo tabs ---------- */

  let demoCount = 0;

  /** Turns a .docs-demo block (two panels) into an accessible tab set. */
  function setUpDemo(demo) {
    const panels = Array.from(demo.querySelectorAll(":scope > .docs-demo__panel"));
    if (panels.length < 2 || demo.querySelector(".docs-demo__tabs")) return;
    demoCount += 1;
    const base = demo.id || `docs-demo-${demoCount}`;
    const tablist = document.createElement("div");
    tablist.className = "docs-demo__tabs";
    tablist.setAttribute("role", "tablist");

    const tabs = panels.map((panel, index) => {
      const tab = document.createElement("button");
      tab.type = "button";
      tab.className = "docs-demo__tab";
      tab.id = `${base}-tab-${index}`;
      tab.textContent = panel.dataset.label || "";
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-controls", (panel.id = panel.id || `${base}-panel-${index}`));
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", tab.id);
      tablist.append(tab);
      return tab;
    });

    function select(index, focus) {
      tabs.forEach((tab, i) => {
        const selected = i === index;
        tab.setAttribute("aria-selected", String(selected));
        tab.tabIndex = selected ? 0 : -1;
        panels[i].hidden = !selected;
      });
      if (focus) tabs[index].focus();
    }

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => select(index, false));
      tab.addEventListener("keydown", (event) => {
        const moves = { ArrowRight: 1, ArrowLeft: -1, Home: -index, End: tabs.length - 1 - index };
        if (!(event.key in moves)) return;
        event.preventDefault();
        select((index + moves[event.key] + tabs.length) % tabs.length, true);
      });
    });

    // The tab list holds only tabs; "Abrir demo" sits next to it in the same bar.
    const bar = document.createElement("div");
    bar.className = "docs-demo__bar";
    bar.append(tablist);
    const open = demo.querySelector(":scope > .docs-demo__open");
    if (open) bar.append(open);
    demo.prepend(bar);
    select(0, false);
  }

  /* ---------- demo heights (messages from docs/demos/demo.js) ---------- */

  window.addEventListener("message", (event) => {
    const data = event.data;
    if (!data || data.type !== "uc-docs:demo-height" || !Number.isFinite(data.height)) return;
    const frame = Array.from(document.querySelectorAll(".docs-demo__frame")).find(
      (item) => item.contentWindow === event.source,
    );
    if (frame) frame.style.height = `${Math.max(0, Math.round(data.height))}px`;
  });

  /* ---------- sliding menu (narrow screens) ---------- */

  function setUpMenu() {
    const button = document.querySelector(".docs-header__menu");
    const sidebar = document.getElementById("docs-sidebar");
    if (!button || !sidebar) return;
    button.hidden = false;
    let backdrop = null;

    function setOpen(open) {
      root.classList.toggle("docs-menu-open", open);
      button.setAttribute("aria-expanded", String(open));
      if (open) {
        backdrop = document.createElement("div");
        backdrop.className = "docs-backdrop";
        backdrop.addEventListener("click", () => setOpen(false));
        document.body.append(backdrop);
        const current = sidebar.querySelector('[aria-current="page"]') || sidebar.querySelector("a");
        if (current) current.focus();
      } else if (backdrop) {
        backdrop.remove();
        backdrop = null;
      }
    }

    button.addEventListener("click", () => setOpen(!root.classList.contains("docs-menu-open")));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && root.classList.contains("docs-menu-open")) {
        setOpen(false);
        button.focus();
      }
    });
    // Following a link to a section of the same page closes the menu.
    sidebar.addEventListener("click", (event) => {
      if (event.target.closest("a")) setOpen(false);
    });
    window.matchMedia("(min-width: 961px)").addEventListener("change", (event) => {
      if (event.matches) setOpen(false);
    });
  }

  /* ---------- "Nesta página": current section ---------- */

  function setUpToc() {
    const links = Array.from(document.querySelectorAll(".docs-toc__list a[href^='#']"));
    const targets = links
      .map((link) => document.getElementById(decodeURIComponent(link.hash.slice(1))))
      .filter(Boolean);
    if (!targets.length || !("IntersectionObserver" in window)) return;
    const visible = new Set();

    function update() {
      // The first heading in view, or the last one above the viewport.
      let current = targets.find((target) => visible.has(target));
      if (!current) current = targets.filter((target) => target.getBoundingClientRect().top < 0).pop();
      links.forEach((link) => link.classList.toggle("is-active", Boolean(current) && link.hash === `#${current.id}`));
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => (entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target)));
        update();
      },
      { rootMargin: "-56px 0px -55% 0px" },
    );
    targets.forEach((target) => observer.observe(target));
  }


  /* ---------- search (Ctrl K) ---------- */

  const MAX_RESULTS = 40;
  const SECTIONS_PER_PAGE = 4;

  /** Lowercase, without accents, as scripts/docs.mjs folds the index ("Secção" → "seccao"). */
  function normalize(text) {
    return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  }

  let indexPromise = null;

  /** Loads search-index.js once (a script, so it also works from file://). */
  function loadIndex() {
    if (!indexPromise) {
      indexPromise = new Promise((resolve, reject) => {
        if (window.UC_DOCS_SEARCH) return resolve(window.UC_DOCS_SEARCH);
        const script = document.createElement("script");
        script.src = new URL("assets/search-index.js", docsRoot).href;
        script.onload = () => (window.UC_DOCS_SEARCH ? resolve(window.UC_DOCS_SEARCH) : reject(new Error("empty index")));
        script.onerror = () => {
          indexPromise = null;
          reject(new Error("search index not found"));
        };
        document.head.append(script);
      });
    }
    return indexPromise;
  }

  /**
   * Scores one section for the query words. Every word must match the start
   * of a word of the page title, the heading or the section text; title
   * matches weigh most, then headings, then text.
   */
  function scoreSection(page, section, words) {
    const title = normalize(page.t);
    const heading = normalize(section.h || page.t);
    const text = ` ${section.w} `;
    let score = 0;
    for (const word of words) {
      const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const start = new RegExp(`(^|[^a-z0-9])${escaped}`);
      const whole = new RegExp(`(^|[^a-z0-9])${escaped}($|[^a-z0-9-])`);
      if (start.test(heading)) score += (section.i ? 30 : 40) + (whole.test(heading) ? 10 : 0);
      else if (start.test(title)) score += 20 + (whole.test(title) ? 5 : 0);
      else if (text.includes(` ${word}`) || (word.length > 3 && text.includes(word))) score += 5;
      else return 0;
    }
    return score + (section.i ? 0 : 1);
  }

  /** Results grouped by page: [{ page, sections: [{ section, score }] }], best first. */
  function search(index, query) {
    const words = normalize(query).split(/[^a-z0-9_-]+/).filter(Boolean);
    if (!words.length) return [];
    const groups = [];
    for (const page of index) {
      const hits = page.s
        .map((section) => ({ section, score: scoreSection(page, section, words) }))
        .filter((hit) => hit.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, SECTIONS_PER_PAGE);
      if (hits.length) groups.push({ page, best: hits[0].score, sections: hits });
    }
    groups.sort((a, b) => b.best - a.best);
    let count = 0;
    return groups.filter((group) => {
      count += group.sections.length;
      return count - group.sections.length < MAX_RESULTS;
    });
  }

  function setUpSearch() {
    const button = document.querySelector(".docs-search-button");
    if (!button || !docsRoot || typeof HTMLDialogElement !== "function") return;
    button.hidden = false;
    const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
    const kbd = button.querySelector(".docs-search-button__kbd");
    if (kbd && isMac) kbd.textContent = "⌘K";

    let dialog = null;
    let input = null;
    let list = null;
    let status = null;
    let options = [];
    let active = -1;
    let index = null;

    function build() {
      dialog = document.createElement("dialog");
      dialog.className = "docs-search";
      dialog.setAttribute("aria-label", button.dataset.placeholder || "");
      dialog.innerHTML =
        '<div class="docs-search__bar">' +
        button.querySelector("svg").outerHTML +
        '<input class="docs-search__input" type="text" role="combobox" aria-expanded="false" aria-autocomplete="list" aria-controls="docs-search-results" autocomplete="off" spellcheck="false">' +
        '<button class="docs-search__close" type="button"><kbd aria-hidden="true">Esc</kbd></button>' +
        "</div>" +
        '<div class="docs-search__results" id="docs-search-results" role="listbox"></div>' +
        '<p class="docs-search__status" role="status"></p>';
      input = dialog.querySelector(".docs-search__input");
      list = dialog.querySelector(".docs-search__results");
      status = dialog.querySelector(".docs-search__status");
      input.placeholder = button.dataset.placeholder || "";
      input.setAttribute("aria-label", button.dataset.placeholder || "");
      list.setAttribute("aria-label", button.dataset.placeholder || "");
      const close = dialog.querySelector(".docs-search__close");
      close.setAttribute("aria-label", button.dataset.close || "Esc");
      close.addEventListener("click", () => dialog.close());
      // A click on the backdrop (outside the box) closes the dialog.
      dialog.addEventListener("click", (event) => {
        if (event.target === dialog) dialog.close();
      });
      dialog.addEventListener("close", () => button.focus());
      input.addEventListener("input", update);
      input.addEventListener("keydown", onKey);
      list.addEventListener("click", (event) => {
        const option = event.target.closest("[role='option']");
        if (option) go(option);
      });
      document.body.append(dialog);
    }

    function setActive(next) {
      if (!options.length) return;
      if (active >= 0) options[active].setAttribute("aria-selected", "false");
      active = (next + options.length) % options.length;
      const option = options[active];
      option.setAttribute("aria-selected", "true");
      input.setAttribute("aria-activedescendant", option.id);
      option.scrollIntoView({ block: "nearest" });
    }

    function go(option) {
      dialog.close();
      window.location.href = option.dataset.href;
    }

    function onKey(event) {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        setActive(active + (event.key === "ArrowDown" ? 1 : -1));
      } else if (event.key === "Enter" && active >= 0) {
        event.preventDefault();
        go(options[active]);
      }
    }

    function render(groups) {
      list.textContent = "";
      options = [];
      active = -1;
      input.removeAttribute("aria-activedescendant");
      groups.forEach((group, groupIndex) => {
        const box = document.createElement("div");
        box.setAttribute("role", "group");
        const label = document.createElement("p");
        label.className = "docs-search__group";
        label.id = `docs-search-group-${groupIndex}`;
        label.textContent = `${group.page.g} · ${group.page.t}`;
        box.setAttribute("aria-labelledby", label.id);
        box.append(label);
        for (const { section } of group.sections) {
          const option = document.createElement("div");
          option.className = "docs-search__option";
          option.id = `docs-search-option-${options.length}`;
          option.setAttribute("role", "option");
          option.setAttribute("aria-selected", "false");
          option.dataset.href = new URL(group.page.p + (section.i ? `#${section.i}` : ""), docsRoot).href;
          const title = document.createElement("span");
          title.className = "docs-search__title";
          title.textContent = section.h || group.page.t;
          const text = document.createElement("span");
          text.className = "docs-search__text";
          text.textContent = section.x;
          option.append(title, text);
          box.append(option);
          options.push(option);
        }
        list.append(box);
      });
      input.setAttribute("aria-expanded", String(options.length > 0));
      const query = input.value.trim();
      status.textContent = query && !options.length ? button.dataset.empty || "" : "";
      if (options.length) setActive(0);
    }

    function update() {
      if (!index) return;
      render(search(index, input.value));
    }

    function open() {
      if (!dialog) build();
      if (dialog.open) return;
      dialog.showModal();
      input.select();
      loadIndex()
        .then((all) => {
          index = all[root.lang.split("-")[0]] || Object.values(all)[0] || [];
          update();
        })
        .catch(() => {
          status.textContent = button.dataset.empty || "";
        });
    }

    button.addEventListener("click", open);
    document.addEventListener("keydown", (event) => {
      const typing = event.target.closest && event.target.closest("input, textarea, select, [contenteditable]");
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (dialog && dialog.open) dialog.close();
        else open();
      } else if (event.key === "/" && !typing && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        open();
      }
    });
  }

  function init() {
    document.querySelectorAll(".docs-demo").forEach(setUpDemo);
    setUpMenu();
    setUpToc();
    setUpSearch();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
