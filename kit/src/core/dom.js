/** Small DOM helpers and the icon set used by components. */
(function (UC) {
  "use strict";
  if (UC.__duplicate) return;

  /**
   * Creates an element. `attrs` keys map to attributes, except:
   *   class -> className, dataset -> data-*, on<Event> -> listener,
   *   html -> innerHTML (trusted, teacher-authored HTMLText from course.js;
   *           its relative links are resolved against course.js).
   * Children may be nodes, strings or arrays; null/false are skipped.
   */
  function h(tag, attrs, ...children) {
    const element = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs || {})) {
      if (value === null || value === undefined || value === false) continue;
      if (key === "class") element.className = value;
      else if (key === "dataset") Object.assign(element.dataset, value);
      else if (key === "html") {
        element.innerHTML = value;
        if (UC.internal.resolveCourseLinks) UC.internal.resolveCourseLinks(element);
      }
      else if (key.startsWith("on") && typeof value === "function") element.addEventListener(key.slice(2).toLowerCase(), value);
      else element.setAttribute(key, value === true ? "" : String(value));
    }
    append(element, children);
    return element;
  }

  function append(parent, children) {
    for (const child of children.flat(Infinity)) {
      if (child === null || child === undefined || child === false) continue;
      parent.append(child instanceof Node ? child : document.createTextNode(String(child)));
    }
    return parent;
  }

  /** Parses a trusted HTML string into a DocumentFragment. */
  function fragment(html) {
    const template = document.createElement("template");
    template.innerHTML = html;
    return template.content;
  }

  const SVG_ATTRS = 'xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" aria-hidden="true" focusable="false"';
  const small = (paths) => `<svg ${SVG_ATTRS} width="16" height="16" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
  const ICONS = {
    chevronDown: `<svg ${SVG_ATTRS} width="18" height="18" viewBox="0 0 24 24" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>`,
    menu: `<svg ${SVG_ATTRS} width="20" height="20" viewBox="0 0 24 24" stroke-width="2"><path d="M4 7h16M4 12h16M4 17h16"/></svg>`,
    external: `<svg ${SVG_ATTRS} width="14" height="14" viewBox="0 0 16 16" stroke-width="1.6"><path d="M6 3h7v7M13 3 4 12"/></svg>`,
    lock: `<svg ${SVG_ATTRS} width="16" height="16" viewBox="0 0 24 24" stroke-width="2"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>`,
    check: `<svg ${SVG_ATTRS} width="16" height="16" viewBox="0 0 24 24" stroke-width="2.4"><path d="m5 12 5 5 9-10"/></svg>`,
    checkCircle: `<svg ${SVG_ATTRS} width="22" height="22" viewBox="0 0 24 24" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></svg>`,
    copy: `<svg ${SVG_ATTRS} width="16" height="16" viewBox="0 0 24 24" stroke-width="2"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a1 1 0 0 1 1-1h10"/></svg>`,
    download: `<svg ${SVG_ATTRS} width="16" height="16" viewBox="0 0 24 24" stroke-width="2"><path d="M12 4v11m0 0-4-4m4 4 4-4M5 20h14"/></svg>`,
    play: `<svg ${SVG_ATTRS} width="16" height="16" viewBox="0 0 24 24" stroke-width="2" stroke-linejoin="round"><path d="M7 5v14l12-7z"/></svg>`,
    reset: `<svg ${SVG_ATTRS} width="16" height="16" viewBox="0 0 24 24" stroke-width="2"><path d="M4 12a8 8 0 1 0 2.3-5.6M4 4v4h4"/></svg>`,
    // Material types of <uc-materials> (decorative: the type is also text).
    pdf: small('<path d="M6 3h8l4 4v14H6zM14 3v4h4M9 13h6M9 17h6"/>'),
    notebook: small('<path d="M6 3h12v18H6zM10 3v18M13 8h2"/>'),
    github: small('<circle cx="7" cy="5" r="2"/><circle cx="7" cy="19" r="2"/><circle cx="17" cy="7" r="2"/><path d="M7 7v10M17 9c0 5-10 3-10 8"/>'),
    video: small('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m10 9 5 3-5 3z"/>'),
    archive: small('<path d="M4 4h16v5H4zM5 9v11h14V9M10 13h4"/>'),
    code: small('<path d="m8 8-4 4 4 4M16 8l4 4-4 4"/>'),
    slides: small('<path d="M3 4h18v12H3zM12 16v4M8 20h8"/>'),
    link: small('<path d="M10 14a4 4 0 0 0 6 0l3-3a4 4 0 0 0-6-6l-1 1M14 10a4 4 0 0 0-6 0l-3 3a4 4 0 0 0 6 6l1-1"/>'),
    tree: `<svg ${SVG_ATTRS} width="28" height="28" viewBox="0 0 28 28" stroke-width="2"><circle cx="14" cy="5" r="3"/><circle cx="6" cy="22" r="3"/><circle cx="22" cy="22" r="3"/><path d="M12.5 7.5 7.5 19.5M15.5 7.5l5 12"/></svg>`,
  };

  /** Returns a fresh SVG element for a named icon. */
  function icon(name) {
    return fragment(ICONS[name] || "").firstElementChild;
  }

  /** Generates a unique id with a readable prefix. */
  let counter = 0;
  function uid(prefix) {
    counter += 1;
    return `${prefix || "uc"}-${counter}`;
  }

  /** True when an href points to another site. */
  function isExternal(href) {
    try {
      const url = new URL(href, window.location.href);
      return /^https?:$/.test(url.protocol) && url.host !== window.location.host;
    } catch (error) {
      return false;
    }
  }

  /** Reads a boolean attribute. */
  const flag = (element, name) => element.hasAttribute(name);

  /** Reads a numeric attribute with a default. */
  function number(element, name, fallback) {
    const value = Number(element.getAttribute(name));
    return element.hasAttribute(name) && Number.isFinite(value) ? value : fallback;
  }

  /**
   * The tag for a component's generated heading: `heading-level="3"` gives "h3".
   * Levels 2 to 6 are accepted; anything else falls back to "h2".
   */
  function headingTag(element) {
    if (!element.hasAttribute("heading-level")) return "h2";
    const level = Number(element.getAttribute("heading-level"));
    if (Number.isInteger(level) && level >= 2 && level <= 6) return `h${level}`;
    console.warn(`[uc-kit] <${element.localName}> heading-level must be 2 to 6; using 2.`);
    return "h2";
  }

  Object.assign(UC.internal, { h, append, fragment, icon, uid, isExternal, flag, number, headingTag });
})(window.UC);
