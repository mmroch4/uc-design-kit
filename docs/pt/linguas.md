# Línguas

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/linguas.html

Um site pode ter uma ou mais línguas. Os textos do kit (nomes das páginas, "Esta semana", datas) já existem em português e inglês; o conteúdo escreve-se na mesma página, com o atributo `lang`, ou num ficheiro por língua.

## Uma só língua

É o caso mais simples e não pede nada: o kit usa a língua do `<html lang>` da página. Para um site em inglês basta `<html lang="en">` em todas as páginas.

Escrever `languages: ["pt"]` no `course.js` deixa a escolha explícita e é o que o modelo faz.

## Ativar mais línguas

Com mais de uma língua em `languages`, aparece no cabeçalho do [`<uc-page>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-page.md) um botão para mudar de língua. A primeira da lista é a de omissão.

`course.js`:

```js
window.UC_COURSE = {
  title: { pt: "Algoritmos e Programação", en: "Algorithms and Programming" },
  languages: ["pt", "en"],
  semester: {
    start: "2025-09-15",
    breaks: [
      { start: "2025-10-27", end: "2025-10-31", label: { pt: "Semana de estudo", en: "Study week" } },
    ],
  },
  deadlines: [
    { id: "t2", title: { pt: "Entrega do trabalho 2", en: "Project 2 due" },
      date: "2025-11-28", kind: "submission" },
  ],
};
```

Cada texto do `course.js` que muda com a língua passa a objeto, com um valor por língua (o tipo [`LocalizedText`](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#tipos)). Um texto simples fica igual nas duas, e se faltar uma língua usa-se a primeira.

A língua ativa escolhe-se por esta ordem: `?lang=en` no endereço, a última escolha feita no botão (guardada no browser, para cada cadeira), o `<html lang>` da página e, por fim, a primeira de `languages`.

## Conteúdo na mesma página

É a forma mais prática quando os textos são curtos. Cada bloco que existe em duas versões leva o atributo `lang`, e o kit esconde as versões que não são da língua ativa. O que não tem `lang` aparece sempre.

Exemplo (texto bilingue e prazos, em inglês), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/languages/in-place.html?lang=en):

```html
<p lang="pt">As aulas começam a <uc-date value="2025-09-15" format="long"></uc-date>.</p>
<p lang="en">Classes start on <uc-date value="2025-09-15" format="long"></uc-date>.</p>
<uc-deadlines limit="2"></uc-deadlines>
```

A demonstração abre em inglês (`?lang=en`): o parágrafo em português fica escondido e os componentes traduzem os seus próprios textos e as datas. Nas semanas, o título noutra língua vai num atributo, `title-en`; ver [`<uc-week>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-week.md#titulo-noutra-lingua).

Sem JavaScript as duas versões ficam visíveis, uma a seguir à outra. Por isso convém pôr a língua principal primeiro.

## Um ficheiro por língua

Para páginas longas (a ficha da cadeira, um enunciado), é mais fácil manter um ficheiro por língua. No `course.js` o `href` da página passa a ter um ficheiro por língua, e o botão passa a navegar entre os ficheiros em vez de trocar o texto:

`course.js`:

```js
pages: [
  "home",
  { id: "about", href: { pt: "sobre.html", en: "about.html" } },
],
```

Cada ficheiro declara a sua língua com `<html lang="pt">` ou `<html lang="en">` e o mesmo `<uc-page current="about">`. As duas formas misturam-se: páginas curtas com `lang` e páginas longas em ficheiros separados.

### Páginas que não estão no menu

Os guiões, os enunciados e as outras páginas fora de `pages` dizem qual é a sua tradução no `<head>`, com um `<link rel="alternate">` por língua. O botão de língua do cabeçalho passa a abrir esse ficheiro, e já não é preciso uma ligação "English version" no texto:

`praticas/aula05_pt.html`:

```html
<html lang="pt">
<head>
  …
  <link rel="alternate" hreflang="en" href="aula05.html">
</head>
```

O ficheiro em inglês faz o mesmo ao contrário (`hreflang="pt" href="aula05_pt.html"`). Os motores de pesquisa também leem estas ligações.

## Acrescentar uma língua

O kit traz os textos da interface em português (`pt`) e inglês (`en`). Para outra língua, dá-se ao kit o dicionário dessa língua num script local, carregado depois do kit:

`extensions/es.js`:

```js
UC.addTranslations("es", {
  language: { name: "Español", short: "ES" },
  pages: { home: "Inicio", weeks: "Semanas", assessment: "Evaluación" },
  // …as mesmas chaves que kit/src/i18n/en.js
});
```

A lista completa de chaves está em [`kit/src/i18n/en.js`](https://github.com/mmroch4/uc-design-kit/blob/main/kit/src/i18n/en.js). Uma chave em falta aparece em inglês. Depois, junta-se `"es"` a `languages` e carrega-se o ficheiro em todas as páginas, a seguir ao kit e também com `defer`:

```html
<script src="https://uc-design-kit.miguelrocha.dev/kit/v1/uc-kit.js" defer></script>
<script src="extensions/es.js" defer></script>
```

Uma língua útil a outras cadeiras pode ser proposta ao kit, como um ficheiro novo em `kit/src/i18n/`.

`UC.addTranslations` também serve para mudar um texto do kit numa língua que já existe, por exemplo `UC.addTranslations("pt", { pages: { about: "Ficha da UC" } })`. Os componentes próprios usam o mesmo mecanismo para os seus textos; ver [Textos e línguas](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/componentes.md#textos).
