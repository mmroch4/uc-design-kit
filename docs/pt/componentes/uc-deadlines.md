# `<uc-deadlines>`

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-deadlines.html

Os prazos do `course.js`: uma lista curta das próximas datas para a página inicial, ou uma tabela com todas as provas e o estado de cada uma para a página da avaliação.

Exemplo (próximas datas do curso de demonstração), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-deadlines/basic.html):

```html
<uc-deadlines></uc-deadlines>
```

A demonstração usa um curso fictício em que hoje é 27 de novembro de 2025. Aparecem os prazos que ainda não passaram, por ordem de data: a entrega do trabalho 2, o teste prático e o exame, de que só se sabe o mês. A hora vai no início da linha de baixo, antes da nota; o teste prático tem dois turnos, por isso mostra "14:00 e 16:00".

## Utilização

O elemento fica vazio na página. Cada prazo escreve-se uma vez no `course.js` e aparece em todos os componentes que o usam: aqui, na semana em que cai e no cartão "Esta semana".

`index.html`:

```html
<uc-deadlines></uc-deadlines>
```

`course.js`:

```js
window.UC_COURSE = {
  title: "Algoritmos e Programação",
  deadlines: [
    { id: "t2", title: "Entrega do trabalho 2", date: "2025-11-28", time: "23:59",
      kind: "submission", note: "Pela plataforma de entregas" },
    { id: "teste", title: "Teste prático", date: "2025-12-10", time: "14:00",
      kind: "assessment", note: "Laboratórios 1 e 2" },
    { id: "exame", title: "Exame, época normal", date: "2026-01", kind: "exam" },
  ],
};
```

A ordem no ficheiro não importa: o kit ordena os prazos por data e põe no fim os que ainda não têm data. O `url` de um prazo transforma o título numa ligação e `links` acrescenta ligações por baixo. Tal como os `href` das páginas, estes endereços são relativos ao `course.js` e funcionam em qualquer página do site (ver [Páginas em subpastas](https://uc-design-kit.miguelrocha.dev/docs/pt/estrutura.md#subpastas)).

## Exemplos

Os exemplos seguintes juntam ao curso de demonstração mais quatro prazos: o trabalho 1, já entregue, dois quizzes abertos durante uma semana e o exame de recurso, ainda sem data.

`course.js`:

```js
{ id: "t1", title: "Entrega do trabalho 1", date: "2025-10-31", time: "23:59",
  kind: "submission", links: [{ label: "Notas", url: "notas/t1.pdf" }] },
{ id: "quiz4", title: "Quiz 4", date: "2025-11-24", end: "2025-11-30", kind: "quiz",
  note: "Na plataforma de entregas", url: "quizzes.html" },
{ id: "quiz5", title: "Quiz 5", date: "2025-12-01", end: "2025-12-07", kind: "quiz",
  note: "Na plataforma de entregas" },
{ id: "recurso", title: "Exame de recurso", date: null, kind: "exam" },
```

### Tabela

Com `view="table"`, os prazos aparecem numa tabela com a prova, a data com o ano, a hora, a informação (nota e ligações) e o estado. A tabela mostra todos os prazos, passados e futuros, e num ecrã estreito desliza na horizontal.

Exemplo (tabela de prazos com estados), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-deadlines/table.html):

```html
<uc-deadlines view="table" heading="Calendário de avaliação"></uc-deadlines>
```

### Passados e futuros

`filter` escolhe que prazos aparecem: `upcoming` (os que ainda não passaram, por omissão na lista), `past` (os que já passaram) ou `all` (todos, por omissão na tabela). Na lista, as datas dos prazos que já passaram e dos que estão por marcar ficam a cinzento.

Exemplo (lista com todos os prazos), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-deadlines/all.html):

```html
<uc-deadlines filter="all" heading="Todas as datas"></uc-deadlines>
```

### Só alguns tipos

`kind` recebe um ou mais tipos separados por espaços: `assessment`, `exam`, `quiz`, `submission` ou `other`. Na página da avaliação, por exemplo, só as provas que contam para a nota.

Exemplo (só testes e exames), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-deadlines/kind.html):

```html
<uc-deadlines kind="assessment exam" heading="Avaliação"></uc-deadlines>
```

### Um de cada tipo

`per-kind="1"` mostra só o próximo prazo de cada tipo. Na página inicial, evita que uma série de quizzes semanais ocupe a lista toda: aparece o quiz 4, mas não o 5, e o exame da época normal, mas não o de recurso.

Exemplo (o próximo prazo de cada tipo), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-deadlines/per-kind.html):

```html
<uc-deadlines per-kind="1"></uc-deadlines>
```

### Limite, título e conteúdo extra

`limit` corta a lista depois de aplicar os outros filtros. `heading` muda o título da secção, e `heading="none"` tira-o. O que se escrever dentro do elemento fica por baixo da lista, por exemplo uma ligação para a página com todas as datas.

Exemplo (dois prazos e uma ligação por baixo), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-deadlines/limit.html):

```html
<uc-deadlines limit="2" heading="A seguir">
  <a href="#">Ver todas as datas</a>
</uc-deadlines>
```

## Atributos

| Atributo | Tipo | Por omissão | Descrição |
| --- | --- | --- | --- |
| `view` | `list` ou `table` | `list` | Lista compacta ou tabela com hora, informação e estado. |
| `filter` | `upcoming`, `past` ou `all` | `upcoming` (lista), `all` (tabela) | Prazos que ainda não passaram, que já passaram, ou todos. |
| `kind` | tipos separados por espaços | todos | Só os prazos destes tipos, por exemplo `kind="assessment exam"`. |
| `per-kind` | número | sem limite | No máximo este número de prazos de cada tipo. `per-kind="1"` mostra só o próximo quiz, a próxima entrega… |
| `limit` | número | sem limite | No máximo este número de prazos no total, depois dos outros filtros. |
| `heading` | texto ou `none` | "Próximas datas" | Título da secção, num `<h2>`. Com `none`, a secção fica sem título. |
| `heading-level` | `2` a `6` | `2` | Nível do título gerado: `3` dá um `<h3>`, para quando o componente está dentro de uma secção que já tem um `<h2>`. O aspeto não muda; muda só a estrutura que os leitores de ecrã usam para navegar. |

## Configuração usada

Campos do `course.js` que o componente lê. Sem `deadlines`, mostra "Não há datas marcadas.".

| Campo | Para quê |
| --- | --- |
| [`deadlines`](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#prazos) | Os prazos: `id`, `title`, `date`, `time`, `end`, `kind`, `note`, `url` e `links`, e ainda `shifts` e `duration` (as horas) e `location` (na tabela, antes da nota). |
| [`today`](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#campos-avancado) | Fixar o dia de hoje (demonstrações, capturas). O endereço `?today=AAAA-MM-DD` tem prioridade. |

A referência completa dos campos está em [O ficheiro course.js](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#prazos).

## Estados e datas

A tabela mostra o estado de cada prazo, calculado em relação a hoje:

- **Concluída** (verde): o prazo já passou.
- **Próxima** (amarelo): o primeiro prazo com dia marcado que ainda não passou. Pode ser um prazo já a decorrer, como o quiz 4 no exemplo.
- **Marcada**: os prazos seguintes com dia marcado.
- **Por marcar**: os prazos com `date: null` ou só com o mês.

O estado conta só com os prazos que aparecem: numa tabela com `kind="assessment exam"`, "Próxima" é a próxima prova dessas, mesmo que antes haja uma entrega.

Um prazo passa quando acaba o seu último dia:

- **Um dia** (`"2025-12-10"`): conta como próximo até ao fim desse dia, seja qual for a hora.
- **Vários dias** (com `end`): conta como próximo até ao fim de `end` e mostra-se como intervalo: "24–30 nov" na lista, "24–30 nov 2025" na tabela.
- **Só o mês** (`"2026-01"`): mostra-se "janeiro 2026" e conta como próximo até ao fim do mês.
- **Sem data** (`null`): mostra-se "Por marcar", fica no fim e nunca passa.

Na lista, a data é curta ("10 dez") e a hora vai no início da linha da nota ("14:00 · Laboratórios 1 e 2"). Na tabela, a data leva o ano ("10 dez 2025") e a hora tem coluna própria.

## Personalizar

Estas classes são estáveis na versão 1 e podem ser usadas num `theme.css`. As regras do kit têm especificidade zero, por isso qualquer regra do professor ganha. Cada item da lista e cada linha da tabela têm também `data-kind` com o tipo do prazo. O método está em [Nível 2: CSS livre](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/css.md); para mudar só cores, cantos ou letra em todo o site bastam os [tokens](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/tokens.md).

| Classe | Elemento |
| --- | --- |
| `.uc-deadlines`, `.uc-deadlines--table` | O próprio `<uc-deadlines>`; o modificador na vista de tabela. |
| `.uc-deadlines__section`, `__heading` | A secção e o seu título. |
| `.uc-deadlines__list`, `__item` | A lista e cada prazo. |
| `.uc-deadlines__item--past`, `--unscheduled` | Prazo que já passou; prazo sem data. |
| `.uc-deadlines__row` | Cada linha da tabela. |
| `.uc-deadlines__row--done`, `--next`, `--scheduled`, `--toBeScheduled` | Estado da linha. |
| `.uc-deadlines__date`, `__time` | A data e a hora. |
| `.uc-deadlines__body`, `__title` | O texto do prazo (lista) e o título (lista e tabela). |
| `.uc-deadlines__note`, `__links` | A nota e as ligações extra. |
| `.uc-deadlines__details`, `__status` | As colunas "Informação" e "Estado" da tabela. |
| `.uc-deadlines__none` | O travessão de uma célula vazia. |
| `.uc-deadlines__more` | O conteúdo escrito dentro do elemento. |
| `.uc-deadlines__empty` | A frase "Não há datas marcadas.". |

`theme.css`:

```css
/* Exames a vermelho escuro na lista. */
.uc-deadlines__item[data-kind="exam"] .uc-deadlines__date { color: #9F1239; }

/* Na tabela, as provas já feitas a cinzento. */
.uc-deadlines__row--done { color: var(--uc-color-text-muted); }
```

## Acessibilidade

### O que o componente faz

Gera uma `<section>` com o nome do título e as datas num `<time datetime>`. Na tabela, o título de cada prova é o cabeçalho da linha, o estado é texto e não só cor, e a tabela recebe foco com o teclado quando precisa de deslizar.

### O que cabe a quem escreve

Títulos de prazos que se percebam fora de contexto ("Entrega do trabalho 2", não "Entrega"), etiquetas de `links` que digam o que abrem e, com `heading="none"`, um título na página logo antes do elemento.

## Sem JavaScript

Os prazos vêm do `course.js` e só aparecem com o kit. Sem JavaScript, fica visível apenas o que estiver escrito dentro do elemento: uma ligação para a página da avaliação, onde as datas também estejam escritas, garante que ninguém fica sem elas.

## Ver também

- [`<uc-date>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-date.md): a data de um prazo no meio de um parágrafo.
- [`<uc-week>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-week.md): os prazos aparecem também na semana em que caem.
- [`<uc-event>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-event.md): um prazo ou avaliação escrito à mão dentro de uma semana.
- [`<uc-this-week>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-this-week.md): o cartão "Esta semana", com os prazos da semana atual.
- [`<uc-notices>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-notices.md): os avisos, normalmente ao lado das próximas datas.
- [Prazos no course.js](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#prazos): os campos de cada prazo.
- Uso real: [a página inicial](https://uc-design-kit.miguelrocha.dev/examples/edados-2526/index.html) (lista com `per-kind="1"`) e [a página da avaliação](https://uc-design-kit.miguelrocha.dev/examples/edados-2526/avaliacao.html) (tabela) de Estruturas de Dados 2025/26.
