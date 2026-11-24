# Classes CSS estáveis

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/referencia/classes.html

As classes que um `theme.css` pode usar (nível 2 de personalização) sem medo de que mudem dentro da versão 1. Reúne numa página as tabelas "Personalizar" de cada componente e as classes dos blocos.

## O que é estável

- **Estáveis** são as classes desta página: o nome e o elemento a que se aplicam. Mudar uma delas é uma alteração incompatível e só acontece numa nova versão principal (`kit/v2/`).
- Os nomes seguem o padrão `bloco__elemento--variante`: `uc-week` é o componente, `uc-week__title` uma parte dele, `uc-week--current` um estado.
- Os seletores do kit têm especificidade zero (`:where()`), por isso qualquer regra do `theme.css` ganha, mesmo só com uma classe. Ver [Nível 2: CSS livre](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/css.md#especificidade).
- **Não** são estáveis: as classes da lista [Internas](#internas), a ordem exata dos elementos gerados, as classes `hljs-*` do realce de código e os valores das propriedades (espaços, tamanhos), que podem ser afinados numa versão de correção. Para mudar valores, os [tokens](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/tokens.md) são o caminho mais seguro.

`theme.css`:

```css
/* Stable classes only: survives every v1 update. */
.uc-week__title { text-transform: uppercase; }
.uc-week--current .uc-week__number { color: var(--uc-color-accent); }
.uc-deadlines__item--past { opacity: 0.6; }
```

## Componentes

Uma tabela por componente, igual à da secção "Personalizar" da sua página (o `npm run build` copia-as daí). Nas células, `__x` e `--x` continuam o nome anterior: `.uc-code__button, --copy` são `uc-code__button` e `uc-code__button--copy`.

### [`<uc-page>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-page.md)

| Classe | Elemento |
| --- | --- |
| `.uc-page`, `.uc-page--full`, `.uc-page--top` | A página (o próprio `<uc-page>`), a variante sem navegação e a variante com a navegação no topo. |
| `.uc-page--nav-open` | A página com o menu aberto, em ecrãs estreitos. |
| `.uc-header`, `.uc-header__inner` | O cabeçalho e a sua faixa centrada. |
| `.uc-brand`, `__logo`, `__title`, `__edition` | O link com o logótipo, o nome do curso e o ano letivo. |
| `.uc-header__meta`, `.uc-header__institution` | O lado direito do cabeçalho e a instituição. |
| `.uc-lang-switch`, `__button` | Os botões para mudar de língua. |
| `.uc-search-button`, `--pending`, `__label`, `__hint` | O botão «Pesquisar» (sites com pesquisa), o lugar guardado enquanto o kit pergunta se o índice existe, o texto e o atalho `Ctrl K`. |
| `.uc-target-flash` | O destaque de 2 segundos no destino de uma ligação `#…` ao abrir a página. |
| `.uc-page__editions`, `.uc-page__editions-button`, `.uc-page__editions-menu` | "Outros anos": o contentor, o botão e a lista de edições. |
| `.uc-page__edition-notice` | O aviso no topo de uma edição antiga (um `uc-callout`). |
| `.uc-shell` | A grelha com a navegação e o conteúdo. |
| `.uc-sidebar`, `.uc-nav` | A coluna da navegação e o `<nav>` dentro dela. |
| `.uc-topnav` | Com `layout="top"`, a faixa por baixo do cabeçalho que contém a `.uc-sidebar`. |
| `.uc-page--banner`, `.uc-banner`, `.uc-banner__inner`, `.uc-banner__hero` | Com `layout="banner"`: a página, a faixa da cor do curso (com o `.uc-header` dentro), a sua parte centrada com a apresentação e a `.uc-sidebar`, e o lugar do `<uc-hero>`. |
| `.uc-page--docs`, `.uc-toc`, `.uc-toc-toggle`, `.uc-toc-toggle__label`, `.uc-toc-toggle__count`, `.uc-toc-toggle__chevron`, `.uc-page--toc-open` | Com `layout="docs"`: a página, a coluna "Nesta página" (com o progresso de um `<uc-guide>` no topo), o botão que a abre a 1200 px ou menos (texto, número de secções e seta) e a classe da página enquanto a lista está aberta. |
| `.uc-toc__nav`, `.uc-toc__label`, `.uc-toc__list`, `.uc-toc__item`, `.uc-toc__item--sub`, `.uc-toc__link` | O `<nav>` "Nesta página", o seu rótulo, a lista, cada entrada (`--sub` para um `h3`) e a ligação (a da secção à vista tem `aria-current="location"`). |
| `.uc-page--centered` | Com `layout="centered"`: a página. A estrutura é a do `top` (`.uc-topnav` por baixo do `.uc-header`), com o cabeçalho e a navegação centrados e o conteúdo numa coluna de `--uc-reading-max`. |
| `.uc-page--panel`, `.uc-panel`, `.uc-panel__brand` | Com `layout="panel"`: a página, a barra de altura total (o primeiro filho da `.uc-shell`, com o cabeçalho, a `.uc-sidebar` e o resumo do horário) e o `.uc-header` dentro dela. |
| `.uc-panel__info`, `.uc-panel__label`, `.uc-panel__list` | O resumo do horário no fundo da barra: cada título ("Teóricas", "Atendimento") e a lista de horas. O bloco "office-hours" do layout `aside` usa as mesmas classes. |
| `.uc-page--aside`, `.uc-aside`, `.uc-aside__heading`, `.uc-aside__office-hours`, `.uc-aside__platforms` | Com `layout="aside"`: a página, a coluna de blocos (um `<aside>` depois do `<main>`; cada filho é um cartão), o título dos blocos que o kit escreve e os blocos "office-hours" e "platforms". |
| `.uc-page--onepage`, `.uc-anchors`, `.uc-anchors__list`, `.uc-anchors__item`, `.uc-anchors__pages`, `.uc-anchors__link` | Com `layout="onepage"`: a página, a barra (o `<nav>` entre o `.uc-header` e a `.uc-shell`), a lista das secções e cada entrada, a lista das outras páginas e cada ligação das duas listas (a da secção à vista tem `aria-current="location"`). A altura da barra é `--uc-anchors-height` (48 px). |
| `.uc-nav__list`, `__link`, `__group` | As listas de links, cada link e o título "Plataformas". |
| `.uc-nav-toggle` | O botão "Menu" dos ecrãs estreitos. |
| `.uc-main` | O `<main>` com o conteúdo do professor. |
| `.uc-footer`, `__text`, `__updated`, `__source` | O rodapé, o texto à esquerda, a data de atualização e a nota de origem (numa linha própria). |
| `.uc-skip-link` | O link "Saltar para o conteúdo", visível só com o foco do teclado. |

### [`<uc-hero>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-hero.md)

| Classe | Elemento |
| --- | --- |
| `.uc-hero` | O bloco (o próprio `<uc-hero>`), uma coluna com espaço entre as linhas. |
| `.uc-hero__code` | O código do curso. |
| `.uc-hero__title` | O `<h1>` com o nome. |
| `.uc-hero__tagline` | A descrição, com no máximo 640 px de largura. |
| `.uc-hero--center` | O bloco centrado (`align="center"` ou `--uc-hero-align: center` no tema). |

### [`<uc-tiles>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-tiles.md)

| Classe | Elemento |
| --- | --- |
| `.uc-tiles` | O próprio `<uc-tiles>`. |
| `.uc-tiles__list`, `.uc-tiles__item` | A lista (uma grelha de colunas de pelo menos 240 px) e cada item. |
| `.uc-tiles__link`, `.uc-tiles__link--now` | O cartão, uma ligação com a classe `uc-card`; `--now` no cartão das semanas durante o semestre. |
| `.uc-tiles__title`, `.uc-tiles__meta`, `.uc-tiles__text` | O nome da página, a semana atual (só no cartão das semanas) e a frase de `description`. |

### [`<uc-search>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-search.md)

| Classe | Elemento |
| --- | --- |
| `.uc-search`, `__label`, `__field` | O próprio `<uc-search>`, o rótulo e o campo. |
| `.uc-search__input` | O campo de pesquisa, aqui e na janela. |
| `.uc-search__results`, `__group`, `__group-label` | A lista de resultados, cada grupo (uma página, os prazos, os avisos) e o seu título. |
| `.uc-search__option`, `__title`, `__text` | Um resultado (uma ligação), o seu título e o excerto. |
| `.uc-search__mark` | Uma palavra encontrada, destacada. |
| `.uc-search__message`, `__status`, `__retry` | «A carregar…» ou «Sem resultados» (no campo), a mesma linha na janela, e o botão «Tentar de novo». |
| `.uc-search-dialog`, `__bar`, `__close`, `__body` | A janela do botão «Pesquisar»: a barra com o campo, o botão «Fechar» e a zona dos resultados. |
| `.uc-search-dialog__footer`, `__date`, `__keys` | O rodapé da janela: a data do índice e as teclas. |

### [`<uc-notices>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-notices.md)

| Classe | Elemento |
| --- | --- |
| `.uc-notices` | O próprio `<uc-notices>`. |
| `.uc-notices__section`, `__heading` | A secção e o seu título. |
| `.uc-notices__list`, `__item` | A lista e cada aviso. |
| `.uc-notices__item--new` | Um aviso com a etiqueta "Novo". |
| `.uc-notices__date` | A data, à esquerda. |
| `.uc-notices__body`, `__text`, `__details` | O texto do aviso e a segunda linha. |
| `.uc-notices__badge` | A etiqueta "Novo". |
| `.uc-notices__earlier`, `__summary` | O bloco "Avisos anteriores (n)" e a linha que o abre. |
| `.uc-notices__more` | O conteúdo escrito dentro do elemento. |
| `.uc-notices__empty` | A frase "Ainda não há avisos.". |

### [`<uc-deadlines>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-deadlines.md)

| Classe | Elemento |
| --- | --- |
| `.uc-deadlines`, `.uc-deadlines--table` | O próprio `<uc-deadlines>`; o modificador na vista de tabela. |
| `.uc-deadlines__section`, `__heading` | A secção e o seu título. |
| `.uc-deadlines__list`, `__item` | A lista e cada prazo. |
| `.uc-deadlines__item--past`, `--unscheduled` | Prazo que já passou; prazo sem data. |
| `.uc-deadlines__row` | Cada linha da tabela. |
| `.uc-deadlines__row--done`, `--next`, `--scheduled`, `--toBeScheduled` | Estado da linha. |
| `.uc-deadlines__date`, `__time` | A data e a hora. |
| `.uc-deadlines__body`, `__title` | O texto do prazo (lista) e o título (lista e tabela). |
| `.uc-deadlines__note`, `__links` | A nota e as ligações extra. |
| `.uc-deadlines__details`, `__status` | As colunas "Informação" e "Estado" da tabela. |
| `.uc-deadlines__none` | O travessão de uma célula vazia. |
| `.uc-deadlines__more` | O conteúdo escrito dentro do elemento. |
| `.uc-deadlines__empty` | A frase "Não há datas marcadas.". |

### [`<uc-date>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-date.md)

| Classe | Elemento |
| --- | --- |
| `.uc-date` | O próprio `<uc-date>`; a data fica num `<time>` lá dentro. |

### [`<uc-weeks>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-weeks.md)

| Classe | Elemento |
| --- | --- |
| `.uc-weeks` | O contentor (o próprio `<uc-weeks>`). |
| `.uc-weeks__actions` | O parágrafo do topo com o botão. |
| `.uc-weeks__go` | O botão "Ir para esta semana" (também `.uc-button` e `.uc-button--primary`). |
| `.uc-weeks__break` | O aviso de uma interrupção. |
| `.uc-weeks__break-date` | As datas da interrupção. |
| `.uc-weeks__compact`, `__table` | Vista compacta: a caixa da tabela e a tabela. |
| `.uc-weeks__row`, `--past`, `--current`, `--future` | Vista compacta: a linha de uma semana e o seu estado. |
| `.uc-weeks__dates`, `__topic`, `__status` | Vista compacta: as células das datas, do tema e do estado. |
| `.uc-weeks__deadlines` | Vista compacta: a lista dos prazos por baixo do tema. |
| `.uc-weeks__break-row` | Vista compacta: a linha de uma interrupção. |

### [`<uc-week>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-week.md)

| Classe | Elemento |
| --- | --- |
| `.uc-week` | A semana (o próprio `<uc-week>`). |
| `.uc-week--past`, `--current`, `--future` | Estado em relação a hoje. |
| `.uc-week__summary` | A linha que abre e fecha. |
| `.uc-week__number`, `__title`, `__date` | "Semana 10", o título e o intervalo de datas. |
| `.uc-week__now` | A etiqueta "Esta semana". |
| `.uc-week__body` | O conteúdo escrito pelo professor e os prazos. |
| `.uc-week__page` | O parágrafo com a ligação "Página da aula" (`href`). |

### [`<uc-event>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-event.md)

| Classe | Elemento |
| --- | --- |
| `.uc-event` | O evento (o próprio `<uc-event>`). |
| `.uc-event--past`, `--future` | O último dia do evento já passou, ou ainda não (hoje conta como futuro). |
| `.uc-event__kind` | A etiqueta do tipo (também `.uc-tag`). |
| `.uc-event__title` | O título do prazo (`<strong>`, ou `<a>` com `url`). |
| `.uc-event__date` | A data, a hora ou o intervalo. |
| `.uc-event__note` | A nota do prazo. |
| `.uc-event__link` | Cada ligação de `links`. |

### [`<uc-this-week>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-this-week.md)

| Classe | Elemento |
| --- | --- |
| `.uc-this-week` | O próprio `<uc-this-week>`. |
| `.uc-this-week__card` | O cartão (também `.uc-card` e `.uc-card--accent`). |
| `.uc-this-week__header`, `__heading`, `__meta` | A linha de cima, o título "Esta semana" ou "A seguir" e "Semana 10 · 24–28 nov". |
| `.uc-this-week__week-title` | O título da semana, lido da página de semanas. |
| `.uc-this-week__message` | "O semestre começa a…" ou "O semestre terminou." |
| `.uc-this-week__items`, `__item` | A grelha de linhas e prazos, e cada um deles. |
| `.uc-this-week__label`, `__title`, `__detail`, `__date` | Partes de um item: etiqueta ("Teóricas", "Entrega"), título do prazo, valor ou nota, e data. |
| `.uc-this-week__more`, `__link` | O parágrafo e a ligação "Ver semana 10". |

### [`<uc-summaries>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-summaries.md)

| Classe | Elemento |
| --- | --- |
| `.uc-summaries` | O componente (o próprio `<uc-summaries>`). |
| `.uc-summaries__section`, `__heading` | A secção e o seu título. |
| `.uc-summaries__search` | O parágrafo com o rótulo e o campo de pesquisa. |
| `.uc-summaries__list` | A lista escrita pelo professor. |
| `.uc-summaries__item`, `--last`, `--planned` | Cada aula; a última dada e as previstas. |
| `.uc-summaries__aside`, `__body` | A coluna da data e o resto do item. |
| `.uc-summaries__number` | O número da aula. |
| `.uc-summaries__date` | A data (o `<time>` do professor). |
| `.uc-summaries__week` | A ligação "Semana 7". |
| `.uc-summaries__state` | As etiquetas "Última aula" e "Prevista". |
| `.uc-summaries__break` | A linha de uma interrupção. |
| `.uc-summaries__mark` | O texto realçado pela pesquisa. |
| `.uc-summaries__empty` | A linha "Nenhum sumário encontrado." |

### [`<uc-team>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-team.md)

| Classe | Elemento |
| --- | --- |
| `.uc-team` | O componente (o próprio `<uc-team>`). |
| `.uc-team__section`, `__heading` | A secção e o seu título. |
| `.uc-team__cards`, `__card` | A grelha de cartões (também `uc-grid`) e cada cartão (também `uc-card`). |
| `.uc-team__name` | O nome, link ou texto. |
| `.uc-team__role` | A função e as turmas, num cartão. |
| `.uc-team__contact` | O gabinete e o e-mail. |
| `.uc-team__table` | O contentor da tabela (também `uc-table`). |
| `.uc-team__person`, `__classes` | As células do nome e das turmas, na tabela. |
| `.uc-team__hours`, `__hours-title`, `__hours-list` | O atendimento: o bloco no cartão (ou a célula, na tabela), o título "Atendimento" e a lista de horários. |

### [`<uc-timetable>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-timetable.md)

| Classe | Elemento |
| --- | --- |
| `.uc-timetable` | O componente (o próprio `<uc-timetable>`). |
| `.uc-timetable__section`, `__heading` | A secção e o seu título. |
| `.uc-timetable__filters` | A barra "A minha turma" (também `uc-filters`). |
| `.uc-filters`, `__group`, `__label`, `__select`, `__button` | A barra de filtros, igual em todos os blocos que filtram: cada grupo, o seu rótulo, a lista e os botões. |
| `.uc-timetable__table` | O contentor de cada tabela (também `uc-table`), com `data-type` igual ao tipo. |
| `.uc-timetable__days`, `__room` | Na tabela: as células dos dias e da sala, que não partem a linha. |
| `.uc-timetable__time` | As horas ("14:00–15:00"). |
| `.uc-timetable__note` | A nota de uma aula ou de um atendimento. |
| `.uc-timetable__day`, `__day-heading` | Na vista `days`: cada dia e o seu título. |
| `.uc-timetable__list`, `__item`, `__details` | Na vista `days`: a lista do dia, cada aula e o texto depois da hora. |

### [`<uc-guide>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-guide.md)

| Classe | Elemento |
| --- | --- |
| `.uc-guide` | O guião (o próprio `<uc-guide>`). |
| `.uc-guide--no-aside` | Guião sem índice nem exercícios: a coluna da direita não existe. |
| `.uc-guide__crumbs`, `__crumbs-list`, `__crumb` | O caminho de navegação, a sua lista e cada elemento. |
| `.uc-guide__layout` | A grelha com o conteúdo e a coluna da direita. |
| `.uc-guide__content` | O conteúdo escrito pelo professor. |
| `.uc-guide__aside` | A coluna com o progresso e o índice. |
| `.uc-guide__progress`, `__progress-text`, `__progress-count`, `__progress-bar` | O cartão do progresso, a frase, o número de feitos e a barra. |
| `.uc-guide__week` | A linha "Semana 6 · 20–24 out" de `week-label` (também tem `uc-eyebrow`). |
| `.uc-guide__pager`, `__pager-link`, `__pager-link--prev`, `__pager-link--next` | As ligações para os guiões vizinhos de `prev` e `next`. |
| `.uc-guide__toc`, `__toc-label`, `__toc-list`, `__toc-item`, `__toc-link` | O índice, o rótulo "Nesta página", a lista, cada entrada e a sua ligação (a da secção à vista tem `aria-current`). |

### [`<uc-exercise>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-exercise.md)

| Classe | Elemento |
| --- | --- |
| `.uc-exercise` | O exercício (o próprio `<uc-exercise>`). |
| `.uc-exercise--done` | Exercício marcado como feito. |
| `.uc-exercise__details`, `__summary`, `__body` | O cartão (`<details>`), a linha que abre e fecha e o conteúdo. |
| `.uc-exercise__number`, `__title`, `__chevron` | O círculo com o número (ou o visto), o título e a seta. |
| `.uc-exercise__meta` | As etiquetas à direita do título. |
| `.uc-exercise__level`, `__kind`, `__problem`, `__done-tag` | As etiquetas de nível, de tipo ("Extra", "Desafio"), de problema no Mooshak e "Feito". |
| `.uc-exercise__actions` | A linha do fim, com os botões. |
| `.uc-exercise__submit` | O botão "Submeter no Mooshak". |
| `.uc-exercise__toggle`, `__checkbox` | O botão "Marcar como feito" e a sua caixa. |
| `.uc-hint`, `.uc-solution` | Os blocos de dica e de solução (classes escritas pelo professor). |

### [`<uc-code>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-code.md)

| Classe | Elemento |
| --- | --- |
| `.uc-code` | O bloco (o próprio `<uc-code>`), depois de o kit arrancar. |
| `.uc-code--editable`, `--collapsed` | Bloco editável; bloco recolhível fechado. |
| `.uc-code__header` | O cabeçalho com o nome e os botões. |
| `.uc-code__title` | O nome do ficheiro ou da linguagem. |
| `.uc-code__toggle`, `__chevron` | O botão que mostra e esconde o código e a sua seta. |
| `.uc-code__actions` | O grupo de botões. |
| `.uc-code__button`, `--copy`, `--download`, `--reset` | Copiar, Descarregar e Repor. |
| `.uc-code__run` | O botão Executar ou a ligação "Testar em …". |
| `.uc-code__body`, `__scroll` | A área do código, que desliza na horizontal. |
| `.uc-code__pre`, `__code` | O código mostrado (com as classes `hljs-*` do realce). |
| `.uc-code__editor`, `__input`, `__hint` | No modo editável: a área de edição, o `<textarea>` e a indicação sobre Tab e Esc. |
| `.uc-code__results` | A área do resultado, por baixo do código. |
| `.uc-code__results-summary`, `--passed` | "2 de 3 testes passaram"; a variante quando passam todos. |
| `.uc-code__results-label`, `__results-output`, `--stderr`, `__results-error` | "Resultado" ou "Erro", o texto escrito pelo programa, as mensagens de erro e a falha ao executar. |
| `.uc-code__tests`, `__test`, `--passed`, `--failed` | A lista de testes e cada teste. |
| `.uc-code__test-mark`, `__test-name`, `__test-detail` | O ✓ ou ✗, o nome do teste e "Esperado: … · Obtido: …". |

### [`<uc-question>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-question.md)

| Classe | Elemento |
| --- | --- |
| `.uc-question` | A pergunta (o próprio `<uc-question>`). |
| `.uc-question--solved` | Pergunta respondida corretamente. |
| `.uc-question__tag` | A etiqueta "Verificação rápida". |
| `.uc-question__prompt` | O enunciado. |
| `.uc-question__options` | O grupo de opções (um `<fieldset>`). |
| `.uc-question__option`, `__option--correct` | Cada opção e uma opção certa depois de resolvida. |
| `.uc-question__mark` | O visto que aparece nas opções certas depois de resolvida, para que não se distingam só pela cor. |
| `.uc-question__input`, `__label` | O botão de opção ou a caixa, e o texto da opção. |
| `.uc-question__actions`, `__check` | A linha do botão e o botão "Verificar". |
| `.uc-question__feedback`, `--none`, `--empty`, `--incorrect`, `--correct` | A zona da mensagem e o seu estado. |
| `.uc-question__message`, `__explanation` | A mensagem e a explicação. |

### [`<uc-grading>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-grading.md)

| Classe | Elemento |
| --- | --- |
| `.uc-grading` | O componente (o próprio `<uc-grading>`). |
| `.uc-grading__section`, `__heading` | A secção e o seu título. |
| `.uc-grading__formula` | A fórmula ("Nota = E + AP + P"). |
| `.uc-grading__bar`, `__segment` | A barra das proporções e cada segmento (largura = peso). |
| `.uc-grading__note` | O texto escrito depois de uma fórmula de `data-formulas`. |
| `.uc-grading__bars`, `__bar-label` | Com várias fórmulas: as barras, uma por fórmula, e o rótulo de cada uma ("Fórmula 1"). |
| `.uc-grading__rules` | A lista "Para aprovar". |
| `.uc-grading__table` | A tabela das componentes. |
| `.uc-grading__sub` | As linhas das partes de uma componente, recolhidas. |
| `.uc-grading__calculator`, `__fields`, `__field`, `__error` | O simulador, os campos, cada campo e a sua mensagem de erro. |
| `.uc-grading__result`, `__status` | A nota simulada e a linha do estado ("Aprovado nesta simulação"). |
| `.uc-grading__branches`, `__checks` | Com `data-formulas`: o valor de cada fórmula e a lista das regras verificadas (✓ / ✗). |

### [`<uc-assessment-info>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-assessment-info.md)

| Classe | Elemento |
| --- | --- |
| `.uc-assessment-info` | O componente (o próprio `<uc-assessment-info>`). |
| `.uc-assessment-info__card`, `__heading` | O cartão (também `uc-card`) e o seu título. |
| `.uc-assessment-info__shifts` | A lista dos turnos. |
| `.uc-assessment-info__status` | A etiqueta do estado ("Daqui a 5 dias"). |
| `.uc-assessment-info__note` | A nota do prazo, por baixo da lista. |
| `.uc-assessment-info__calendar` | O botão "Adicionar ao calendário". |

### [`<uc-materials>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-materials.md)

| Classe | Elemento |
| --- | --- |
| `.uc-materials` | O componente (o próprio `<uc-materials>`). |
| `.uc-materials__section`, `__heading` | A secção e o seu título. |
| `.uc-materials__list` | A lista escrita pelo professor. |
| `.uc-materials__item` | Cada aula ou capítulo. |
| `.uc-materials__main`, `__title` | A coluna do título e o título. |
| `.uc-materials__meta`, `__updated`, `__date` | A linha "Atualizado a 24 nov" e a data (o `<time>` do professor). |
| `.uc-materials__new` | A etiqueta "Novo". |
| `.uc-materials__links`, `__link` | Os botões; cada um tem `data-type`. |
| `.uc-materials__empty` | O texto "Sem material". |

### [`<uc-problems>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-problems.md)

| Classe | Elemento |
| --- | --- |
| `.uc-problems` | O componente (o próprio `<uc-problems>`). |
| `.uc-problems__section`, `__heading` | O conteúdo do componente e o título opcional. |
| `.uc-problems__filters` | A barra de filtros (também `uc-filters`). |
| `.uc-problems__series` | Cada `<section>` do professor. |
| `.uc-problems__meta`, `__deadline`, `__progress` | A linha por baixo do título da série: o prazo e "3 de 5 resolvidos". |
| `.uc-problems__list` | A lista de problemas. |
| `.uc-problems__item`, `--solved` | Cada problema; os resolvidos. |
| `.uc-problems__body` | O conteúdo escrito do problema (link, código). |
| `.uc-problems__tags`, `__judge`, `__type` | As etiquetas do juiz e do tipo. |
| `.uc-problems__weight` | O `<data>` do peso. |
| `.uc-problems__languages` | A linha "Testado em", no problema ou na série. |
| `.uc-problems__hints` | O `<details>` das dicas. |
| `.uc-problems__solved` | O rótulo com a caixa "Resolvido". |
| `.uc-problems__empty` | A linha "Nenhum problema com estes filtros." |

### [`<uc-problem>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-problem.md)

| Classe | Elemento |
| --- | --- |
| `.uc-problem` | O próprio `<uc-problem>`, um cartão. |
| `.uc-problem--solved` | O cartão de um problema marcado como resolvido. |
| `.uc-problem__meta` | O selo do juiz e a linha do prazo. |
| `.uc-problem__judge` | O selo "Mooshak PI013" (uma ligação quando a plataforma tem `url`). |
| `.uc-problem__deadline` | A linha "Prazo: …" com a etiqueta do estado. |
| `.uc-problem__actions` | O botão de submeter e a caixa "Resolvido". |
| `.uc-problem__submit` | O botão "Submeter no …". |
| `.uc-problem__solved` | A caixa "Resolvido" (também tem `uc-problems__solved`). |

## Blocos

As classes que se escrevem no HTML para dar forma ao conteúdo. Cada página de blocos explica as variantes e os tokens locais.

| Classes | Página |
| --- | --- |
| `uc-section`, `uc-stack`, `uc-grid`, `uc-split`, `uc-page-header`, `uc-eyebrow`, `uc-crumbs` | [Blocos: layout](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/layout.md) |
| `uc-card`, `uc-card--accent`, `uc-callout`, `uc-callout--warning`, `uc-links`, `uc-links--grid`, `uc-links--inline`, `uc-shortcuts`, `uc-checklist`, `uc-bullets`, `uc-steps`, `uc-tags`, `uc-facts`, `uc-details` | [Blocos: superfícies e listas](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/superficies.md) |
| `uc-button`, `uc-button--primary`, `uc-button--sm`, `uc-tag` e as suas variantes, `uc-table`, `uc-table--fit`, `uc-num`, `uc-samples`, `uc-samples__label`, `uc-copy-block`, `uc-copy-block__button`, `uc-mono`, `uc-muted`, `uc-small`, `uc-visually-hidden` | [Blocos: elementos](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/elementos.md) |
| `uc-lead`, `uc-prose`, `uc-content`, `uc-content__float` | [Tipografia](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/tipografia.md) |

## Internas

O kit também gera estas classes, mas não promete mantê-las: podem mudar de nome ou desaparecer numa versão de correção. Servem para ler o HTML gerado nas ferramentas do browser; num `theme.css`, prefira uma classe estável do mesmo componente.

| Classe | Onde |
| --- | --- |
| `.uc-visible` | `<html>`, quando as letras estão prontas; o `<uc-page>` fica escondido até lá. |
| `.uc-nav-toggle__label` | `<uc-page>`: o texto do botão "Menu" em ecrãs estreitos. |
| `.uc-nav-toggle__current` | `<uc-page>`: o nome da página atual no botão "Menu". |
| `.uc-nav-toggle__chevron` | `<uc-page>`: a seta do botão "Menu". |
| `.uc-footer__inner` | `<uc-page>`: a faixa centrada do rodapé. |
| `.uc-sort-up` | `table[data-sortable]`: a seta para cima do ícone de cada botão de ordenação. |
| `.uc-sort-down` | `table[data-sortable]`: a seta para baixo do mesmo ícone. |
| `.uc-notices__earlier--only` | `<uc-notices>`: "Avisos anteriores" quando não há avisos recentes. |
| `.uc-week__details` | `<uc-week>`: o `<details>` que abre e fecha a semana. |
| `.uc-week__meta` | `<uc-week>`: a etiqueta "Esta semana" e as datas. |
| `.uc-week__chevron` | `<uc-week>`: a seta. |
| `.uc-exercise__heading` | `<uc-exercise>`: o grupo com o rótulo e o título. |
| `.uc-exercise__generated-summary` | `<uc-exercise>`: o `o <summary> criado quando o professor não escreve um.lt;summaryo <summary> criado quando o professor não escreve um.gt;` que o kit cria numa dica ou solução escrita sem um. |

## Ver também

- [Nível 2: CSS livre](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/css.md): especificidade, exemplos e o que evitar.
- [Tokens](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/tokens.md): mudar cores, espaços e cantos sem tocar nas classes.
- [Personalizador de tema](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/tema.md).
