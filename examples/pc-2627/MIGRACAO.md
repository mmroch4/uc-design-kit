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

## TODO para o professor confirmar

- Calendário: não há aula a 10 nov e há duas (#08 e #09) a 24 nov; a #10 está
  numa segunda (14 dez). A semana 8 aparece como "No class listed".
- Datas do 3.º contest, da criação de problemas e da apresentação de código
  (só "Jan ?": ficaram com o mês, `2027-01`).
- Número de problem sets: a avaliação fala em 10, o site tem 7 publicados (até 17 nov).
