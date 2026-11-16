# Blocos: superfícies e listas

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/superficies.html

Cartões e caixas para destacar um bloco de conteúdo, e quatro estilos de lista: ligações com descrição, atalhos, objetivos e listas simples. São só CSS: aplicam-se a HTML normal com uma classe.

Como os outros blocos, têm especificidade zero e leem os tokens de cor (ver [Cor](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/cor.md)): mudar `accentColor` no `course.js` muda as bordas de destaque e os ícones das listas.

## `uc-card`

Uma superfície com borda e cantos arredondados, para um bloco que se lê sozinho: uma componente de avaliação, um trabalho, uma pessoa.

Exemplo (cartão com título e texto), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/blocks/card.html):

```html
<div class="uc-card">
  <h3>Trabalho 2</h3>
  <p>Árvore binária de pesquisa com inserção, remoção e travessias. Entrega até 28 de novembro.</p>
</div>
```

### `uc-card--accent`

A borda fica na cor do curso. Serve para destacar um cartão entre vários, como o próximo prazo.

Exemplo (cartão destacado ao lado de um normal), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/blocks/card-accent.html):

```html
<div class="uc-grid">
  <div class="uc-card uc-card--accent">
    <h3>Trabalho 2</h3>
    <p>Entrega até 28 de novembro: é a próxima.</p>
  </div>
  <div class="uc-card">
    <h3>Trabalho 1</h3>
    <p>Notas disponíveis desde 6 de novembro.</p>
  </div>
</div>
```

### Cartão como ligação

Com `<a class="uc-card">` o cartão inteiro é a ligação: o texto mantém a cor normal, sem sublinhado, e a borda muda de cor ao passar o rato.

Exemplo (dois cartões que são ligações), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/blocks/card-link.html):

```html
<div class="uc-grid">
  <a class="uc-card" href="../semanas.html">
    <h3>Semanas</h3>
    <p>Matéria, slides e guiões de cada semana.</p>
  </a>
  <a class="uc-card" href="../avaliacao.html">
    <h3>Avaliação</h3>
    <p>Componentes da nota e datas das provas.</p>
  </a>
</div>
```

| Classe ou token | Efeito |
| --- | --- |
| `uc-card` | Coluna flex com 8 px entre filhos, borda `--uc-color-border`, raio `--uc-radius-lg`, fundo `--uc-color-surface`. |
| `uc-card--accent` | Borda `--uc-color-accent`. |
| `a.uc-card` | Sem sublinhado nem cor de ligação; borda na cor do curso em `:hover`. |
| `--uc-card-padding` | Espaço interior; por omissão `20px 24px`. |

Num cartão que é ligação, todo o texto passa a ser o nome da ligação lido pelo leitor de ecrã: convém um título curto e uma frase, sem outras ligações nem botões lá dentro. O destaque de `--accent` é só cor; se o destaque tiver significado ("o próximo"), deve estar também no texto.

## `uc-callout`

Uma caixa de fundo cinzento claro, sem borda, para uma regra ou nota que não pode passar despercebida.

Exemplo (caixa com a regra de aprovação), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/blocks/callout.html):

```html
<div class="uc-callout">
  <p><strong>Para aprovar:</strong> nota final de pelo menos 9,5 valores e pelo menos 40% no exame.</p>
</div>
```

### `uc-callout--warning`

Fundo e borda âmbar, para correções e alterações: um enunciado corrigido, uma sala que mudou.

Exemplo (caixa de aviso com título), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/blocks/callout-warning.html):

```html
<div class="uc-callout uc-callout--warning">
  <h3>Enunciado corrigido</h3>
  <p>Na alínea 3 do trabalho 2, a função devolve uma lista, não um vetor.</p>
</div>
```

| Classe | Efeito |
| --- | --- |
| `uc-callout` | Coluna flex, fundo `--uc-color-surface-muted`, raio `--uc-radius-lg`. |
| `uc-callout--warning` | Fundo `--uc-color-warning-surface` e borda `--uc-color-warning-border`. |

A cor não é anunciada por leitores de ecrã: o texto deve dizer que é um aviso ("Enunciado corrigido", "Atenção:"). Dentro de `uc-content`, a caixa passa a fluxo normal para aceitar texto e elementos em linha misturados (ver [Tipografia](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/tipografia.md)).

## `uc-links`

Uma lista de ligações separadas por linhas, cada uma com uma descrição curta por baixo: materiais, enunciados, recursos.

Exemplo (três ligações com descrição), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/blocks/links.html):

```html
<ul class="uc-links">
  <li><a href="../semanas.html">Slides 9: pesquisa binária e árvores</a><span>PDF, 1,2 MB</span></li>
  <li><a href="../semanas.html">Guião 10: inserir e procurar numa árvore</a><span>Aula prática da semana 10</span></li>
  <li><a href="../avaliacao.html">Enunciado do trabalho 2</a><span>Entrega até 28 de novembro</span></li>
</ul>
```

| Elemento | Efeito |
| --- | --- |
| `ul.uc-links` | Sem marcadores nem recuo. |
| `li` | Uma linha por item, separadas por uma borda. |
| `a` | Peso 500. |
| `li > span` | Descrição em `--uc-color-text-muted`, 14 px. |

A descrição fica fora da ligação: o nome da ligação deve fazer sentido sozinho. O formato e o tamanho de ficheiros (PDF, ZIP) cabem bem na descrição.

## `uc-shortcuts`

Atalhos grandes, em grelha, para as páginas mais visitadas. Cada um tem pelo menos 48 px de altura e uma seta no fim.

Exemplo (três atalhos), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/blocks/shortcuts.html):

```html
<ul class="uc-shortcuts">
  <li><a href="../semanas.html">Semanas e guiões</a></li>
  <li><a href="../avaliacao.html">Avaliação</a></li>
  <li><a href="../sobre.html">Programa</a></li>
</ul>
```

Aceita duas formas: uma `<ul>` com uma ligação por `<li>`, como acima, ou um `<nav>` com as ligações diretamente lá dentro. Com `<nav>` dá-se um nome à região, para não se confundir com a navegação principal.

`index.html`:

```html
<nav class="uc-shortcuts" aria-label="Acesso rápido">
  <a href="semanas.html">Semanas e guiões</a>
  <a href="avaliacao.html">Avaliação</a>
</nav>
```

| Elemento | Efeito |
| --- | --- |
| `.uc-shortcuts` | Grelha de colunas com pelo menos 200 px, sem marcadores. |
| `a` | Caixa com borda, 48 px de altura mínima e "→" no fim; borda e texto na cor do curso em `:hover`. |

Três a seis atalhos chegam; com mais, perde-se a ideia de acesso rápido. O texto de cada um é o nome da página de destino.

## `uc-checklist`

Uma lista com um visto na cor do curso em cada item. Serve para objetivos, competências, o que levar para um teste.

Exemplo (três objetivos), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/blocks/checklist.html):

```html
<ul class="uc-checklist">
  <li>Escrever programas pequenos e bem estruturados.</li>
  <li>Escolher a estrutura de dados adequada a cada problema.</li>
  <li>Analisar o tempo de execução de um algoritmo.</li>
</ul>
```

| Elemento | Efeito |
| --- | --- |
| `ul.uc-checklist` | Coluna flex com 12 px entre itens, sem marcadores. |
| `li::before` | Ícone de 22 px em `--uc-color-accent`, desenhado com `mask`. |

O ícone é decorativo e não é lido. Não é uma lista de tarefas: os itens não se marcam. Para exercícios que o estudante marca como feitos há o [`<uc-exercise>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-exercise.md).

## `uc-bullets`

Uma lista com os marcadores normais, mais espaço entre itens e a largura limitada a 720 px para se ler bem. Funciona também em `<ol>`, com números.

Exemplo (lista de regras), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/blocks/bullets.html):

```html
<ul class="uc-bullets">
  <li>Os trabalhos são individuais e entregues pela plataforma de entregas.</li>
  <li>Entregas fora do prazo não são aceites.</li>
  <li>A época de recurso substitui apenas a nota do exame.</li>
</ul>
```

| Elemento | Efeito |
| --- | --- |
| `.uc-bullets` | Coluna flex com 8 px entre itens, máximo de 720 px, cor `--uc-color-text-secondary`. |

Uma `<ul>` sem classe já tem marcadores e recuo; `uc-bullets` acrescenta o espaçamento e a cor do texto corrido, para regras e programas.

## Ver também

- [Blocos: layout](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/layout.md): secções, pilhas e grelhas onde estes blocos se arrumam.
- [Blocos: elementos](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/elementos.md): botões, etiquetas e tabelas.
- [Cor](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/cor.md): os tokens de cor que estes blocos leem.
