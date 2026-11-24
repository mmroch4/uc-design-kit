# `<uc-guide>`

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-guide.html

O invólucro de um guião de aula. Acrescenta o caminho de volta à semana, um índice feito a partir dos títulos `<h2>` e a contagem dos exercícios marcados como feitos.

Exemplo (guião com três secções e dois exercícios), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-guide/basic.html):

```html
<uc-guide week="10">
  <h1>Guião 10 · Pesquisa binária</h1>

  <section class="uc-section">
    <h2>1. Preparar</h2>
    <p>Cria um ficheiro <code>pesquisa.py</code>. Todas as funções recebem uma lista de inteiros ordenada por ordem crescente.</p>
  </section>

  <section class="uc-section">
    <h2>2. A ideia</h2>
    <p>Compara-se o valor procurado com o elemento do meio: se for menor, continua-se na metade esquerda; se for maior, na direita. Cada passo descarta metade da lista.</p>
  </section>

  <section class="uc-section">
    <h2>3. Exercícios</h2>
    <uc-exercise id="procurar" title="Pesquisa binária iterativa" level="easy">
      <p>Escreve <code>procurar(lista, x)</code>, que devolve a posição de <code>x</code> ou <code>-1</code> se não existir.</p>
    </uc-exercise>
    <uc-exercise id="contar-passos" title="Contar comparações" level="medium">
      <p>Altera a função para devolver também o número de comparações feitas.</p>
    </uc-exercise>
  </section>
</uc-guide>
```

A demonstração é um guião curto da semana 10 com três secções e dois exercícios. Ao marcar um exercício como feito, o contador "0 de 2 exercícios feitos" sobe. Dentro desta página o guião tem menos de 840 px de largura, por isso o índice não aparece e o progresso fica por cima do conteúdo; em "Abrir demo", numa janela larga, vê-se a coluna da direita com o progresso e o índice, que fica fixa ao descer a página.

## Utilização

Cada guião é uma página própria, normalmente numa subpasta como `guioes/`. O `<uc-guide>` fica dentro do `<uc-page>` e envolve todo o conteúdo: o `<h1>` com o título, as secções com `<h2>` e os exercícios.

`guioes/aula10.html`:

```html
<uc-page current="weeks">
  <uc-guide week="10">
    <h1>Guião 10 · Pesquisa binária</h1>

    <section class="uc-section">
      <h2>1. Preparar</h2>
      <p>…</p>
    </section>

    <section class="uc-section">
      <h2>2. Exercícios</h2>
      <uc-exercise id="procurar" title="Pesquisa binária iterativa">…</uc-exercise>
      <uc-exercise id="contar-passos" title="Contar comparações">…</uc-exercise>
    </section>
  </uc-guide>
</uc-page>
```

O caminho de navegação usa a página `weeks` do `course.js`. Como os endereços de `pages` são relativos ao `course.js`, um guião em `guioes/` que carrega `../course.js` liga para `../semanas.html#week-10` sem mais nada.

`course.js`:

```js
window.UC_COURSE = {
  title: "Algoritmos e Programação",
  pages: ["home", { id: "weeks", href: "semanas.html" }, "assessment"],
};
```

## Exemplos

### Ligação à semana

Com `week`, o caminho mostra "Semanas / Semana 9 / título do guião": a segunda ligação abre a página de semanas já com essa semana aberta. O último elemento é o texto do primeiro `<h1>` do guião. Um guião sem `<h2>` nem exercícios fica só com o caminho, como neste caso.

Exemplo (caminho de navegação de um guião da semana 9), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-guide/crumbs.html):

```html
<uc-guide week="9">
  <h1>Guião 9 · Ordenar um milhão de números</h1>
  <p>Este guião não tem secções nem exercícios: só o caminho de navegação é gerado.</p>
</uc-guide>
```

Sem `week`, o caminho fica "Semanas / título do guião". Se o `course.js` não tiver a página `weeks` nem o guião tiver `week`, não há caminho de navegação.

### Sem índice

Numa página com o layout [`docs`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-page.md#tres-colunas) (tema Manual), o índice é o da página, na coluna da direita, e o progresso passa para o topo dessa coluna; o guião ocupa toda a largura do conteúdo.

Com `no-toc`, o índice das secções não é gerado e a coluna da direita fica só com o progresso. Convém num guião curto, com uma ou duas secções, em que o índice não ajuda. Se também não houver exercícios, o guião ocupa toda a largura.

```html
<uc-guide week="3" no-toc>
  <h1>Guião 3 · Instalar o Python</h1>
  …
</uc-guide>
```

A diferença só se vê com o guião largo (ver [Índice e progresso](#indice-e-progresso)), por isso este exemplo não tem demonstração.

### Semana por cima do título e guiões vizinhos

Com `week-label`, a semana e as suas datas aparecem por cima do título; com `prev` e `next`, o guião termina com ligações para o anterior e o seguinte. Num guião que não pertence a uma semana (o de um teste prático, por exemplo), `parent="assessment"` faz o caminho de navegação começar na página da avaliação.

Exemplo (guião com a semana por cima do título e ligações para os vizinhos), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-guide/week-pager.html):

```html
<uc-guide week="10" week-label prev="aula09.html" next="aula11.html" no-toc>
  <h1>Guião 10 · Pesquisa binária</h1>
  <p>Por cima do título, a semana e as suas datas; no fim, as ligações para os guiões vizinhos.</p>
</uc-guide>
```

## Atributos

| Atributo | Tipo | Por omissão | Descrição |
| --- | --- | --- | --- |
| `week` | número | — | Semana a que o guião pertence. Acrescenta ao caminho de navegação uma ligação para `semanas.html#week-<n>` (o ficheiro é o da página `weeks`). |
| `week-label` | booleano | ausente | Com `week`: escreve "Semana 6 · 20–24 out" por cima do `<h1>`, com as datas do `semester`. |
| `parent` | `id` de uma página | `weeks` | A primeira ligação do caminho de navegação passa a ser essa página de `pages` (por exemplo `assessment`, num guião de teste), sem a ligação para a semana. |
| `prev`, `next` | endereço | ausente | Ligações "Guião anterior" e "Guião seguinte" no fim do conteúdo. |
| `no-toc` | booleano | ausente | Não gera o índice das secções. O progresso continua a aparecer se houver exercícios. |

## Configuração usada

Só a lista de páginas, para o caminho de navegação. O índice e o progresso não dependem do `course.js`.

| Campo | Para quê |
| --- | --- |
| `pages` | A entrada com `id: "weeks"` dá o ficheiro e a etiqueta ("Semanas", ou a `label` escrita) do início do caminho. Ver [Páginas](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#paginas). |

Sem a página `weeks` em `pages`, a ligação de `week` aponta para `weeks.html#week-<n>`, o nome por omissão, relativo ao `course.js` como os outros endereços de páginas.

## Índice e progresso

- **Índice**: uma entrada por cada `<h2>` do guião, pela ordem da página. Um `<h2>` sem `id` recebe um gerado a partir do texto, sem acentos (`2. A ideia` passa a `2-a-ideia`), para que as ligações diretas funcionem. Ao clicar, a página desliza até à secção e o foco passa para o título; a secção que está à vista fica destacada no índice.
- **Progresso**: "*n* de *total* exercícios feitos", com uma barra. Conta todos os `<uc-exercise>` dentro do guião e atualiza-se sempre que um é marcado ou desmarcado (evento `uc:exercisechange`). Um guião sem exercícios não mostra o progresso.
- **Largura**: quando o próprio guião tem pelo menos 840 px de largura, o progresso e o índice formam uma coluna de 220 px à direita que fica fixa ao descer a página. Abaixo disso, o índice esconde-se e só o progresso fica, por cima do conteúdo. A medida é a do guião e não a da janela, por isso num `<uc-page>` com a barra lateral é preciso uma janela com cerca de 1170 px.

Num site bilingue, títulos e exercícios marcados com outra língua (`lang`) não entram no índice nem na contagem.

## Personalizar

Estas classes são estáveis na versão 1 e podem ser usadas num `theme.css`. As regras do kit têm especificidade zero, por isso qualquer regra do professor ganha. O método está em [Nível 2: CSS livre](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/css.md); para mudar só cores, cantos ou letra em todo o site bastam os [tokens](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/tokens.md).

| Classe | Elemento |
| --- | --- |
| `.uc-guide` | O guião (o próprio `<uc-guide>`). |
| `.uc-guide--no-aside` | Guião sem índice nem exercícios: a coluna da direita não existe. |
| `.uc-guide__crumbs`, `__crumbs-list`, `__crumb` | O caminho de navegação, a sua lista e cada elemento. |
| `.uc-guide__layout` | A grelha com o conteúdo e a coluna da direita. |
| `.uc-guide__content` | O conteúdo escrito pelo professor. |
| `.uc-guide__aside` | A coluna com o progresso e o índice. |
| `.uc-guide__progress`, `__progress-text`, `__progress-count`, `__progress-bar` | O cartão do progresso, a frase, o número de feitos e a barra. |
| `.uc-guide__week` | A linha "Semana 6 · 20–24 out" de `week-label` (também tem `uc-eyebrow`). |
| `.uc-guide__pager`, `__pager-link`, `__pager-link--prev`, `__pager-link--next` | As ligações para os guiões vizinhos de `prev` e `next`. |
| `.uc-guide__toc`, `__toc-label`, `__toc-list`, `__toc-item`, `__toc-link` | O índice, o rótulo "Nesta página", a lista, cada entrada e a sua ligação (a da secção à vista tem `aria-current`). |

`theme.css`:

```css
/* Menos espaço entre as secções do guião (por omissão, 48 px). */
uc-guide { --uc-guide-gap: var(--uc-space-8); }

/* Índice sem a linha à esquerda. */
.uc-guide__toc-list { border-left: 0; }
```

A variável `--uc-guide-gap` controla o espaço entre os blocos de topo do conteúdo do guião.

## Acessibilidade

### O que o componente faz

O caminho é um `<nav>` com o nome "Navegação estrutural" e uma lista ordenada; o último elemento tem `aria-current="page"`. O índice é outro `<nav>`, com o nome "Nesta página", e a secção à vista é marcada com `aria-current="location"`. A barra de progresso é um `<progress>` com a frase como nome. O deslizar respeita a preferência de movimento reduzido.

### O que cabe a quem escreve

Um único `<h1>` com o título do guião e secções com `<h2>` curtos, que façam sentido fora do contexto, porque são o texto do índice. Os níveis abaixo (`<h3>`…) não aparecem no índice mas devem seguir a ordem.

## Sem JavaScript

Se o kit não carregar, o guião aparece como HTML normal, com todas as secções e exercícios pela ordem em que foram escritos. Perdem-se o caminho de navegação, o índice e o progresso, que são gerados.

## Ver também

- [`<uc-exercise>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-exercise.md): os exercícios que o progresso conta.
- [`<uc-question>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-question.md): perguntas de verificação rápida dentro do guião.
- [`<uc-code>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-code.md): blocos de código com cópia, descarga e execução.
- [`<uc-week>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-week.md): a semana para onde o caminho de navegação aponta.
- [Estrutura de um site: subpastas](https://uc-design-kit.miguelrocha.dev/docs/pt/estrutura.md#subpastas), para os guiões em `guioes/`.
- Uso real: [o guião da aula 10 de Estruturas de Dados 2025/26](https://uc-design-kit.miguelrocha.dev/examples/edados-2526/guioes/aula10.html).
