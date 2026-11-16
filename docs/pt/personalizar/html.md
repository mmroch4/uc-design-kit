# Nível 4: HTML livre

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/html.html

Uma página do kit é HTML normal: dentro do `<uc-page>` pode estar qualquer marcação, com ou sem componentes. É o nível para aproveitar páginas de um site antigo ou para uma página com um aspeto muito próprio. O preço é perder o comportamento automático do kit nessa parte da página.

Um guião vindo do site antigo, colado dentro de `<uc-page>` com uma só classe à volta:

Exemplo (HTML colado dentro de uc-content numa página do kit), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/customize/free-html.html):

```html
<uc-page current="weeks">
  <div class="uc-content">
    <h1>Guião 10: árvores binárias de pesquisa</h1>
    <img class="uc-content__float" src="img/bst.svg" width="240" height="160" alt="Árvore binária de pesquisa com raiz 8; filhos 3 e 10; 3 tem os filhos 1 e 6, 10 tem o filho 14.">
    <p>Este texto veio do site antigo da cadeira e não usa classes do kit. Dentro de <code>uc-content</code> ganha os espaços, a letra e as cores do resto da página.</p>
    <p lang="pt">Este parágrafo só aparece em português.</p>
    <p lang="en">This paragraph only appears in English.</p>
    <h2>Exemplo</h2>
    <p>Inserir os valores pela ordem dada e escrever a altura da árvore.</p>
    <pre data-copy="Input">8 3 10 1 6 14</pre>
    <div class="uc-table">
      <table>
        <caption>Custo das operações numa árvore com n nós</caption>
        <thead>
          <tr><th scope="col">Operação</th><th scope="col">Árvore equilibrada</th><th scope="col">Pior caso</th></tr>
        </thead>
        <tbody>
          <tr><td>Procurar</td><td>O(log n)</td><td>O(n)</td></tr>
          <tr><td>Inserir</td><td>O(log n)</td><td>O(n)</td></tr>
          <tr><td>Remover</td><td>O(log n)</td><td>O(n)</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</uc-page>
```

## Dentro do uc-page

Tudo o que se escreve dentro de `<uc-page>` vai para a coluna principal, entre o cabeçalho e o rodapé que o kit desenha. Cada filho direto é um bloco, separado do seguinte por `--uc-main-gap` (48px). Para que partes relacionadas fiquem juntas (um título e o seu texto), agrupam-se num `<section>` ou `<div>`:

`materiais.html`:

```html
<uc-page current="materials">
  <h1>Materiais</h1>

  <section class="uc-section">
    <h2>Livros</h2>
    <ul class="uc-bullets">
      <li>…</li>
    </ul>
  </section>

  <div class="uc-content">
    …HTML from the old site…
  </div>
</uc-page>
```

Não se escreve `<main>`, cabeçalho nem rodapé (o `<uc-page>` gera-os), e mantém-se um só `<h1>` por página.

## HTML colado: uc-content

HTML escrito sem as classes do kit (de um site antigo, de um editor, exportado de outro formato) fica legível dentro de `<div class="uc-content">`: espaço entre títulos, parágrafos e listas, blocos `<pre>` com fundo e deslize horizontal, imagens que nunca passam da largura da coluna e uma largura máxima de leitura.

- `<img class="uc-content__float">` fica à direita do texto em ecrãs largos e passa para cima do texto nos estreitos.
- As tabelas ficam dentro de `<div class="uc-table">`, como no exemplo, para terem bordas e deslizarem na horizontal num telemóvel.
- Blocos de classes do kit (`uc-callout`, `uc-table`) e componentes podem estar lá dentro.

A lista completa do que `uc-content` faz está em [Blocos: elementos](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/elementos.md).

## Regras para não partir o layout

- **Sem larguras fixas.** `width: 900px` num bloco obriga o telemóvel a deslizar na horizontal. Usa-se `max-width`, percentagens, ou nada.
- **Tabelas em `.uc-table`.** Uma tabela larga sem este invólucro alarga a página inteira. Com ele, só a tabela desliza, e o kit torna-a acessível pelo teclado; um `<caption>` dá-lhe nome.
- **Imagens com `width` e `height`** e com `alt`. O kit limita a largura a 100% da coluna; as dimensões evitam que o texto salte enquanto a imagem carrega.
- **Vídeos e `<iframe>`** com `width: 100%` e `aspect-ratio: 16 / 9` em vez das dimensões fixas que os serviços de vídeo sugerem.
- **Código** em [`<uc-code>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-code.md), ou em `<pre>` dentro de `uc-content`: nunca numa linha que alargue a página.
- **Estilos no `theme.css`**, com classes próprias e tokens ([nível 2](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/css.md)), e não em atributos `style` com cores fixas, que não seguem `accentColor`.
- **Não carregar a folha de estilos do site antigo** em páginas do kit: as regras globais dela (para `body`, `h1`, `table`) ganham às do kit e desfazem o layout. Copia-se para o `theme.css` só o que for preciso, com classes.
- **Ver a página com 360px de largura** (modo de dispositivo das ferramentas do browser) antes de publicar.

## O que continua a funcionar

| Funcionalidade | Como |
| --- | --- |
| Conteúdo em duas línguas | Qualquer elemento com `lang` de uma língua configurada que não está ativa fica escondido, como os dois parágrafos do exemplo. Ver [Línguas](https://uc-design-kit.miguelrocha.dev/docs/pt/linguas.md#mesma-pagina). |
| Botão de copiar | `<pre data-copy>` ganha um botão de copiar em qualquer sítio da página, também fora de `uc-content`. |
| Tabelas largas | `.uc-table` desliza e recebe foco do teclado quando não cabe. |
| Letra, cores, foco | Os estilos base do kit valem para todo o HTML: tipo de letra, títulos, links, contorno de foco. |
| Componentes | Qualquer componente pode estar no meio do HTML livre: um [`<uc-date>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-date.md) numa frase, um [`<uc-code>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-code.md) num guião antigo. |
| Navegação e rodapé | Continuam a vir do `course.js`, à volta do conteúdo. |

## O que não funciona

- **Nada é calculado.** Datas, números de semana, "Esta semana", prazos que desaparecem quando passam: num texto escrito à mão ficam como foram escritos. Para uma data que muda com a língua usa-se `<uc-date>`; para semanas, [`<uc-week>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-week.md).
- **Textos traduzidos só com `lang`.** O kit não traduz texto escrito à mão; cada língua escreve-se à parte.
- **`lang` de línguas não configuradas.** Um `<span lang="fr">` num site com `languages: ["pt", "en"]` nunca é escondido, o que é o comportamento certo para uma citação.
- **Scripts do site antigo.** Código que dependia de jQuery ou de outra biblioteca não corre sozinho; ou se carrega essa biblioteca na página, ou se reescreve o comportamento como um [componente próprio](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/componentes.md).
- **Links relativos.** Continuam relativos à página: HTML colado de outra pasta pode precisar de caminhos novos (ver [Links e ficheiros](https://uc-design-kit.miguelrocha.dev/docs/pt/estrutura.md#links)).

## Ver também

- [O corpo de uma página](https://uc-design-kit.miguelrocha.dev/docs/pt/estrutura.md#pagina).
- [Blocos: layout](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/layout.md) e [superfícies e listas](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/superficies.md): as classes que arrumam conteúdo sem CSS próprio.
- [`<uc-page>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-page.md).
