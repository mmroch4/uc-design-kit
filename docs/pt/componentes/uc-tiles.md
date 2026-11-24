# `<uc-tiles>`

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-tiles.html

Um mosaico para a página inicial: um cartão por página da cadeira, com o nome e uma frase, lidos do `course.js`. O cartão das semanas diz em que semana estamos.

Exemplo (um cartão por página do curso), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-tiles/basic.html):

```html
<uc-tiles></uc-tiles>
```

Os nomes e as ligações vêm de `pages` e as frases do campo `description` de cada página. A demonstração não é nenhuma das páginas do curso, por isso mostra todas, incluindo "Início"; na página inicial, o cartão dela não aparece. O cartão "Semanas" mostra a semana de aulas atual (o dia está fixo em 27 de novembro nas demonstrações) e tem o fundo da cor do curso, como o cartão "Esta semana".

## Utilização

O `<uc-tiles>` vai na página inicial, normalmente a seguir ao `<uc-hero>`. É o padrão do MIT OpenCourseWare e de muitas páginas iniciais do Canvas: em vez de uma página longa, um ponto de partida para cada parte do site.

`index.html`:

```html
<uc-page>
  <uc-hero></uc-hero>
  <uc-tiles></uc-tiles>
  …
</uc-page>
```

`course.js`:

```js
pages: [
  "home",
  { id: "weeks", href: "semanas.html", description: "Guiões, slides e exercícios de cada semana." },
  { id: "assessment", href: "avaliacao.html", description: "Componentes, datas e regras da nota final." },
  { id: "about", href: "sobre.html" },   // sem description: o cartão só tem o nome
],
```

A página atual (a página inicial, onde o mosaico costuma estar) não tem cartão. Uma página sem `description` tem um cartão só com o nome. Num site bilingue, a frase escreve-se com um texto por língua, como o `label`: `description: { pt: "…", en: "…" }`.

## Exemplos

### Escolher as páginas

Com `pages`, o mosaico mostra só as páginas indicadas, pela ordem escrita. Serve para destacar duas ou três páginas, ou para pôr o mosaico noutra página que não a inicial.

Exemplo (dois cartões escolhidos, pela ordem dada), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-tiles/pages.html):

```html
<uc-tiles pages="assessment, weeks"></uc-tiles>
```

## Atributos

| Atributo | Valores | Por omissão | Descrição |
| --- | --- | --- | --- |
| `pages` | `id` de páginas, separados por vírgulas ou espaços | todas as páginas menos a atual | Os cartões a mostrar e a sua ordem, por exemplo `pages="weeks, assessment"`. Um `id` que não está em `pages` do `course.js` é ignorado com um aviso na consola. |

## Configuração usada

| Campo | Para quê |
| --- | --- |
| [`pages`](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#paginas) | Um cartão por página, com o `label` (ou o nome do kit), o `href` e a `description`. |
| [`semester`](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#campos-semestre) | A semana de aulas atual no cartão da página `weeks`. |
| [`languages`](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#campos-linguas) | Escolher o nome e a frase na língua ativa. |

A referência completa dos campos está em [O ficheiro course.js](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#paginas).

## Personalizar

Estas classes são estáveis na versão 1 e podem ser usadas num `theme.css`. As regras do kit têm especificidade zero, por isso qualquer regra do professor ganha. Cada cartão é também um `.uc-card`, por isso muda com os temas que mudam os cartões.

| Classe | Elemento |
| --- | --- |
| `.uc-tiles` | O próprio `<uc-tiles>`. |
| `.uc-tiles__list`, `.uc-tiles__item` | A lista (uma grelha de colunas de pelo menos 240 px) e cada item. |
| `.uc-tiles__link`, `.uc-tiles__link--now` | O cartão, uma ligação com a classe `uc-card`; `--now` no cartão das semanas durante o semestre. |
| `.uc-tiles__title`, `.uc-tiles__meta`, `.uc-tiles__text` | O nome da página, a semana atual (só no cartão das semanas) e a frase de `description`. |

`theme.css`:

```css
/* Duas colunas no máximo. */
.uc-tiles__list { grid-template-columns: repeat(auto-fill, minmax(min(360px, 100%), 1fr)); }
```

## Acessibilidade

### O que o componente faz

Escreve uma lista de ligações, uma por cartão, por isso um leitor de ecrã anuncia quantos cartões há. O nome da ligação é o nome da página seguido da semana e da frase. O cartão inteiro é a área de clique e o foco do teclado contorna-o.

### O que cabe a quem escreve

Frases curtas, que digam o que há na página, e nomes de páginas distintos. O mosaico não tem título: se a página precisar de um, ponha um `<h2>` antes dele.

## Sem JavaScript

Se o kit não carregar, o mosaico fica vazio, porque os cartões vêm do `course.js`, tal como a navegação do site. Para uma página inicial que tenha de funcionar sem JavaScript, escreva as ligações no HTML, por exemplo com [`.uc-shortcuts`](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/superficies.md#shortcuts).

## Ver também

- [`<uc-hero>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-hero.md): o título da página inicial, que costuma vir antes.
- [`<uc-this-week>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-this-week.md): o cartão "Esta semana", com a matéria e as datas da semana.
- [Galeria de secções: Mosaico](https://uc-design-kit.miguelrocha.dev/docs/pt/seccoes/cabecalhos.md#mosaico), pronto a copiar.
- [O ficheiro course.js: Páginas](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#paginas), com o campo `description`.
