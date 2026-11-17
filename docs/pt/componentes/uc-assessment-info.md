# `<uc-assessment-info>`

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-assessment-info.html

O cartão no topo da página de um teste ou exame: dia, horas ou turnos, duração, local, quanto falta e os links, tirados do prazo no `course.js`. Pode juntar um botão para guardar a prova no calendário.

Exemplo (cartão do teste prático com turnos e calendário), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-assessment-info/basic.html):

```html
<uc-assessment-info deadline="teste" calendar>
  <h2>Regras</h2>
  <ul class="uc-bullets">
    <li>Sem consulta; traz o cartão de estudante.</li>
    <li>Matéria: semanas 1 a 10.</li>
  </ul>
</uc-assessment-info>
```

A demonstração mostra o teste prático do curso fictício: dois turnos (o segundo noutra sala), 1 h 45 min, as salas com um link que pede autenticação e o estado "Daqui a 13 dias". As regras escritas dentro do elemento ficam por baixo do cartão.

## Utilização

Põe-se o elemento no início da página da prova, com o `id` do prazo. O resto da página (regras, matéria, enunciados anteriores) escreve-se dentro dele.

`teste1.html`:

```html
<uc-assessment-info deadline="t1" calendar>
  <h2>Regras</h2>
  <p>Sem consulta.</p>
  <h2>Enunciados anteriores</h2>
  <ul class="uc-links"><li><a href="…" data-auth>Teste 1 de 2024/25</a></li></ul>
</uc-assessment-info>
```

Os dados vêm do [prazo](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#prazos). Além de `date` e `time`, um prazo pode ter `duration` (minutos), `location` e `shifts` (turnos):

`course.js`:

```js
{ id: "t1", title: "1.º teste", date: "2025-11-05", time: "14:30", kind: "assessment",
  duration: 120,
  location: "FC1 120, FC1 122 · <a href=\"evaluation/salas_t1.pdf\" data-auth>distribuição por salas</a>",
  shifts: [{ time: "14:30" }, { time: "16:30", note: "Turmas PL5 a PL8" }],
  url: "teste1.html" },
```

Estes campos servem também os outros componentes: [`<uc-deadlines>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-deadlines.md), [`<uc-event>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-event.md) e o cartão "Esta semana" mostram "14:30 e 16:30" para turnos e "14:30–16:30" com uma duração.

## Exemplos

### O que o cartão mostra

- **Data**, por extenso e com o dia da semana; só o mês, ou "Por marcar", quando o dia ainda não se sabe.
- **Hora** (com a hora de fim, se houver duração) ou **Turnos**, um por linha, com a sala e a nota de cada um e o dia quando é outro.
- **Duração**, **Local** e **Estado**: "Daqui a 5 dias", "Amanhã", "Hoje", "A decorrer", "Realizado" ou "Por marcar".
- **Ligações**: o `url` do prazo (se não for a própria página) e os `links`. A `note` do prazo aparece por baixo.

### Data por marcar

Um exame de que só se sabe o mês mostra o mês e "Por marcar", e não tem o botão do calendário.

Exemplo (exame com o dia por marcar), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-assessment-info/unscheduled.html):

```html
<uc-assessment-info deadline="exame" heading-level="2"></uc-assessment-info>
```

### Adicionar ao calendário

Com `calendar`, o botão descarrega um ficheiro `.ics` criado no browser (`<code>-<id>.ics`), com um evento por turno, a hora de Lisboa, o local e o endereço da página. Abre-se no Google Calendar, no Outlook ou no calendário do telemóvel. Uma prova sem hora fica como evento de dia inteiro.

## Atributos

| Atributo | Tipo | Por omissão | Descrição |
| --- | --- | --- | --- |
| `deadline` | `id` de um prazo | obrigatório | O prazo de onde vêm os dados. Com um `id` que não existe, só aparece o que está escrito dentro, e a consola avisa. |
| `calendar` | booleano | ausente | Botão "Adicionar ao calendário" (ficheiro `.ics`). Não aparece quando o dia não está marcado. |
| `heading` | texto ou `none` | o `title` do prazo | Título do cartão. Com `none`, não há título visível. |
| `heading-level` | `2` a `6` | `2` | Nível do título gerado. |

## Configuração usada

| Campo | Para quê |
| --- | --- |
| [`deadlines`](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#prazos) | `title`, `date`, `end`, `time`, `duration`, `location`, `shifts`, `note`, `url` e `links` do prazo indicado. |
| [`code`](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#campos) | O nome do ficheiro `.ics`. |

## Personalizar

Estas classes são estáveis na versão 1 e podem ser usadas num `theme.css`. As regras do kit têm especificidade zero, por isso qualquer regra do professor ganha. O método está em [Nível 2: CSS livre](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/css.md).

| Classe | Elemento |
| --- | --- |
| `.uc-assessment-info` | O componente (o próprio `<uc-assessment-info>`). |
| `.uc-assessment-info__card`, `__heading` | O cartão (também `uc-card`) e o seu título. |
| `.uc-assessment-info__shifts` | A lista dos turnos. |
| `.uc-assessment-info__status` | A etiqueta do estado ("Daqui a 5 dias"). |
| `.uc-assessment-info__note` | A nota do prazo, por baixo da lista. |
| `.uc-assessment-info__calendar` | O botão "Adicionar ao calendário". |

`theme.css`:

```css
/* Cartão com o fundo de destaque. */
.uc-assessment-info__card { background: var(--uc-color-highlight); }
```

## Acessibilidade

### O que o componente faz

O cartão é uma secção com título e uma lista de definições (`<dl>`); as datas e as horas são elementos `<time>`. O estado é texto, e a cor só o repete. O nome do botão diz o que descarrega ("Adicionar ao calendário, ficheiro .ics").

### O que cabe a quem escreve

Escrever as salas de forma curta e pôr `data-auth` nos links que pedem autenticação. Manter os títulos do que se escreve dentro um nível abaixo do título da página.

## Sem JavaScript

Os dados estão no `course.js`, por isso sem o kit só aparece o que está escrito dentro do elemento. Numa página de exame, convém escrever a data também num `<noscript>`:

`exame.html`:

```html
<uc-assessment-info deadline="exame">
  <noscript><p>Exame: 14 de janeiro de 2026, 14:00.</p></noscript>
  …
</uc-assessment-info>
```

## Ver também

- [O ficheiro course.js](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#prazos): os campos de um prazo, incluindo os turnos.
- [`<uc-grading>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-grading.md): como é calculada a nota.
- [`<uc-event>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-event.md): a mesma prova dentro da semana em que cai.
