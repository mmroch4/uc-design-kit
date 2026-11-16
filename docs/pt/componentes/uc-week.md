# `<uc-week>`

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-week.html

Uma semana letiva: número, título e datas numa linha que abre e fecha. A semana atual abre sozinha e fica destacada, as futuras ficam a cinzento e os prazos do `course.js` aparecem na semana certa.

Exemplo (três semanas: passada, atual e futura), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-week/basic.html):

```html
<uc-week n="9" title="Ordenação: mergesort e quicksort">
  <dl>
    <dt>Teóricas</dt>
    <dd>Dividir para conquistar · <a href="#">slides 8</a></dd>
    <dt>Prática</dt>
    <dd><a href="#">Guião 9: ordenar um milhão de números</a></dd>
  </dl>
</uc-week>
<uc-week n="10" title="Pesquisa binária e árvores">
  <dl>
    <dt>Teóricas</dt>
    <dd>Pesquisa binária, árvores binárias de pesquisa · <a href="#">slides 9</a></dd>
    <dt>Prática</dt>
    <dd><a href="#">Guião 10: inserir e procurar numa árvore</a></dd>
  </dl>
</uc-week>
<uc-week n="11" title="Grafos: pesquisa em largura e em profundidade">
  <dl>
    <dt>Teóricas</dt>
    <dd>Representação de grafos, BFS e DFS</dd>
  </dl>
</uc-week>
```

A demonstração usa um curso fictício em que hoje é 27 de novembro de 2025: a semana 9 já passou, a 10 é a atual e a 11 ainda não começou. A entrega do trabalho 2 aparece na semana 10 porque a sua data cai nessa semana.

## Utilização

Cada semana é um elemento com o número e o título. O conteúdo é HTML livre: um `<dl>` logo dentro da semana é mostrado como linhas de etiqueta e valor (teóricas, prática, quiz…), e o resto aparece por baixo tal como foi escrito.

`semanas.html`:

```html
<uc-weeks>
  <uc-week n="1" title="Apresentação e introdução">
    <dl>
      <dt>Teóricas</dt>
      <dd>Aulas 1 e 2 · <a href="slides/01.pdf">slides</a></dd>
      <dt>Prática</dt>
      <dd><a href="guioes/aula01.html">Guião 1</a></dd>
    </dl>
  </uc-week>
  <uc-week n="2" title="Classes e objetos">…</uc-week>
</uc-weeks>
```

As datas não se escrevem: o kit calcula-as a partir do início do semestre e das interrupções, no `course.js`. Num ano novo, basta mudar `semester.start`.

`course.js`:

```js
window.UC_COURSE = {
  title: "Algoritmos e Programação",
  semester: {
    start: "2025-09-15",        // primeiro dia de aulas: a semana 1 é a que o contém
    teachingDays: [1, 5],       // de segunda (1) a sexta (5): "24–28 nov"
    breaks: [{ start: "2025-10-27", end: "2025-10-31", label: "Semana de estudo" }],
  },
};
```

Pode usar-se uma `<uc-week>` sozinha, mas numa página de semanas convém pô-las dentro de [`<uc-weeks>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-weeks.md), que acrescenta a ligação "Ir para esta semana", mostra as interrupções entre semanas e os prazos que caem depois da última.

## Exemplos

### Semana aberta

Com `open`, a semana começa aberta mesmo que não seja a atual. Útil para a semana de apresentação ou para uma semana com avisos importantes.

Exemplo (semana futura aberta), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-week/open.html):

```html
<uc-week n="11" title="Grafos: pesquisa em largura e em profundidade" open>
  <p>Esta semana ainda não começou, mas está aberta porque tem o atributo <code>open</code>.</p>
</uc-week>
```

### Título noutra língua

Num site bilingue, `title-en` (ou `title-` seguido de outro código de língua) dá o título nessa língua. O conteúdo usa o atributo `lang` para mostrar só a língua ativa. Esta demonstração abre em inglês com `?lang=en`.

Exemplo (semana com título em inglês), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-week/title-language.html?lang=en):

```html
<uc-week n="10" title="Pesquisa binária e árvores" title-en="Binary search and trees">
  <p lang="pt">Pesquisa binária, árvores binárias de pesquisa.</p>
  <p lang="en">Binary search, binary search trees.</p>
</uc-week>
```

### Datas manuais

`start` e `end` substituem as datas calculadas, por exemplo numa semana fora do calendário letivo. O estado (passada, atual ou futura) passa a ser calculado com essas datas.

Exemplo (semana com datas manuais), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-week/dates.html):

```html
<uc-week n="13" title="Sessões de dúvidas antes do exame" start="2026-01-05" end="2026-01-09" open>
  <p>Fora do calendário letivo: as datas vêm dos atributos <code>start</code> e <code>end</code>.</p>
</uc-week>
```

### Prazos da semana

Os prazos de `deadlines` no `course.js` cuja data cai entre segunda e domingo da semana aparecem no fim do seu conteúdo, sem escrever nada na página. Aqui, o teste prático de 10 de dezembro aparece na semana 12.

Exemplo (semana com um prazo do course.js), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-week/deadlines.html):

```html
<uc-week n="12" title="Revisões e teste prático" open>
  <dl>
    <dt>Teóricas</dt>
    <dd>Revisões da matéria</dd>
  </dl>
</uc-week>
```

Para escolher que prazos aparecem nas semanas, use `kind` ou `no-deadlines` no `<uc-weeks>`. Um prazo que já tenha um [`<uc-event deadline="…">`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-event.md) escrito na semana não é repetido.

## Atributos

| Atributo | Tipo | Por omissão | Descrição |
| --- | --- | --- | --- |
| `n` | número | — | Obrigatório. Número da semana; dá também o `id="week-<n>"` para ligações diretas. |
| `title` | texto | — | Obrigatório. Título mostrado na linha da semana. |
| `title-<lang>` | texto | `title` | Título noutra língua, usado quando essa língua está ativa. Por exemplo `title-en`. |
| `start` | data ISO | calculada | Primeiro dia da semana (`AAAA-MM-DD`), em vez do calculado a partir do `course.js`. |
| `end` | data ISO | calculada | Último dia da semana. Sem `start`, só muda o fim do intervalo mostrado. |
| `open` | booleano | ausente | Começa aberta. Sem ele, só a semana atual (ou a do endereço `#week-<n>`) abre sozinha. |

## Configuração usada

Campos do `course.js` que o componente lê. Todos são opcionais: sem `semester.start` e sem `start`, a semana mostra-se sem datas e sem estado.

| Campo | Para quê |
| --- | --- |
| `semester.start` | Calcular as datas de cada semana: a semana 1 é a semana de calendário que contém este dia. |
| `semester.breaks` | Saltar as semanas sem aulas na numeração. |
| `semester.teachingDays` | Que dias mostrar no intervalo, por exemplo "24–28 nov" em vez de "24–30 nov". |
| `deadlines` | Prazos que aparecem dentro da semana. |
| `today` | Fixar o dia de hoje (demonstrações, capturas). O endereço `?today=AAAA-MM-DD` tem prioridade. |

A referência completa dos campos está em [O ficheiro course.js](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#campos-semestre).

## Estados e ligações

- **Passada**: fechada, com as cores normais.
- **Atual**: aberta, com fundo destacado na cor do curso e a etiqueta "Esta semana". A linha fica marcada com `aria-current="date"`.
- **Futura**: fechada e a cinzento. As cores voltam ao normal ao passar o rato ou com o foco do teclado, e o texto mantém o contraste mínimo de 4,5:1.

Cada semana recebe `id="week-<n>"`. Uma ligação para `semanas.html#week-10` abre a página com a semana 10 aberta; é este endereço que o [`<uc-this-week>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-this-week.md) da página inicial usa.

## Personalizar

Estas classes são estáveis na versão 1 e podem ser usadas num `theme.css`. As regras do kit têm especificidade zero, por isso qualquer regra do professor ganha. O método está em [Nível 2: CSS livre](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/css.md); para mudar só cores, cantos ou letra em todo o site bastam os [tokens](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/tokens.md).

| Classe | Elemento |
| --- | --- |
| `.uc-week` | A semana (o próprio `<uc-week>`). |
| `.uc-week--past`, `--current`, `--future` | Estado em relação a hoje. |
| `.uc-week__summary` | A linha que abre e fecha. |
| `.uc-week__number`, `__title`, `__date` | "Semana 10", o título e o intervalo de datas. |
| `.uc-week__now` | A etiqueta "Esta semana". |
| `.uc-week__body` | O conteúdo escrito pelo professor e os prazos. |

`theme.css`:

```css
/* Semana atual com uma barra à esquerda em vez do fundo. */
.uc-week--current {
  background: none;
  box-shadow: inset 3px 0 0 var(--uc-color-accent);
  padding-left: var(--uc-space-4);
}

/* Títulos das semanas em letra normal. */
.uc-week__title { font-weight: 500; }
```

A cor do fundo da semana atual é `--uc-color-highlight`, derivada da cor do curso. Para mudar só a cor, basta `accentColor` no `course.js`.

## Acessibilidade

### O que o componente faz

Usa `<details>` e `<summary>` nativos: abre com Enter ou Espaço e os leitores de ecrã anunciam se está aberta. As datas estão num `<time datetime>`, a semana atual tem `aria-current="date"` e, além da cor, a etiqueta "Esta semana".

### O que cabe a quem escreve

Títulos curtos e descritivos, ligações com texto que diga para onde vão ("Guião 10", não "aqui") e etiquetas no `<dl>` que façam sentido lidas em voz alta.

## Sem JavaScript

Se o kit não carregar, o conteúdo de cada semana continua visível como HTML normal, com o `<dl>` e as ligações. Perdem-se o título, o número e as datas (que são gerados) e a semana deixa de abrir e fechar.

## Ver também

- [`<uc-weeks>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-weeks.md): o contentor das semanas, com interrupções e "Ir para esta semana".
- [`<uc-event>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-event.md): um prazo ou avaliação escrito à mão dentro de uma semana.
- [`<uc-this-week>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-this-week.md): o cartão "Esta semana" da página inicial, que lê a semana atual desta página.
- Uso real: [as semanas de Estruturas de Dados 2025/26](https://uc-design-kit.miguelrocha.dev/examples/edados-2526/semanas.html).
