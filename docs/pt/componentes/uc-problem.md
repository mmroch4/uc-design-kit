# `<uc-problem>`

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-problem.html

O cabeçalho de um enunciado: o juiz e o código do problema, o prazo da série, o botão para submeter e, com `track`, a mesma marca "Resolvido" das listas de `<uc-problems>`.

Exemplo (cabeçalho de um enunciado com prazo e Resolvido), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-problem/basic.html):

```html
<h1>Lecture</h1>
<uc-problem code="499B" judge="codeforces" deadline="t2" track></uc-problem>
<p>Escreva um programa que…</p>
```

O juiz `codeforces` e o prazo `t2` vêm do curso de demonstração. Marcar "Resolvido" aqui marca o mesmo problema em qualquer lista com `track`, e o contrário também.

## Utilização

Põe-se logo a seguir ao título do enunciado, vazio. O código e o juiz são os mesmos que o problema tem na lista da série.

`problemas/pi013.html`:

```html
<h1>Soma dos dígitos</h1>
<uc-problem code="PI013" judge="mooshak" deadline="aula05" track></uc-problem>
<p>Escreva um programa que…</p>
```

`course.js`:

```js
window.UC_COURSE = {
  platforms: [{ id: "mooshak", label: "Mooshak", url: "https://mooshak.dcc.fc.up.pt/" }],
  deadlines: [
    { id: "aula05", title: "Problemas da aula 5", date: "2025-10-24", time: "23:59", kind: "submission" },
  ],
};
```

Na lista da série, o mesmo problema escreve-se `<li data-judge="mooshak">…<code>PI013</code></li>`: os dois guardam o estado com a chave `mooshak:PI013`.

## Atributos

| Atributo | Tipo | Por omissão | Descrição |
| --- | --- | --- | --- |
| `code` | texto | — | O código do problema, no selo do juiz ("Mooshak PI013"). |
| `judge` | `id` ou nome de uma plataforma | — | Como o `data-judge` de `<uc-problems>`. Se a plataforma tiver `url`, o selo é uma ligação e aparece o botão "Submeter no Mooshak". |
| `deadline` | `id` de um prazo | ausente | "Prazo: 24 out, 23:59" com o estado ("Amanhã", "Encerrado"). |
| `track` | booleano | ausente | A caixa "Resolvido", guardada no navegador com a mesma chave do problema nas listas. |
| `data-id` | texto | `<juiz>:<código>` | Outra chave para o estado "Resolvido". |

## Configuração usada

| Campo | Para quê |
| --- | --- |
| [`platforms`](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#plataformas) | O nome do juiz e o endereço do selo e do botão. |
| [`deadlines`](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#prazos) | A data, a hora e o estado do prazo indicado em `deadline`. |

## Personalizar

Estas classes são estáveis na versão 1 e podem ser usadas num `theme.css` (ver [Nível 2: CSS livre](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/css.md)).

| Classe | Elemento |
| --- | --- |
| `.uc-problem` | O próprio `<uc-problem>`, um cartão. |
| `.uc-problem--solved` | O cartão de um problema marcado como resolvido. |
| `.uc-problem__meta` | O selo do juiz e a linha do prazo. |
| `.uc-problem__judge` | O selo "Mooshak PI013" (uma ligação quando a plataforma tem `url`). |
| `.uc-problem__deadline` | A linha "Prazo: …" com a etiqueta do estado. |
| `.uc-problem__actions` | O botão de submeter e a caixa "Resolvido". |
| `.uc-problem__submit` | O botão "Submeter no …". |
| `.uc-problem__solved` | A caixa "Resolvido" (também tem `uc-problems__solved`). |

## Acessibilidade

### O que o componente faz

A caixa "Resolvido" é uma `<input type="checkbox">` com um nome que inclui o código ("Resolvido: PI013"), e o botão de submeter é uma ligação normal.

### O que cabe a quem escreve

Um `<h1>` com o nome do problema antes do componente, para que o cabeçalho fique associado ao enunciado.

## Sem JavaScript

O elemento fica vazio. O enunciado à volta continua completo; só faltam o selo, o prazo e o botão.

## Ver também

- [`<uc-problems>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-problems.md): a lista de problemas de uma série, com a mesma marca "Resolvido".
- [`<uc-exercise>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-exercise.md): um exercício de um guião, com `mooshak`.
- [`.uc-samples`](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/elementos.md#samples): os exemplos de entrada e saída de um enunciado.
