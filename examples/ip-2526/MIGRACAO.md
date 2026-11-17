# Migração: Introduction to Programming 2025/26

Site original: <https://www.dcc.fc.up.pt/~pribeiro/aulas/ip2526/> (Pedro Ribeiro e
Bernardo Portela, DCC/FCUP). Só em inglês, por isso o exemplo também é só em inglês
(`languages: ["en"]`). O conteúdo não é MIT: ver `NOTICE.md`.

## Estado

**Migração parcial.** O conteúdo foi recolhido do browser antes de o servidor do DCC
começar a recusar ligações (16–17 nov 2026, por excesso de pedidos de várias
migrações em paralelo). As páginas que não foi possível descarregar ligam ao site
original com endereço absoluto, como manda o processo de migração; quando o servidor
voltar a responder, basta convertê-las e trocar os links para caminhos relativos.

## Inventário

| Página antiga | Destino | Tratamento | Estado |
| --- | --- | --- | --- |
| `index.html` | `index.html` | Reescrita com componentes (`uc-hero`, `uc-this-week`, `uc-notices`, `uc-deadlines`, `uc-team`) | Feita |
| `info.html` | `about.html` | Reescrita (objetivos, competências, programa) | Feita |
| `plan.html` | `weeks.html` | Reescrita com `uc-weeks` (13 semanas + Atividades FCUP) | Feita (ver nota) |
| `evaluation.html` | `assessment.html` | Reescrita; datas em `course.js` | Feita |
| `material.html` | `materials.html` | Reescrita; notebooks continuam no Google Colab | Feita |
| `exam.html` | `exam.html` | Copiada dentro de `uc-content` | Feita |
| `practical/test1.html` | `practical/test1.html` | Reescrita (um cartão por exercício) | Feita |
| `practical/class01.html` | `practical/class01.html` | Reescrita com `uc-guide` e `uc-exercise` | Feita |
| `practical/class05.html` | `practical/class05.html` | Reescrita com `uc-guide` e `uc-exercise` | Feita |
| `practical/class02–04.html`, `class06–11.html` | — | Link para o original | **Por descarregar** |
| `practical/test2.html` | — | Link para o original | **Por descarregar** |
| `problems/ipNNN.html` (enunciados) | — | Link para o original | **Por descarregar** |
| `images/*` (ilustração do cabeçalho, ícones, xkcd, capturas do Mooshak) | — | De fora; `TODO` em `index.html` e `class01.html` | **Por descarregar** |
| `evaluation/*` (notas, salas, turnos, exames anteriores) | — | De fora: dados de estudantes e acesso autenticado; link para o original | Fica de fora |

## Decisões e notas

- **Calendário reconstruído.** O `plan.html` original só tinha as teóricas T01–T08 e as
  práticas P01–P03, seguidas de “(...)”. As restantes semanas foram distribuídas a
  partir das datas das notícias (publicação de cada notebook e de cada guião) e das
  datas das aulas práticas indicadas nos guiões (P01: 22–26 set; P05: 20–24 out).
  Confirmar com os docentes.
- **Pausa de 27 a 31 de outubro** (Atividades FCUP), a mesma do exemplo de EDados.
- **Prazos de submissão.** Só são conhecidos os das aulas 1 (11 out) e 5 (8 nov).
  Os das outras aulas estão nos guiões por descarregar (`TODO` em `course.js`).
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

## Por fazer quando o servidor responder

1. Descarregar o site (sem `evaluation/`): `wget -r -np -nH --cut-dirs=3 -p --wait=2 …`.
2. Converter `class02–04`, `class06–11` e `test2` com o mesmo modelo de `class01`/`class05`.
3. Copiar `problems/ipNNN.html` para `problems/` dentro de `uc-content`, com imagens,
   e criar `problems/index.html`.
4. Trocar os links absolutos `…/ip2526/practical/…` e `…/ip2526/problems/…` por
   relativos, e acrescentar os prazos em falta a `course.js`.
5. Copiar as imagens (xkcd na página inicial, capturas do Mooshak em `class01`).
