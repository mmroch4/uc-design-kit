# `<uc-page>`

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-page.html

O corpo de cada página do site. À volta do conteúdo escrito pelo professor, desenha o cabeçalho com o nome do curso, a navegação entre páginas, as plataformas externas e o rodapé, tudo a partir do `course.js`.

Exemplo (página completa do curso de demonstração), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-page/basic.html):

```html
<uc-page>
  <uc-hero></uc-hero>
  <p>O conteúdo da página fica aqui, dentro do <code>&lt;main&gt;</code>.</p>
</uc-page>
```

A demonstração é uma página inteira do curso fictício: cabeçalho com título, edição e instituição, navegação com as quatro páginas e as duas plataformas, o conteúdo e o rodapé com a data de atualização. Nenhum item da navegação está ativo porque o ficheiro da demonstração não está em `pages`.

A moldura da demonstração é mais estreita do que 960 px, por isso a navegação aparece como no telemóvel: um botão "Menu" que abre a lista. Num ecrã largo, a navegação fica numa coluna à esquerda do conteúdo (aqui com "Início" ativo, como na página inicial):

![A mesma página num ecrã de computador: cabeçalho com Algoritmos e Programação 2025/26 e Universidade Exemplo, coluna à esquerda com Início (ativo), Semanas, Avaliação, Sobre a UC e o grupo Plataformas, conteúdo à direita e rodapé com a data de atualização.](https://uc-design-kit.miguelrocha.dev/docs/assets/img/uc-page-desktop.webp)

## Utilização

Cada página do site tem um único `<uc-page>`, logo dentro do `<body>`, com todo o conteúdo lá dentro. Não se escreve `<main>`, cabeçalho nem rodapé: o componente gera-os.

`semanas.html`:

```html
<body>
  <uc-page>
    <h1>Semanas</h1>
    <uc-weeks>…</uc-weeks>
  </uc-page>
</body>
```

O que aparece à volta vem do `course.js`. Só `title` é obrigatório; os outros campos acrescentam partes ao cabeçalho, à navegação e ao rodapé.

`course.js`:

```js
window.UC_COURSE = {
  title: "Algoritmos e Programação",
  edition: "2025/26",
  institution: { name: "Universidade Exemplo", url: "https://example.org" },
  pages: [
    "home",                                   // index.html, "Início"
    { id: "weeks", href: "semanas.html" },
    { id: "assessment", href: "avaliacao.html" },
    { id: "about", href: "sobre.html" },
  ],
  platforms: [
    { label: "Plataforma de entregas", url: "https://example.org/entregas" },
  ],
  footer: "© 2025 Universidade Exemplo",
  updated: "2025-11-27",
};
```

A navegação segue a ordem de `pages`. O item ativo é a página com o mesmo nome de ficheiro que a página aberta (em `semanas.html`, "Semanas"). A estrutura completa de uma página, com o `<head>`, está em [Estrutura de um site](https://uc-design-kit.miguelrocha.dev/docs/pt/estrutura.md#pagina).

## Exemplos

### Item ativo escolhido

Com `current`, o item ativo deixa de depender do nome do ficheiro. Serve para páginas que não estão na navegação, como um guião dentro de `guioes/`: com `current="weeks"`, "Semanas" fica ativo. Abra o menu da demonstração para ver o item marcado; o botão mostra também o nome da página ativa.

Exemplo (guião com Semanas ativo na navegação), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-page/current.html):

```html
<uc-page current="weeks">
  <h1>Guião 10: inserir e procurar numa árvore</h1>
  <p>Este guião não está na navegação, mas "Semanas" fica ativo porque a página tem <code>current="weeks"</code>.</p>
</uc-page>
```

### Sem navegação

`layout="full"` tira a navegação e deixa o conteúdo ocupar toda a largura, mantendo o cabeçalho e o rodapé. É útil para um site de uma só página, para um enunciado ou para um guião que vai ser projetado na aula.

Exemplo (página sem navegação), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-page/full.html):

```html
<uc-page layout="full">
  <h1>Enunciado do trabalho 2</h1>
  <p>Sem navegação: o conteúdo ocupa toda a largura, entre o cabeçalho e o rodapé.</p>
</uc-page>
```

### Navegação no topo

`layout="top"` põe a navegação numa barra por baixo do cabeçalho, com as páginas e depois as plataformas, e deixa o conteúdo ocupar toda a largura. Serve para sites com poucas páginas ou com tabelas largas. Abaixo de 960 px, a barra dá lugar ao mesmo botão "Menu" da barra lateral. Para usar em todas as páginas, escreve-se `layout: "top"` no [`course.js`](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#campos-navegacao); o atributo de uma página ganha a esse valor.

Exemplo (página com a navegação numa barra no topo), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-page/top.html):

```html
<uc-page layout="top" current="weeks">
  <h1>Semanas</h1>
  <p>Navegação numa barra por baixo do cabeçalho: o conteúdo ocupa toda a largura. Em ecrãs estreitos, a barra passa a ser o botão "Menu".</p>
</uc-page>
```

### Faixa institucional

`layout="banner"` junta o cabeçalho, a apresentação da cadeira e a navegação numa só faixa da cor do curso, com ar de página oficial da faculdade. O primeiro `<uc-hero>` escrito diretamente na página passa para dentro da faixa (é movido, não copiado, por isso a página continua com um só `h1`). Numa página sem `<uc-hero>`, a faixa fica baixa, só com o cabeçalho e os separadores. Num ecrã largo, as páginas são separadores no fundo da faixa, com a atual a branco; abaixo de 960 px, o botão "Menu" fica dentro da faixa. Na impressão, a faixa sai sem cor.

É o layout do tema [Institucional](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/criar-tema.md#temas-prontos) (`theme: "institutional"`), mas funciona sem ele. O estilo está num ficheiro à parte, `kit/v1/layouts/banner.css`, que o kit só descarrega quando uma página o usa. A cor da faixa é `--uc-color-accent-strong`, a versão escura da cor do curso, que tem sempre contraste suficiente com o texto branco.

Exemplo (página com a faixa institucional), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-page/banner.html):

```html
<uc-page layout="banner" current="home">
  <uc-hero></uc-hero>
  <p>O cabeçalho, a apresentação da cadeira e a navegação ficam numa faixa da cor do curso. Num ecrã largo, as páginas são separadores no fundo da faixa; em ecrãs estreitos, o botão "Menu" fica dentro dela.</p>
</uc-page>
```

### Três colunas com "Nesta página"

`layout="docs"` tem três colunas: a navegação, o conteúdo e, à direita, "Nesta página", com os títulos `h2` e `h3` da página. Ao percorrer a página, a secção à vista fica marcada. Serve para sites com guiões e apontamentos longos. A lista só aparece quando a página tem duas ou mais secções; um título com `data-nav="off"` (ou dentro de um elemento com ele) fica de fora, e `toc="off"` tira a coluna a uma página.

Num guião ([`<uc-guide>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-guide.md)), o progresso dos exercícios passa para o topo da coluna da direita, por cima da lista, e o guião deixa de ter o seu próprio índice. Abaixo de 1200 px a lista vira um botão "Nesta página · N secções" por cima do conteúdo, que a abre como o "Menu"; no telemóvel fica por baixo do "Menu". Na impressão, a coluna não aparece.

É o layout do tema [Manual](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/criar-tema.md#temas-prontos) (`theme: "handbook"`), mas funciona sem ele. O estilo está em `kit/v1/layouts/docs.css`, descarregado só quando uma página o usa. A largura máxima é a do conteúdo mais 240 px (1440 px sem tema).

Exemplo (guião com a coluna Nesta página), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-page/docs.html):

```html
<uc-page layout="docs" current="weeks">
  <uc-guide week="3">
    <h1>Aula 3 · Introdução a classes</h1>
    <section class="uc-section" aria-labelledby="classes">
      <h2 id="classes">1. Introdução às classes</h2>
      <p>Os títulos da página aparecem na coluna da direita, e a secção à vista fica marcada.</p>
      <uc-exercise id="demo-ponto" title="Classe Ponto" level="easy">
        <p>Escreve uma classe <code>Point</code> com dois campos inteiros.</p>
      </uc-exercise>
    </section>
    <section class="uc-section" aria-labelledby="geometricos">
      <h2 id="geometricos">2. Objetos geométricos</h2>
      <h3 id="retangulos">Retângulos</h3>
      <p>Um <code>h3</code> fica como subentrada.</p>
      <uc-exercise id="demo-area" title="Área do retângulo" level="medium">
        <p>Acrescenta o método <code>area</code>.</p>
      </uc-exercise>
    </section>
    <section class="uc-section" aria-labelledby="extra">
      <h2 id="extra">3. Exercícios extra</h2>
      <p>O progresso dos exercícios fica no topo da coluna da direita.</p>
    </section>
  </uc-guide>
</uc-page>
```

### Mudar de língua

Quando `languages` tem mais de uma língua, o cabeçalho ganha um botão por cada outra língua ("PT" na demonstração, que abre em inglês com `?lang=en`). Os nomes das páginas do kit, o grupo "Platforms", o rodapé e a data passam para a língua ativa, e o conteúdo marcado com `lang` mostra só a língua ativa.

Exemplo (página em inglês com o botão para português), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-page/languages.html?lang=en):

```html
<uc-page>
  <uc-hero></uc-hero>
  <p lang="pt">Este parágrafo só aparece em português.</p>
  <p lang="en">This paragraph only appears in English.</p>
</uc-page>
```

A demonstração acrescenta ao curso a língua inglesa e o título e a descrição nas duas línguas; o rodapé do curso de demonstração já tinha as duas:

`course.js`:

```js
languages: ["pt", "en"],
title: { pt: "Algoritmos e Programação", en: "Algorithms and Programming" },
tagline: { pt: "Um curso fictício…", en: "A fictional course…" },
footer: { pt: "© 2025 … · curso fictício", en: "© 2025 … · fictional course" },
```

A escolha fica guardada no browser e vale para as outras páginas do site. Quando uma página tem um ficheiro por língua (`href` com um endereço por língua), o botão abre o outro ficheiro em vez de trocar o texto na mesma página. As duas formas estão em [Línguas](https://uc-design-kit.miguelrocha.dev/docs/pt/linguas.md#mesma-pagina).

### Outros anos

Com o campo [`editions`](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#edicoes) no `course.js`, o cabeçalho ganha um botão "Outros anos" com a lista das outras edições da cadeira. Numa edição que não é a atual, aparece também um aviso no topo do conteúdo com o link para a edição atual. A lista fica num ficheiro `editions.js` partilhado, na pasta acima dos anos: acrescentar um ano novo atualiza os sites dos anos anteriores sem lhes mexer.

Exemplo (página de uma edição antiga com a lista de outros anos), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-page/editions.html):

```html
<uc-page updated="2025-07-15">
  <uc-hero></uc-hero>
  <p>Página da edição 2024/25: o aviso no topo leva à edição atual e "Outros anos", no cabeçalho, às restantes.</p>
</uc-page>
```

A demonstração simula a edição 2024/25 e usa este ficheiro de edições:

`editions.js`:

```js
window.UC_EDITIONS = [
  { label: "2025/26", href: "2526/" },   // a primeira é a edição atual
  { label: "2024/25", href: "2425/" },
  { label: "2023/24", href: "https://www.dcc.fc.up.pt/~fds/aulas/EDados/2324/" },
];
```

Como se organiza a pasta e o que muda em cada ano novo está em [Novo ano letivo](https://uc-design-kit.miguelrocha.dev/docs/pt/novo-ano.md#outros-anos).

### Data de atualização de uma página

O rodapé mostra "Atualizado a …" com a data de `updated` do `course.js`, igual em todas as páginas. Uma página que muda mais vezes (sumários, problemas) pode mostrar a sua: `<uc-page updated="2025-11-20">`. Com `updated="auto"`, a data é a da última alteração do ficheiro, que o servidor indica no cabeçalho `Last-Modified`; se o servidor não a indicar, o rodapé fica sem data, em vez de mostrar a data de hoje. Aberta a partir do disco (`file://`), a página mostra a data do ficheiro.

### Nota de origem

Um site copiado de outro (o site antigo da cadeira, o de outro docente) diz de onde vem o conteúdo numa linha do rodapé, em vez de um parágrafo no fim de cada página. A linha vem de `source` no `course.js`: "Conteúdo de Fernando Silva, a partir do site original." A ligação "site original" vai para `source.url`, ou para o endereço da própria página no site antigo, se o `<uc-page>` tiver `source="…"`.

Exemplo (rodapé com a nota de origem), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-page/source.html):

```html
<uc-page source="https://www.dcc.fc.up.pt/~fds/aulas/EDados/2526/horarios.html">
  <h1>Horários</h1>
  <p>Conteúdo copiado de outro site: o rodapé diz de quem é e liga à página original.</p>
</uc-page>
```

`course.js`:

```js
source: {
  author: "Fernando Silva e Vanessa Silva",
  url: "https://www.dcc.fc.up.pt/~fds/aulas/pi/2526/",
},
```

## Atributos

| Atributo | Tipo | Por omissão | Descrição |
| --- | --- | --- | --- |
| `current` | id de página | pelo nome do ficheiro | Item da navegação marcado como ativo, por exemplo `current="weeks"`. Tem de ser um `id` de `pages`. |
| `layout` | `sidebar`, `top`, `full`, `banner`, `docs` ou um layout próprio do site | `layout` do `course.js`, senão o do tema (`--uc-layout`), senão `sidebar` | Com `top`, a navegação fica numa barra por baixo do cabeçalho; com `full`, a página não tem navegação. Nos dois casos o conteúdo ocupa toda a largura. Com `banner`, o cabeçalho, o primeiro `<uc-hero>` e a navegação ficam numa faixa da cor do curso (ver [Faixa institucional](#faixa-institucional)). Com `docs`, a página tem três colunas com "Nesta página" à direita (ver [Três colunas](#tres-colunas)). Um nome que o kit não conhece é ignorado com um aviso na consola, e decide o `course.js` ou o tema. |
| `toc` | `off` | — | Com o layout `docs`, tira a coluna "Nesta página" desta página. Ver [Três colunas](#tres-colunas). |
| `search` | `off` ou `noindex` | — | Para sites com pesquisa. `off`: esta página não mostra o botão «Pesquisar». `noindex`: o `uc-site.py` deixa a página fora do índice de pesquisa; o botão continua a aparecer. Ver [Pesquisa no site](#pesquisa). |
| `source` | endereço | `source.url` do `course.js` | Endereço desta página no site original, para a ligação da nota de origem do rodapé. Só funciona com `source` no `course.js`. Ver [Nota de origem](#nota-de-origem). |
| `updated` | data `AAAA-MM-DD` ou `auto` | `updated` do `course.js` | Data do rodapé só nesta página. `auto` usa a data do ficheiro que o servidor envia (`Last-Modified`); sem ela, não mostra data. Ver [Data de atualização de uma página](#data-da-pagina). |

## Configuração usada

Campos do `course.js` que o componente lê. Só `title` é obrigatório; sem `pages`, a navegação tem apenas "Início".

| Campo | Para quê |
| --- | --- |
| [`title`](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#campos-curso) | Nome do curso no cabeçalho, com link para a página `home`. |
| [`edition`](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#campos-curso) | Ano letivo ao lado do nome, por exemplo "2025/26". |
| [`institution`](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#campos-curso) | Departamento ou faculdade à direita do cabeçalho, com link se tiver `url`. |
| [`logo`](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#campos-curso) | Imagem ou SVG antes do nome; sem ele aparece o ícone do kit e com `null` não aparece nenhuma. |
| [`accentColor`](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#campos-curso) | Cor do item ativo, dos links e do ícone. |
| [`theme`](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#campos-curso) | Tema pronto do site (ver [Criar um tema](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/criar-tema.md#temas-prontos)). |
| [`layout`](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#campos-navegacao) | Disposição de todas as páginas, quando a página não tem o seu `layout`. |
| [`languages`](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#campos-linguas) | Com mais de uma língua, mostra o botão para mudar de língua. |
| [`pages`](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#paginas) | Itens da navegação, pela ordem escrita, e página de destino do nome do curso. |
| [`platforms`](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#campos-navegacao) | Links externos no grupo "Plataformas", por baixo das páginas. |
| [`footer`](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#campos-curso) | Texto à esquerda do rodapé. Sem ele, o nome do curso e da instituição. |
| [`source`](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#campos-curso) | Linha "Conteúdo de …, a partir do site original" no rodapé. |
| [`updated`](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#campos-curso) | "Atualizado a …" à direita do rodapé, quando a página não tem o seu `updated`. |
| [`editions`](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#edicoes) | Ficheiro com as edições da cadeira: botão "Outros anos" e aviso nas edições antigas. |

A referência completa dos campos está em [O ficheiro course.js](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#campos-navegacao).

## Aparecer já pronta

Até o kit construir a página, o `<uc-page>` fica escondido. Assim a página aparece uma só vez, já com cabeçalho e navegação e na letra final, em vez de mostrar primeiro o conteúdo sem estilo e depois saltar.

- Quando o kit termina, espera pelas fontes Inter e JetBrains Mono no máximo 300 ms e acrescenta a classe `uc-visible` ao `<html>`, que mostra a página. Numa segunda visita as fontes já estão em cache e a espera é praticamente nula.
- Se o `uc-kit.js` não carregar (endereço errado, sem rede), o conteúdo aparece ao fim de 2 segundos, sem cabeçalho nem navegação.
- Com o JavaScript desligado no browser, o conteúdo aparece logo.

Uma página que fique em branco durante 2 segundos e depois apareça sem estilo de kit indica que o `uc-kit.js` não carregou: confirmar os endereços do `<head>` em [Estrutura de um site](https://uc-design-kit.miguelrocha.dev/docs/pt/estrutura.md#head).

## Páginas em subpastas

Os `href` de `pages` são relativos ao `course.js`, não à página. Uma página em `guioes/aula10.html`, que carrega `../course.js`, recebe por isso uma navegação que aponta para `../semanas.html` sem escrever nada. O `logo`, os links escritos no HTML e os do rodapé continuam relativos à página que os mostra. O exemplo completo está em [Estrutura de um site](https://uc-design-kit.miguelrocha.dev/docs/pt/estrutura.md#subpastas).

## Ligações para secções

Qualquer título `<h2>` ou `<h3>` dentro do `<uc-page>` pode receber uma ligação, mesmo sem `id` escrito no HTML: o kit dá-lhe um a partir do texto, antes de desenhar os componentes.

- O `id` é o texto do título sem acentos, em minúsculas, com espaços e sinais trocados por `-`: «Exercício 2» dá `exercicio-2`, e a ligação é `semanas.html#exercicio-2`. Um título só com sinais dá `section`.
- Dois títulos iguais dão `exercicio-2` e `exercicio-2-2`, pela ordem da página.
- Um `id` escrito no HTML nunca muda e nunca é repetido. Os `week-1`, `week-2`… das semanas também contam como ocupados. Para uma ligação que não pode mudar quando o texto do título muda, escreve-se o `id` à mão.
- Num site com duas línguas usa-se o texto da **primeira** língua de `languages`, por isso a ligação é a mesma em português e em inglês.

Como a página só aparece depois de pronta, o kit volta a deslocar-se até ao título da ligação quando a página aparece e destaca-o durante 2 segundos (classe `uc-target-flash`: fundo e contorno na cor de destaque, sem transição para quem pede menos movimento).

O script [`uc-site.py`](https://uc-design-kit.miguelrocha.dev/docs/pt/manter.md) segue a mesma regra, por isso os resultados da pesquisa apontam para a secção certa.

## Pesquisa no site

Com `search: true` no `course.js` e o ficheiro `search-index.js` criado pelo `uc-site.py`, o cabeçalho mostra o botão **Pesquisar** antes do botão de língua, com os atalhos `Ctrl` `K`, `⌘` `K` e `/`.

- O kit pergunta ao servidor se o índice existe uma vez por visita, quando o browser está desocupado. Enquanto espera, guarda o lugar do botão para nada saltar; se o índice não existir, o botão não aparece.
- Sem `search` no `course.js` nada disto acontece e não há nenhum pedido a mais.
- Nos ecrãs estreitos só aparece a lupa, com o mesmo nome acessível.

O botão abre uma janela por cima da página. Só então o browser descarrega a pesquisa (`uc-search.js`, cerca de 5 KB) e o índice; enquanto chegam, a janela diz «A carregar…», e se falharem mostra «Tentar de novo».

- Os resultados aparecem enquanto se escreve, agrupados por página (por exemplo «Semanas · Guião 9»), com as palavras encontradas destacadas. Os prazos e os avisos do `course.js` também são pesquisados, sempre atualizados, nos grupos «Prazos» e «Avisos».
- As setas escolhem um resultado, `Enter` abre-o e `Esc` fecha a janela e devolve o foco ao botão. Um resultado na mesma página abre a semana ou o exercício que o esconde, desloca a página, destaca-o e leva lá o foco.
- O rodapé da janela mostra a data do índice («Índice de 20 nov 2025»). Se o `course.js` foi atualizado depois, o kit deixa um aviso na consola do browser para quem mantém o site: é altura de correr o `uc-site.py` outra vez.

As regras da pesquisa (acentos, uma letra trocada, ordem dos resultados) estão em [`<uc-search>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-search.md#como-pesquisa), o campo de pesquisa para pôr dentro de uma página.

## Personalizar

Estas classes são estáveis na versão 1 e podem ser usadas num `theme.css`. As regras do kit têm especificidade zero, por isso qualquer regra do professor ganha. O método está em [Nível 2: CSS livre](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/css.md); para mudar só cores, cantos ou letra em todo o site bastam os [tokens](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/tokens.md).

| Classe | Elemento |
| --- | --- |
| `.uc-page`, `.uc-page--full`, `.uc-page--top` | A página (o próprio `<uc-page>`), a variante sem navegação e a variante com a navegação no topo. |
| `.uc-page--nav-open` | A página com o menu aberto, em ecrãs estreitos. |
| `.uc-header`, `.uc-header__inner` | O cabeçalho e a sua faixa centrada. |
| `.uc-brand`, `__logo`, `__title`, `__edition` | O link com o logótipo, o nome do curso e o ano letivo. |
| `.uc-header__meta`, `.uc-header__institution` | O lado direito do cabeçalho e a instituição. |
| `.uc-lang-switch`, `__button` | Os botões para mudar de língua. |
| `.uc-search-button`, `--pending`, `__label`, `__hint` | O botão «Pesquisar» (sites com pesquisa), o lugar guardado enquanto o kit pergunta se o índice existe, o texto e o atalho `Ctrl K`. |
| `.uc-target-flash` | O destaque de 2 segundos no destino de uma ligação `#…` ao abrir a página. |
| `.uc-page__editions`, `.uc-page__editions-button`, `.uc-page__editions-menu` | "Outros anos": o contentor, o botão e a lista de edições. |
| `.uc-page__edition-notice` | O aviso no topo de uma edição antiga (um `uc-callout`). |
| `.uc-shell` | A grelha com a navegação e o conteúdo. |
| `.uc-sidebar`, `.uc-nav` | A coluna da navegação e o `<nav>` dentro dela. |
| `.uc-topnav` | Com `layout="top"`, a faixa por baixo do cabeçalho que contém a `.uc-sidebar`. |
| `.uc-page--banner`, `.uc-banner`, `.uc-banner__inner`, `.uc-banner__hero` | Com `layout="banner"`: a página, a faixa da cor do curso (com o `.uc-header` dentro), a sua parte centrada com a apresentação e a `.uc-sidebar`, e o lugar do `<uc-hero>`. |
| `.uc-page--docs`, `.uc-toc`, `.uc-toc-toggle`, `.uc-toc-toggle__label`, `.uc-toc-toggle__count`, `.uc-toc-toggle__chevron`, `.uc-page--toc-open` | Com `layout="docs"`: a página, a coluna "Nesta página" (com o progresso de um `<uc-guide>` no topo), o botão que a abre a 1200 px ou menos (texto, número de secções e seta) e a classe da página enquanto a lista está aberta. |
| `.uc-toc__nav`, `.uc-toc__label`, `.uc-toc__list`, `.uc-toc__item`, `.uc-toc__item--sub`, `.uc-toc__link` | O `<nav>` "Nesta página", o seu rótulo, a lista, cada entrada (`--sub` para um `h3`) e a ligação (a da secção à vista tem `aria-current="location"`). |
| `.uc-nav__list`, `__link`, `__group` | As listas de links, cada link e o título "Plataformas". |
| `.uc-nav-toggle` | O botão "Menu" dos ecrãs estreitos. |
| `.uc-main` | O `<main>` com o conteúdo do professor. |
| `.uc-footer`, `__text`, `__updated`, `__source` | O rodapé, o texto à esquerda, a data de atualização e a nota de origem (numa linha própria). |
| `.uc-skip-link` | O link "Saltar para o conteúdo", visível só com o foco do teclado. |

`theme.css`:

```css
/* Navegação mais larga e conteúdo um pouco mais estreito. */
:root {
  --uc-sidebar-width: 240px;
  --uc-content-max: 1100px;
}

/* Cabeçalho com fundo na cor do curso. */
.uc-header { background: var(--uc-color-accent-soft); }
```

A largura da navegação é `--uc-sidebar-width` (216 px), a da página é `--uc-content-max` (1200 px) e o espaço entre os blocos do conteúdo é `--uc-main-gap` (48 px). Abaixo de 960 px de largura, a navegação passa para o botão "Menu".

## Acessibilidade

### O que o componente faz

Gera os pontos de referência `<header>`, `<nav>`, `<main>` e `<footer>` e um link "Saltar para o conteúdo" como primeiro elemento focável. O item ativo tem `aria-current="page"`; os botões "Menu" e "Outros anos" indicam com `aria-expanded` se estão abertos e fecham com Escape, devolvendo o foco ao botão. As plataformas externas são anunciadas como "(site externo)" e o botão de língua diz para que língua muda.

### O que cabe a quem escreve

Um `<h1>` por página (o `<uc-hero>` já o tem), títulos seguintes por ordem e um `<title>` que distinga as páginas. Com `logo`, uma imagem com contraste suficiente; o texto alternativo fica vazio porque o nome do curso está ao lado, a não ser que o `course.js` lhe dê um `alt`.

## Sem JavaScript

Com o JavaScript desligado, o conteúdo aparece logo, numa coluna centrada, sem cabeçalho, navegação nem rodapé. Se o JavaScript estiver ligado mas o kit não carregar, o mesmo conteúdo aparece ao fim de 2 segundos. Convém por isso que a página se perceba sem a navegação: um título no início e links para as outras páginas onde fizerem falta.

## Ver também

- [`<uc-hero>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-hero.md): o título do curso no início da página inicial.
- [`<uc-guide>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-guide.md): um guião de aula, que costuma usar `current="weeks"`.
- [Estrutura de um site](https://uc-design-kit.miguelrocha.dev/docs/pt/estrutura.md#pagina): o `<head>`, a lista de páginas e as subpastas.
- [Línguas](https://uc-design-kit.miguelrocha.dev/docs/pt/linguas.md): conteúdo bilingue e um ficheiro por língua.
- Uso real: [a página inicial de Estruturas de Dados 2025/26](https://uc-design-kit.miguelrocha.dev/examples/edados-2526/index.html) e [um guião numa subpasta](https://uc-design-kit.miguelrocha.dev/examples/edados-2526/guioes/aula01.html).
