# `<uc-widget-graph>`

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/uc-widget-graph.html

Pesquisa em largura (BFS) com a fila e as distâncias, pesquisa em profundidade (DFS) com a pilha de chamadas, e componentes conexas, num grafo dirigido ou não.

Exemplo (BFS, DFS e componentes, com botões e previsões), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-widget-graph/basic.html):

```html
    <uc-widget-graph source="A" algorithms="bfs dfs components" predict>
      <pre data-input>
A B
A C
B D
C D
D E
F G
      </pre>
      <p>BFS a partir de A: A 0, B 1, C 1, D 2, E 3; F e G ficam a ∞.
        DFS: A B D C E. Duas componentes: {A, B, C, D, E} e {F, G}.</p>
    </uc-widget-graph>
```

Cada vértice tem ao lado a sua anotação: a distância na BFS (∞ até ser descoberto), o número de visita na DFS, a componente nas componentes conexas. As arestas da árvore de pesquisa ficam marcadas; no fim, a árvore e os vértices alcançados ficam com ✓.

## Utilização

```html
<script src="https://uc-design-kit.miguelrocha.dev/widgets/v1/uc-widget-graph.js" defer></script>

<uc-widget-graph source="A" algorithm="dfs" edges="A B; A C; B C; C D">
  <p>DFS a partir de A: A B C D.</p>
</uc-widget-graph>
```

## Escrever o grafo

Uma linha por aresta dentro de `<pre data-input>`: `U V`, ou `U V P` com um peso inteiro. Uma linha só com um nome declara um vértice isolado; `U @ X,Y` fixa a posição de U numa grelha (se todos os vértices tiverem posição, o desenho segue-as); `#` começa um comentário. Para grafos pequenos, o atributo `edges` aceita as mesmas linhas separadas por `;` (`edges="A B 4; A C 1"`) e tem prioridade sobre o `<pre>`.

Sem posições, o desenho é automático: cada componente conexa é desenhada à parte (com um algoritmo de forças, ou num círculo quando este tiver menos cruzamentos) e as componentes ficam lado a lado. O desenho não muda entre passos. Até 10 vértices e 20 arestas. Com `directed` as arestas são arcos (setas); os vizinhos de cada vértice são visitados pela ordem em que os vértices aparecem na entrada, por isso a ordem das linhas decide a ordem da pesquisa.

## Algoritmos

| `algorithm` | O que mostra |
| --- | --- |
| `bfs` | Pesquisa em largura a partir de `source`: a fila no painel, a distância de cada vértice, a ordem de visita. Pergunta de previsão: "Que vértice sai da fila a seguir?". |
| `dfs` | Pesquisa em profundidade recursiva a partir de `source`: a pilha de chamadas no painel, o número de visita de cada vértice, o regresso a cada vértice. Pergunta: "Que vértice é visitado a seguir?". |
| `components` | Componentes conexas, uma BFS por componente nova (num grafo dirigido os arcos contam nos dois sentidos). Pergunta: "Que vértice começa a componente seguinte?". |

## Grafo dirigido com posições

Exemplo (DFS num grafo dirigido, com posições e editável), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-widget-graph/directed.html):

```html
<uc-widget-graph algorithm="dfs" directed source="1"
    edges="1 2; 1 3; 2 4; 3 4; 4 1; 1 @ 0,0; 2 @ 2,0; 3 @ 0,2; 4 @ 2,2" editable>
  <p>DFS a partir de 1 num grafo dirigido: visita 1, 2, 4 e depois 3.</p>
</uc-widget-graph>
```

Com `editable`, o aluno muda as arestas (numa linha, separadas por `;`) e corre de novo.

## Atributos

Além dos [atributos comuns](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/usar.md#atributos-comuns):

| Atributo | Tipo | Por omissão | Descrição |
| --- | --- | --- | --- |
| `source` | nome de um vértice | o primeiro vértice | Onde começam a BFS e a DFS. |
| `directed` | booleano | ausente | Arcos em vez de arestas. |
| `edges` | linhas separadas por `;` | ausente | O grafo, em vez do `<pre data-input>`. |
| `algorithm` | `bfs`, `dfs`, `components` | `bfs` | O algoritmo. |

## Linhas do pseudocódigo

Os identificadores para marcar as linhas de um `<pre data-pseudocode>` próprio (ver [Pseudocódigo próprio](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/usar.md#pseudocodigo)), com `data-algorithm` igual ao algoritmo:

| Algoritmo | Linhas |
| --- | --- |
| `bfs` | `init`, `pop`, `check`, `visit` |
| `dfs` | `visit`, `check`, `down`, `back`, `end` |
| `components` | `new`, `visit`, `close` |

## Acessibilidade

### O que o widget faz

Uma frase por passo ("A – B: B é novo; dist[B] = 1 e entra na fila."); o grafo descrito em palavras, com as arestas e as anotações; estados com cor, espessura, tracejado e sinal (• descoberto, ✓ terminado); "Vista em texto" com uma tabela vértice, anotação, pai e estado.

### O que cabe a quem escreve

Escrever dentro do elemento o resultado (as distâncias, a ordem de visita, as componentes) e manter o grafo pequeno, até 7 ou 8 vértices, para que se leia num telemóvel.

## Sem JavaScript

Aparece o texto escrito dentro do elemento e o `<pre data-pseudocode>`, se houver. O `<pre data-input>` não aparece: escreva o resultado num parágrafo.

## Ver também

- [`<uc-widget-shortest-path>`](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/uc-widget-shortest-path.md): Dijkstra e Bellman-Ford, com a mesma entrada.
- [`<uc-widget-stack-queue>`](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/uc-widget-stack-queue.md): a pilha e a fila por si.
- [Usar widgets](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/usar.md) e o [Catálogo](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/index.md).
