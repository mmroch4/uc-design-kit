# `<uc-code>`

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-code.html

Um bloco de código com realce de sintaxe, nome do ficheiro e botões para copiar e descarregar. Pode também ser editável, recolhível e executar o código na própria página, com testes automáticos simples.

Exemplo (bloco de JavaScript com nome de ficheiro), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-code/basic.html):

```html
<uc-code lang="js" filename="binary-search.js">
  <script type="text/plain">
    // Returns the index of target in the sorted array list, or -1.
    function binarySearch(list, target) {
      let low = 0, high = list.length - 1;
      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        if (list[mid] === target) return mid;
        if (list[mid] < target) low = mid + 1;
        else high = mid - 1;
      }
      return -1;
    }
  </script>
</uc-code>
```

O cabeçalho mostra o nome do ficheiro e os botões Copiar e Descarregar. As cores do realce vêm do highlight.js, carregado do cdnjs na primeira vez que a página precisa dele; sem rede, o código aparece igual, só que sem cores.

## Utilização

O código escreve-se dentro de um `<script type="text/plain">`, onde não é preciso escapar `<` nem `&`. O kit retira a indentação comum a todas as linhas, por isso o código pode acompanhar a indentação do HTML à volta.

`guioes/aula03.html`:

```html
<uc-code lang="java" filename="Point.java">
  <script type="text/plain">
    public class Point {
        int x, y;

        Point(int x, int y) { this.x = x; this.y = y; }

        boolean isOrigin() { return x == 0 && y == 0; }
    }
  </script>
</uc-code>
```

A alternativa é um `<pre><code>` com o HTML escapado (`&lt;`, `&amp;`). Convém quando o código vem já escapado de outra página, ou quando contém o texto `</script>`, que fecharia o `<script>` antes do tempo. Neste caso a linguagem também pode vir da classe do `<code>`, como `class="language-java"`.

`guioes/aula03.html`:

```html
<uc-code filename="Point.java">
  <pre><code class="language-java">boolean isOrigin() { return x == 0 &amp;&amp; y == 0; }</code></pre>
</uc-code>
```

Um bloco de código não precisa de nada no `course.js`. Só o atributo `run` consulta a configuração, como se explica em [Configuração usada](#configuracao).

## Exemplos

### Código em `<pre><code>`

Sem `filename`, o cabeçalho mostra o nome da linguagem e o ficheiro descarregado chama-se `code.py` (com a extensão da linguagem, ou `code.txt` se não houver).

Exemplo (bloco de Python escrito em pre e code), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-code/pre-code.html):

```html
<uc-code lang="python">
  <pre><code>def is_sorted(values):
"""True when every element is &lt;= the next one."""
return all(a &lt;= b for a, b in zip(values, values[1:]))</code></pre>
</uc-code>
```

### Sem botões

`no-copy` e `no-download` escondem os botões. Sem botões, sem `lang` e sem `filename`, o bloco fica sem cabeçalho: serve para uma sessão de terminal ou para mostrar o resultado esperado de um programa.

Exemplo (sessão de terminal sem cabeçalho), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-code/no-buttons.html):

```html
    <uc-code no-copy no-download>
      <pre><code>$ node binary-search.js
3
-1</code></pre>
    </uc-code>
```

### Código editável

Com `editable`, o estudante pode alterar o código no próprio bloco, e o botão Repor volta ao código original. Copiar e Descarregar levam a versão alterada. As alterações não são guardadas: perdem-se ao recarregar a página.

Exemplo (função editável com botão Repor), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-code/editable.html):

```html
<uc-code lang="js" filename="swap.js" editable>
  <script type="text/plain">
    // Swaps the elements at positions i and j of list.
    function swap(list, i, j) {
      const tmp = list[i];
      list[i] = list[j];
      list[j] = tmp;
    }
  </script>
</uc-code>
```

No editor, a tecla Tab insere quatro espaços. Para sair do editor com o teclado, carrega-se em Esc e depois em Tab; esta indicação aparece por baixo do código enquanto o editor tem o foco.

### Bloco recolhível

`collapsible` transforma o nome do ficheiro num botão que mostra e esconde o código; com `collapsed`, o bloco começa fechado. Serve para ficheiros de apoio longos que o estudante só precisa de abrir se quiser. Sem `filename`, o botão mostra o nome da linguagem ou, sem linguagem, "Código".

Exemplo (ficheiro recolhido, aberto ao carregar no nome), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-code/collapsible.html):

```html
<uc-code lang="js" filename="stack.js" collapsible collapsed>
  <script type="text/plain">
    // A stack backed by an array: push and pop at the end.
    class Stack {
      constructor() { this.items = []; }
      push(value) { this.items.push(value); }
      pop() {
        if (this.isEmpty()) throw new Error("empty stack");
        return this.items.pop();
      }
      peek() { return this.items[this.items.length - 1]; }
      isEmpty() { return this.items.length === 0; }
      get size() { return this.items.length; }
    }
  </script>
</uc-code>
```

### Executar JavaScript

`run` sem valor acrescenta o botão Executar. O resultado aparece por baixo do código, com o que o programa escreveu em `console.log`. JavaScript corre no próprio browser, num Web Worker sem rede e sem acesso à página, por isso funciona mesmo sem ligação à internet.

Exemplo (programa JavaScript editável com botão Executar), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-code/run.html):

```html
<uc-code lang="js" filename="fibonacci.js" editable run>
  <script type="text/plain">
    // The first ten Fibonacci numbers.
    const fib = [0, 1];
    while (fib.length < 10) {
      fib.push(fib[fib.length - 1] + fib[fib.length - 2]);
    }
    console.log(fib.join(" "));
  </script>
</uc-code>
```

Juntar `editable` e `run` dá um pequeno laboratório: o estudante muda o código e volta a executar. Num erro de sintaxe ou numa exceção, o resultado tem o título "Erro" e a mensagem aparece a vermelho.

### Exercício com testes

Um `<script data-harness>` escondido chama o código do estudante e escreve uma linha por teste; um `<ol data-tests>` diz o que cada linha deve ser. O botão passa a dizer "Executar testes" e o resultado é uma lista de testes com ✓ ou ✗. Aqui, o código inicial falha o terceiro teste: `best` começa em 0, que é maior do que qualquer elemento de uma lista só com números negativos.

Exemplo (função max com três testes, um dos quais falha), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-code/tests.html):

```html
<uc-code lang="js" filename="max.js" editable run>
  <script type="text/plain">
    // Returns the largest element of a non-empty list.
    function max(list) {
      let best = 0;
      for (const value of list) {
        if (value > best) best = value;
      }
      return best;
    }
  </script>
  <script type="text/plain" data-harness filename="data.js">
    const negatives = [-5, -2, -8];
  </script>
  <script type="text/plain" data-harness>
    console.log(max([3, 9, 4]));
    console.log(max([7]));
    console.log(max(negatives));
  </script>
  <ol data-tests>
    <li data-expected="9">Lista com vários números</li>
    <li data-expected="7">Lista com um só elemento</li>
    <li data-expected="-2">Lista só com números negativos</li>
  </ol>
</uc-code>
```

O `<script data-harness filename="data.js">` é um ficheiro de apoio escondido, com os dados do terceiro teste. Os pormenores (ordem dos ficheiros, comparação das linhas) estão em [Execução e testes](#execucao).

### Java e outras linguagens

As linguagens que não são JavaScript (Java, Python, C, C++, Haskell…) são enviadas para o [Codapi](https://codapi.org), um serviço que compila e executa o código num servidor. O serviço público é gratuito mas tem limites de utilização, por isso esta demonstração só envia o código quando se carrega em Executar. Sem rede, aparece "Não foi possível executar o código".

Exemplo (programa Java executado no Codapi), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-code/java.html):

```html
<uc-code lang="java" filename="Main.java" run>
  <script type="text/plain">
    public class Main {
        public static void main(String[] args) {
            int[] values = {5, 3, 8, 1};
            int sum = 0;
            for (int v : values) sum += v;
            System.out.println("Soma: " + sum);
        }
    }
  </script>
</uc-code>
```

Em Java, o ficheiro executado tem de ter a classe `public class Main`, que é o ponto de entrada do Codapi. Numa UC com muitos estudantes, convém um Codapi próprio, configurado no `course.js` ([Configuração usada](#configuracao)).

### Testar noutra plataforma

Com um endereço, `run="https://…"` não executa nada na página: mostra uma ligação "Testar em …" para a plataforma onde o exercício é submetido, como o Mooshak. O nome vem da entrada de `platforms` do `course.js` com o mesmo domínio; sem nenhuma, aparece o domínio do endereço. Esta demonstração acrescenta ao curso uma plataforma "Mooshak".

Exemplo (programa C com ligação Testar em Mooshak), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-code/link.html):

```html
<uc-code lang="c" filename="sum.c" run="https://mooshak.example.org/problem/A">
  <script type="text/plain">
    #include <stdio.h>

    int main(void) {
        int a, b;
        scanf("%d %d", &a, &b);
        printf("%d\n", a + b);
        return 0;
    }
  </script>
</uc-code>
```

## Atributos

| Atributo | Tipo | Por omissão | Descrição |
| --- | --- | --- | --- |
| `lang` | linguagem | — | Linguagem do código: `java`, `python`, `c`, `cpp`, `js`, `html`, `css`, `bash`… Escolhe o realce e, com `run`, quem executa o código. Passa para `data-lang` depois de lido (ver abaixo). |
| `filename` | texto | nome da linguagem | Nome mostrado no cabeçalho e dado ao ficheiro descarregado. Com um harness, é também o nome com que o código do estudante é enviado. |
| `editable` | booleano | ausente | O código pode ser alterado no bloco; acrescenta o botão Repor. |
| `no-copy` | booleano | ausente | Esconde o botão Copiar. |
| `no-download` | booleano | ausente | Esconde o botão Descarregar. |
| `collapsible` | booleano | ausente | O nome no cabeçalho passa a ser um botão que mostra e esconde o código. |
| `collapsed` | booleano | ausente | Com `collapsible`, o bloco começa fechado. Executar abre-o. |
| `run` | booleano ou URL | ausente | Sem valor: botão Executar, que executa o código na página. Não aparece em linguagens que não são programas (`html`, `css`, `text`, `json`…), com um aviso na consola. Com um endereço: ligação "Testar em …" para essa plataforma. |

`lang="java"` não é um código de língua válido e faria os leitores de ecrã mudar de voz, por isso o componente passa o valor para `data-lang` logo que arranca. Num `theme.css`, seleciona-se `uc-code[data-lang="java"]`, não `[lang]`.

O realce cobre as linguagens mais comuns (Java, Python, C, C++, JavaScript, TypeScript, Kotlin, Go, Rust, SQL, Bash, JSON, XML e HTML, YAML, Markdown…) e carrega à parte, quando a página as usa, Haskell, OCaml, Prolog, Scheme, Scala, MATLAB, LaTeX e algumas outras. Uma linguagem desconhecida mostra o código sem cores.

## Configuração usada

O bloco em si não lê nada do `course.js`: realce, cópia, edição e recolha funcionam sem configuração. Só o atributo `run` consulta dois campos, ambos opcionais.

| Campo | Para quê |
| --- | --- |
| `runner` | Que serviço executa cada linguagem com `run` sem valor. Sem este campo, JavaScript corre no browser e as restantes linguagens no Codapi público. Ver [Avançado](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#campos-avancado). |
| `platforms` | Nome da plataforma na ligação "Testar em …" de `run="URL"`. Ver [Navegação](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#campos-navegacao). |

Os valores por omissão de `runner` são estes; basta escrever as partes que mudam.

`course.js`:

```js
window.UC_COURSE = {
  // …
  runner: {
    provider: "codapi",                                   // runner for languages not listed below
    languages: { javascript: "browser", js: "browser" },  // language → runner
    codapi: {
      url: "https://api.codapi.org/v1",                   // or a self-hosted Codapi
      sandboxes: { c: "gcc", "c++": "cpp", py: "python" }, // language → Codapi sandbox
      timeout: 20000,                                     // ms
    },
    browser: { timeout: 5000 },                           // ms, then the Worker is stopped
  },
};
```

- `provider` é o runner das linguagens que não estão em `languages`; `languages` associa uma linguagem (o valor de `lang`) a um runner. Os runners incluídos são `codapi` e `browser`.
- `codapi.url` aponta para o Codapi público ou para um próprio; `sandboxes` traduz o `lang` do bloco para o nome do ambiente no Codapi quando são diferentes (`lang="c"` usa o ambiente `gcc`).
- `timeout` é o tempo máximo de cada execução, em milissegundos. No browser, um ciclo infinito é interrompido ao fim de 5 segundos.

Mudar de serviço (um Codapi próprio, o Judge0, outro runner escrito para a UC) é só mudar este campo: nenhuma página tem de ser editada. O guia completo, com um runner para o Judge0 e o contrato de um runner, está em [Execução de código](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/execucao.md).

## Execução e testes

Com `run` sem valor, além do código que o estudante vê, o bloco pode ter filhos que nunca aparecem na página:

| Filho | Para quê |
| --- | --- |
| `script[data-harness]` | O programa que é executado de facto (o ficheiro de entrada). Chama o código do estudante, que é enviado como segundo ficheiro com o nome de `filename`. Em Java, começa por `public class Main`. |
| `script[data-harness][filename]` | Um ficheiro de apoio escondido, por exemplo um `BTNode.java` que o código do estudante usa. Em Java, cada classe pública precisa do seu ficheiro. Pode haver vários. |
| `ol[data-tests]` | Um `<li data-expected="…">` por teste, pela ordem das linhas que o programa escreve. O texto do item é o nome do teste. |

Os dois `<script>` são `type="text/plain"`, como o do código. A estrutura de um exercício em Java fica assim:

`guioes/aula10.html`:

```html
<uc-code lang="java" filename="BTree.java" editable run>
  <script type="text/plain">…código inicial do estudante…</script>
  <script type="text/plain" data-harness filename="BTNode.java">…</script>
  <script type="text/plain" data-harness>
    public class Main {
        public static void main(String[] args) {
            // one line per test
        }
    }
  </script>
  <ol data-tests>
    <li data-expected="0">Árvore vazia</li>
    <li data-expected="3">Árvore com três nós</li>
  </ol>
</uc-code>
```

- **Ficheiros.** Sem harness, o código do bloco é o programa. Com harness, o Codapi recebe o harness como ficheiro de entrada, o código do estudante e os ficheiros de apoio. No browser, os ficheiros de JavaScript juntam-se num só programa: primeiro os de apoio, depois o código do estudante e por fim o harness.
- **Comparação.** A linha *i* do que o programa escreve é comparada com o `data-expected` do teste *i*, como texto exato, ignorando espaços no fim da linha: `9.0` não passa num teste que espera `9`. Linhas a mais são ignoradas; um teste sem linha correspondente falha com "(sem resultado)".
- **Resultado.** Um resumo ("2 de 3 testes passaram", a verde quando passam todos) e a lista dos testes com ✓ ou ✗; os que falham mostram o valor esperado e o obtido. Com testes, o que o programa escreve não é mostrado à parte, mas as mensagens de erro são.
- **Sem entrada.** Os programas não podem ler da entrada padrão: os dados vêm do harness ou de um ficheiro de apoio (em Java, por exemplo, um `Scanner` sobre uma `String`).
- **Erros.** Um erro de compilação ou de execução aparece com o título "Erro" e a mensagem a vermelho. Se o serviço não responder ou o tempo acabar, aparece "Não foi possível executar o código (timeout)." ou o motivo equivalente.

O harness e os testes estão escondidos, não são secretos: qualquer estudante os vê no código-fonte da página. Não convém pôr neles a solução do exercício.

## Personalizar

Estas classes são estáveis na versão 1 e podem ser usadas num `theme.css`. As regras do kit têm especificidade zero, por isso qualquer regra do professor ganha. O método está em [Nível 2: CSS livre](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/css.md); para mudar só cores, cantos ou letra em todo o site bastam os [tokens](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/tokens.md).

| Classe | Elemento |
| --- | --- |
| `.uc-code` | O bloco (o próprio `<uc-code>`), depois de o kit arrancar. |
| `.uc-code--editable`, `--collapsed` | Bloco editável; bloco recolhível fechado. |
| `.uc-code__header` | O cabeçalho com o nome e os botões. |
| `.uc-code__title` | O nome do ficheiro ou da linguagem. |
| `.uc-code__toggle`, `__chevron` | O botão que mostra e esconde o código e a sua seta. |
| `.uc-code__actions` | O grupo de botões. |
| `.uc-code__button`, `--copy`, `--download`, `--reset` | Copiar, Descarregar e Repor. |
| `.uc-code__run` | O botão Executar ou a ligação "Testar em …". |
| `.uc-code__body`, `__scroll` | A área do código, que desliza na horizontal. |
| `.uc-code__pre`, `__code` | O código mostrado (com as classes `hljs-*` do realce). |
| `.uc-code__editor`, `__input`, `__hint` | No modo editável: a área de edição, o `<textarea>` e a indicação sobre Tab e Esc. |
| `.uc-code__results` | A área do resultado, por baixo do código. |
| `.uc-code__results-summary`, `--passed` | "2 de 3 testes passaram"; a variante quando passam todos. |
| `.uc-code__results-label`, `__results-output`, `--stderr`, `__results-error` | "Resultado" ou "Erro", o texto escrito pelo programa, as mensagens de erro e a falha ao executar. |
| `.uc-code__tests`, `__test`, `--passed`, `--failed` | A lista de testes e cada teste. |
| `.uc-code__test-mark`, `__test-name`, `__test-detail` | O ✓ ou ✗, o nome do teste e "Esperado: … · Obtido: …". |

`theme.css`:

```css
/* Java blocks with a coloured bar on the left. */
uc-code[data-lang="java"] {
  border-left: 3px solid var(--uc-color-accent);
}

/* Keywords in the normal weight. */
.uc-code .hljs-keyword { font-weight: 400; }
```

As cores do realce vêm dos tokens do kit: palavras reservadas em `--uc-color-accent`, texto entre aspas em `--uc-color-success-text`, números e tipos em `--uc-color-warning-text` e comentários em `--uc-color-text-muted`. Mudar a cor do curso com `accentColor` muda também a cor das palavras reservadas.

## Acessibilidade

### O que o componente faz

A área do código recebe o foco e desliza com as setas, e é identificada pelo nome do ficheiro. Os botões têm texto e o resultado de Copiar e de Executar é anunciado aos leitores de ecrã ("Copiado", "2 de 3 testes passaram"). Cada teste diz "Passou" ou "Falhou" além do ✓ ou ✗. O editor é um `<textarea>` com nome, e o botão de recolher indica se o código está visível. O `lang` passa para `data-lang` para não mudar a voz do leitor de ecrã.

### O que cabe a quem escreve

Um `filename` em cada bloco que o estudante vá usar, nomes de testes que digam o que se verifica ("Lista só com números negativos", não "Teste 3") e linhas de código curtas, que se leem sem deslizar. O que importa para o exercício deve estar também no texto do guião, não só em comentários no código.

## Sem JavaScript

O CSS do kit mostra o texto do `<script type="text/plain">` como um bloco de código simples, sem cabeçalho, botões nem cores; um `<pre><code>` aparece sempre, mesmo sem o CSS do kit. Os testes ficam escondidos. Os `<script data-harness>` também ficam escondidos.

## Ver também

- [`<uc-exercise>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-exercise.md): o exercício numerado onde costuma ficar um bloco editável com testes.
- [`<uc-guide>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-guide.md): o guião de aula que agrupa os exercícios.
- [O ficheiro course.js](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#campos-avancado): o campo `runner`.
- Uso real: [o guião 10 de Estruturas de Dados 2025/26](https://uc-design-kit.miguelrocha.dev/examples/edados-2526/guioes/aula10.html), com exercícios em Java testados no Codapi, e [o código das árvores de pesquisa](https://uc-design-kit.miguelrocha.dev/examples/edados-2526/codigo/arvores_pesquisa.html), com ficheiros recolhíveis.
