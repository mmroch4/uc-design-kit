/** Random graphs for the graph widget tests (graph, shortest-path, mst, toposort). */
import { model } from "../../widgets/src/graph/model.js";

/** A random graph: up to 10 vertices, up to 20 edges (5.5), sometimes disconnected. */
export function randomGraph(rng, { weights = null, directed = rng.int(0, 1) === 1 } = {}) {
  const n = rng.int(1, 10);
  const vertices = Array.from({ length: n }, (_, i) => String.fromCharCode(65 + i));
  const edges = Array.from({ length: rng.int(0, 20) }, () => ({ from: rng.pick(vertices), to: rng.pick(vertices), weight: weights ? rng.int(...weights) : null }));
  return model({ vertices, edges, positions: {}, weighted: Boolean(weights) }, directed);
}

