# `<uc-widget-complexity>`

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/uc-widget-complexity.html

As funções de crescimento (1, log n, n, n log n, n², 2ⁿ…) lado a lado à medida que n cresce, com as contagens reais de outro widget da página.

Exemplo (as funções de crescimento de n = 1 a 12, com previsões), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-widget-complexity/basic.html):

```html
<uc-widget-complexity max="12" predict>
  <p>Para n = 12: 1 &lt; log n &lt; n &lt; n log n &lt; n² &lt; 2ⁿ.
    2ⁿ passa à frente de n² em n = 5.</p>
</uc-widget-complexity>
```

Cada passo aumenta n em 1: as curvas crescem até n, um ponto marca o valor de cada função e o painel lista os valores. Quando duas funções trocam de ordem (2ⁿ passa à frente de n² em n = 5), as duas ficam destacadas e a frase diz qual passou qual; com `predict`, antes desse passo o aluno escolhe qual é maior. O último passo ordena as funções para o maior n. As curvas distinguem-se pelo tracejado e pelo nome no fim de cada uma, não só pela cor; em escala linear, uma curva que sai pelo topo leva "↑".

## Utilização

```html
<script src="https://uc-design-kit.miguelrocha.dev/widgets/v1/uc-widget-complexity.js" defer></script>

<uc-widget-complexity functions="n nlogn n2" max="20">
  <p>Para n = 20: n = 20, n log n ≈ 86, n² = 400.</p>
</uc-widget-complexity>
```

| Nome em `functions` | Função |
| --- | --- |
| `1` | 1 |
| `log` | log n (base 2) |
| `sqrt` | √n |
| `n` | n |
| `nlogn` | n log n |
| `n2` | n² |
| `n3` | n³ |
| `2n` | 2ⁿ |
| `fact` | n! |

Em escala linear (a omissão) a altura do gráfico é a da maior função polinomial em `max`: as exponenciais saem pelo topo, que é o que se quer mostrar. `scale="log"` usa um eixo logarítmico (potências de 10), onde todas cabem.

## Medir outro widget

Exemplo (comparações reais da ordenação por inserção sobre n, n log n e n²), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-widget-complexity/measure.html):

```html
<uc-widget-sort id="insercao" values="5 2 9 1 7 3 8 6" algorithm="insertion" editable controls="compact">
  <p>Ordenação por inserção de 5 2 9 1 7 3 8 6.</p>
</uc-widget-sort>
<uc-widget-complexity functions="n nlogn n2" max="16" for="insercao" points="4:6">
  <p>Comparações da ordenação por inserção comparadas com n, n log n e n².</p>
</uc-widget-complexity>
```

Com `for="id"`, sempre que o widget com esse `id` chega ao último passo (evento `uc:widgetdone`), o seu contador entra no gráfico como um ponto ■ em n = tamanho da entrada (o número de valores; num grafo, vértices + arestas). `measure` escolhe o contador (`comparisons`, `swaps`, `writes`, `probes`, `edges`, `relaxations`); sem ele, conta o primeiro. Com `editable` no outro widget, o aluno experimenta entradas de vários tamanhos e vê os pontos acompanharem (ou não) cada curva. `points="4:6 8:28"` junta pontos escritos à mão. Os pontos desenham-se por cima dos passos e entram na vista em texto.

## Atributos

Além dos [atributos comuns](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/usar.md#atributos-comuns):

| Atributo | Tipo | Por omissão | Descrição |
| --- | --- | --- | --- |
| `functions` | nomes separados por espaços (até 8) | `1 log n nlogn n2 2n` | As funções a comparar. |
| `max` | inteiro de 2 a 32 | `16` | O maior n. |
| `scale` | `linear`, `log` | `linear` | A escala do eixo vertical. |
| `for` | `id` de outro widget | ausente | O widget cujas contagens são medidas. |
| `measure` | nome de um contador | o primeiro do outro widget | O contador medido. |
| `points` | pares `n:valor` | ausente | Pontos medidos escritos à mão. |

Com `editable`, o aluno muda as funções. Este widget não tem pseudocódigo.

## Acessibilidade

### O que o widget faz

Uma frase por passo com os valores de todas as funções ("n = 5: … 2ⁿ passa à frente de n²."); o gráfico descrito em palavras, com os pontos medidos; curvas distintas por tracejado e nome, não só pela cor; os pontos novos anunciados ("Novo ponto medido: n = 8, 17 (Comparações)."); "Vista em texto" com a tabela função e valor em n.

### O que cabe a quem escreve

Escrever dentro do elemento a conclusão (a ordem das funções, o ponto onde uma passa a outra) e, ao medir outro widget, dizer na página qual contador se mede e que o aluno deve chegar ao fim da demonstração.

## Sem JavaScript

Aparece o texto escrito dentro do elemento e o `<pre data-pseudocode>`, se houver. O `<pre data-input>` não aparece: escreva o resultado num parágrafo.

## Ver também

- [`<uc-widget-sort>`](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/uc-widget-sort.md) e [`<uc-widget-search>`](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/uc-widget-search.md): os contadores mais usados para medir.
- [Eventos](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/usar.md#eventos): `uc:widgetdone` traz `stats` e `input`.
- [Usar widgets](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/usar.md) e o [Catálogo](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/index.md).
