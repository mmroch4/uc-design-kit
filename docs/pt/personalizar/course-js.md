# Nível 0: course.js

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/course-js.html

Quatro campos do `course.js` mudam o aspeto e a navegação de todas as páginas sem uma linha de CSS: `accentColor`, `logo`, `pages` e `languages`. É o primeiro nível a experimentar e o que menos manutenção pede.

O curso de demonstração com outra cor e sem logótipo. Nada no HTML mudou, só o `course.js`:

Exemplo (o curso de demonstração com accentColor verde-azulado e sem logótipo), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/customize/accent.html):

```html
<uc-page current="home">
  <uc-hero></uc-hero>
  <uc-week n="10" title="Pesquisa binária e árvores">
    <p>Guião 10: <a href="#">inserir e procurar numa árvore</a>.</p>
  </uc-week>
</uc-page>
```

## Cor do curso

A cor de destaque aparece nos links, na navegação ativa, nos botões principais, na faixa da semana atual e nas palavras reservadas do código. Muda-se em três passos:

1. **Escolher a cor.** Tem de ter contraste de pelo menos 4.5:1 com o branco, porque é a cor dos links e do texto dos botões. Cores claras (amarelo, verde-lima, azul-céu) não servem; os tons escuros da mesma cor sim. O [Personalizador de tema](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/tema.md) mostra o contraste de cada cor.
2. **Escrever o campo.** Aceita qualquer cor CSS: `"#0F766E"`, `"rgb(15 118 110)"`, `"teal"`.

   `course.js`:

   ```js
   window.UC_COURSE = {
     title: "Algoritmos e Programação",
     accentColor: "#0F766E",
     // …
   };
   ```
3. **Recarregar a página.** As variantes são calculadas a partir desta cor: mais escura para o *hover*, quase branca para os fundos da navegação e das etiquetas, e um pouco mais clara para a semana atual. Não é preciso defini-las.

Uma cor que o browser não reconhece é ignorada, com um aviso `[uc-kit] course.js: accentColor … is not a valid CSS colour` na consola, e fica o azul do kit. O campo está descrito em [Curso](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#campos-curso).

> **accentColor ou token?** O kit aplica `accentColor` diretamente no elemento `<html>`, por isso ganha a um `--uc-color-accent` escrito no `theme.css`. A cor do curso define-se num só sítio, de preferência no `course.js`; para a controlar no `theme.css`, apaga-se o campo `accentColor` (o modelo traz-o preenchido). O [nível 1](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/tokens.md) fica para o resto dos tokens.

## Logótipo

O cabeçalho mostra, antes do nome do curso, um ícone de árvore do kit. O campo `logo` troca-o por uma imagem ou esconde-o:

`course.js`:

```js
logo: "logo.svg",   // an image next to course.js
logo: null,         // no image, only the course name
```

- **Tamanho.** A imagem é mostrada com 28 × 28 px. Uma imagem quadrada em SVG fica nítida em qualquer ecrã; em PNG, convém ter pelo menos 56 × 56 px.
- **Caminho.** Como os `href` das páginas, o caminho do logótipo é relativo ao `course.js`: `"logo.svg"` ao lado do `course.js` aparece também nas páginas em subpastas (`guioes/aula10.html`).
- **Texto alternativo.** Fica vazio, porque o nome do curso está mesmo ao lado. A imagem deve ter contraste suficiente com o fundo branco.

Ver [Curso](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#campos-curso) e, para o cabeçalho completo, [`<uc-page>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-page.md).

## Páginas e navegação

A navegação lateral, o seu nome e a sua ordem vêm de `pages`. Mudar a ordem, dar outro nome a uma página do kit ou acrescentar uma página própria é editar esta lista:

`course.js`:

```js
pages: [
  "home",
  { id: "weeks", href: "semanas.html" },
  { id: "projects", href: "projetos.html", label: { pt: "Projetos", en: "Projects" } },
  { id: "about", href: "sobre.html", label: "Ficha da UC" },
],
platforms: [
  { label: "Plataforma de entregas", url: "https://example.org/entregas" },
],
```

1. Cria-se o ficheiro da página (por exemplo `projetos.html`, copiado de outra página).
2. Acrescenta-se a entrada a `pages`, na posição em que deve aparecer. Um identificador que não é do kit precisa de `label`.
3. Na página nova, `<uc-page current="projects">` marca-a como ativa na navegação.

As ligações externas (Moodle, plataforma de submissões, fórum) vão para `platforms` e aparecem num grupo separado da navegação. Os pormenores estão em [Páginas](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#paginas) e [Navegação](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#campos-navegacao).

## Línguas

Com mais de uma língua em `languages`, o cabeçalho ganha o botão de troca de língua e o kit passa a esconder o conteúdo marcado com a língua que não está ativa:

`course.js`:

```js
languages: ["pt", "en"],   // the first one is the default
```

Os textos do kit (navegação, datas, botões) mudam sozinhos. O conteúdo escreve-se nas duas línguas, na mesma página ou num ficheiro por língua; ver [Línguas](https://uc-design-kit.miguelrocha.dev/docs/pt/linguas.md) e [os campos de línguas](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#campos-linguas).

## Quando não chega

O `course.js` não muda cantos, letra nem cores de estado, nem o aspeto de uma parte de um componente. Para isso passa-se ao [nível 1: tokens](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/tokens.md) e, se for preciso, ao [nível 2: CSS livre](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/css.md). O campo `runner`, que escolhe o serviço que executa código, tem a sua página: [Execução de código](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/execucao.md).

## Ver também

- [Personalizar: visão geral](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/index.md) dos cinco níveis.
- [O ficheiro course.js](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md): todos os campos e erros comuns.
- [Cor](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/cor.md): como o kit usa a cor de destaque.
