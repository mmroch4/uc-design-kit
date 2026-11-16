# `<uc-event>`

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-event.html

Um prazo, uma avaliação ou um exame em destaque, dentro de uma semana ou entre semanas. Pode tirar tudo de um prazo do `course.js` ou ser escrito à mão com um tipo e uma data.

Exemplo (o teste prático a partir do course.js), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-event/basic.html):

```html
<uc-event deadline="teste">
  <a href="#">Matéria e regras do teste</a>
</uc-event>
```

O tipo, o título, o dia com a hora e a nota vêm do prazo `teste` do `course.js`. A ligação "Matéria e regras do teste" foi escrita dentro do elemento e aparece depois do conteúdo gerado.

## Utilização

Na forma mais comum, o elemento só indica o identificador de um prazo. O que estiver dentro dele (ligações, uma frase) é acrescentado no fim.

`semanas.html`:

```html
<uc-event deadline="teste">
  <a href="testes/regras.html">Matéria e regras do teste</a>
</uc-event>
```

`course.js`:

```js
window.UC_COURSE = {
  title: "Algoritmos e Programação",
  deadlines: [
    {
      id: "teste",                // the value of the deadline attribute
      title: "Teste prático",
      date: "2025-12-10",
      time: "14:00",
      kind: "assessment",         // amber tag: "Avaliação"
      note: "Laboratórios 1 e 2",
    },
  ],
};
```

Os prazos do `course.js` já aparecem sozinhos na semana certa de um [`<uc-weeks>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-weeks.md). Escreve-se um `<uc-event deadline>` quando se quer acrescentar-lhe conteúdo, ou mostrá-lo noutra página (por exemplo na de avaliação).

## Exemplos

### Escrito à mão

Sem `deadline`, o tipo vem de `kind` e a data de `date`. O componente gera só a etiqueta do tipo e a data; o título e o resto escrevem-se dentro do elemento. Serve para algo que não está nos prazos do `course.js`, como uma apresentação ou um feriado.

Exemplo (apresentação dos projetos escrita à mão), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-event/manual.html):

```html
<uc-event kind="assessment" date="2025-12-17">
  <strong>Apresentação dos projetos</strong>
  <span>15 minutos por grupo, sala 1.03</span>
</uc-event>
```

### Dentro de uma semana

Dentro de uma `<uc-week>`, um `<uc-event deadline="t2">` substitui o que a semana geraria para esse prazo: a entrega do trabalho 2 aparece uma só vez, com o enunciado e a frase acrescentados.

Exemplo (entrega do trabalho 2 dentro da semana 10), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-event/in-week.html):

```html
<uc-week n="10" title="Pesquisa binária e árvores">
  <dl>
    <dt>Teóricas</dt>
    <dd>Pesquisa binária, árvores binárias de pesquisa</dd>
  </dl>
  <uc-event deadline="t2">
    <a href="#">Enunciado</a>
    <span>Um .zip com o código e o relatório.</span>
  </uc-event>
</uc-week>
```

### Entre semanas

Dentro de um `<uc-weeks>` mas fora das semanas, o evento fica onde foi escrito. O exame de janeiro, que o `<uc-weeks>` poria no fim, não é repetido porque já está escrito à mão, com a data limite da inscrição.

Exemplo (exame escrito depois da semana 12), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-event/between-weeks.html):

```html
<uc-weeks no-breaks>
  <uc-week n="11" title="Grafos: pesquisa em largura e em profundidade">
    <dl>
      <dt>Teóricas</dt>
      <dd>Representação de grafos, BFS e DFS</dd>
    </dl>
  </uc-week>
  <uc-week n="12" title="Revisões e teste prático">
    <dl>
      <dt>Teóricas</dt>
      <dd>Revisões da matéria</dd>
    </dl>
  </uc-week>
  <uc-event deadline="exame">
    <span>Inscrição no exame até 5 de janeiro.</span>
  </uc-event>
</uc-weeks>
```

## Atributos

| Atributo | Tipo | Por omissão | Descrição |
| --- | --- | --- | --- |
| `deadline` | identificador de prazo | — | O `id` de um prazo do `course.js`. Dá o tipo, o título, a data, a nota e as ligações; com ele, `kind` e `date` são ignorados. |
| `kind` | tipo de prazo | `other` | Sem `deadline`: `assessment`, `exam`, `quiz`, `submission` ou `other`. Os dois primeiros têm a etiqueta a âmbar. |
| `date` | data ISO | — | Sem `deadline`: o dia (`AAAA-MM-DD`) ou só o mês (`AAAA-MM`). |

## Configuração usada

Campos do `course.js` que o componente lê. Um evento escrito à mão (sem `deadline`) só usa o dia de hoje.

| Campo | Para quê |
| --- | --- |
| `deadlines` | O prazo indicado em `deadline`: `title`, `date`, `time`, `end`, `kind`, `note`, `url` e `links` ([prazos](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#prazos)). |
| `today` | Decidir se o evento já passou (classes `--past` e `--future`); `?today=AAAA-MM-DD` no endereço tem prioridade ([avançado](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#campos-avancado)). |

Com `url`, o título passa a ser uma ligação. O `url` e os `links` de um prazo são relativos ao `course.js`, como os `href` das páginas, por isso funcionam também em páginas dentro de subpastas. Ver [Subpastas](https://uc-design-kit.miguelrocha.dev/docs/pt/estrutura.md#subpastas).

Um `deadline` que não existe no `course.js` deixa um aviso na consola do navegador e o evento mostra só o que foi escrito dentro dele.

## Personalizar

Estas classes são estáveis na versão 1 e podem ser usadas num `theme.css`. As classes de estado não têm estilo no kit: existem para o professor as usar. O método está em [Nível 2: CSS livre](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/css.md); para mudar só cores, cantos ou letra em todo o site bastam os [tokens](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/tokens.md).

| Classe | Elemento |
| --- | --- |
| `.uc-event` | O evento (o próprio `<uc-event>`). |
| `.uc-event--past`, `--future` | O último dia do evento já passou, ou ainda não (hoje conta como futuro). |
| `.uc-event__kind` | A etiqueta do tipo (também `.uc-tag`). |
| `.uc-event__title` | O título do prazo (`<strong>`, ou `<a>` com `url`). |
| `.uc-event__date` | A data, a hora ou o intervalo. |
| `.uc-event__note` | A nota do prazo. |
| `.uc-event__link` | Cada ligação de `links`. |

`theme.css`:

```css
/* Eventos que já passaram em cinzento, sem o fundo âmbar. */
.uc-event--past {
  background: var(--uc-color-surface-muted);
  border-color: var(--uc-color-border);
}

/* Data antes do título, numa linha própria. */
.uc-event__date { order: -1; flex-basis: 100%; }
```

## Acessibilidade

### O que o componente faz

O tipo é dito por extenso na etiqueta ("Avaliação", "Exame"), não só pela cor, e a data está num `<time datetime>`. As cores da etiqueta e do fundo âmbar respeitam o contraste mínimo de 4,5:1.

### O que cabe a quem escreve

Num evento escrito à mão, pôr o título em texto (por exemplo num `<strong>`), porque o componente não o gera. Ligações com texto que diga para onde vão ("Enunciado", "Matéria e regras do teste").

## Sem JavaScript

Só aparece o que foi escrito dentro do elemento, sem etiqueta, título, data nem caixa. Um `<uc-event deadline="teste"></uc-event>` vazio não mostra nada; se a data tiver de se ver sempre, escreve-se também no conteúdo da semana.

## Ver também

- [`<uc-weeks>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-weeks.md): acrescenta sozinho eventos para os prazos depois das interrupções e no fim.
- [`<uc-week>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-week.md): acrescenta sozinha eventos para os prazos da semana.
- [`<uc-deadlines>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-deadlines.md): a lista das próximas datas, a partir dos mesmos prazos.
- [`<uc-date>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-date.md): só a data de um prazo, no meio do texto.
- Uso real: [as semanas de Estruturas de Dados 2025/26](https://uc-design-kit.miguelrocha.dev/examples/edados-2526/semanas.html), com os eventos gerados a partir dos prazos.
