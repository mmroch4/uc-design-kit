/**
 * What the binary search tree widgets share (bst and avl): the nodes of a
 * tree ({ v, l, r }) in order, and each node's children in words.
 */

/** Every node of a tree, in order. */
export function nodes(node, out = []) {
  if (node) {
    nodes(node.l, out);
    out.push(node);
    nodes(node.r, out);
  }
  return out;
}

/** "5 has children 3 and 8. 3 has left child 1." with the widget's strings `t`. */
export function childrenText(root, t) {
  return nodes(root)
    .filter((node) => node.l || node.r)
    .map((node) => {
      const a = node.l && node.l.v;
      const b = node.r && node.r.v;
      return t("children", { v: node.v, kids: node.l && node.r ? t("and", { a, b }) : node.l ? t("leftOnly", { a }) : t("rightOnly", { b }) });
    })
    .join(" ");
}
