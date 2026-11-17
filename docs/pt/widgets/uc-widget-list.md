# `<uc-widget-list>`

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/uc-widget-list.html

Uma lista ligada simples, ponteiro a ponteiro: adicionar no início e no fim, inserir numa posição, remover, procurar e inverter, com `head`, `cur`, `prev` e `next` desenhados.

Exemplo (quatro operações numa lista de três nós), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-widget-list/basic.html):

```html
<uc-widget-list values="3 8 5" ops="add-first 1; insert 2 4; remove 8; reverse">
  <p>Lista 3 → 8 → 5. Depois de adicionar 1 no início, inserir 4 na posição 2,
    remover 8 e inverter: 5 → 4 → 3 → 1.</p>
</uc-widget-list>
```

Um nó novo aparece por cima da lista até ficar ligado; a seta que muda em cada passo fica a violeta. Ao inverter, as setas passam a apontar para trás e, no fim, os nós arrumam-se pela nova ordem.

## Utilização

`values` é a lista inicial (até 10 nós) e `ops` as operações. Sem `ops`, cada valor é adicionado no fim, passo a passo.

```html
<script src="https://uc-design-kit.miguelrocha.dev/widgets/v1/uc-widget-list.js" defer></script>

<uc-widget-list values="4 2 7" ops="remove 2">
  <p>Remover 2 de 4 → 2 → 7: 4.next passa a ser 7. Fica 4 → 7.</p>
</uc-widget-list>
```

### Operações

| Operação | Efeito |
| --- | --- |
| `add-first v` | Novo nó no início. |
| `add-last v` | Percorre até ao último e liga um nó novo depois dele. |
| `insert k v` | Novo nó na posição k (0 é o início); uma posição que não existe não muda nada. |
| `remove-first`, `remove-last` | Tira o primeiro / o último nó. |
| `remove v` | Tira o primeiro nó com v. |
| `search v` | Procura v e diz a posição. |
| `reverse` | Inverte a lista com `prev`, `cur` e `next`. |

## Com previsões e edição

Exemplo (procurar e remover, com perguntas e operações editáveis), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-widget-list/editable.html):

```html
<uc-widget-list values="4 2 7" ops="search 7; remove-last; add-last 6" predict editable>
  <p>Procurar 7 (posição 2), remover o último e adicionar 6 no fim: 4 → 2 → 6.</p>
</uc-widget-list>
```

Com `predict`, cada comparação de `search` e `remove` pergunta "7 é igual a 7?". Com `editable`, o aluno escreve as suas próprias operações.

## Atributos

Além dos [atributos comuns](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/usar.md#atributos-comuns):

| Atributo | Tipo | Por omissão | Descrição |
| --- | --- | --- | --- |
| `values` | inteiros, ou `random N [MIN..MAX]` | `random 4 1..20` | A lista inicial, até 10 nós. |
| `ops` | operações separadas por `;` | ausente | As operações a mostrar. |

## Linhas do pseudocódigo

Os identificadores para marcar as linhas de um `<pre data-pseudocode>` próprio (ver [Pseudocódigo próprio](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/usar.md#pseudocodigo)); o bloco é o nome da operação (`data-algorithm="reverse"`):

| Bloco | Linhas |
| --- | --- |
| `add-first` | `new`, `link`, `head` |
| `add-last` | `new`, `link`, `head`, `walk`, `relink` |
| `insert` | `head`, `walk`, `new`, `link`, `relink` |
| `remove-first` | `head`, `free` |
| `remove-last` | `walk`, `head`, `unlink`, `free` |
| `remove` | `compare`, `missing`, `head`, `unlink`, `free` |
| `search` | `compare`, `found`, `missing` |
| `reverse` | `start`, `next`, `turn`, `move`, `head` |

## Painel de estado

O tamanho da lista.

## Acessibilidade

### O que o widget faz

Uma frase por passo com o ponteiro que muda ("cur.next = prev: 4 passa a apontar para 3."); a lista descrita em palavras ("Lista: 1 → 3 → 8 → null."); "Vista em texto" com a tabela posição, valor, seguinte e estado.

### O que cabe a quem escreve

Escrever dentro do elemento a lista final e o que cada operação fez, e manter a lista curta (até 6 ou 7 nós leem-se bem num telemóvel).

## Sem JavaScript

Aparece o texto escrito dentro do elemento e o `<pre data-pseudocode>`, se houver.

## Ver também

- [Usar widgets](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/usar.md): importar, teclado, previsões, versões.
- [Catálogo](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/index.md) dos widgets.
