# Migrar um site existente

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/migrar.html

Um assistente de programação, como o Claude Code ou o Codex, consegue passar o site antigo de uma cadeira para o kit: lê as páginas antigas, parte do modelo inicial, distribui o conteúdo pelos componentes e copia os ficheiros. Esta página tem o pedido pronto a colar e o que rever no fim.

## Antes de começar

- **Um assistente que trabalhe com ficheiros**: Claude Code, Codex, o modo agente do GitHub Copilot ou do Cursor. Um assistente de conversa, sem acesso a pastas, serve para uma página de cada vez: ver [Usar com uma LLM](https://uc-design-kit.miguelrocha.dev/docs/pt/llm.md).
- **Uma cópia do site antigo numa pasta**, por exemplo `site-antigo/`. Se só estiver no servidor da faculdade, copiá-la de lá (por `scp` ou pelo gestor de ficheiros). Um site público também se descarrega com o `wget`, mas só as páginas a que há ligações:

```sh
wget --mirror --page-requisites --convert-links --no-parent \
     --directory-prefix=site-antigo https://exemplo.pt/~docente/cadeira/
```

- **O que o site antigo não diz**: o ano letivo novo, o início do semestre, as interrupções e o que muda na equipa ou na avaliação. O assistente pergunta pelo resto.

## Passo a passo

1. Pôr a pasta do site antigo dentro de uma pasta de trabalho vazia e abrir o assistente nessa pasta de trabalho.
2. Colar o [pedido](#pedido), com os nomes e a informação entre parênteses retos.
3. Responder às perguntas. O assistente faz primeiro o inventário do site antigo e pergunta numa só mensagem o que muda o resultado: datas, páginas que parecem desatualizadas, páginas com dados de alunos.
4. Esperar que acabe e [rever](#rever) o resultado: o ficheiro `MIGRACAO.md` diz o que foi feito e o que falta confirmar.
5. Pedir correções na mesma conversa, uma de cada vez, e [publicar](https://uc-design-kit.miguelrocha.dev/docs/pt/publicar.md).

## Pedido

Copiar, completar as partes entre parênteses retos e colar no assistente:

`pedido-migracao.txt`:

```text
Vais migrar o site antigo da unidade curricular [nome da cadeira] para o
UC Design Kit. O site antigo está na pasta [site-antigo/]. Não o alteres.

1. Lê a documentação do kit: https://uc-design-kit.miguelrocha.dev/llms-full.txt
2. Descarrega e descompacta o modelo inicial, e muda o nome da pasta
   uc-template/ para [site-novo/]:
   https://uc-design-kit.miguelrocha.dev/docs/downloads/uc-template.zip
   Lê o AGENTS.md que vem dentro e segue as regras e o processo de migração
   que ele descreve.
3. Faz o inventário do site antigo em [site-novo/]MIGRACAO.md. Antes de
   escrever as páginas, faz-me numa só mensagem as perguntas de que precisas
   e espera pela resposta.
4. Põe no course.js tudo o que muda de ano para ano. Reescreve com os
   componentes do kit a página inicial, as semanas, a avaliação e os guiões;
   as outras páginas vão quase como estão, dentro de <div class="uc-content">.
5. Copia os PDF, as imagens e o código, com links relativos. Não copies notas,
   números nem listas de estudantes.
6. Verifica todos os links e, se puderes, abre as páginas num browser.
   No fim, completa o MIGRACAO.md com o que ficou feito e o que tenho de
   confirmar.

Informação que não está no site antigo:
[ano letivo, início do semestre, interrupções, mudanças na equipa ou na
avaliação]
```

Se o assistente não tiver acesso à Internet, descarregar antes o [`llms-full.txt`](https://uc-design-kit.miguelrocha.dev/llms-full.txt) e o [modelo inicial](https://uc-design-kit.miguelrocha.dev/docs/downloads/uc-template.zip) para a pasta de trabalho e trocar os endereços dos pontos 1 e 2 pelos nomes dos ficheiros.

## Para onde vai cada conteúdo

É a divisão que o `AGENTS.md` pede ao assistente, a mesma da [migração do EDados](https://uc-design-kit.miguelrocha.dev/docs/pt/exemplos/edados.md#migracao): só as páginas que os estudantes abrem todas as semanas são reescritas; o resto muda de aspeto sem mudar de texto.

| No site antigo | No site novo |
| --- | --- |
| Datas do semestre, equipa, prazos, avisos, menu | `course.js`: `semester`, `team`, `deadlines`, `notices`, `pages` |
| Página inicial | `index.html` com [`<uc-hero>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-hero.md), [`<uc-this-week>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-this-week.md), [`<uc-notices>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-notices.md), [`<uc-deadlines>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-deadlines.md) |
| Calendário, planeamento | `semanas.html` com [`<uc-weeks>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-weeks.md) e uma [`<uc-week>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-week.md) por semana, sem datas escritas |
| Planeamento com uma página por aula ("week06.html") | [`<uc-weeks view="compact">`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-weeks.md#vista-compacta) e `href` em cada `<uc-week>` |
| Sumários das aulas, plano aula a aula (T01–T23) | A mesma lista numerada dentro de [`<uc-summaries>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-summaries.md), com a data de cada aula num `<time datetime>` no início do item |
| Avaliação | `avaliacao.html`, com os prazos a vir do `course.js` |
| Fórmula e pesos da nota ("Nota = 0,1 × A + …", "14 valores") | A mesma lista dentro de [`<uc-grading>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-grading.md), com o peso em `<data>` e `data-code`, `data-min` em cada item |
| Página de um teste ou exame (data, turnos, salas, duração) | Os dados no prazo do `course.js` (`duration`, `location`, `shifts`) e [`<uc-assessment-info>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-assessment-info.md) no topo da página |
| Tabela de horários e atendimento | `schedule` e `team[].officeHours` no `course.js`, mostrados por [`<uc-timetable>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-timetable.md) e [`<uc-team>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-team.md) |
| Links com cadeado ou "requer login" (pautas, SIGARRA) | `<a data-auth>` (ou `data-auth="SIGARRA"`), sem imagem de cadeado: o kit acrescenta-a, com texto para leitores de ecrã |
| Materiais de cada aula ou capítulo (diapositivos, notebooks, código) | A mesma lista dentro de [`<uc-materials>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-materials.md): título, links e a data da última alteração num `<time datetime>` no início do item |
| Listas de problemas, séries, juízes (Mooshak, Codeforces) | Uma `<section data-deadline>` por série dentro de [`<uc-problems>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-problems.md), com `data-judge` em cada problema; os juízes em `platforms` (com `id`, e `hidden` se não forem para o menu) |
| Listas longas de ligações (juízes, outras cadeiras, recursos) | `<ul class="uc-links uc-links--grid">`, em colunas (ver [`uc-links--grid`](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/superficies.md#links-grid)) |
| Classificações, rankings | A mesma tabela com [`data-sortable`](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/elementos.md#table-sortable), dentro de `uc-table` |
| "Última atualização" escrita à mão numa página | [`<uc-page updated>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-page.md#data-da-pagina) (uma data, ou `auto`) |
| Links para os anos anteriores | Um [`editions.js`](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#edicoes) na pasta da cadeira e `editions: "../editions.js"` no `course.js` |
| Guiões e fichas das aulas | [`<uc-guide>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-guide.md) com [`<uc-exercise>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-exercise.md) e [`<uc-code>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-code.md) |
| Enunciados, ajudas, textos longos | O mesmo HTML dentro de [`uc-content`](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/html.md#uc-content), sem o estilo antigo |
| PDF, imagens, código | Copiados para subpastas, com os mesmos nomes e links relativos |
| Notas, presenças, turnos com nomes ou números | Fora do site. A página liga ao site antigo ou fica um `TODO` |

## O ficheiro AGENTS.md

O modelo inicial traz um `AGENTS.md`: as regras do kit e o processo de migração, escritos para assistentes. O Codex, o Copilot e o Cursor leem-no sozinhos sempre que trabalham na pasta; ao Claude Code basta dizer "lê o AGENTS.md". Assim, as alterações dos anos seguintes seguem as mesmas regras sem colar o pedido outra vez.

Pode acrescentar-se no fim o que o assistente deve saber sobre a cadeira, como "os guiões ficam em `guioes/`" ou "os avisos são sempre em português e em inglês". Num site feito antes deste ficheiro existir, basta copiá-lo do [modelo inicial](https://uc-design-kit.miguelrocha.dev/docs/downloads/uc-template.zip).

## Rever o resultado

- Ler o `MIGRACAO.md`: as páginas que ficaram de fora e porquê, e os pontos a confirmar.
- Procurar `TODO` nos ficheiros: são as informações que o assistente não encontrou e não inventou.
- Comparar o `semester` e os `deadlines` do `course.js` com o calendário escolar.
- Abrir o `index.html` do disco, com a consola aberta (F12), e acrescentar `?today=` com um dia do semestre ao endereço, como em [Verificar o resultado](https://uc-design-kit.miguelrocha.dev/docs/pt/llm.md#verificar).
- Confirmar que não foi copiado nenhum ficheiro com dados de alunos (folhas de notas, pautas, listas de turnos).
- Guardar o site antigo até o novo estar publicado.

## Ver também

- [EDados 2025/26](https://uc-design-kit.miguelrocha.dev/docs/pt/exemplos/edados.md): um site migrado, página a página. A [PC](https://uc-design-kit.miguelrocha.dev/docs/pt/exemplos/pc.md), a [IP](https://uc-design-kit.miguelrocha.dev/docs/pt/exemplos/ip.md) e a [PI](https://uc-design-kit.miguelrocha.dev/docs/pt/exemplos/pi.md) foram migradas da mesma forma, com o registo em `MIGRACAO.md`.
- [Usar com uma LLM](https://uc-design-kit.miguelrocha.dev/docs/pt/llm.md): construir um site novo ou alterar uma página.
- [Nível 4: HTML livre](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/html.md): o que fazer com HTML antigo.
