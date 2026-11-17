# `<uc-widget-stack-queue>`

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/uc-widget-stack-queue.html

Pilha (push, pop, peek) e fila (enqueue, dequeue, peek), em vetor de capacidade fixa (a fila é um vetor circular, com `front` e `back` a dar a volta) ou em lista ligada.

Exemplo (fila circular de capacidade 4), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-widget-stack-queue/basic.html):

```html
<uc-widget-stack-queue algorithm="queue" capacity="4" values="3 8 5"
                       ops="dequeue; enqueue 1; enqueue 9; enqueue 7; dequeue">
  <p>Fila circular de capacidade 4 com 3 8 5. Sai 3, entram 1 e 9 (o 9 vai para a
    posição 0), 7 não cabe, sai 8. Fica 5 1 9.</p>
</uc-widget-stack-queue>
```

Num vetor cheio, `push` e `enqueue` dão overflow e não mudam nada; numa estrutura vazia, `pop`, `dequeue` e `peek` dão underflow.

## Utilização

`algorithm` escolhe a estrutura (`stack` ou `queue`) e `impl` a implementação. `values` são os elementos iniciais (do fundo para o topo, ou da frente para o fim) e `ops` as operações; sem `ops`, cada valor entra passo a passo.

```html
<script src="https://uc-design-kit.miguelrocha.dev/widgets/v1/uc-widget-stack-queue.js" defer></script>

<uc-widget-stack-queue algorithm="stack" capacity="5" ops="push 4; push 7; pop; push 2">
  <p>Pilha: push 4, push 7, pop devolve 7, push 2. Fica 4 2 (2 no topo).</p>
</uc-widget-stack-queue>
```

## Em lista ligada

Exemplo (pilha em lista ligada, com operações editáveis), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-widget-stack-queue/list.html):

```html
<uc-widget-stack-queue algorithm="stack" impl="list" values="3 8" ops="push 5; pop; peek; pop; pop; pop" editable>
  <p>Pilha 3 8 (8 no topo). push 5, pop devolve 5, peek devolve 8, depois saem 8 e 3
    e o último pop encontra a pilha vazia.</p>
</uc-widget-stack-queue>
```

Com `impl="list"` a pilha guarda o topo no primeiro nó (`top`) e a fila guarda `front` e `back`; os nós são desenhados como em [`<uc-widget-list>`](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/uc-widget-list.md). Não há perguntas de previsão neste widget.

## Atributos

Além dos [atributos comuns](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/usar.md#atributos-comuns):

| Atributo | Tipo | Por omissão | Descrição |
| --- | --- | --- | --- |
| `algorithm` | `stack`, `queue` | `stack` | A estrutura. |
| `impl` | `array`, `list` | `array` | A implementação. |
| `capacity` | inteiro de 1 a 16 | `8` | O tamanho do vetor (só em `array`). Em lista, até 10 nós. |
| `values` | inteiros | vazio | Os elementos iniciais. |
| `ops` | operações separadas por `;` | ausente | `push v`, `pop`, `peek` (pilha); `enqueue v`, `dequeue`, `peek` (fila). |

Com `editable`, o aluno escreve as suas próprias operações.

## Linhas do pseudocódigo

Os identificadores para marcar as linhas de um `<pre data-pseudocode>` próprio (ver [Pseudocódigo próprio](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/usar.md#pseudocodigo)); o bloco é a estrutura e a implementação (`data-algorithm="queue-array"`):

| Bloco | Linhas |
| --- | --- |
| `stack-array`, `queue-array` | `full`, `write`, `empty`, `read`, `move` |
| `stack-list`, `queue-list` | `new`, `link`, `empty`, `read`, `move` |

## Painel de estado

O número de elementos.

## Acessibilidade

### O que o widget faz

Uma frase por passo ("Escreve 9 na posição 0: o fim deu a volta ao vetor; back = 0."); a estrutura descrita em palavras, do fundo para o topo ou da frente para o fim; "Vista em texto" com a tabela posição, valor e estado.

### O que cabe a quem escreve

Escrever dentro do elemento o conteúdo final e o que cada operação devolveu, e manter a capacidade pequena (4 a 8) para mostrar o overflow e a volta do vetor circular.

## Sem JavaScript

Aparece o texto escrito dentro do elemento e o `<pre data-pseudocode>`, se houver.

## Ver também

- [Usar widgets](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/usar.md): importar, teclado, previsões, versões.
- [Catálogo](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/index.md) dos widgets.
