# Execução de código

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/execucao.html

O botão "Executar" de `<uc-code run>` não fala com nenhum serviço diretamente: pede ao kit, e o kit escolhe um *runner* a partir do campo `runner` do `course.js`. Trocar de serviço (Codapi público, um Codapi próprio, Judge0, um motor no browser) é uma mudança de configuração; nenhuma página tem de ser editada.

## Como o kit escolhe o runner

1. **O bloco.** O estudante carrega em "Executar" num `<uc-code lang="python" run>`.
2. **A linguagem.** O kit procura `python` em `runner.languages`. Se lá estiver, usa esse runner; se não, usa `runner.provider`.
3. **O runner.** Chama o método `run` do runner registado com esse nome, com os ficheiros a executar e a secção do `course.js` com o mesmo nome (`runner.codapi`, `runner.judge0`…).
4. **O resultado.** O bloco mostra o que o programa escreveu, os erros ou o resultado dos testes.

Sem o campo `runner`, JavaScript corre no browser e as outras linguagens no Codapi público. Os valores por omissão:

`course.js`:

```js
runner: {
  provider: "codapi",                                   // runner for languages not listed below
  languages: { javascript: "browser", js: "browser" },  // language → runner
  codapi: {
    url: "https://api.codapi.org/v1",
    sandboxes: { c: "gcc", "c++": "cpp", py: "python" }, // language → Codapi sandbox
    timeout: 20000,                                     // ms
  },
  browser: { timeout: 5000 },                           // ms
},
```

Só se escreve o que muda: `languages`, `codapi` e `browser` juntam-se aos valores por omissão, campo a campo. A linguagem é o valor de `lang` do bloco, em minúsculas, tal como foi escrito: `lang="py"` e `lang="python"` são chaves diferentes. Os pormenores do bloco (ficheiros escondidos, testes) estão em [`<uc-code>`: Execução e testes](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-code.md#execucao) e os campos em [Configuração usada](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-code.md#configuracao).

## Codapi público

É o que vem configurado: o serviço gratuito em `api.codapi.org`, com Java, Python, C, C++, Haskell e outras linguagens. Não há nada a fazer. Tem limites de utilização: serve para experimentar e para turmas pequenas, mas numa aula com muitos estudantes a carregar em "Executar" ao mesmo tempo os pedidos podem ser recusados. O código dos estudantes é enviado para esse serviço externo.

## Codapi próprio

O [Codapi](https://codapi.org) é software livre e pode correr num servidor do departamento. Muda-se só o endereço, e os nomes dos ambientes se forem diferentes:

`course.js`:

```js
runner: {
  codapi: {
    url: "https://codapi.dcc.example.org/v1",
    sandboxes: { java: "java21" },   // added to the default sandboxes
  },
},
```

- O kit faz `POST <url>/exec` com `{ sandbox, command: "run", files }`; o servidor tem de ter um ambiente para cada linguagem usada.
- O servidor tem de aceitar pedidos do endereço do site (CORS); sem isso, o browser bloqueia a resposta e aparece "Não foi possível executar o código".
- `timeout` é o tempo que o kit espera pela resposta. Os limites de cada execução (memória, tempo de CPU) configuram-se no próprio Codapi.

## Judge0

Para outro serviço escreve-se um runner: um ficheiro em `extensions/` que chama `UC.registerRunner`. O exemplo seguinte liga ao [Judge0](https://judge0.com).

> **Exemplo a adaptar.** Este runner não faz parte do kit nem é testado com ele. Os identificadores das linguagens, a autenticação e os limites dependem do servidor Judge0 usado; confirmar com `GET /languages` e com a documentação desse servidor.

`extensions/judge0-runner.js`:

```js
/*
 * EXAMPLE TO ADAPT, not part of the kit: a Judge0 runner for <uc-code run>.
 *
 * Judge0 (https://judge0.com) runs one source file per submission. This
 * runner joins the helper files and the entry file into one source, which
 * works for Python, C and C++; for Java, keep the student's classes
 * non-public (one file may only hold one public class) or use Judge0's
 * multi-file programs, left out of this example.
 */
(function () {
  "use strict";

  if (!window.UC || !window.UC.registerRunner) {
    console.error("[judge0-runner] Load uc-kit.js before this file.");
    return;
  }

  // Judge0 CE language ids; GET /languages on the server lists its own.
  const LANGUAGE_IDS = { c: 50, cpp: 54, "c++": 54, java: 62, python: 71, py: 71 };

  // Judge0 status ids: 3 accepted, 4-12 wrong answer, time limit,
  // compilation and runtime errors, 13 and above errors of Judge0 itself.
  const ACCEPTED = 3;
  const INTERNAL_ERROR = 13;

  /** One source: helper files first, the entry file ("") last. */
  function singleSource(files) {
    return Object.keys(files)
      .sort((a, b) => (a === "" ? 1 : b === "" ? -1 : 0))
      .map((name) => files[name])
      .join("\n\n");
  }

  window.UC.registerRunner("judge0", {
    run(request, options) {
      const ids = { ...LANGUAGE_IDS, ...(options.languageIds || {}) };
      const languageId = ids[request.language];
      if (!languageId) return Promise.reject(new Error(`no Judge0 language for "${request.language}"`));

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), options.timeout || 20000);
      const url = `${String(options.url).replace(/\/$/, "")}/submissions?base64_encoded=false&wait=true`;

      return fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json", ...(options.headers || {}) },
        body: JSON.stringify({ language_id: languageId, source_code: singleSource(request.files) }),
        signal: controller.signal,
      })
        .then((response) => {
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          return response.json();
        })
        .then((result) => {
          const status = result.status || {};
          // Judge0 could not run the code: reject, like a network failure.
          if (status.id >= INTERNAL_ERROR) throw new Error(status.description || "Judge0 error");
          const accepted = status.id === ACCEPTED;
          return {
            ok: accepted,
            stdout: result.stdout || "",
            // Compilation errors, runtime errors and the status ("Time Limit Exceeded").
            stderr: [result.compile_output, result.stderr, accepted ? "" : status.description].filter(Boolean).join("\n"),
            duration: Math.round(Number(result.time || 0) * 1000),
          };
        })
        .catch((error) => {
          throw new Error(error.name === "AbortError" ? "timeout" : error.message);
        })
        .finally(() => clearTimeout(timer));
    },
  });
})();
```

No `course.js`, o runner passa a ser o de omissão e recebe a sua secção:

`course.js`:

```js
runner: {
  provider: "judge0",            // JavaScript stays in the browser (default languages)
  judge0: {
    url: "https://judge0.dcc.example.org",
    languageIds: { java: 91 },   // overrides the ids in the runner
    timeout: 20000,
  },
},
```

E o ficheiro carrega-se depois do kit, em todas as páginas com `<uc-code run>`:

```html
<script src="https://uc-design-kit.miguelrocha.dev/kit/v1/uc-kit.js" defer></script>
<script src="extensions/judge0-runner.js" defer></script>
```

- **Pedido.** O runner usa `wait=true`, que pede ao Judge0 a resposta no mesmo pedido. Um servidor com essa opção desligada obriga a perguntar pelo resultado várias vezes (`GET /submissions/<token>`).
- **Chaves.** Tudo o que está no `course.js` e em `extensions/` é público: qualquer estudante o lê. Uma chave de API paga (por exemplo de um serviço alojado) não deve estar lá; um servidor próprio limita o acesso por origem (CORS) e por número de pedidos.
- **Java.** O Judge0 recebe um só ficheiro com a classe `Main`. Com um `data-harness`, as classes do estudante não podem ser `public`, ou usa-se o modo de vários ficheiros do Judge0, que o exemplo não cobre.

## No browser

O runner `browser`, incluído no kit, corre JavaScript num *Web Worker*: sem rede, sem acesso à página, com `console.log` como saída. Ao fim de `browser.timeout` (5 segundos) o programa é parado, por isso um ciclo infinito não bloqueia a página. Não envia código a nenhum serviço.

Outras linguagens podem correr no browser com um motor em WebAssembly (por exemplo Pyodide, para Python), num runner próprio com o mesmo contrato. Esses motores descarregam vários megabytes na primeira execução, o que convém pesar numa aula com muitos estudantes na mesma rede.

## O contrato de um runner

Um runner é um objeto com um método `run(request, options)` que devolve uma `Promise`. Regista-se com `UC.registerRunner(name, runner)`; um nome já usado substitui o anterior (também `codapi` e `browser`).

| Parte | Forma | Notas |
| --- | --- | --- |
| `request.language` | texto | O `lang` do bloco, em minúsculas. |
| `request.files` | `{ [nome]: código }` | A chave `""` é o ficheiro de entrada. Sem harness, é o código do bloco; com harness, é o harness, e o código do estudante vem com o nome de `filename`. Os ficheiros de apoio vêm com os seus nomes. |
| `options` | objeto | A secção de `runner` com o nome do runner (`runner.judge0`), ou `{}`. Para `codapi` e `browser`, já junta os valores por omissão. |
| Resultado | `{ ok, stdout, stderr, duration }` | `ok` verdadeiro quando o programa correu sem erro; `duration` em milissegundos. Campos em falta valem `false`, `""` e `0`. |

A diferença entre rejeitar e responder com `ok: false` decide o que o estudante vê:

### Resolver com `ok: false`

O código foi executado e falhou: erro de compilação, exceção, tempo de execução esgotado no servidor. A mensagem vai em `stderr` e aparece com o título "Erro", a vermelho. Com testes, todos falham.

### Rejeitar a `Promise`

O código não chegou a ser executado: sem rede, serviço em baixo, resposta que não chegou a tempo. Aparece "Não foi possível executar o código (*motivo*).", com a `message` do erro.

Um runner mínimo, que não executa nada e descreve o pedido que recebe, mostra estas partes num bloco com harness e um ficheiro de apoio:

Exemplo (runner que mostra o pedido recebido), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/customize/runner.html):

```html
<uc-code lang="js" filename="sum.js" run>
  <script type="text/plain">
    function sum(values) {
      return values.reduce((total, value) => total + value, 0);
    }
  </script>
  <script type="text/plain" data-harness filename="data.js">
    const DATA = [1, 2, 3];
  </script>
  <script type="text/plain" data-harness>
    console.log(sum(DATA));
  </script>
</uc-code>
```

`extensions/inspect-runner.js`:

```js
/*
 * A runner that executes nothing: it answers with the request it received,
 * so the documentation can show what <uc-code run> sends to a runner.
 */
(function () {
  "use strict";

  if (!window.UC || !window.UC.registerRunner) {
    console.error("[inspect-runner] Load uc-kit.js before this file.");
    return;
  }

  window.UC.registerRunner("inspect", {
    run(request, options) {
      const files = Object.entries(request.files).map(([name, code]) => {
        const lines = code.split("\n").length;
        return `  ${JSON.stringify(name)}: ${lines} ${lines === 1 ? "line" : "lines"}`;
      });
      const stdout = [
        `language: ${JSON.stringify(request.language)}`,
        "files:",
        ...files,
        `options: ${JSON.stringify(options)}`,
      ].join("\n");
      return Promise.resolve({ ok: true, stdout, stderr: "", duration: 0 });
    },
  });
})();
```

## Cuidados

- **Runner em falta.** O botão "Executar" aparece mesmo que o runner configurado não esteja registado (o ficheiro não carregou, o nome está errado); ao carregar aparece "Não foi possível executar o código (unknown runner "…")."
- **Sem entrada padrão.** Nenhum runner recebe `stdin`: os dados vêm do harness ou de um ficheiro de apoio.
- **Nada é secreto.** O harness, os testes e a configuração estão no código-fonte da página.
- **Experimentar antes da aula.** Um bloco de cada linguagem, aberto a partir do endereço público do site (não do disco), confirma o serviço, o CORS e os nomes dos ambientes.

## Ver também

- [`<uc-code>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-code.md): realce, edição, execução e testes.
- [O ficheiro course.js: Avançado](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#campos-avancado).
- [Runners](https://uc-design-kit.miguelrocha.dev/docs/pt/referencia/runners.md): a referência da interface e da configuração.
- [Nível 3: componentes próprios](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/componentes.md): como carregar um ficheiro de `extensions/`.
