# Migração de Programação Imperativa 2025/26

Site original: <https://www.dcc.fc.up.pt/~fds/aulas/pi/2526/> (frameset, bilingue EN/PT).
Conteúdo de Fernando Silva e Vanessa Silva; ver `NOTICE.md`.

O site novo é bilingue: português por omissão e inglês no botão do cabeçalho
(`languages: ["pt", "en"]`). As páginas curtas têm as duas línguas na mesma
página (`lang="pt"` / `lang="en"`); a ficha da UC tem um ficheiro por língua.

## Inventário

| Antigo (PT / EN) | Novo | Tratamento |
| --- | --- | --- |
| `home_pt.html` / `home.html` | `index.html` + `course.js` | Reescrito com componentes; avisos, prazos e equipa no `course.js` |
| `sumarios.html` / `sumarios_en.html` | `semanas.html` | 13 semanas com `uc-week`, sumários das 24 teóricas nas duas línguas |
| `praticas.html` / `praticals.html` | `semanas.html`, `materiais.html` | Calendário dos guiões dentro das semanas; ligações em Materiais |
| `apontamentos.html` / `slides.html` | `materiais.html` | Tabela de slides; ligações úteis juntas com `links.html` |
| `ficha_pt.html` / `ficha_en.html` | `sobre.html` / `about.html`, `avaliacao.html` | Um ficheiro por língua; a avaliação tem página própria |
| `horarios.html` / `horarios_en.html` | `horarios.html` | Reescrito com cartões e tabela |
| `links.html` | `materiais.html` | A secção "Classes, Books and Tutorials" estava vazia |
| `evaluation/*` | — | **Fica de fora**: resultados, presenças, turnos, salas e estatísticas têm dados de alunos. As páginas ligam ao original |
| `praticas/aulaNN(_pt).html`, `teste_pratico1/2.html` | — | **Ainda por copiar**: ligam ao original (ver abaixo) |
| `praticas/problems/`, `praticas/ajuda.html`, `codigo/`, `commands.html` | — | **Ainda por copiar**: ligam ao original |
| `apontamentos/*.pdf`, `praticas/1_intro_c.pdf` | — | **Ainda por copiar**: ligam ao original |

## Porque é que parte do site ainda liga ao original

Na noite de 16 para 17 de novembro de 2026 o servidor do DCC deixou de responder
ao computador usado para a migração (timeouts depois de muitos pedidos de várias
migrações em paralelo). Só estava recolhido o texto das páginas principais. Os
guiões, os enunciados, o código e os PDF ficam ligados ao site original até ser
possível descarregá-los; nessa altura passam para `guioes/`, `problemas/`,
`codigo/` e `slides/`, como no exemplo de EDados.

## Correções feitas ao conteúdo

- Datas de interrupções: os sumários e as práticas tinham datas diferentes. Ficou
  Páscoa 30 mar–3 abr, Atividades FCUP 7–9 abr e Queima 4–8 mai.
- Hora das avaliações práticas: a página inicial dá 14:15 (AP1) e 14:10 (AP2), as
  práticas dão 14:00. Ficou a da página inicial.
- Slide 10 com data "23/04/2025": ficou 23/04/2026.
- Slide 15 (Módulos e Makefiles): o PT ligava a `14_makefiles.pdf`, o EN a
  `15_makefiles.pdf`. Ficou `15_makefiles.pdf`.
- Exame modelo: há uma versão PT (`exame_modelo.pdf`) e uma EN (`exam_model_en.pdf`);
  aparecem as duas.
- Resultados da AP2: o original liga a `PI2425_avalprat_1junho2026.pdf` (prefixo do
  ano anterior). Ficou `PI2526_avalprat_1jun2026.pdf`, o PDF do aviso de 1 de junho.
- Gralhas corrigidas (Progarmação, Theorectical, Pratical, Kernigham, Addictional,
  Algortimos fundamentas, especifições, Eroos…) e resto de HTML visível em `home_pt`.
- Programa: o PT tem 12 pontos e o EN 11 (falta "Algoritmos numéricos e
  semi-numéricos elementares"). Ficou como no original, em cada língua.

## A confirmar com os docentes

- As datas das interrupções e as horas das avaliações práticas (ver acima).
- Se o link de resultados da AP2 está certo.
- `today: "2026-04-16"` no `course.js` congela o dia para demonstração; num site
  real apaga-se.
