/** Small DOM helpers shared by the core (a copy of the kit's el(), which is internal). */

export const SVG_NS = "http://www.w3.org/2000/svg";

/** Creates an element: attributes (on* = listeners, true = empty, false/null = absent) and children. */
export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [name, value] of Object.entries(attrs)) {
    if (name.startsWith("on")) node.addEventListener(name.slice(2).toLowerCase(), value);
    else if (value !== null && value !== undefined && value !== false) node.setAttribute(name, value === true ? "" : value);
  }
  node.append(...children.flat().filter((child) => child !== null && child !== undefined && child !== false));
  return node;
}

/** Creates an SVG element with attributes. */
export function svgEl(tag, attrs = {}) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [name, value] of Object.entries(attrs)) node.setAttribute(name, value);
  return node;
}

const ICONS = {
  play: '<path d="M7 5v14l12-7z" fill="currentColor" stroke="none"/>',
  pause: '<path d="M7 5h3v14H7zM14 5h3v14h-3z" fill="currentColor" stroke="none"/>',
  back: '<path d="m15 6-6 6 6 6"/>',
  step: '<path d="m9 6 6 6-6 6"/>',
  reset: '<path d="M4 12a8 8 0 1 0 2.3-5.6M4 4v4h4"/>',
};

/** A decorative inline icon (hidden from assistive technology). */
export function icon(name) {
  const span = el("span", { class: "uc-widget__icon", "aria-hidden": "true" });
  span.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" focusable="false">${ICONS[name]}</svg>`;
  return span;
}
