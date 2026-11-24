# Cabeçalhos

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/seccoes/cabecalhos.html

O topo de uma página: o título e uma frase, com localização, etiquetas e botões quando a página precisa deles.

Tema das pré-visualizações

Clássico (padrão)

Moderno (modern)

Institucional (institutional)

Manual (handbook)

Editorial (editorial)

Compacto (compact)

Com serifa (serif)

Alto contraste (high-contrast)

O código copiado é o mesmo em todos: o tema escolhe-se uma vez, no [course.js](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/criar-tema.md#temas-prontos).

## Título e introdução

O cabeçalho da maioria das páginas: o `<h1>` e uma frase que diz para que serve a página.

Exemplo (cabeçalho simples), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/sections/header-simple.html):

```html
<header class="uc-page-header">
  <h1>Avaliação</h1>
  <p class="uc-prose">A nota final soma quatro componentes. Para aprovar é preciso ter pelo menos 9,5 valores no total e 8 no exame.</p>
</header>
```

- `uc-page-header` afasta o título e a introdução 12 px; a página afasta as secções seguintes 48 px.
- Blocos: [Blocos: layout](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/layout.md).

## Com localização e ações

Para páginas que não estão no menu, como um guião ou um enunciado: a localização leva de volta à lista, a etiqueta e os botões dizem o essencial logo no topo.

Exemplo (cabeçalho com localização e ações), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/sections/header-crumbs.html):

```html
<header class="uc-page-header">
  <nav class="uc-crumbs" aria-label="Localização">
    <ol>
      <li><a href="#">Semanas</a></li>
      <li aria-current="page">Guião 10</li>
    </ol>
  </nav>
  <p class="uc-eyebrow">Semana 10 · Aula prática</p>
  <h1>Recursividade sobre listas</h1>
  <p class="uc-prose">Escrever funções recursivas que percorrem, filtram e invertem listas ligadas.</p>
  <p><span class="uc-tag uc-tag--accent">Avaliado</span> <span class="uc-tag uc-tag--muted">2 horas</span></p>
  <p><a class="uc-button uc-button--primary" href="#">Descarregar o código base</a> <a class="uc-button" href="#">Soluções da semana anterior</a></p>
</header>
```

- Tire o que não precisar: a localização (`uc-crumbs`), o sobretítulo (`uc-eyebrow`), as etiquetas ou os botões.
- `uc-button--primary` só na ação principal; as outras ficam com `uc-button`.

## Página inicial

O código, o nome e a frase da cadeira vêm do `course.js`; o que se escreve dentro aparece por baixo.

Exemplo (cabeçalho da página inicial), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/sections/header-hero.html):

```html
<uc-hero>
  <p><a class="uc-button uc-button--primary" href="#">Começar pela semana 1</a> <a class="uc-button" href="#">Ficha da unidade curricular</a></p>
</uc-hero>
```

- Componente: [`<uc-hero>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-hero.md).

## Mosaico de secções

Uma página inicial que é um ponto de partida: a seguir ao título, um cartão por página da cadeira, com uma frase. É o padrão do MIT OpenCourseWare e de muitas páginas iniciais do Canvas. Os cartões vêm de `pages` do `course.js`; o das semanas diz em que semana estamos.

Exemplo (página inicial com um mosaico das páginas), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/sections/home-tiles.html):

```html
<uc-hero></uc-hero>
<uc-tiles pages="weeks, assessment, about"></uc-tiles>
```

- Na página inicial, sem `pages`, o `<uc-tiles>` mostra todas as outras páginas, pela ordem do `course.js`; aqui `pages` escolhe três.
- A frase de cada cartão é o campo `description` da página. Componente: [`<uc-tiles>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-tiles.md).

## Calendário primeiro

Uma página inicial que é o calendário das aulas, como a do CS61A em Berkeley e as de muitas cadeiras de Stanford: cada semana numa linha, com a matéria e a ligação para o guião, e a semana atual marcada. Serve para cadeiras em que o aluno volta ao site sobretudo para saber o que há esta semana.

Exemplo (página inicial com a tabela das semanas), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/sections/home-calendar.html):

```html
<header class="uc-page-header">
  <h1>Algoritmos e Programação</h1>
  <p class="uc-prose">O calendário das aulas é a página inicial: cada semana, a matéria e o guião.</p>
</header>
<uc-weeks view="compact">
  <uc-week n="5" title="Listas e cadeias de caracteres" href="#"><p><a href="#">Listas e cadeias de caracteres</a></p></uc-week>
  <uc-week n="6" title="Complexidade e notação O" href="#"><p><a href="#">Complexidade e notação O</a></p></uc-week>
  <uc-week n="7" title="Recursão" href="#"><p><a href="#">Recursão</a></p></uc-week>
  <uc-week n="8" title="Ordenação simples: seleção e inserção" href="#"><p><a href="#">Ordenação simples: seleção e inserção</a></p></uc-week>
  <uc-week n="9" title="Ordenação por fusão e quicksort" href="#"><p><a href="#">Ordenação por fusão e quicksort</a></p></uc-week>
  <uc-week n="10" title="Dicionários e conjuntos" href="#"><p><a href="#">Dicionários e conjuntos</a></p></uc-week>
  <uc-week n="11" title="Árvores binárias"><p>Árvores binárias</p></uc-week>
  <uc-week n="12" title="Revisões"><p>Revisões</p></uc-week>
</uc-weeks>
```

- `<uc-weeks view="compact">` mostra uma linha por semana; as datas vêm de `semester` no `course.js`. Componente: [`<uc-weeks>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-weeks.md).
- Cada semana é um `<uc-week n>` com `title` e, quando o guião já existe, `href`; as semanas sem `href` aparecem sem ligação.
