# Introduction to Programming 2025/26

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/exemplos/ip.html

O site de Introdução à Programação (CC1024, DCC/FCUP), refeito com o kit a partir do site original: sete páginas principais, sumários das teóricas, onze aulas práticas, dois testes e 107 problemas para submeter no Mooshak. Mostra uma cadeira grande do 1.º ano, com muitos prazos e muitos problemas.

[Abrir o site](https://uc-design-kit.miguelrocha.dev/examples/ip-2526/index.html) [Ver o código](https://github.com/mmroch4/uc-design-kit/tree/main/examples/ip-2526)

> O conteúdo deste exemplo (textos, guiões das aulas práticas, testes, exame, enunciados e imagens) é dos Profs. Pedro Ribeiro e Bernardo Portela e foi copiado do [site original](https://www.dcc.fc.up.pt/~pribeiro/aulas/ip2526/) só para demonstrar o kit. Não está abrangido pela licença MIT: ver o [NOTICE.md](https://github.com/mmroch4/uc-design-kit/blob/main/examples/ip-2526/NOTICE.md). Use-o como referência de estrutura, não como conteúdo a copiar.

## O site

![Página inicial de Introduction to Programming: título do curso, licenciaturas e cartão Esta semana com a semana 10, duas teóricas e a aula prática de recursão.](https://uc-design-kit.miguelrocha.dev/docs/assets/img/ip-home.webp)

*Início: `<uc-this-week>` com as teóricas e a prática da semana.*

![Página das teóricas: caixa de pesquisa e a lista dos sumários T01 a T04 com a data, o docente e a semana.](https://uc-design-kit.miguelrocha.dev/docs/assets/img/ip-lectures.webp)

*Teóricas: `<uc-summaries search>`, com as datas ligadas às semanas.*

![Lista de problemas do Mooshak: filtros Main, Extra e Challenge e os problemas da aula 1 com o prazo, o estado Fechado e a contagem de resolvidos.](https://uc-design-kit.miguelrocha.dev/docs/assets/img/ip-problems.webp)

*Problemas: `<uc-problems>` por aula, com o prazo de cada uma.*

![Guião da aula prática 1: exercícios para submissão com etiquetas main, extra e challenge, o prazo e o contador de exercícios feitos.](https://uc-design-kit.miguelrocha.dev/docs/assets/img/ip-guide.webp)

*Aula prática 1: `<uc-guide>` com `<uc-exercise>` e progresso guardado no browser.*

## Páginas e o que usam

| Página | Componentes | Blocos e notas |
| --- | --- | --- |
| [`index.html`](https://uc-design-kit.miguelrocha.dev/examples/ip-2526/index.html) | `<uc-hero>`, `<uc-this-week>`, `<uc-notices>`, `<uc-deadlines>`, `<uc-team>` | `uc-split`, `uc-shortcuts`, `uc-grid` e `uc-card`. |
| [`weeks.html`](https://uc-design-kit.miguelrocha.dev/examples/ip-2526/weeks.html) | `<uc-weeks>`, `<uc-week>` | 13 semanas com teóricas e práticas, e a semana de Atividades FCUP. |
| [`lectures.html`](https://uc-design-kit.miguelrocha.dev/examples/ip-2526/lectures.html) | `<uc-summaries search>` | Sumários T01–T23, às segundas e sextas. |
| [`assessment.html`](https://uc-design-kit.miguelrocha.dev/examples/ip-2526/assessment.html) | `<uc-grading>`, `<uc-deadlines>` | `uc-callout`, `uc-checklist`, `uc-bullets`. |
| [`materials.html`](https://uc-design-kit.miguelrocha.dev/examples/ip-2526/materials.html) | `<uc-materials>`, `<uc-weeks>` | Notebooks no Google Colab, `uc-links--grid`, cartões. |
| [`about.html`](https://uc-design-kit.miguelrocha.dev/examples/ip-2526/about.html) | `<uc-team>` | Objetivos, competências e programa numerado, `uc-tag`, `uc-checklist`. |
| [`exam.html`](https://uc-design-kit.miguelrocha.dev/examples/ip-2526/exam.html) | `<uc-assessment-info>` | Texto original dentro de `uc-content`. |
| [`practical/class01–11.html`](https://uc-design-kit.miguelrocha.dev/examples/ip-2526/practical/class01.html) | `<uc-guide>`, `<uc-exercise>`, `<uc-date>` | Exercícios com etiquetas main, extra e challenge, dicas em `uc-hint`; as aulas 1 e 5 foram reescritas à mão, as outras convertidas por script. |
| [`practical/test1–2.html`](https://uc-design-kit.miguelrocha.dev/examples/ip-2526/practical/test1.html) | `<uc-assessment-info>` | Um cartão por exercício. |
| [`problems/`](https://uc-design-kit.miguelrocha.dev/examples/ip-2526/problems/index.html) | `<uc-problems>` | 107 problemas e o desafio de Natal; enunciados em `uc-content`, com MathJax onde há fórmulas. |

Todas as páginas usam `<uc-page>`. As que não estão na navegação dizem qual é o item ativo com `current`: ver [páginas em subpastas](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-page.md#subpastas).

## O `course.js`

O [`course.js`](https://github.com/mmroch4/uc-design-kit/blob/main/examples/ip-2526/course.js) deste exemplo tem:

- `languages: ["en"]`, como o site original.
- O semestre com 13 semanas e a pausa de Atividades FCUP (27 a 31 de outubro).
- Seis páginas na navegação e três plataformas (Mooshak, Discord e SIGARRA).
- Uma equipa de sete pessoas: dois regentes e cinco assistentes.
- Doze prazos de submissão (um por aula prática e o desafio de Natal), os testes e o exame, que aparecem no início, na avaliação, nas semanas e na lista de problemas.
- `search: true`: o botão «Pesquisar» do cabeçalho procura em todas as páginas, incluindo os enunciados dos problemas e as aulas práticas. O índice é gerado pelo [`uc-site.py`](https://uc-design-kit.miguelrocha.dev/docs/pt/manter.md).

## Personalização

| Nível | No exemplo |
| --- | --- |
| 0: `course.js` | A cor de destaque (`#2B5B84`), as páginas e as plataformas. |
| 2: CSS livre | O [`theme.css`](https://github.com/mmroch4/uc-design-kit/blob/main/examples/ip-2526/theme.css) tem o programa numerado, e classes com contraste suficiente para as cores do HTML antigo (`.c-red`, `.hl-ok`…), só com tokens. |
| 4: HTML livre | O exame, a ajuda do Mooshak e os 108 enunciados: HTML do site antigo dentro de `<uc-page>` e `uc-content`. |

## Migrar um site antigo

As páginas que os estudantes usam todas as semanas (início, semanas, teóricas, avaliação, problemas e as aulas 1 e 5) foram reescritas com componentes. As restantes aulas e os enunciados foram convertidos por script a partir do HTML original: as cores antigas passaram a classes do `theme.css` e o código colorido passou a `<uc-code>`. As notas, salas e turnos, com dados de estudantes, não foram copiados: as páginas ligam ao original.

O registo completo (inventário, calendário reconstruído e pontos a confirmar com os docentes) está no [`MIGRACAO.md`](https://github.com/mmroch4/uc-design-kit/blob/main/examples/ip-2526/MIGRACAO.md). Para fazer o mesmo com um assistente de programação, ver [Migrar um site existente](https://uc-design-kit.miguelrocha.dev/docs/pt/migrar.md).

## Ver também

- [Todos os exemplos](https://uc-design-kit.miguelrocha.dev/docs/pt/exemplos/index.md).
- [`<uc-summaries>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-summaries.md), [`<uc-guide>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-guide.md) e [`<uc-problems>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-problems.md).
