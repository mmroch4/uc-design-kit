# `<uc-widget-union-find>`

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/uc-widget-union-find.html

Conjuntos disjuntos (union-find): o vetor parent e a floresta, com união por tamanho e compressão de caminhos ou sem elas, operação a operação.

Exemplo (União por tamanho e compressão de caminhos, com previsões), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-widget-union-find/basic.html):

```html
<uc-widget-union-find n="8" predict>
  <p>Uniões 0-1, 2-3, 4-5, 6-7, depois 0-2 e 4-6, por fim 0-4: um só conjunto com raiz 0.
     find(7) sobe 7 → 6 → 4 → 0 e a compressão liga 7 e 6 diretamente a 0.</p>
</uc-widget-union-find>
```

Por cima, o vetor `parent` (o elemento `i` aponta para `parent[i]`; uma raiz aponta para si própria); por baixo, a floresta que esse vetor representa, uma árvore por conjunto. Ao lado de cada raiz está o tamanho do conjunto. Cada `find` sobe passo a passo até à raiz e, com compressão, liga depois cada nó do caminho diretamente à raiz; cada `union` faz dois `find` e liga uma raiz à outra. O painel mostra quantos conjuntos há e a altura da árvore mais alta.

## Utilização

```html
<script src="https://uc-design-kit.miguelrocha.dev/widgets/v1/uc-widget-union-find.js" defer></script>

<uc-widget-union-find n="6" ops="union 0 1; union 2 3; union 1 3; connected 0 2">
  <p>Depois das uniões, 0 e 2 estão no mesmo conjunto.</p>
</uc-widget-union-find>
```

## Operações

Os elementos são os números de `0` a `n − 1` (`n` de 1 a 16), cada um começa no seu conjunto. `ops` é a lista de operações, separadas por `;`:

| Operação | Efeito |
| --- | --- |
| `union a b` | Junta os conjuntos de `a` e de `b` (nada, se já forem o mesmo). |
| `find a` | Procura a raiz do conjunto de `a`. |
| `connected a b` | Diz se `a` e `b` estão no mesmo conjunto (`find(a) = find(b)`). |

Sem `ops`, o widget junta os vizinhos (0-1, 2-3, …), depois os pares de conjuntos (0-2, 4-6, …), até ficar um só conjunto, e termina com `find` do último elemento e `connected 1 n−1`.

## Com e sem heurísticas

Exemplo (Uma cadeia de uniões nas três variantes, editável), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-widget-union-find/compare.html):

```html
<uc-widget-union-find n="6" algorithms="naive size compression"
    ops="union 0 1; union 1 2; union 2 3; union 3 4; union 4 5; find 0; find 0" editable>
  <p>Uma cadeia de uniões: sem heurísticas a árvore fica com altura 5 (uma lista);
     com união por tamanho fica com altura 1.</p>
</uc-widget-union-find>
```

`algorithm` escolhe a variante: `compression` (união por tamanho e compressão de caminhos, a que se usa), `size` (só união por tamanho) e `naive` (`parent[find(a)] = find(b)`, sem compressão). Com `algorithms="naive size compression"` o aluno troca de variante com os botões e compara a altura das árvores na mesma sequência de operações. Na união por tamanho, a raiz do conjunto menor fica debaixo da do maior; com tamanhos iguais, a raiz de `b` fica debaixo da de `a`.

Perguntas de previsão: na união por tamanho, "Que raiz fica por cima: 0 (tamanho 2) ou 3 (tamanho 1)?"; em `connected`, "0 e 2 estão no mesmo conjunto?" (Sim / Não).

## Atributos

Além dos [atributos comuns](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/usar.md#atributos-comuns):

| Atributo | Tipo | Por omissão | Descrição |
| --- | --- | --- | --- |
| `n` | inteiro de 1 a 16 | `8` | O número de elementos (0 a n − 1). |
| `ops` | operações separadas por `;` | o guião acima | As operações; é o que o campo de `editable` edita. |
| `algorithm` | `compression`, `size`, `naive` | `compression` | A variante. |

## Linhas do pseudocódigo

O pseudocódigo muda com a operação em curso. Num `<pre data-pseudocode>` próprio (ver [Pseudocódigo próprio](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/usar.md#pseudocodigo)), `data-algorithm` é o nome do bloco:

| Bloco | Quando | Linhas |
| --- | --- | --- |
| `find` | `size`, `naive` | `up`, `root` |
| `find-compression` | `compression` | `up`, `root`, `compress` |
| `union` | `naive` | `roots`, `same`, `link` |
| `union-size` | `compression`, `size` | `roots`, `same`, `link` |
| `connected` | todas | `answer` |

## Acessibilidade

### O que o widget faz

Uma frase por passo ("find(7) = 0: 0 é a raiz, pelo caminho 7 → 6 → 4 → 0."); os conjuntos e o vetor `parent` descritos em palavras; o tamanho de cada raiz escrito ao lado dela, não só desenhado; estados com cor, espessura, tracejado e sinal; "Vista em texto" com uma tabela elemento, `parent`, raiz, tamanho e estado.

### O que cabe a quem escreve

Escrever dentro do elemento os conjuntos no fim e o que a sequência mostra (por exemplo, a altura das árvores com e sem heurísticas).

## Sem JavaScript

Aparece o texto escrito dentro do elemento e o `<pre data-pseudocode>`, se houver.

## Ver também

- [`<uc-widget-mst>`](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/uc-widget-mst.md): o algoritmo de Kruskal usa union-find para recusar as arestas que formariam ciclos.
- [`<uc-widget-graph>`](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/uc-widget-graph.md): componentes conexas com uma pesquisa em largura.
- [Usar widgets](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/usar.md) e o [Catálogo](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/index.md).
