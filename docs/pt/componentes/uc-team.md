# `<uc-team>`

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-team.html

A equipa docente, escrita uma vez no `course.js` e mostrada em cartões ou numa tabela: nome, função, turmas, gabinete e e-mail. Pode mostrar só uma parte da equipa, filtrada pela função.

Exemplo (equipa de quatro pessoas em cartões), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-team/basic.html):

```html
<uc-team></uc-team>
```

A demonstração mostra a equipa do curso fictício: a regente, um docente e duas pessoas das aulas práticas. Cada cartão tem a função e as turmas, e por baixo o gabinete e o e-mail quando existem.

## Utilização

Escreve-se o elemento vazio onde a equipa deve aparecer, normalmente na página inicial ou na página "Sobre a UC". O título "Equipa docente" é gerado.

`index.html`:

```html
<uc-team></uc-team>
```

As pessoas vêm de `team` no `course.js`, pela ordem em que estão escritas. Só `name` é obrigatório.

`course.js`:

```js
team: [
  {
    name: "Ana Ribeiro",
    role: "coordinator",
    classes: ["T1"],
    office: "Gab. 2.14",
    email: "ana.ribeiro@example.org",
  },
  { name: "Bruno Matos", role: "lecturer", classes: ["T2", "TP1"], office: "Gab. 2.09" },
  { name: "Carla Nunes", role: "assistant", classes: ["PL1", "PL3"], url: "https://example.org/~cnunes" },
],
```

As funções `coordinator`, `lecturer` e `assistant` aparecem traduzidas ("Regente", "Docente", "Práticas" em português). Qualquer outra função escreve-se como texto, numa ou em várias línguas, e aparece tal como está. Com `url`, o nome passa a link para a página pessoal; com `email`, o endereço é um link `mailto:`.

## Exemplos

### Tabela

Com `view="table"`, a equipa aparece numa tabela com as colunas Nome, Função e Turmas; o gabinete e o e-mail ficam por baixo do nome. Ocupa menos espaço com muitas pessoas, por exemplo numa página de horários.

Exemplo (equipa numa tabela), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-team/table.html):

```html
<uc-team view="table"></uc-team>
```

### Filtrar por função

O atributo `role` mostra só as pessoas com essas funções, separadas por espaços. Aqui, só as das aulas práticas e com outro título, dado por `heading`. Para mostrar a regente e os docentes, `role="coordinator lecturer"`.

Exemplo (só as pessoas das aulas práticas), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-team/role.html):

```html
<uc-team role="assistant" heading="Aulas práticas"></uc-team>
```

Uma função escrita como texto filtra-se pelo próprio texto, em qualquer das suas línguas e sem distinguir maiúsculas: `role: { pt: "Monitor", en: "Tutor" }` é encontrada por `role="monitor"` ou `role="tutor"`. Como os valores do filtro se separam por espaços, só se encontram assim funções de uma palavra.

### Sem título próprio

Com `heading="none"`, o componente não gera título. Serve para pôr a equipa dentro de uma secção que já tem o seu, como "Contactos". O título gerado é sempre um `<h2>`; noutro nível, usa-se esta forma com o título escrito à mão.

Exemplo (regente e docente dentro da secção Contactos), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-team/heading.html):

```html
<section class="uc-section" aria-labelledby="contacts">
  <h2 id="contacts">Contactos</h2>
  <uc-team role="coordinator lecturer" heading="none"></uc-team>
</section>
```

### Texto por baixo

O que estiver escrito dentro do `<uc-team>` aparece a seguir à lista ou à tabela, na mesma secção. Útil para o horário de atendimento ou para dizer como marcar uma reunião.

Exemplo (tabela da equipa com uma nota sobre o atendimento), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-team/children.html):

```html
<uc-team view="table">
  <p class="uc-muted">Atendimento por marcação, por e-mail.</p>
</uc-team>
```

## Atributos

| Atributo | Tipo | Por omissão | Descrição |
| --- | --- | --- | --- |
| `view` | `cards` ou `table` | `cards` | Cartões numa grelha ou uma tabela com uma linha por pessoa. |
| `role` | funções separadas por espaços | todas | Mostra só as pessoas com uma destas funções, por exemplo `role="assistant"`. Depois de o kit carregar passa para `data-role` (ver [abaixo](#atributo-role)). |
| `heading` | texto ou `none` | "Equipa docente" | Título da secção, num `<h2>`. Com `none`, não há título visível. |
| `heading-level` | `2` a `6` | `2` | Nível do título gerado: `3` dá um `<h3>`, para quando o componente está dentro de uma secção que já tem um `<h2>`. O aspeto não muda; muda só a estrutura que os leitores de ecrã usam para navegar. |

## Configuração usada

O componente lê só [`team`](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#equipa): a lista das pessoas, com `name`, `role`, `classes`, `office`, `email` e `url`. Os campos de cada pessoa estão descritos em [O ficheiro course.js](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#equipa).

| Campo | Para quê |
| --- | --- |
| [`team`](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#equipa) | As pessoas mostradas, pela ordem escrita. Uma pessoa sem `name` é ignorada. |

## O atributo role

`role` é também um atributo de acessibilidade do HTML, e um valor como `assistant` não é válido nesse sentido: os verificadores de acessibilidade assinalá-lo-iam. Por isso, ao arrancar, o componente lê o filtro e muda-o para `data-role`.

- No HTML, escreve-se `role`, como nos exemplos.
- Num `theme.css`, seleciona-se `uc-team[data-role]` (por exemplo `uc-team[data-role="assistant"]`), porque `role` já não existe na página.

Quando nenhuma pessoa corresponde ao filtro, ou `team` está vazio, o componente fica escondido (atributo `hidden`), sem título. Se tiver conteúdo escrito dentro, mostra o título e esse conteúdo.

## Personalizar

Estas classes são estáveis na versão 1 e podem ser usadas num `theme.css`. As regras do kit têm especificidade zero, por isso qualquer regra do professor ganha. O método está em [Nível 2: CSS livre](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/css.md); para mudar só cores, cantos ou letra em todo o site bastam os [tokens](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/tokens.md).

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

`theme.css`:

```css
/* Cartões mais largos: no máximo duas colunas no ecrã do portátil. */
.uc-team__cards { --uc-grid-min: 320px; }

/* Nomes das pessoas das aulas práticas sem negrito. */
uc-team[data-role="assistant"] .uc-team__name { font-weight: 400; }
```

A tabela tem uma largura mínima de 480 px (`--uc-table-min`); num ecrã mais estreito desliza na horizontal.

## Acessibilidade

### O que o componente faz

Gera uma secção com nome acessível: o título, ou o texto "Equipa docente" quando não há título visível. Os cartões são uma lista (`<ul>`) com uma pessoa por item; a tabela tem cabeçalhos de coluna e, se precisar de deslizar, pode ser percorrida com o teclado.

### O que cabe a quem escreve

Pôr o componente num sítio da página onde um `<h2>` faça sentido, ou usar `heading="none"` dentro de uma secção com título próprio. Um `heading` curto que diga quem está na lista quando há filtro.

## Sem JavaScript

A equipa está no `course.js`, por isso sem o kit não aparece nada além do conteúdo escrito dentro do componente. Numa página em que os contactos sejam essenciais, convém tê-los também em texto, por exemplo na página "Sobre a UC".

## Ver também

- [O ficheiro course.js](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#equipa): os campos de cada pessoa da equipa.
- [`<uc-page>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-page.md): a página onde a equipa aparece; a página `schedule` chama-se "Horários e equipa".
- Uso real: [a equipa em cartões na página inicial de Estruturas de Dados 2025/26](https://uc-design-kit.miguelrocha.dev/examples/edados-2526/index.html) e [em tabela na página de horários](https://uc-design-kit.miguelrocha.dev/examples/edados-2526/horarios.html).
