# Cabeçalhos

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/seccoes/cabecalhos.html

O topo de uma página: o título e uma frase, com localização, etiquetas e botões quando a página precisa deles.

Tema das pré-visualizações

Padrão

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
