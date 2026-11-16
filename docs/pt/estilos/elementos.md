# Blocos: elementos

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/elementos.html

Botões, etiquetas, tabelas, blocos de texto com botão de copiar e utilitários de texto. Os três primeiros são só CSS; as tabelas e o `<pre data-copy>` têm também um pouco de JavaScript do kit para o teclado e para copiar.

As classes de texto para parágrafos de introdução, colunas de leitura e HTML colado de outro sítio (`uc-lead`, `uc-prose`, `uc-content`) estão em [Tipografia](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/tipografia.md).

## `uc-button`

Uma ligação ou um `<button>` com aspeto de botão, com 44 px de altura mínima.

Exemplo (botão principal, botão normal e botão nativo), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/blocks/button.html):

```html
<a class="uc-button uc-button--primary" href="../avaliacao.html">Regras de avaliação</a>
<a class="uc-button" href="../semanas.html">Ver as semanas</a>
<button class="uc-button" type="button">Imprimir</button>
```

### `uc-button--primary`

Preenchido na cor do curso, com o texto em `--uc-color-on-accent`. Um por zona da página, para a ação principal; está no exemplo acima.

### `uc-button--sm`

Compacto, com 32 px de altura e letra de 13 px, para tabelas e barras de ferramentas. Combina com `--primary`.

Exemplo (três botões compactos), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/blocks/button-sm.html):

```html
<a class="uc-button uc-button--sm" href="../semanas.html">Enunciado</a>
<a class="uc-button uc-button--sm" href="../semanas.html">Código base</a>
<a class="uc-button uc-button--sm uc-button--primary" href="../semanas.html">Entregar</a>
```

| Classe ou token | Efeito |
| --- | --- |
| `uc-button` | Borda `--uc-color-border`, fundo `--uc-color-surface`, raio `--uc-radius-md`; borda e texto na cor do curso em `:hover`. |
| `uc-button--primary` | Fundo e borda `--uc-color-accent`; `--uc-color-accent-strong` em `:hover`. |
| `uc-button--sm` | Altura mínima `2rem`, letra `--uc-font-size-sm`. |
| `--uc-target-min` | Altura mínima do botão normal; por omissão `44px`. |

Uma ligação leva a outra página ou ficheiro; um `<button type="button">` faz uma ação na página. A classe não muda o elemento: um `<a>` com aspeto de botão continua a ser lido como ligação, e é isso que se quer. O texto diz o que acontece ("Descarregar o enunciado"), não "Clique aqui".

## `uc-tag`

Uma etiqueta pequena, em linha com o texto, para classificar: tipo de aula, estado, novidade.

Exemplo (as cinco variantes de etiqueta), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/blocks/tag.html):

```html
<span class="uc-tag">Teórica</span>
<span class="uc-tag uc-tag--accent">Esta semana</span>
<span class="uc-tag uc-tag--warning">Avaliação</span>
<span class="uc-tag uc-tag--success">Entregue</span>
<span class="uc-tag uc-tag--muted">Opcional</span>
```

### Variantes

| Classe | Cores | Uso típico |
| --- | --- | --- |
| `uc-tag` | `--uc-color-surface-muted`, texto `--uc-color-text-secondary` | Neutra. |
| `uc-tag--accent` | `--uc-color-accent-soft`, texto `--uc-color-accent` | "Esta semana", destaque. |
| `uc-tag--warning` | `--uc-color-warning-bg`, texto `--uc-color-warning-text` | Avaliação, "Novo", obrigatório. |
| `uc-tag--success` | `--uc-color-success-bg`, texto `--uc-color-success-text` | Feito, entregue, certo. |
| `uc-tag--muted` | As mesmas da neutra | Opcional, secundário. |

Todas as combinações por omissão têm contraste de pelo menos 4,5:1. O significado está no texto da etiqueta, não na cor: "Avaliação" lê-se igual a quem não distingue o âmbar. `--muted` tem hoje o mesmo aspeto que a etiqueta sem variante; usa-se quando se quer dizer "secundário" no HTML.

## `uc-table`

Vai num `<div>` à volta de uma `<table>`: dá-lhe borda, cabeçalho e, quando a tabela não cabe, deslocamento horizontal dentro da caixa, sem empurrar a página.

Exemplo (horário com seis colunas), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/blocks/table.html):

```html
<div class="uc-table">
  <table>
    <caption class="uc-visually-hidden">Horário das aulas</caption>
    <thead>
      <tr><th scope="col">Turma</th><th scope="col">Tipo</th><th scope="col">Dia</th><th scope="col">Hora</th><th scope="col">Sala</th><th scope="col">Docente</th></tr>
    </thead>
    <tbody>
      <tr><td class="uc-mono">T1</td><td>Teórica</td><td>2.ª feira</td><td class="uc-mono">10:00–12:00</td><td>Anfiteatro 1</td><td>Ana Ribeiro</td></tr>
      <tr><td class="uc-mono">PL1</td><td>Prática</td><td>3.ª feira</td><td class="uc-mono">14:00–16:00</td><td>Laboratório 1</td><td>Carla Nunes</td></tr>
      <tr><td class="uc-mono">PL2</td><td>Prática</td><td>3.ª feira</td><td class="uc-mono">16:00–18:00</td><td>Laboratório 2</td><td>Diogo Teixeira</td></tr>
    </tbody>
  </table>
</div>
```

A tabela tem pelo menos 560 px de largura; no telemóvel desliza para o lado dentro da caixa. Enquanto não couber, o kit torna a caixa focável (`tabindex="0"`, `role="region"`) e dá-lhe o nome do `<caption>`, para se poder deslocar com as setas do teclado. Sem `<caption>`, o nome é "Tabela com deslocamento horizontal". Quando volta a caber, deixa de ser focável.

### Largura mínima

`--uc-table-min` muda essa largura. Com `0`, uma tabela de duas ou três colunas curtas cabe no telemóvel sem deslocamento.

Exemplo (tabela de duas colunas sem largura mínima), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/blocks/table-min.html):

```html
<div class="uc-table" style="--uc-table-min: 0">
  <table>
    <caption class="uc-visually-hidden">Pesos da avaliação</caption>
    <thead>
      <tr><th scope="col">Componente</th><th scope="col">Peso</th></tr>
    </thead>
    <tbody>
      <tr><td>Exame</td><td>60%</td></tr>
      <tr><td>Trabalhos</td><td>20%</td></tr>
      <tr><td>Teste prático</td><td>20%</td></tr>
    </tbody>
  </table>
</div>
```

### Legenda

Cada tabela deve ter um `<caption>` como primeiro filho: é o nome que os leitores de ecrã anunciam e o que o kit usa para a região focável. Se o título já está por cima da tabela, a legenda esconde-se com `uc-visually-hidden`, como nas demonstrações. Os cabeçalhos são `<th scope="col">` (ou `scope="row"` na primeira coluna).

| Classe ou token | Efeito |
| --- | --- |
| `uc-table` | No contentor: `overflow-x: auto`, borda, raio `--uc-radius-lg`. Células com 12 × 16 px, cabeçalho em `--uc-color-surface-sunken`. |
| `--uc-table-min` | Largura mínima da `<table>`; por omissão `560px`. |
| `uc-mono` | Numa célula, para códigos de turma, horas e salas que se comparam em coluna. |

O mesmo comportamento de teclado aplica-se às tabelas que os componentes geram ([`<uc-deadlines view="table">`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-deadlines.md), [`<uc-team view="table">`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-team.md)) e aos `<pre>` largos dentro de `uc-content`.

## `<pre data-copy>`

Acrescenta um botão de copiar ao canto de um bloco de texto pré-formatado, para o que o estudante cola noutro sítio: a entrada e a saída de um exemplo, um comando.

Exemplo (entrada e saída de um exemplo com botões de copiar), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/blocks/pre-copy.html):

```html
<div class="uc-content">
  <p>Exemplo de entrada:</p>
  <pre data-copy="Input">5
3 1 4 1 5</pre>
  <p>Saída esperada:</p>
  <pre data-copy="Output">1 1 3 4 5</pre>
</div>
```

O valor do atributo nomeia o que se copia no nome acessível do botão: `data-copy="Input"` lê-se "Copiar Input"; vazio, lê-se "Copiar". O texto é copiado tal como está escrito, com as mudanças de linha, e a confirmação ("Copiado") é anunciada aos leitores de ecrã. Funciona em qualquer parte da página e também no HTML que os componentes mostram depois de carregar.

| Classe | Elemento |
| --- | --- |
| `.uc-copy-block` | O contentor que o kit põe à volta do `<pre>`. |
| `.uc-copy-block__button` | O botão (um `uc-button` de 32 px); `.is-copied` enquanto mostra o visto. |

O `<pre>` não tem fundo próprio fora de `uc-content`; a demonstração usa `uc-content` para lhe dar caixa. Dentro de um [`<uc-code>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-code.md) o atributo é ignorado, porque esse componente já tem o seu botão. Sem JavaScript, o bloco mostra-se sem botão.

## Utilitários de texto

Três classes de uma só propriedade, para usar em qualquer elemento de texto.

Exemplo (texto secundário, monoespaçado e pequeno), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/blocks/text-utilities.html):

```html
<p class="uc-muted">Última atualização: 20 de novembro de 2025</p>
<p>Código da unidade curricular: <span class="uc-mono">AP0001</span></p>
<p class="uc-small">As salas podem mudar durante o semestre; confirmar nos avisos.</p>
```

### `uc-muted`

Cor `--uc-color-text-muted`, para metadados: datas de atualização, tamanhos de ficheiro, notas. Tem mais de 7:1 de contraste sobre branco.

### `uc-mono`

Letra `--uc-font-mono`, para códigos, horas e identificadores que não são código-fonte. Para código, usa-se `<code>`, que já tem esta letra.

### `uc-small`

Tamanho `--uc-font-size-md` (14 px), para notas de rodapé e legendas. Não convém para parágrafos inteiros.

## `uc-visually-hidden`

Esconde um elemento do ecrã mas não dos leitores de ecrã. Serve para completar um texto que só é claro com a vista: um botão só com ícone, ligações repetidas como "PDF", a legenda de uma tabela já com título.

Exemplo (ligação PDF com texto escondido e botão só com ícone), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/blocks/visually-hidden.html):

```html
<a class="uc-button uc-button--sm" href="../semanas.html">PDF<span class="uc-visually-hidden"> do enunciado do trabalho 2</span></a>
<a class="uc-button" href="../index.html">
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false"><path d="M3 11l9-7 9 7v9H3z"/></svg>
  <span class="uc-visually-hidden">Página inicial</span>
</a>
```

O primeiro botão lê-se "PDF do enunciado do trabalho 2"; o segundo, "Página inicial". O ícone tem `aria-hidden="true"`. Ao contrário de `hidden` ou `display: none`, o texto continua disponível para os leitores de ecrã.

| Classe | Efeito |
| --- | --- |
| `uc-visually-hidden` | Caixa de 1 × 1 px recortada, fora do fluxo (`position: absolute !important`). |

Não se usa em elementos que recebem foco, como uma ligação inteira: o foco iria para algo invisível.

## Ver também

- [Tipografia](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/tipografia.md): `uc-lead`, `uc-prose`, `uc-content` e a escala de letra.
- [Blocos: superfícies e listas](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/superficies.md) e [Blocos: layout](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/layout.md).
- [Acessibilidade](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/acessibilidade.md): o que o kit garante e o que cabe a quem escreve.
