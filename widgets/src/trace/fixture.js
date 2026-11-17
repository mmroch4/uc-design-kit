/** Test inputs (meta.json `test`, tests/widgets): the JSON of the page → { data, graph }. Not bundled. */
import { graph as parseGraph } from "../core/parse.js";
import { model } from "../graph/model.js";

export function input(data) {
  if (data && data.data) return data;
  const graph = data && data.view === "graph" && data.graph ? model(parseGraph(String(data.graph ?? "").replace(/;/g, "\n")), Boolean(data.directed)) : null;
  return { data, graph };
}
