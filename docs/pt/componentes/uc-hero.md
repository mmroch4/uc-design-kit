# `<uc-hero>`

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-hero.html

O título da página inicial: código, nome e descrição do curso, escritos uma vez no `course.js` e mostrados com o nome como `<h1>`.

Exemplo (código, nome e descrição do curso), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-hero/basic.html):

```html
<uc-hero></uc-hero>
```

A demonstração mostra o código `AP0001`, o nome "Algoritmos e Programação" e a descrição do curso fictício. Nada disto está escrito no HTML: vem dos campos `code`, `title` e `tagline`.

## Utilização

O `<uc-hero>` vai no início da página inicial, dentro do `<uc-page>`. Como gera o `<h1>`, a página não precisa de outro.

`index.html`:

```html
<uc-page>
  <uc-hero></uc-hero>
  <uc-this-week></uc-this-week>
  …
</uc-page>
```

`course.js`:

```js
window.UC_COURSE = {
  code: "AP0001",                       // por cima do nome, em letra mono
  title: "Algoritmos e Programação",    // o <h1>
  tagline: "Um curso fictício usado nas demonstrações da documentação do UC Design Kit.",
};
```

Sem `code` ou sem `tagline`, a linha correspondente não aparece. O nome é o mesmo do cabeçalho do `<uc-page>`, por isso muda nos dois sítios ao mesmo tempo.

## Exemplos

### Com conteúdo por baixo

O que estiver escrito dentro do `<uc-hero>` aparece por baixo da descrição, no mesmo bloco. Aqui, três atalhos com a classe `uc-shortcuts`; podia ser também um parágrafo com o horário ou um botão para a plataforma de entregas.

Exemplo (título do curso com três atalhos por baixo), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-hero/children.html):

```html
<uc-hero>
  <ul class="uc-shortcuts">
    <li><a href="#">Semanas e guiões</a></li>
    <li><a href="#">Avaliação</a></li>
    <li><a href="#">Programa</a></li>
  </ul>
</uc-hero>
```

### Noutra língua

Num site bilingue, `title` e `tagline` escrevem-se com um texto por língua e o `<uc-hero>` mostra o da língua ativa. Esta demonstração abre em inglês com `?lang=en`.

Exemplo (título e descrição em inglês), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-hero/languages.html?lang=en):

```html
<uc-hero></uc-hero>
```

`course.js`:

```js
languages: ["pt", "en"],
title: { pt: "Algoritmos e Programação", en: "Algorithms and Programming" },
tagline: {
  pt: "Um curso fictício usado nas demonstrações da documentação do UC Design Kit.",
  en: "A fictional course used in the demos of the UC Design Kit documentation.",
},
```

O código do curso é um texto simples e não muda com a língua. O conteúdo escrito dentro do componente segue as regras habituais: marcado com `lang`, aparece só na sua língua (ver [Línguas](https://uc-design-kit.miguelrocha.dev/docs/pt/linguas.md#mesma-pagina)).

## Atributos

Não tem atributos.

## Configuração usada

Campos do `course.js` que o componente lê. Só `title` é obrigatório no `course.js`; os outros dois são opcionais.

| Campo | Para quê |
| --- | --- |
| [`code`](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#campos-curso) | Código do curso, por cima do nome. |
| [`title`](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#campos-curso) | Nome do curso, no `<h1>`. |
| [`tagline`](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#campos-curso) | Descrição numa frase, por baixo do nome. |
| [`languages`](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#campos-linguas) | Escolher o texto de `title` e `tagline` na língua ativa. |

A referência completa dos campos está em [O ficheiro course.js](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#campos-curso).

## Personalizar

Estas classes são estáveis na versão 1 e podem ser usadas num `theme.css`. As regras do kit têm especificidade zero, por isso qualquer regra do professor ganha. O método está em [Nível 2: CSS livre](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/css.md); para mudar só cores, cantos ou letra em todo o site bastam os [tokens](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/tokens.md).

| Classe | Elemento |
| --- | --- |
| `.uc-hero` | O bloco (o próprio `<uc-hero>`), uma coluna com espaço entre as linhas. |
| `.uc-hero__code` | O código do curso. |
| `.uc-hero__title` | O `<h1>` com o nome. |
| `.uc-hero__tagline` | A descrição, com no máximo 640 px de largura. |

`theme.css`:

```css
/* Código do curso na cor do curso. */
.uc-hero__code { color: var(--uc-color-accent); font-weight: 600; }

/* Descrição em toda a largura. */
.uc-hero__tagline { max-width: none; }
```

## Acessibilidade

### O que o componente faz

Gera o `<h1>` da página com o nome do curso na língua ativa, e o código e a descrição como parágrafos antes e depois dele. O conteúdo acrescentado fica a seguir, pela mesma ordem em que foi escrito.

### O que cabe a quem escreve

Não escrever outro `<h1>` na mesma página e começar as secções seguintes em `<h2>`. Uma descrição curta, de uma frase, e links acrescentados com texto que diga para onde vão.

## Sem JavaScript

Se o kit não carregar, o código, o nome e a descrição não aparecem, porque vêm do `course.js`; a página fica sem `<h1>`. O conteúdo escrito dentro do componente continua visível.

## Ver também

- [`<uc-page>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-page.md): o corpo da página, cujo cabeçalho mostra o mesmo nome.
- [`<uc-this-week>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-this-week.md): o cartão "Esta semana", que costuma vir logo a seguir na página inicial.
- [Criar o meu site](https://uc-design-kit.miguelrocha.dev/docs/pt/criar-site.md#configurar): o passo em que se mudam o nome e a descrição no `course.js`.
- Uso real: [a página inicial de Estruturas de Dados 2025/26](https://uc-design-kit.miguelrocha.dev/examples/edados-2526/index.html).
