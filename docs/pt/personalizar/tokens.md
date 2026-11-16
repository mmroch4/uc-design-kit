# Nível 1: tokens

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/tokens.html

Os tokens são as variáveis CSS (`--uc-*`) de onde o kit tira cores, cantos, letra e espaços. Redefinir alguns num `theme.css` muda o aspeto de todas as páginas e de todos os componentes de uma vez, sem tocar no HTML.

## Criar o theme.css

O `theme.css` é um ficheiro na raiz da pasta do site, ao lado do `course.js`. O [modelo](https://uc-design-kit.miguelrocha.dev/docs/pt/criar-site.md) já o traz, vazio e com um exemplo comentado. Carrega-se no `<head>` de cada página **depois** do `uc-kit.css`:

`index.html`:

```html
<link rel="stylesheet" href="https://uc-design-kit.miguelrocha.dev/kit/v1/uc-kit.css">
<link rel="stylesheet" href="theme.css">
<script src="course.js"></script>
<script src="https://uc-design-kit.miguelrocha.dev/kit/v1/uc-kit.js" defer></script>
```

Nas páginas de subpastas, o caminho é `../theme.css` (ver [Páginas em subpastas](https://uc-design-kit.miguelrocha.dev/docs/pt/estrutura.md#subpastas)). Os tokens redefinem-se em `:root`:

`theme.css`:

```css
:root {
  --uc-radius-lg: 4px;
  --uc-font-sans: system-ui, sans-serif;
}
```

Só se escreve o que muda; os outros tokens mantêm o valor do kit.

## Mudar as cores

A cor de destaque tem um caminho mais simples: [`accentColor` no `course.js`](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/course-js.md#cor). As cores de estado (certo, aviso, erro), do texto e das superfícies mudam-se aqui:

`theme.css`:

```css
:root {
  /* Correct answers and finished exercises in a bluer green. */
  --uc-color-success-text: #0F5132;
  --uc-color-success-bg: #D1E7DD;

  /* Body text a little softer. */
  --uc-color-text: #27272A;
}
```

> **Precedência da cor de destaque.** O kit aplica `accentColor` diretamente no elemento `<html>`, e esse valor ganha sempre a `--uc-color-accent` no `theme.css`. O `course.js` do modelo traz `accentColor` preenchido. Há duas formas de mudar a cor: no `course.js` (recomendado), ou apagando o campo `accentColor` e escrevendo `--uc-color-accent` no `theme.css`.

- **Em `:root`, não num elemento.** As variantes da cor de destaque (`--uc-color-accent-strong`, `-soft`, `--uc-color-highlight`) são calculadas em `:root`. Um `--uc-color-accent` escrito numa só secção muda os links dessa secção, mas não os fundos claros nem o *hover*, que continuam com a cor do site.
- **Contraste.** Cada par texto/fundo tem de manter pelo menos 4.5:1 (por exemplo `--uc-color-success-text` sobre `--uc-color-success-bg`). O [Personalizador de tema](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/tema.md) verifica-o.
- **Pares.** Os tokens de estado andam aos pares (`-text` e `-bg`, ou `-surface` e `-border`): muda-se o par inteiro.

## Mudar os cantos

Três tokens controlam todos os cantos arredondados: `--uc-radius-sm` (etiquetas, código no meio do texto), `--uc-radius-md` (botões, menus) e `--uc-radius-lg` (cartões, blocos de código, avisos). Para um aspeto mais sóbrio, reduzem-se os três; com `0` ficam retos.

`theme.css`:

```css
:root {
  --uc-radius-sm: 2px;
  --uc-radius-md: 2px;
  --uc-radius-lg: 4px;
}
```

## Mudar o tipo de letra

O texto usa `--uc-font-sans` (Inter, servida com o kit) e o código, as datas e os códigos usam `--uc-font-mono` (JetBrains Mono).

`theme.css`:

```css
:root {
  /* The system font: nothing to download. */
  --uc-font-sans: system-ui, sans-serif;
}
```

- **Letra do sistema.** Com `system-ui`, o browser não descarrega a Inter e a página aparece um pouco mais cedo na primeira visita. A linha `preload` do `<head>` deixa de ser útil e pode sair.
- **Outra letra.** Os ficheiros `.woff2` ficam na pasta do site e declaram-se com `@font-face` no `theme.css`, antes de `:root`. Não é preciso nenhum serviço externo.
- **Tamanho.** `--uc-font-size-base` (16px) é a base de toda a escala; mudar só os tamanhos de um título é trabalho do [nível 2](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/css.md).

## Antes e depois

A mesma semana e o mesmo cartão com os tokens do kit:

Exemplo (semana e cartão com os tokens do kit), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/customize/tokens-before.html):

```html
<div class="uc-stack">
  <uc-week n="10" title="Pesquisa binária e árvores">
    <p>Guião 10: <a href="#">inserir e procurar numa árvore</a>.</p>
  </uc-week>
  <div class="uc-card">
    <p><span class="uc-tag uc-tag--accent">Trabalho 2</span></p>
    <p>Entrega até 28 de novembro, às 23:59, pela plataforma de entregas.</p>
    <p><a class="uc-button uc-button--primary" href="#">Ver enunciado</a> <a class="uc-button" href="#">Perguntas frequentes</a></p>
  </div>
</div>
```

E com outra cor, cantos quase retos e uma letra com serifa. Só o bloco `<style>` (o conteúdo do `theme.css`) é diferente:

Exemplo (semana e cartão com cor, cantos e letra redefinidos), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/customize/tokens-after.html):

```html
<style>
  /* theme.css */
  :root {
    --uc-color-accent: #9F1239;
    --uc-radius-sm: 2px;
    --uc-radius-md: 2px;
    --uc-radius-lg: 4px;
    --uc-font-sans: Georgia, "Times New Roman", serif;
  }
</style>

<div class="uc-stack">
  <uc-week n="10" title="Pesquisa binária e árvores">
    <p>Guião 10: <a href="#">inserir e procurar numa árvore</a>.</p>
  </uc-week>
  <div class="uc-card">
    <p><span class="uc-tag uc-tag--accent">Trabalho 2</span></p>
    <p>Entrega até 28 de novembro, às 23:59, pela plataforma de entregas.</p>
    <p><a class="uc-button uc-button--primary" href="#">Ver enunciado</a> <a class="uc-button" href="#">Perguntas frequentes</a></p>
  </div>
</div>
```

A demonstração redefine `--uc-color-accent` porque o curso de demonstração não tem `accentColor`. Num site com esse campo no `course.js`, a cor mudar-se-ia lá.

## Tokens locais

Alguns tokens não estão definidos em `:root`: o kit lê-os com um valor por omissão, para poderem ser mudados só num bloco. Escrevem-se no atributo `style` ou numa classe própria:

```html
<!-- Narrower columns only in this grid. -->
<div class="uc-grid" style="--uc-grid-min: 160px">…</div>

<!-- Less space between the blocks of this guide. -->
<uc-guide style="--uc-guide-gap: 32px">…</uc-guide>
```

Entre eles: `--uc-grid-min`, `--uc-grid-gap`, `--uc-stack-gap`, `--uc-table-min`, `--uc-card-padding`, `--uc-main-gap` e `--uc-guide-gap`. Escritos em `:root`, valem para o site inteiro.

## Onde estão todos

A lista completa, com os valores por omissão e o uso de cada um, está em [Tokens](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/tokens.md). Os nomes dessa lista são estáveis na versão 1; uma variável `--uc-*` que não esteja lá é interna e pode mudar. Para escolher cores, cantos e letra a ver o resultado, o [Personalizador de tema](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/tema.md) gera o `theme.css` pronto a copiar.

## Ver também

- [Nível 2: CSS livre](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/css.md), quando um token não chega.
- [Cor](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/cor.md), [Tipografia](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/tipografia.md) e [Espaço e forma](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/espaco.md): as decisões por trás dos valores do kit.
- [Acessibilidade](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/acessibilidade.md): contraste e foco.
