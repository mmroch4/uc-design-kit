# `<uc-widget-trace>`

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/uc-widget-trace.html

Os passos do seu próprio algoritmo, escritos em JSON, reproduzidos com o desenho de um vetor, de uma árvore, de um grafo ou de uma tabela.

Exemplo (O máximo de um vetor, com pseudocódigo, variáveis e previsões), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-widget-trace/basic.html):

```html
    <uc-widget-trace caption="Máximo de um vetor" predict>
      <script type="application/json" data-input>
{
  "view": "array",
  "code": {
    "pt": ["start|m = a[0]", "loop|para i de 1 a n − 1:", "test|  se a[i] > m:", "take|    m = a[i]", "end|devolver m"],
    "en": ["start|m = a[0]", "loop|for i from 1 to n − 1:", "test|  if a[i] > m:", "take|    m = a[i]", "end|return m"]
  },
  "steps": [
    { "state": [4, 7, 2, 9, 5], "say": { "pt": "Procurar o máximo de 4 7 2 9 5.", "en": "Find the maximum of 4 7 2 9 5." } },
    { "marks": { "0": "current" }, "line": "start", "vars": { "m": 4 },
      "say": { "pt": "m começa com a[0] = 4.", "en": "m starts as a[0] = 4." } },
    { "marks": { "1": "current", "0": "visited" }, "pointers": { "i": "1" }, "line": ["test", "take"], "vars": { "i": 1, "m": 7 },
      "say": { "pt": "a[1] = 7 > 4: m passa a 7.", "en": "a[1] = 7 > 4: m becomes 7." },
      "predict": { "ask": { "pt": "a[1] = 7 é maior do que m = 4?", "en": "Is a[1] = 7 larger than m = 4?" }, "options": [{ "pt": "Sim", "en": "Yes" }, { "pt": "Não", "en": "No" }], "answer": 0 } },
    { "marks": { "2": "compared", "1": "current" }, "pointers": { "i": "2" }, "line": "test", "vars": { "i": 2, "m": 7 },
      "say": { "pt": "a[2] = 2 não é maior do que 7.", "en": "a[2] = 2 is not larger than 7." } },
    { "marks": { "3": "current", "1": "visited" }, "pointers": { "i": "3" }, "line": ["test", "take"], "vars": { "i": 3, "m": 9 },
      "say": { "pt": "a[3] = 9 > 7: m passa a 9.", "en": "a[3] = 9 > 7: m becomes 9." },
      "predict": { "ask": { "pt": "a[3] = 9 é maior do que m = 7?", "en": "Is a[3] = 9 larger than m = 7?" }, "options": [{ "pt": "Sim", "en": "Yes" }, { "pt": "Não", "en": "No" }], "answer": 0 } },
    { "marks": { "4": "compared", "3": "current" }, "pointers": { "i": "4" }, "line": "test", "vars": { "i": 4, "m": 9 },
      "say": { "pt": "a[4] = 5 não é maior do que 9.", "en": "a[4] = 5 is not larger than 9." } },
    { "marks": { "3": "done" }, "line": "end", "vars": { "m": 9 },
      "say": { "pt": "O máximo é 9, na posição 3.", "en": "The maximum is 9, at index 3." } }
  ]
}
      </script>
      <p>Máximo de 4 7 2 9 5: m = 4, 7, 7, 9, 9. O máximo é 9.</p>
    </uc-widget-trace>
```

Para um algoritmo que não está no catálogo, ou para mostrar uma execução tal como foi feita na aula, escreve os passos em JSON dentro do elemento e o widget reprodu-los com o mesmo leitor, narração, vista em texto e modo de previsão dos outros widgets. Não é preciso programar: cada passo diz o estado da estrutura, o que destacar e a frase a ler.

## Utilização

```html
<script src="https://uc-design-kit.miguelrocha.dev/widgets/v1/uc-widget-trace.js" defer></script>

<uc-widget-trace caption="Troca de dois elementos">
  <script type="application/json" data-input>
{
  "steps": [
    { "state": [3, 8], "say": "O vetor 3 8." },
    { "state": [8, 3], "marks": { "0": "swapped", "1": "swapped" }, "say": "Troca a[0] com a[1]." }
  ]
}
  </script>
  <p>Troca de 3 com 8: o vetor fica 8 3.</p>
</uc-widget-trace>
```

O JSON vai num `<script type="application/json" data-input>`, que o navegador não mostra; o texto escrito à parte (o parágrafo) é o que aparece sem JavaScript ou se o JSON tiver um erro. Um erro no JSON mostra uma nota com o número do passo e o que falta.

## O formato dos passos

| Campo | Onde | Descrição |
| --- | --- | --- |
| `view` | topo | O desenho: `array` (por omissão), `tree`, `graph` ou `grid`. |
| `code` | topo | O pseudocódigo, uma lista de linhas `"id\|texto"` (as linhas que nunca se destacam começam por `\|`), ou `{ "pt": [...], "en": [...] }`. |
| `graph`, `directed` | topo, vista `graph` | O grafo, com as linhas de [Escrever o grafo](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/uc-widget-graph.md#grafo) separadas por `;` (`"A B 4; A C 1"`), e se é dirigido. |
| `rowHeads`, `colHeads` | topo, vista `grid` | Os cabeçalhos das linhas e das colunas da tabela (opcionais). |
| `steps` | topo | A lista de passos (pelo menos um, até 2000). |
| `state` | passo | O estado da estrutura (tabela seguinte). Um passo sem `state` mantém o do passo anterior. |
| `marks` | passo | O que destacar: `{ "id": "estado" }`, com os estados `current`, `compared`, `swapped`, `visited` e `done` (ver [Usar widgets](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/usar.md)). |
| `pointers` | passo | Etiquetas por baixo das células (vetor) ou ao lado dos nós (árvore): `{ "i": "2", "j": "3" }`. |
| `line` | passo | O id da linha do pseudocódigo a destacar, ou uma lista de ids. |
| `say` | passo | A frase do passo (obrigatória): um texto, ou `{ "pt": "…", "en": "…" }` numa página bilingue. Uma língua que falte usa a outra. |
| `vars` | passo | Variáveis a mostrar no painel: `{ "i": 2, "m": 7 }`. |
| `predict` | passo | Uma pergunta antes deste passo, com `predict` no elemento: `{ "ask": "…", "options": ["Sim", "Não"], "answer": 0 }` (2 a 4 opções; `answer` é o índice da certa, a partir de 0; textos simples ou por língua). |

Se o primeiro passo tiver destaques ou uma pergunta, o widget junta antes dele um passo "Estado inicial." sem destaques.

## As quatro vistas

Exemplo (Árvore, tabela e grafo), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-widget-trace/views.html):

```html
    <uc-widget-trace caption="Avaliar uma árvore de expressão" controls="compact">
      <script type="application/json" data-input>
{
  "view": "tree",
  "steps": [
    { "state": { "id": "r", "v": "×", "l": { "id": "s", "v": "+", "l": { "v": 2 }, "r": { "v": 3 } }, "r": { "v": 4 } },
      "say": "(2 + 3) × 4" },
    { "marks": { "2": "visited", "3": "visited", "s": "current" },
      "state": { "id": "r", "v": "×", "l": { "id": "s", "v": "+", "note": "= 5", "l": { "v": 2 }, "r": { "v": 3 } }, "r": { "v": 4 } },
      "say": { "pt": "2 + 3 = 5.", "en": "2 + 3 = 5." } },
    { "marks": { "s": "done", "4": "visited", "r": "current" },
      "state": { "id": "r", "v": "×", "note": "= 20", "l": { "id": "s", "v": "+", "note": "= 5", "l": { "v": 2 }, "r": { "v": 3 } }, "r": { "v": 4 } },
      "say": { "pt": "5 × 4 = 20: o valor da expressão.", "en": "5 × 4 = 20: the value of the expression." } }
  ]
}
      </script>
      <p>(2 + 3) × 4 = 20.</p>
    </uc-widget-trace>

    <uc-widget-trace caption="Triângulo de Pascal" controls="compact">
      <script type="application/json" data-input>
{
  "view": "grid",
  "rowHeads": ["n=0", "n=1", "n=2", "n=3"],
  "steps": [
    { "state": [[1], [1, 1], [1, null, 1], [1, null, null, 1]], "say": { "pt": "As pontas valem 1.", "en": "The edges are 1." } },
    { "state": [[1], [1, 1], [1, 2, 1], [1, null, null, 1]], "marks": { "2,1": "current", "1,0": "compared", "1,1": "compared" },
      "say": { "pt": "C(2,1) = 1 + 1 = 2.", "en": "C(2,1) = 1 + 1 = 2." } },
    { "state": [[1], [1, 1], [1, 2, 1], [1, 3, null, 1]], "marks": { "3,1": "current", "2,0": "compared", "2,1": "compared" },
      "say": { "pt": "C(3,1) = 1 + 2 = 3.", "en": "C(3,1) = 1 + 2 = 3." } },
    { "state": [[1], [1, 1], [1, 2, 1], [1, 3, 3, 1]], "marks": { "3,2": "current", "2,1": "compared", "2,2": "compared" },
      "say": { "pt": "C(3,2) = 2 + 1 = 3.", "en": "C(3,2) = 2 + 1 = 3." } }
  ]
}
      </script>
      <p>Triângulo de Pascal até n = 3: 1; 1 1; 1 2 1; 1 3 3 1.</p>
    </uc-widget-trace>

    <uc-widget-trace caption="Coloração gulosa" controls="compact">
      <script type="application/json" data-input>
{
  "view": "graph",
  "graph": "A B; A C; B C; C D",
  "steps": [
    { "state": {}, "say": { "pt": "Dar a cada vértice a menor cor que os vizinhos não usam.", "en": "Give each vertex the smallest colour its neighbours do not use." } },
    { "state": { "A": "1" }, "marks": { "A": "current" }, "say": { "pt": "A: cor 1.", "en": "A: colour 1." } },
    { "state": { "A": "1", "B": "2" }, "marks": { "B": "current", "A": "compared" }, "say": { "pt": "B é vizinho de A (cor 1): cor 2.", "en": "B is a neighbour of A (colour 1): colour 2." } },
    { "state": { "A": "1", "B": "2", "C": "3" }, "marks": { "C": "current", "A": "compared", "B": "compared" }, "say": { "pt": "C é vizinho de A e de B: cor 3.", "en": "C is a neighbour of A and B: colour 3." } },
    { "state": { "A": "1", "B": "2", "C": "3", "D": "1" }, "marks": { "A": "done", "B": "done", "C": "done", "D": "done" }, "say": { "pt": "D só é vizinho de C: cor 1. Três cores.", "en": "D is only a neighbour of C: colour 1. Three colours." } }
  ]
}
      </script>
      <p>Coloração gulosa: A 1, B 2, C 3, D 1.</p>
    </uc-widget-trace>
```

| `view` | `state` | Ids de `marks` | Limite |
| --- | --- | --- | --- |
| `array` | Uma lista de valores; `null` é uma célula vazia: `[4, null, 9]`. | O índice: `"0"`, `"1"`, … | 16 células |
| `tree` | Um nó `{ "v": 5, "l": {…}, "r": {…} }` (binária) ou `{ "v": 5, "children": [ … ] }`; cada nó pode ter `"id"` (por omissão, o valor) e `"note"` (escrita ao lado). `null` é a árvore vazia. | O `id` do nó, ou o valor. | 15 nós |
| `graph` | As notas ao lado dos vértices: `{ "A": "0", "B": "4" }` (o grafo é o do campo `graph`). | O nome do vértice; uma aresta é `"A-B"` como escrita. | 10 vértices, 20 arestas |
| `grid` | Uma lista de linhas: `[[1], [1, 1], [1, 2, 1]]`. | `"linha,coluna"`: `"2,1"`. | 9 × 9 |

## Atributos

Só os [atributos comuns](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/usar.md#atributos-comuns); `caption` dá o título (por omissão "Execução passo a passo"). Com `editable`, o campo de edição recebe o JSON numa linha; para passos longos, é mais prático editar a página.

## Pseudocódigo

O campo `code` dá o pseudocódigo por omissão; um `<pre data-pseudocode>` com `<span data-line="id">` dentro do elemento substitui-o pelo código da linguagem da cadeira, com os mesmos ids (ver [Pseudocódigo próprio](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/usar.md#pseudocodigo)). Um `line` que não exista em `code` é um erro, para que uma gralha não passe despercebida.

## Acessibilidade

### O que o widget faz

Lê a frase de cada passo; descreve a estrutura em palavras (os valores do vetor, os nós da árvore com os filhos, as linhas da tabela, as arestas e as notas do grafo); estados com cor, espessura, tracejado e sinal; "Vista em texto" com todas as frases e uma tabela do estado.

### O que cabe a quem escreve

Frases que digam o que acontece com os valores ("a[3] = 9 > 7: m passa a 9."), não só "agora este"; os destaques dão a ideia a quem vê, a frase dá-a a todos. Escrever também o resultado num parágrafo dentro do elemento.

## Sem JavaScript

Aparece o texto escrito dentro do elemento. O JSON não aparece.

## Ver também

- [Criar um widget](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/criar.md): quando o algoritmo deve ser calculado (a entrada muda), e não escrito passo a passo.
- [Usar widgets](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/usar.md) e o [Catálogo](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/index.md).
