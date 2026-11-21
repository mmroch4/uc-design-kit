/**
 * Two drawings one above the other in a widget's <svg> (an array above a
 * tree: heap, union-find). Not in the core: bundled into each widget that
 * imports it (rule 16.3).
 *
 *   const [top, bottom] = parts(svg, "heap", W.util.svgEl);
 *   W.svg.array(top, …);
 *   W.svg.tree(bottom, …);
 *   stack(svg, top, bottom);
 */
const GAP = 12; // between the two drawings

/** The two nested <svg> of `svg` (made with the core's svgEl), made again only when the kind of widget changes. */
export function parts(svg, kind, svgEl) {
  if (svg.__ucKind !== kind) {
    svg.__ucKind = kind;
    svg.replaceChildren(svgEl("svg"), svgEl("svg"));
  }
  return svg.children;
}

/** Centres both drawings (by their viewBox), `top` first, and sizes `svg` to hold them. */
export function stack(svg, top, bottom) {
  const size = (part) => part.getAttribute("viewBox").split(" ").map(Number);
  const [, , aw, ah] = size(top);
  const [, , bw, bh] = size(bottom);
  const width = Math.max(aw, bw);
  const place = (part, w, h, y) => {
    for (const [name, value] of Object.entries({ x: (width - w) / 2, y, width: w, height: h })) part.setAttribute(name, value);
  };
  place(top, aw, ah, 0);
  place(bottom, bw, bh, ah + GAP);
  svg.setAttribute("viewBox", `0 0 ${width} ${ah + GAP + bh}`);
  svg.style.minWidth = top.style.minWidth;
  svg.style.maxWidth = `${width}px`;
}
