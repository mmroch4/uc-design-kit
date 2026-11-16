# Runners

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/referencia/runners.html

Um runner executa o código de um `<uc-code run>`. Esta página é a referência da interface e da configuração; como escolher e trocar de serviço, passo a passo, está em [Execução de código](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/execucao.md).

## Interface

Um runner é um objeto com um método `run(request, options)` que devolve uma `Promise` com o resultado. Regista-se com `UC.registerRunner(name, runner)`, num script carregado depois do kit; um nome já registado é substituído.

`extensions/runner-judge0.js`:

```js
UC.registerRunner("judge0", {
  run(request, options) {
    // request = { language: "java", files: { "": "public class Main { … }" } }
    // options = UC.course.runner.judge0, e.g. { url: "https://judge0.example.org" }
    return fetch(`${options.url}/submissions?wait=true`, { method: "POST", /* … */ })
      .then((response) => response.json())
      .then((body) => ({ ok: body.status.id === 3, stdout: body.stdout || "", stderr: body.stderr || "", duration: 0 }));
  },
});
```

Um runner pode ter também `supports(language)`, que devolve `false` para as linguagens que não sabe executar: nesses blocos o botão Executar não aparece. Os runners incluídos recusam `html`, `css`, `text`, `json` e outras linguagens que não são programas; o `browser` só aceita JavaScript. Sem `supports`, todas as linguagens contam como executáveis.

Sem um runner registado com o nome escolhido, o bloco mostra "Não foi possível executar o código (unknown runner "…")".

## Pedido

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `language` | texto | O `lang` do bloco, em minúsculas (`"java"`, `"py"`, `"js"`). |
| `files` | objeto | Nome do ficheiro → código. A chave `""` é o ficheiro de entrada: o código do bloco, ou o harness quando o bloco tem um. Com harness, o código do estudante vem com o nome do atributo `filename`; os ficheiros de apoio vêm com os seus nomes. |

O segundo argumento, `options`, é a secção de `runner` com o nome do runner (`runner.judge0`), ou `{}` se não existir. Para os runners do kit já vem junta com os valores por omissão.

## Resultado

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `ok` | booleano | Verdadeiro quando o programa correu sem erro. |
| `stdout` | texto | O que o programa escreveu. Os testes do bloco comparam-no, linha a linha, com o esperado. |
| `stderr` | texto | Erros de compilação ou de execução. Aparece com o título "Erro". |
| `duration` | número | Tempo de execução em milissegundos. |

O kit converte o resultado antes de o mostrar: um campo em falta vale `false`, `""` ou `0`. A `Promise` só é rejeitada quando o código não chegou a correr (sem rede, serviço em baixo, tempo esgotado); a `message` do erro aparece ao estudante. Erros do próprio programa resolvem com `ok: false`.

## Runners incluídos

| Nome | Executa | Como |
| --- | --- | --- |
| `codapi` | Java, Python, C, C++, Haskell e as outras linguagens do Codapi | Envia os ficheiros para `{url}/exec` de um servidor [Codapi](https://codapi.org). O `lang` do bloco escolhe a *sandbox*, traduzido por `sandboxes` quando os nomes diferem. Rejeita com `"timeout"` depois de `timeout` ms. |
| `browser` | JavaScript | Corre num Web Worker: sem rede nem DOM. `console.log` e `console.info` vão para `stdout`; `console.error`, `console.warn` e exceções vão para `stderr`. Os ficheiros de apoio correm antes do ficheiro de entrada. |

## Configuração

O campo `runner` do `course.js` escolhe o runner de cada linguagem. Todos os campos são opcionais; estes são os valores por omissão:

`course.js`:

```js
runner: {
  provider: "codapi",                         // languages not listed below
  languages: { javascript: "browser", js: "browser" },
  codapi: {
    url: "https://api.codapi.org/v1",
    sandboxes: { c: "gcc", "c++": "cpp", py: "python" },
    timeout: 20000,
  },
  browser: { timeout: 5000 },
},
```

| Campo | Descrição |
| --- | --- |
| `provider` | Nome do runner para as linguagens que não estão em `languages`. |
| `languages` | Linguagem do bloco → nome do runner. Junta-se aos valores por omissão: escrever `{ java: "judge0" }` mantém JavaScript no browser. |
| `codapi`, `browser`, … | As opções de cada runner, com o nome dele. Cada secção junta-se à do kit campo a campo; a de um runner próprio passa tal como está. |

## Ver também

- [Execução de código](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/execucao.md): Codapi próprio, Judge0, um motor no browser e um runner de exemplo a funcionar.
- [`<uc-code>`: execução e testes](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-code.md#execucao).
- [API JavaScript](https://uc-design-kit.miguelrocha.dev/docs/pt/referencia/api-js.md).
