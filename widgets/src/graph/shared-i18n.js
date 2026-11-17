/**
 * Strings every graph widget uses the same way (graph, shortest-path; W5's
 * graph widgets too). Each widget spreads them into its own namespace, so a
 * page can load any one of them alone.
 */
export const shared = {
  pt: {
    vertex: "{v}",
    describe: "Grafo {kind} com {n} vértices e {m} arestas: {edges}.",
    kind: { directed: "dirigido", undirected: "não dirigido" },
    edit: "Arestas (separadas por ;)",
    column: { vertex: "Vértice", parent: "Pai" },
    error: {
      empty: "o grafo não tem vértices.",
      source: "a origem «{v}» não é um vértice do grafo.",
    },
  },
  en: {
    vertex: "{v}",
    describe: "{kind} graph with {n} vertices and {m} edges: {edges}.",
    kind: { directed: "Directed", undirected: "Undirected" },
    edit: "Edges (separated by ;)",
    column: { vertex: "Vertex", parent: "Parent" },
    error: {
      empty: "the graph has no vertices.",
      source: "the source “{v}” is not a vertex of the graph.",
    },
  },
};
