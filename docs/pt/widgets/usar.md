# Usar widgets

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/usar.html

Uma linha no `<head>` por tipo de widget, um elemento no sítio da página onde a demonstração deve aparecer e, lá dentro, o texto que se lê sem JavaScript.

## Importar

O script do widget vem depois do kit, também com `defer`. Ele próprio carrega, da mesma pasta, o núcleo partilhado (`uc-widget-core.js`) e os estilos (`uc-widget.css`), uma vez por página, por muitos widgets que a página tenha.

`aula05.html`:

```html
<head>
  …
  <script src="https://uc-design-kit.miguelrocha.dev/kit/v1/uc-kit.js" defer></script>
  <script src="https://uc-design-kit.miguelrocha.dev/widgets/v1/uc-widget-sort.js" defer></script>
</head>
<body>
  …
  <uc-widget-sort values="5 2 9 1 7 3" algorithm="insertion">
    <p>Inserção de 5 2 9 1 7 3: 2 5 9 1 7 3, 1 2 5 9 7 3, 1 2 5 7 9 3, 1 2 3 5 7 9.</p>
  </uc-widget-sort>
</body>
```

Um caminho relativo (`../../widgets/v1/uc-widget-sort.js`) também serve, como para o kit. O widget só é construído quando chega perto do ecrã; até lá, e se algo falhar, mostra-se o texto escrito dentro do elemento.

### Pré-carregar o núcleo

Opcional: para poupar um pedido na primeira visita, a página pode pedir o núcleo e os estilos logo, antes dos scripts dos widgets.

```html
<link rel="stylesheet" href="https://uc-design-kit.miguelrocha.dev/widgets/v1/uc-widget.css">
<script src="https://uc-design-kit.miguelrocha.dev/widgets/v1/uc-widget-core.js" defer></script>
```

## Atributos comuns

Todos os widgets aceitam estes atributos; os próprios de cada um estão na sua página.

| Atributo | Valores | Por omissão | Efeito |
| --- | --- | --- | --- |
| `algorithm` | um nome da lista do widget | o primeiro | Que algoritmo da família corre. |
| `algorithms` | nomes da lista do widget, separados por espaços | ausente | Botões por cima do desenho para o estudante trocar de algoritmo (por exemplo os quatro percursos de `<uc-widget-bst>`). Começa em `algorithm`. |
| `speed` | milissegundos, 200 a 5000 | `900` | Tempo entre passos ao reproduzir. |
| `controls` | `full`, `compact` | `full` | `compact`: só Recuar, Passo e o contador. |
| `editable` | booleano | ausente | O estudante muda os dados e corre outra vez. |
| `predict` | booleano | ausente | Antes de alguns passos, o estudante escolhe o que acontece a seguir. |
| `start` | `0`, um número de passo, `end` | `0` | Passo mostrado ao construir. `end` mostra logo o resultado. |
| `seed` | inteiro | `1` | Semente dos dados `random`: a mesma semente dá sempre os mesmos dados. |
| `caption` | texto | o nome do algoritmo | Legenda visível e nome acessível do widget. |

Um valor inválido de um destes atributos volta ao valor por omissão e deixa um aviso na consola. Dados inválidos (`values="5 x 3"`) mostram uma nota de erro por cima do texto do professor.

Valores: inteiros separados por espaços ou vírgulas (`values="5 3 8 1"`), ou `values="random 8"` / `values="random 8 1..50"` para valores aleatórios, sempre os mesmos para a mesma `seed`.

## Leitor e teclado

Cada widget tem Reproduzir/Pausar, Recuar, Passo, Reiniciar, uma barra para saltar para qualquer passo e o contador "Passo 4 de 17". Nunca começa a reproduzir sozinho e para quando sai do ecrã. Com o foco no widget:

| Tecla | Ação |
| --- | --- |
| `→` / `←` | Passo seguinte / anterior. |
| `Home` / `End` | Primeiro / último passo. |
| `Espaço` | Reproduzir / Pausar, com o foco no desenho. |
| `Esc` | Pausar. |

## Pseudocódigo próprio

Cada algoritmo traz pseudocódigo em português e inglês, com a linha atual destacada. Para mostrar o código na linguagem da cadeira, escreve-se um `<pre data-pseudocode>` dentro do widget e marcam-se as linhas com `data-line`, com os identificadores que a página de cada widget indica:

```html
<uc-widget-sort values="5 2 9 1" algorithm="insertion">
  <pre data-pseudocode data-algorithm="insertion"><code>for (int i = 1; i &lt; n; i++) {
<span data-line="take">  int x = a[i];</span>
  int j = i - 1;
<span data-line="compare">  while (j &gt;= 0 &amp;&amp; a[j] &gt; x) {</span>
<span data-line="shift">    a[j + 1] = a[j]; j--;</span>
  }
<span data-line="insert">  a[j + 1] = x;</span>
}</code></pre>
  <p>…texto sem JavaScript…</p>
</uc-widget-sort>
```

Nos widgets de operações (`<uc-widget-bst>`, `<uc-widget-list>`, `<uc-widget-stack-queue>`) o pseudocódigo muda com a operação em curso; `data-algorithm` recebe então o nome do bloco que a página do widget indica (`data-algorithm="insert"`, `data-algorithm="queue-array"`). Uma linha pode ter vários identificadores (`data-line="left right"`).

Em páginas bilingues, um `<pre>` com `lang="pt"` e outro com `lang="en"`; a legenda bilingue escreve-se num `<template data-caption>` com um `<span lang>` por língua.

## Previsões e edição

Com `predict`, ao avançar para um passo com pergunta (vai trocar? qual é escrito primeiro?), o desenho fica parado e aparecem as opções. A resposta mostra "Certo." ou "Ainda não:" com a explicação, e a linha "Previsões certas: 3 de 4" conta as respostas. Nada fica guardado nem é enviado.

Com `editable`, por baixo do leitor aparece um campo com os dados (nos widgets de operações, as operações; na pesquisa, os valores e o alvo depois de `:`), "Correr" e "Repor". Dados inválidos deixam a execução anterior e mostram o erro junto ao campo.

## Versões e uso offline

A biblioteca tem versões próprias, independentes do kit. `widgets/v1/` recebe só mudanças compatíveis (widgets, atributos e textos novos); quando sair a 1.0.0, `widgets/v1.0.0/` fica congelada para quem quiser fixar a versão. Para usar sem rede, copia-se a pasta `widgets/v1/` inteira para junto do site e usa-se um caminho relativo: os ficheiros encontram-se uns aos outros na mesma pasta, também a partir de `file://`.

## Eventos e métodos

Os widgets lançam `uc:widgetstep` (cada mudança de passo), `uc:widgetdone` (chegou ao fim a avançar) e `uc:widgetpredict` (cada resposta). Têm os métodos `go(n)`, `next()`, `back()`, `play()`, `pause()`, `reset()` e as propriedades `step`, `total` e `result`. Por exemplo, mostrar uma pergunta do guião quando a demonstração acaba:

```js
document.querySelector("#demo").addEventListener("uc:widgetdone", () => {
  document.querySelector("#q3").hidden = false;
});
```

## Aspeto

Os estados usam cor, contorno e um sinal, nunca só cor: atual (cor de destaque e ▼), comparado (âmbar, tracejado), trocado (violeta, contorno duplo e ⇄), visitado (destaque suave e •) e terminado (verde e ✓). As cores são tokens locais que um `theme.css` pode mudar:

`theme.css`:

```css
.uc-widget {
  --uc-widget-compared: #9a3412;
  --uc-widget-done: #166534;
  --uc-widget-stage-max: 320px; /* altura máxima do desenho */
}
```

Os outros tokens são `--uc-widget-current`, `--uc-widget-swapped`, `--uc-widget-visited`, as versões `-bg` de cada estado e `--uc-widget-duration`. Quem muda as cores fica responsável pelo contraste dos novos pares.

## Acessibilidade

Cada passo tem uma frase, visível por baixo do desenho e anunciada aos leitores de ecrã quando o estudante avança ou recua (durante a reprodução só se anuncia o início e o fim). O desenho tem uma descrição em palavras. "Vista em texto" mostra a lista de todos os passos, uma tabela do estado atual e o resultado, e é o que sai ao imprimir. Com `prefers-reduced-motion` não há transições.

## Ver também

- [Catálogo](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/index.md) dos widgets.
- [`<uc-guide>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-guide.md): um widget dentro de um guião ocupa a largura da coluna.
- [API JavaScript](https://uc-design-kit.miguelrocha.dev/docs/pt/referencia/api-js.md), para criar componentes próprios.
