# Migração: Introduction to Programming 2025/26

Site original: <https://www.dcc.fc.up.pt/~pribeiro/aulas/ip2526/> (Pedro Ribeiro e
Bernardo Portela, DCC/FCUP). Só em inglês, por isso o exemplo também é só em inglês
(`languages: ["en"]`). O conteúdo não é MIT: ver `NOTICE.md`.

## Estado

**Migração completa** (17 nov 2026). Uma primeira parte foi recolhida do browser
(16–17 nov), antes de o servidor do DCC começar a recusar ligações por excesso de
pedidos. O resto foi descarregado a 17 nov com `wget` no portátil do Miguel, devagar
(pausas de 2 s entre pedidos) e sem a pasta `evaluation/`: 285 ficheiros, ~15 MB.
As páginas que só existiam no original passaram a caminhos relativos.

## Inventário

| Página antiga | Destino | Tratamento | Estado |
| --- | --- | --- | --- |
| `index.html` | `index.html` | Reescrita com componentes (`uc-hero`, `uc-this-week`, `uc-notices`, `uc-deadlines`, `uc-team`); xkcd 1513 em `images/` | Feita |
| `info.html` | `about.html` | Reescrita (objetivos, competências, programa) | Feita |
| `plan.html` | `weeks.html` | Reescrita com `uc-weeks` (13 semanas + Atividades FCUP) | Feita (ver nota) |
| `evaluation.html` | `assessment.html` | Reescrita; datas em `course.js` | Feita |
| `material.html` | `materials.html` | Reescrita; notebooks continuam no Google Colab | Feita |
| `exam.html` | `exam.html` | Copiada dentro de `uc-content` | Feita |
| `practical/test1.html`, `test2.html` | iguais | Reescritas (`uc-assessment-info` e um cartão por exercício) | Feita |
| `practical/class01.html` … `class11.html` | iguais | `uc-guide` com `uc-exercise`; 01 e 05 escritas à mão, as outras convertidas por script a partir do HTML original | Feita |
| `practical/mooshak_help.html` | igual | Copiada dentro de `uc-content` | Feita |
| `practical/ip097_skeleton.html` | `practical/class10.html` | Código num `uc-code` recolhido dentro da aula 10 | Feita |
| `practical/*.png`, `*.jpg`, `*.py`, `*.txt` | iguais | Copiados tal como estão (memes, capturas do Mooshak, código e inputs de exemplo) | Feita |
| `problems/index.html` | igual | Reescrita com `uc-problems` (filtros, "Resolvido", prazo de cada aula) | Feita |
| `problems/ipNNN.html` (107) e `xmas.html` | iguais | Copiados dentro de `uc-content`, com as imagens; MathJax do cdnjs nos que usam fórmulas | Feita |
| `images/*` | `images/` | Copiadas; só o xkcd é usado (os ícones da página inicial deram lugar aos componentes) | Feita |
| `practical/practical.css`, `style.css`, `exam.css`, `latexit.js` | — | De fora: o estilo vem do kit; `latexit.js` já não existia no original (404) | Fica de fora |
| `evaluation/*` (notas, salas, turnos, exames anteriores) | — | De fora: dados de estudantes e acesso autenticado; link para o original com `data-auth` | Fica de fora |

## Decisões e notas

- **Calendário reconstruído.** O `plan.html` original só tinha as teóricas T01–T08 e as
  práticas P01–P03, seguidas de “(...)”. As restantes semanas foram distribuídas a
  partir das datas das notícias (publicação de cada notebook e de cada guião) e das
  datas das aulas práticas indicadas nos guiões (P01: 22–26 set; P05: 20–24 out).
  Confirmar com os docentes.
- **Pausa de 27 a 31 de outubro** (Atividades FCUP), a mesma do exemplo de EDados.
- **Prazos de submissão.** Os 11 prazos (`p01`–`p11`) e o do desafio de Natal (`xmas`,
  31 jan 2026) vêm dos guiões e dos enunciados. Todos às 23:59.
- **Conversão automática.** As aulas 02–04 e 06–11 e os enunciados foram convertidos
  por script: cores antigas passaram a classes com contraste suficiente (`.c-red`,
  `.c-green`, `.hl-ok`… no `theme.css`), o código colorido do hilite.me passou a
  `uc-code`, os memes ficaram em `<details class="uc-hint">` com texto alternativo e os
  ícones do Mooshak (`mooshak.gif`) saíram. O texto não foi revisto à mão: as gralhas
  do original ficam (por exemplo “suprised”, “whyle”).
- **Links partidos no original**: `practical/detailed_rte.png` (captura citada na aula 1)
  e `latexit.js` já davam 404 no site original.
- **Equipa.** Os papéis de cada docente (regente, teóricas, práticas) não são claros no
  original: Pedro Ribeiro e Bernardo Portela aparecem como `lecturer`, os restantes
  como `assistant`, sem turmas.
- **Gralhas corrigidas** no texto migrado: “Objetives”, “Elegibility”, “Pratical”,
  “exercices”, “veredict”, “comamnd”, “innefficent”, “payed”, “inserating”, e a
  numeração “4) … 3)” do guião 5.
- **Datas do 2.º teste e do exame**: 17 dez 2025 e 6 jan 2026 (14:00), como na página
  inicial original. O teste de melhoria fica com data `null` (“to be scheduled”).
- **Link do SIGARRA**: usada a ocorrência 570289 (a da página inicial); o `exam.html`
  original apontava para 546487, de outro ano.
- **Discord**: o link original (`discord.com/app/` sem `https://`) estava partido;
  corrigido.

## Blocos novos do kit

- `lectures.html`: as 23 aulas teóricas em `<uc-summaries search>`; as futuras aparecem
  como "Prevista". Datas de T01–T08 do `plan.html`; T09–T23 reconstruídas (segundas e
  sextas, sem a semana de atividades nem os feriados de 1 e 8 de dezembro).
- `materials.html`: os notebooks em `<uc-materials>` (as aulas de revisão dizem "Sem
  material"); as aulas práticas em `<uc-weeks view="compact">` com `href` para cada guião;
  ligações de apoio e outras cadeiras em `uc-links--grid`.
- `problems/index.html`: `<uc-problems filters track>` com o prazo de cada aula.
- Testes: `<uc-assessment-info>` com turnos, duração e local vindos do `course.js`.

## Widgets (17 nov 2026, fase W6)

- `practical/class06.html`, exercício 2: `<uc-widget-complexity>` com 1, n e n².
- `practical/class09.html`: `<uc-widget-recursion>` (fib(5)) no exercício 1 e
  `<uc-widget-backtracking>` (subconjuntos de [1, 2, 3]) no exercício 6.

Conteúdo novo, escrito para o exemplo, não do site original.

## Por confirmar com os docentes

- O calendário reconstruído em `weeks.html` e as datas das aulas T09–T23 em `lectures.html`.
- Os papéis da equipa em `course.js`.

## Curadoria com o kit (17 nov 2026)

Revisão: <https://claude.ai/artifact/Bdn6q8AE1LZAs2f4nTDZC6>. Primeira parte, só com peças que o kit já tem:

- Aulas: a lista "Exercises for submission" é um `<uc-problems track>` com o prazo da aula
  (`data-deadline`), o tipo e o peso (`<data>`); o "Resolvido" é partilhado com
  `problems/index.html`, que passou a ter também os pesos. A política de submissão ficou só em
  `assessment.html#exercises`; nas aulas há um `uc-callout` curto. "Skills" em `uc-checklist`.
- Enunciados: o prazo vem do `course.js` (`<uc-date>`), os avisos fixos são `uc-callout--warning`,
  sem células vazias nem `<br/>` entre tabelas. Corrigido o link em falta do IP054 (aula 5).
- Testes: os pesos dos exercícios num `<uc-grading scale="100">`; cartões simples `uc-card`.
- Exame: objetivos em `uc-checklist`. Avaliação: elegibilidade em `uc-callout`, ligações em `uc-links--grid`.
- Início: sem o xkcd nem os cartões de "Quick links" (Mooshak e Discord já estão na barra lateral);
  os links do Python passaram para `materials.html`.
- `practical/ip097_skeleton.html` saiu: o código está na aula 10, num `uc-code` recolhido.

Segunda parte, com as peças novas do kit (PR #79): cabeçalho `uc-page-header` com `uc-crumbs` e
`uc-eyebrow` em todas as páginas; exemplos dos enunciados em `uc-samples`; programa em `uc-steps`;
regras dos testes em `uc-facts`; livros como `a.uc-card`; veredictos do Mooshak em `uc-tag--success`
/ `uc-tag--danger`; nota de origem em `source` no `course.js` e `source="…"` em cada `<uc-page>`
(sai o parágrafo de cada página). O `theme.css` ficou só com as cores dos enunciados.

Fica para a parte 2 do kit: datas da semana no `uc-guide` (hoje escritas no `uc-eyebrow`), caminho
dos testes e do exame a partir de Assessment no `uc-guide`, `kind` dos exercícios e `<uc-problem>`
para o cabeçalho dos enunciados.
