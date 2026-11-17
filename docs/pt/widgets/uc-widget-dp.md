# `<uc-widget-dp>`

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/uc-widget-dp.html

Tabelas de programação dinâmica preenchidas célula a célula, com o caminho de reconstrução da resposta para trás: maior subsequência comum, distância de edição, mochila 0/1 e troco com moedas.

Exemplo (Maior subsequência comum com previsões), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-widget-dp/basic.html):

```html
<uc-widget-dp problem="lcs" a="ABCBDAB" b="BDCABA" predict>
  <p>A maior subsequência comum de ABCBDAB e BDCABA tem comprimento 4: por exemplo, BCBA.</p>
</uc-widget-dp>
```

Cada passo preenche uma célula: a célula nova fica a azul e as células que a recorrência lê ficam tracejadas, e a frase dá a conta com os números ("a[3] = b[3] = C: dp[3][3] = dp[2][2] + 1 = 2."). Antes disso, um passo preenche os casos base (a linha 0 e a coluna 0). Depois da tabela vem a reconstrução: um passo por célula do caminho, da resposta até à linha ou coluna 0, com a decisão tomada em cada uma; as células do caminho ficam marcadas com ✓ e o painel junta o que o caminho vai encontrando (os caracteres da LCS, as operações, os objetos, as moedas).

## Utilização

```html
<script src="https://uc-design-kit.miguelrocha.dev/widgets/v1/uc-widget-dp.js" defer></script>

<uc-widget-dp problem="edit-distance" a="GATO" b="PATOS">
  <p>De GATO para PATOS são 2 operações: substituir G por P e inserir S.</p>
</uc-widget-dp>
```

## Problemas e dados

O atributo `problem` escolhe o problema (é o algoritmo do widget, por isso `algorithm` também serve); os dados de cada problema vão em atributos próprios. Cada problema tem dados por omissão, para o widget funcionar só com `problem`.

| `problem` | Dados | Por omissão | Tabela |
| --- | --- | --- | --- |
| `lcs` (por omissão) | `a`, `b`: palavras sem espaços, de 1 a 8 caracteres | `a="ABCBDAB" b="BDCABA"` | dp[i][j] = comprimento da LCS de a[1..i] e b[1..j]; linhas ε e as letras de a, colunas ε e as letras de b |
| `edit-distance` | `a`, `b`, como acima | `a="GATO" b="PATOS"` | dp[i][j] = menor número de inserções, remoções e substituições que levam a[1..i] a b[1..j] |
| `knapsack` | `weights`, `values`: o mesmo número de inteiros positivos (1 a 8 objetos); `capacity`: 1 a 8 | `weights="1 3 4 5" values="1 4 5 7" capacity="7"` | dp[i][c] = melhor valor com os objetos 1..i e capacidade c; linhas i=0 a i=n, colunas 0 a W |
| `coins` | `coins`: 1 a 6 inteiros positivos diferentes; `amount`: 1 a 8 | `coins="1 3 4" amount="6"` | dp[x] = menor número de moedas que somam x (∞ quando não há troco); uma linha, colunas 0 a A |

Os índices das cadeias começam em 1 (a[1] é o primeiro carácter), como na recorrência; a linha e a coluna 0 são a cadeia vazia ε. Na mochila, os objetos aparecem no painel como `1: p=1 v=1` (peso e valor). As moedas são usadas por ordem crescente.

## Mochila e troco

Exemplo (Mochila 0/1, editável), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-widget-dp/knapsack.html):

```html
<uc-widget-dp problem="knapsack" weights="1 3 4 5" values="1 4 5 7" capacity="7" editable>
  <p>Com capacidade 7, o valor máximo é 9: os objetos 2 e 3 (pesos 3 e 4, valores 4 e 5).</p>
</uc-widget-dp>
```

Na mochila, cada célula decide se o objeto i cabe em c: se não cabe, copia a célula de cima; se cabe, fica com o maior entre deixá-lo (a célula de cima) e levá-lo (a célula da linha de cima, p[i] colunas à esquerda, mais o valor). A reconstrução sobe linha a linha: quando o valor muda em relação à linha de cima, o objeto foi levado.

O troco com `coins="1 3 4" amount="6"` mostra porque a estratégia gulosa falha: começar pela maior moeda dá 4 + 1 + 1 (três moedas), e a tabela encontra 3 + 3 (duas). Uma quantia sem troco fica com ∞ (`coins="2 4" amount="7"`).

Para comparar dois problemas sobre os mesmos dados, use o atributo comum `algorithms`: `<uc-widget-dp a="KITTEN" b="SITTING" algorithms="lcs edit-distance">` mostra dois botões, e a LCS e a distância de edição usam as mesmas palavras.

## Dados editáveis

Com `editable`, o campo tem todos os dados do problema numa linha: as duas palavras separadas por um espaço (`GATO PATOS`), `pesos : valores : capacidade` (`1 3 4 5 : 1 4 5 7 : 7`) ou `moedas : quantia` (`1 3 4 : 6`).

## Perguntas de previsão

Com `predict`, o widget pergunta "Quanto vale dp[4][3]?" antes de preencher cada célula da última linha da tabela (no troco, antes de cada célula), com três números seguidos como opções. Não pergunta quando o valor é ∞. As linhas de cima servem de exemplo; na última linha, o estudante já tem de saber aplicar a recorrência.

## Atributos

Além dos [atributos comuns](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/usar.md#atributos-comuns):

| Atributo | Tipo | Por omissão | Descrição |
| --- | --- | --- | --- |
| `problem` | `lcs`, `edit-distance`, `knapsack`, `coins` | `lcs` | O problema. Tem prioridade sobre `algorithm`; os botões de `algorithms` têm prioridade sobre ele. |
| `a`, `b` | palavras sem espaços, 1 a 8 caracteres | ver [Problemas e dados](#problemas) | As cadeias da LCS e da distância de edição. |
| `weights`, `values` | inteiros positivos, 1 a 8, o mesmo número | `1 3 4 5`, `1 4 5 7` | Pesos e valores dos objetos da mochila. |
| `capacity` | inteiro de 1 a 8 | `7` | Capacidade da mochila. |
| `coins` | 1 a 6 inteiros positivos diferentes | `1 3 4` | As moedas. |
| `amount` | inteiro de 1 a 8 | `6` | A quantia do troco. |

## Linhas do pseudocódigo

Os identificadores para marcar as linhas de um `<pre data-pseudocode>` próprio (ver [Pseudocódigo próprio](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/usar.md#pseudocodigo)); `data-algorithm` é o nome do problema:

| Problema | Linhas |
| --- | --- |
| `lcs` | `base`, `match`, `max`, `back`, `take`, `up`, `left` |
| `edit-distance` | `base`, `same`, `min`, `back`, `keep`, `sub`, `del`, `ins` |
| `knapsack` | `base`, `skip`, `max`, `back`, `take`, `leave` |
| `coins` | `base`, `none`, `min`, `back`, `use` |

`back` marca o fim do caminho (a célula da linha ou coluna 0 onde a reconstrução para).

## Acessibilidade

### O que o widget faz

Uma frase por passo com a recorrência e os números; a tabela descrita em palavras, linha a linha; estados com cor, contorno, tracejado e sinal (▼ na célula nova, ✓ no caminho); "Vista em texto" com a tabela inteira, as células vazias como "—" e o estado de cada célula marcada entre parênteses.

### O que cabe a quem escreve

Escrever dentro do elemento a resposta e a reconstrução (a LCS, as operações, os objetos, as moedas) e preferir dados pequenos: uma tabela de 5 × 6 já mostra a ideia, e a de 9 × 9 lê-se mal num telemóvel.

## Sem JavaScript

Aparece o texto escrito dentro do elemento e o `<pre data-pseudocode>`, se houver.

## Ver também

- [`<uc-widget-recursion>`](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/uc-widget-recursion.md): a árvore de chamadas de Fibonacci, com os subproblemas repetidos que a tabela evita.
- [`<uc-widget-backtracking>`](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/uc-widget-backtracking.md): subconjuntos com soma dada por pesquisa com cortes.
- [Usar widgets](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/usar.md) e o [Catálogo](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/index.md).
