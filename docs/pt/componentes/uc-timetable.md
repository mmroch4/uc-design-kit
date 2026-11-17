# `<uc-timetable>`

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-timetable.html

O horário semanal da cadeira, escrito uma vez no `course.js`: uma tabela por tipo de aula (teóricas, teórico-práticas, práticas) e o atendimento da equipa. Os estudantes podem escolher a sua turma, e a escolha fica guardada no browser.

Exemplo (horário com teóricas, teórico-práticas, práticas e atendimento), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-timetable/basic.html):

```html
<uc-timetable></uc-timetable>
```

A demonstração mostra o horário do curso fictício: duas turmas teóricas com duas aulas por semana (cada uma numa só linha, "2.ª e 4.ª"), uma turma teórico-prática, quatro turmas práticas e o atendimento de duas pessoas da equipa. Os docentes de cada turma vêm da equipa, sem os escrever outra vez.

## Utilização

Escreve-se o elemento vazio onde o horário deve aparecer, normalmente na página "Horários e equipa". O título "Horário" é gerado.

`horarios.html`:

```html
<uc-timetable class-filter></uc-timetable>
```

As aulas vêm de `schedule` no `course.js`, uma entrada por aula semanal. Uma turma com duas aulas por semana tem duas entradas; o componente junta-as numa linha.

`course.js`:

```js
schedule: [
  { type: "lecture", class: "T1", day: 1, start: "10:00", end: "11:30", room: "Anf. 1" },
  { type: "lecture", class: "T1", day: 3, start: "10:00", end: "11:30", room: "Anf. 1" },
  { type: "lab", class: "PL1", day: 2, start: "16:00", end: "18:00", room: "Lab 1" },
  { type: "lab", class: "PL4", day: 5, start: "11:00", end: "13:00", room: "Lab 2",
    note: "Só nas semanas ímpares" },
],
```

`day` é o dia da semana em número (`1` = segunda-feira … `7` = domingo) e as horas escrevem-se como `"14:00"`. Os tipos `lecture`, `tutorial` e `lab` aparecem traduzidos ("Teóricas", "Teórico-práticas", "Práticas laboratoriais"). Os docentes de cada turma são as pessoas da equipa cujo `classes` inclui essa turma; quando não é assim, escrevem-se em `staff`. Os campos estão todos em [O ficheiro course.js](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#horario).

## Exemplos

### A minha turma

Com `class-filter`, cada tipo com duas ou mais turmas ganha uma lista "A minha turma". Escolher uma turma esconde as linhas das outras desse tipo. A escolha fica guardada no browser e vale para todos os horários da cadeira, incluindo os de outras páginas; o atendimento nunca é filtrado.

Exemplo (práticas com a lista A minha turma), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-timetable/filter.html):

```html
<uc-timetable type="lab" class-filter heading="Horário das práticas"></uc-timetable>
```

Um estudante tem uma turma teórica e uma prática, por isso há uma lista por tipo e cada escolha é guardada à parte. A escolha é anunciada aos leitores de ecrã ("A mostrar a turma PL2").

### Por dia da semana

Com `view="days"`, o horário aparece agrupado por dia, com todos os tipos misturados por ordem de hora. Fica mais curto num telemóvel e responde à pergunta "o que tenho na terça?".

Exemplo (horário agrupado por dia da semana), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-timetable/days.html):

```html
<uc-timetable view="days"></uc-timetable>
```

### Atendimento

O atendimento vem de `officeHours` em cada pessoa da [equipa](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#equipa). Com `type="office-hours"` mostra-se só essa tabela; sem sala, usa-se o gabinete (`office`) da pessoa. O mesmo atendimento aparece nos cartões de [`<uc-team>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-team.md).

Exemplo (tabela do atendimento da equipa), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-timetable/office-hours.html):

```html
<uc-timetable type="office-hours" heading="Atendimento"></uc-timetable>
```

`course.js`:

```js
team: [
  { name: "Ana Ribeiro", role: "coordinator", office: "Gab. 2.14",
    officeHours: [{ day: 2, start: "11:00", end: "12:30" }] },
  { name: "Bruno Matos", role: "lecturer", office: "Gab. 2.09",
    officeHours: [{ day: 4, start: "16:00", end: "17:00", room: "Sala 1.12", note: "Marcar por email" }] },
],
```

### Escolher os tipos e acrescentar texto

O atributo `type` escolhe os tipos e a ordem das tabelas. O que estiver escrito dentro do elemento aparece por baixo, na mesma secção; um link com [`data-auth`](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/elementos.md#data-auth) ganha o cadeado de "requer autenticação".

Exemplo (teóricas e teórico-práticas com uma nota por baixo), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-timetable/children.html):

```html
<uc-timetable type="lecture tutorial">
  <p class="uc-muted">As salas podem mudar: confirma no <a href="https://example.org/sigarra" data-auth="SIGARRA">horário oficial</a>.</p>
</uc-timetable>
```

Tipos próprios, como seminários, escrevem-se em `type` como qualquer palavra (`type: "seminar"`) e o nome mostrado define-se em `scheduleTypes`: `scheduleTypes: { seminar: { pt: "Seminários", en: "Seminars" } }`. Sem nome definido, o tipo aparece tal como está escrito.

## Atributos

| Atributo | Tipo | Por omissão | Descrição |
| --- | --- | --- | --- |
| `view` | `table` ou `days` | `table` | Uma tabela por tipo, ou um grupo por dia da semana com todos os tipos por ordem de hora. |
| `type` | tipos separados por espaços | todos | `lecture`, `tutorial`, `lab`, `office-hours` ou um tipo próprio. Define também a ordem das tabelas; sem ele, a ordem é teóricas, teórico-práticas, práticas, tipos próprios e atendimento. |
| `class-filter` | booleano | ausente | Uma lista "A minha turma" por tipo com duas ou mais turmas. A escolha fica guardada no browser e é partilhada por todos os horários da cadeira. |
| `heading` | texto ou `none` | "Horário" | Título da secção. Com `none`, não há título visível. |
| `heading-level` | `2` a `6` | `2` | Nível do título gerado; os dias da vista `days` ficam um nível abaixo. |

## Configuração usada

| Campo | Para quê |
| --- | --- |
| [`schedule`](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#horario) | As aulas semanais: tipo, turma, dia, horas, sala, docentes e nota. Uma entrada sem `type`, `class`, `day`, `start` ou `end` é ignorada, com um aviso na consola. |
| [`scheduleTypes`](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#campos) | Nomes de tipos próprios, ou outros nomes para os tipos do kit. |
| [`team`](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#equipa) | Os docentes de cada turma (por `classes`), os links para as suas páginas e o atendimento (`officeHours`, com `office` como sala por omissão). |
| [`code`](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#campos) | A chave onde se guarda "A minha turma" (`uc:<code>:class:<tipo>`), para que cadeiras no mesmo servidor não partilhem escolhas. |

## Personalizar

Estas classes são estáveis na versão 1 e podem ser usadas num `theme.css`. As regras do kit têm especificidade zero, por isso qualquer regra do professor ganha. O método está em [Nível 2: CSS livre](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/css.md).

| Classe | Elemento |
| --- | --- |
| `.uc-timetable` | O componente (o próprio `<uc-timetable>`). |
| `.uc-timetable__section`, `__heading` | A secção e o seu título. |
| `.uc-timetable__filters` | A barra "A minha turma" (também `uc-filters`). |
| `.uc-filters`, `__group`, `__label`, `__select`, `__button` | A barra de filtros, igual em todos os blocos que filtram: cada grupo, o seu rótulo, a lista e os botões. |
| `.uc-timetable__table` | O contentor de cada tabela (também `uc-table`), com `data-type` igual ao tipo. |
| `.uc-timetable__days`, `__room` | Na tabela: as células dos dias e da sala, que não partem a linha. |
| `.uc-timetable__time` | As horas ("14:00–15:00"). |
| `.uc-timetable__note` | A nota de uma aula ou de um atendimento. |
| `.uc-timetable__day`, `__day-heading` | Na vista `days`: cada dia e o seu título. |
| `.uc-timetable__list`, `__item`, `__details` | Na vista `days`: a lista do dia, cada aula e o texto depois da hora. |

`theme.css`:

```css
/* Coluna das horas mais estreita na vista por dia. */
uc-timetable { --uc-timetable-time-width: 6.5rem; }
/* Legenda das práticas a azul. */
.uc-timetable__table[data-type="lab"] caption { color: var(--uc-color-accent); }
```

## Acessibilidade

### O que o componente faz

Cada tabela tem uma legenda com o tipo, cabeçalhos de coluna e a turma (ou a pessoa) como cabeçalho de linha. Os dias aparecem abreviados ("3.ª") mas são lidos por extenso ("terça-feira"); as horas são elementos `<time>`. A lista "A minha turma" tem um rótulo visível, funciona com o teclado e a escolha é anunciada num só sítio da página.

### O que cabe a quem escreve

Escrever as salas e as notas de forma curta, sem abreviaturas que só os docentes conhecem. Pôr `data-auth` nos links que pedem autenticação. Ter o horário oficial noutro sítio (o SIGARRA), para quem tem o JavaScript desligado.

## Sem JavaScript

O horário está no `course.js`, por isso sem o kit só aparece o texto escrito dentro do componente. Convém aí um link para o horário oficial, dentro de um `<noscript>` ou como texto normal:

`horarios.html`:

```html
<uc-timetable class-filter>
  <noscript><p>Ver o <a href="https://sigarra.up.pt/…">horário no SIGARRA</a>.</p></noscript>
</uc-timetable>
```

## Ver também

- [O ficheiro course.js](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#horario): os campos de `schedule` e de `officeHours`.
- [`<uc-team>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-team.md): a equipa, com o atendimento nos cartões e na tabela.
- [`a[data-auth]`](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/elementos.md#data-auth): links que pedem autenticação.
