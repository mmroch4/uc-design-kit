# Espaço e forma

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/espaco.html

Uma escala de espaço em passos de 4 px, três raios de canto, as larguras da página e os dois pontos em que o layout muda. Tudo o que toca no ecrã tem pelo menos 44 px e mostra onde está o foco do teclado.

## Escala de espaço

Margens, espaços entre blocos e margens interiores saem desta escala. Cada barra tem a largura do token; o valor é calculado nesta página.

| Token | Valor | Medida | Uso típico |
| --- | --- | --- | --- |
| `--uc-space-1` | 4px |   | Entre itens de uma lista, entre ícone e texto. |
| `--uc-space-2` | 8px |   | Dentro de cartões e caixas, entre etiquetas. |
| `--uc-space-3` | 12px |   | Células de tabela, colunas de `uc-grid`. |
| `--uc-space-4` | 16px |   | Entre blocos de uma secção (`uc-stack`, `uc-section`). |
| `--uc-space-5` | 20px |   | Margem interior de cartões, em cima e em baixo. |
| `--uc-space-6` | 24px |   | Margem interior de cartões, dos lados. |
| `--uc-space-7` | 28px |   | Pouco usado. |
| `--uc-space-8` | 32px |   | Margem lateral da página, antes de um `<h3>`. |
| `--uc-space-10` | 40px |   | Antes de um `<h2>`, entre as colunas de `uc-split`. |
| `--uc-space-12` | 48px |   | Entre as secções de uma página. |

A escala não tem os passos 9 e 11. O espaço cresce com o nível: pouco dentro de um bloco, mais entre blocos, mais ainda entre secções. Uma página arrumada assim lê-se pelos espaços antes de se ler o texto.

Em CSS próprio usa-se a escala em vez de px soltos (`margin-top: var(--uc-space-6)`): se a cadeira apertar ou alargar a escala, o CSS próprio acompanha.

## Cantos

- `--uc-radius-sm` 6pxEtiquetas, `code` no texto
- `--uc-radius-md` 8pxBotões, `<pre>`, campos
- `--uc-radius-lg` 12pxCartões, tabelas, caixas, blocos de código

Quanto maior a superfície, maior o raio. Para um site de cantos retos, põem-se os três a `0` no `theme.css`.

## Larguras e pontos de quebra

| Medida | Valor | O que é |
| --- | --- | --- |
| `--uc-content-max` | 1200px | Largura máxima da página de [`<uc-page>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-page.md), navegação incluída. |
| `--uc-sidebar-width` | 216px | Coluna da navegação lateral. |
| `--uc-gutter` | 32px | Margem lateral da página; 16 px abaixo de 760 px. |
| `--uc-header-height` | 64px | Altura da barra de topo; a navegação lateral fica fixa por baixo dela. |
| Introdução | 680px | Largura máxima de `uc-lead`. |
| Texto | 720px | Largura máxima de `uc-prose` e `uc-bullets`. |
| HTML sem classes | 760px | Largura máxima de `uc-content`. |

O layout muda em dois pontos:

- **960 px.** Abaixo, a navegação lateral passa para um botão por cima do conteúdo e `uc-split` passa a uma coluna.
- **760 px.** Abaixo, a margem lateral passa a 16 px, os títulos `-h1` e `-display` encolhem, o cabeçalho das semanas e dos exercícios arruma-se em linhas e as margens interiores de vários componentes diminuem.

Os pontos de quebra estão escritos no `uc-kit.css`, não são tokens: as variáveis CSS não podem ser usadas em `@media`. Num `theme.css` usam-se os mesmos valores para o CSS próprio mudar ao mesmo tempo que o kit. A disposição das páginas está em [Blocos: layout](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/layout.md).

## Alvos de toque

Botões, links da navegação, cabeçalhos das semanas e exercícios têm pelo menos `--uc-target-min` de altura (44px), o tamanho de um dedo. Abaixo de 960 px, os links da navegação crescem para 48 px.

[Botão](#alvos-de-toque) [Botão pequeno](#alvos-de-toque)

`uc-button--sm` (32 px) fica abaixo, para tabelas e barras de ferramentas onde há muitos botões juntos; não se usa como botão principal de uma página.

## Anel de foco

Quem navega com o teclado vê sempre onde está. Tudo o que recebe foco (links, botões, `<summary>`, campos) mostra um contorno de `--uc-focus-ring` (`2px solid #1D4ED8`) a 2 px do elemento, só quando o foco vem do teclado (`:focus-visible`).

Assim fica com foco

O anel usa a cor de destaque, por isso acompanha o `accentColor`. Em CSS próprio nunca se tira o contorno (`outline: none`) sem pôr outro igualmente visível. Ver [Acessibilidade](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/acessibilidade.md).
