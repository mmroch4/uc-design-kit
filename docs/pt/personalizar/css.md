# Nível 2: CSS livre

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/css.html

Quando um token não chega, escreve-se CSS normal no `theme.css`: regras sobre as classes estáveis dos componentes, ou classes próprias para blocos da cadeira. As regras do kit têm especificidade zero, por isso qualquer regra do professor ganha sem `!important`.

## Classes estáveis

Cada componente gera HTML com classes no formato `uc-<componente>__<parte>`, mais variantes de estado com `--`:

| Forma | Exemplo | O que é |
| --- | --- | --- |
| `.uc-<componente>` | `.uc-week` | O próprio componente. |
| `.uc-<componente>__<parte>` | `.uc-week__title` | Uma parte gerada pelo componente. |
| `.uc-<componente>--<estado>` | `.uc-week--current` | Um estado ou variante. |

As classes que se podem usar estão na tabela da secção "Personalizar" da página de cada componente: [`uc-page`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-page.md#personalizar), [`uc-hero`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-hero.md#personalizar), [`uc-notices`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-notices.md#personalizar), [`uc-deadlines`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-deadlines.md#personalizar), [`uc-date`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-date.md#personalizar), [`uc-weeks`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-weeks.md#personalizar), [`uc-week`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-week.md#personalizar), [`uc-event`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-event.md#personalizar), [`uc-this-week`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-this-week.md#personalizar), [`uc-team`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-team.md#personalizar), [`uc-guide`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-guide.md#personalizar), [`uc-exercise`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-exercise.md#personalizar), [`uc-code`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-code.md#personalizar) e [`uc-question`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-question.md#personalizar). As classes de blocos (`uc-card`, `uc-table`, `uc-button`…) estão em [Blocos: layout](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/layout.md), [superfícies e listas](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/superficies.md) e [elementos](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/elementos.md).

Dois atributos documentados também servem de seletor: `data-kind` nos itens de `<uc-deadlines>` (o tipo do prazo) e `data-lang` em `<uc-code>` (a linguagem, por exemplo `uc-code[data-lang="java"]`).

## Especificidade zero

Todas as regras do kit estão dentro de `:where()`, que tem especificidade zero:

`uc-kit.css (kit)`:

```css
:where(.uc-week__title) { font-size: 1.0625rem; font-weight: 600; }
```

Qualquer seletor do professor, mesmo só um nome de elemento, tem mais especificidade e ganha. Não é preciso repetir classes, juntar `body` ao seletor nem usar `!important`:

`theme.css`:

```css
.uc-week__title { font-weight: 500; }   /* wins */
h2 { letter-spacing: -0.01em; }        /* also wins over the kit's h2 */
```

As exceções são poucas e de propósito: `[hidden]`, o conteúdo noutra língua (escondido com `!important` para nunca aparecer por engano) e a redução de animações quando o sistema a pede.

## Exemplos

### Retocar um componente

A semana atual com uma barra à esquerda em vez da faixa colorida, e os números das semanas na letra do código:

Exemplo (semanas com uma barra na semana atual), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/customize/css-week.html):

```html
<style>
  /* theme.css */
  /* Current week: a bar on the left instead of the tinted band. */
  .uc-week--current {
    background: none;
    box-shadow: inset 3px 0 0 var(--uc-color-accent);
    padding-left: var(--uc-space-4);
  }

  /* Week numbers in the monospaced font, like the dates. */
  .uc-week__number { font-family: var(--uc-font-mono); }
</style>

<uc-week n="9" title="Ordenação: mergesort e quicksort">
  <p>Guião 9: <a href="#">ordenar um milhão de números</a>.</p>
</uc-week>
<uc-week n="10" title="Pesquisa binária e árvores">
  <p>Guião 10: <a href="#">inserir e procurar numa árvore</a>.</p>
</uc-week>
<uc-week n="11" title="Grafos: pesquisa em largura e em profundidade">
  <p>Representação de grafos, BFS e DFS.</p>
</uc-week>
```

As regras usam tokens (`--uc-color-accent`, `--uc-space-4`, `--uc-font-mono`) em vez de valores fixos, por isso continuam certas se a cor do curso ou o tema mudarem.

### Classes próprias

Para blocos que são só da cadeira (horários das turmas, componentes da nota), o mais estável é juntar uma classe própria a um bloco do kit e escrever as regras só com tokens. Estas classes não dependem de nada interno do kit:

Exemplo (cartões de turmas com uma classe própria), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/customize/css-own-class.html):

```html
<style>
  /* theme.css: own classes, written only with the kit's tokens */
  .lab-class { --uc-card-padding: var(--uc-space-4) var(--uc-space-5); gap: var(--uc-space-1); }
  .lab-class__code { color: var(--uc-color-accent); font-family: var(--uc-font-mono); font-weight: 600; }
  .lab-class__time { font-weight: 600; }
  .lab-class__room { color: var(--uc-color-text-muted); font-size: var(--uc-font-size-md); }
</style>

<div class="uc-grid" style="--uc-grid-min: 180px">
  <div class="uc-card lab-class">
    <p class="lab-class__code">PL1</p>
    <p class="lab-class__time">Segunda, 14:00–16:00</p>
    <p class="lab-class__room">Laboratório 1 · Carla Nunes</p>
  </div>
  <div class="uc-card lab-class">
    <p class="lab-class__code">PL2</p>
    <p class="lab-class__time">Terça, 10:00–12:00</p>
    <p class="lab-class__room">Laboratório 2 · Diogo Teixeira</p>
  </div>
  <div class="uc-card lab-class">
    <p class="lab-class__code">PL3</p>
    <p class="lab-class__time">Quinta, 16:00–18:00</p>
    <p class="lab-class__room">Laboratório 1 · Carla Nunes</p>
  </div>
</div>
```

Era o padrão do `theme.css` de Estruturas de Dados, antes de o kit ter blocos para esses casos: classes curtas (`.formula`, `.class-card`), sem o prefixo `uc-`, agrupadas por página. Um nome sem `uc-` nunca colide com uma classe do kit.

### Por linguagem ou tipo

`theme.css`:

```css
/* Python blocks with a bar on the left. */
uc-code[data-lang="python"] { border-left: 3px solid var(--uc-color-accent); }

/* Exam dates in bold in the deadlines list. */
.uc-deadlines [data-kind="exam"] .uc-deadlines__title { font-weight: 700; }
```

## O que não é estável

Só o que está nas tabelas é contrato. Pode mudar numa versão 1 mais recente:

- **Classes que não estão nas tabelas.** O HTML gerado tem outras classes, como `.uc-week__meta` ou `.uc-week__chevron`. Existem para o CSS do kit e podem mudar de nome ou desaparecer.
- **A estrutura do HTML gerado.** Que elemento contém que outro, a ordem dos filhos e as etiquetas usadas (`span`, `div`, `details`). Seletores como `.uc-week__summary > span:nth-child(2)` ou `.uc-week details` partem-se com a mudança mais pequena.
- **Variáveis `--uc-*` que não estão na [lista de tokens](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/tokens.md)**, as classes que o kit põe no `<html>` (`uc-ready`, `uc-visible`) e os atributos `data-uc-*`.

Regra prática: cada seletor aponta para uma classe estável, no máximo com um descendente também estável ou um estado. Se não há classe para a parte a mudar, é sinal de que a mudança deve ser pedida ao kit, ou feita com um componente próprio.

## Ordem e cascata

- **`theme.css` depois do kit.** Com especificidade zero a ordem quase não conta, mas carregar o `theme.css` depois do `uc-kit.css` evita surpresas e é o que o [`<head>` das páginas](https://uc-design-kit.miguelrocha.dev/docs/pt/estrutura.md#head) já faz. Os estilos de um componente próprio vêm a seguir.
- **O kit também dá estilo a elementos simples.** Títulos, parágrafos, listas (`li + li` tem margem), tabelas dentro de `.uc-table`, código. Num bloco próprio que precisa de outro aspeto, repõe-se o que for preciso (`margin: 0` nos itens de uma lista em linha, por exemplo).
- **Uma regra só numa página.** Junta-se uma classe ao `<body>` dessa página (`<body class="page-assessment">`) e começa-se o seletor por ela. Uma regra para um só bloco fica mais clara com uma classe própria nesse bloco.
- **Ecrãs estreitos.** O kit muda de disposição abaixo de 960px (navegação) e de 760px (componentes). Uma regra que só faz sentido num ecrã largo vai num `@media (min-width: 960px)`; e convém ver a página com 360px de largura.
- **Quando uma regra não pega.** Quase sempre o seletor não encontra o elemento: inspecionar o elemento nas ferramentas do browser mostra as classes que tem e as regras que se aplicam.

## Ver também

- [Nível 1: tokens](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/tokens.md), para mudanças em todo o site.
- [Nível 3: componentes próprios](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/componentes.md), quando a mudança precisa de comportamento.
- [Classes CSS estáveis](https://uc-design-kit.miguelrocha.dev/docs/pt/referencia/classes.md): todas numa página.
