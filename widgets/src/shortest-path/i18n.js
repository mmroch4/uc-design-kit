/**
 * Strings of <uc-widget-shortest-path>, `widget.shortest-path.*`, and its
 * default pseudocode ("<line id>|<text>", same ids in every language). The
 * graph widgets' shared strings (input errors, columns, `vertex`) are copied
 * in under this namespace (../graph/shared-i18n.js).
 */
import { shared } from "../graph/shared-i18n.js";

export const strings = {
  pt: {
    ...shared.pt,
    caption: { dijkstra: "Algoritmo de Dijkstra", "bellman-ford": "Algoritmo de Bellman-Ford" },
    describeNotes: " Distâncias: {notes}.",
    aux: { pq: "Fila de prioridade (vértice:distância)", round: "Ronda" },
    error: { ...shared.pt.error, negative: "o Dijkstra não aceita pesos negativos ({edge}); use algorithm=\"bellman-ford\"." },
    start: {
      dijkstra: "Dijkstra a partir de {s}, num grafo com {n} vértices e {m} arestas.",
      "bellman-ford": "Bellman-Ford a partir de {s}, num grafo com {n} vértices e {m} arestas.",
    },
    init: "dist[{s}] = 0; os outros vértices ficam a ∞.",
    pop: "Sai da fila {u} com distância {d}: é a distância final de {u}.",
    stale: "Sai da fila o par {u}:{d}, já ultrapassado (dist[{u}] = {du}): ignorar.",
    fixed: "{u} {arrow} {v}: {v} já tem a distância final.",
    unreached: "{u} {arrow} {v}: dist[{u}] = ∞, nada a fazer.",
    keep: "{u} {arrow} {v} (peso {w}): {du} + {wt} = {nd} não melhora dist[{v}] = {dv}.",
    update: "{u} {arrow} {v} (peso {w}): {du} + {wt} = {nd} < {dv}; dist[{v}] = {nd}, pai[{v}] = {u}.",
    push: "{v} entra na fila com distância {d}.",
    round: "Ronda {r} de {total}: relaxar todas as arestas.",
    stop: "Nada mudou na ronda {r}: as distâncias são finais.",
    check: "Mais uma passagem por todas as arestas, à procura de um ciclo negativo.",
    cycle: "{u} {arrow} {v} (peso {w}) ainda melhora dist[{v}]: há um ciclo de peso negativo, as distâncias não estão definidas.",
    end: "Distâncias a partir de {s}: {list}.",
    endLost: "Distâncias a partir de {s}: {list}. Inacessíveis: {lost}.",
    predict: {
      pop: "Que vértice sai da fila a seguir com a sua distância final?",
      relax: "{u} {arrow} {v} (peso {w}) melhora dist[{v}] = {dv}?",
    },
    code: {
      dijkstra: [
        "|dijkstra(G, s):",
        "init|  dist[v] = ∞ para todo v; dist[s] = 0; fila = {(0, s)}",
        "|  enquanto a fila não está vazia:",
        "pop|    (d, u) = fila.retirar_mínimo()",
        "stale|    se d > dist[u]: continuar",
        "edge|    para cada aresta u → v com peso w:",
        "relax|      se dist[u] + w < dist[v]:",
        "update|        dist[v] = dist[u] + w; pai[v] = u",
        "push|        fila.inserir((dist[v], v))",
      ],
      "bellman-ford": [
        "|bellmanFord(G, s):",
        "init|  dist[v] = ∞ para todo v; dist[s] = 0",
        "round|  repetir |V| − 1 vezes:",
        "relax|    para cada aresta u → v com peso w:",
        "update|      se dist[u] + w < dist[v]: dist[v] = dist[u] + w",
        "stop|    se nada mudou: parar",
        "check|  para cada aresta u → v com peso w:",
        "cycle|    se dist[u] + w < dist[v]: ciclo negativo",
      ],
    },
  },
  en: {
    ...shared.en,
    caption: { dijkstra: "Dijkstra's algorithm", "bellman-ford": "Bellman-Ford algorithm" },
    describeNotes: " Distances: {notes}.",
    aux: { pq: "Priority queue (vertex:distance)", round: "Round" },
    error: { ...shared.en.error, negative: "Dijkstra does not accept negative weights ({edge}); use algorithm=\"bellman-ford\"." },
    start: {
      dijkstra: "Dijkstra from {s}, in a graph with {n} vertices and {m} edges.",
      "bellman-ford": "Bellman-Ford from {s}, in a graph with {n} vertices and {m} edges.",
    },
    init: "dist[{s}] = 0; the other vertices stay at ∞.",
    pop: "{u} leaves the queue with distance {d}: it is the final distance of {u}.",
    stale: "The pair {u}:{d} leaves the queue, out of date (dist[{u}] = {du}): skip it.",
    fixed: "{u} {arrow} {v}: {v} already has its final distance.",
    unreached: "{u} {arrow} {v}: dist[{u}] = ∞, nothing to do.",
    keep: "{u} {arrow} {v} (weight {w}): {du} + {wt} = {nd} does not improve dist[{v}] = {dv}.",
    update: "{u} {arrow} {v} (weight {w}): {du} + {wt} = {nd} < {dv}; dist[{v}] = {nd}, parent[{v}] = {u}.",
    push: "{v} joins the queue with distance {d}.",
    round: "Round {r} of {total}: relax every edge.",
    stop: "Nothing changed in round {r}: the distances are final.",
    check: "One more pass over every edge, looking for a negative cycle.",
    cycle: "{u} {arrow} {v} (weight {w}) still improves dist[{v}]: there is a negative-weight cycle, the distances are not defined.",
    end: "Distances from {s}: {list}.",
    endLost: "Distances from {s}: {list}. Unreachable: {lost}.",
    predict: {
      pop: "Which vertex leaves the queue next with its final distance?",
      relax: "Does {u} {arrow} {v} (weight {w}) improve dist[{v}] = {dv}?",
    },
    code: {
      dijkstra: [
        "|dijkstra(G, s):",
        "init|  dist[v] = ∞ for every v; dist[s] = 0; queue = {(0, s)}",
        "|  while the queue is not empty:",
        "pop|    (d, u) = queue.extract_min()",
        "stale|    if d > dist[u]: continue",
        "edge|    for each edge u → v with weight w:",
        "relax|      if dist[u] + w < dist[v]:",
        "update|        dist[v] = dist[u] + w; parent[v] = u",
        "push|        queue.insert((dist[v], v))",
      ],
      "bellman-ford": [
        "|bellmanFord(G, s):",
        "init|  dist[v] = ∞ for every v; dist[s] = 0",
        "round|  repeat |V| − 1 times:",
        "relax|    for each edge u → v with weight w:",
        "update|      if dist[u] + w < dist[v]: dist[v] = dist[u] + w",
        "stop|    if nothing changed: stop",
        "check|  for each edge u → v with weight w:",
        "cycle|    if dist[u] + w < dist[v]: negative cycle",
      ],
    },
  },
};
