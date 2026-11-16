# Padrões de página

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/exemplos/padroes.html

As cinco páginas que quase todas as cadeiras têm, montadas com o curso fictício das demonstrações. O separador Código mostra o conteúdo do `<body>` pronto a copiar; o `<head>` é sempre o mesmo, descrito em [Estrutura de um site](https://uc-design-kit.miguelrocha.dev/docs/pt/estrutura.md).

As demonstrações têm a largura de um tablet, por isso a navegação do `<uc-page>` aparece como menu. Para ver uma página no tamanho real, use "Abrir demo". As três primeiras também estão no [modelo inicial](https://uc-design-kit.miguelrocha.dev/docs/pt/criar-site.md), com comentários.

## Página inicial

O nome da cadeira, o cartão "Esta semana", os avisos e as próximas datas lado a lado, atalhos e a equipa. Quase tudo vem do `course.js`: a página só diz a ordem.

Exemplo (página inicial), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/patterns/home.html):

```html
<uc-page current="home">
  <uc-hero></uc-hero>
  <uc-this-week></uc-this-week>
  <div class="uc-split">
    <uc-notices></uc-notices>
    <uc-deadlines>
      <a href="../avaliacao.html">Regras de avaliação</a>
    </uc-deadlines>
  </div>
  <section class="uc-section" aria-labelledby="atalhos">
    <h2 id="atalhos">Acesso rápido</h2>
    <ul class="uc-shortcuts">
      <li><a href="../semanas.html">Semanas e guiões</a></li>
      <li><a href="../avaliacao.html">Avaliação</a></li>
      <li><a href="../sobre.html">Sobre a cadeira</a></li>
    </ul>
  </section>
  <uc-team></uc-team>
</uc-page>
```

- `uc-split` põe os avisos e as datas em duas colunas nos ecrãs largos e uma por baixo da outra no telemóvel.
- O conteúdo escrito dentro de `<uc-deadlines>` aparece por baixo da lista: aqui, a ligação para as regras.
- Componentes: [`<uc-hero>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-hero.md), [`<uc-this-week>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-this-week.md), [`<uc-notices>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-notices.md), [`<uc-deadlines>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-deadlines.md), [`<uc-team>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-team.md).

## Semanas

Uma `<uc-week>` por semana dentro de `<uc-weeks>`. As datas, a interrupção e os prazos de cada semana são calculados; o professor só escreve a matéria.

Exemplo (página de semanas), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/patterns/weeks.html):

```html
<uc-page current="weeks">
  <div class="uc-stack" style="--uc-stack-gap: var(--uc-space-3)">
    <h1>Semanas</h1>
    <p class="uc-prose">Matéria das teóricas, aula prática e prazos de cada semana. A semana atual abre sozinha.</p>
  </div>
  <uc-weeks>
    <uc-week n="9" title="Pesquisa e ordenação">
      <dl>
        <dt>Teóricas</dt>
        <dd>Pesquisa linear e binária; ordenação por seleção e por inserção</dd>
        <dt>Prática</dt>
        <dd><a href="guide.html">Guião 9: pesquisa binária</a></dd>
      </dl>
    </uc-week>
    <uc-week n="10" title="Recursividade">
      <dl>
        <dt>Teóricas</dt>
        <dd>Caso base e passo recursivo; a pilha de chamadas</dd>
        <dt>Prática</dt>
        <dd>Guião 10: funções recursivas sobre listas</dd>
      </dl>
    </uc-week>
    <uc-week n="11" title="Ordenação eficiente">
      <dl>
        <dt>Teóricas</dt>
        <dd>Merge sort e quicksort; complexidade</dd>
        <dt>Prática</dt>
        <dd>Guião 11: comparar algoritmos de ordenação</dd>
      </dl>
    </uc-week>
  </uc-weeks>
</uc-page>
```

- Um `<dl>` dentro da semana mostra linhas "etiqueta: valor", que o `<uc-this-week>` da página inicial também lê.
- Esta página tem de se chamar como a página `weeks` do `course.js`, para o cartão "Esta semana" a encontrar.
- Componentes: [`<uc-weeks>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-weeks.md), [`<uc-week>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-week.md).

## Avaliação

Cartões para as componentes da nota, uma chamada para a regra que ninguém pode esquecer e a tabela de datas com o estado de cada prova.

Exemplo (página de avaliação), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/patterns/assessment.html):

```html
<uc-page current="assessment">
  <div class="uc-stack" style="--uc-stack-gap: var(--uc-space-3)">
    <h1>Avaliação</h1>
    <p class="uc-prose">A nota final soma duas componentes. Para aprovar é preciso ter pelo menos 9,5 valores no total.</p>
  </div>
  <section class="uc-section" aria-labelledby="componentes">
    <h2 id="componentes">Componentes da nota</h2>
    <div class="uc-grid">
      <div class="uc-card">
        <h3>Exame</h3>
        <p><strong>60%</strong> · época normal ou recurso, sem consulta.</p>
      </div>
      <div class="uc-card">
        <h3>Trabalho e teste</h3>
        <p><strong>40%</strong> · 20% cada, ao longo do semestre.</p>
      </div>
    </div>
    <div class="uc-callout">
      <p><strong>Para aprovar:</strong> pelo menos 9,5 valores no total e 40% no exame.</p>
    </div>
  </section>
  <uc-deadlines view="table" heading="Datas"></uc-deadlines>
  <section class="uc-section" aria-labelledby="regras">
    <h2 id="regras">Regras</h2>
    <ul class="uc-bullets">
      <li>Os trabalhos são individuais.</li>
      <li>Entregas fora do prazo não são aceites.</li>
      <li>A época de recurso substitui apenas a nota do exame.</li>
    </ul>
  </section>
</uc-page>
```

- A tabela de datas é a mesma informação da página inicial, noutra vista: `view="table"`.
- Blocos: [`uc-grid`](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/layout.md#grid), [`uc-card`](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/superficies.md#card), [`uc-callout`](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/superficies.md#callout), [`uc-bullets`](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/superficies.md#bullets).

## Guião com exercícios

Uma aula prática: secções numeradas, uma pergunta de verificação rápida, um exercício com código que corre na página e testes, e uma dica.

Exemplo (guião com exercícios), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/patterns/guide.html):

```html
<uc-page current="weeks">
  <uc-guide week="9">
    <h1>Guião 9 · Pesquisa binária</h1>

    <section class="uc-section">
      <h2>1. A ideia</h2>
      <p>Compara-se o valor procurado com o elemento do meio de uma lista ordenada: se for menor, continua-se na metade esquerda; se for maior, na direita.</p>
      <uc-question>
        <p>Quantas comparações faz, no máximo, a pesquisa binária numa lista com 1000 elementos?</p>
        <ul>
          <li><code>500</code></li>
          <li data-correct><code>10</code></li>
          <li><code>1000</code></li>
        </ul>
        <p data-explanation>Cada comparação descarta metade da lista, e 2<sup>10</sup> = 1024.</p>
      </uc-question>
    </section>

    <section class="uc-section">
      <h2>2. Exercícios</h2>
      <uc-exercise id="procurar" title="Pesquisa binária iterativa" level="easy">
        <p>Completa <code>search(list, x)</code>, que devolve a posição de <code>x</code> ou <code>-1</code>.</p>
        <uc-code lang="js" filename="search.js" editable run>
          <script type="text/plain">
            function search(list, x) {
              let low = 0, high = list.length - 1;
              while (low <= high) {
                const mid = Math.floor((low + high) / 2);
                if (list[mid] === x) return mid;
                // TODO: move low or high
                return -1;
              }
              return -1;
            }
          </script>
          <script type="text/plain" data-harness>
            console.log(search([1, 3, 5, 7, 9], 5));
            console.log(search([1, 3, 5, 7, 9], 9));
            console.log(search([1, 3, 5, 7, 9], 4));
          </script>
          <ol data-tests>
            <li data-expected="2">Elemento do meio</li>
            <li data-expected="4">Último elemento</li>
            <li data-expected="-1">Elemento que não existe</li>
          </ol>
        </uc-code>
        <details class="uc-hint">
          <summary>Dica</summary>
          <p>Se <code>list[mid] &lt; x</code>, o valor só pode estar depois de <code>mid</code>.</p>
        </details>
      </uc-exercise>
      <uc-exercise id="contar" title="Contar comparações" level="medium">
        <p>Altera a função para devolver também o número de comparações feitas.</p>
      </uc-exercise>
    </section>
  </uc-guide>
</uc-page>
```

- `week="9"` liga o guião à semana: o caminho no topo ganha uma ligação para a semana 9 na página de semanas.
- O índice e o progresso aparecem à direita quando há espaço (abra a demo); com os exercícios marcados como feitos, o progresso fica guardado no browser.
- `current="weeks"` no `<uc-page>` mantém "Semanas" ativo na navegação, porque o guião não está nela.
- Componentes: [`<uc-guide>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-guide.md), [`<uc-question>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-question.md), [`<uc-exercise>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-exercise.md), [`<uc-code>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-code.md).

## Enunciado de problema

Texto corrido sem classes, como num enunciado copiado de outro sítio: `uc-content` dá-lhe títulos, espaçamento e tabelas, e `<pre data-copy>` acrescenta um botão para copiar os exemplos.

Exemplo (enunciado de problema), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/patterns/problem.html):

```html
<uc-page current="weeks">
  <div class="uc-content">
    <h1>[P042] Soma dos dígitos</h1>

    <h2>O problema</h2>
    <p>Dado um número inteiro positivo, calcula a soma dos seus dígitos. Por exemplo, a soma dos dígitos de 2025 é 2 + 0 + 2 + 5 = 9.</p>

    <h2>Input</h2>
    <p>Uma linha com um inteiro <em>N</em> (1 ≤ <em>N</em> ≤ 10<sup>18</sup>).</p>

    <h2>Output</h2>
    <p>Uma linha com a soma dos dígitos de <em>N</em>.</p>

    <h2>Exemplo</h2>
    <table>
      <thead>
        <tr><th scope="col">Input</th><th scope="col">Output</th></tr>
      </thead>
      <tbody>
        <tr>
          <td><pre data-copy>2025</pre></td>
          <td><pre data-copy>9</pre></td>
        </tr>
      </tbody>
    </table>
  </div>
  <div class="uc-callout">
    <p>Submete a solução na plataforma indicada na <a href="../semanas.html">página de semanas</a>.</p>
  </div>
</uc-page>
```

- O mesmo serve para páginas migradas de um site antigo: ver [Nível 4: HTML livre](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/html.md#uc-content).
- Blocos: [`uc-content`](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/tipografia.md#uc-content), [`<pre data-copy>`](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/elementos.md#pre-data-copy).

## Ver também

- [Estruturas de Dados 2025/26](https://uc-design-kit.miguelrocha.dev/docs/pt/exemplos/edados.md): as mesmas páginas num site real.
- [Criar o meu site](https://uc-design-kit.miguelrocha.dev/docs/pt/criar-site.md).
