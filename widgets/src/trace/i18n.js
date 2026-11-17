/**
 * Strings of <uc-widget-trace>, `widget.trace.*`. The teacher's sentences
 * go through `text`, whose parameters are the sentence in each language.
 */
export const strings = {
  pt: {
    caption: { trace: "Execução passo a passo" },
    text: "{pt}",
    start: "Estado inicial.",
    edit: "Passos (JSON)",
    describe: {
      array: "Vetor: {values}.",
      tree: "Árvore: {nodes}.",
      grid: "Tabela de {r} linhas e {c} colunas: {rows}.",
      graph: "Grafo com {n} vértices e {m} arestas: {edges}.",
      empty: "vazio",
    },
    column: { node: "Nó", note: "Nota", row: "Linha" },
    error: {
      json: "o JSON dos passos não é válido ({detail}).",
      view: "view «{view}» desconhecida: use array, tree, graph ou grid.",
      graph: "a vista graph precisa do grafo em \"graph\" (por exemplo \"A B; B C\").",
      steps: "faltam os passos: \"steps\" tem de ser uma lista com pelo menos um passo.",
      step: "o passo {n} não é um objeto { … } válido.",
      state: "o passo {n} não tem estado (\"state\") e não há um passo anterior que o tenha.",
      shape: "o estado do passo {n} não serve para a vista {view}.",
      mark: "passo {n}: estado «{state}» desconhecido (use current, compared, swapped, visited ou done).",
      line: "passo {n}: a linha «{line}» não existe no pseudocódigo (\"code\").",
      say: "passo {n}: falta a frase (\"say\").",
      predict: "passo {n}: a pergunta (\"predict\") precisa de \"ask\", 2 a 4 \"options\" e \"answer\" (o índice da certa, a partir de 0).",
    },
  },
  en: {
    caption: { trace: "Step-by-step trace" },
    text: "{en}",
    start: "Initial state.",
    edit: "Steps (JSON)",
    describe: {
      array: "Array: {values}.",
      tree: "Tree: {nodes}.",
      grid: "Table of {r} rows and {c} columns: {rows}.",
      graph: "Graph with {n} vertices and {m} edges: {edges}.",
      empty: "empty",
    },
    column: { node: "Node", note: "Note", row: "Row" },
    error: {
      json: "the JSON of the steps is not valid ({detail}).",
      view: "unknown view “{view}”: use array, tree, graph or grid.",
      graph: "the graph view needs the graph in \"graph\" (for example \"A B; B C\").",
      steps: "the steps are missing: \"steps\" must be a list with at least one step.",
      step: "step {n} is not a valid { … } object.",
      state: "step {n} has no state (\"state\") and no earlier step has one.",
      shape: "the state of step {n} does not fit the {view} view.",
      mark: "step {n}: unknown state “{state}” (use current, compared, swapped, visited or done).",
      line: "step {n}: line “{line}” is not in the pseudocode (\"code\").",
      say: "step {n}: the sentence (\"say\") is missing.",
      predict: "step {n}: the question (\"predict\") needs \"ask\", 2 to 4 \"options\" and \"answer\" (the index of the right one, from 0).",
    },
  },
};
