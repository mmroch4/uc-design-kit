# Instruções para assistentes de programação

Esta pasta é o site de uma unidade curricular feito com o UC Design Kit.
Estas instruções são para assistentes como o Claude Code, o Codex ou o
Copilot, que as leem antes de mexer nos ficheiros. O professor pode ignorá-las.

## Antes de começar

Ler a documentação do kit, toda num ficheiro:
https://uc-design-kit.miguelrocha.dev/llms-full.txt

Se não houver acesso à Internet, pedir ao professor que descarregue esse
ficheiro para esta pasta. Não escrever código do kit de memória: os nomes dos
elementos, atributos, campos do `course.js` e classes estão nessa documentação.

## Regras

1. Site estático: HTML, CSS e JavaScript em ficheiros. Sem frameworks, npm,
   compilação nem módulos ES. As páginas têm de funcionar abertas do disco.
2. O `<head>` de cada página segue o de `index.html`: `uc-kit.css` do kit,
   `theme.css`, `course.js` sem `defer`, `uc-kit.js` com `defer`, e só depois
   os scripts próprios com `defer`.
3. Uma página é um `<uc-page>` com todo o conteúdo dentro e um único `<h1>`.
4. O que muda todos os anos vai para o `course.js` (`semester`, `team`,
   `schedule`, `deadlines`, `notices`, `pages`), com datas em ISO
   (`AAAA-MM-DD`). As datas das semanas nunca se escrevem: cada `<uc-week>` só
   leva `n` e `title`. O horário e o atendimento nunca são tabelas escritas à
   mão: `schedule` e `team[].officeHours`, mostrados por `<uc-timetable>`.
   Data, hora, turnos, duração e salas de uma prova vão no prazo
   (`duration`, `location`, `shifts`) e mostram-se com `<uc-assessment-info>`.
5. Só o que está documentado. Nada de elementos, atributos, campos ou classes
   `uc-…` inventados. Um comportamento que o kit não tem vai para um componente
   próprio em `extensions/`, com `UC.define`.
6. Nunca editar nem copiar os ficheiros do kit; nunca usar `!important`.
   Personalizar com `accentColor`, depois tokens `--uc-…` no `theme.css`.
7. Links relativos com o nome do ficheiro (`semanas.html`), nunca `/` no início.
8. Acessível: texto alternativo nas imagens, títulos sem saltar níveis, texto
   de ligação que diga para onde vai, tabelas com cabeçalhos.
9. Sem dados de estudantes: notas, números, nomes em listas de turnos ou
   presenças ficam fora do site público. Um link para uma página que pede
   login (pautas, SIGARRA) leva `data-auth` (ou `data-auth="SIGARRA"`), sem
   imagem de cadeado: o kit acrescenta-a.
10. Se faltar uma informação, escrever `<!-- TODO: … -->` em vez de a inventar.
11. O `course.js` só tem valores: comentários, constantes (`const NOME = …;`)
    e uma única atribuição `window.UC_COURSE = { … };`. Objetos, listas,
    textos, números, `true`, `false`, `null`; uma constante, `+` entre textos
    e `${NOME}` dentro de `` ` ``. Nada de funções, `new Date()`, chamadas,
    `...` nem outras atribuições: o `uc-site.py` lê-o sem o executar.
12. Depois de mexer no site, correr `python3 uc-site.py check` nesta pasta e
    corrigir todos os `ERRO` (e os `AVISO` que forem do que se alterou). Nunca
    editar o `uc-site.py` nem o `search-index.js` (é gerado: com
    `search: true` no `course.js`, `python3 uc-site.py` reescreve-o).
13. Para mostrar um algoritmo ou uma estrutura de dados passo a passo
    (ordenação, pesquisa, árvore binária de pesquisa, lista ligada, pilha e
    fila, recursão, heap, árvore AVL, tabela de dispersão, BFS e DFS,
    caminhos mais curtos, crescimento de funções…), usar um widget
    da biblioteca em vez de escrever um componente: uma linha
    `<script src="https://uc-design-kit.miguelrocha.dev/widgets/v1/uc-widget-sort.js" defer></script>`
    depois do kit e o elemento (`<uc-widget-sort values="5 2 9 1" algorithm="insertion">`)
    com, lá dentro, um texto com o resultado para quem não tem JavaScript.
    Os widgets existentes estão no catálogo
    (https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/index.html).
14. Pesquisa: com `search: true` no `course.js` o cabeçalho tem o botão
    «Pesquisar» sobre o `search-index.js`. Para pesquisar só numa parte do
    site, dentro de uma página, `<uc-search scope="problemas/">` (o caminho é
    relativo ao `course.js`). Partes de uma página que não devem aparecer nos
    resultados (soluções, texto repetido) levam `data-search-ignore`; uma
    página inteira, `<uc-page search="noindex">`; pastas, `search.exclude` no
    `course.js`. Depois de mudar páginas, `python3 uc-site.py` (sem `check`)
    reescreve o índice.

## Migrar um site antigo

Quando o professor pede para passar um site existente para esta pasta:

1. **Não alterar o site antigo.** Só ler. Todo o trabalho fica nesta pasta.
2. **Inventário.** Listar todas as páginas e ficheiros do site antigo
   (PDF, imagens, código, zip) e escrever `MIGRACAO.md` com uma tabela:
   ficheiro antigo, destino novo, tratamento (reescrever com componentes,
   copiar dentro de `uc-content`, copiar tal como está, deixar de fora) e
   porquê.
3. **Perguntar antes de decidir.** Juntar numa única mensagem as dúvidas que
   mudam o resultado: o ano letivo e o início do semestre, se não forem
   claros; páginas que parecem desatualizadas; o que fazer com páginas com
   dados de estudantes; links externos que já não funcionam. Esperar pela
   resposta.
4. **`course.js` primeiro**: código, título, edição, `semester` (início, fim,
   interrupções), `team` (com `officeHours`), `schedule`, `deadlines`,
   `notices`, `pages`, `platforms`.
5. **Reescrever com componentes** só as páginas que os estudantes usam todas
   as semanas:
   - página inicial → `index.html` (`uc-hero`, `uc-this-week`, `uc-notices`,
     `uc-deadlines`, `uc-team`);
   - calendário e planeamento → `semanas.html` (`uc-weeks` com uma
     `uc-week` por semana; os prazos do `course.js` aparecem sozinhos na
     semana certa). Um planeamento com uma página por aula → `<uc-weeks
     view="compact">` e `href` em cada `uc-week`;
   - sumários das aulas (e planos aula a aula com datas futuras) → a lista
     numerada dentro de `<uc-summaries>`, com a data de cada aula num
     `<time datetime="AAAA-MM-DD">` no início do item;
   - horários e atendimento → `uc-timetable` (uma entrada de `schedule` por
     aula semanal; os docentes vêm de `team[].classes`) e `uc-team`;
   - avaliação → `avaliacao.html`; a fórmula e os pesos da nota → a lista
     dentro de `<uc-grading>` (peso em `<data>`, `data-code` em cada item);
   - página de um teste ou exame → `<uc-assessment-info deadline="…">` no
     topo, com o resto da página dentro;
   - materiais de cada aula → a lista dentro de `<uc-materials>` (título,
     depois os links; a data da última alteração num `<time datetime>` no
     início do item; `data-type="slides"` nos diapositivos em PDF);
   - listas de problemas → `<uc-problems>`, uma `<section data-deadline="…">`
     por série com `data-judge` em cada `<li>`; os juízes vão para
     `platforms` com `id` (e `hidden: true` se não forem para o menu);
   - listas longas de ligações (juízes, outras cadeiras, recursos externos)
     → `<ul class="uc-links uc-links--grid">`;
   - classificações e tabelas que se querem ver por outra ordem →
     `<table data-sortable>` dentro de `.uc-table` (`data-sort-default`,
     `data-no-sort`, `data-sort-fixed` na linha de totais);
   - "última atualização" escrita à mão numa página → `<uc-page
     updated="AAAA-MM-DD">` (ou `updated="auto"`), não texto no HTML;
   - links "anos anteriores" → `editions.js` na pasta acima dos anos e
     `editions: "../editions.js"` no `course.js` (não links à mão);
   - guiões de aula → `uc-guide` com `uc-exercise`; código → `uc-code`.
6. **O resto** (enunciados, páginas de ajuda, textos longos) vai quase como
   está, dentro de `<uc-page>` e de `<div class="uc-content">`, que dá forma a
   HTML sem classes. Tirar o estilo antigo (`<font>`, `style=""`, tabelas de
   layout, CSS do site antigo), manter o conteúdo e os títulos.
7. **Ficheiros**: copiar PDF, imagens e código para subpastas
   (`docs/`, `img/`, `codigo/`…), mantendo os nomes, e corrigir os links para
   caminhos relativos. Um link para uma página que fica de fora aponta para o
   site antigo, com endereço absoluto.
8. **Verificar** antes de dizer que acabou:
   - `python3 uc-site.py check` termina sem `ERRO` (links e imagens locais,
     `course.js`, `<head>` de cada página, ids, `<h1>`, `alt`, permissões);
   - cada página tem o `<head>` da regra 2 e um `<uc-page>`;
   - se for possível abrir um browser, abrir cada página e confirmar que a
     consola não tem erros nem avisos `[uc-kit]`; `?today=AAAA-MM-DD` no
     endereço simula um dia do semestre;
   - nenhum dado de estudantes foi copiado;
   - no fim, `python3 uc-site.py` (sem `check`) escreve o índice da
     pesquisa com as páginas novas.
9. **Relatório**: completar `MIGRACAO.md` com o que ficou feito, os `TODO`
   que ficaram nas páginas e o que o professor tem de confirmar.

Exemplo real de uma migração (EDados 2025/26):
https://uc-design-kit.miguelrocha.dev/docs/pt/exemplos/edados.html#migracao
