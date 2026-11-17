# Blocos: layout

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/layout.html

Quatro classes que arrumam o conteúdo na página: secções, pilhas com espaço regular, grelhas que se adaptam à largura e duas colunas que empilham no telemóvel. São só CSS e funcionam em qualquer página que carregue o `uc-kit.css`.

Todas as regras dos blocos usam `:where()` e têm especificidade zero: uma regra do `theme.css` ganha sempre, sem `!important`. Os valores de espaço vêm da escala `--uc-space-*` (ver [Espaço e forma](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/espaco.md)); alguns blocos leem também um **token local**, que se pode definir no próprio elemento para mudar só esse bloco (ver [Tokens](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/tokens.md)).

## `uc-section`

Uma secção da página: um título e o que lhe pertence, com 16 px entre cada elemento.

Exemplo (secção com título, parágrafo e lista), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/blocks/section.html):

```html
<section class="uc-section" aria-labelledby="regras">
  <h2 id="regras">Regras</h2>
  <p>Os trabalhos são individuais e entregues pela plataforma de entregas.</p>
  <ul class="uc-bullets">
    <li>Entregas fora do prazo não são aceites.</li>
    <li>O teste prático é feito nos laboratórios, sem consulta.</li>
  </ul>
</section>
```

O espaço *entre* secções não vem desta classe: dentro de [`<uc-page>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-page.md), os blocos de topo do conteúdo ficam a 48 px uns dos outros (token local `--uc-main-gap`). Fora do `<uc-page>`, juntam-se as secções num `uc-stack` com um espaço maior.

| Classe ou token | Efeito |
| --- | --- |
| `uc-section` | Coluna flex com `gap: var(--uc-space-4)` (16 px). |
| `--uc-main-gap` | Espaço entre os blocos de topo do `<uc-page>`; por omissão `48px`. Não é lido pela secção. |

Usa-se com `<section>` e `aria-labelledby` a apontar para o título: a secção passa a ser uma região com nome, que os leitores de ecrã listam. O título é um `<h2>` numa página com `<uc-hero>` ou outro `<h1>`.

## `uc-stack`

Empilha os filhos na vertical com o mesmo espaço entre todos, sem margens nos próprios elementos.

Exemplo (três blocos empilhados), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/blocks/stack.html):

```html
<div class="uc-stack">
  <p>O teste prático é a 10 de dezembro, às 14:00, nos laboratórios 1 e 2.</p>
  <div class="uc-callout">
    <p>Levar o cartão de estudante: sem ele não é possível entrar na sala.</p>
  </div>
  <p>A matéria é a das semanas 1 a 11.</p>
</div>
```

### Outro espaço

O token local `--uc-stack-gap` muda o espaço só dessa pilha. É o padrão do modelo para o cabeçalho de uma página interior: título e frase de introdução mais próximos.

Exemplo (título e introdução com 8 px entre eles), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/blocks/stack-gap.html):

```html
<div class="uc-stack" style="--uc-stack-gap: var(--uc-space-2)">
  <h1>Avaliação</h1>
  <p class="uc-prose">A nota final soma duas componentes. Para aprovar é preciso ter pelo menos 9,5 valores no total.</p>
</div>
```

| Classe ou token | Efeito |
| --- | --- |
| `uc-stack` | Coluna flex; os filhos ocupam a largura toda. |
| `--uc-stack-gap` | Espaço entre filhos; por omissão `16px`. |

Os filhos de uma coluna flex esticam à largura do contentor: um `uc-button` ou uma `uc-tag` soltos dentro de uma pilha ficam com a largura toda. Para o evitar, o botão vai dentro de um `<p>`.

## `uc-grid`

Uma grelha de colunas iguais: cabem tantas quantas a largura permite, cada uma com pelo menos 220 px, e no telemóvel fica uma só.

Exemplo (três cartões em grelha), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/blocks/grid.html):

```html
<div class="uc-grid">
  <div class="uc-card">
    <h3>Exame</h3>
    <p><strong>60%</strong> · época normal ou recurso, sem consulta.</p>
  </div>
  <div class="uc-card">
    <h3>Trabalhos</h3>
    <p><strong>20%</strong> · dois trabalhos individuais.</p>
  </div>
  <div class="uc-card">
    <h3>Teste prático</h3>
    <p><strong>20%</strong> · nos laboratórios, a 10 de dezembro.</p>
  </div>
</div>
```

### Colunas mais estreitas

Com `--uc-grid-min` mais pequeno cabem mais colunas. Útil para turmas, horários ou plataformas, com pouco texto cada.

Exemplo (seis cartões com colunas de pelo menos 140 px), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/blocks/grid-min.html):

```html
<div class="uc-grid" style="--uc-grid-min: 140px">
  <div class="uc-card"><strong>T1</strong><span class="uc-muted">2.ª, 10:00</span></div>
  <div class="uc-card"><strong>T2</strong><span class="uc-muted">4.ª, 10:00</span></div>
  <div class="uc-card"><strong>PL1</strong><span class="uc-muted">3.ª, 14:00</span></div>
  <div class="uc-card"><strong>PL2</strong><span class="uc-muted">3.ª, 16:00</span></div>
  <div class="uc-card"><strong>PL3</strong><span class="uc-muted">5.ª, 14:00</span></div>
  <div class="uc-card"><strong>PL4</strong><span class="uc-muted">5.ª, 16:00</span></div>
</div>
```

| Classe ou token | Efeito |
| --- | --- |
| `uc-grid` | `repeat(auto-fit, minmax(…, 1fr))`: colunas de largura igual que preenchem a linha. |
| `--uc-grid-min` | Largura mínima de cada coluna; por omissão `220px`. Nunca passa a largura do contentor. |
| `--uc-grid-gap` | Espaço entre células; por omissão `12px`. |

As células de uma linha ficam com a mesma altura. A ordem de leitura é a do HTML (da esquerda para a direita, linha a linha), por isso escreve-se pela ordem em que se quer que seja lido.

## `uc-split`

Duas colunas, a principal mais larga (proporção 3:2), que passam a uma só com a janela até 960 px de largura.

Exemplo (texto principal e caixa lateral), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/blocks/split.html):

```html
<div class="uc-split">
  <section class="uc-section" aria-labelledby="trabalho">
    <h2 id="trabalho">Trabalho 2</h2>
    <p>Implementar uma árvore binária de pesquisa com inserção, remoção e as três travessias, e medir o tempo de pesquisa com um milhão de chaves.</p>
    <p>O enunciado e o código base estão na página das semanas.</p>
  </section>
  <div class="uc-callout">
    <h3>Entrega</h3>
    <p>Até 28 de novembro, às 23:59, pela plataforma de entregas.</p>
  </div>
</div>
```

A pré-visualização é mais estreita do que 960 px, por isso mostra as colunas empilhadas; em "Abrir demo", numa janela larga, aparecem lado a lado. A página inicial do modelo usa-o para os avisos ao lado das próximas datas.

| Classe | Efeito |
| --- | --- |
| `uc-split` | Grelha `1.5fr 1fr` com 40 px entre colunas e alinhamento ao topo; uma coluna até 960 px. |

Foi pensado para dois filhos. Quando empilha, a segunda coluna fica por baixo, por isso o que importa mais vai primeiro no HTML. O ponto de quebra é o da janela, não o do contentor, e não se muda com um token.

## `uc-page-header`

O cabeçalho de uma página: o caminho de navegação, uma etiqueta pequena, o `<h1>` e a introdução, com pouco espaço entre eles. As secções da página ficam a 48 px umas das outras, por isso o título e a introdução precisam de um contentor próprio; este substitui um `uc-stack` com `style="--uc-stack-gap: …"`. Vai num `<header>` ou num `<div>`, como primeiro filho do `<uc-page>`.

Exemplo (caminho, etiqueta, título e introdução), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/blocks/page-header.html):

```html
<header class="uc-page-header">
  <nav class="uc-crumbs" aria-label="Localização">
    <ol>
      <li><a href="../../pt/estilos/layout.html">Materiais</a></li>
      <li aria-current="page">Problemas</li>
    </ol>
  </nav>
  <p class="uc-eyebrow">Aula 5 · Mooshak</p>
  <h1>Problemas da semana</h1>
  <p class="uc-prose">Os problemas para submeter no Mooshak, com o prazo e o peso de cada um.</p>
</header>
```

| Elemento | Efeito |
| --- | --- |
| `.uc-page-header` | Coluna com 12 px entre os filhos. |
| `nav.uc-crumbs` | Opcional, primeiro. Ver [uc-crumbs](#crumbs). |
| `.uc-eyebrow` | Opcional, por cima do título. |
| `h1` | O único título de nível 1 da página. |
| `p.uc-prose` ou `p.uc-lead` | A introdução; com `lang`, uma por língua. |

### `uc-eyebrow`

Etiqueta pequena, em maiúsculas e cinzenta, por cima de um título: "Ficha da unidade curricular · CC1003", "Aula prática 5". Também serve por cima de um `<h2>` ou dentro de um cartão. É texto decorativo do título: o que for importante tem de estar também no título ou na introdução.

### `uc-crumbs`

O caminho de navegação das páginas que não estão no menu (enunciados, páginas de código, ajudas, testes), com o aspeto do caminho que o [`<uc-guide>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-guide.md) gera nos guiões. É um `<nav>` com `aria-label` e uma lista ordenada; o último elemento é a página atual, sem ligação e com `aria-current="page"`. As barras entre os elementos são decorativas.

```html
<nav class="uc-crumbs" aria-label="Localização">
  <ol>
    <li><a href="../materiais.html">Materiais</a></li>
    <li><a href="index.html">Problemas</a></li>
    <li aria-current="page">[PI013] Jogo da Vida</li>
  </ol>
</nav>
```

Num site bilingue, o texto de cada elemento leva as duas línguas (`<span lang="pt">…</span><span lang="en">…</span>`). Dentro de um `uc-page-header` o caminho fica junto ao título; sozinho, ficaria a 48 px dele.

## Ver também

- [Blocos: superfícies e listas](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/superficies.md): cartões, caixas e listas para pôr dentro destes blocos.
- [Espaço e forma](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/espaco.md): a escala de espaços e os raios.
- [Estrutura de um site](https://uc-design-kit.miguelrocha.dev/docs/pt/estrutura.md) e [Criar um site](https://uc-design-kit.miguelrocha.dev/docs/pt/criar-site.md): onde estes blocos aparecem no modelo.
