# `<uc-search>`

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-search.html

Um campo de pesquisa no meio de uma página, com os resultados por baixo, por exemplo no topo da lista de problemas. Pesquisa o mesmo índice que o botão «Pesquisar» do cabeçalho e só aparece num site que tenha esse índice.

Exemplo (campo que pesquisa todo o site), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-search/basic.html):

```html
<uc-search></uc-search>
```

Escreva, por exemplo, `pesquisa` ou `ordenacao` (sem acentos também funciona). O índice desta demonstração tem só algumas páginas das outras demonstrações.

## Utilização

Primeiro, o site tem de ter pesquisa: `search: true` no `course.js` e o ficheiro `search-index.js`, que o script [`uc-site.py`](https://uc-design-kit.miguelrocha.dev/docs/pt/manter.md) cria na pasta do ano. Com isso, todas as páginas ganham o botão [«Pesquisar»](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-page.md#pesquisa) no cabeçalho. O `<uc-search>` só é preciso quando se quer um campo dentro de uma página.

`problemas.html`:

`problemas.html`:

```html
<h1>Problemas</h1>
<uc-search scope="problemas/" label="Pesquisar nos problemas"></uc-search>
```

`course.js`:

`course.js`:

```js
window.UC_COURSE = {
  title: "Programação Competitiva",
  search: true,
};
```

Sem o ficheiro do índice o elemento fica vazio, sem mensagem de erro: é seguro deixá-lo na página antes de correr o `uc-site.py` pela primeira vez.

## Exemplos

### Só numa pasta

`scope` limita a pesquisa às páginas cujo caminho começa pelo texto indicado, relativo à pasta do `course.js`. Os prazos e os avisos ficam de fora. `limit` muda o número de resultados.

Exemplo (pesquisa só nas páginas de uma pasta, com outro texto e no máximo 5 resultados), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-search/scope.html):

```html
<uc-search scope="patterns/" label="Pesquisar nos problemas e guiões" placeholder="Por exemplo: pesquisa binária" limit="5"></uc-search>
```

## Atributos

| Atributo | Tipo | Por omissão | Descrição |
| --- | --- | --- | --- |
| `scope` | início de um caminho | — | Só as páginas cujo caminho começa assim, por exemplo `problemas/`. Sem `scope`, pesquisa todo o site, incluindo os prazos e os avisos do `course.js`. |
| `label` | texto | «Pesquisar no site» | O rótulo visível do campo. |
| `placeholder` | texto | «Pesquisar páginas, aulas, exercícios…» | O texto de exemplo dentro do campo vazio. |
| `limit` | número | `10` | Quantos resultados mostrar, no máximo. |

## Configuração usada

| Campo | Para quê |
| --- | --- |
| [`search`](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#campos-avancado) | Liga a pesquisa e diz onde está o índice (`search-index.js`, por omissão). |
| [`deadlines`](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#prazos), [`notices`](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#avisos) | Pesquisados no momento, sempre atualizados, quando não há `scope`. |
| [`languages`](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#campos-linguas) | Só aparecem resultados da língua ativa (e das páginas comuns às duas). |

## Como pesquisa

- Maiúsculas e acentos não contam: `arvore` encontra «Árvores».
- Cada palavra escrita tem de aparecer no resultado, como início de uma palavra: `arv bin` encontra «Árvores binárias».
- Palavras curtas e muito comuns («de», «com», «the») não são obrigatórias.
- Uma letra trocada ou duas letras seguidas trocadas são aceites em palavras de 5 letras ou mais: `arvroe` encontra «árvore», mais abaixo na lista.
- Primeiro vêm os resultados em que a palavra está no título da secção, depois no título da página, depois no texto. Os resultados são agrupados por página.
- As palavras encontradas ficam destacadas.

O botão «Pesquisar» do cabeçalho usa as mesmas regras, numa janela por cima da página (até 50 resultados). As duas formas de pesquisar estão descritas, do lado de quem mantém o site, em [Manter o site](https://uc-design-kit.miguelrocha.dev/docs/pt/manter.md#indice).

## Personalizar

Estas classes são estáveis na versão 1 e podem ser usadas num `theme.css`. As de resultados são as mesmas no campo e na janela do botão «Pesquisar». O método está em [Nível 2: CSS livre](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/css.md).

| Classe | Elemento |
| --- | --- |
| `.uc-search`, `__label`, `__field` | O próprio `<uc-search>`, o rótulo e o campo. |
| `.uc-search__input` | O campo de pesquisa, aqui e na janela. |
| `.uc-search__results`, `__group`, `__group-label` | A lista de resultados, cada grupo (uma página, os prazos, os avisos) e o seu título. |
| `.uc-search__option`, `__title`, `__text` | Um resultado (uma ligação), o seu título e o excerto. |
| `.uc-search__mark` | Uma palavra encontrada, destacada. |
| `.uc-search__message`, `__status`, `__retry` | «A carregar…» ou «Sem resultados» (no campo), a mesma linha na janela, e o botão «Tentar de novo». |
| `.uc-search-dialog`, `__bar`, `__close`, `__body` | A janela do botão «Pesquisar»: a barra com o campo, o botão «Fechar» e a zona dos resultados. |
| `.uc-search-dialog__footer`, `__date`, `__keys` | O rodapé da janela: a data do índice e as teclas. |

`theme.css`:

```css
/* Palavras encontradas sublinhadas em vez de fundo amarelo. */
.uc-search__mark { background: none; text-decoration: underline 2px var(--uc-color-accent); }
```

## Acessibilidade

### O que o componente faz

O campo tem rótulo visível e é uma `combobox` ligada a uma `listbox` de resultados agrupados por página. As setas escolhem um resultado (anunciado pelo leitor de ecrã sem tirar o foco do campo), `Enter` abre-o e `Esc` limpa o campo. O número de resultados é anunciado quando se para de escrever. Um resultado na mesma página abre o que o esconde (uma semana fechada, por exemplo), desloca a página até ele, destaca-o e leva lá o foco.

### O que cabe a quem escreve

Um `label` que diga o que se pesquisa, quando há `scope` («Pesquisar nos problemas»), e títulos de secção claros nas páginas: são eles que aparecem nos resultados.

## Sem JavaScript

Não aparece nada: a pesquisa precisa do kit. O resto da página fica igual.

## Ver também

- [Pesquisa no site](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-page.md#pesquisa): o botão «Pesquisar» do cabeçalho e os atalhos `Ctrl` `K` e `/`.
- [`uc-site.py`](https://uc-design-kit.miguelrocha.dev/docs/pt/manter.md): verificar o site e criar o índice.
- [`<uc-problems>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-problems.md): a lista de problemas, com filtros.
- Uso real: [a lista de problemas de Programação Competitiva 2026/27](https://uc-design-kit.miguelrocha.dev/examples/pc-2627/problems/index.html), com `<uc-search scope="problems/">` por cima da lista.
