# Tokens

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/tokens.html

Todas as variáveis CSS do kit, com o valor por omissão e onde se usam. Os valores desta página são lidos do `uc-kit.css` pelo navegador quando a página abre.

## Como se mudam

Os tokens estão definidos em `:root` no `uc-kit.css`. Muda-se um token redefinindo-o no `theme.css` da cadeira, carregado depois do kit:

`theme.css`:

```css
:root {
  --uc-color-accent: #0F766E;
  --uc-radius-lg: 4px;
}
```

Os componentes e os blocos leem só estes tokens, por isso uma linha muda o kit inteiro. É o nível 1 da personalização; ver [Nível 1: tokens](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/tokens.md). Para a cor de destaque basta o campo [`accentColor`](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#campos-curso) do `course.js`.

Os valores com uma cor ao lado e as medidas em px são calculados nesta página. Os derivados (`color-mix()`) aparecem já resolvidos para a cor por omissão. Abaixo de 760 px de largura, os valores que mudam no telemóvel aparecem com o valor do telemóvel.

## Cor

Ver [Cor](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/cor.md) para as amostras e o contraste.

### Destaque

| Token | Valor | Para quê e onde |
| --- | --- | --- |
| `--uc-color-accent` | `#1D4ED8` | Links, navegação ativa, botões principais, borda de `uc-card--accent`, anel de foco. Muda com o `accentColor` do `course.js`. Todo o kit. |
| `--uc-color-accent-strong` | `#143797` | Links e botão principal ao passar o rato. Derivado: 70% do destaque com preto. |
| `--uc-color-accent-soft` | `#EDF1FC` | Fundo do item ativo da navegação, de `uc-tag--accent`, de `<uc-this-week>` e da opção escolhida em `<uc-question>`. Derivado: 8% do destaque com branco. |
| `--uc-color-highlight` | `#F4F6FD` | Faixa da semana atual em `<uc-week>`. Derivado: 5% do destaque com branco. |
| `--uc-color-on-accent` | `#FFFFFF` | Texto sobre o destaque (`uc-button--primary`). |

### Neutras

| Token | Valor | Para quê e onde |
| --- | --- | --- |
| `--uc-color-text` | `#18181B` | Texto principal e títulos. |
| `--uc-color-text-secondary` | `#3F3F46` | Parágrafos: `uc-lead`, `uc-prose`, `uc-content`, texto das semanas. |
| `--uc-color-text-muted` | `#52525B` | Metadados, datas, cabeçalhos de tabela, `uc-muted`. |
| `--uc-color-text-subtle` | `#6E6E77` | Rótulos de grupo da navegação, semanas futuras, ícones discretos. Só sobre fundo branco. |
| `--uc-color-border` | `#E4E4E7` | Bordas de cartões, tabelas, semanas e linhas. |
| `--uc-color-surface` | `#FFFFFF` | Fundo da página e dos cartões. |
| `--uc-color-surface-muted` | `#F4F4F5` | Etiquetas, `uc-callout`, `code` no texto, fundos ao passar o rato. |
| `--uc-color-surface-sunken` | `#FAFAFA` | Cabeçalhos de `uc-table` e barras de `<uc-code>`. |

### Estado

| Token | Valor | Para quê e onde |
| --- | --- | --- |
| `--uc-color-warning-text` | `#92400E` | Texto de `uc-tag--warning` (avaliação, "novo") e avisos de `<uc-code>`. |
| `--uc-color-warning-bg` | `#FEF3C7` | Fundo de `uc-tag--warning`. |
| `--uc-color-warning-surface` | `#FFFBEB` | Painel de `uc-callout--warning` e de `<uc-event>`. |
| `--uc-color-warning-border` | `#FDE68A` | Borda dos mesmos painéis. |
| `--uc-color-success-text` | `#166534` | Respostas certas, exercícios feitos, testes que passam, `uc-tag--success`. |
| `--uc-color-success-bg` | `#DCFCE7` | Fundo dos mesmos. |
| `--uc-color-danger-text` | `#991B1B` | Testes que falham e erros de execução em `<uc-code>`. |
| `--uc-color-danger-bg` | `#FEE2E2` | Fundo para o mesmo texto. O kit ainda não o usa; fica para extensões. |

## Tipografia

Ver [Tipografia](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/tipografia.md) para a escala com exemplos.

| Token | Valor | Para quê e onde |
| --- | --- | --- |
| `--uc-font-sans` | `Inter, system-ui, -apple-system, "Segoe UI", sans-serif` | Texto. Todo o kit. |
| `--uc-font-mono` | `"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace` | Código, datas, números de semana, `uc-mono`. |
| `--uc-font-size-base` | `100%` | Tamanho de `<html>`, em percentagem do tamanho de letra escolhido no navegador (16 px se ninguém o mudou); os outros tamanhos são relativos a ele. |
| `--uc-font-size-xs` | `0.75rem (12px)` | Etiquetas (`uc-tag`), contadores. |
| `--uc-font-size-sm` | `0.8125rem (13px)` | Cabeçalhos de tabela, metadados pequenos. |
| `--uc-font-size-md` | `0.875rem (14px)` | Texto secundário, botões, `uc-small`. |
| `--uc-font-size-body-sm` | `0.9375rem (15px)` | Texto de tabelas, semanas, avisos e `<pre>` em `uc-content`. |
| `--uc-font-size-lg` | `1.125rem (18px)` | `uc-lead` e subtítulo de `<uc-hero>`. |
| `--uc-font-size-h3` | `1.25rem (20px)` | `<h3>` |
| `--uc-font-size-h2` | `1.375rem (22px)` | `<h2>` |
| `--uc-font-size-h1` | `2.25rem (36px)` | `<h1>`. Abaixo de 760 px passa a `1.875rem` (30px). |
| `--uc-font-size-display` | `2.5rem (40px)` | Título de `<uc-hero>`. Abaixo de 760 px passa a `2rem` (32px). |
| `--uc-line-height` | `1.6` | Entrelinha do texto. |
| `--uc-line-height-tight` | `1.25` | Entrelinha dos títulos. |

## Espaço e forma

A escala de espaço anda de 4 em 4 px e não tem os passos 9 e 11. Ver [Espaço e forma](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/espaco.md).

| Token | Valor | Para quê e onde |
| --- | --- | --- |
| `--uc-radius-sm` | `6px` | Etiquetas e `code` no texto. |
| `--uc-radius-md` | `8px` | Botões, `<pre>`, campos. |
| `--uc-radius-lg` | `12px` | Cartões, tabelas, `uc-callout`, `<uc-code>`, exercícios. |
| `--uc-space-1` | `4px` | Entre linhas de uma lista, ícone e texto. |
| `--uc-space-2` | `8px` | Dentro de cartões e caixas, entre etiquetas. |
| `--uc-space-3` | `12px` | Células de tabela, `uc-grid`. |
| `--uc-space-4` | `16px` | Entre blocos de uma secção, `uc-stack`, margem lateral em ecrãs estreitos. |
| `--uc-space-5` | `20px` | Margem interior de cartões e caixas (vertical). |
| `--uc-space-6` | `24px` | Margem interior de cartões e caixas (horizontal). |
| `--uc-space-7` | `28px` | Só em `<uc-this-week>`. |
| `--uc-space-8` | `32px` | Margem lateral da página (`--uc-gutter`), `<hr>`. |
| `--uc-space-10` | `40px` | Antes de um `<h2>` em `uc-content`, colunas de `uc-split`. |
| `--uc-space-12` | `48px` | Entre os blocos do conteúdo de `<uc-page>` e de `<uc-guide>`. |

## Layout

| Token | Valor | Para quê e onde |
| --- | --- | --- |
| `--uc-content-max` | `1200px` | Largura máxima da página em `<uc-page>`. |
| `--uc-sidebar-width` | `216px` | Coluna da navegação de `<uc-page>` (a partir de 960 px). |
| `--uc-header-height` | `64px` | Barra de topo de `<uc-page>`; a navegação fixa começa por baixo dela. |
| `--uc-gutter` | `32px` | Margem lateral da página em `<uc-page>`. Abaixo de 760 px passa a 16px. |
| `--uc-target-min` | `44px` | Altura e largura mínimas de botões, links da navegação e outros alvos de toque. |
| `--uc-focus-ring` | `2px solid #1D4ED8` | Contorno de foco do teclado (`outline`), com `outline-offset: 2px`. |

Os pontos de quebra (760 e 960 px) não são tokens: as variáveis CSS não podem ser usadas em `@media`.

## Tokens locais

Não estão definidos em `:root`: o kit lê-os com um valor de recurso. Definem-se em `:root` para o site inteiro ou num só elemento para mudar só esse bloco.

| Token | Valor sem definição | Para quê e onde |
| --- | --- | --- |
| `--uc-grid-min` | `220px` | Largura mínima de uma coluna de `uc-grid`. |
| `--uc-grid-gap` | `12px` | Espaço entre colunas de `uc-grid` (`--uc-space-3`). |
| `--uc-stack-gap` | `16px` | Espaço entre filhos de `uc-stack` (`--uc-space-4`). |
| `--uc-table-min` | `560px` | Largura mínima da tabela dentro de `uc-table`; abaixo dela a tabela desliza. |
| `--uc-card-padding` | `20px 24px` | Margem interior de `uc-card`. Os cartões de `<uc-team>` usam `16px 20px`. |
| `--uc-main-gap` | `48px` | Espaço entre os blocos de topo do conteúdo de `<uc-page>`. |
| `--uc-guide-gap` | `48px` | Espaço entre os blocos de `<uc-guide>`. |
| `--uc-notices-date-width` | `64px` | Coluna da data em `<uc-notices>`. |
| `--uc-deadlines-date-width` | `5.25rem` | Coluna da data de `<uc-deadlines>` em lista. |
| `--uc-timetable-time-width` | `7.5rem` | Coluna das horas de `<uc-timetable view="days">`. |
| `--uc-grading-bar-height` | `12px` | Altura da barra das proporções de `<uc-grading>`. |
| `--uc-summaries-date-width` | `10rem` | Largura da coluna da data de `<uc-summaries>`, em ecrãs largos. |
| `--uc-links-min` | `260px` | Largura mínima de cada coluna de `uc-links--grid`. |

```html
<div class="uc-grid" style="--uc-grid-min: 160px">
  …
</div>
```

## Variáveis internas

O kit usa ainda esta variável dentro de um componente. Não faz parte do contrato e pode mudar numa versão nova.

| Token | Valor | Para quê e onde |
| --- | --- | --- |
| `--uc-disclosure-icon` | `url(…)` | Ícone das pistas e soluções de `<uc-exercise>`, definido em `.uc-hint` e `.uc-solution`. Para mudar o ícone, substitui-se a regra destas classes. |
