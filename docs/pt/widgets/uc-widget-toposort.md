# `<uc-widget-toposort>`

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/uc-widget-toposort.html

Ordenação topológica de um grafo dirigido: o algoritmo de Kahn, com os graus de entrada e a fila, e a ordenação por DFS, com a pilha de chamadas; os dois detetam ciclos.

Exemplo (Kahn nas precedências entre unidades curriculares, com previsões), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-widget-toposort/basic.html):

```html
    <uc-widget-toposort predict>
      <pre data-input>
# precedências entre unidades curriculares
P1 P2
P1 ED
MD ED
P2 POO
ED Alg
POO ES
Alg ES
      </pre>
      <p>Uma ordem possível: P1, MD, P2, ED, POO, Alg, ES.</p>
    </uc-widget-toposort>
```

Ao lado de cada vértice está o seu grau de entrada (quantos arcos lhe chegam). A fila começa com os vértices de grau 0, pela ordem da entrada. Cada vértice que sai da fila vai para a saída e "apaga" os seus arcos: o grau de entrada de cada vizinho desce um, e um vizinho que chegue a 0 entra na fila. Se a fila esvaziar antes de todos os vértices estarem na saída, os que ficaram estão num ciclo ou dependem de um: o widget marca um desses ciclos, diz quais são os seus vértices e mostra a saída parcial.

## Utilização

```html
<script src="https://uc-design-kit.miguelrocha.dev/widgets/v1/uc-widget-toposort.js" defer></script>

<uc-widget-toposort edges="P1 P2; P1 ED; MD ED; P2 POO">
  <p>Uma ordem possível: P1, MD, P2, ED, POO.</p>
</uc-widget-toposort>
```

## Escrever o grafo

Como nos outros widgets de grafos: uma linha por arco dentro de `<pre data-input>` (`U V` quer dizer "U antes de V"), uma linha só com um nome para um vértice isolado, `U @ X,Y` para fixar uma posição e `#` para comentários; ou o atributo `edges` com as mesmas linhas separadas por `;`. Até 10 vértices e 20 arcos. O grafo é **sempre dirigido**, com ou sem o atributo `directed`, e não há origem (`source` não se usa). Pesos, se os escrever, aparecem no desenho mas não contam.

Use nomes curtos (até três ou quatro caracteres, como `P1`, `MD`, `POO`): os vértices são círculos pequenos. A ordem das linhas decide a ordem pela qual se veem os vértices e os arcos de cada vértice, e por isso qual das ordens topológicas possíveis se obtém.

## Ordenação por DFS

Exemplo (DFS num grafo com um ciclo, editável), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-widget-toposort/dfs.html):

```html
<uc-widget-toposort algorithm="dfs" algorithms="dfs kahn"
    edges="A B; A C; B D; C D; D E; E C" editable predict>
  <p>Não há ordem topológica: C → D → E → C é um ciclo. Sem o arco E C, uma ordem é A, C, B, D, E.</p>
</uc-widget-toposort>
```

`algorithm="dfs"` faz uma pesquisa em profundidade recursiva a partir de cada vértice ainda não visitado, pela ordem da entrada. Um vértice na pilha de chamadas fica "visitado" (o que está a ser explorado fica "atual"); quando todos os seus arcos foram vistos, termina e vai para o **início** da ordem, que se vai construindo no painel. Um arco para um vértice que ainda está na pilha fecha um ciclo: esse arco fica marcado como "trocado", o ciclo é nomeado (por exemplo `C → D → E → C`) e o algoritmo para. Experimente apagar o arco `E C` no campo editável. Com `algorithms="dfs kahn"` aparecem os dois botões.

## Perguntas de previsão

Com `predict`: no Kahn, em cada arco, "P1 → ED: o grau de entrada de ED passa a 0?" (Sim / Não); na DFS, em cada arco, "A → B: em que situação está B?" (Ainda não visitado / Na pilha / Já terminou), que distingue os arcos da árvore, os arcos para vértices terminados e os que fecham um ciclo.

## Atributos

Além dos [atributos comuns](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/usar.md#atributos-comuns):

| Atributo | Tipo | Por omissão | Descrição |
| --- | --- | --- | --- |
| `edges` | linhas separadas por `;` | ausente | O grafo, em vez do `<pre data-input>`. |
| `algorithm` | `kahn`, `dfs` | `kahn` | O algoritmo. |

## Linhas do pseudocódigo

Os identificadores para marcar as linhas de um `<pre data-pseudocode>` próprio (ver [Pseudocódigo próprio](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/usar.md#pseudocodigo)):

| Algoritmo | Linhas |
| --- | --- |
| `kahn` | `init`, `pop`, `dec`, `push`, `cycle` |
| `dfs` | `root`, `enter`, `arc`, `back`, `down`, `done` |

## Acessibilidade

### O que o widget faz

Uma frase por passo com o arco e o que muda ("P1 → ED: o grau de entrada de ED passa a 1."); o grafo e os graus de entrada descritos em palavras; estados com cor, espessura, tracejado e sinal; fila (ou pilha de chamadas) e saída no painel; "Vista em texto" com uma tabela vértice, grau de entrada (ou situação na DFS) e estado.

### O que cabe a quem escreve

Escrever dentro do elemento uma ordem topológica (ou o ciclo, se houver) e manter os nomes dos vértices curtos.

## Sem JavaScript

Aparece o texto escrito dentro do elemento e o `<pre data-pseudocode>`, se houver. O `<pre data-input>` não aparece: escreva o resultado num parágrafo.

## Ver também

- [`<uc-widget-graph>`](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/uc-widget-graph.md): a DFS e a BFS sozinhas, a partir de uma origem.
- [`<uc-widget-stack-queue>`](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/uc-widget-stack-queue.md): a fila e a pilha por dentro.
- [Usar widgets](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/usar.md) e o [Catálogo](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/index.md).
