# Catálogo

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/index.html

Demonstrações interativas, passo a passo, dos algoritmos e das estruturas de dados que se ensinam em IP, PI, EDados e PC. Cada widget entra numa página com uma linha `<script>` e um elemento, e todos se usam da mesma maneira.

Os widgets são uma biblioteca à parte do kit, em `widgets/v1/`: uma página que não usa nenhum não carrega nada a mais, e o orçamento de 48 KB do kit não os conta. Precisam do kit 1.1 ou mais recente. Como os usar está em [Usar widgets](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/usar.md).

## Disponíveis

Gerado a partir de `widgets/v1/catalog.json`. "Experimental" quer dizer que o widget ainda pode mudar de forma compatível até à versão 1.0.0 da biblioteca.

- [Ordenação](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/uc-widget-sort.md) `<uc-widget-sort>`

  Bolha, seleção, inserção, merge sort, quicksort e counting sort, passo a passo.

  Experimental Vaga 1 IP EDados PI

  Algoritmos: `bubble`, `selection`, `insertion`, `merge`, `quick`, `counting` · 5.2 KB gzip

## Planeados

Os restantes chegam por vagas, todos com o mesmo leitor, as mesmas teclas e a mesma vista em texto:

- **Vaga 1:** pesquisa linear e binária, árvores binárias de pesquisa e percursos, listas ligadas, pilhas e filas, recursão.
- **Vaga 2:** heaps e heapsort, árvores AVL, tabelas de dispersão, BFS e DFS, caminhos mais curtos (Dijkstra, Bellman-Ford), complexidade.
- **Vaga 3:** árvores de cobertura mínima, union-find, ordenação topológica, programação dinâmica, backtracking e um widget de traço com os passos do professor.

## Ver também

- [Usar widgets](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/usar.md): importar, versões, uso offline, eventos.
- [`<uc-widget-sort>`](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/uc-widget-sort.md): o primeiro widget.
