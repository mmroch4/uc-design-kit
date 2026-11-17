# API JavaScript

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/referencia/api-js.html

O `uc-kit.js` define um único objeto global, `window.UC`. É o que um componente próprio (nível 3), um runner ou um script da página usa para ler a configuração, traduzir textos, trabalhar com datas e o calendário, e registar componentes. O contrato é a secção 7 do [api.md](https://github.com/mmroch4/uc-design-kit/blob/main/docs/api.md#7-javascript-api-for-extensions); esta página descreve-o com os detalhes de comportamento.

## Quando o `UC` existe

O kit carrega com `defer`, por isso corre depois de o HTML ser lido e antes do evento `DOMContentLoaded`. Os scripts com `defer` correm pela ordem em que aparecem no `<head>`:

`semanas.html`:

```html
<script src="course.js"></script>                                  <!-- 1. UC_COURSE -->
<script src="https://uc-design-kit.miguelrocha.dev/kit/v1/uc-kit.js" defer></script>  <!-- 2. window.UC -->
<script src="extensions/uc-binary-search.js" defer></script>     <!-- 3. UC já existe -->
```

- Um script carregado **depois** do kit com `defer` (o caso normal de uma extensão) encontra `window.UC` pronto e usa-o diretamente.
- O evento `uc:ready` é disparado enquanto o kit corre, antes desses scripts. Só serve a código que já estava à escuta: um script inline ou sem `defer` colocado antes do kit.
- `UC.define` espera pelo fim da leitura do HTML quando é chamado cedo demais, por isso um componente vê sempre os seus filhos, qualquer que seja a ordem dos scripts.

## Membros de `UC`

Estes são os membros públicos. Os nomes e o comportamento descritos aqui não mudam dentro da versão 1.

| Membro | Devolve | Descrição |
| --- | --- | --- |
| `UC.version` | texto | Versão do kit, por exemplo `"1.0.0"`. Também vem em `event.detail.version` do `uc:ready`. |
| `UC.course` | objeto | A configuração do `course.js` já normalizada: campos em falta com o valor por omissão, datas validadas. Lê-se, não se altera: o objeto de topo está congelado (`Object.freeze`). |
| `UC.lang` | texto | Código da língua ativa (`"pt"`). Só de leitura: para mudar usa-se `UC.setLanguage`. |
| `UC.setLanguage(code)` | nada | Muda a língua ativa e guarda a escolha. Ignora códigos que não estão em `languages`. Com um ficheiro por língua, navega para o outro ficheiro; senão atualiza a página e dispara `uc:languagechange`. |
| `UC.t(key, params?)` | texto | Texto da interface na língua ativa. `params` preenche os `{nomes}` do texto. Ver [Traduções](#traducoes). |
| `UC.text(localizedText, lang?)` | texto | Resolve um `LocalizedText` (texto simples ou `{ pt, en }`) na língua ativa, ou em `lang`; sem essa língua, usa a primeira de `languages` que exista. `null` dá `""`. |
| `UC.today()` | `Date` | "Hoje" à meia-noite local. Respeita `?today=AAAA-MM-DD` no endereço e o campo `today` do `course.js`, nesta ordem. |
| `UC.formatDate(isoOrDate, format?)` | texto | Formata como o `<uc-date>`. Ver [Datas e calendário](#datas). |
| `UC.formatDateRange(start, end, format?)` | texto | Formata um intervalo, "24–30 nov" ou "30 set–3 out"; com `format` `"medium"` acrescenta o ano, "24–30 nov 2025". |
| `UC.weekOf(date)` | objeto ou `null` | A semana letiva que contém `date` (por omissão, hoje): `{ n, start, end }`. `null` fora do semestre e nas interrupções. |
| `UC.weekDates(n)` | objeto ou `null` | As datas da semana `n`: `{ n, start, end }`, ou `null` se não existe. |
| `UC.formatTime(time, end?)` | texto | Uma hora ou um intervalo: `"14:00"` ou `"14:00–15:00"`, em 24 horas em todas as línguas. |
| `UC.formatDuration(minutes)` | texto | Uma duração em minutos escrita como `"2 h"`, `"1 h 45 min"` ou `"45 min"`. |
| `UC.weekdayName(day, format?)` | texto | O nome do dia da semana `day` (`1` = segunda … `7` = domingo): abreviado por omissão (`"3.ª"`, `"Tue"`) ou por extenso com `"long"` (`"terça-feira"`). |
| `UC.Element` | classe | Classe base dos componentes. Ver [`UC.Element`](#uc-element). |
| `UC.define(name, class)` | nada | Regista um componente uma só vez: uma segunda chamada com o mesmo nome é ignorada, sem erro. |
| `UC.addTranslations(lang, dict)` | nada | Acrescenta ou substitui textos da interface de uma língua. Se for a língua ativa, os componentes já desenhados voltam a ser desenhados. |
| `UC.registerRunner(name, runner)` | nada | Acrescenta ou substitui um runner de código. Ver [Runners](https://uc-design-kit.miguelrocha.dev/docs/pt/referencia/runners.md). |
| `UC.search.available()` | `Promise<boolean>` | Se o site tem índice de pesquisa. Pergunta ao servidor se ainda não o fez nesta visita; `false` sem `search` no `course.js`. Versão 1.2.0. |
| `UC.search.open(query?)` | nada | Abre a pesquisa do site, com `query` já escrita se for dada. Sem índice, não faz nada. Versão 1.2.0. |

O objeto também tem `UC.internal`, partilhado entre os ficheiros do kit, e outros membros que não estão nesta tabela. Não fazem parte do contrato e podem mudar numa versão de correção.

## `UC.Element`

Estende `HTMLElement`. Os componentes do kit e os componentes próprios desenham no *light DOM* (sem shadow DOM), para o CSS da página se aplicar ao que geram.

| Membro | Quando corre | Para quê |
| --- | --- | --- |
| `setup()` | Uma vez, na primeira ligação à página. | Guardar os filhos escritos pelo professor e criar a estrutura que `render()` vai atualizar. |
| `render()` | Logo a seguir a `setup()`, em cada nova ligação, quando a língua muda e quando chegam traduções da língua ativa. | Atualizar textos, atributos e classes. Tem de ser idempotente: chamado duas vezes, o resultado é o mesmo. |
| `this.course` | Sempre. | O mesmo que `UC.course`. |
| `this.t(key, params?)` | Sempre. | O mesmo que `UC.t`. |
| `this.text(value)` | Sempre. | O mesmo que `UC.text`. |

`extensions/uc-binary-search.js`:

```js
UC.define("uc-binary-search", class extends UC.Element {
  setup() {
    // Once: read the teacher's markup and build the parts render() updates.
    this.values = this.getAttribute("values").split(",").map(Number);
    this.status = document.createElement("p");
    this.append(this.status);
  }

  render() {
    // Every time: only change text, attributes and classes.
    this.status.textContent = this.t("binarySearch.ready", { n: this.values.length });
  }
});
```

Um componente não precisa de ouvir `uc:languagechange`: o kit chama `render()`. Se precisar de `connectedCallback` ou `disconnectedCallback` próprios, chama `super` primeiro. O tutorial completo, com eventos, acessibilidade e o que se vê sem JavaScript, está em [Nível 3: componentes próprios](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/componentes.md).

## Traduções

Os textos da interface vivem em dicionários por língua. `UC.addTranslations` aceita objetos encaixados e guarda-os com chaves separadas por pontos:

```js
UC.addTranslations("pt", { binarySearch: { ready: "{n} valores, pronto a procurar." } });
UC.t("binarySearch.ready", { n: 8 });   // "8 valores, pronto a procurar."
UC.t("nav.menu");                       // "Menu" (a kit string)
```

- Procura na língua ativa (`pt-BR`), depois na língua base (`pt`), depois em inglês.
- Uma chave que não existe devolve a própria chave e escreve `[uc-kit] missing translation: …` na consola.
- Valores que não são texto (as listas de meses e dias da semana do kit) são devolvidos como estão, sem preencher `params`.
- Um `{nome}` sem valor em `params` fica no texto tal como está.

As chaves do kit estão em [`kit/src/i18n/pt.js`](https://github.com/mmroch4/uc-design-kit/blob/main/kit/src/i18n/pt.js). Usar a mesma chave substitui o texto do kit; para não colidir, os componentes próprios usam um grupo com o seu nome.

## Datas e calendário

As datas são dias do calendário local, sem fusos horários. As funções aceitam um texto ISO (`"2025-11-27"`) ou um `Date`.

| Chamada | Resultado |
| --- | --- |
| `UC.formatDate("2025-11-27")` | 27 nov |
| `UC.formatDate("2025-11-27", "medium")` | 27 nov 2025 |
| `UC.formatDate("2025-11-27", "long")` | 27 de novembro de 2025 |
| `UC.formatDate("2025-11-27", "weekday")` | quinta-feira, 27 nov |
| `UC.formatDate("2026-01")` | janeiro 2026 |
| `UC.formatDate(null)` | Por marcar |

Um formato desconhecido usa `short`. Um mês sem dia (`"2026-01"`) mostra sempre o mês e o ano. O texto de cada formato vem das traduções (`dates.format.*`), por isso muda com a língua.

```js
// Demo course: semester from 15 Sep 2025, today 27 Nov 2025.
UC.weekOf();                 // { n: 10, start: Date(24 Nov), end: Date(28 Nov) }
UC.weekDates(1);             // { n: 1, start: Date(15 Sep), end: Date(19 Sep) }
UC.weekOf("2025-10-29");     // null: study week (a break)
UC.weekOf("2025-12-25");     // null: after week 12
```

`start` e `end` são o primeiro e o último dia de aulas da semana (`teachingDays`); na semana 1, `start` é a data de início do semestre se cair a meio da semana. As semanas são as do `<uc-weeks>`: ver [como o kit conta as semanas](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-weeks.md#elementos-gerados).

## Eventos

Todos são `CustomEvent` e chegam ao `document`.

| Evento | Quando | `event.detail` |
| --- | --- | --- |
| `uc:ready` | A configuração foi lida e os componentes do kit estão definidos. Uma vez por página; o `<html>` recebe a classe `uc-ready` ao mesmo tempo. | `{ version }` |
| `uc:languagechange` | Depois de a língua ativa mudar na mesma página (não quando a mudança navega para outro ficheiro). | `{ lang }` |
| `uc:classchange` | Um estudante escolheu "A minha turma" num `<uc-timetable>`. Dispara no `document`; os outros horários da página seguem a escolha. | `{ type, class }` (`class` vazio = todas) |
| `uc:problemchange` | Um problema de um `<uc-problems track>` foi marcado como resolvido ou não. Dispara na lista e sobe até ao `document`; as outras listas da página com o mesmo problema seguem a escolha. | `{ id, solved }` |
| `uc:searchready` | O índice de pesquisa existe (só em sites com `search`). O botão «Pesquisar» aparece ao mesmo tempo. | — |
| `uc:exercisechange` | Um `<uc-exercise>` foi marcado como feito ou por fazer. Dispara no exercício e sobe até ao `document`. | `{ id, done }` |

```js
document.addEventListener("uc:exercisechange", (event) => {
  console.log(event.detail.id, event.detail.done);   // "ex-3" true
});
```

## Ver também

- [Nível 3: componentes próprios](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/componentes.md): o tutorial de um componente do início ao fim.
- [Runners](https://uc-design-kit.miguelrocha.dev/docs/pt/referencia/runners.md): o contrato de `UC.registerRunner`.
- [O ficheiro course.js](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md): os campos que aparecem em `UC.course`.
- [Acrescentar uma língua](https://uc-design-kit.miguelrocha.dev/docs/pt/linguas.md#outra-lingua) com `UC.addTranslations`.
