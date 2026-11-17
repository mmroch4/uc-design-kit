# Programação Imperativa 2025/26

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/exemplos/pi.html

O site de Programação Imperativa (CC1003, DCC/FCUP), refeito com o kit a partir do site original: o primeiro exemplo bilingue, em português e inglês. Tem sete páginas principais, sumários, doze guiões de aulas práticas nas duas línguas, dois testes práticos, slides e 112 enunciados para submeter no Mooshak.

[Abrir o site](https://uc-design-kit.miguelrocha.dev/examples/pi-2526/index.html) [Ver o código](https://github.com/mmroch4/uc-design-kit/tree/main/examples/pi-2526)

> O conteúdo deste exemplo (textos, guiões das aulas práticas, testes, slides, enunciados, código e imagens) é dos Profs. Fernando Silva e Vanessa Silva e foi copiado do [site original](https://www.dcc.fc.up.pt/~fds/aulas/pi/2526/) só para demonstrar o kit. Não está abrangido pela licença MIT: ver o [NOTICE.md](https://github.com/mmroch4/uc-design-kit/blob/main/examples/pi-2526/NOTICE.md). Use-o como referência de estrutura, não como conteúdo a copiar.

## O site

![Página inicial de Programação Imperativa: título, botão EN para mudar de língua e cartão Esta semana com as teóricas, a aula prática 4 e a entrega dos problemas da aula 3.](https://uc-design-kit.miguelrocha.dev/docs/assets/img/pi-home.webp)

*Início: `<uc-this-week>` e o botão de língua no cabeçalho.*

![Página Horários e equipa: escolha da turma teórica e prática e as tabelas das teóricas T1 e T2 e das práticas laboratoriais com dia, hora, sala e docente.](https://uc-design-kit.miguelrocha.dev/docs/assets/img/pi-timetable.webp)

*Horários: `<uc-timetable class-filter>` a partir do `schedule` do `course.js`.*

![Página de avaliação: fórmula da nota, barra com os pesos de EF, AP e RE, tabela das componentes e regras para aprovar.](https://uc-design-kit.miguelrocha.dev/docs/assets/img/pi-grading.webp)

*Avaliação: `<uc-grading calculator>` com a fórmula literal, regras para aprovar e subcomponentes.*

![Lista de problemas do Mooshak: filtros Todos, Principal e Extra, a aula 3 com o prazo daqui a 5 dias e os problemas com o peso e a caixa Resolvido.](https://uc-design-kit.miguelrocha.dev/docs/assets/img/pi-problems.webp)

*Problemas: `<uc-problems filters track>` por aula, com o prazo e o peso de cada problema.*

## Páginas e o que usam

| Página | Componentes | Blocos e notas |
| --- | --- | --- |
| [`index.html`](https://uc-design-kit.miguelrocha.dev/examples/pi-2526/index.html) | `<uc-hero>`, `<uc-this-week>`, `<uc-notices>`, `<uc-deadlines>`, `<uc-team>` | Textos nas duas línguas com blocos `lang`. |
| [`semanas.html`](https://uc-design-kit.miguelrocha.dev/examples/pi-2526/semanas.html) | `<uc-weeks>`, `<uc-week>` | 13 semanas e três interrupções (Páscoa, Atividades FCUP e Queima); `title-en` em cada semana. |
| [`sumarios.html`](https://uc-design-kit.miguelrocha.dev/examples/pi-2526/sumarios.html) | `<uc-summaries search>` | Cada sumário em PT e em EN, com `lang` em cada item. |
| [`avaliacao.html`](https://uc-design-kit.miguelrocha.dev/examples/pi-2526/avaliacao.html) | `<uc-grading calculator>`, `<uc-deadlines>` | A fórmula do programa tal como está escrita (`data-formulas`, componentes de 0 a 100) e as regras para aprovar (`data-rules`); ligações às pautas com `a[data-auth]`. |
| [`materiais.html`](https://uc-design-kit.miguelrocha.dev/examples/pi-2526/materiais.html) | `<uc-materials>` | 18 conjuntos de slides em PDF, `uc-links--grid` para as outras ligações. |
| [`horarios.html`](https://uc-design-kit.miguelrocha.dev/examples/pi-2526/horarios.html) | `<uc-timetable>`, `<uc-team>` | Aulas com filtro por turma e horário de atendimento (`officeHours`). |
| [`sobre.html`](https://uc-design-kit.miguelrocha.dev/examples/pi-2526/sobre.html), [`about.html`](https://uc-design-kit.miguelrocha.dev/examples/pi-2526/about.html) | `<uc-page>` | Uma página por língua: o `href` da navegação muda com a língua. |
| [`praticas/aulaNN(_pt).html`](https://uc-design-kit.miguelrocha.dev/examples/pi-2526/praticas/aula01_pt.html) | `<uc-guide>`, `<uc-code>` | 24 guiões (12 aulas × 2 línguas) convertidos por script, com ligação à outra versão. |
| [`praticas/teste_pratico1–2.html`](https://uc-design-kit.miguelrocha.dev/examples/pi-2526/praticas/teste_pratico1.html) | `<uc-assessment-info calendar>` | Duração, turnos e local vêm do `course.js`. |
| [`praticas/problems/`](https://uc-design-kit.miguelrocha.dev/examples/pi-2526/praticas/problems/index.html) | `<uc-problems filters track>` | 112 enunciados em `uc-content`; os bilingues têm uma secção por língua. |
| [`codigo/`](https://uc-design-kit.miguelrocha.dev/examples/pi-2526/codigo/index.html) | `<uc-code collapsible>` | Código das aulas com o ficheiro `.c` para descarregar. |

Todas as páginas usam `<uc-page>`. As que não estão na navegação dizem qual é o item ativo com `current`: ver [páginas em subpastas](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-page.md#subpastas).

## O `course.js`

O [`course.js`](https://github.com/mmroch4/uc-design-kit/blob/main/examples/pi-2526/course.js) deste exemplo tem:

- `languages: ["pt", "en"]`: cada texto que muda com a língua é um objeto `{ pt, en }`. Ver [Línguas](https://uc-design-kit.miguelrocha.dev/docs/pt/linguas.md).
- O semestre com 13 semanas e três interrupções.
- Sete páginas na navegação, uma delas com um endereço por língua, e duas plataformas (Mooshak e SIGARRA).
- Uma equipa de seis pessoas, com gabinete e horário de atendimento das regentes, e o `schedule` com duas turmas teóricas e oito práticas.
- Os dois testes práticos com duração, turnos e local, o exame, o recurso e dez prazos de submissão de problemas (`kind: "submission"`).
- `search: true`: a pesquisa inclui os 112 enunciados, uma vez por língua, e cada aluno só vê os resultados da língua que escolheu. O índice tem cerca de 370 KB (100 KB comprimido) e só é descarregado quando se abre a pesquisa.

## Personalização

| Nível | No exemplo |
| --- | --- |
| 0: `course.js` | A cor de destaque (`#C2410C`), as línguas, as páginas e as plataformas. |
| 2: CSS livre | O [`theme.css`](https://github.com/mmroch4/uc-design-kit/blob/main/examples/pi-2526/theme.css) tem a fórmula da nota, os cartões da bibliografia e o `pre` dos enunciados, só com tokens. |
| 4: HTML livre | Os guiões, a ajuda do Mooshak e os 112 enunciados: HTML do site antigo dentro de `<uc-page>` e `uc-content`. |

## Migrar um site antigo

As páginas principais foram reescritas com componentes, com o texto nas duas línguas. Os guiões, os testes, a ajuda, o código e os enunciados foram convertidos por script a partir do HTML original: estilos inline e tipos de letra retirados, código colorido passado a `<uc-code>` e ligações tornadas relativas. A pasta `evaluation/` (pautas, presenças e turnos), com dados de estudantes, não foi copiada: as páginas ligam ao original.

O registo completo (inventário, o que ficou de fora e as correções ao conteúdo) está no [`MIGRACAO.md`](https://github.com/mmroch4/uc-design-kit/blob/main/examples/pi-2526/MIGRACAO.md). Para fazer o mesmo com um assistente de programação, ver [Migrar um site existente](https://uc-design-kit.miguelrocha.dev/docs/pt/migrar.md).

## Ver também

- [Todos os exemplos](https://uc-design-kit.miguelrocha.dev/docs/pt/exemplos/index.md).
- [Línguas](https://uc-design-kit.miguelrocha.dev/docs/pt/linguas.md): como fazer um site em mais de uma língua.
- [`<uc-timetable>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-timetable.md), [`<uc-grading>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-grading.md) e [`<uc-problems>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-problems.md).
