# Catálogo

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/index.html

Demonstrações interativas, passo a passo, dos algoritmos e das estruturas de dados que se ensinam em IP, PI, EDados e PC. Cada widget entra numa página com uma linha `<script>` e um elemento, e todos se usam da mesma maneira.

Os widgets são uma biblioteca à parte do kit, em `widgets/v1/`: uma página que não usa nenhum não carrega nada a mais, e o orçamento de 48 KB do kit não os conta. Precisam do kit 1.1 ou mais recente. Como os usar está em [Usar widgets](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/usar.md).

## Disponíveis

Gerado a partir de `widgets/v1/catalog.json`. "Experimental" quer dizer que o widget ainda pode mudar de forma compatível até à versão 1.0.0 da biblioteca.

- [Árvore AVL](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/uc-widget-avl.md) `<uc-widget-avl>`

  Inserir, remover e procurar numa árvore AVL, com a altura e o fator de equilíbrio de cada nó e as quatro rotações.

  Experimental Vaga 2 EDados

  Algoritmos: `operations` · 6.4 KB gzip
- [Árvore binária de pesquisa](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/uc-widget-bst.md) `<uc-widget-bst>`

  Inserir, remover, procurar, mínimo e máximo numa árvore binária de pesquisa, e os percursos pré-ordem, em-ordem, pós-ordem e em largura.

  Experimental Vaga 1 EDados

  Algoritmos: `operations`, `preorder`, `inorder`, `postorder`, `levelorder` · 5.5 KB gzip
- [Complexidade](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/uc-widget-complexity.md) `<uc-widget-complexity>`

  Funções de crescimento (1, log n, n, n log n, n², 2ⁿ…) lado a lado à medida que n cresce, com as contagens reais de outro widget da página.

  Experimental Vaga 2 IP PI EDados PC

  Algoritmos: `growth` · 4.8 KB gzip
- [Pesquisa em grafos](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/uc-widget-graph.md) `<uc-widget-graph>`

  BFS com a fila e as distâncias, DFS com a pilha de chamadas e a ordem de visita, componentes conexas; grafos dirigidos ou não.

  Experimental Vaga 2 EDados PC

  Algoritmos: `bfs`, `dfs`, `components` · 7.1 KB gzip
- [Tabela de dispersão](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/uc-widget-hash.md) `<uc-widget-hash>`

  Tabela de dispersão com encadeamento, sondagem linear ou quadrática: inserir, procurar, remover, fator de carga e crescimento da tabela.

  Experimental Vaga 2 EDados

  Algoritmos: `chaining`, `linear`, `quadratic` · 6.5 KB gzip
- [Heap binário](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/uc-widget-heap.md) `<uc-widget-heap>`

  Heap de máximo ou de mínimo, em vetor e em árvore lado a lado: inserir, extrair, topo, construção (heapify) e heapsort.

  Experimental Vaga 2 EDados

  Algoritmos: `operations`, `heapify`, `heapsort` · 4.7 KB gzip
- [Lista ligada](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/uc-widget-list.md) `<uc-widget-list>`

  Lista ligada simples: adicionar no início e no fim, inserir, remover, procurar e inverter, ponteiro a ponteiro.

  Experimental Vaga 1 EDados PI

  Algoritmos: `singly` · 6.0 KB gzip
- [Recursão](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/uc-widget-recursion.md) `<uc-widget-recursion>`

  Árvore de chamadas e pilha de chamadas do fatorial, de Fibonacci e das Torres de Hanói.

  Experimental Vaga 1 IP PI EDados

  Algoritmos: `factorial`, `fibonacci`, `hanoi` · 3.2 KB gzip
- [Pesquisa](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/uc-widget-search.md) `<uc-widget-search>`

  Pesquisa linear, pesquisa binária e primeira posição ≥ alvo (lower bound), passo a passo.

  Experimental Vaga 1 IP EDados PI PC

  Algoritmos: `linear`, `binary`, `lower` · 3.2 KB gzip
- [Caminhos mais curtos](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/uc-widget-shortest-path.md) `<uc-widget-shortest-path>`

  Dijkstra com a fila de prioridade visível e Bellman-Ford por rondas, com deteção de ciclos negativos.

  Experimental Vaga 2 EDados PC

  Algoritmos: `dijkstra`, `bellman-ford` · 6.9 KB gzip
- [Ordenação](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/uc-widget-sort.md) `<uc-widget-sort>`

  Bolha, seleção, inserção, merge sort, quicksort e counting sort, passo a passo.

  Experimental Vaga 1 IP EDados PI

  Algoritmos: `bubble`, `selection`, `insertion`, `merge`, `quick`, `counting` · 5.2 KB gzip
- [Pilha e fila](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/uc-widget-stack-queue.md) `<uc-widget-stack-queue>`

  Pilha (push, pop, peek) e fila (enqueue, dequeue, peek), em vetor (a fila como vetor circular) ou em lista ligada.

  Experimental Vaga 1 EDados PI

  Algoritmos: `stack`, `queue` · 5.7 KB gzip
- [Traço de um algoritmo](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/uc-widget-trace.md) `<uc-widget-trace>`

  Os passos do seu próprio algoritmo, escritos em JSON, reproduzidos com o desenho de vetor, árvore, grafo ou tabela.

  Experimental Vaga 3 IP EDados PI PC

  Algoritmos: `trace` · 7.1 KB gzip
- [Union-find](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/uc-widget-union-find.md) `<uc-widget-union-find>`

  Conjuntos disjuntos com união por tamanho e compressão de caminhos, ou sem elas, com o vetor parent e a floresta.

  Experimental Vaga 3 PC EDados

  Algoritmos: `compression`, `size`, `naive` · 4.5 KB gzip

## Planeados

Os restantes chegam na próxima vaga, com o mesmo leitor, as mesmas teclas e a mesma vista em texto:

- **Vaga 3:** árvores de cobertura mínima, union-find, ordenação topológica, programação dinâmica, backtracking e um widget de traço com os passos do professor.

## Ver também

- [Usar widgets](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/usar.md): importar, versões, uso offline, eventos.
- [`<uc-widget-sort>`](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/uc-widget-sort.md): o primeiro widget.
