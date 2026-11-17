# `<uc-widget-recursion>`

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/uc-widget-recursion.html

A árvore de chamadas e a pilha de chamadas de três funções recursivas: fatorial, Fibonacci e as Torres de Hanói, com o valor devolvido por cada chamada.

Exemplo (fib(4) com perguntas de previsão), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-widget-recursion/basic.html):

```html
<uc-widget-recursion algorithm="fibonacci" n="4" predict>
  <p>fib(4) = fib(3) + fib(2) = 2 + 1 = 3, com 9 chamadas: fib(2) é calculado duas vezes
    e fib(1) três.</p>
</uc-widget-recursion>
```

A chamada em curso está cheia; as chamadas que esperam por ela (a pilha) têm um ponto (•); as que já devolveram têm ✓ e o valor ao lado. Em Fibonacci vê-se que as mesmas chamadas se repetem.

## Utilização

`algorithm` escolhe a função e `n` o argumento. Para a árvore caber no ecrã, `n` vai até 8 no fatorial, 6 em Fibonacci e 4 nas Torres de Hanói.

```html
<script src="https://uc-design-kit.miguelrocha.dev/widgets/v1/uc-widget-recursion.js" defer></script>

<uc-widget-recursion algorithm="factorial" n="4">
  <p>fact(4) = 4 × fact(3) = 4 × 6 = 24, com 4 chamadas.</p>
</uc-widget-recursion>
```

## Torres de Hanói

Exemplo (Torres de Hanói com 3 discos), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-widget-recursion/hanoi.html):

```html
<uc-widget-recursion algorithm="hanoi" n="3">
  <p>Torres de Hanói com 3 discos: A→C, A→B, C→B, A→C, B→A, B→C, A→C (7 movimentos).</p>
</uc-widget-recursion>
```

O painel mostra os três postes (os discos de baixo para cima) e os movimentos feitos. Cada chamada `h(n,A,C)` move `n` discos de A para C.

Com `predict`, no fatorial e em Fibonacci, antes de cada chamada devolver o widget pergunta "Quanto devolve fib(3)?".

## Atributos

Além dos [atributos comuns](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/usar.md#atributos-comuns):

| Atributo | Tipo | Por omissão | Descrição |
| --- | --- | --- | --- |
| `algorithm` | `factorial`, `fibonacci`, `hanoi` | `factorial` | A função. |
| `n` | inteiro | 5, 4 ou 3 | O argumento (fatorial ≤ 8, Fibonacci ≤ 6, Hanói de 1 a 4). |

Com `editable`, o aluno muda `n`.

## Linhas do pseudocódigo

Os identificadores para marcar as linhas de um `<pre data-pseudocode>` próprio (ver [Pseudocódigo próprio](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/usar.md#pseudocodigo)):

| Bloco | Linhas |
| --- | --- |
| `factorial` | `base`, `call`, `return` |
| `fibonacci` | `base`, `left`, `right`, `return` |
| `hanoi` | `base`, `left`, `move`, `right`, `return` |

## Painel de estado

A pilha de chamadas, com o topo primeiro; nas Torres de Hanói também os postes e a saída (os movimentos).

## Acessibilidade

### O que o widget faz

Uma frase por passo ("fib(3) = fib(3 - 1) + fib(3 - 2) = 1 + 1 = 2."); a árvore descrita em palavras, chamada a chamada; "Vista em texto" com a tabela chamada, valor devolvido e estado.

### O que cabe a quem escreve

Escrever dentro do elemento o resultado e o número de chamadas, e preferir argumentos pequenos (fib(4), Hanói com 3 discos): a árvore de fib(6) já tem 25 chamadas e num telemóvel desloca-se na horizontal.

## Sem JavaScript

Aparece o texto escrito dentro do elemento e o `<pre data-pseudocode>`, se houver.

## Ver também

- [Usar widgets](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/usar.md): importar, teclado, previsões, versões.
- [Catálogo](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/index.md) dos widgets.
