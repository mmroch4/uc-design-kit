# `<uc-widget-shortest-path>`

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/uc-widget-shortest-path.html

Caminhos mais curtos a partir de uma origem: o Dijkstra com a fila de prioridade à vista e o Bellman-Ford ronda a ronda, com deteção de ciclos negativos.

Exemplo (Dijkstra com a fila de prioridade e previsões), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-widget-shortest-path/basic.html):

```html
    <uc-widget-shortest-path source="A" directed predict>
      <pre data-input>
A B 4
A C 1
C B 2
B D 5
C D 8
E
      </pre>
      <p>Distâncias a partir de A: B 3, C 1, D 8; E inacessível.</p>
    </uc-widget-shortest-path>
```

A distância provisória de cada vértice está ao lado dele (∞ até haver caminho); a fila de prioridade aparece no painel como pares vértice:distância, a menor primeiro. É a versão com remoção preguiçosa: quando uma distância melhora entra um par novo, e o par antigo é ignorado quando sai da fila. No fim fica marcada a árvore dos caminhos mais curtos.

## Utilização

```html
<script src="https://uc-design-kit.miguelrocha.dev/widgets/v1/uc-widget-shortest-path.js" defer></script>

<uc-widget-shortest-path source="S" edges="S A 7; S B 2; B A 3; A C 1; B C 8">
  <p>Distâncias a partir de S: A 5, B 2, C 6.</p>
</uc-widget-shortest-path>
```

## Escrever o grafo

Uma linha por aresta dentro de `<pre data-input>`: `U V`, ou `U V P` com um peso inteiro (um grafo sem pesos tem peso 1 em todas as arestas). Uma linha só com um nome declara um vértice isolado; `U @ X,Y` fixa a posição de U numa grelha (se todos os vértices tiverem posição, o desenho segue-as); `#` começa um comentário. Para grafos pequenos, o atributo `edges` aceita as mesmas linhas separadas por `;` (`edges="A B 4; A C 1"`) e tem prioridade sobre o `<pre>`.

Sem posições, o desenho é automático: cada componente conexa é desenhada à parte (com um algoritmo de forças, ou num círculo quando este tiver menos cruzamentos) e as componentes ficam lado a lado. O desenho não muda entre passos. Até 10 vértices e 20 arestas. Com `directed` as arestas são arcos (setas); os vizinhos de cada vértice são visitados pela ordem em que os vértices aparecem na entrada, por isso a ordem das linhas decide a ordem da pesquisa.

## Bellman-Ford e pesos negativos

Exemplo (Bellman-Ford com um arco negativo, editável), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-widget-shortest-path/bellman-ford.html):

```html
<uc-widget-shortest-path algorithm="bellman-ford" directed source="A"
    edges="A B 4; A C 5; C B -3; B D 2" editable>
  <p>Com o arco negativo C → B, as distâncias a partir de A são B 2, C 5, D 4.</p>
</uc-widget-shortest-path>
```

`algorithm="bellman-ford"` faz |V| − 1 rondas sobre todas as arestas, pela ordem da entrada (nos dois sentidos se o grafo não for dirigido), e para mais cedo quando uma ronda não muda nada; depois faz mais uma passagem e, se alguma aresta ainda melhorar uma distância, anuncia um ciclo de peso negativo alcançável a partir da origem. O Dijkstra recusa pesos negativos com uma nota de erro que sugere o Bellman-Ford. Num grafo não dirigido, uma aresta de peso negativo já é um ciclo negativo (vai e volta).

Perguntas de previsão: no Dijkstra, "Que vértice sai da fila a seguir com a sua distância final?" e, nos dois algoritmos, "A → B (peso 4) melhora dist[B] = 5?" (Sim / Não), quando a distância já não é ∞.

## Atributos

Além dos [atributos comuns](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/usar.md#atributos-comuns):

| Atributo | Tipo | Por omissão | Descrição |
| --- | --- | --- | --- |
| `source` | nome de um vértice | o primeiro vértice | A origem. |
| `directed` | booleano | ausente | Arcos em vez de arestas. |
| `edges` | linhas separadas por `;` | ausente | O grafo, em vez do `<pre data-input>`. |
| `algorithm` | `dijkstra`, `bellman-ford` | `dijkstra` | O algoritmo. |

## Linhas do pseudocódigo

Os identificadores para marcar as linhas de um `<pre data-pseudocode>` próprio (ver [Pseudocódigo próprio](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/usar.md#pseudocodigo)):

| Algoritmo | Linhas |
| --- | --- |
| `dijkstra` | `init`, `pop`, `stale`, `edge`, `relax`, `update`, `push` |
| `bellman-ford` | `init`, `round`, `relax`, `update`, `stop`, `check`, `cycle` |

## Acessibilidade

### O que o widget faz

Uma frase por passo com a conta da relaxação ("C → B (peso 2): 1 + 2 = 3 < 4; dist[B] = 3, pai[B] = C."); o grafo e as distâncias descritos em palavras; estados com cor, espessura, tracejado e sinal; contadores de arestas vistas e de relaxações; "Vista em texto" com uma tabela vértice, distância, pai e estado.

### O que cabe a quem escreve

Escrever dentro do elemento as distâncias finais (ou o ciclo negativo) e escolher pesos pequenos, de um ou dois algarismos, para que as contas se leiam.

## Sem JavaScript

Aparece o texto escrito dentro do elemento e o `<pre data-pseudocode>`, se houver. O `<pre data-input>` não aparece: escreva o resultado num parágrafo.

## Ver também

- [`<uc-widget-graph>`](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/uc-widget-graph.md): BFS (os caminhos mais curtos sem pesos), DFS e componentes.
- [`<uc-widget-heap>`](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/uc-widget-heap.md): o heap que costuma estar por trás da fila de prioridade.
- [Usar widgets](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/usar.md) e o [Catálogo](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/index.md).
