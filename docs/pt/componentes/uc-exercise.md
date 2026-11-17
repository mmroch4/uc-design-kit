# `<uc-exercise>`

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-exercise.html

Um exercício de um guião: um cartão numerado que abre e fecha, com o nível, o problema no Mooshak, dicas e solução escondidas e um botão "Marcar como feito" que o navegador lembra.

Exemplo (exercício aberto com dica e solução), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-exercise/basic.html):

```html
<uc-exercise id="maximo" title="Maior elemento de uma lista" level="easy" open>
  <p>Escreve <code>maximo(lista)</code>, que devolve o maior elemento de uma lista não vazia sem usar a função <code>max</code>.</p>
  <details class="uc-hint">
    <summary>Dica</summary>
    <p>Guarda o primeiro elemento numa variável e percorre os restantes, trocando-o sempre que encontrares um maior.</p>
  </details>
  <details class="uc-solution">
    <summary>Solução</summary>
    <pre><code>def maximo(lista):
maior = lista[0]
for x in lista[1:]:
    if x &gt; maior:
        maior = x
return maior</code></pre>
  </details>
</uc-exercise>
```

A demonstração mostra um exercício aberto de nível fácil. A dica e a solução estão fechadas e abrem-se de forma independente; o botão no fim marca o exercício como feito, e essa marca continua lá ao recarregar a página.

## Utilização

Cada exercício tem um `id` único na página e um título. O conteúdo é HTML livre: o enunciado, e depois blocos `<details class="uc-hint">` para dicas e `<details class="uc-solution">` para a solução.

`guioes/aula08.html`:

```html
<uc-exercise id="maximo" title="Maior elemento de uma lista" level="easy">
  <p>Escreve <code>maximo(lista)</code> sem usar a função <code>max</code>.</p>
  <details class="uc-hint">
    <summary>Dica</summary>
    <p>Guarda o primeiro elemento e percorre os restantes.</p>
  </details>
  <details class="uc-solution">
    <summary>Solução</summary>
    <pre><code>def maximo(lista): …</code></pre>
  </details>
</uc-exercise>
```

Os exercícios são numerados pela ordem em que aparecem: dentro de um `<uc-guide>`, a contagem é a do guião; fora dele, a da página inteira. O número não se escreve, por isso acrescentar um exercício a meio renumera os seguintes. Num guião, o `<uc-guide>` conta os exercícios feitos.

O `course.js` só é preciso para o atributo `mooshak`: a ligação de submissão usa a plataforma com a etiqueta "Mooshak".

`course.js`:

```js
window.UC_COURSE = {
  title: "Algoritmos e Programação",
  platforms: [{ label: "Mooshak", url: "https://mooshak.example.org/~ap/" }],
};
```

## Exemplos

### Níveis e numeração

`level` acrescenta uma etiqueta ao título: "Fácil" a cinzento, "Médio" na cor do curso e "Difícil" a âmbar. Os três exercícios fechados mostram também a numeração automática.

Exemplo (três exercícios fechados com os três níveis), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-exercise/levels.html):

```html
<uc-exercise id="somar" title="Somar os elementos de uma lista" level="easy">
  <p>Escreve <code>somar(lista)</code> com um ciclo <code>for</code>.</p>
</uc-exercise>
<uc-exercise id="pares" title="Filtrar os números pares" level="medium">
  <p>Escreve <code>pares(lista)</code>, que devolve uma lista nova só com os números pares.</p>
</uc-exercise>
<uc-exercise id="rodar" title="Rodar uma lista k posições" level="hard">
  <p>Escreve <code>rodar(lista, k)</code> sem criar listas auxiliares.</p>
</uc-exercise>
```

### Problema no Mooshak

Com `mooshak`, o código do problema aparece numa etiqueta no título e, no fim do exercício, um botão "Submeter no Mooshak" leva à plataforma. O curso das demonstrações não tem Mooshak, por isso esta página acrescenta-o num pequeno `<script>` a seguir ao `course.js`.

Exemplo (exercício com problema no Mooshak), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-exercise/mooshak.html):

```html
<uc-exercise id="palindromo" title="Palíndromos" level="medium" mooshak="AP104" open>
  <p>Lê uma palavra e escreve <code>sim</code> se ela se lê da mesma forma nos dois sentidos, ou <code>nao</code> no caso contrário.</p>
</uc-exercise>
```

O botão abre o endereço da plataforma (`url`), não o problema: o kit não constrói endereços por problema, e o código na etiqueta diz ao aluno qual escolher. Se não houver uma plataforma chamada "Mooshak" (a comparação ignora maiúsculas), a etiqueta mostra só o código e o botão não aparece.

### Exercícios extra e desafios

`kind="extra"` e `kind="challenge"` marcam os exercícios que não são obrigatórios, com as mesmas etiquetas das listas de problemas.

Exemplo (exercícios com as etiquetas Extra e Desafio), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-exercise/kind.html):

```html
<uc-exercise id="principal" title="Soma dos dígitos">
  <p>Exercício principal: sem etiqueta.</p>
</uc-exercise>
<uc-exercise id="extra" title="Dígitos repetidos" kind="extra">
  <p>Exercício extra.</p>
</uc-exercise>
<uc-exercise id="desafio" title="Números de Armstrong" kind="challenge" level="hard">
  <p>Desafio, também com nível.</p>
</uc-exercise>
```

### Dicas e soluções sem título

Um `uc-hint` ou `uc-solution` escrito sem `<summary>` recebe um na língua ativa: "Dica" ou "Solução". Pode haver várias dicas, de mais vaga para mais concreta.

Exemplo (duas dicas e uma solução sem summary), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-exercise/generated-summary.html):

```html
<uc-exercise id="inverter" title="Inverter uma cadeia de caracteres" open>
  <p>Escreve <code>inverter(s)</code>, que devolve a cadeia <code>s</code> ao contrário.</p>
  <details class="uc-hint">
    <p>Em Python, uma fatia pode ter passo negativo.</p>
  </details>
  <details class="uc-hint">
    <p>Experimenta <code>"abc"[::-1]</code> no interpretador.</p>
  </details>
  <details class="uc-solution">
    <pre><code>def inverter(s):
return s[::-1]</code></pre>
  </details>
</uc-exercise>
```

As classes `uc-hint` e `uc-solution` também têm o mesmo aspeto fora de um exercício, mas aí o título não é gerado e o `<summary>` tem de ser escrito.

## Atributos

| Atributo | Tipo | Por omissão | Descrição |
| --- | --- | --- | --- |
| `id` | texto | — | Obrigatório para lembrar o estado "feito". Único na página; mudá-lo faz perder a marca já guardada. |
| `title` | texto | — | Obrigatório. Título do exercício. O atributo é retirado depois de lido, para não aparecer como dica ao passar o rato sobre o cartão. |
| `level` | `easy` \| `medium` \| `hard` | ausente | Etiqueta "Fácil", "Médio" ou "Difícil". Outro valor é ignorado. |
| `kind` | `main` \| `extra` \| `challenge` | `main` | Etiqueta "Extra" ou "Desafio", os mesmos tipos de [`<uc-problems>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-problems.md). `main` não mostra etiqueta. |
| `mooshak` | código do problema | ausente | Etiqueta com o código no título e, se houver a plataforma "Mooshak" em `platforms`, o botão "Submeter no Mooshak" no fim do exercício. |
| `open` | booleano | ausente | Começa aberto. |

## Configuração usada

| Campo | Para quê |
| --- | --- |
| `platforms` | A entrada com `label: "Mooshak"` dá o nome mostrado na etiqueta e o endereço do botão "Submeter no Mooshak". Ver [Navegação](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#campos-navegacao). |

Sem `mooshak` no exercício, o componente não lê nada do `course.js`.

## Marcar como feito

- **Onde fica guardado**: no `localStorage` do navegador do aluno, com uma chave da cadeira (o `code` do `course.js`) seguida do caminho da página e do `id` (por exemplo `uc:CC1007:done:/guioes/aula10.html#procurar`). As marcas guardadas antes da versão 1.1 (`uc:done:…`) passam para a chave nova na primeira visita. Cada página tem as suas marcas; dois guiões podem usar o mesmo `id`. Nada é enviado para um servidor, e noutro navegador ou computador as marcas não aparecem.
- **O que muda**: o número dá lugar a um visto, o título fica mais claro, aparece a etiqueta "Feito" e o botão fica verde e premido. O exercício não fecha.
- **Sem `id`**: o botão funciona, mas a marca perde-se ao recarregar, e a consola mostra um aviso.
- **Evento**: cada clique dispara `uc:exercisechange`, que sobe pela página com `detail.id` e `detail.done`. É o que o `<uc-guide>` usa para o progresso, e pode ser usado numa extensão.

`extensions/log.js`:

```js
document.addEventListener("uc:exercisechange", (event) => {
  console.log(event.detail.id, event.detail.done ? "done" : "not done");
});
```

## Personalizar

Estas classes são estáveis na versão 1 e podem ser usadas num `theme.css`. As regras do kit têm especificidade zero, por isso qualquer regra do professor ganha. O método está em [Nível 2: CSS livre](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/css.md); para mudar só cores, cantos ou letra em todo o site bastam os [tokens](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/tokens.md).

| Classe | Elemento |
| --- | --- |
| `.uc-exercise` | O exercício (o próprio `<uc-exercise>`). |
| `.uc-exercise--done` | Exercício marcado como feito. |
| `.uc-exercise__details`, `__summary`, `__body` | O cartão (`<details>`), a linha que abre e fecha e o conteúdo. |
| `.uc-exercise__number`, `__title`, `__chevron` | O círculo com o número (ou o visto), o título e a seta. |
| `.uc-exercise__meta` | As etiquetas à direita do título. |
| `.uc-exercise__level`, `__kind`, `__problem`, `__done-tag` | As etiquetas de nível, de tipo ("Extra", "Desafio"), de problema no Mooshak e "Feito". |
| `.uc-exercise__actions` | A linha do fim, com os botões. |
| `.uc-exercise__submit` | O botão "Submeter no Mooshak". |
| `.uc-exercise__toggle`, `__checkbox` | O botão "Marcar como feito" e a sua caixa. |
| `.uc-hint`, `.uc-solution` | Os blocos de dica e de solução (classes escritas pelo professor). |

`theme.css`:

```css
/* Exercícios feitos com o título riscado. */
.uc-exercise--done .uc-exercise__title { text-decoration: line-through; }

/* Solução com fundo cinzento em vez de âmbar. */
details.uc-solution {
  border-color: var(--uc-color-border);
  background: var(--uc-color-surface-muted);
}
```

## Acessibilidade

### O que o componente faz

Usa `<details>` e `<summary>` nativos, que abrem com Enter ou Espaço; o leitor de ecrã lê "Exercício 1: título" e o número visível fica escondido. "Marcar como feito" é um botão com `aria-pressed`, descrito pelo título do exercício, e o foco mantém-se nele ao carregar. Botões e ligações ficam no corpo, nunca dentro do `<summary>`.

### O que cabe a quem escreve

Títulos curtos e distintos (são o que se ouve ao percorrer os exercícios), um `<summary>` que diga o que esconde quando há várias dicas ("Dica: casos-limite") e código em `<pre>`, não em imagens.

## Sem JavaScript

Se o kit não carregar, o enunciado aparece como HTML normal e as dicas e soluções continuam a abrir e fechar, porque são `<details>` nativos. Perdem-se o cartão, o número, o título (que só existe no atributo), as etiquetas e o botão "Marcar como feito". Convém por isso escrever as dicas e soluções sempre com `<summary>`: sem ele, o navegador mostra "Detalhes".

## Ver também

- [`<uc-guide>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-guide.md): o guião que numera os exercícios e conta os feitos.
- [`<uc-code>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-code.md): código com cópia, descarga e execução, para enunciados e soluções.
- [`<uc-question>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-question.md): uma pergunta de escolha múltipla com resposta imediata.
- Uso real: [os exercícios da aula 10 de Estruturas de Dados 2025/26](https://uc-design-kit.miguelrocha.dev/examples/edados-2526/guioes/aula10.html).
