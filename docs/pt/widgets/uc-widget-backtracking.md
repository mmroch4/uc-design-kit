# `<uc-widget-backtracking>`

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/uc-widget-backtracking.html

Pesquisa com retrocesso passo a passo: as N rainhas no tabuleiro, os subconjuntos (com uma soma alvo e os cortes) e as permutações na árvore de pesquisa.

Exemplo (4 rainhas com previsões), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-widget-backtracking/basic.html):

```html
<uc-widget-backtracking n="4" predict>
  <p>4 rainhas: a primeira solução põe as rainhas nas colunas 1, 3, 0 e 2, linha a linha.</p>
</uc-widget-backtracking>
```

As rainhas são postas linha a linha, da coluna 0 para a direita. Cada tentativa é um passo: se uma rainha já posta ataca a casa (na mesma coluna ou diagonal), a casa fica tracejada, a rainha que a ataca fica a roxo e o ramo é cortado; se não, a rainha fica na casa (a azul) e a pesquisa passa à linha seguinte. Quando uma linha esgota as colunas, o widget volta à linha de cima e tira de lá a rainha. O painel mostra a pilha de rainhas postas (uma por linha, como a pilha de chamadas da recursão), as soluções e o número de cortes.

## Utilização

```html
<script src="https://uc-design-kit.miguelrocha.dev/widgets/v1/uc-widget-backtracking.js" defer></script>

<uc-widget-backtracking n="5">
  <p>5 rainhas: a primeira solução tem as rainhas nas colunas 0, 2, 4, 1 e 3.</p>
</uc-widget-backtracking>
```

## N rainhas

`n` vai de 1 a 8 (4 por omissão). Por omissão a pesquisa para na primeira solução; com o atributo `all` procura todas e junta-as à saída, uma por linha do painel (as colunas das rainhas, linha a linha). Com `all`, use `n` até 6: a partir de 7 a pesquisa passa dos 2000 passos e o widget mostra a nota de erro. Sem `all` qualquer `n` até 8 serve (as 8 rainhas precisam de 983 passos). Para n = 2 e n = 3 não há solução, e o widget mostra a pesquisa toda a falhar.

## Subconjuntos com soma alvo

Exemplo (Subconjuntos com soma 5 e os cortes), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-widget-backtracking/subsets.html):

```html
<uc-widget-backtracking algorithm="subsets" values="3 1 4 2" target="5" predict>
  <p>Subconjuntos de 3 1 4 2 com soma 5: {3, 2} e {1, 4}.</p>
</uc-widget-backtracking>
```

`algorithm="subsets"` percorre a árvore de decisões sobre `values` (1 a 4 inteiros positivos): em cada nível leva (`+3`) ou deixa (`−3`) um valor, primeiro levar. Sem `target` visita a árvore toda e cada folha é um subconjunto (2^n folhas). Com `target`, um ramo é cortado quando a soma passa do alvo ou quando nem somando tudo o que resta chega lá; os nós cortados ficam tracejados e as folhas que chegam ao fim são as soluções, marcadas com ✓.

`algorithm="permutations"` faz o mesmo com `values` de 1 a 3 elementos diferentes (letras ou números): cada nível põe um elemento ainda não usado, e as folhas são as n! permutações, pela ordem dos valores na entrada. Como só se tentam os elementos ainda livres, não há cortes.

O alvo também pode ir em `values` depois de dois pontos (`values="3 1 4 2 : 5"`), que é a forma do campo de `editable`; com `queens`, o campo editável é `n`.

## Perguntas de previsão

Nas rainhas, antes de cada tentativa a partir da linha 1: "Pode pôr-se uma rainha em (2, 1)?" (Sim / Não). Nos subconjuntos com `target`, antes de cada nó: "Levar 4: este ramo é cortado?" (Sim / Não). As permutações não têm perguntas.

## Atributos

Além dos [atributos comuns](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/usar.md#atributos-comuns):

| Atributo | Tipo | Por omissão | Descrição |
| --- | --- | --- | --- |
| `algorithm` | `queens`, `subsets`, `permutations` | `queens` | A pesquisa. |
| `n` | inteiro de 1 a 8 | `4` | Tamanho do tabuleiro (rainhas). |
| `all` | booleano | ausente | Procurar todas as soluções (rainhas; use com `n` até 6). |
| `values` | 1 a 4 inteiros positivos (subconjuntos); 1 a 3 elementos diferentes (permutações) | `1 2 3`; `A B C` | Os valores a escolher. |
| `target` | inteiro positivo | ausente | A soma procurada (subconjuntos); sem ela não há cortes. |

## Linhas do pseudocódigo

Os identificadores para marcar as linhas de um `<pre data-pseudocode>` próprio (ver [Pseudocódigo próprio](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/usar.md#pseudocodigo)):

| Algoritmo | Linhas |
| --- | --- |
| `queens` | `solution`, `cut`, `place`, `remove` |
| `subsets` | `cut`, `leaf`, `take`, `leave` |
| `permutations` | `leaf`, `place` |

## Acessibilidade

### O que o widget faz

Uma frase por passo com a casa ou o valor e o motivo do corte ("(3, 1) é atacada pela rainha de (1, 3), na mesma diagonal: corte."); o tabuleiro descrito pelas casas das rainhas, a árvore pelo caminho atual; estados com cor, contorno, tracejado e sinal; "Vista em texto" com uma linha por linha do tabuleiro (a coluna da rainha) ou por nó da árvore (as decisões desde a raiz e o estado).

### O que cabe a quem escreve

Escrever dentro do elemento as soluções e escolher entradas pequenas: 4 ou 5 rainhas, 3 ou 4 valores. As árvores de 4 valores sem alvo têm 31 nós e ficam largas num telemóvel.

## Sem JavaScript

Aparece o texto escrito dentro do elemento e o `<pre data-pseudocode>`, se houver.

## Ver também

- [`<uc-widget-recursion>`](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/uc-widget-recursion.md): a árvore de chamadas e a pilha de chamadas, sem cortes.
- [`<uc-widget-dp>`](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/uc-widget-dp.md): problemas de otimização resolvidos com uma tabela em vez de pesquisa.
- [Usar widgets](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/usar.md) e o [Catálogo](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/index.md).
