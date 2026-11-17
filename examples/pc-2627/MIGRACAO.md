# Migração: Competitive Programming 2026/27

Site original: <https://www.dcc.fc.up.pt/~pribeiro/aulas/pc2627/> (Pedro Ribeiro, DCC/FCUP).
O site original é só em inglês, por isso o exemplo também é (`languages: ["en"]`).
Conteúdo do autor, fora da licença MIT: ver `NOTICE.md`.

## Estado

Migração completa a partir da cópia do site descarregada a 17 nov 2026 (11:03–11:11,
um pedido de cada vez, com pausas de 1,5–4,5 s). Primeira fase (PR #41): páginas
principais. Segunda fase: aulas, problem sets, contest, enunciados, materiais e
imagens, todos locais com links relativos. As subpáginas foram convertidas com um
script (BeautifulSoup): conteúdo entre o cabeçalho e o rodapé do original, HTML
corrigido (listas por fechar, `<font>`, estilos inline), exemplos dos enunciados
em `uc-table` com `pre[data-copy]`, fórmulas com MathJax (cdnjs) como no original.

## Inventário

| Site original | Site novo | Tratamento |
| --- | --- | --- |
| `index.html` (página única com âncoras) | `index.html`, `classes.html`, `materials.html`, `rankings.html` | Reescrita com componentes; as secções passaram a páginas da navegação |
| Cabeçalho, datas das aulas, contests, Discord | `course.js` | `semester`, `breaks`, `deadlines`, `notices`, `platforms` |
| `#classes` (Predicted) Classes | `classes.html` | `<uc-weeks>`, uma `<uc-week>` por semana; os contests vêm do `course.js` |
| `#evaluation` + `evaluation.html` | `evaluation.html` | Reescrita: cartões SI/CE/PDC, tabela de datas, regras |
| `#oj`, `#material`, `#others` | `materials.html` | Cartões dos juízes e livros, listas de links |
| `#lists` | `rankings.html` | Só links para o original (dados de estudantes) |
| `problems.html` | `problems/index.html` | Tabelas por problem set; enunciados ligam ao original |
| `week01–07.html` | `classes/week01–07.html` | Convertidas; título, migalhas e ligação ao problem set |
| `ps01–07.html` | `problem-sets/ps01–07.html` | Convertidas; prazos passaram ao `course.js` (`kind: "submission"`) |
| `contest1.html` | `contest1.html` | Convertida; resultados (submissions/) ficam no original |
| `problems/pc001–037.html` + 42 imagens | `problems/pcNNN.html`, `problems/images/` | Convertidas; exemplos em `uc-table`, MathJax |
| `material/*` (pdf, cpp, c, java, txt) | `material/` | Cópia local (28 ficheiros) |
| `meme_*.jpg` (15) | `images/memes/` | Cópia local, com texto alternativo |
| `material/*.html` (bigo_table, prefixsums, segtree_array, segtree_ptr, fenwick_trees_four_patterns) | — | **Fora**: não descarregadas; ligam para o original |
| `week08–12`, `ps08–10` | — | Ainda não existem no original (404 a 17 nov) |
| `submissions/*` | — | **Fora**: listas e rankings com dados de estudantes |
| `style2627.css`, `pc2627.png`, `discord.png` | — | Fora: estilo antigo e logótipo |

## Decisões

- Semanas: uma aula por semana, à terça (`teachingDays: [2, 2]`), 11 semanas.
  Interrupções: semana de Atividades FCUP (26–30 out) e os feriados de 1 e 8 dez,
  juntos numa só interrupção (duas interrupções seguidas aparecem por ordem
  inversa no `<uc-weeks>`; falha do kit comunicada).
- A semana 11 começa na segunda 14 dez (`start="2026-12-14"`), porque a aula #10
  é nesse dia e o 2.º contest na terça.
- `today: "2026-11-17"` fixa a demonstração na semana 9 (aula #07).
- Correções de texto: "We will 10 evaluation problemsets" → "We will have 10…",
  "more than than", parêntese por fechar, "Prim+Kruskall" → "Prim and Kruskal",
  "ssc" → "scc", "Singapura" → "Singapore".

## Esclarecimentos (confirmados pelo Miguel, 17 nov 2026)

- 10 nov: não houve aula porque a faculdade fechou de forma inesperada devido ao
  mau tempo (semana 8, "No class (faculty closed)").
- A 24 nov dão-se as duas matérias (#08 e #09, grafos I e II) na mesma aula.
- A aula #10 (segunda, 14 dez) é reposição das terças que são feriado (1 e 8 dez).
- O 3.º contest, a criação de problemas e a apresentação de código ainda não têm
  data: ficam com o mês (`2027-01`) até serem anunciadas.
- São 10 problem sets; a 17 nov estavam publicados 7. Ao publicar um novo, criar
  `problem-sets/psNN.html` e acrescentar o prazo ao `course.js`.

## Widgets (17 nov 2026, fase W6)

As semanas 2, 3, 6 e 7 têm uma secção "See it step by step" (antes dos problemas) com
widgets da biblioteca `widgets/v1/`: `<uc-widget-complexity>` (semana 2),
`<uc-widget-sort>` com counting sort (3), `<uc-widget-dp>` mochila e LCS (6) e
`<uc-widget-toposort>` (7, DP em DAGs). Conteúdo novo, escrito para o exemplo, não do
site original. MST e union-find ficam para quando as semanas 8–12 existirem.

## Curadoria "design-kitted" (17 nov 2026)

Revisão: <https://claude.ai/artifact/6Lrmrk2AvynqjVUUxehkS6>. O Miguel aprovou as
recomendações (22:29). Feito com peças que o kit já tem:

- Aulas (`classes/weekNN`): dentro de `<uc-guide week="N">` (a aula #06 é a semana 7 e
  a #07 a semana 9), prazo da série com `<uc-event>`, objetivos em `uc-checklist`,
  material da cadeira (diapositivos, código, vídeos) em `<uc-materials>`, leituras em
  `uc-links` por tema, problemas de treino em `<uc-problems cards track>` com as notas
  do professor como dicas. Fórmulas TeX soltas (sem MathJax) passaram a texto. As
  ligações "colorized" para o original (segtree) saíram: o botão descarrega o `.cpp`.
- Problem sets: `<uc-event>` do prazo em vez da lista de datas; "About the delivery"
  passou à avaliação (`evaluation.html#delivery`), com ligação em cada série.
- Avaliação: tabela dos contests e aviso RFC retirados (estão em "Dates" e no
  `<uc-grading>`), pesos em `uc-tag`, datas de janeiro com `<uc-date>`, pontuação SI
  em tabela. Contest #1: regras dentro do `<uc-assessment-info>`, pontuação em tabela.
- Materiais: cartões com `uc-card` + `uc-tag`, ligações curtas em `uc-links--grid`; o
  `theme.css` perdeu os blocos `.book` e `.inline-links`.
- Semanas: `href` em cada `<uc-week>` com página; a semana 6 já não repete o contest.
- Enunciados: botões "Submit on Mooshak" e da série; `.hl` → `<mark>`, `.center` fora.
- Prisoner Challenge passou a `data-type="challenge"`.

Por fazer, à espera das lacunas do kit (thread do PI): migalhas (`.crumbs`), introdução
da página, nota de origem e estilo dos memes (`<details class="meme">`).
