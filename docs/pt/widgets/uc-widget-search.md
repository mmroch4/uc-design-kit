# `<uc-widget-search>`

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/uc-widget-search.html

Pesquisa linear, pesquisa binária e a primeira posição com valor maior ou igual ao alvo (lower bound), passo a passo, com os ponteiros `lo`, `mid` e `hi` e as posições já descartadas.

Exemplo (pesquisa binária de 9 em oito valores), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-widget-search/basic.html):

```html
<uc-widget-search values="1 3 4 7 8 9 12 15" target="9" algorithm="binary">
  <p>Pesquisa binária de 9 em 1 3 4 7 8 9 12 15: o meio é 7 (posição 3), 7 &lt; 9;
    depois o meio é 9 (posição 5): encontrado.</p>
</uc-widget-search>
```

As posições descartadas ficam marcadas com um ponto (•); a posição que está a ser comparada tem contorno tracejado e a resposta fica com ✓.

## Utilização

Os valores vão em `values` (até 16 inteiros), o valor a procurar em `target` e o algoritmo em `algorithm`. As pesquisas binárias precisam de valores por ordem crescente: com valores desordenados aparece uma nota de erro e o texto alternativo. Com `values="random N"`, os valores são ordenados antes da pesquisa binária.

```html
<script src="https://uc-design-kit.miguelrocha.dev/widgets/v1/uc-widget-search.js" defer></script>

<uc-widget-search values="4 8 1 9 3" target="9" algorithm="linear">
  <p>Pesquisa linear de 9 em 4 8 1 9 3: posição 3.</p>
</uc-widget-search>
```

## Com previsões e edição

Exemplo (pesquisa binária com perguntas e dados editáveis), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-widget-search/predict.html):

```html
<uc-widget-search values="2 5 8 12 16 23 38 56 72 91" target="23" algorithm="binary" predict editable>
  <p>Pesquisa binária de 23: 16, 56, 23. Encontrado na posição 5.</p>
</uc-widget-search>
```

Na edição, o alvo escreve-se depois de dois pontos: `1 3 5 7 : 5`. As perguntas aparecem antes destes passos:

| Algoritmo | Pergunta |
| --- | --- |
| `linear` | a[3] = 9 é o alvo 9? (Sim / Não) |
| `binary` | a[3] = 7 e o alvo é 9. E agora? (Continua à esquerda / Continua à direita / Encontrou) |
| `lower` | a[4] = 8 é menor do que 9? (Sim / Não) |

## Atributos

Além dos [atributos comuns](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/usar.md#atributos-comuns):

| Atributo | Tipo | Por omissão | Descrição |
| --- | --- | --- | --- |
| `values` | inteiros, ou `random N [MIN..MAX]` | `random 10` | Os valores, até 16. |
| `target` | inteiro | um valor do vetor (a dois terços) | O valor a procurar. |
| `algorithm` | `linear`, `binary`, `lower` | `linear` | `lower` devolve a primeira posição com valor ≥ alvo, ou `n` se não houver nenhuma. |

## Linhas do pseudocódigo

Os identificadores para marcar as linhas de um `<pre data-pseudocode>` próprio (ver [Pseudocódigo próprio](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/usar.md#pseudocodigo)):

| Bloco | Linhas |
| --- | --- |
| `linear` | `compare`, `found`, `missing` |
| `binary` | `mid`, `found`, `right`, `left`, `missing` |
| `lower` | `mid`, `right`, `left`, `result` |

## Painel de estado

O número de comparações.

## Acessibilidade

### O que o widget faz

Uma frase por passo ("7 < 9: o alvo só pode estar à direita de 3."), anunciada ao avançar e recuar; o vetor e o alvo descritos em palavras; estados com cor, contorno e sinal; "Vista em texto" com todos os passos e a tabela posição, valor e estado.

### O que cabe a quem escreve

Escrever dentro do elemento o resultado e os valores comparados, para quem lê sem JavaScript, e usar até 10 a 12 valores para que o vetor caiba num telemóvel sem deslocar.

## Sem JavaScript

Aparece o texto escrito dentro do elemento e o `<pre data-pseudocode>`, se houver.

## Ver também

- [Usar widgets](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/usar.md): importar, teclado, previsões, versões.
- [Catálogo](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/index.md) dos widgets.
