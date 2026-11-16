/*
 * Behaviour of the documentation pages. Everything here is progressive
 * enhancement: without JavaScript the sidebar, "Nesta página", the demos and
 * their code are all still on the page (see docs.css, html:not(.docs-js)).
 *
 *   - demo blocks: "Pré-visualização / Código" tabs, iframe height from the demo
 *   - sliding menu for the sidebar on narrow screens
 *   - "Nesta página": highlights the section being read
 */
(function () {
  "use strict";

  const root = document.documentElement;
  root.classList.add("docs-js");

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

  function init() {
    document.querySelectorAll(".docs-demo").forEach(setUpDemo);
    setUpMenu();
    setUpToc();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
