# `<uc-widget-bst>`

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/uc-widget-bst.html

Uma árvore binária de pesquisa: inserir, remover, procurar, mínimo e máximo, e os percursos pré-ordem, em-ordem, pós-ordem e em largura, com a pilha de chamadas ou a fila.

Exemplo (quatro operações numa árvore com sete nós), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-widget-bst/basic.html):

```html
<uc-widget-bst values="50 30 70 20 40 60 80" ops="insert 45; search 60; remove 30; min">
  <p>Árvore com raiz 50. Inserir 45 (fica à direita de 40), procurar 60 (encontrado),
    remover 30 (o sucessor 40 ocupa o seu lugar), mínimo: 20.</p>
</uc-widget-bst>
```

Cada operação desce a partir da raiz: o caminho já percorrido fica marcado com um ponto (•) e o nó comparado com contorno tracejado. O pseudocódigo muda para o da operação em curso.

## Utilização

`values` são os valores inseridos, por esta ordem, numa árvore vazia (até 15 nós; valores repetidos são ignorados). Com `ops`, a árvore de `values` aparece já feita e as operações correm passo a passo; sem `ops`, a inserção de cada valor é a demonstração.

```html
<script src="https://uc-design-kit.miguelrocha.dev/widgets/v1/uc-widget-bst.js" defer></script>

<uc-widget-bst values="8 3 10 1 6 14">
  <p>Inserção de 8 3 10 1 6 14: raiz 8; 3 e 10 filhos de 8; 1 e 6 filhos de 3; 14 à direita de 10.</p>
</uc-widget-bst>
```

### Operações

Separadas por `;`, com os verbos em inglês (lêem-se como código):

| Operação | Efeito |
| --- | --- |
| `insert v` | Insere v (se já existir, não muda nada). |
| `remove v` | Remove v: uma folha sai; um nó com um filho é substituído pelo filho; um nó com dois filhos recebe o sucessor (o mínimo da subárvore direita). |
| `search v` | Procura v. |
| `min`, `max` | Desce sempre para a esquerda / direita. |

## Percursos

Exemplo (os quatro percursos, com botões para escolher), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-widget-bst/traversals.html):

```html
<uc-widget-bst values="5 3 8 1 4 7 9" algorithm="inorder"
               algorithms="preorder inorder postorder levelorder" predict>
  <ul>
    <li>Pré-ordem: 5 3 1 4 8 7 9</li>
    <li>Em-ordem: 1 3 4 5 7 8 9</li>
    <li>Pós-ordem: 1 4 3 7 9 8 5</li>
    <li>Em largura: 5 3 8 1 4 7 9</li>
  </ul>
</uc-widget-bst>
```

Com `algorithm` igual a `preorder`, `inorder`, `postorder` ou `levelorder`, a árvore de `values` é percorrida. O atributo comum `algorithms` mostra botões para o aluno trocar de percurso sem sair da página. O painel mostra a saída e a pilha de chamadas (em largura, a fila). Este é o widget do [guião da aula 10](https://uc-design-kit.miguelrocha.dev/examples/edados-2526/guioes/aula10.html) de Estruturas de Dados.

As perguntas de previsão são: "Onde está 45 em relação a 30?" (Esquerda / Direita / Encontrado) nas operações, e "Qual é o próximo valor impresso?" nos percursos.

## Atributos

Além dos [atributos comuns](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/usar.md#atributos-comuns):

| Atributo | Tipo | Por omissão | Descrição |
| --- | --- | --- | --- |
| `values` | inteiros, ou `random N [MIN..MAX]` | `random 7` | Os valores da árvore, até 15. |
| `ops` | operações separadas por `;` | ausente | As operações a mostrar (só em `operations`). |
| `algorithm` | `operations`, `preorder`, `inorder`, `postorder`, `levelorder` | `operations` | Operações ou um percurso. |

Com `editable`, o aluno muda os valores da árvore.

## Linhas do pseudocódigo

Os identificadores para marcar as linhas de um `<pre data-pseudocode>` próprio (ver [Pseudocódigo próprio](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/usar.md#pseudocodigo)); nas operações, use `data-algorithm` com o nome da operação (`data-algorithm="insert"`):

| Bloco | Linhas |
| --- | --- |
| `insert` | `left`, `right`, `found`, `dup`, `place` |
| `search` | `left`, `right`, `found`, `missing` |
| `remove` | `left`, `right`, `found`, `missing`, `leaf`, `one`, `succ`, `copy` |
| `min`, `max` | `walk`, `found` |
| `preorder`, `inorder`, `postorder` | `left`, `right`, `print` |
| `levelorder` | `start`, `take`, `print`, `push` |

## Acessibilidade

### O que o widget faz

Uma frase por passo ("45 > 40: desce para a direita de 40."); a árvore descrita em palavras ("Árvore com raiz 50. Filhos de 50: 30 e 70. …"); estados com cor, contorno e sinal, e as arestas do caminho marcadas; "Vista em texto" com uma tabela nó, filho esquerdo, filho direito e estado.

### O que cabe a quem escreve

Escrever dentro do elemento a árvore e o resultado (os percursos, a árvore final), e ficar pelos 7 a 10 nós para que a árvore se leia num telemóvel.

## Sem JavaScript

Aparece o texto escrito dentro do elemento e o `<pre data-pseudocode>`, se houver.

## Ver também

- [Usar widgets](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/usar.md): importar, teclado, previsões, versões.
- [Catálogo](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/index.md) dos widgets.
