# `<uc-problems>`

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-problems.html

As listas de problemas, por séries, a partir do HTML que o professor já escreve: o juiz de cada problema (Mooshak, Codeforces…), os problemas extra e de desafio, o prazo de cada série, filtros por tipo e por juiz e, com `track`, um "Resolvido" que cada estudante marca e que fica guardado no seu browser.

Exemplo (duas séries com prazos, filtros e Resolvido), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-problems/basic.html):

```html
<uc-problems filters track>
  <section data-deadline="ps1">
    <h2>Série 1 · Introdução</h2>
    <ul>
      <li data-judge="entregas"><a href="#">Soma de dois números</a> <code>AP001</code></li>
      <li data-judge="entregas"><a href="#">Contar vogais</a> <code>AP002</code></li>
      <li data-judge="codeforces" data-type="extra"><a href="#">Watermelon</a> <code>4A</code></li>
    </ul>
  </section>
  <section data-deadline="ps2">
    <h2>Série 2 · Ordenação</h2>
    <ul>
      <li data-judge="entregas"><a href="#">Ordenar notas</a> <code>AP010</code></li>
      <li data-judge="entregas"><a href="#">Mediana</a> <code>AP011</code></li>
      <li data-judge="codeforces" data-type="challenge"><a href="#">Towers</a> <code>37A</code></li>
    </ul>
  </section>
</uc-problems>
```

Na demonstração, hoje é 27 de novembro: o prazo da série 1 já passou ("Encerrado") e o da série 2 é daqui a 8 dias. Ao escolher "Extra" ficam só os problemas extra, e a série que fica vazia desaparece. Os "Resolvido" marcados continuam marcados depois de recarregar a página.

## Utilização

Cada série é uma `<section>` com um título e uma lista, um `<li>` por problema. No `<li>`, `data-judge` diz onde se submete; o link e o `<code>` com o código do problema são texto livre. Uma página com uma só lista, sem secções, também serve (uma série sem nome).

`problemas.html`:

```html
<uc-problems filters track>
  <section data-deadline="ps01">
    <h2>Série 1 · Introdução</h2>
    <ul>
      <li data-judge="mooshak"><a href="problems/pc001.html">Increasing Array</a> <code>PC001</code></li>
      <li data-judge="codeforces" data-type="extra"><a href="https://codeforces.com/problemset/problem/499/B">Lecture</a> <code>499B</code></li>
    </ul>
  </section>
</uc-problems>
```

Com JavaScript, cada problema ganha:

- **A etiqueta do juiz**, com o nome da plataforma do `course.js`. `data-judge` pode ser o `id` da plataforma (`"codeforces"`) ou o seu nome, sem distinguir maiúsculas nem acentos (`"Mooshak"`). Um juiz que não está no `course.js` aparece tal como foi escrito.
- **O tipo**, com `data-type`: `main` (por omissão, sem etiqueta), `extra` ("Extra") ou `challenge` ("Desafio").
- **O peso**, quando o item tem um `<data value="40">40 %</data>`: aparece como etiqueta.

Um juiz usado só nos problemas, que não deve aparecer na navegação, escreve-se em `platforms` com `hidden: true` (ver [Plataformas](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#plataformas)).

## Exemplos

### Prazo de cada série

Com `data-deadline="ps01"` na `<section>`, por baixo do título aparece "Prazo: 12 out, 23:59" com o estado ("Daqui a 8 dias", "Amanhã", "Hoje" ou "Encerrado"). O prazo escreve-se uma vez no `course.js` ([Prazos](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#prazos)), por isso aparece também nas próximas datas e na semana certa.

### Filtros

Com `filters`, por cima das séries aparecem dois grupos de botões, "Tipo" e "Juiz", cada um com "Todos" e um botão por valor que exista na página (um grupo com um só valor não aparece). Os dois grupos combinam-se; uma série sem problemas visíveis esconde-se, e o número de problemas que ficaram é anunciado ("2 de 6 problemas").

### Resolvidos

Com `track`, cada problema tem uma caixa "Resolvido" e cada série diz "3 de 5 resolvidos". A escolha fica guardada no browser do estudante (`localStorage`), com uma chave que inclui o código da cadeira e o identificador do problema. Por omissão o identificador é o juiz mais o código (`mooshak:PC001`), por isso um problema que aparece numa série e num índice partilha o estado; `data-id` no `<li>` escolhe outro.

### Cartões, linguagens e dicas

Com `cards`, cada problema fica num cartão: o título em destaque e, ao lado, um selo "Mooshak PC033" com o juiz e o código do problema, que leva ao endereço do juiz no `course.js`. "Resolvido" fica no canto do cartão. É a forma pensada para a página de uma série, com poucos problemas e dicas; num índice com muitas séries, a lista simples ocupa menos.

`data-languages` no `<li>` diz em que linguagens o problema foi testado, separadas por vírgulas. Aparecem como etiquetas pequenas ("Testado em C++ Java Python"); se todos os problemas da série tiverem as mesmas, a linha aparece uma só vez, por baixo do título da série. Um `<details>` dentro do `<li>` são as dicas: o `<summary>` fica um botão discreto com uma seta e o resto um painel. Um `<details>` só com o `<summary>` (dicas ainda por escrever) não aparece. Com `name="hint"` em todos, abrir uma dica fecha a anterior.

`problem-sets/ps07.html`:

```html
<uc-problems cards track>
  <section data-deadline="ps07">
    <h2>Problemas propostos (5)</h2>
    <ul>
      <li data-judge="mooshak" data-languages="C++, Java, Python">
        <a href="../problems/pc033.html">Football Teams</a> <code>PC033</code>
        <details name="hint">
          <summary>Dicas</summary>
          <p>Precisamos de usar DP para contar.</p>
        </details>
      </li>
    </ul>
  </section>
</uc-problems>
```

## Atributos

| Atributo | Tipo | Por omissão | Descrição |
| --- | --- | --- | --- |
| `filters` | booleano | ausente | Acrescenta os filtros por tipo e por juiz. |
| `track` | booleano | ausente | Acrescenta "Resolvido" a cada problema e o progresso de cada série. |
| `cards` | booleano | ausente | Um cartão por problema, com o selo do juiz e do código a ligar ao juiz. |
| `heading` | texto ou `none` | `none` | Título da secção. Por omissão não há, porque a página de problemas tem o seu `<h1>`. |
| `heading-level` | `2` a `6` | `2` | Nível do título gerado. |

Nos itens e nas séries:

| Atributo de dados | Em | Descrição |
| --- | --- | --- |
| `data-judge` | `<li>` | O `id` ou o nome de uma plataforma. |
| `data-type` | `<li>` | `main`, `extra` ou `challenge`. |
| `data-id` | `<li>` | Identificador para "Resolvido". Por omissão, o juiz e o primeiro `<code>`, ou o endereço do link. |
| `data-languages` | `<li>` | As linguagens em que o problema foi testado, separadas por vírgulas. |
| `data-deadline` | `<section>` | O `id` do prazo da série no `course.js`. |

## Configuração usada

| Campo | Para quê |
| --- | --- |
| `platforms` | O nome de cada juiz; `id` e `hidden` ([plataformas](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#plataformas)). |
| `deadlines` | O prazo de cada série ([prazos](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#prazos)). |
| `code` | Faz parte da chave onde se guardam os "Resolvido", para que cadeiras no mesmo servidor não se misturem. |

## Personalizar

Estas classes são estáveis na versão 1 e podem ser usadas num `theme.css`. As regras do kit têm especificidade zero, por isso qualquer regra do professor ganha. O método está em [Nível 2: CSS livre](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/css.md).

| Classe | Elemento |
| --- | --- |
| `.uc-problems` | O componente (o próprio `<uc-problems>`). |
| `.uc-problems__section`, `__heading` | O conteúdo do componente e o título opcional. |
| `.uc-problems__filters` | A barra de filtros (também `uc-filters`). |
| `.uc-problems__series` | Cada `<section>` do professor. |
| `.uc-problems__meta`, `__deadline`, `__progress` | A linha por baixo do título da série: o prazo e "3 de 5 resolvidos". |
| `.uc-problems__list` | A lista de problemas. |
| `.uc-problems__item`, `--solved` | Cada problema; os resolvidos. |
| `.uc-problems__body` | O conteúdo escrito do problema (link, código). |
| `.uc-problems__tags`, `__judge`, `__type` | As etiquetas do juiz e do tipo. |
| `.uc-problems__weight` | O `<data>` do peso. |
| `.uc-problems__languages` | A linha "Testado em", no problema ou na série. |
| `.uc-problems__hints` | O `<details>` das dicas. |
| `.uc-problems__solved` | O rótulo com a caixa "Resolvido". |
| `.uc-problems__empty` | A linha "Nenhum problema com estes filtros." |

`theme.css`:

```css
/* Problemas resolvidos mais discretos. */
.uc-problems__item--solved .uc-problems__body { opacity: 0.7; }
```

## Acessibilidade

### O que o componente faz

Os filtros são botões com `aria-pressed` em grupos com nome ("Tipo", "Juiz"), com 44 px de altura; filtrar não tira o foco do botão e o número de problemas é anunciado. Cada caixa "Resolvido" tem o nome do problema no nome acessível ("Resolvido: Increasing Array") e o rótulo inteiro, com 44 px, serve para a marcar. Juiz, tipo e estado do prazo são texto, não só cor. As dicas são o `<details>` do browser: abrem com Enter ou Espaço e o leitor de ecrã anuncia se estão abertas.

### O que cabe a quem escreve

Dar um título a cada série, com o nível certo na página (`<h2>` debaixo do `<h1>`), e pôr o nome do problema no link.

## Sem JavaScript

Aparecem as secções, os títulos e as listas tal como foram escritos. Não há etiquetas, prazos, filtros nem "Resolvido"; as dicas abrem e fecham na mesma, com o aspeto do browser.

## Ver também

- [`<uc-materials>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-materials.md): os materiais de cada aula.
- [`<uc-exercise>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-exercise.md): exercícios dentro de um guião, com "Marcar como feito".
- [`<uc-deadlines>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-deadlines.md): os prazos do `course.js`.
