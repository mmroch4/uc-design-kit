# `<uc-widget-sort>`

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/uc-widget-sort.html

Seis algoritmos de ordenação passo a passo: bolha, seleção, inserção, merge sort, quicksort e counting sort, com o pseudocódigo, as comparações e trocas contadas, perguntas de previsão e uma vista em texto.

Exemplo (ordenação por inserção de seis valores), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-widget-sort/basic.html):

```html
<uc-widget-sort values="5 2 9 1 7 3" algorithm="insertion">
  <p>Ordenação por inserção de 5 2 9 1 7 3: 2 5 9 1 7 3, 1 2 5 9 7 3,
    1 2 5 7 9 3, 1 2 3 5 7 9.</p>
</uc-widget-sort>
```

Na demonstração, "Passo" avança um passo e a linha do pseudocódigo correspondente fica marcada. Na ordenação por inserção, o valor `x` sai do vetor (a célula fica vazia) e volta a entrar no lugar certo.

## Utilização

Os valores vão em `values` (até 16 inteiros) e o algoritmo em `algorithm`. O texto dentro do elemento é o que se lê sem JavaScript.

```html
<script src="https://uc-design-kit.miguelrocha.dev/widgets/v1/uc-widget-sort.js" defer></script>

<uc-widget-sort values="5 2 9 1 7 3" algorithm="quick" pivot="middle">
  <p>Quicksort de 5 2 9 1 7 3: 1 2 3 5 7 9.</p>
</uc-widget-sort>
```

## Com previsões e edição

Exemplo (bubble sort com perguntas e dados editáveis), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-widget-sort/predict.html):

```html
<uc-widget-sort values="4 1 3 2" algorithm="bubble" predict editable>
  <p>Bubble sort de 4 1 3 2: 1 3 2 4, 1 2 3 4.</p>
</uc-widget-sort>
```

As perguntas aparecem antes destes passos:

| Algoritmo | Pergunta |
| --- | --- |
| `bubble` | Compara 5 com 2. Trocam de lugar? |
| `selection` | 1 é menor do que o mínimo atual, 2? |
| `insertion` | 5 é maior do que x = 1? |
| `merge` | Compara 2 com 1. Qual é escrito primeiro? |
| `quick` | 3 é menor do que o pivô 7? |
| `counting` | Nenhuma (não há comparações). |

## Atributos

Além dos [atributos comuns](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/usar.md#atributos-comuns):

| Atributo | Tipo | Por omissão | Descrição |
| --- | --- | --- | --- |
| `values` | inteiros, ou `random N [MIN..MAX]` | `random 8` | Os valores a ordenar, até 16. |
| `algorithm` | `bubble`, `selection`, `insertion`, `merge`, `quick`, `counting` | `bubble` | O algoritmo. |
| `pivot` | `last`, `first`, `middle`, `random` | `last` | Escolha do pivô do quicksort (partição de Lomuto: o pivô escolhido passa primeiro para o fim). |
| `bars` | booleano | ausente | Barras com altura proporcional ao valor, em vez de células. |

O counting sort aceita valores num intervalo de até 100 valores diferentes (por exemplo de -20 a 79).

## Linhas do pseudocódigo

Os identificadores para marcar as linhas de um `<pre data-pseudocode>` próprio (ver [Pseudocódigo próprio](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/usar.md#pseudocodigo)):

| Algoritmo | Linhas |
| --- | --- |
| `bubble` | `compare`, `swap` |
| `selection` | `min`, `compare`, `swap` |
| `insertion` | `take`, `compare`, `shift`, `insert` |
| `merge` | `split`, `merge`, `compare`, `copy` |
| `quick` | `pivot`, `compare`, `swap`, `place` |
| `counting` | `init`, `count`, `clear`, `write` |

## Painel de estado

Comparações e trocas (bolha, seleção, quicksort), comparações e escritas (inserção, merge sort) ou só escritas (counting sort). A inserção mostra também o valor `x` a inserir, o merge sort as duas metades a juntar e o counting sort as contagens.

## Acessibilidade

### O que o widget faz

Uma frase por passo, com os valores ("Compara 5 com 2: 5 > 2, trocam."), anunciada ao avançar e recuar; o desenho descrito em palavras ("Vetor: 2 5 9 1 7 3."); estados com cor, contorno e sinal; "Vista em texto" com todos os passos e uma tabela posição, valor e estado.

### O que cabe a quem escreve

Escrever dentro do elemento um texto com o resultado ou os passos principais, para quem lê sem JavaScript, e manter os dados pequenos (8 a 10 valores leem-se bem num telemóvel).

## Sem JavaScript

Aparece o texto escrito dentro do elemento e o `<pre data-pseudocode>`, se houver.

## Ver também

- [Usar widgets](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/usar.md): importar, teclado, previsões, versões.
- [Catálogo](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/index.md) dos widgets.
