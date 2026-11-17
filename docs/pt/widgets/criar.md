# Criar um widget

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/criar.html

Um widget próprio num ficheiro JavaScript, com o mesmo leitor, narração e acessibilidade dos widgets do catálogo, e a lista para o propor ao catálogo.

Há três caminhos para pôr numa página um algoritmo que não está no [catálogo](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/index.md), do mais simples ao mais completo:

1. **Escrever os passos** com [`<uc-widget-trace>`](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/uc-widget-trace.md): o estado, os destaques e a frase de cada passo em JSON. Não é preciso programar; serve quando a entrada é fixa (uma execução mostrada na aula).
2. **Escrever o algoritmo** num widget próprio, um ficheiro JavaScript ao lado das páginas: o widget calcula os passos para qualquer entrada, aceita `editable` e `predict`, e tem o mesmo leitor, teclado, narração e vista em texto do catálogo. É o que esta página explica.
3. **Propor o widget ao catálogo**, para outras cadeiras o usarem: ver [Propor um widget ao catálogo](#catalogo).

Exemplo (Um widget próprio: o algoritmo de Euclides), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/widgets-criar/basic.html):

```html
<my-widget-gcd a="48" b="18" predict>
  <p>mdc(48, 18): 48 mod 18 = 12, 18 mod 12 = 6, 12 mod 6 = 0. O máximo divisor comum é 6.</p>
</my-widget-gcd>
```

## O modelo

O ficheiro [`widgets/template/my-widget-gcd.js`](https://github.com/mmroch4/uc-design-kit/blob/main/widgets/template/my-widget-gcd.js) é um widget completo num só ficheiro, sem passo de compilação: o elemento `<my-widget-gcd>` da demonstração acima. Para fazer o seu:

1. Copie o ficheiro para junto das páginas (por exemplo `extensions/`, como os outros ficheiros próprios da cadeira).
2. Mude o nome do elemento: com um hífen e o prefixo da cadeira (`edados-widget-kmp`). Os nomes `uc-widget-…` são do catálogo.
3. Mude as quatro partes marcadas no ficheiro: os textos, `run()`, `parse()` e `draw()`.
4. Na página, depois do kit, carregue o núcleo dos widgets e o seu ficheiro:

```html
<script src="https://uc-design-kit.miguelrocha.dev/widgets/v1/uc-widget-core.js" defer></script>
<script src="extensions/my-widget-gcd.js" defer></script>

<my-widget-gcd a="48" b="18" predict>
  <p>mdc(48, 18): 48 mod 18 = 12, 18 mod 12 = 6, 12 mod 6 = 0. O mdc é 6.</p>
</my-widget-gcd>
```

O texto dentro do elemento aparece sem JavaScript, enquanto o widget não é construído e quando a entrada tem um erro, como em todos os widgets.

## Como funciona

O algoritmo corre uma vez e devolve a lista de todos os passos; o leitor só escolhe qual mostrar. Por isso recuar, saltar e as perguntas de previsão funcionam sem código extra. Um widget é uma classe que estende `UC.widgets.Widget` e diz só o que lhe é próprio:

| Membro | Obrigatório | O que faz |
| --- | --- | --- |
| `static id` | sim | O nome dos textos: `widget.<id>.*`. |
| `static algorithms` | sim | Os algoritmos (o primeiro é o de omissão; o atributo `algorithm` escolhe). |
| `static inputAttributes` | não | Os atributos da entrada; mudá-los reconstrói o widget. O primeiro é o que `editable` edita. |
| `parse()` | sim | Lê os atributos e devolve a entrada; para uma entrada errada, `throw new UC.widgets.InputError("widget.<id>.error.x")`. |
| `steps(input, emit)` | sim | Corre o algoritmo, chamando `emit(passo)` em cada passo. |
| `draw(step, svg)` | sim | Desenha um passo no `<svg>`. |
| `describe(step)` | não | O desenho em palavras (o nome acessível do `<svg>`). |
| `table(step)` | não | A tabela da vista em texto: `{ head: [...], rows: [[...]] }`. |

No fim, `UC.widgets.register("my-widget-gcd", Classe)`. O resto (leitor, teclado, narração, pseudocódigo, painel, vista em texto, previsões, edição, erros, línguas, eventos) vem do núcleo.

## Um passo

Um passo é um objeto simples, sem funções:

```js
emit({
  state: { a: 18, b: 12 },               // o estado completo depois deste passo
  marks: { 0: "swapped", 1: "current" }, // destaques: current, compared, swapped, visited, done
  pointers: { a: "0", b: "1" },          // etiquetas por baixo das células
  line: "divide",                        // a linha do pseudocódigo
  say: ["widget.gcd.divide", { a: 48, b: 18, r: 12 }], // a frase: uma chave e os valores
  predict: { ask: ["widget.gcd.ask", { a: 48, b: 18 }], options: [...], answer: 1 },
});
```

- O primeiro passo não tem destaques; o último é o resultado.
- A frase é uma chave e os seus valores, nunca o texto pronto, para que a troca de língua funcione. Escreva cada frase em português e em inglês com `UC.addTranslations`, como no modelo; a frase começa pela ação e dá os valores ("48 mod 18 = 12: (a, b) passa a (18, 12).").
- O pseudocódigo é uma lista de linhas `"id|texto"` em `widget.<id>.code.<algoritmo>`; `line` destaca a linha com esse id. As linhas que nunca se destacam começam por `|`.
- `run()` deve ser pura: sem tocar na página e sem `Math.random`. A mesma entrada dá sempre os mesmos passos. Para entradas aleatórias, use `this.random` (com a semente do atributo `seed`) em `parse()`.
- Até 2000 passos; acima disso o widget mostra uma nota de erro.

## Desenhar

O núcleo traz duas primitivas que desenham os estados com cor, contorno e sinal (nunca só cor): `UC.widgets.svg.array(svg, valores, { marks, pointers })`, uma fila de células com os índices por baixo, e `UC.widgets.svg.tree(svg, raiz, { children, key, label, note, marks, binary })`, uma árvore binária (por omissão, nós `{ v, l, r }`) ou n-ária (`binary: false`). Ambas mantêm os elementos entre passos, por isso as mudanças animam. Para grafos e tabelas, o caminho mais simples é o [`<uc-widget-trace>`](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/uc-widget-trace.md); um widget próprio pode também desenhar SVG à mão com `UC.widgets.util.svgEl`.

## Regras para um bom widget

### Correto e legível

Teste o algoritmo contra uma versão simples com várias entradas antes de o pôr na página: uma animação errada ensina o algoritmo errado. Entradas pequenas (até 16 células ou 15 nós) para que os números se leiam num telemóvel.

### Acessível

Uma frase com os valores em cada passo, `describe()` com a estrutura em palavras e `table()` para a vista em texto. Escreva o resultado dentro do elemento, para quem não tem JavaScript.

## Propor um widget ao catálogo

Um widget do catálogo vive em `widgets/src/<nome>/`, em módulos ES, e é compilado por `npm run build` para `widgets/v1/uc-widget-<nome>.js`. O contrato completo é [`docs/architecture/widgets-api.md`](https://github.com/mmroch4/uc-design-kit/blob/main/docs/architecture/widgets-api.md). Lista para o pedido de integração (pull request):

1. `algorithm.js` puro, com `ALGORITHMS` e `run(input, options, emit)`; o primeiro passo sem destaques, o último com o resultado.
2. `i18n.js` com todas as frases e o pseudocódigo em português e em inglês, as mesmas chaves e os mesmos ids de linha.
3. `widget.js` com `parse()`, `steps()`, `draw()`, `describe()` e `table()`.
4. `meta.json` com a entrada do catálogo (`status: "experimental"` no início) e uma entrada de teste.
5. `tests/widgets/<nome>.test.mjs`: 200 entradas aleatórias de uma semente fixa e os casos extremos, contra uma implementação de referência.
6. As frases geradas por `node tests/widgets/narration.mjs --update`, lidas com atenção.
7. Uma página `docs/pt/widgets/uc-widget-<nome>.html`, duas demonstrações em `docs/demos/uc-widget-<nome>/` e a entrada em `docs/nav.json`.
8. No máximo 8 KB gzip (`npm run build` mostra o tamanho); o núcleo não muda sem medir (12 KB).
9. `npm test` sem erros: algoritmos, validador de passos, frases, axe com o percurso pelo teclado, sem deslocamento horizontal a 320 px.

A mesma lista está em [`widgets/template/README.md`](https://github.com/mmroch4/uc-design-kit/blob/main/widgets/template/README.md); ver também [Contribuir](https://uc-design-kit.miguelrocha.dev/docs/pt/referencia/contribuir.md).

## Ver também

- [`<uc-widget-trace>`](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/uc-widget-trace.md): os passos em JSON, sem programar.
- [Usar widgets](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/usar.md): atributos comuns, eventos e pseudocódigo próprio.
- [API JavaScript](https://uc-design-kit.miguelrocha.dev/docs/pt/referencia/api-js.md): `UC.widgets`.
