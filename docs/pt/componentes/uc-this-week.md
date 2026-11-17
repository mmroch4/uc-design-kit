# `<uc-this-week>`

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-this-week.html

O cartão "Esta semana" da página inicial: número e datas da semana, prazos desta semana e da seguinte e uma ligação para a semana na página de semanas. Num site publicado, mostra também o título e as linhas da semana, lidos dessa página.

Exemplo (cartão da semana 10), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-this-week/basic.html):

```html
<uc-this-week></uc-this-week>
```

Hoje é 27 de novembro de 2025 no curso fictício, na semana 10. O título "Pesquisa binária e árvores" e as linhas Teóricas e Prática vêm da [página de semanas da demonstração](https://uc-design-kit.miguelrocha.dev/docs/demos/semanas.html); a entrega do trabalho 2 vem do `course.js`. Se esta documentação for aberta a partir do disco (`file://`), o cartão mostra só as datas, a entrega e a ligação.

## Utilização

Põe-se o elemento vazio na página inicial. Tudo o resto vem do `course.js` e da página de semanas.

`index.html`:

```html
<uc-page current="home">
  <uc-hero></uc-hero>
  <uc-this-week></uc-this-week>
</uc-page>
```

O cartão precisa do calendário do semestre e de saber qual é a página de semanas, a entrada `weeks` de `pages`:

`course.js`:

```js
window.UC_COURSE = {
  title: "Algoritmos e Programação",
  semester: {
    start: "2025-09-15",
    weeks: 12,
    breaks: [{ start: "2025-10-27", end: "2025-10-31", label: "Semana de estudo" }],
  },
  // "Ver semana 10" links to semanas.html#week-10
  pages: ["home", { id: "weeks", href: "semanas.html" }],
  deadlines: [
    { id: "t2", title: "Entrega do trabalho 2", date: "2025-11-28", kind: "submission" },
  ],
};
```

Na página de semanas, cada semana é uma [`<uc-week>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-week.md) com um `<dl>`: são as suas linhas que o cartão mostra (ver [A página de semanas](#pagina-de-semanas)).

## Exemplos

### Outra página de semanas e conteúdo extra

`source` indica de que página ler as semanas, quando não é a de `pages`. Ao contrário dos `href` de `pages`, é relativo à página onde está o cartão, não ao `course.js`. O que se escrever dentro do elemento aparece no fim do cartão.

Exemplo (cartão com source e uma frase no fim), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-this-week/source.html):

```html
<uc-this-week source="../semanas.html">
  <p class="uc-muted">Dúvidas? Fala connosco nas aulas práticas.</p>
</uc-this-week>
```

### Filtrar prazos por tipo

`kind` mostra só os prazos desses tipos, separados por espaços. Com `kind="assessment exam"`, a entrega do trabalho 2 sai do cartão. Convém quando as linhas da semana já mencionam as entregas, para não as repetir.

Exemplo (cartão só com avaliações e exames), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-this-week/kind.html):

```html
<uc-this-week kind="assessment exam"></uc-this-week>
```

### Antes do semestre

Antes da semana 1, o cartão chama-se "A seguir", diz quando o semestre começa e mostra o primeiro prazo marcado. Esta demonstração abre com `?today=2025-09-01`.

Exemplo (cartão antes do início do semestre), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-this-week/before.html?today=2025-09-01):

```html
<uc-this-week></uc-this-week>
```

### Semana sem aulas

Numa interrupção, o cartão mostra as datas e o nome da interrupção, os prazos das duas semanas seguintes (aqui não há nenhum) e a ligação para a próxima semana de aulas. Esta demonstração abre com `?today=2025-10-29`, na semana de estudo.

Exemplo (cartão durante a semana de estudo), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-this-week/break.html?today=2025-10-29):

```html
<uc-this-week></uc-this-week>
```

### Depois do semestre

Depois da última semana, diz que o semestre terminou e mostra até três prazos que ainda faltam, como o exame. Esta demonstração abre com `?today=2025-12-20`.

Exemplo (cartão depois do fim do semestre), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-this-week/after.html?today=2025-12-20):

```html
<uc-this-week></uc-this-week>
```

## Atributos

| Atributo | Tipo | Por omissão | Descrição |
| --- | --- | --- | --- |
| `source` | URL | a página `weeks` de `pages` | Página de onde ler o título e as linhas da semana atual. Relativa à página onde está o cartão. |
| `kind` | tipos separados por espaços | todos | Só mostra prazos destes tipos, por exemplo `kind="assessment exam"`. |
| `heading-level` | `2` a `6` | `2` | Nível do título gerado: `3` dá um `<h3>`, para quando o componente está dentro de uma secção que já tem um `<h2>`. O aspeto não muda; muda só a estrutura que os leitores de ecrã usam para navegar. |

## Configuração usada

Campos do `course.js` que o componente lê. Sem `semester.start`, o cartão chama-se "A seguir" e mostra só os próximos três prazos.

| Campo | Para quê |
| --- | --- |
| `semester.start`, `semester.weeks` | Saber em que semana se está, ou se o semestre ainda não começou ou já acabou ([semestre](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#campos-semestre)). |
| `semester.breaks` | Reconhecer uma semana sem aulas e mostrar o seu nome ([semestre](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#campos-semestre)). |
| `semester.teachingDays` | Os dias mostrados no intervalo, por exemplo "24–28 nov" ([semestre](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#campos-semestre)). |
| `pages` | A página `weeks`: destino de "Ver semana 10" e, sem `source`, a página lida ([páginas](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#paginas)). |
| `deadlines` | Os prazos desta semana e da seguinte, ou os próximos fora do semestre ([prazos](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#prazos)). |
| `today` | Fixar o dia de hoje; `?today=AAAA-MM-DD` no endereço tem prioridade ([avançado](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#campos-avancado)). |

Sem a página `weeks` em `pages`, o cartão não tem a ligação "Ver semana" (e, sem `source`, não lê nenhuma página). Os `url` e `links` dos prazos são relativos ao `course.js`, como os `href` das páginas.

## A página de semanas: HTTP e `file://`

O título e as linhas da semana atual não estão no `course.js`: estão na página de semanas, escritos uma só vez. Quando o site é servido por HTTP ou HTTPS (publicado, ou com um servidor local), o cartão pede essa página, procura a `<uc-week n="10">` e copia o título (o `title-<lang>` da língua ativa, se existir) e as linhas do `<dl>`: cada `<dt>` passa a etiqueta e os seus `<dd>` o valor. Grupos `<div>` dentro do `<dl>` também servem, e um `lang` num `<dt>` ou `<dd>` mantém-se, por isso o conteúdo bilingue funciona.

Das linhas copiam-se o texto e alguns elementos de texto (`a`, `strong`, `b`, `em`, `i`, `code`, `span`, `time`, `br`); os outros são substituídos pelo seu conteúdo, e os scripts são ignorados. As ligações relativas são corrigidas para continuarem a apontar para o mesmo sítio a partir da página inicial.

| Aberto | O cartão mostra |
| --- | --- |
| Por HTTP ou HTTPS | Semana e datas, título da semana, linhas do `<dl>`, prazos e ligação "Ver semana". |
| A partir do disco (`file://`) | Semana e datas, prazos e ligação "Ver semana". Os navegadores não deixam uma página local ler outra, por isso o pedido nem é feito. |
| Por HTTP, se a página de semanas falhar | O mesmo que em `file://`, sem erro visível. |

A última cópia da página de semanas fica guardada no `localStorage` do navegador. Nas visitas seguintes, o cartão aparece logo completo e não cresce quando o pedido termina; se a página tiver mudado, o cartão atualiza-se. Para ver o cartão completo ao preparar o site no computador, basta um servidor local, por exemplo `python3 -m http.server` na pasta do site.

## Personalizar

Estas classes são estáveis na versão 1 e podem ser usadas num `theme.css`. O método está em [Nível 2: CSS livre](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/css.md); para mudar só cores, cantos ou letra em todo o site bastam os [tokens](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/tokens.md).

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

`theme.css`:

```css
/* Cartão branco com contorno, em vez do fundo na cor do curso. */
.uc-this-week__card {
  background: var(--uc-color-surface);
  border-color: var(--uc-color-border);
}

/* Linhas umas por baixo das outras. */
.uc-this-week__items { grid-template-columns: 1fr; gap: var(--uc-space-4); }
```

O fundo do cartão é `--uc-color-accent-soft`, derivado da cor do curso. Para mudar só a cor, basta `accentColor` no `course.js`.

## Acessibilidade

### O que o componente faz

O cartão é uma `<section>` com o nome do seu título, um `<h2>` "Esta semana" ou "A seguir", por isso aparece na lista de regiões e de títulos dos leitores de ecrã. As datas estão em `<time datetime>` e a ligação diz o número da semana ("Ver semana 10").

### O que cabe a quem escreve

Pôr o cartão onde um título de nível 2 faça sentido, normalmente logo a seguir ao `<uc-hero>`. As etiquetas e ligações do `<dl>` da página de semanas são lidas aqui fora de contexto: "Guião 10" diz mais do que "aqui".

## Sem JavaScript

O cartão é todo gerado: sem JavaScript, só aparece o que foi escrito dentro do elemento. Convém que a página inicial tenha também uma ligação simples para a página de semanas, como a da navegação do `<uc-page>` ou um atalho.

## Ver também

- [`<uc-weeks>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-weeks.md) e [`<uc-week>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-week.md): a página de semanas que o cartão lê.
- [`<uc-deadlines>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-deadlines.md): a lista completa das próximas datas.
- [`<uc-hero>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-hero.md): o topo da página inicial, que costuma vir antes do cartão.
- [Publicar](https://uc-design-kit.miguelrocha.dev/docs/pt/publicar.md): o cartão só fica completo num site servido por HTTP.
- Uso real: [a página inicial de Estruturas de Dados 2025/26](https://uc-design-kit.miguelrocha.dev/examples/edados-2526/index.html).
