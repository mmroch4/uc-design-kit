/**
 * The results list shared by the search dialog and <uc-search>
 * (docs/architecture/search-api.md 10): a combobox field driving a listbox of
 * options grouped by page, with aria-activedescendant, arrows, Home/End and
 * Enter, and the jump to a result (on this page: scroll, open, focus).
 */
(function (UC) {
  "use strict";
  if (!UC) return;

  const { h, uid } = UC.internal;

  /** Opens the <details> around `target` (a collapsed week or exercise) so it can be shown. */
  function reveal(target) {
    for (let node = target.parentElement; node; node = node.parentElement) {
      if (node.localName === "details" && !node.open) node.open = true;
    }
  }

  /**
   * Follows a result link. Another page: a normal navigation. This page: sets
   * the #hash, opens what hides the target, scrolls to it, flashes it and
   * moves focus there (after `leave()`, e.g. closing the dialog).
   */
  function go(href, leave) {
    const url = new URL(href, document.baseURI);
    const here = window.location;
    if (url.origin !== here.origin || url.pathname !== here.pathname || url.search !== here.search) {
      if (leave) leave(false);
      here.assign(url.href);
      return;
    }
    if (leave) leave(true);
    if (url.hash && url.hash !== here.hash) window.history.pushState(null, "", url.hash);
    const id = decodeURIComponent(url.hash.slice(1));
    const target = id ? document.getElementById(id) : document.querySelector("main h1, h1");
    if (!target) return;
    reveal(target);
    if (id) UC.internal.anchors.revisitHash();
    else target.scrollIntoView({ block: "start" });
    if (!target.matches("a[href], button, input, select, textarea, [tabindex]")) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  }

  /**
   * Wires `input` (role="combobox") to a new listbox. `leave(samePage)` runs
   * before a result is followed. Returns { list, render(result), clear() }.
   */
  function resultsList(input, leave) {
    const list = h("div", { class: "uc-search__results", id: uid("uc-search-results"), role: "listbox" });
    let options = [];
    let active = -1;
    Object.entries({ role: "combobox", "aria-autocomplete": "list", "aria-expanded": "false", "aria-controls": list.id, autocomplete: "off", spellcheck: "false" }).forEach(([name, value]) =>
      input.setAttribute(name, value),
    );

    function setActive(next) {
      if (!options.length) return;
      if (active >= 0) options[active].setAttribute("aria-selected", "false");
      active = (next + options.length) % options.length;
      const option = options[active];
      option.setAttribute("aria-selected", "true");
      input.setAttribute("aria-activedescendant", option.id);
      option.scrollIntoView({ block: "nearest" });
    }

    input.addEventListener("keydown", (event) => {
      const moves = { ArrowDown: active + 1, ArrowUp: active - 1, PageDown: active + 5, PageUp: active - 5 };
      if (event.key in moves && options.length) {
        event.preventDefault();
        setActive(event.key.startsWith("Page") ? Math.max(0, Math.min(options.length - 1, moves[event.key])) : moves[event.key]);
      } else if (event.key === "Enter" && active >= 0) {
        event.preventDefault();
        go(options[active].getAttribute("href"), leave);
      }
    });

    list.addEventListener("click", (event) => {
      const option = event.target.closest("[role='option']");
      // Ctrl/⌘/Shift-click and the middle button open a new tab as links do.
      if (!option || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      go(option.getAttribute("href"), leave);
    });
    // Options are not in the tab order: the field keeps focus (aria-activedescendant).
    list.addEventListener("mousedown", (event) => {
      if (event.target.closest("[role='option']")) event.preventDefault();
    });

    function clear() {
      list.textContent = "";
      options = [];
      active = -1;
      input.removeAttribute("aria-activedescendant");
      input.setAttribute("aria-expanded", "false");
    }

    /** Shows a result of searchEngine.search(). */
    function render({ groups, terms }) {
      clear();
      const { highlight } = UC.internal.searchEngine;
      for (const group of groups) {
        const labelId = uid("uc-search-group");
        const box = h("div", { class: "uc-search__group", role: "group", "aria-labelledby": labelId }, h("div", { class: "uc-search__group-label", id: labelId }, group.label));
        for (const result of group.results) {
          const option = h(
            "a",
            { class: "uc-search__option", id: uid("uc-search-option"), role: "option", "aria-selected": "false", tabindex: "-1", href: result.href },
            h("span", { class: "uc-search__title" }, highlight(result.title, terms)),
            result.text ? h("span", { class: "uc-search__text" }, highlight(result.text, terms)) : null,
          );
          options.push(option);
          box.append(option);
        }
        list.append(box);
      }
      input.setAttribute("aria-expanded", String(options.length > 0));
      if (options.length) setActive(0);
    }

    return { list, render, clear };
  }

  /** "12 resultados", "Sem resultados para «x».", or "" for an empty query. */
  function countText(result, query) {
    if (!query.trim()) return "";
    if (!result.count) return UC.t("search.empty", { query: query.trim() });
    return result.count === 1 ? UC.t("search.countOne") : UC.t("search.count", { n: result.count });
  }

  Object.assign(UC.internal, { searchResults: resultsList, searchGo: go, searchCount: countText });
})(window.UC);
