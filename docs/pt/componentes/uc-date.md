# `<uc-date>`

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-date.html

Uma data no meio do texto, escrita na língua ativa. Com `deadline`, a data vem de um prazo do `course.js`: quando o prazo muda, o texto das páginas muda com ele.

Exemplo (duas datas de prazos num parágrafo), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-date/basic.html):

```html
<p>O trabalho 2 entrega-se até <uc-date deadline="t2" format="weekday" with-time>28 de novembro</uc-date>, e o teste prático é a <uc-date deadline="teste" format="long">10 de dezembro</uc-date>.</p>
```

As duas datas vêm dos prazos `t2` e `teste` do curso de demonstração. O texto escrito dentro de cada elemento ("28 de novembro") só se vê se o kit não carregar.

## Utilização

Usa-se dentro de um parágrafo, como uma palavra. Com `deadline`, indica-se o `id` de um prazo; com `value`, uma data fixa. Convém escrever a data também dentro do elemento: é o que fica visível sem JavaScript.

`avaliacao.html`:

```html
<p>
  O trabalho 2 entrega-se até
  <uc-date deadline="t2" format="weekday" with-time>28 de novembro</uc-date>.
  As aulas começam a <uc-date value="2025-09-15" format="long">15 de setembro</uc-date>.
</p>
```

`course.js`:

```js
window.UC_COURSE = {
  title: "Algoritmos e Programação",
  deadlines: [
    { id: "t2", title: "Entrega do trabalho 2", date: "2025-11-28", time: "23:59",
      kind: "submission" },
  ],
};
```

Se a entrega passar para 5 de dezembro, muda-se só o `course.js`: a frase, a lista de próximas datas e a semana em que o prazo aparece ficam todas certas.

## Exemplos

### Formatos

`format` escolhe entre a forma curta (por omissão), média (com o ano), longa (por extenso) e com o dia da semana.

Exemplo (os quatro formatos da mesma data), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-date/formats.html):

```html
<ul>
  <li><code>short</code>: <uc-date value="2025-11-12"></uc-date></li>
  <li><code>medium</code>: <uc-date value="2025-11-12" format="medium"></uc-date></li>
  <li><code>long</code>: <uc-date value="2025-11-12" format="long"></uc-date></li>
  <li><code>weekday</code>: <uc-date value="2025-11-12" format="weekday"></uc-date></li>
</ul>
```

### Prazos com hora, só com o mês ou por marcar

Com `with-time`, a hora do prazo vem a seguir à data. Um prazo de que só se sabe o mês mostra o mês e o ano, e um prazo com `date: null` mostra "Por marcar". Esta demonstração acrescenta ao curso um exame de recurso sem data.

Exemplo (prazo com hora, prazo só com o mês e prazo por marcar), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-date/deadlines.html):

```html
<ul>
  <li>Trabalho 2: <uc-date deadline="t2" with-time>28 nov</uc-date></li>
  <li>Exame: <uc-date deadline="exame">janeiro</uc-date></li>
  <li>Recurso: <uc-date deadline="recurso">a marcar</uc-date></li>
</ul>
```

### Noutra língua

A data segue a língua ativa e muda quando se troca de língua, sem recarregar a página. Esta demonstração abre em inglês com `?lang=en`; o texto à volta usa o atributo `lang` para mostrar só a língua ativa (ver [Línguas](https://uc-design-kit.miguelrocha.dev/docs/pt/linguas.md#mesma-pagina)).

Exemplo (data de um prazo em inglês), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-date/language.html?lang=en):

```html
<p lang="pt">O teste prático é a <uc-date deadline="teste" format="weekday" with-time></uc-date>.</p>
<p lang="en">The practical test is on <uc-date deadline="teste" format="weekday" with-time></uc-date>.</p>
```

## Atributos

| Atributo | Tipo | Por omissão | Descrição |
| --- | --- | --- | --- |
| `deadline` | `id` de um prazo | — | Usa a data (e a hora, com `with-time`) desse prazo do `course.js`. Tem prioridade sobre `value`. |
| `value` | data ISO | — | Uma data fixa, `AAAA-MM-DD` ou só o mês, `AAAA-MM`. |
| `format` | `short`, `medium`, `long` ou `weekday` | `short` | Forma da data; ver [Formatos](#formatos). Não se aplica às datas só com o mês. |
| `with-time` | booleano | ausente | Acrescenta a hora do prazo ("28 nov, 23:59"). Só tem efeito com `deadline` e se o prazo tiver `time`. |

## Configuração usada

Campos do `course.js` que o componente lê. Com `value`, não precisa de nenhum.

| Campo | Para quê |
| --- | --- |
| [`deadlines`](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#prazos) | A data (`date`) e a hora (`time`) do prazo indicado em `deadline`. |
| [`languages`](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#campos-linguas) | As línguas do site: a data escreve-se na que estiver ativa. |

A referência completa dos campos está em [O ficheiro course.js](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#prazos).

## Formatos

Os nomes dos meses e dos dias vêm dos dicionários do kit. Para 12 de novembro de 2025:

| Formato | Português | Inglês |
| --- | --- | --- |
| `short` | 12 nov | 12 Nov |
| `medium` | 12 nov 2025 | 12 Nov 2025 |
| `long` | 12 de novembro de 2025 | 12 November 2025 |
| `weekday` | quarta-feira, 12 nov | Wednesday, 12 Nov |
| só o mês | novembro 2025 | November 2025 |
| `with-time` | 12 nov, 14:00 | 12 Nov, 14:00 |

Um `format` desconhecido usa a forma curta. Se o prazo não existir, ou se `value` não for uma data válida, o elemento mantém o texto escrito lá dentro e o kit deixa um aviso na consola do navegador.

## Personalizar

O elemento é `inline` e herda o estilo do texto à volta. Esta classe é estável na versão 1 e pode ser usada num `theme.css`. O método está em [Nível 2: CSS livre](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/css.md); para mudar só cores, cantos ou letra em todo o site bastam os [tokens](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/tokens.md).

| Classe | Elemento |
| --- | --- |
| `.uc-date` | O próprio `<uc-date>`; a data fica num `<time>` lá dentro. |

`theme.css`:

```css
/* Datas em destaque no texto. */
.uc-date { font-weight: 600; white-space: nowrap; }
```

## Acessibilidade

### O que o componente faz

Escreve a data num `<time datetime>` com a data em formato ISO (e a hora, com `with-time`), por isso a data fica legível para pessoas e programas. Não acrescenta nada além do texto da data.

### O que cabe a quem escreve

Uma frase que faça sentido com a data lida em voz alta, e o formato `long` ou `weekday` quando a data é o mais importante da frase, porque "10 dez" é mais fácil de perder.

## Sem JavaScript

Fica visível o texto escrito dentro do elemento, tal como está. Um `<uc-date>` vazio não mostra nada sem o kit, por isso convém escrever sempre a data lá dentro. Esse texto não é atualizado se o prazo mudar no `course.js`.

## Ver também

- [`<uc-deadlines>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-deadlines.md): a lista e a tabela dos mesmos prazos.
- [`<uc-event>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-event.md): um prazo destacado dentro de uma semana, também com `deadline`.
- [Prazos no course.js](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#prazos): o `id` e os outros campos de cada prazo.
- [Línguas](https://uc-design-kit.miguelrocha.dev/docs/pt/linguas.md#mesma-pagina): conteúdo nas duas línguas na mesma página.
