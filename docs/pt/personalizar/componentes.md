# Nível 3: componentes próprios

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/componentes.html

Um componente próprio é um elemento HTML novo, escrito em JavaScript com a mesma API dos componentes do kit. Serve para o que é só da cadeira: uma animação de um algoritmo, um simulador, um exercício com um comportamento especial. Não precisa de instalação nem de compilação: é um ficheiro `.js` e, se tiver estilos, um `.css`.

O exemplo desta página, um passo a passo de uma pesquisa binária feito para o curso de demonstração:

Exemplo (componente próprio uc-binary-search), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/customize/component.html):

```html
<uc-binary-search values="2 5 8 12 16 23 38 56 72 91" target="23">
  <p>Pesquisa binária de 23 em 2 5 8 12 16 23 38 56 72 91: o meio é 16, depois 56 e depois 23, encontrado em 3 passos.</p>
</uc-binary-search>
```

## Quando escrever um

Um componente é código JavaScript que o professor mantém: textos nas línguas do curso, acessibilidade, alternativa sem JavaScript. Compensa quando o mesmo comportamento se repete em várias páginas ou quando não há outra forma de o mostrar. Antes, convém confirmar que não chega um componente do kit ([`<uc-question>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-question.md), [`<uc-code run>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-code.md)…) com [CSS próprio](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/css.md).

## Ficheiros e carregamento

Os componentes próprios ficam na pasta `extensions/`, um ficheiro por componente, com o nome do elemento:

```text
2526/
├── course.js
├── theme.css
├── extensions/
│   ├── uc-binary-search.js
│   └── uc-binary-search.css
└── guioes/
    └── aula10.html
```

Carregam-se só nas páginas que os usam: o CSS depois do `theme.css`, e o JavaScript **depois do kit e também com `defer`**, para `window.UC` já existir quando o ficheiro corre:

`guioes/aula10.html`:

```html
<link rel="stylesheet" href="https://uc-design-kit.miguelrocha.dev/kit/v1/uc-kit.css">
<link rel="stylesheet" href="../theme.css">
<link rel="stylesheet" href="../extensions/uc-binary-search.css">
<script src="../course.js"></script>
<script src="https://uc-design-kit.miguelrocha.dev/kit/v1/uc-kit.js" defer></script>
<script src="../extensions/uc-binary-search.js" defer></script>
```

Os componentes ficam no DOM normal da página (*light DOM*), como os do kit: não se usa *shadow DOM*. Assim herdam a letra e as cores, os tokens funcionam lá dentro e o `theme.css` chega-lhes.

## O nome

O nome de um elemento personalizado tem de ter um hífen. A [API do kit](https://github.com/mmroch4/uc-design-kit/blob/main/docs/api.md) e o exemplo de Estruturas de Dados (`uc-bst-traversal`) usam o prefixo `uc-` seguido de um nome específico; esta documentação segue a mesma regra.

- Um nome concreto, que descreva o que faz: `uc-binary-search`, `uc-bst-traversal`, `uc-turing-machine`. Nomes genéricos (`uc-quiz`, `uc-table`, `uc-tabs`) podem vir a ser usados pelo kit.
- Se o kit vier a ter um componente com o mesmo nome, fica o primeiro a ser registado (o do kit, que carrega antes) e o próprio é ignorado. `UC.define` nunca dá erro por um nome repetido.
- As classes do HTML gerado seguem o mesmo nome: `uc-binary-search__cell`, `uc-binary-search__status`.

## A estrutura de um componente

Um componente estende `UC.Element` e regista-se com `UC.define`. O esqueleto:

`extensions/uc-my-widget.js`:

```js
(function () {
  "use strict";

  if (!window.UC || !window.UC.Element) {
    console.error("[uc-my-widget] Load uc-kit.js before this extension.");
    return;
  }
  const UC = window.UC;

  UC.addTranslations("pt", { myWidget: { start: "Começar" } });
  UC.addTranslations("en", { myWidget: { start: "Start" } });

  class UCMyWidget extends UC.Element {
    setup() {
      // Once: read attributes, keep the children, build the fixed structure.
      this.button = document.createElement("button");
      this.button.type = "button";
      this.button.className = "uc-button";
      this.append(this.button);
    }

    render() {
      // On connection and after every language change: update texts and state.
      this.button.textContent = this.t("myWidget.start");
    }
  }

  UC.define("uc-my-widget", UCMyWidget);
})();
```

A função à volta de tudo evita criar variáveis globais. O que a classe recebe do kit:

| Membro | Para quê |
| --- | --- |
| `setup()` | Corre uma vez, na primeira vez que o elemento entra na página. Lê os atributos, guarda os filhos escritos pelo professor e constrói a estrutura fixa. |
| `render()` | Corre a cada ligação à página, depois de cada mudança de língua e quando chegam textos novos para a língua ativa. Atualiza textos e estado; nunca duplica conteúdo. |
| `this.t(key, params?)` | Um texto da interface na língua ativa. `{nome}` no texto é substituído por `params.nome`. |
| `this.text(value)` | Um `LocalizedText` do `course.js` na língua ativa: `this.text(this.course.title)`. |
| `this.course` | O `course.js` já normalizado (só de leitura): `semester`, `deadlines`, `team`… |
| `UC.lang`, `UC.today()` | A língua ativa e o dia de hoje (respeita `today` e `?today=`). |
| `UC.formatDate(date, format?)` | Uma data escrita como em [`<uc-date>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-date.md). |
| `UC.weekOf(date)`, `UC.weekDates(n)` | A semana letiva de uma data e as datas da semana *n*. |

`setup()` não está na lista da API pública em `docs/api.md`, que só nomeia `render()`, mas é o que os componentes do kit e o exemplo de Estruturas de Dados usam. Um componente pode fazer tudo em `render()`, desde que o resultado seja o mesmo à segunda chamada.

## Ciclo de vida

1. O kit regista os componentes quando o HTML da página já foi lido, por isso `setup()` encontra sempre os filhos do elemento.
2. `setup()` corre uma vez; logo a seguir corre `render()`.
3. Quando a língua muda, o kit chama `render()` de novo, em todos os componentes ligados. Não é preciso ouvir `uc:languagechange` dentro de um componente.
4. Se o elemento sair da página e voltar a entrar, só `render()` corre outra vez.

Por isso `render()` tem de ser idempotente: muda texto, atributos e classes de elementos criados em `setup()`; não acrescenta elementos novos a cada chamada.

## Textos e línguas

Os textos da interface do componente não se escrevem no código: dão-se ao kit com `UC.addTranslations`, uma vez por língua, num grupo com o nome do componente para não colidir com as chaves do kit:

```js
UC.addTranslations("pt", {
  binarySearch: { step: "Passo", found: "Encontrado na posição {mid} em {n} passos." },
});
UC.addTranslations("en", {
  binarySearch: { step: "Step", found: "Found at position {mid} in {n} steps." },
});

this.t("binarySearch.found", { mid: 5, n: 3 });  // "Encontrado na posição 5 em 3 passos."
```

- Uma chave que falta na língua ativa usa o texto em inglês; se também faltar, aparece a própria chave e um aviso `[uc-kit] missing translation` na consola.
- Os textos que vêm do HTML (os atributos e os filhos escritos pelo professor) não passam por aqui: escrevem-se na língua da página, ou duas vezes com `lang` (ver [Línguas](https://uc-design-kit.miguelrocha.dev/docs/pt/linguas.md)).
- Para uma língua que o kit não traz, o mesmo `UC.addTranslations` acrescenta os textos do kit; ver [Acrescentar uma língua](https://uc-design-kit.miguelrocha.dev/docs/pt/linguas.md#outra-lingua).

## Eventos

O kit lança três eventos em `document`:

| Evento | Quando |
| --- | --- |
| `uc:ready` | A configuração foi lida e os componentes do kit foram registados. |
| `uc:languagechange` | Depois de a língua mudar; `event.detail.lang` é a nova língua. |
| `uc:exercisechange` | Um [`<uc-exercise>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-exercise.md#feito) foi marcado como feito ou por fazer (sobe desde o exercício). |

Um ficheiro em `extensions/` carregado depois do kit com `defer` corre com o kit já pronto: `uc:ready` já foi lançado e não volta a ser. Esse ficheiro pode usar `UC` diretamente. O evento serve a um script escrito no `<head>` antes do kit; nesse caso também se pode testar a classe `uc-ready` no `<html>`.

```js
// Count the exercises marked as done on this page.
document.addEventListener("uc:exercisechange", () => {
  const done = document.querySelectorAll("uc-exercise.uc-exercise--done").length;
  console.log(`${done} exercises done`);
});
```

## Exemplo completo: pesquisa binária

O componente da demonstração no início da página. O professor escreve os valores, o valor a procurar e uma frase para quem não tem JavaScript:

`guioes/aula10.html`:

```html
<uc-binary-search values="2 5 8 12 16 23 38 56 72 91" target="23">
  <p>Pesquisa binária de 23 em 2 5 8 12 16 23 38 56 72 91: o meio é 16,
     depois 56 e depois 23, encontrado em 3 passos.</p>
</uc-binary-search>
```

Com `?lang=en` (e `languages: ["pt", "en"]`), o mesmo elemento mostra os textos em inglês sem mudar o HTML:

Exemplo (o mesmo componente em inglês), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/customize/component.html?lang=en):

```html
<uc-binary-search values="2 5 8 12 16 23 38 56 72 91" target="23">
  <p>Pesquisa binária de 23 em 2 5 8 12 16 23 38 56 72 91: o meio é 16, depois 56 e depois 23, encontrado em 3 passos.</p>
</uc-binary-search>
```

O ficheiro inteiro tem pouco mais de 150 linhas:

`extensions/uc-binary-search.js`:

```js
/*
 * <uc-binary-search>: steps through a binary search on a sorted list.
 * A level 3 extension written for the documentation's fictional course.
 *
 * Attributes:
 *   values  sorted integers separated by spaces (required)
 *   target  the value to look for (required)
 *
 * The element's children are the fallback shown without JavaScript. They are
 * kept, hidden, once the widget is built.
 */
(function () {
  "use strict";

  // The kit must be loaded first: fail loudly, not silently.
  if (!window.UC || !window.UC.Element) {
    console.error("[uc-binary-search] Load uc-kit.js before this extension.");
    return;
  }

  const UC = window.UC;

  /* ---------- 1. Interface texts, namespaced so they never clash with the kit's ---------- */

  UC.addTranslations("pt", {
    binarySearch: {
      label: "Pesquisa binária de {target}",
      step: "Passo",
      reset: "Recomeçar",
      start: "Procura-se {target}. Carregar em Passo para começar.",
      range: "Passo {n}: posições {lo} a {hi}, meio na posição {mid} com {value}.",
      right: "{value} é menor do que {target}: continua à direita.",
      left: "{value} é maior do que {target}: continua à esquerda.",
      found: "Encontrado na posição {mid} em {n} passos.",
      missing: "{target} não está na lista.",
      noValues: "Faltam os atributos values e target.",
    },
  });

  UC.addTranslations("en", {
    binarySearch: {
      label: "Binary search for {target}",
      step: "Step",
      reset: "Start again",
      start: "Looking for {target}. Press Step to begin.",
      range: "Step {n}: positions {lo} to {hi}, middle at position {mid} holding {value}.",
      right: "{value} is less than {target}: go right.",
      left: "{value} is greater than {target}: go left.",
      found: "Found at position {mid} in {n} steps.",
      missing: "{target} is not in the list.",
      noValues: "The values and target attributes are missing.",
    },
  });

  /* ---------- 2. Helpers ---------- */

  /** Creates an element with attributes and children (text is never parsed as HTML). */
  function el(tag, attributes, ...children) {
    const node = document.createElement(tag);
    Object.entries(attributes || {}).forEach(([name, value]) => node.setAttribute(name, value));
    node.append(...children);
    return node;
  }

  /** Every comparison of a binary search for `target` in the sorted `values`. */
  function search(values, target) {
    const steps = [];
    let lo = 0;
    let hi = values.length - 1;
    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      const outcome = values[mid] === target ? "found" : values[mid] < target ? "right" : "left";
      steps.push({ lo, hi, mid, outcome });
      if (outcome === "found") break;
      if (outcome === "right") lo = mid + 1;
      else hi = mid - 1;
    }
    return steps;
  }

  /* ---------- 3. The component ---------- */

  class UCBinarySearch extends UC.Element {
    /** Once: read the attributes, keep the fallback, build the fixed structure. */
    setup() {
      this.values = (this.getAttribute("values") || "").trim().split(/\s+/).filter(Boolean).map(Number);
      this.target = Number(this.getAttribute("target"));
      this.valid = this.values.length > 0 && this.values.every(Number.isFinite) && this.hasAttribute("target");

      this.fallback = el("div", { class: "uc-binary-search__fallback" }, ...Array.from(this.childNodes));
      this.append(this.fallback);
      if (!this.valid) {
        this.message = el("p", { class: "uc-binary-search__message" });
        this.append(this.message);
        return;
      }
      this.fallback.hidden = true;

      this.steps = search(this.values, this.target);
      this.current = -1; // no step shown yet

      this.cells = this.values.map((value, index) =>
        el(
          "li",
          { class: "uc-binary-search__cell" },
          el("span", { class: "uc-binary-search__index" }, String(index)),
          el("span", { class: "uc-binary-search__value" }, String(value)),
        ),
      );
      this.status = el("p", { class: "uc-binary-search__status", "aria-live": "polite" });
      this.stepButton = el("button", { type: "button", class: "uc-button uc-button--sm uc-button--primary" });
      this.resetButton = el("button", { type: "button", class: "uc-button uc-button--sm" });
      this.stepButton.addEventListener("click", () => this.next());
      this.resetButton.addEventListener("click", () => this.reset());

      this.widget = el(
        "div",
        { class: "uc-binary-search__widget", role: "group" },
        el("ol", { class: "uc-binary-search__cells" }, ...this.cells),
        this.status,
        el("div", { class: "uc-binary-search__actions" }, this.stepButton, this.resetButton),
      );
      this.append(this.widget);
    }

    /** On connection and after every language change: texts and state, never new content. */
    render() {
      if (!this.valid) {
        this.message.textContent = this.t("binarySearch.noValues");
        return;
      }
      const step = this.steps[this.current] || null;
      const done = this.current === this.steps.length - 1;

      this.widget.setAttribute("aria-label", this.t("binarySearch.label", { target: this.target }));
      this.stepButton.textContent = this.t("binarySearch.step");
      this.resetButton.textContent = this.t("binarySearch.reset");
      // aria-disabled instead of disabled: the button keeps the keyboard focus.
      this.stepButton.setAttribute("aria-disabled", String(done));

      this.cells.forEach((cell, index) => {
        let state = "";
        if (step && (index < step.lo || index > step.hi)) state = "out";
        if (step && index === step.mid) state = step.outcome === "found" ? "found" : "mid";
        if (state) cell.dataset.state = state;
        else delete cell.dataset.state;
      });

      this.status.textContent = step ? this.describe(step) : this.t("binarySearch.start", { target: this.target });
    }

    describe(step) {
      const params = { ...step, n: this.current + 1, value: this.values[step.mid], target: this.target };
      const sentences = [this.t("binarySearch.range", params)];
      sentences.push(this.t(`binarySearch.${step.outcome}`, params));
      if (step.outcome !== "found" && this.current === this.steps.length - 1) {
        sentences.push(this.t("binarySearch.missing", params));
      }
      return sentences.join(" ");
    }

    next() {
      if (this.current >= this.steps.length - 1) return;
      this.current += 1;
      this.render();
    }

    reset() {
      this.current = -1;
      this.render();
    }
  }

  UC.define("uc-binary-search", UCBinarySearch);
})();
```

- **Textos** (1): pt e en, num grupo `binarySearch`. Uma terceira língua acrescenta-se com mais um `UC.addTranslations`.
- **Elementos criados com `createElement`** (2): os valores vêm de atributos e entram como texto, nunca como HTML.
- **`setup()`** lê os atributos, guarda os filhos num bloco escondido e constrói a lista, a frase e os botões. Com atributos em falta, mostra a frase do professor e um aviso.
- **`render()`** só muda textos, o atributo `data-state` de cada célula e `aria-disabled`. Chamado duas vezes seguidas, dá o mesmo resultado.

E os estilos:

`extensions/uc-binary-search.css`:

```css
/*
 * Styles for <uc-binary-search> (see uc-binary-search.js).
 * Only --uc-* tokens, so the widget follows accentColor and theme.css.
 * Selectors use :where() like the kit's: zero specificity, any page rule wins.
 */

/* Without JavaScript the element is a block holding the fallback text. */
:where(uc-binary-search) { display: block; }

:where(.uc-binary-search__widget) {
  display: flex;
  flex-direction: column;
  gap: var(--uc-space-4);
  padding: var(--uc-space-4) var(--uc-space-5);
  border: 1px solid var(--uc-color-border);
  border-radius: var(--uc-radius-lg);
  background: var(--uc-color-surface);
}

:where(.uc-binary-search__cells) {
  display: flex;
  flex-wrap: wrap;
  gap: var(--uc-space-1);
  margin: 0;
  padding: 0;
  list-style: none;
}

:where(.uc-binary-search__cell) {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 2.75rem;
  margin: 0;
  padding: var(--uc-space-1) var(--uc-space-2);
  border: 1px solid var(--uc-color-border);
  border-radius: var(--uc-radius-sm);
  font-family: var(--uc-font-mono);
}
:where(.uc-binary-search__index) { color: var(--uc-color-text-muted); font-size: var(--uc-font-size-xs); }
:where(.uc-binary-search__value) { font-weight: 600; }

/* States: outside the range (struck through, not only greyed), middle, found. */
:where(.uc-binary-search__cell[data-state="out"]) {
  background: var(--uc-color-surface-muted);
  color: var(--uc-color-text-muted);
  text-decoration: line-through;
}
:where(.uc-binary-search__cell[data-state="mid"]) {
  border-color: var(--uc-color-accent);
  background: var(--uc-color-accent-soft);
  box-shadow: inset 0 0 0 1px var(--uc-color-accent);
}
:where(.uc-binary-search__cell[data-state="found"]) {
  border-color: var(--uc-color-accent);
  background: var(--uc-color-accent);
  color: var(--uc-color-on-accent);
}
:where(.uc-binary-search__cell[data-state="found"] .uc-binary-search__index) { color: inherit; }

/* Two lines reserved, so the buttons do not jump while stepping. */
:where(.uc-binary-search__status) { min-height: calc(2 * var(--uc-line-height) * 1em); margin: 0; }

:where(.uc-binary-search__actions) { display: flex; flex-wrap: wrap; gap: var(--uc-space-2); }
:where(.uc-binary-search__actions [aria-disabled="true"]) { opacity: 0.6; cursor: not-allowed; }
```

## Estilos do componente

- **Só tokens.** Cores, espaços, cantos e letra vêm de `--uc-*`; assim o componente segue `accentColor` e o `theme.css` do site.
- **Seletores em `:where()`**, como os do kit: especificidade zero, e qualquer regra do professor no `theme.css` ganha.
- **`display: block` no próprio elemento.** Um elemento desconhecido é `inline`; sem esta regra, a frase de alternativa ficaria colada ao texto à volta.
- **Repor o que o kit dá a elementos simples.** O kit põe margem entre itens de lista (`li + li`); na lista de células em linha, `margin: 0` desfaz isso.

## Acessibilidade

### O que o exemplo faz

- Ações em `<button type="button">` verdadeiros: teclado e leitores de ecrã sem código extra.
- Uma frase com `aria-live="polite"` descreve cada passo; quem não vê as cores ouve o mesmo.
- `aria-disabled` no fim, em vez de `disabled`: o botão não perde o foco do teclado.
- Estado não só pela cor: as posições fora do intervalo ficam riscadas.
- Um nome para o grupo (`aria-label`), traduzido como o resto.

### O que convém verificar

- Tudo funciona só com o teclado (Tab, Enter, Espaço) e o foco é visível.
- Contraste de pelo menos 4.5:1 em todos os estados, também com outra `accentColor`.
- Animações respeitam `prefers-reduced-motion` (o kit já reduz as transições CSS).
- Cabe num ecrã de 360px sem deslizar na horizontal.

## Sem JavaScript

O que o professor escreve dentro do elemento é a alternativa: aparece quando o JavaScript está desligado ou o ficheiro não carrega. O componente não a apaga; guarda-a num bloco com `hidden` quando consegue construir a versão interativa, e mostra-a se faltarem atributos. Uma frase com o resultado (como no exemplo), uma imagem ou uma tabela chegam.

## Um caso real

O exemplo de Estruturas de Dados tem `<uc-bst-traversal>`, uma animação dos percursos em pré-ordem, em-ordem, pós-ordem e em largura numa árvore binária de pesquisa. O [código](https://uc-design-kit.miguelrocha.dev/examples/edados-2526/extensions/uc-bst-traversal.js) segue o mesmo modelo, mais completo: desenho da árvore em SVG, reproduzir e pausar, pilha de chamadas e fila, pseudocódigo, textos em português e inglês, e uma descrição da árvore para leitores de ecrã. O comentário no início do ficheiro resume as regras desta página. O [guião da aula 10](https://uc-design-kit.miguelrocha.dev/examples/edados-2526/guioes/aula10.html) usa agora o widget [`<uc-widget-bst>`](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/uc-widget-bst.md) da biblioteca de widgets, que faz o mesmo e mais; a extensão fica como exemplo de um componente escrito pelo professor.

## Ver também

- [Estrutura de um site: componentes próprios](https://uc-design-kit.miguelrocha.dev/docs/pt/estrutura.md#extensoes).
- [Execução de código](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/execucao.md): a outra extensão possível, um runner.
- [API JavaScript](https://uc-design-kit.miguelrocha.dev/docs/pt/referencia/api-js.md): todos os membros de `UC` e os eventos.
- [Acessibilidade](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/acessibilidade.md).
