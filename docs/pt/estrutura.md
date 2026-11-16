# Estrutura de um site

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/estrutura.html

Um site feito com o kit é uma pasta por ano letivo. Cada página HTML carrega o CSS do kit, o `course.js` da pasta e o JavaScript do kit; o resto são ficheiros normais (PDF, código, imagens) ligados com caminhos relativos.

## A pasta de um ano

Este é o esqueleto típico, a partir do modelo. Só o `course.js` e as páginas são obrigatórios; o resto cresce com a cadeira.

```text
2627/
├── course.js            configuração do ano
├── theme.css            estilos próprios (opcional)
├── index.html           página inicial
├── semanas.html
├── avaliacao.html
├── materiais.html
├── sobre.html
├── guioes/              uma página por aula prática
│   ├── aula01.html
│   └── aula02.html
├── slides/              PDF
├── codigo/              ficheiros .java, .py…
└── extensions/          componentes próprios (opcional)
    └── uc-bst-traversal.js
```

O kit não se copia para a pasta: é carregado de um endereço fixo, igual para todas as cadeiras. Assim a pasta só tem o conteúdo da cadeira, e as correções do kit chegam a todos os sites sem ninguém mexer neles.

## O `<head>` de cada página

Todas as páginas começam da mesma forma. A ordem importa: o `course.js` vem antes do kit e sem `defer`, para a configuração já existir quando o kit arranca.

`semanas.html`:

```html
<!doctype html>
<html lang="pt">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Semanas · Algoritmos e Programação 2025/26</title>
  <link rel="preload" href="https://uc-design-kit.miguelrocha.dev/kit/v1/fonts/inter-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="https://uc-design-kit.miguelrocha.dev/kit/v1/uc-kit.css">
  <link rel="stylesheet" href="theme.css">
  <script src="course.js"></script>
  <script src="https://uc-design-kit.miguelrocha.dev/kit/v1/uc-kit.js" defer></script>
</head>
<body>
  <uc-page current="weeks">
    …conteúdo da página…
  </uc-page>
</body>
</html>
```

| Linha | Obrigatória | Para quê |
| --- | --- | --- |
| `<html lang>` | Sim | Língua em que a página está escrita. Com mais de uma língua, ver [Línguas](https://uc-design-kit.miguelrocha.dev/docs/pt/linguas.md). |
| `preload` | Não | Começa a descarregar a letra ao mesmo tempo que o CSS, e a página aparece mais cedo na primeira visita. Manter `crossorigin` e o endereço absoluto. |
| `uc-kit.css` | Sim | Estilos e tokens do kit. |
| `theme.css` | Não | Estilos próprios, depois do kit para ganharem às regras dele. |
| `course.js` | Sim | A configuração. Antes do kit, sem `defer`. |
| `uc-kit.js` | Sim | Os componentes. Com `defer` (ou no fim do `<body>`). |

O `v1` nos três endereços é sempre a versão 1 mais recente. Para fixar uma versão exata durante o semestre troca-se por, por exemplo, `v1.0.0`; ver [Versão do kit](https://uc-design-kit.miguelrocha.dev/docs/pt/publicar.md#versao).

## O corpo de uma página

O [`<uc-page>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-page.md) desenha o cabeçalho, a navegação, o rodapé e o `<main>` à volta do conteúdo. O atributo `current` diz que item da navegação fica ativo. Sem ele, o kit procura em `pages` a página com o mesmo nome de ficheiro; escrevê-lo torna a página explícita e permite marcar um item a partir de uma página que não está na navegação (um guião com `current="weeks"` deixa "Semanas" ativo).

A navegação vem do campo `pages` do `course.js`, pela ordem em que está escrita. Os identificadores `home`, `weeks`, `assessment`, `materials`, `schedule` e `about` já têm nome em português e inglês; para outra página dá-se o `label`:

`course.js`:

```js
pages: [
  "home",                                        // index.html, "Início"
  { id: "weeks", href: "semanas.html" },         // nome do ficheiro próprio
  { id: "assessment", href: "avaliacao.html" },
  { id: "projects", href: "projetos.html", label: "Projetos" },
],
```

Para uma página sem navegação (um guião para projetar, um enunciado), usa-se `<uc-page layout="full">`.

## Páginas em subpastas

Uma página dentro de `guioes/` carrega o `course.js` com `../`. Os endereços do kit são absolutos e não mudam.

`guioes/aula10.html`:

```html
<link rel="stylesheet" href="https://uc-design-kit.miguelrocha.dev/kit/v1/uc-kit.css">
<link rel="stylesheet" href="../theme.css">
<script src="../course.js"></script>
<script src="https://uc-design-kit.miguelrocha.dev/kit/v1/uc-kit.js" defer></script>
```

Os `href` das páginas no `course.js` são relativos ao `course.js`, não à página. Por isso a navegação de `guioes/aula10.html` aponta sozinha para `../semanas.html`. O mesmo vale para todos os endereços escritos no `course.js`: o `logo`, o `url` e os `links` dos prazos, o `url` da equipa e das plataformas, e as ligações e imagens dentro dos avisos e do rodapé. Os links escritos no HTML de uma página são relativos a essa página, como sempre. Um endereço que começa por `https:`, `/` ou `#` fica como está.

## Links e ficheiros

- **Caminhos relativos.** `slides/aula01.pdf`, `../codigo/BST.java`. Assim a pasta funciona no servidor, noutra pasta e aberta do disco.
- **Com `.html`.** Escrever `semanas.html` e não `semanas`: só alguns servidores completam a extensão, e do disco nunca.
- **Pasta com `index.html`.** Para ligar a uma pasta, ligar ao ficheiro: `codigo/index.html`.
- **Âncoras das semanas.** Cada semana tem `id="week-<n>"`; `semanas.html#week-5` abre a semana 5.

## Componentes próprios

Um componente feito para a cadeira (uma animação de uma árvore, um simulador) fica num ficheiro na pasta `extensions/` e carrega-se depois do kit, só nas páginas que o usam:

```html
<script src="https://uc-design-kit.miguelrocha.dev/kit/v1/uc-kit.js" defer></script>
<script src="../extensions/uc-bst-traversal.js" defer></script>
```

Como se escreve um componente está em [Nível 3: componentes próprios](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/componentes.md); os outros níveis de personalização, do `course.js` ao HTML livre, estão em [Personalizar](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/index.md). O [exemplo de Estruturas de Dados](https://uc-design-kit.miguelrocha.dev/examples/edados-2526/index.html) tem um em `extensions/`.
