# Criar um tema

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/criar-tema.html

Um tema é a cor do curso, um tema pronto do kit (opcional) e um `theme.css` com os tokens que mudam. Este guia percorre os passos por ordem, do mais simples ao mais livre; as páginas [Nível 1: tokens](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/tokens.md) e [Tokens](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/tokens.md) são a referência.

## Os passos

1. [A cor do curso](#cor), no `course.js`.
2. [Um tema pronto](#temas-prontos), se algum servir de ponto de partida.
3. [O `theme.css`](#theme-css), com todos os tokens à espera de serem mudados.
4. [O personalizador](#personalizador), para experimentar e exportar o ficheiro.
5. [Verificar o contraste](#contraste) de cada cor nova.

A ordem de aplicação é sempre a mesma: o `uc-kit.css`, depois os temas prontos, depois o `theme.css` do site e, por cima de tudo, o `accentColor` do `course.js`. Cada camada só precisa de dizer o que muda.

## 1. A cor do curso

A cor de destaque (ligações, item ativo da navegação, semana atual, botões principais, anel de foco) muda-se numa linha do `course.js`. As variantes clara e escura são calculadas a partir dela.

`course.js`:

```js
window.UC_COURSE = {
  // …
  accentColor: "#0F766E",
};
```

A cor é usada como texto sobre branco e como fundo de texto branco, por isso precisa de um contraste de pelo menos 4.5:1 com o branco. Se não tiver, o kit aplica-a na mesma e avisa na consola do navegador, com a razão calculada. Mais em [Nível 0: course.js](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/course-js.md#cor).

## 2. Escolher um tema pronto

O kit traz três temas prontos em `kit/v1/themes/`. Cada um é um ficheiro pequeno que só redefine tokens, por isso combina com tudo o resto: a cor do `course.js` e o `theme.css` continuam a funcionar por cima dele.

| Tema | O que muda | Para quê |
| --- | --- | --- |
| `compact` | Letra a 15 px, menos espaço entre blocos, cantos menores, cabeçalho mais baixo. Os alvos de toque continuam com 44 px. | Sites com muito conteúdo por página: listas longas de problemas, sumários, tabelas. |
| `serif` | Texto na letra com serifa do sistema (Charter, Cambria, Georgia), sem nada para descarregar, e um pouco mais de espaço entre linhas. O código mantém a letra monoespaçada. | Um aspeto mais clássico, ou páginas com muito texto corrido. |
| `high-contrast` | Texto preto, cinzentos e bordas mais escuros, cores de estado mais fortes, cor de destaque azul-escura (10:1) e anel de foco mais grosso. | Projetar nas aulas, ecrãs com pouca qualidade, leitores com baixa visão (próximo do nível AAA). |

O modelo do site já vem com `theme: "classic"` no `course.js`. É o aspeto do kit, que já está no `uc-kit.css`, por isso não descarrega nada; os temas acima juntam-se a ele numa lista: `theme: ["classic", "compact"]`. Um tema pode também escolher o layout das páginas, com a propriedade [`--uc-layout`](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/tokens.md#escolhas); o `layout` do `course.js` e o atributo da página ganham-lhe sempre.

A mesma semana e o mesmo cartão, primeiro com o aspeto do kit e depois com cada tema:

Exemplo (semana e cartão sem tema pronto), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/themes/padrao.html):

```html
<div class="uc-stack">
  <uc-week n="10" title="Pesquisa binária e árvores">
    <p>Guião 10: <a href="#">inserir e procurar numa árvore</a>.</p>
  </uc-week>
  <div class="uc-card">
    <p><span class="uc-tag uc-tag--accent">Trabalho 2</span> <span class="uc-tag uc-tag--warning">Avaliação</span></p>
    <p>Entrega até 28 de novembro, às 23:59, pela plataforma de entregas.</p>
    <p><a class="uc-button uc-button--primary" href="#">Ver enunciado</a> <a class="uc-button" href="#">Perguntas frequentes</a></p>
  </div>
</div>
```

Exemplo (semana e cartão com o tema compact), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/themes/compact.html):

```html
<link rel="stylesheet" href="../../../kit/v1/themes/compact.css">

<div class="uc-stack">
  <uc-week n="10" title="Pesquisa binária e árvores">
    <p>Guião 10: <a href="#">inserir e procurar numa árvore</a>.</p>
  </uc-week>
  <div class="uc-card">
    <p><span class="uc-tag uc-tag--accent">Trabalho 2</span> <span class="uc-tag uc-tag--warning">Avaliação</span></p>
    <p>Entrega até 28 de novembro, às 23:59, pela plataforma de entregas.</p>
    <p><a class="uc-button uc-button--primary" href="#">Ver enunciado</a> <a class="uc-button" href="#">Perguntas frequentes</a></p>
  </div>
</div>
```

Exemplo (semana e cartão com o tema serif), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/themes/serif.html):

```html
<link rel="stylesheet" href="../../../kit/v1/themes/serif.css">

<div class="uc-stack">
  <uc-week n="10" title="Pesquisa binária e árvores">
    <p>Guião 10: <a href="#">inserir e procurar numa árvore</a>.</p>
  </uc-week>
  <div class="uc-card">
    <p><span class="uc-tag uc-tag--accent">Trabalho 2</span> <span class="uc-tag uc-tag--warning">Avaliação</span></p>
    <p>Entrega até 28 de novembro, às 23:59, pela plataforma de entregas.</p>
    <p><a class="uc-button uc-button--primary" href="#">Ver enunciado</a> <a class="uc-button" href="#">Perguntas frequentes</a></p>
  </div>
</div>
```

Exemplo (semana e cartão com o tema high-contrast), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/themes/high-contrast.html):

```html
<link rel="stylesheet" href="../../../kit/v1/themes/high-contrast.css">

<div class="uc-stack">
  <uc-week n="10" title="Pesquisa binária e árvores">
    <p>Guião 10: <a href="#">inserir e procurar numa árvore</a>.</p>
  </uc-week>
  <div class="uc-card">
    <p><span class="uc-tag uc-tag--accent">Trabalho 2</span> <span class="uc-tag uc-tag--warning">Avaliação</span></p>
    <p>Entrega até 28 de novembro, às 23:59, pela plataforma de entregas.</p>
    <p><a class="uc-button uc-button--primary" href="#">Ver enunciado</a> <a class="uc-button" href="#">Perguntas frequentes</a></p>
  </div>
</div>
```

### Escolher no course.js

A forma mais simples é o campo `theme` do `course.js`: o kit acrescenta o ficheiro do tema logo a seguir ao `uc-kit.css`, do mesmo sítio de onde vem o kit, e só mostra a página depois de ele carregar. Vários temas escrevem-se numa lista e aplicam-se por essa ordem.

`course.js`:

```js
window.UC_COURSE = {
  // …
  accentColor: "#0F766E",
  theme: ["compact", "serif"],
};
```

Um nome que não seja um dos temas é ignorado, com um aviso na consola.

### Escolher com um `<link>`

O mesmo tema também se carrega com uma linha no `<head>` de cada página, entre o `uc-kit.css` e o `theme.css`. Assim o tema aplica-se mesmo sem JavaScript e o navegador descarrega-o logo no início.

`index.html`:

```html
<link rel="stylesheet" href="https://uc-design-kit.miguelrocha.dev/kit/v1/uc-kit.css">
<link rel="stylesheet" href="https://uc-design-kit.miguelrocha.dev/kit/v1/themes/compact.css">
<link rel="stylesheet" href="theme.css">
```

Um tema que já esteja num `<link>` da página não é acrescentado outra vez, por isso as duas formas podem conviver.

> **Alto contraste e `accentColor`.** O `accentColor` do `course.js` ganha à cor do tema `high-contrast`. Com esse tema, ou se apaga o campo (fica o azul-escuro do tema) ou se escolhe uma cor com pelo menos 7:1 com o branco.

## 3. Começar o theme.css

O `theme.css` do [modelo](https://uc-design-kit.miguelrocha.dev/docs/pt/criar-site.md) já traz todos os tokens do kit, agrupados (cor de destaque, neutros, aviso, sucesso e erro, tipografia, forma e espaço, layout) e comentados, cada um com o valor do kit. Uma linha comentada não muda nada; para mudar um token, tiram-se as marcas de comentário dessa linha e muda-se o valor. Para um site que já existe, o mesmo ficheiro pode ser descarregado:

[Descarregar theme.css](https://uc-design-kit.miguelrocha.dev/docs/downloads/theme.css)

`theme.css`:

```css
:root {
  /* Cor de destaque (o accentColor do course.js prevalece sobre esta) */
  /* --uc-color-accent: #1D4ED8; */
  …
  /* Forma e espaço */
  /* --uc-radius-sm: 6px; */
  /* --uc-radius-md: 8px; */
  --uc-radius-lg: 4px;   /* Esta linha foi descomentada: os cartões ficam com cantos de 4 px. */
  …
}
```

O ficheiro é gerado a partir dos tokens do kit em cada versão, por isso tem sempre a lista atual. Não é preciso apagar as linhas que ficam comentadas, mas pode-se: um `theme.css` só com o que muda é mais fácil de ler no ano seguinte. No fim do ficheiro há lugar para o [CSS livre (nível 2)](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/css.md).

### Os temas prontos como exemplo

Os temas prontos são ficheiros deste mesmo formato: um bloco `:root` só com os tokens que mudam. Servem de modelo para um tema próprio, ou de base para copiar e ajustar.

`compact.css`:

```css
/*
 * Ready-made theme "compact" (docs/api.md 8.1): smaller type, tighter
 * spacing and corners, for sites with a lot of content per page. Touch
 * targets keep their 44 px.
 */
:root {
  --uc-font-size-base: 93.75%;
  --uc-line-height: 1.55;
  --uc-radius-sm: 4px;
  --uc-radius-md: 6px;
  --uc-radius-lg: 8px;
  --uc-space-5: 16px;
  --uc-space-6: 20px;
  --uc-space-7: 24px;
  --uc-space-8: 24px;
  --uc-space-10: 32px;
  --uc-space-12: 36px;
  --uc-sidebar-width: 200px;
  --uc-header-height: 56px;
}
```

`serif.css`:

```css
/*
 * Ready-made theme "serif" (docs/api.md 8.1): body text in the system's serif
 * font (no download), a little more line spacing. Code, dates and codes keep
 * the monospaced font.
 */
:root {
  --uc-font-sans: Charter, "Bitstream Charter", "Sitka Text", Cambria, Georgia, serif;
  --uc-line-height: 1.65;
}
```

`high-contrast.css`:

```css
/*
 * Ready-made theme "high-contrast" (docs/api.md 8.1): darker text, borders
 * and status colours, a darker default accent and a thicker focus ring.
 * accentColor in course.js still wins: choose one with at least 7:1 on white.
 */
:root {
  --uc-color-accent: #1E3A8A;
  --uc-color-text: #000000;
  --uc-color-text-secondary: #18181B;
  --uc-color-text-muted: #27272A;
  --uc-color-text-subtle: #3F3F46;
  --uc-color-border: #71717A;
  --uc-color-warning-text: #78350F;
  --uc-color-warning-border: #B45309;
  --uc-color-success-text: #14532D;
  --uc-color-danger-text: #7F1D1D;
  --uc-focus-ring: 3px solid var(--uc-color-accent);
}
```

## 4. Experimentar no personalizador

O [Personalizador de tema](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/tema.md) mostra o curso de demonstração com as escolhas aplicadas: tema pronto, cor de destaque, cantos, tamanho e tipo de letra, largura do conteúdo. O resultado sai em dois separadores:

- **course.js**: a linha `accentColor` e, com um tema pronto, a linha `theme`.
- **theme.css**: só os tokens que mudaram, ou, com a opção **Ficheiro completo**, o `theme.css` inicial inteiro com esses tokens já descomentados. O botão "Descarregar theme.css" guarda o que estiver no separador.

As escolhas ficam no endereço da página, que pode ser enviado a um colega.

## 5. Verificar o contraste

Cada cor nova tem de manter o contraste mínimo do WCAG 2.1 (nível AA) com o fundo onde aparece: 4.5:1 para texto normal, 3:1 para texto grande e para bordas de controlos. Os pares a verificar são estes:

| Texto ou elemento | Sobre | Mínimo |
| --- | --- | --- |
| `--uc-color-accent` | branco e `--uc-color-accent-soft` | 4.5:1 |
| `--uc-color-on-accent` | `--uc-color-accent` (botões principais) | 4.5:1 |
| `--uc-color-text`, `-text-secondary`, `-text-muted`, `-text-subtle` | `--uc-color-surface`, `-surface-muted` e `-surface-sunken` | 4.5:1 |
| `--uc-color-warning-text` | `--uc-color-warning-bg` e `-warning-surface` | 4.5:1 |
| `--uc-color-success-text`, `--uc-color-danger-text` | `--uc-color-success-bg`, `--uc-color-danger-bg` | 4.5:1 |

- **A cor de destaque**: o personalizador calcula as duas razões e avisa abaixo de 4.5:1; o kit avisa também na consola.
- **As outras cores**: nas ferramentas de programador do navegador (Chrome, Edge e Firefox mostram a razão de contraste ao inspecionar um texto) ou numa calculadora de contraste, com os dois valores hexadecimais.
- **A cor não é a única pista.** Estados como "concluído" e "próximo" têm também texto ou ícone; um tema não deve esconder esse texto.

Os temas prontos já cumprem estes mínimos: a verificação automática do kit corre o axe-core sobre páginas com cada um deles. Mais em [Acessibilidade](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/acessibilidade.md).

## Exemplo completo

Um site compacto, verde-azulado, com cantos retos nos cartões e títulos das semanas em maiúsculas:

`course.js`:

```js
accentColor: "#0F766E",
theme: "compact",
```

`theme.css`:

```css
:root {
  --uc-radius-lg: 0;
}

/* Nível 2: CSS livre. */
.uc-week__title { text-transform: uppercase; letter-spacing: 0.02em; }
```

## Ver também

- [Personalizador de tema](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/tema.md): escolher a ver o resultado.
- [Nível 1: tokens](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/tokens.md): o `theme.css`, a ordem de carregamento e os tokens locais.
- [Tokens](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/tokens.md): a lista completa, com o uso de cada um.
- [uc-page](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-page.md#navegacao-no-topo): a disposição da página (navegação lateral, no topo ou nenhuma), com `layout`.
