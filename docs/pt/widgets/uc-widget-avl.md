# `<uc-widget-avl>`

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/uc-widget-avl.html

Uma árvore AVL: inserir, remover e procurar, com o fator de equilíbrio de cada nó e as rotações simples e duplas que a mantêm equilibrada.

Exemplo (sete inserções com as rotações simples e dupla, com previsões), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-widget-avl/basic.html):

```html
<uc-widget-avl values="10 20 30 25 28 5 4" predict>
  <p>Inserção de 10 20 30 25 28 5 4: uma rotação à esquerda (30), uma dupla
    esquerda-direita (28) e uma à direita (4). Fica com raiz 20; em ordem: 4 5 10 20 25 28 30.</p>
</uc-widget-avl>
```

Ao lado de cada nó está o seu fator de equilíbrio, altura da subárvore esquerda menos altura da subárvore direita. Depois de inserir ou remover, o widget sobe pelo caminho até à raiz: em cada nó atualiza a altura e o fator, e um fator de +2 ou −2 é corrigido com uma ou duas rotações. A subida pára no primeiro nó cuja altura não mudou.

## Utilização

`values` são os valores inseridos, por esta ordem, numa árvore vazia (até 15 nós; valores repetidos são ignorados). Com `ops`, a árvore AVL de `values` aparece já feita e as operações correm passo a passo; sem `ops`, a inserção de cada valor é a demonstração.

```html
<script src="https://uc-design-kit.miguelrocha.dev/widgets/v1/uc-widget-avl.js" defer></script>

<uc-widget-avl values="1 2 3 4 5 6 7">
  <p>Inserir 1 a 7 por ordem: com as rotações, fica a árvore perfeita de raiz 4.</p>
</uc-widget-avl>
```

### Operações

Separadas por `;`, com os verbos em inglês (lêem-se como código):

| Operação | Efeito |
| --- | --- |
| `insert v` | Insere v como numa árvore de pesquisa e reequilibra o caminho (se já existir, não muda nada). |
| `remove v` | Remove v como numa árvore de pesquisa (um nó com dois filhos recebe o sucessor) e reequilibra o caminho; uma remoção pode precisar de mais de uma rotação. |
| `search v` | Procura v. |

## Os quatro casos

| Caso | Quando | Correção |
| --- | --- | --- |
| Esquerda-esquerda | fator +2 e o filho esquerdo com fator 0 ou +1 | rotação à direita no nó |
| Direita-direita | fator −2 e o filho direito com fator 0 ou −1 | rotação à esquerda no nó |
| Esquerda-direita | fator +2 e o filho esquerdo com fator −1 | rotação à esquerda no filho, depois à direita no nó |
| Direita-esquerda | fator −2 e o filho direito com fator +1 | rotação à direita no filho, depois à esquerda no nó |

Exemplo (remoções: uma rotação e o sucessor), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-widget-avl/remove.html):

```html
<uc-widget-avl values="50 30 70 20 40 60 80 10" ops="remove 60; remove 80; remove 30">
  <p>Remover 60 e 80 desequilibra 50: rotação à direita, 30 passa a raiz.
    Remover 30 põe no seu lugar o sucessor, 40.</p>
</uc-widget-avl>
```

As perguntas de previsão são: "Onde está 25 em relação a 30?" (Esquerda / Direita / Encontrado) a descer, e "Fator de 30: +2. Que rotação o equilibra?" com os quatro casos.

## Atributos

Além dos [atributos comuns](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/usar.md#atributos-comuns):

| Atributo | Tipo | Por omissão | Descrição |
| --- | --- | --- | --- |
| `values` | inteiros, ou `random N [MIN..MAX]` | `random 7` | Os valores da árvore, até 15. |
| `ops` | operações separadas por `;` | ausente | As operações a mostrar. |

Com `editable`, o aluno muda os valores da árvore.

## Linhas do pseudocódigo

Os identificadores para marcar as linhas de um `<pre data-pseudocode>` próprio (ver [Pseudocódigo próprio](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/usar.md#pseudocodigo)); use `data-algorithm` com o nome do bloco (`data-algorithm="insert"`):

| Bloco | Linhas |
| --- | --- |
| `insert` | `left`, `right`, `found`, `dup`, `place`, `update`, `case`, `rotate`, `stop` |
| `remove` | `left`, `right`, `found`, `missing`, `leaf`, `one`, `succ`, `copy`, `update`, `case`, `rotate`, `stop` |
| `search` | `left`, `right`, `found`, `missing` |

## Acessibilidade

### O que o widget faz

Uma frase por passo ("30 tem fator +2 e o filho esquerdo 25 pende para a direita: caso esquerda-direita."); a árvore e os fatores descritos em palavras ("Fatores de equilíbrio: 4 0, 5 +1, …"); estados com cor, contorno e sinal; "Vista em texto" com uma tabela nó, filhos, fator e estado.

### O que cabe a quem escreve

Escrever dentro do elemento as operações e a árvore final (por exemplo em ordem e a raiz), e ficar pelos 7 a 10 nós: com os fatores ao lado, a árvore precisa de mais largura.

## Sem JavaScript

Aparece o texto escrito dentro do elemento e o `<pre data-pseudocode>`, se houver.

## Ver também

- [Usar widgets](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/usar.md): importar, teclado, previsões, versões.
- [Catálogo](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/index.md) dos widgets.
- [`<uc-widget-bst>`](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/uc-widget-bst.md): a árvore binária de pesquisa sem equilíbrio, e os percursos.
