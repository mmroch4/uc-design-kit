/**
 * Shared input parsers (docs/plan/widgets-api.md 5). Pure: they throw
 * InputError with an i18n key, which the widget turns into an error note.
 */
import { InputError, random as seeded } from "./engine.js";

const INTEGER = /^[+-]?\d+$/;

/**
 * "5 3 8 1", "5, 3, 8, 1", "random 8" or "random 8 1..99" → numbers.
 * Options: max (cell limit), random (a seeded generator, for "random"),
 * text (accept tokens that are not numbers, e.g. words for a hash table).
 */
export function values(text, { max = 16, random = seeded(1), text: words = false } = {}) {
  const source = String(text ?? "").trim();
  const tokens = source ? source.split(/[\s,]+/).filter(Boolean) : [];
  if (tokens[0] === "random") {
    const match = /^random\s+(\d+)(?:\s+(-?\d+)\.\.(-?\d+))?$/.exec(source.replace(/,/g, " ").replace(/\s+/g, " "));
    if (!match) throw new InputError("widget.core.error.random");
    const count = Number(match[1]);
    const low = match[2] === undefined ? 1 : Number(match[2]);
    const high = match[3] === undefined ? 99 : Number(match[3]);
    if (count > max) throw new InputError("widget.core.error.tooLarge", { max });
    if (low > high) throw new InputError("widget.core.error.random");
    return Array.from({ length: count }, () => random.int(low, high));
  }
  if (tokens.length > max) throw new InputError("widget.core.error.tooLarge", { max });
  return tokens.map((token) => {
    if (words) return INTEGER.test(token) ? Number(token) : token;
    if (!INTEGER.test(token)) throw new InputError("widget.core.error.notInteger", { token });
    return Number(token);
  });
}

/** "insert 40; remove 30; min" → [{ verb: "insert", args: ["40"] }, …]; verbs must be in `verbs`. */
export function ops(text, verbs = []) {
  return String(text ?? "")
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const [verb, ...args] = part.split(/\s+/);
      if (verbs.length && !verbs.includes(verb)) throw new InputError("widget.core.error.verb", { verb, verbs: verbs.join(", ") });
      return { verb, args };
    });
}

/**
 * Graph lines (5.3): "U V [W]" edges, "U" vertices, "U @ X,Y" positions,
 * "# comments". → { vertices: [names], edges: [{ from, to, weight }], positions: { name: [x, y] }, weighted }.
 */
export function graph(text, { maxVertices = 10, maxEdges = 20 } = {}) {
  const vertices = [];
  const edges = [];
  const positions = {};
  const add = (name) => {
    if (!vertices.includes(name)) vertices.push(name);
  };
  for (const raw of String(text ?? "").split("\n")) {
    const line = raw.replace(/#.*$/, "").trim();
    if (!line) continue;
    const at = /^(\S+)\s*@\s*([\d.]+)\s*,\s*([\d.]+)$/.exec(line);
    if (at) {
      add(at[1]);
      positions[at[1]] = [Number(at[2]), Number(at[3])];
      continue;
    }
    const tokens = line.split(/\s+/);
    if (tokens.length > 3 || (tokens.length === 3 && !INTEGER.test(tokens[2]))) throw new InputError("widget.core.error.line", { line });
    tokens.slice(0, 2).forEach(add);
    if (tokens.length > 1) edges.push({ from: tokens[0], to: tokens[1], weight: tokens.length === 3 ? Number(tokens[2]) : null });
  }
  const weighted = edges.some((edge) => edge.weight !== null);
  const unweighted = edges.find((edge) => edge.weight === null);
  if (weighted && unweighted) throw new InputError("widget.core.error.weight", { line: `${unweighted.from} ${unweighted.to}` });
  if (vertices.length > maxVertices) throw new InputError("widget.core.error.tooLarge", { max: maxVertices });
  if (edges.length > maxEdges) throw new InputError("widget.core.error.tooLarge", { max: maxEdges });
  return { vertices, edges, positions, weighted };
}
