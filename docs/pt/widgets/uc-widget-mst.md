# `<uc-widget-mst>`

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/uc-widget-mst.html

Árvore de cobertura mínima de um grafo não dirigido com pesos: o Kruskal com as arestas ordenadas e os conjuntos à vista, e o Prim com a fila de prioridade de arestas.

Exemplo (Kruskal com os conjuntos e previsões), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-widget-mst/basic.html):

```html
    <uc-widget-mst predict>
      <pre data-input>
A B 7
A D 5
B C 8
B D 9
B E 7
C E 5
D E 15
D F 6
E F 8
E G 9
F G 11
A @ 0,0
B @ 2,0
C @ 4,0
D @ 1,1.5
E @ 3,1.5
F @ 1,3
G @ 3,3
      </pre>
      <p>Árvore de cobertura mínima: A–D 5, C–E 5, D–F 6, A–B 7, B–E 7, E–G 9; peso total 39.</p>
    </uc-widget-mst>
```

O Kruskal começa por ordenar as arestas por peso (a lista fica no painel e encurta a cada aresta vista). Cada vértice começa num conjunto só seu; ao lado de cada vértice está o representante do seu conjunto, entre parênteses retos (`[A]`), por isso vê-se, sem depender da cor, que vértices já estão ligados. Uma aresta entra na árvore quando liga dois conjuntos diferentes (`find(u) ≠ find(v)`), e os dois conjuntos juntam-se (o mais pequeno passa para o representante do maior); se os dois extremos já estão no mesmo conjunto, a aresta formaria um ciclo e fica de fora. O algoritmo para quando a árvore tem |V| − 1 arestas. No fim ficam marcadas as arestas da árvore e o peso total.

## Utilização

```html
<script src="https://uc-design-kit.miguelrocha.dev/widgets/v1/uc-widget-mst.js" defer></script>

<uc-widget-mst edges="A B 2; A C 3; B C 1; B D 4; C D 5">
  <p>Árvore de cobertura mínima: B–C 1, A–B 2, B–D 4; peso total 7.</p>
</uc-widget-mst>
```

## Escrever o grafo

Como nos outros widgets de grafos: uma linha por aresta dentro de `<pre data-input>`, `U V P` com um peso inteiro (pode ser negativo; sem pesos, todas as arestas pesam 1), uma linha só com um nome para um vértice isolado, `U @ X,Y` para fixar uma posição e `#` para comentários; ou o atributo `edges` com as mesmas linhas separadas por `;`. Até 10 vértices e 20 arestas.

O grafo é sempre não dirigido: o atributo `directed` dá uma nota de erro. Num grafo desconexo, os dois algoritmos constroem uma **floresta** de cobertura mínima (uma árvore por componente), e a frase final diz quantas componentes tem o grafo. Os lacetes (`A A 1`) nunca entram na árvore. Arestas paralelas (`A B 2` e `A B 5`) são aceites, mas ficam sobrepostas no desenho: prefira evitá-las. Em caso de empate de pesos, a ordem é a da entrada.

## Prim

Exemplo (Prim e Kruskal no mesmo grafo, editável), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-widget-mst/prim.html):

```html
<uc-widget-mst algorithm="prim" algorithms="prim kruskal" source="A"
    edges="A B 2; A C 3; B C 1; B D 4; C D 5; C E 6; D E 2" editable>
  <p>Árvore de cobertura mínima: B–C 1, A–B 2, D–E 2, B–D 4; peso total 9.</p>
</uc-widget-mst>
```

`algorithm="prim"` faz crescer a árvore a partir de `source` (por omissão, o primeiro vértice). É a versão com uma fila de prioridade de arestas (a mais leve primeiro; no painel como `A–B 2`), como se programa com uma fila de biblioteca: quando um vértice entra na árvore, entram na fila as suas arestas para vértices fora da árvore; quando sai da fila uma aresta cujos dois extremos já estão na árvore, é ignorada. Se a fila esvaziar e ainda houver vértices fora da árvore (grafo desconexo), o Prim recomeça no primeiro desses vértices. Com `algorithms="prim kruskal"` aparecem os dois botões, para comparar as duas árvores (têm sempre o mesmo peso total; as arestas podem ser outras quando há empates).

## Perguntas de previsão

Com `predict`, nos dois algoritmos, antes de cada decisão: "A–B (peso 3) entra na árvore?" (Sim / Não). No Kruskal a pergunta aparece depois de se mostrar a aresta e os `find` dos extremos; no Prim, quando a aresta sai da fila.

## Atributos

Além dos [atributos comuns](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/usar.md#atributos-comuns):

| Atributo | Tipo | Por omissão | Descrição |
| --- | --- | --- | --- |
| `edges` | linhas separadas por `;` | ausente | O grafo, em vez do `<pre data-input>`. |
| `source` | nome de um vértice | o primeiro vértice | Onde começa o Prim (o Kruskal ignora-o). |
| `algorithm` | `kruskal`, `prim` | `kruskal` | O algoritmo. |

## Linhas do pseudocódigo

Os identificadores para marcar as linhas de um `<pre data-pseudocode>` próprio (ver [Pseudocódigo próprio](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/usar.md#pseudocodigo)):

| Algoritmo | Linhas |
| --- | --- |
| `kruskal` | `init`, `sort`, `stop`, `check`, `union`, `cycle` |
| `prim` | `init`, `restart`, `skip`, `add`, `push` |

## Acessibilidade

### O que o widget faz

Uma frase por passo com a aresta, o peso e a decisão ("B–C entra na árvore: o conjunto [B] junta-se a [A]. Peso total 3."); os conjuntos escritos ao lado dos vértices e repetidos na descrição do grafo; estados com cor, espessura, tracejado e sinal; contador de arestas vistas e peso total no painel; "Vista em texto" com uma tabela aresta, peso e "na árvore" (sim, não ou ainda por ver).

### O que cabe a quem escreve

Escrever dentro do elemento as arestas da árvore e o peso total, e escolher pesos pequenos, de um ou dois algarismos, para que o desenho e as frases se leiam bem.

## Sem JavaScript

Aparece o texto escrito dentro do elemento e o `<pre data-pseudocode>`, se houver. O `<pre data-input>` não aparece: escreva o resultado num parágrafo.

## Ver também

- [`<uc-widget-shortest-path>`](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/uc-widget-shortest-path.md): o Dijkstra, que usa a mesma fila de prioridade que o Prim, mas com distâncias à origem.
- [`<uc-widget-graph>`](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/uc-widget-graph.md): BFS, DFS e componentes conexas.
- [Usar widgets](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/usar.md) e o [Catálogo](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/index.md).
