# `<uc-widget-heap>`

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/uc-widget-heap.html

Um heap binário, de máximo ou de mínimo, desenhado como vetor e como árvore: inserir, extrair o topo, construir o heap (heapify) e o heapsort.

Exemplo (inserir e extrair num heap de máximo, com previsões), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-widget-heap/basic.html):

```html
<uc-widget-heap values="9 7 8 3 5 6" ops="insert 10; extract; extract" predict>
  <p>Heap de máximo 9 7 8 3 5 6. Inserir 10 (sobe até à raiz), extrair 10 e depois 9:
    fica 8 7 6 3 5.</p>
</uc-widget-heap>
```

O vetor fica por cima e a árvore que ele representa por baixo: o pai da posição *i* está em (*i* − 1) / 2 e os filhos em 2*i* + 1 e 2*i* + 2. Quando dois valores trocam, a troca vê-se nos dois desenhos e o nó desliza na árvore.

## Utilização

`values` são os valores (até 15). Com `ops`, o heap de `values` aparece já construído e as operações correm passo a passo; sem `ops`, a inserção de cada valor é a demonstração. `kind="min"` dá um heap de mínimo (o pseudocódigo troca `>` por `<`).

```html
<script src="https://uc-design-kit.miguelrocha.dev/widgets/v1/uc-widget-heap.js" defer></script>

<uc-widget-heap values="5 3 8 1" kind="min">
  <p>Heap de mínimo depois de inserir 5 3 8 1: 1 3 8 5.</p>
</uc-widget-heap>
```

### Operações

Separadas por `;`, com os verbos em inglês (lêem-se como código):

| Operação | Efeito |
| --- | --- |
| `insert v` | Põe v na primeira posição livre e fá-lo subir enquanto for maior (menor) que o pai. |
| `extract` | Tira o topo, põe o último elemento na raiz e fá-lo descer para o lado do maior (menor) filho. |
| `peek` | Mostra o topo, sem mudar o heap. |

## Construção e heapsort

Exemplo (heapify e heapsort, com botões para escolher), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-widget-heap/heapsort.html):

```html
<uc-widget-heap values="4 9 2 7 5 8 1" algorithm="heapsort" algorithms="heapify heapsort">
  <p>Heapify de 4 9 2 7 5 8 1 dá 9 7 8 4 5 2 1; o heapsort ordena para 1 2 4 5 7 8 9.</p>
</uc-widget-heap>
```

`algorithm="heapify"` transforma o vetor de `values` num heap de baixo para cima, da posição *n*/2 − 1 até à raiz. `algorithm="heapsort"` faz o mesmo e depois troca o topo com o último elemento do heap, uma vez por posição: a parte já ordenada fica no fim do vetor, marcada com ✓, e sai da árvore. Um heap de máximo ordena por ordem crescente; um de mínimo, por ordem decrescente.

As perguntas de previsão são: "8 sobe acima de 7?" e "2 desce para o lugar de 9?" (Sim / Não), e no heapsort "Que valor fica na posição 6?".

## Atributos

Além dos [atributos comuns](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/usar.md#atributos-comuns):

| Atributo | Tipo | Por omissão | Descrição |
| --- | --- | --- | --- |
| `values` | inteiros, ou `random N [MIN..MAX]` | `random 7` | Os valores, até 15. |
| `ops` | operações separadas por `;` | ausente | As operações a mostrar (só em `operations`). |
| `kind` | `max`, `min` | `max` | Heap de máximo ou de mínimo. |
| `algorithm` | `operations`, `heapify`, `heapsort` | `operations` | Operações, a construção ou o heapsort. |

Com `editable`, o aluno muda os valores.

## Linhas do pseudocódigo

Os identificadores para marcar as linhas de um `<pre data-pseudocode>` próprio (ver [Pseudocódigo próprio](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/usar.md#pseudocodigo)); use `data-algorithm` com o nome do bloco (`data-algorithm="insert"`):

| Bloco | Linhas |
| --- | --- |
| `insert` | `place`, `up`, `swap`, `end` |
| `extract` | `top`, `move`, `leaf`, `child`, `stop`, `swap` |
| `peek` | `top` |
| `heapify` | `loop`, `leaf`, `child`, `stop`, `swap` |
| `heapsort` | `last`, `leaf`, `child`, `stop`, `swap`, `end` |

## Acessibilidade

### O que o widget faz

Uma frase por passo ("10 > 8 (o pai): sobe."); o heap descrito em palavras, por níveis ("Heap com 6 elementos, por níveis: 9 7 8 3 5 6."); estados com cor, contorno e sinal no vetor e na árvore; "Vista em texto" com uma tabela posição, valor, pai e estado.

### O que cabe a quem escreve

Escrever dentro do elemento o vetor inicial e o resultado (o heap final, o vetor ordenado), e ficar pelos 7 a 10 valores para que o vetor e a árvore se leiam num telemóvel.

## Sem JavaScript

Aparece o texto escrito dentro do elemento e o `<pre data-pseudocode>`, se houver.

## Ver também

- [Usar widgets](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/usar.md): importar, teclado, previsões, versões.
- [Catálogo](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/index.md) dos widgets.
- [`<uc-widget-sort>`](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/uc-widget-sort.md): os outros algoritmos de ordenação.
