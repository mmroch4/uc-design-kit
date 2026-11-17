# Tipografia

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/tipografia.html

Duas famílias de letra servidas com o kit, uma escala de nove tamanhos e três classes para blocos de texto: `uc-lead`, `uc-prose` e `uc-content`.

## Famílias

Aa Inter

Texto, títulos e navegação. Pesos de 400 a 700.

`Inter, system-ui, -apple-system, "Segoe UI", sans-serif`

Aa Mono

Código, datas e números de semana. Pesos de 400 a 500.

`"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace`

As duas são servidas com o kit, em `kit/v1/fonts/` (ficheiros `woff2` variáveis, licença SIL Open Font License). Nenhuma página faz pedidos a terceiros, e o navegador só descarrega os subconjuntos de que precisa (latino; latino estendido e grego quando a página os usa). O `<head>` das páginas pode pedir a letra do texto mais cedo com um `preload`; ver [O `<head>` de cada página](https://uc-design-kit.miguelrocha.dev/docs/pt/estrutura.md#head).

Para usar a letra do sistema e não descarregar a Inter, muda-se o token no `theme.css`:

`theme.css`:

```css
:root {
  --uc-font-sans: system-ui, sans-serif;
}
```

### Código sem ligaduras

A JetBrains Mono junta alguns pares de carateres num só símbolo (`->` numa seta, `<=` num sinal de menor ou igual). Em código, cada caráter tem de aparecer como se escreve, por isso o kit desliga as ligaduras em `code`, `pre`, `kbd` e `samp`:

`a -> b` `x <= y` `i != j` `p >>= 1`

## Escala

Os tamanhos são relativos ao tamanho da raiz (`--uc-font-size-base`, 100% do tamanho escolhido no navegador, 16 px por omissão). Cada linha está escrita no seu tamanho; o valor ao lado é calculado nesta página.

- Algoritmos`--uc-font-size-display` 2.5rem (40px)
  Título de [`<uc-hero>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-hero.md)
- Avaliação`--uc-font-size-h1` 2.25rem (36px)
  `<h1>`
- Componentes da avaliação`--uc-font-size-h2` 1.375rem (22px)
  `<h2>`
- Projeto 1`--uc-font-size-h3` 1.25rem (20px)
  `<h3>`
- Dois projetos e um teste.`--uc-font-size-lg` 1.125rem (18px)
  `uc-lead`
- Os projetos fazem-se em grupos de dois.`--uc-font-size-base` 100%
  Texto
- Teóricas: listas ligadas, slides 9.`--uc-font-size-body-sm` 0.9375rem (15px)
  Tabelas, semanas, avisos
- Atualizado a 24 de novembro.`--uc-font-size-md` 0.875rem (14px)
  Texto secundário, botões, `uc-small`
- Componente · Peso · Data`--uc-font-size-sm` 0.8125rem (13px)
  Cabeçalhos de tabela
- AVALIAÇÃO`--uc-font-size-xs` 0.75rem (12px)
  Etiquetas (`uc-tag`)

Abaixo de 760 px de largura, `-h1` passa a 30 px e `-display` a 32 px, para os títulos longos não ocuparem o ecrã do telemóvel. Os outros tamanhos não mudam: o texto de uma página lê-se igual no telemóvel.

## Títulos, pesos e entrelinha

| Elemento | Tamanho | Peso | Entrelinha |
| --- | --- | --- | --- |
| `<h1>` | `--uc-font-size-h1` | 700, espaçamento `-0.02em` | `--uc-line-height-tight` (1.25) |
| `<h2>` | `--uc-font-size-h2` | 600 | `--uc-line-height-tight` |
| `<h3>` | `--uc-font-size-h3` | 600 | `--uc-line-height-tight` |
| `<h4>` | `1rem` | 600 | `--uc-line-height-tight` |
| Texto | `--uc-font-size-base` | 400; `<strong>` 600 | `--uc-line-height` (1.6) |

Usam-se só quatro pesos: 400 no texto, 500 em botões e links de listas, 600 em títulos, etiquetas e `<strong>`, 700 no `<h1>`. Uma página tem um só `<h1>`; os níveis seguintes não se saltam (`<h2>` antes de `<h3>`).

## Introdução e texto: `uc-lead` e `uc-prose`

`uc-lead` é o parágrafo de introdução por baixo do título: maior, cinzento e com no máximo 680 px. `uc-prose` limita um bloco de texto a 720 px, cerca de 80 carateres por linha, a largura que ainda se lê sem perder a linha.

Exemplo (título, introdução e texto), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/styles/text.html):

```html
<h1>Avaliação</h1>
<p class="uc-lead">Dois projetos e um teste. O teste pode ser substituído pelo exame.</p>
<div class="uc-prose">
  <p>Os projetos fazem-se em grupos de dois e entregam-se no Moodle até às 23h59 do dia indicado. Cada dia de atraso desconta um valor, até ao máximo de três dias.</p>
</div>
```

## HTML sem classes: `uc-content`

Texto copiado de um site antigo ou exportado de um editor não tem classes do kit. Dentro de `uc-content` recebe o espaçamento certo: títulos com espaço antes, parágrafos e listas separados, tabelas a toda a largura, `<pre>` com fundo, imagens que não saem da coluna. O bloco tem no máximo 760 px.

Exemplo (HTML sem classes dentro de uc-content), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/styles/content.html):

```html
    <div class="uc-content">
      <h2>Objetivos</h2>
      <p>No fim desta aula, o estudante sabe implementar uma <strong>pesquisa binária</strong> e justificar o número de comparações.</p>
      <ul>
        <li>Pesquisa linear e pesquisa binária.</li>
        <li>Invariante de ciclo.</li>
      </ul>
      <h3>Exemplo</h3>
      <p>Para o vetor <code>[2, 5, 8, 13]</code> e o valor <code>8</code>:</p>
      <pre>lo = 0, hi = 3 -&gt; mid = 1
lo = 2, hi = 3 -&gt; mid = 2, encontrado</pre>
      <table>
        <tr><th>n</th><th>Comparações no pior caso</th></tr>
        <tr><td>1 000</td><td>10</td></tr>
        <tr><td>1 000 000</td><td>20</td></tr>
      </table>
    </div>
```

Uma imagem com `class="uc-content__float"` fica à direita do texto em ecrãs largos e ocupa a largura toda no telemóvel. Em páginas novas, os blocos do kit ([superfícies e listas](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/superficies.md)) dão mais controlo; `uc-content` serve para não ter de reescrever o que já existe.

## Classes de texto

`uc-muted` (cor discreta), `uc-mono` (letra de código) e `uc-small` (14 px) mudam só um pedaço de texto. Estão descritas em [Blocos: elementos](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/elementos.md).
