# Criar um layout

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/criar-layout.html

Um layout próprio parte sempre de um dos nove layouts do kit: fica com a estrutura dele (cabeçalho, navegação, conteúdo, rodapé, menu do telemóvel) e muda o resto com CSS. Regista-se com uma linha, `UC.registerLayout`, e escolhe-se como os do kit.

## Antes de criar um layout

Muitas vezes não é preciso. Pela ordem do mais simples para o mais trabalhoso:

| Para | Basta |
| --- | --- |
| Outro layout do kit em todo o site | `layout: "top"` no `course.js` (ver [Mudar o layout de um tema](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/temas.md#layout)) |
| Outro layout numa página | `<uc-page layout="full">` |
| Larguras, cores, cantos, letra | Tokens no `theme.css`: `--uc-content-max`, `--uc-sidebar-width`, `--uc-reading-max`… (ver [Nível 1: tokens](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/tokens.md)) |
| Um pormenor de um layout do kit em todas as páginas | Uma regra no `theme.css` com as classes desse layout: `.uc-page--docs .uc-toc { … }` (ver [Nível 2: CSS livre](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/css.md)) |
| Uma variante com nome próprio, que umas páginas usam e outras não, ou que um tema escolhe | **Um layout próprio**: esta página |
| Outra estrutura (outra ordem dos elementos, outro HTML) | Não é um layout: [Nível 4: HTML livre](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/html.md) com `layout="full"`, ou um [componente próprio](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/componentes.md) |

Um layout próprio é, no fundo, um nome para um conjunto de regras de CSS: a página que o usa fica com a classe do layout do kit e com a sua, e as regras só se aplicam onde ele é escolhido.

## As partes de cada layout

Todas as páginas têm as mesmas peças: `.uc-skip-link` (saltar para o conteúdo), `.uc-header`, `.uc-sidebar` com a `nav.uc-nav` e o botão "Menu", `.uc-shell` com o `main.uc-main`, e `.uc-footer`. Cada layout junta-as de outra forma e acrescenta as suas. A classe `.uc-page--<layout>` está no `<uc-page>` (menos no `sidebar`, o padrão, que não tem classe).

| Layout | Estrutura | Classes próprias |
| --- | --- | --- |
| `sidebar` | Cabeçalho; `.uc-shell` com a navegação à esquerda e o conteúdo | nenhuma |
| `top` | Cabeçalho; a navegação numa faixa por baixo; o conteúdo com a largura toda | `.uc-page--top`, `.uc-topnav` |
| `full` | Cabeçalho, conteúdo e rodapé, sem navegação | `.uc-page--full` |
| `banner` | Uma faixa da cor do curso com o cabeçalho, o primeiro `<uc-hero>` e os separadores; o conteúdo por baixo | `.uc-page--banner`, `.uc-banner`, `.uc-banner__inner`, `.uc-banner__hero` |
| `docs` | Navegação, conteúdo e a coluna "Nesta página" | `.uc-page--docs`, `.uc-toc`, `.uc-toc-toggle`, `.uc-toc__nav`, `.uc-toc__list`, `.uc-toc__item`, `.uc-toc__link` |
| `centered` | A estrutura do `top`, com o cabeçalho centrado e uma coluna de leitura | `.uc-page--centered`, `.uc-topnav` |
| `panel` | Uma barra de altura total com o cabeçalho, a navegação e o resumo do horário; o conteúdo ao lado | `.uc-page--panel`, `.uc-panel`, `.uc-panel__brand`, `.uc-panel__info`, `.uc-panel__label`, `.uc-panel__list` |
| `aside` | Navegação, conteúdo e uma coluna de blocos à direita | `.uc-page--aside`, `.uc-aside`, `.uc-aside__heading`, `.uc-aside__office-hours`, `.uc-aside__platforms` |
| `onepage` | Cabeçalho; uma barra fixa com as secções da página e as outras páginas; o conteúdo | `.uc-page--onepage`, `.uc-anchors`, `.uc-anchors__list`, `.uc-anchors__item`, `.uc-anchors__pages`, `.uc-anchors__link` |

O `banner`, por exemplo, desenha esta árvore, que é a base do exemplo abaixo:

```text
uc-page.uc-page--banner
  a.uc-skip-link
  div.uc-banner                    fundo: --uc-color-accent-strong
    header.uc-header               o cabeçalho de sempre, com texto claro
    div.uc-banner__inner
      div.uc-banner__hero          o primeiro <uc-hero> da página, se houver
      div.uc-sidebar               botão "Menu" + nav.uc-nav: os separadores
  div.uc-shell
    main.uc-main                   o conteúdo da página
  footer.uc-footer
```

As árvores dos outros layouts, o que muda abaixo de 960 px e na impressão estão no contrato [Temas com layout](https://github.com/mmroch4/uc-design-kit/blob/main/docs/architecture/themes-layouts.md#6-layouts) (em inglês). Estas classes são estáveis em toda a versão 1: não mudam de nome.

## Passo a passo: o layout "cartaz"

Um layout com a faixa do `banner`, mas com uma imagem de capa por trás e o título maior:

Exemplo (layout próprio cartaz, a partir do banner), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/customize/layout-cartaz.html):

```html
<uc-page layout="cartaz" current="home">
  <uc-hero></uc-hero>
  <p>A estrutura é a do layout <code>banner</code>: o cabeçalho, a apresentação e os separadores numa faixa. O ficheiro <code>layouts/cartaz.css</code> só muda o fundo da faixa e o tamanho do título.</p>
</uc-page>
```

### 1. O ficheiro de estilos

Numa pasta `layouts/` ao lado do `course.js`, um ficheiro com as regras do layout. Cada regra começa por `.uc-page--cartaz`, para só se aplicar às páginas que o usam; o resto vem do `banner`.

`layouts/cartaz.css`:

```css
.uc-page--cartaz .uc-banner {
  background:
    linear-gradient(rgb(11 31 58 / 78%), rgb(11 31 58 / 92%)),  /* véu escuro: o texto branco continua legível */
    url("../imagens/capa.jpg") center / cover,
    var(--uc-color-accent-strong);                              /* se a imagem não carregar */
}
.uc-page--cartaz .uc-banner__hero { padding-block: var(--uc-space-10) var(--uc-space-12); }
.uc-page--cartaz .uc-banner__hero .uc-hero__title { font-size: calc(var(--uc-font-size-display) * 1.2); }

@media print {
  .uc-page--cartaz .uc-banner { background: none; }
}
```

O endereço da imagem é relativo ao ficheiro CSS, por isso começa por `../`.

### 2. Registar o layout

Num script do site, por exemplo `extensions/layouts.js`, uma linha com o nome, o layout de base (`extends`) e o ficheiro de estilos (`css`, relativo ao `course.js`, como os `href` das páginas):

`extensions/layouts.js`:

```js
UC.registerLayout("cartaz", { extends: "banner", css: "layouts/cartaz.css" });
```

O script carrega-se em todas as páginas, com `defer`, **depois** do `uc-kit.js`, como os outros scripts próprios:

`index.html`:

```html
<script src="course.js"></script>
<script src="https://uc-design-kit.miguelrocha.dev/kit/v1/uc-kit.js" defer></script>
<script src="extensions/layouts.js" defer></script>
```

O kit espera pelos scripts da página antes de a desenhar, por isso o layout já é conhecido quando ela aparece. O ficheiro de estilos só é descarregado nas páginas que usam o layout.

- **O nome** só tem letras minúsculas, algarismos e `-`, e não pode ser o de um layout do kit.
- **`extends`** é um layout do kit ou outro layout próprio já registado (por omissão, `sidebar`). Um layout feito sobre outro layout próprio herda as regras dos dois.
- **`css`** é opcional: as regras podem também ficar no `theme.css`.
- Um registo recusado (nome inválido, base que não existe) deixa um aviso na consola e não muda nada.

### 3. Escolher o layout

Como um layout do kit, num destes sítios (o primeiro ganha):

`index.html`:

```html
<uc-page layout="cartaz">   <!-- só nesta página -->
```

`course.js`:

```js
layout: "cartaz",              // em todas as páginas
```

`theme.css`:

```css
:root { --uc-layout: cartaz; } /* como um tema: o course.js e a página ainda ganham */
```

A página fica com as classes `.uc-page--banner` e `.uc-page--cartaz`, por isso tem tudo o que o `banner` tem, incluindo o que um tema faz a esse layout (o Institucional sublinha os títulos das secções, por exemplo), e só muda o que o `cartaz.css` diz.

### 4. Verificar

Abrir uma página com o layout e percorrer a [lista de verificação](#acessibilidade). Na consola do browser (F12) não pode haver avisos `[uc-kit]`: um nome mal escrito no `course.js` ou na página aparece aí, e a página fica com o layout seguinte (o do tema, ou `sidebar`).

## Lista de verificação de acessibilidade

A estrutura vem do layout do kit, que já cumpre o WCAG 2.1 AA. Um layout próprio só tem de não o estragar:

- **Saltar para o conteúdo.** Com a tecla Tab, a primeira coisa a aparecer é a ligação "Saltar para o conteúdo", e leva ao `main`. Não esconder o `.uc-skip-link`.
- **Foco visível.** Ao percorrer a página com Tab, cada ligação e botão mostra o anel de foco, também sobre fundos escuros ou imagens. Num fundo escuro, redefinir `--uc-focus-ring` dentro dessa zona (o `banner` já o faz dentro da faixa).
- **Contraste.** Texto com pelo menos 4,5:1 sobre o fundo. Por cima de uma imagem, um véu escuro (como o `linear-gradient` do exemplo) ou claro garante-o; sem véu, a imagem decide. Ver [Verificar o contraste](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/criar-tema.md#contraste).
- **Menu no telemóvel.** A 390 px de largura (modo de dispositivo do browser, Ctrl+Shift+M) o botão "Menu" abre e fecha a navegação, e a página não desliza na horizontal.
- **Ordem.** O CSS pode mudar a posição das colunas, mas a ordem de leitura (a do HTML) tem de continuar a fazer sentido: não usar `order` nem `grid-area` para pôr a navegação depois do conteúdo só no ecrã.
- **Movimento.** Animações e transições novas ficam dentro de `@media (prefers-reduced-motion: no-preference)`.
- **Impressão.** Na pré-visualização de impressão (Ctrl+P) a página sai sem fundos escuros e sem navegação, como as outras.

## Um tema com um layout próprio

Um `theme.css` pode escolher o layout próprio e decorá-lo, como os temas do kit fazem com os seus (ver [Criar um tema com layout](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/criar-tema.md#tema-com-layout)):

`theme.css`:

```css
:root {
  --uc-layout: cartaz;
  --uc-hero-align: center;      /* a apresentação centrada */
  --uc-radius-lg: 4px;
}
.uc-page--cartaz .uc-main > h2 { text-transform: uppercase; letter-spacing: 0.04em; }
```

## Ver também

- [Escolher um tema](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/temas.md): os temas do kit e os seus layouts.
- [uc-page](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-page.md#exemplos): os nove layouts do kit, com uma demonstração de cada.
- [API JavaScript](https://uc-design-kit.miguelrocha.dev/docs/pt/referencia/api-js.md): `UC.registerLayout` e o resto da API.
- [Classes CSS estáveis](https://uc-design-kit.miguelrocha.dev/docs/pt/referencia/classes.md): todas as classes, por componente.
