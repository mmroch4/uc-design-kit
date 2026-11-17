# O ficheiro course.js

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.html

O `course.js` guarda o que muda de ano para ano ou aparece em mais de uma página. É JavaScript, mas só tem uma atribuição: um objeto em `window.UC_COURSE`. Só o título é obrigatório.

## A forma do ficheiro

`course.js`:

```js
window.UC_COURSE = {
  code: "AP0001",
  title: "Algoritmos e Programação",
  edition: "2025/26",
  semester: { start: "2025-09-15", weeks: 12 },
  pages: ["home", { id: "weeks", href: "semanas.html" }],
  deadlines: [
    { id: "t2", title: "Entrega do trabalho 2", kind: "submission", date: "2025-11-28", time: "23:59" },
  ],
};
```

Cada página carrega-o antes do kit (ver [o `<head>` de cada página](https://uc-design-kit.miguelrocha.dev/docs/pt/estrutura.md#head)). O kit lê-o uma vez, completa o que falta com os valores por omissão e avisa na consola do browser, com mensagens `[uc-kit] course.js: …`, quando um valor não é válido. Um erro num campo nunca impede a página de aparecer.

Nas tabelas, a coluna **Necessário** diz quando preencher o campo:

- Obrigatório sem ele o kit avisa e usa o `<title>` da página.
- Recomendado sem ele há funcionalidades que não aparecem (por exemplo, sem `semester.start` não há datas nas semanas).
- Opcional tem um valor por omissão razoável.

### Só valores, sem código

O script de manutenção [`uc-site.py`](https://uc-design-kit.miguelrocha.dev/docs/pt/manter.md) lê o `course.js` sem o executar. Por isso o ficheiro só pode ter valores:

- comentários (`//` e `/* */`);
- uma única atribuição `window.UC_COURSE = { … };`;
- antes dela, constantes opcionais: `const NOME = valor;`;
- valores: objetos, listas, textos (com `"`, `'` ou `` ` ``), números, `true`, `false` e `null`, com ou sem vírgula no fim;
- uma constante usada como valor, textos juntos com `+` e `${NOME}` dentro de um texto com `` ` ``.

As constantes evitam repetir um endereço:

`course.js`:

```js
const ORIGINAL = "https://www.dcc.fc.up.pt/~fds/aulas/pi/2526/";

window.UC_COURSE = {
  // …
  platforms: [
    { label: "Pautas", url: ORIGINAL + "evaluation/" },
    { label: "Site antigo", url: `${ORIGINAL}index.html` },
  ],
};
```

Funções, `new Date()`, chamadas de métodos, `...` e outras atribuições não são permitidas. O browser aceita-as, mas o `uc-site.py` para nesse ponto e diz a linha:

```text
ERRO   course.js:3  'new' não é um valor: o course.js só pode ter valores (texto, números, listas, objetos)
```

## Tipos

Além de texto, números e listas, os campos usam quatro tipos:

| Tipo | Forma | Exemplo |
| --- | --- | --- |
| `LocalizedText` | Um texto igual em todas as línguas, ou um objeto com um texto por língua. Se faltar uma língua usa-se a primeira de `languages`. | `"Exame"` `{ pt: "Exame", en: "Exam" }` |
| `ISODate` | `"AAAA-MM-DD"`, com zeros. Um prazo aceita ainda `"AAAA-MM"` (só o mês) e `null` (a marcar). | `"2025-09-15"` |
| `Time` | `"HH:MM"`, 24 horas. | `"09:30"` |
| `Minutes` | Um número inteiro de minutos. | `120` (duas horas) |
| `Weekday` | Dia da semana em número: `1` = segunda-feira … `7` = domingo (como em `semester.teachingDays`). | `2` (terça-feira) |
| `HTMLText` | Um `LocalizedText` que pode ter HTML simples (links, `<strong>`, `<em>`, `<code>`). É inserido como HTML: as aspas dentro do texto escrevem-se `\"`. | `"Ver <a href=\"avaliacao.html\">regras</a>"` |

## Campos

### Curso

| Campo e tipo | Necessário | Por omissão | Descrição |
| --- | --- | --- | --- |
| `title``LocalizedText` | Obrigatório | — | Nome da cadeira: cabeçalho, [`<uc-hero>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-hero.md) e rodapé. |
| `code`texto | Opcional | — | Código acima do título, por exemplo `"CC1007"`. |
| `tagline``LocalizedText` | Opcional | — | Uma frase sobre a cadeira, mostrada por `<uc-hero>`. |
| `edition`texto | Recomendado | — | Ano letivo ao lado do título, por exemplo `"2025/26"`. |
| `institution``{ name, url? }` | Opcional | — | Departamento ou faculdade, no cabeçalho. |
| `accentColor`cor CSS | Opcional | `"#1D4ED8"` | Cor de destaque (links, semana atual, botões); as variantes clara e escura são calculadas. Precisa de contraste de pelo menos 4.5:1 com o branco. |
| `logo`URL ou `null` | Opcional | ícone de árvore | Imagem no cabeçalho, relativa ao `course.js`; `null` esconde-a. |
| `footer``HTMLText` | Opcional | título e instituição | Lado esquerdo do rodapé. |
| `updated``ISODate` | Opcional | — | "Atualizado a …" no rodapé. Muda-se à mão quando se publica. Uma página pode mostrar a sua própria data com [`<uc-page updated>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-page.md#data-da-pagina). |
| `editions`URL | Opcional | — | Ficheiro com as edições da cadeira, relativo ao `course.js`, normalmente `"../editions.js"`. Ver [Edições](#edicoes). |

### Línguas

| Campo e tipo | Necessário | Por omissão | Descrição |
| --- | --- | --- | --- |
| `languages`lista de códigos | Opcional | o `<html lang>` | Por exemplo `["pt", "en"]`. A primeira é a de omissão; com mais de uma aparece o seletor de língua. Ver [Línguas](https://uc-design-kit.miguelrocha.dev/docs/pt/linguas.md). |

### Semestre

| Campo e tipo | Necessário | Por omissão | Descrição |
| --- | --- | --- | --- |
| `semester.start``ISODate` | Recomendado | — | Primeiro dia de aulas. A semana 1 é a semana do calendário que o contém. Sem ele, as semanas não têm datas e "Esta semana" não aparece. |
| `semester.weeks`número | Opcional | `14` | Número de semanas de aulas, sem contar as interrupções. |
| `semester.teachingDays``[de, até]` | Opcional | `[1, 5]` | Dias com aulas (1 = segunda … 7 = domingo). As datas das semanas mostram-se com estes dias: `[2, 5]` dá "25–28 nov". |
| `semester.breaks``{ start, end, label }[]` | Opcional | `[]` | Semanas sem aulas. Não são numeradas e aparecem entre as semanas em [`<uc-weeks>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-weeks.md). |

### Navegação

| Campo e tipo | Necessário | Por omissão | Descrição |
| --- | --- | --- | --- |
| `pages`lista | Recomendado | `["home"]` | Páginas da navegação, por ordem. Ver [Páginas](#paginas). |
| `platforms``Platform[]` | Opcional | `[]` | Links externos (Moodle, Mooshak, SIGARRA) no grupo "Plataformas" da navegação (ver [Plataformas](#plataformas)). A plataforma chamada "Mooshak" dá também o link dos exercícios ([`<uc-exercise mooshak>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-exercise.md#problema-no-mooshak)). |

### Equipa, horário, prazos e avisos

| Campo e tipo | Necessário | Por omissão | Descrição |
| --- | --- | --- | --- |
| `team`lista | Opcional | `[]` | Equipa docente, mostrada por [`<uc-team>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-team.md). Ver [Equipa](#equipa). |
| `schedule`lista | Opcional | `[]` | Aulas semanais, mostradas por [`<uc-timetable>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-timetable.md). Ver [Horário](#horario). |
| `scheduleTypes`objeto | Opcional | — | Nomes de tipos de aula próprios, ou outros nomes para os do kit: `{ seminar: { pt: "Seminários", en: "Seminars" } }`. |
| `deadlines`lista | Opcional | `[]` | Prazos, testes e exames: aparecem na página inicial, na semana certa e na avaliação. Ver [Prazos](#prazos). |
| `notices`lista | Opcional | `[]` | Avisos de [`<uc-notices>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-notices.md). Ver [Avisos](#avisos). |

### Avançado

| Campo e tipo | Necessário | Por omissão | Descrição |
| --- | --- | --- | --- |
| `today``ISODate` | Opcional | a data real | Fixa o dia de "hoje", para demonstrações e capturas. Não deixar num site publicado. `?today=AAAA-MM-DD` no endereço sobrepõe-se a ele. |
| `runner`objeto | Opcional | Codapi e browser | Onde [`<uc-code run>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-code.md) executa o código: `{ provider, languages, codapi, browser }`. Trocar de serviço (Codapi próprio, Judge0) é só mudar este campo; os valores por omissão estão em [Configuração usada do `<uc-code>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-code.md#configuracao) e o guia completo é [Execução de código](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/execucao.md). |
| `search`true ou objeto | Opcional | desligada | Pesquisa no site (versão 1.2.0). O modelo já a traz ligada. `true` usa o índice `search-index.js` ao lado do `course.js`; `{ index, exclude }` muda o nome do ficheiro e deixa pastas ou páginas fora do índice. O índice é criado pelo [`uc-site.py`](https://uc-design-kit.miguelrocha.dev/docs/pt/manter.md#indice); o botão «Pesquisar» está em [`<uc-page>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-page.md#pesquisa). |

## Páginas

Cada entrada de `pages` é um identificador ou um objeto com `id`, `href` e `label`:

`course.js`:

```js
pages: [
  "home",                                          // index.html, "Início"
  { id: "weeks", href: "semanas.html" },           // identificador do kit, ficheiro próprio
  { id: "projects", href: "projetos.html", label: { pt: "Projetos", en: "Projects" } },
  { id: "about", href: { pt: "sobre.html", en: "about.html" } },   // um ficheiro por língua
],
```

- **`id`** identifica a página; é o valor de [`<uc-page current>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-page.md).
- **`href`** é relativo ao `course.js`, por isso funciona igual em páginas de subpastas. Um `LocalizedText` indica um ficheiro por língua.
- **`label`** é o nome na navegação; obrigatório para identificadores que não são do kit.

Os identificadores do kit já têm ficheiro e nome:

| Identificador | Ficheiro por omissão | Nome (pt / en) |
| --- | --- | --- |
| `home` | `index.html` | Início / Home |
| `weeks` | `weeks.html` | Semanas / Weeks |
| `assessment` | `assessment.html` | Avaliação / Assessment |
| `materials` | `materials.html` | Materiais / Materials |
| `schedule` | `schedule.html` | Horários e equipa / Schedule and team |
| `about` | `about.html` | Sobre a UC / About the course |

## Equipa

`course.js`:

```js
team: [
  { name: "Ana Silva", url: "https://example.org/~ana", role: "coordinator",
    classes: ["T1", "T2"], office: "Gab. 1.25",
    officeHours: [{ day: 2, start: "16:00", end: "18:00" }] },
  { name: "Rui Costa", email: "rui@example.org", role: "assistant", classes: ["PL1", "PL3"] },
  { name: "Inês Rocha", role: { pt: "Monitora", en: "Teaching assistant" } },
],
```

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `name` | texto | Obrigatório. |
| `url` | URL | Página pessoal; o nome passa a link. |
| `email` | texto | Mostrado como link `mailto:`. |
| `role` | `"coordinator"`, `"lecturer"`, `"assistant"` ou `LocalizedText` | Os três papéis do kit são traduzidos (Regente, Docente, Práticas); qualquer outro texto aparece como está. |
| `classes` | lista de textos | Turmas, por exemplo `["PL1", "PL5"]`. |
| `office` | texto | Gabinete, por exemplo `"Gab. 1.25"`. |
| `officeHours` | lista | Atendimento semanal, uma entrada por horário: `{ day, start, end, room?, note? }`, com `day` um `Weekday` e as horas em `Time`. Sem `room`, usa-se `office`. Aparece nos cartões de [`<uc-team>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-team.md) e em [`<uc-timetable type="office-hours">`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-timetable.md#atendimento). |

## Horário

Uma entrada por aula semanal. Uma turma com duas aulas por semana tem duas entradas, que [`<uc-timetable>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-timetable.md) junta numa linha ("3.ª e 5.ª").

`course.js`:

```js
schedule: [
  { type: "lecture", class: "T1", day: 2, start: "14:00", end: "15:00", room: "FC4 0.41" },
  { type: "lecture", class: "T1", day: 4, start: "14:00", end: "15:00", room: "FC4 0.41" },
  { type: "lab", class: "PL2", day: 2, start: "16:00", end: "18:00", room: "FC6 1.65" },
  { type: "lab", class: "PL7", day: 2, start: "16:00", end: "18:00", room: "FC6 0.08",
    staff: "Eduardo Marques", note: "Só nas semanas ímpares" },
],
```

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `type` | `"lecture"`, `"lab"`, `"tutorial"` ou texto | Obrigatório. Os três tipos do kit são traduzidos (Teóricas, Práticas laboratoriais, Teórico-práticas); outro texto é um tipo próprio, com o nome dado em `scheduleTypes` ou tal como está escrito. |
| `class` | texto | Obrigatório. A turma, por exemplo `"T1"` ou `"PL2"`. |
| `day` | `Weekday` | Obrigatório. O dia da semana, de `1` (segunda) a `7` (domingo). |
| `start`, `end` | `Time` | Obrigatórios. Início e fim da aula. |
| `room` | `HTMLText` | A sala; pode ser um link (planta, reserva). |
| `staff` | texto ou lista de textos | Os docentes, com os nomes escritos como em `team`. Sem este campo, são as pessoas da equipa cujo `classes` inclui a turma, por isso normalmente não é preciso. |
| `note` | `HTMLText` | Uma nota curta, por exemplo "Só nas semanas ímpares". |

Uma entrada a que falte `type`, `class`, `day`, `start` ou `end` não aparece, e a consola diz qual é.

## Plataformas

Os links externos do grupo "Plataformas" da navegação. As mesmas entradas dão o nome do juiz nas listas de problemas ([`<uc-problems>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-problems.md)).

`course.js`:

```js
platforms: [
  { id: "mooshak", label: "Mooshak", url: "https://mooshak.dcc.fc.up.pt/~edados/" },
  { id: "codeforces", label: "Codeforces", url: "https://codeforces.com", hidden: true },
],
```

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `label` | `LocalizedText` | Obrigatório. O nome na navegação e na etiqueta do juiz. |
| `url` | URL | Obrigatório. |
| `id` | texto | Nome curto, usado em `data-judge="codeforces"`. Sem ele, `data-judge` é comparado com `label`, sem distinguir maiúsculas nem acentos. |
| `hidden` | booleano | Com `true`, a plataforma não aparece na navegação, mas as listas de problemas conhecem-na (um juiz usado só numa série). |

## Prazos

Um prazo escreve-se uma vez e aparece onde fizer falta: na lista de próximas datas, dentro da semana em que cai, no cartão "Esta semana" e na tabela da avaliação.

`course.js`:

```js
deadlines: [
  { id: "t2", title: "Entrega do trabalho 2", date: "2025-11-28", time: "23:59", kind: "submission",
    note: "Pela plataforma de entregas", url: "trabalhos/t2.html" },
  { id: "quiz5", title: "Quiz 5", date: "2025-11-17", end: "2025-11-24", kind: "quiz" },
  { id: "teste", title: "Teste prático", date: "2025-12-10", time: "14:00", kind: "assessment",
    duration: 105, location: "Laboratórios 1 e 2",
    shifts: [{ time: "14:00" }, { time: "16:00", location: "Laboratório 1" }],
    url: "teste.html", links: [{ label: "Enunciado de 2024/25", url: "avaliacao/teste-2425.pdf" }] },
  { id: "exame", title: "Exame, época normal", date: "2026-01", kind: "exam" },   // dia por marcar
  { id: "recurso", title: "Exame de recurso", date: null, kind: "exam" },        // a marcar
],
```

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` | texto | Obrigatório e único. Usado por [`<uc-date deadline>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-date.md) e [`<uc-event deadline>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-event.md). |
| `title` | `LocalizedText` | Obrigatório. |
| `date` | `ISODate`, `"AAAA-MM"` ou `null` | Dia do prazo; só o mês quando o dia não se sabe; `null` quando está por marcar. |
| `time` | `Time` | Hora de início ou limite. |
| `end` | `ISODate` | Último dia, para prazos de vários dias (um quiz aberto uma semana). Conta como próximo até acabar. |
| `kind` | `"assessment"`, `"exam"`, `"quiz"`, `"submission"`, `"other"` | Tipo: muda a etiqueta e permite filtrar (`kind="assessment exam"` nos componentes). Por omissão `"other"`. |
| `note` | `HTMLText` | Linha secundária curta: turnos, salas, plataforma. |
| `url` | URL | Página com mais informação; o título passa a link. |
| `links` | `{ label, url }[]` | Links extra (resultados, turnos). |
| `duration` | `Minutes` | Duração da prova. Com `time`, a hora de fim é calculada ("14:00–15:45"). |
| `location` | `HTMLText` | Salas, ou um link para a distribuição por salas (pode levar [`data-auth`](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/elementos.md#data-auth)). |
| `shifts` | `Shift[]` | Turnos, quando a mesma prova se faz mais de uma vez. Aparecem em vez de `time`, que continua a ser a hora do primeiro turno (para ordenar). |

Cada turno (`Shift`) é `{ time, end, date, location, note }`, e só `time` é obrigatório. `end` é por omissão `time` mais `duration`; `date` é o dia do prazo (muda-se para uma prova feita em dois dias); `location` e `note` aparecem só junto a esse turno. Com turnos ou com `duration`, os componentes que mostram o prazo mostram também as horas ("14:00 e 16:00", "14:00–15:45"), e [`<uc-assessment-info>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-assessment-info.md) mostra tudo num cartão.

## Avisos

`course.js`:

```js
notices: [
  { date: "2025-11-27",
    text: "Saíram as notas do teste 1. Ver <a href=\"avaliacao.html\">Avaliação</a>." },
  { date: "2025-12-01", text: "Não há aula teórica na segunda-feira.",
    details: "A matéria passa para quarta." },
],
```

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `date` | `ISODate` | Obrigatório. Os avisos mostram-se do mais recente para o mais antigo, e um aviso com data futura só aparece nesse dia: podem escrever-se com antecedência. |
| `text` | `HTMLText` | Obrigatório. Uma linha. |
| `details` | `HTMLText` | Segunda linha, opcional. |

## Edições

Um ficheiro `editions.js` na pasta da cadeira, **acima** das pastas dos anos, lista todas as edições. O `course.js` de cada ano aponta para ele com `editions: "../editions.js"`, e [`<uc-page>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-page.md#outros-anos) mostra o botão "Outros anos" e, nas edições antigas, um aviso com o link para a atual.

```text
EDados/
  editions.js      ← lista das edições (window.UC_EDITIONS)
  2425/course.js   ← editions: "../editions.js"
  2526/course.js   ← editions: "../editions.js"
```

`editions.js`:

```js
window.UC_EDITIONS = [
  { label: "2025/26", href: "2526/" },   // a primeira é a edição atual
  { label: "2024/25", href: "2425/" },
  { label: "2023/24", href: "https://www.dcc.fc.up.pt/~fds/aulas/EDados/2324/" },
];
```

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `label` | texto | Obrigatório. Igual ao `edition` do `course.js` desse ano: é assim que o kit sabe em que edição está a página. |
| `href` | URL | Obrigatório. Relativo ao `editions.js` (`"2526/"`), ou um endereço completo para anos que estão noutro sítio. |

O kit carrega o ficheiro sozinho, também a partir do disco. Se não o encontrar, escreve um aviso na consola e a página fica como sem `editions`. Como o ficheiro está fora das pastas dos anos, acrescentar um ano novo atualiza os sites anteriores sem lhes mexer (ver [Novo ano letivo](https://uc-design-kit.miguelrocha.dev/docs/pt/novo-ano.md#outros-anos)).

## Erros comuns

O kit avisa na consola (F12) com mensagens começadas por `[uc-kit]`, e o [`uc-site.py`](https://uc-design-kit.miguelrocha.dev/docs/pt/manter.md) encontra os mesmos erros sem abrir o browser, com a linha de cada um. Estes são os casos mais frequentes:

| Sintoma | Causa e solução |
| --- | --- |
| O cabeçalho mostra o título do separador e a navegação só tem "Início"; na consola, `SyntaxError` | Erro de sintaxe no `course.js`: falta uma vírgula entre campos, sobra uma chaveta ou uma aspa ficou por fechar. A consola indica a linha. |
| `window.UC_COURSE is missing` | O `course.js` não foi carregado, ou foi carregado depois do kit. Confirmar o caminho (`../course.js` numa subpasta) e que vem antes de `uc-kit.js`, sem `defer`. |
| `has an invalid date "2025-9-1"` | As datas levam zeros: `"2025-09-01"`. |
| `has unknown kind "teste"` | `kind` aceita só `assessment`, `exam`, `quiz`, `submission` e `other`; o nome que se mostra vai em `title`. |
| `is not a built-in page and needs an href` | Uma página com identificador próprio precisa de `href` e `label`. |
| As semanas não têm datas | Falta `semester.start`, ou a data não é válida. |
| A semana 1 começa uma semana mais cedo ou mais tarde | A semana 1 é a semana do calendário (segunda a domingo) que contém `semester.start`. Confirmar o dia e as interrupções em `breaks`. |
| Um aviso não aparece | Tem uma data futura: só aparece nesse dia. Para testar, abrir a página com `?today=`. |
| Aspas partem o texto de um aviso | Dentro de um texto entre `"`, as aspas do HTML escrevem-se `\"`, ou usam-se plicas à volta do texto. |
| Tudo aparece num dia errado | Ficou um `today` no `course.js`. Apagar a linha. |
