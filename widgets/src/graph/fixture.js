/**
 * Test inputs as text (meta.json `test`, tests/widgets): { text, directed,
 * source } → the { graph, source } that run() takes. Not bundled into the
 * widget (the browser parses with UC.widgets.parse, see element.js).
 * tests/widgets/helpers.mjs applies a widget's fixture.js when it has one.
 */
import { graph as parseGraph } from "../core/parse.js";
import { model, source } from "./model.js";

export function input(fixture, id = "graph") {
  if (!fixture || typeof fixture.text !== "string") return fixture;
  const graph = model(parseGraph(fixture.text.replace(/;/g, "\n")), Boolean(fixture.directed));
  return { graph, source: source(graph, fixture.source ?? null, id) };
}
