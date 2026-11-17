# Migração: Competitive Programming 2026/27

Site original: <https://www.dcc.fc.up.pt/~pribeiro/aulas/pc2627/> (Pedro Ribeiro, DCC/FCUP).
O site original é só em inglês, por isso o exemplo também é (`languages: ["en"]`).
Conteúdo do autor, fora da licença MIT: ver `NOTICE.md`.

## Estado

Primeira fase: as páginas que os estudantes abrem todas as semanas, a partir do
conteúdo recolhido a 16 nov 2026. As subpáginas (aulas, problem sets, contest e
enunciados) não foram copiadas porque o servidor do DCC deixou de responder a
partir das 23:30 de 16 nov (bloqueio por excesso de pedidos). Por agora, ligam
para o site original com endereço absoluto.

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
| `weekNN.html` (6) | — | **Por copiar**: link para o original |
| `psNN.html` (6) | — | **Por copiar**: link para o original |
| `contest1.html` | — | **Por copiar**: link para o original |
| `problems/pcNNN.html` (31) e imagens | — | **Por copiar**: link para o original |
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
- Prazos dos problem sets (estão nas páginas `psNN.html`, ainda por ler).
- Número de problem sets: a avaliação fala em 10, a página inicial lista 6.
