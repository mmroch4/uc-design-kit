/**
 * Strings of <uc-widget-toposort>, `widget.toposort.*`, and its default
 * pseudocode ("<line id>|<text>", same ids in every language). The graph
 * widgets' shared strings are copied in under this namespace
 * (../graph/shared-i18n.js).
 */
import { shared } from "../graph/shared-i18n.js";

export const strings = {
  pt: {
    ...shared.pt,
    caption: { kahn: "Algoritmo de Kahn", dfs: "Ordenação por DFS" },
    column: { ...shared.pt.column, indegree: "Grau de entrada", situation: "Situação" },
    describeNotes: " Graus de entrada: {notes}.",
    start: {
      kahn: "Ordenação topológica (Kahn) de um grafo dirigido com {n} vértices e {m} arcos.",
      dfs: "Ordenação topológica por DFS de um grafo dirigido com {n} vértices e {m} arcos.",
    },
    init: "Ao lado de cada vértice, o grau de entrada. Entram na fila os de grau 0: {list}.",
    initNone: "Ao lado de cada vértice, o grau de entrada. Nenhum tem grau 0: a fila fica vazia.",
    pop: "Sai da fila {u} e vai para a saída: {list}.",
    dec: "{u} → {v}: o grau de entrada de {v} passa a {d}.",
    push: "{u} → {v}: o grau de entrada de {v} passa a 0; {v} entra na fila.",
    cycle: "A fila esvaziou, mas há vértices com grau de entrada > 0 ({list}): há um ciclo ({ring}) e não há ordem topológica. Saída parcial: {order}.",
    root: "{u} ainda não foi visitado: nova pesquisa a partir de {u}, que entra na pilha.",
    down: "{u} → {v}: {v} ainda não foi visitado; visita {v}, que entra na pilha.",
    finished: "{u} → {v}: {v} já terminou, nada a fazer.",
    done: "{u} termina e vai para o início da ordem: {list}.",
    back: "{u} → {v}: {v} está na pilha, por isso há um ciclo ({ring}); não há ordem topológica.",
    end: "Ordem topológica: {list}.",
    colour: { new: "Ainda não visitado", stack: "Na pilha", done: "Já terminou" },
    predict: {
      zero: "{u} → {v}: o grau de entrada de {v} passa a 0?",
      state: "{u} → {v}: em que situação está {v}?",
    },
    code: {
      kahn: [
        "|kahn(G):",
        "init|  grau[v] = n.º de arcos que chegam a v",
        "init|  fila = vértices com grau 0",
        "|  enquanto a fila não está vazia:",
        "pop|    u = fila.retirar(); saída += u",
        "|    para cada arco u → v:",
        "dec push|      grau[v] = grau[v] − 1",
        "push|      se grau[v] = 0: fila.inserir(v)",
        "cycle|  se |saída| < |V|: há um ciclo",
      ],
      dfs: [
        "|ordenarDFS(G):",
        "|  ordem = lista vazia",
        "|  para cada vértice s por visitar:",
        "root|    visitar(s)",
        "|visitar(u):",
        "enter|  u entra na pilha",
        "arc|  para cada arco u → v:",
        "back|    se v está na pilha: há um ciclo",
        "down|    se v ainda não foi visitado: visitar(v)",
        "done|  u sai da pilha; ordem = u + ordem",
      ],
    },
  },
  en: {
    ...shared.en,
    caption: { kahn: "Kahn's algorithm", dfs: "Sorting by DFS" },
    column: { ...shared.en.column, indegree: "In-degree", situation: "Situation" },
    describeNotes: " In-degrees: {notes}.",
    start: {
      kahn: "Topological sort (Kahn) of a directed graph with {n} vertices and {m} arcs.",
      dfs: "Topological sort by DFS of a directed graph with {n} vertices and {m} arcs.",
    },
    init: "Beside each vertex, its in-degree. The ones with in-degree 0 join the queue: {list}.",
    initNone: "Beside each vertex, its in-degree. None has in-degree 0: the queue stays empty.",
    pop: "{u} leaves the queue and goes to the output: {list}.",
    dec: "{u} → {v}: the in-degree of {v} drops to {d}.",
    push: "{u} → {v}: the in-degree of {v} drops to 0; {v} joins the queue.",
    cycle: "The queue is empty, but some vertices have in-degree > 0 ({list}): there is a cycle ({ring}) and no topological order. Partial output: {order}.",
    root: "{u} is not visited yet: new search from {u}, which goes on the stack.",
    down: "{u} → {v}: {v} is not visited yet; visit {v}, which goes on the stack.",
    finished: "{u} → {v}: {v} is already finished, nothing to do.",
    done: "{u} finishes and goes to the front of the order: {list}.",
    back: "{u} → {v}: {v} is on the stack, so there is a cycle ({ring}); no topological order.",
    end: "Topological order: {list}.",
    colour: { new: "Not visited yet", stack: "On the stack", done: "Already finished" },
    predict: {
      zero: "{u} → {v}: does the in-degree of {v} drop to 0?",
      state: "{u} → {v}: what is the situation of {v}?",
    },
    code: {
      kahn: [
        "|kahn(G):",
        "init|  deg[v] = number of arcs into v",
        "init|  queue = vertices with deg 0",
        "|  while the queue is not empty:",
        "pop|    u = queue.remove(); output += u",
        "|    for each arc u → v:",
        "dec push|      deg[v] = deg[v] − 1",
        "push|      if deg[v] = 0: queue.insert(v)",
        "cycle|  if |output| < |V|: there is a cycle",
      ],
      dfs: [
        "|sortDFS(G):",
        "|  order = empty list",
        "|  for each vertex s not visited yet:",
        "root|    visit(s)",
        "|visit(u):",
        "enter|  u goes on the stack",
        "arc|  for each arc u → v:",
        "back|    if v is on the stack: there is a cycle",
        "down|    if v is not visited yet: visit(v)",
        "done|  u leaves the stack; order = u + order",
      ],
    },
  },
};
