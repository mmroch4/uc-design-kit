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
| `praticas/aulaNN(_pt).html` | `praticas/aulaNN(_pt).html` | 24 guiões (um ficheiro por língua) dentro de `<uc-guide>`, ligados a partir das semanas |
| `praticas/aula01-instalacao.html`, `aula01-configuracao_wsl.html` | iguais | Copiados com o estilo do kit |
| `praticas/teste_pratico1/2.html` | iguais | `<uc-assessment-info>` no topo (data, turnos, duração, local, `.ics`) |
| `praticas/problems/` | `praticas/problems/` | 112 enunciados; os bilingues ficam com uma secção por língua. Índice com `<uc-problems filters track>`, por aula, com o prazo e o peso de cada problema |
| `praticas/ajuda.html`, `commands.html` | iguais | Copiados com o estilo do kit |
| `codigo/` | `codigo/` | Páginas de código com `<uc-code>`; os ficheiros `.c`/`.h` copiados |
| `apontamentos/*.pdf`, `praticas/1_intro_c.pdf` | iguais | Copiados; os slides em Materiais com `<uc-materials>` |
| — | `sumarios.html` | Página nova com `<uc-summaries search>`, sumários PT e EN |

## Como foi copiado

Fase 1 (16–17 nov 2026): páginas principais, a partir do texto recolhido no browser.
Fase 2 (17 nov 2026): `wget` no portátil do Miguel, um pedido de cada vez com
pausa de 2 s, sem a pasta `evaluation/` (233 ficheiros). As páginas foram
convertidas por um script (BeautifulSoup): sem estilos inline, tabelas em
`.uc-table`, imagens com `loading="lazy"`, ligações absolutas ao site original
passadas a relativas.

### Ficou ligado ao original ou de fora

- `evaluation/*`: dados de alunos (resultados, presenças, turnos, salas).
- Já partidos no original (404/403 na descarga), por isso sem ligação:
  `apontamentos/14_makefiles.pdf`, `codigo/thanoi.c`, `codigo/contacts.c`,
  `codigo/fastSorting.html`, `problems/pi012_pt.html`, `problems/pi015_pt.html`
  (403), imagens `pi071.jpg`, `pi072.jpg`/`pi072.ppg`.
- CSS e `latexit.js` do original: substituídos pelo kit.

## Correções feitas ao conteúdo

- Datas de interrupções: os sumários e as práticas tinham datas diferentes. Ficou
  Páscoa 30 mar–3 abr, Atividades FCUP 7–9 abr e Queima 4–8 mai.
- Hora das avaliações práticas: a página inicial dá 14:15 (AP1) e 14:10 (AP2), as
  práticas dão 14:00. Ficou a da página inicial. As páginas dos testes dão os turnos
  14:15–16:05 e 16:15–18:05 (AP1, 1h45) e 14:10–16:05 e 16:10–18:05 (AP2, 2 h); a ficha
  diz "turnos de 90 minutos". Em `course.js` ficaram os turnos das páginas dos testes.
- Prazos de submissão dos problemas: tirados dos guiões (aulas 3 a 12), em
  `course.js` como `kind: "submission"`. Os guiões não dão hora.
- Problema PI030: o índice original diz "extra", o guião da aula 7 diz "main". Ficou o guião.
- Slide 10 com data "23/04/2025": ficou 23/04/2026.
- Slide 15 (Módulos e Makefiles): o PT ligava a `14_makefiles.pdf`, o EN a
  `15_makefiles.pdf`. Ficou `15_makefiles.pdf`.
- Exame modelo: há uma versão PT (`exame_modelo.pdf`) e uma EN (`exam_model_en.pdf`);
  aparecem as duas.
- Resultados da AP2: o original liga a `PI2425_avalprat_1junho2026.pdf` (prefixo do
  ano anterior). Ficou `PI2526_avalprat_1jun2026.pdf`, o PDF do aviso de 1 de junho.
- Gralhas corrigidas (Progarmação, Theorectical, Pratical (nos títulos dos guiões), Kernigham, Addictional,
  Algortimos fundamentas, especifições, Eroos…) e resto de HTML visível em `home_pt`.
- Programa: o PT tem 12 pontos e o EN 11 (falta "Algoritmos numéricos e
  semi-numéricos elementares"). Ficou como no original, em cada língua.

## Curadoria com o kit (17 nov 2026)

O HTML feito à mão foi trocado pelos componentes e blocos do kit:

- **Nota de origem**: a frase no fim das 112 páginas e as linhas "Copyright © DCC" deram lugar a `source` no `course.js` e a `<uc-page source="…">` (o URL de cada página no site original), mostrados no rodapé.
- **Migalhas e cabeçalhos**: `nav.uc-crumbs`, `div.uc-page-header` e `p.uc-eyebrow`, sem `style=`.
- **Línguas**: os links "English version" / "Versão em português" passaram a `<link rel="alternate" hreflang>` no `<head>`; o botão de língua abre o outro ficheiro (guiões e os enunciados PI011, PI013, PI014).
- **Guiões**: um `<uc-exercise>` por "Exercício N)", dicas em `details.uc-hint`, a lista de submissão em `<uc-problems track>` com o prazo do `course.js` (`data-deadline="aulaNN"`), o parágrafo sobre ajuda e LLMs num `uc-callout`, o logótipo do Mooshak como etiqueta, e `<uc-guide week-label prev next>` (semana por cima do título, ligações para os guiões vizinhos).
- **Enunciados**: `<uc-problem code judge deadline track>` por baixo do título (selo do Mooshak, prazo, Submeter, Resolvido partilhado com as listas) e os exemplos de entrada e saída em `uc-samples` com `pre data-copy`. As tabelas de chamadas de funções (PI053–057, PI070–072) ficaram tabelas.
- **Semanas**: os sumários deixaram de estar repetidos em cada semana; ficou uma ligação para `sumarios.html#aula-N`.
- **Testes práticos**: sem a data, os turnos e a duração repetidos (já estão no `<uc-assessment-info>`); informações num `dl.uc-facts`; problemas de treino em `<uc-problems track>`.
- **Código**: `codigo/index.html` em `<uc-materials>`; widgets nas páginas de ordenação (`uc-widget-sort`), recursão (`uc-widget-recursion`, Hanói), lista ligada (`uc-widget-list`), pilha e filas (`uc-widget-stack-queue`).
- **Sobre, materiais, avaliação**: `ol.uc-steps`, `ul.uc-tags`, livros em `uc-card` com `uc-tag`, cartões de progresso em `uc-links--grid`.
- **Perguntas de verificação** (18 nov): as perguntas 1.1 a 1.3 da aula 5 (atribuições com apontadores, `printf`/`scanf`, aritmética de apontadores) passaram a `<uc-question>`, com respostas e explicações escritas por nós (o original não as tinha). Nas aulas 2, 6 e 9 não há perguntas de escolha múltipla: são exercícios de simular, descrever ou programar.
- **theme.css**: de 87 linhas para uma regra; as outras já não eram usadas.
- **Erros do original corrigidos**: "weigth", "Ouput", "Exercício" nos guiões em inglês, gralhas em PT (genuíno, problema, valor, produzindo…), a página de ajuda do Mooshak que falava de Java e de Estruturas de Dados. Ficheiros sem uso apagados (mooshak.gif, en.png, pt.png, duas imagens em `images/`). `contacts.c` e `thanoi.c` não existiam no original e saíram da lista de código.

## A confirmar com os docentes

- As datas das interrupções e as horas das avaliações práticas (ver acima).
- Se o link de resultados da AP2 está certo.
- `today: "2026-04-16"` no `course.js` congela o dia para demonstração; num site
  real apaga-se.
