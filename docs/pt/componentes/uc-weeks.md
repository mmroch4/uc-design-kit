# `<uc-weeks>`

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-weeks.html

O contentor das semanas de uma página de semanas. Acrescenta a ligação "Ir para esta semana", mostra as interrupções do semestre entre as semanas certas e junta no fim os prazos que caem depois da última semana.

Exemplo (semanas 6 a 12 com interrupção e exame), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-weeks/basic.html):

```html
<uc-weeks>
  <uc-week n="6" title="Complexidade e notação O">
    <dl>
      <dt>Teóricas</dt>
      <dd>Contar operações, melhor e pior caso</dd>
    </dl>
  </uc-week>
  <uc-week n="7" title="Recursão">
    <dl>
      <dt>Teóricas</dt>
      <dd>Caso base e chamada recursiva</dd>
    </dl>
  </uc-week>
  <uc-week n="8" title="Ordenação simples: seleção e inserção">
    <dl>
      <dt>Teóricas</dt>
      <dd>Ordenação por seleção e por inserção</dd>
    </dl>
  </uc-week>
  <uc-week n="9" title="Ordenação: mergesort e quicksort">
    <dl>
      <dt>Teóricas</dt>
      <dd>Dividir para conquistar · <a href="#">slides 9</a></dd>
    </dl>
  </uc-week>
  <uc-week n="10" title="Pesquisa binária e árvores">
    <dl>
      <dt>Teóricas</dt>
      <dd>Pesquisa binária, árvores binárias de pesquisa · <a href="#">slides 10</a></dd>
      <dt>Prática</dt>
      <dd><a href="#">Guião 10: inserir e procurar numa árvore</a></dd>
    </dl>
  </uc-week>
  <uc-week n="11" title="Grafos: pesquisa em largura e em profundidade">
    <dl>
      <dt>Teóricas</dt>
      <dd>Representação de grafos, BFS e DFS</dd>
    </dl>
  </uc-week>
  <uc-week n="12" title="Revisões e teste prático">
    <dl>
      <dt>Teóricas</dt>
      <dd>Revisões da matéria</dd>
    </dl>
  </uc-week>
</uc-weeks>
```

No curso fictício, hoje é 27 de novembro de 2025: o botão no topo abre a semana 10 e leva até ela. A semana de estudo aparece entre as semanas 6 e 7 sem estar escrita na página, e o exame de janeiro, que cai depois da última semana, aparece no fim.

## Utilização

Põem-se as `<uc-week>` dentro de um `<uc-weeks>`, por ordem. Só os filhos diretos `<uc-week>` contam como semanas; entre elas pode haver outros elementos, como um `<uc-event>` escrito à mão.

`semanas.html`:

```html
<uc-weeks>
  <uc-week n="1" title="Apresentação e primeiros programas">…</uc-week>
  <uc-week n="2" title="Variáveis, expressões e condições">…</uc-week>
  …
  <uc-week n="12" title="Revisões e teste prático">…</uc-week>
</uc-weeks>
```

As interrupções e os prazos vêm do `course.js`; na página não se escreve nada para eles.

`course.js`:

```js
window.UC_COURSE = {
  title: "Algoritmos e Programação",
  semester: {
    start: "2025-09-15",
    weeks: 12,                  // deadlines after week 12 go to the end of the list
    breaks: [{ start: "2025-10-27", end: "2025-10-31", label: "Semana de estudo" }],
  },
  deadlines: [
    { id: "t2", title: "Entrega do trabalho 2", date: "2025-11-28", kind: "submission" },
    { id: "exame", title: "Exame, época normal", date: "2026-01", kind: "exam" },
  ],
};
```

## Exemplos

### Vista compacta

Com `view="compact"`, as mesmas `<uc-week>` aparecem numa só tabela, uma linha por semana: número, datas, tema e estado ("Dada", "Esta semana", "Prevista"). O tema é uma ligação quando a semana tem `href` (a página dessa aula) e, por baixo, ficam os prazos dessa semana, numa linha pequena cada um. As interrupções são linhas que ocupam a tabela toda. É o formato de um planeamento: semanas com pouco conteúdo, cada uma com a sua página.

Exemplo (planeamento das semanas numa tabela), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-weeks/compact.html):

```html
<uc-weeks view="compact">
  <uc-week n="5" title="Listas e cadeias de caracteres" href="#"><p><a href="#">Listas e cadeias de caracteres</a></p></uc-week>
  <uc-week n="6" title="Complexidade e notação O" href="#"><p><a href="#">Complexidade e notação O</a></p></uc-week>
  <uc-week n="7" title="Recursão" href="#"><p><a href="#">Recursão</a></p></uc-week>
  <uc-week n="8" title="Ordenação simples: seleção e inserção" href="#"><p><a href="#">Ordenação simples: seleção e inserção</a></p></uc-week>
  <uc-week n="9" title="Ordenação por fusão e quicksort" href="#"><p><a href="#">Ordenação por fusão e quicksort</a></p></uc-week>
  <uc-week n="10" title="Dicionários e conjuntos" href="#"><p><a href="#">Dicionários e conjuntos</a></p></uc-week>
  <uc-week n="11" title="Árvores binárias"><p>Árvores binárias</p></uc-week>
  <uc-week n="12" title="Revisões"><p>Revisões</p></uc-week>
</uc-weeks>
```

A semana atual fica destacada e marcada com `aria-current="date"`, em vez do botão "Ir para esta semana", e cada linha recebe o `id="week-<n>"`, por isso as ligações `semanas.html#week-10` continuam a funcionar. O conteúdo escrito dentro de cada `<uc-week>` fica escondido, mas continua na página, e o [`<uc-this-week>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-this-week.md) lê-o como antes. Para um plano com duas aulas por semana, use [`<uc-summaries>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-summaries.md) com as datas futuras.

Sem JavaScript, os títulos das semanas (atributos) não se veem: escreva dentro de cada `<uc-week>` pelo menos uma linha com o tema, ou a ligação para a página da aula, como na demonstração.

### Interrupções

Cada interrupção de `semester.breaks` aparece logo a seguir à semana que a antecede, com as datas, o nome e "sem aulas". A numeração das semanas salta a interrupção: a semana 7 começa a 3 de novembro.

Exemplo (interrupção entre as semanas 6 e 7), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-weeks/breaks.html):

```html
<uc-weeks>
  <uc-week n="5" title="Listas e cadeias de caracteres">
    <dl>
      <dt>Teóricas</dt>
      <dd>Listas, índices e fatias</dd>
    </dl>
  </uc-week>
  <uc-week n="6" title="Complexidade e notação O">
    <dl>
      <dt>Teóricas</dt>
      <dd>Contar operações, melhor e pior caso</dd>
    </dl>
  </uc-week>
  <uc-week n="7" title="Recursão">
    <dl>
      <dt>Teóricas</dt>
      <dd>Caso base e chamada recursiva</dd>
    </dl>
  </uc-week>
  <uc-week n="8" title="Ordenação simples: seleção e inserção">
    <dl>
      <dt>Teóricas</dt>
      <dd>Ordenação por seleção e por inserção</dd>
    </dl>
  </uc-week>
</uc-weeks>
```

Uma interrupção ocupa sempre semanas inteiras: a semana cujos dias de aulas (`semester.teachingDays`) tocam numa interrupção deixa de contar. Para um feriado isolado, convém por isso um [`<uc-event>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-event.md) dentro da semana, e não uma interrupção. Interrupções depois da última semana não aparecem.

### Sem interrupções

Com `no-breaks`, as interrupções não são mostradas. É útil numa página que só mostra parte do semestre: sem ele, uma interrupção anterior à primeira semana escrita aparece antes dessa semana.

Exemplo (semanas 5 a 8 sem a interrupção), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-weeks/no-breaks.html):

```html
<uc-weeks no-breaks>
  <uc-week n="5" title="Listas e cadeias de caracteres">
    <dl>
      <dt>Teóricas</dt>
      <dd>Listas, índices e fatias</dd>
    </dl>
  </uc-week>
  <uc-week n="6" title="Complexidade e notação O">
    <dl>
      <dt>Teóricas</dt>
      <dd>Contar operações, melhor e pior caso</dd>
    </dl>
  </uc-week>
  <uc-week n="7" title="Recursão">
    <dl>
      <dt>Teóricas</dt>
      <dd>Caso base e chamada recursiva</dd>
    </dl>
  </uc-week>
  <uc-week n="8" title="Ordenação simples: seleção e inserção">
    <dl>
      <dt>Teóricas</dt>
      <dd>Ordenação por seleção e por inserção</dd>
    </dl>
  </uc-week>
</uc-weeks>
```

### Prazo durante uma interrupção

Um prazo cuja data cai numa interrupção não pertence a nenhuma semana, por isso aparece logo depois do aviso da interrupção. Esta demonstração acrescenta ao `course.js` um quiz aberto durante a semana de estudo:

`course.js`:

```js
deadlines: [
  { id: "quiz3", title: "Quiz 3: complexidade", kind: "quiz",
    date: "2025-10-29", end: "2025-10-31" },
],
```

Exemplo (quiz durante a semana de estudo), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-weeks/break-deadline.html):

```html
<uc-weeks>
  <uc-week n="6" title="Complexidade e notação O">
    <dl>
      <dt>Teóricas</dt>
      <dd>Contar operações, melhor e pior caso</dd>
    </dl>
  </uc-week>
  <uc-week n="7" title="Recursão">
    <dl>
      <dt>Teóricas</dt>
      <dd>Caso base e chamada recursiva</dd>
    </dl>
  </uc-week>
</uc-weeks>
```

### Filtrar prazos por tipo

`kind` recebe tipos de prazo separados por espaços e mostra só esses, nas semanas, depois das interrupções e no fim. Aqui, com `kind="assessment exam"`, a entrega do trabalho 2 deixa de aparecer na semana 10, enquanto o teste prático continua na semana 12 e o exame no fim. Convém quando as linhas de cada semana já mencionam as entregas ou os quizzes.

Exemplo (só avaliações e exames), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-weeks/kind.html):

```html
<uc-weeks kind="assessment exam" no-breaks>
  <uc-week n="10" title="Pesquisa binária e árvores">
    <dl>
      <dt>Teóricas</dt>
      <dd>Pesquisa binária, árvores binárias de pesquisa · <a href="#">slides 10</a></dd>
      <dt>Prática</dt>
      <dd><a href="#">Guião 10: inserir e procurar numa árvore</a></dd>
    </dl>
  </uc-week>
  <uc-week n="11" title="Grafos: pesquisa em largura e em profundidade">
    <dl>
      <dt>Teóricas</dt>
      <dd>Representação de grafos, BFS e DFS</dd>
    </dl>
  </uc-week>
  <uc-week n="12" title="Revisões e teste prático" open>
    <dl>
      <dt>Teóricas</dt>
      <dd>Revisões da matéria</dd>
    </dl>
  </uc-week>
</uc-weeks>
```

Os tipos possíveis são `assessment`, `exam`, `quiz`, `submission` e `other`. Esta demonstração e a seguinte usam também `no-breaks`, porque só mostram as últimas semanas.

### Sem prazos

Com `no-deadlines`, nenhum prazo do `course.js` é acrescentado: nem nas semanas, nem depois das interrupções, nem no fim. Os `<uc-event>` escritos à mão continuam a aparecer.

Exemplo (semanas sem prazos), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-weeks/no-deadlines.html):

```html
<uc-weeks no-deadlines no-breaks>
  <uc-week n="10" title="Pesquisa binária e árvores">
    <dl>
      <dt>Teóricas</dt>
      <dd>Pesquisa binária, árvores binárias de pesquisa · <a href="#">slides 10</a></dd>
      <dt>Prática</dt>
      <dd><a href="#">Guião 10: inserir e procurar numa árvore</a></dd>
    </dl>
  </uc-week>
  <uc-week n="11" title="Grafos: pesquisa em largura e em profundidade">
    <dl>
      <dt>Teóricas</dt>
      <dd>Representação de grafos, BFS e DFS</dd>
    </dl>
  </uc-week>
  <uc-week n="12" title="Revisões e teste prático" open>
    <dl>
      <dt>Teóricas</dt>
      <dd>Revisões da matéria</dd>
    </dl>
  </uc-week>
</uc-weeks>
```

## Atributos

| Atributo | Tipo | Por omissão | Descrição |
| --- | --- | --- | --- |
| `view` | `full` ou `compact` | `full` | Com `compact`, mostra as semanas numa tabela, uma linha por semana ([vista compacta](#vista-compacta)). |
| `no-breaks` | booleano | ausente | Não mostra as interrupções de `semester.breaks`. |
| `no-deadlines` | booleano | ausente | Não acrescenta prazos do `course.js`, nem dentro das semanas nem fora delas. |
| `kind` | tipos separados por espaços | todos | Só acrescenta prazos destes tipos, por exemplo `kind="assessment exam"`. |

## Configuração usada

Campos do `course.js` que o componente lê. Sem `semester.start` não há semana atual nem interrupções, e o componente só agrupa as semanas.

| Campo | Para quê |
| --- | --- |
| `semester.start` | Saber qual é a semana atual, para a ligação "Ir para esta semana" ([semestre](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#campos-semestre)). |
| `semester.breaks` | As interrupções mostradas entre as semanas, com o seu `label` ([semestre](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#campos-semestre)). |
| `semester.teachingDays` | Que semanas uma interrupção ocupa: as que têm dias de aulas dentro dela ([semestre](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#campos-semestre)). |
| `semester.weeks` | A última semana: os prazos depois dela vão para o fim da lista ([semestre](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#campos-semestre)). |
| `deadlines` | Os prazos acrescentados depois das interrupções e no fim ([prazos](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#prazos)). |
| `today` | Fixar o dia de hoje; `?today=AAAA-MM-DD` no endereço tem prioridade ([avançado](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#campos-avancado)). |

## O que é acrescentado e onde

- **"Ir para esta semana"**: um botão no topo, só quando hoje cai numa semana de aulas que está na página. Abre essa semana, leva o foco até ela e muda o endereço para `#week-<n>`. Ligações para `#week-<n>` seguidas dentro da página também abrem a semana.
- **Interrupções**: depois da semana que as antecede; se essa semana não estiver na página, antes da semana seguinte que esteja, ou no fim. Uma interrupção que ocupa várias semanas aparece uma só vez.
- **Prazos de uma semana**: dentro dela, entre segunda e domingo (é a [`<uc-week>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-week.md#prazos-da-semana) que os acrescenta, com o filtro de `kind` e `no-deadlines` do contentor).
- **Prazos durante uma interrupção**: logo a seguir ao aviso da interrupção.
- **Prazos depois da última semana** (`semester.weeks`), com dia ou só mês (`"2026-01"`): no fim, pela ordem do `course.js`.
- **Não aparecem**: prazos sem data (`null`), prazos anteriores à semana 1 e prazos só com mês que caiam durante o semestre.

Um prazo que o professor já escreveu como `<uc-event deadline="…">` não é repetido. O `<uc-event>` pode estar em qualquer sítio dentro do `<uc-weeks>`, por exemplo na semana anterior ao prazo, para o anunciar mais cedo. Ver [`<uc-event>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-event.md).

Os elementos acrescentados têm o atributo `data-uc-generated` e são refeitos quando a língua muda.

## Personalizar

Estas classes são estáveis na versão 1 e podem ser usadas num `theme.css`. Os prazos acrescentados são `<uc-event>` normais, com as classes `.uc-event`. O método está em [Nível 2: CSS livre](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/css.md); para mudar só cores, cantos ou letra em todo o site bastam os [tokens](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/tokens.md).

| Classe | Elemento |
| --- | --- |
| `.uc-weeks` | O contentor (o próprio `<uc-weeks>`). |
| `.uc-weeks__actions` | O parágrafo do topo com o botão. |
| `.uc-weeks__go` | O botão "Ir para esta semana" (também `.uc-button` e `.uc-button--primary`). |
| `.uc-weeks__break` | O aviso de uma interrupção. |
| `.uc-weeks__break-date` | As datas da interrupção. |
| `.uc-weeks__compact`, `__table` | Vista compacta: a caixa da tabela e a tabela. |
| `.uc-weeks__row`, `--past`, `--current`, `--future` | Vista compacta: a linha de uma semana e o seu estado. |
| `.uc-weeks__dates`, `__topic`, `__status` | Vista compacta: as células das datas, do tema e do estado. |
| `.uc-weeks__deadlines` | Vista compacta: a lista dos prazos por baixo do tema. |
| `.uc-weeks__break-row` | Vista compacta: a linha de uma interrupção. |

`theme.css`:

```css
/* Interrupções com um contorno tracejado em vez do fundo cinzento. */
.uc-weeks__break {
  background: none;
  border: 1px dashed var(--uc-color-border);
}

/* Botão "Ir para esta semana" à direita. */
.uc-weeks__actions { justify-content: flex-end; }
```

## Acessibilidade

### O que o componente faz

"Ir para esta semana" é uma ligação real para `#week-<n>` com a aparência de botão: abre a semana e põe o foco na sua linha, por isso quem usa teclado ou leitor de ecrã continua a partir dela. As datas das interrupções estão num `<time datetime>` e os prazos dizem o tipo por extenso, não só pela cor.

### O que cabe a quem escreve

Escrever as semanas por ordem e com o `n` certo, dar às interrupções um `label` que diga o que são ("Semana de estudo", "Natal") e não usar o mesmo `n` duas vezes, porque as ligações `#week-<n>` deixariam de ser únicas.

## Sem JavaScript

O conteúdo de cada semana continua visível, por ordem. O botão, as interrupções e os prazos do `course.js` são gerados e não aparecem; um `<uc-event>` escrito à mão mostra só o texto que o professor lhe pôs dentro. Uma data que tenha de se ver sempre deve estar também escrita no conteúdo.

## Ver também

- [`<uc-week>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-week.md): cada semana, com datas, estado e prazos.
- [`<uc-summaries>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-summaries.md): os sumários das aulas, com ligação para a semana de cada uma.
- [`<uc-event>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-event.md): um prazo ou avaliação escrito à mão, dentro de uma semana ou entre semanas.
- [`<uc-this-week>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-this-week.md): o cartão da página inicial que lê a semana atual desta página.
- [Prazos no course.js](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#prazos): os campos de cada prazo.
- Uso real: [as semanas de Estruturas de Dados 2025/26](https://uc-design-kit.miguelrocha.dev/examples/edados-2526/semanas.html).
