# `<uc-question>`

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-question.html

Uma pergunta de escolha múltipla para o aluno verificar se percebeu, com resposta imediata. A resposta certa só se revela quando é escolhida, junto com uma explicação opcional.

Exemplo (pergunta com uma resposta certa e explicação), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-question/basic.html):

```html
<uc-question>
  <p>Quanto vale <code>len([1, [2, 3], 4])</code> em Python?</p>
  <ul>
    <li><code>2</code></li>
    <li data-correct><code>3</code></li>
    <li><code>4</code></li>
  </ul>
  <p data-explanation>A lista tem três elementos: <code>1</code>, a lista <code>[2, 3]</code> e <code>4</code>. A lista interior conta como um só elemento.</p>
</uc-question>
```

A demonstração tem uma só resposta certa. Pode carregar-se em "Verificar" sem escolher nada, depois com uma opção errada e por fim com a certa: a explicação só aparece no fim.

## Utilização

Dentro do elemento escreve-se a pergunta, uma lista com as opções e, opcionalmente, uma explicação. As opções certas têm `data-correct`; a explicação é o elemento com `data-explanation`.

`guioes/aula05.html`:

```html
<uc-question>
  <p>Quanto vale <code>len([1, [2, 3], 4])</code> em Python?</p>
  <ul>
    <li><code>2</code></li>
    <li data-correct><code>3</code></li>
    <li><code>4</code></li>
  </ul>
  <p data-explanation>A lista interior conta como um só elemento.</p>
</uc-question>
```

A lista de opções é a primeira `<ul>` ou `<ol>` filha direta do `<uc-question>`, e a explicação também tem de ser filha direta. Tudo o resto (parágrafos, código, imagens, outras listas) forma o enunciado, pela ordem escrita. Cada `<li>` pode ter HTML, como `<code>`.

## Exemplos

### Várias respostas certas

Com `multiple`, as opções passam a caixas de seleção e a resposta só está certa quando estão escolhidas todas as opções certas e nenhuma errada. Convém dizê-lo no enunciado, como aqui.

Exemplo (pergunta com várias respostas certas), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-question/multiple.html):

```html
<uc-question multiple>
  <p>Quais destes tipos de Python são imutáveis?</p>
  <p class="uc-muted">Escolhe todas as opções certas.</p>
  <ul>
    <li data-correct><code>tuple</code></li>
    <li><code>list</code></li>
    <li data-correct><code>str</code></li>
    <li><code>dict</code></li>
  </ul>
  <p data-explanation>Tuplos e cadeias de caracteres não podem ser alterados depois de criados; listas e dicionários podem.</p>
</uc-question>
```

### Código no enunciado, sem explicação

O enunciado pode ter um bloco de código, aqui um [`<uc-code>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-code.md). Sem `data-explanation`, a resposta certa mostra só "Certo!" e as opções certas a verde.

Exemplo (pergunta com código no enunciado e sem explicação), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-question/no-explanation.html):

```html
    <uc-question>
      <p>O que escreve este programa?</p>
      <uc-code lang="python" no-download><pre><code>x = [1, 2, 3]
y = x
y.append(4)
print(len(x))</code></pre></uc-code>
      <ul>
        <li><code>3</code></li>
        <li data-correct><code>4</code></li>
        <li>Dá um erro</li>
      </ul>
    </uc-question>
```

## Atributos

| Atributo | Tipo | Por omissão | Descrição |
| --- | --- | --- | --- |
| `multiple` | booleano | ausente | Várias respostas certas: caixas de seleção em vez de botões de opção. |

Nas opções, `data-correct` marca uma resposta certa; num elemento filho, `data-explanation` marca a explicação. Não são atributos do componente mas fazem parte da marcação que ele lê.

## Configuração usada

O componente não lê nada do `course.js`; os textos gerados ("Verificação rápida", "Verificar", "Certo!") seguem a língua ativa.

## Respostas e teclado

- **Sem nada escolhido**: "Verificar" responde "Escolhe uma opção".
- **Resposta errada**: "Ainda não. Tenta outra vez.", sem dizer que opções estão erradas. A mensagem desaparece quando se muda a escolha.
- **Resposta certa**: "Certo!", as opções certas ficam a verde e a explicação aparece. A pergunta fica resolvida até recarregar a página, mesmo que depois se mude a escolha.
- **Teclado**: Tab entra nas opções; numa pergunta de uma só resposta, as setas mudam a escolha, e numa com `multiple`, Espaço marca e desmarca cada caixa. Tab passa depois para "Verificar". A mensagem é anunciada pelo leitor de ecrã sem mover o foco.

Nada é guardado nem enviado: a pergunta serve para o aluno se testar, não para avaliar. As respostas certas estão no código da página, ao alcance de quem o abrir.

## Personalizar

Estas classes são estáveis na versão 1 e podem ser usadas num `theme.css`. As regras do kit têm especificidade zero, por isso qualquer regra do professor ganha. O método está em [Nível 2: CSS livre](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/css.md); para mudar só cores, cantos ou letra em todo o site bastam os [tokens](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/tokens.md).

| Classe | Elemento |
| --- | --- |
| `.uc-question` | A pergunta (o próprio `<uc-question>`). |
| `.uc-question--solved` | Pergunta respondida corretamente. |
| `.uc-question__tag` | A etiqueta "Verificação rápida". |
| `.uc-question__prompt` | O enunciado. |
| `.uc-question__options` | O grupo de opções (um `<fieldset>`). |
| `.uc-question__option`, `__option--correct` | Cada opção e uma opção certa depois de resolvida. |
| `.uc-question__mark` | O visto que aparece nas opções certas depois de resolvida, para que não se distingam só pela cor. |
| `.uc-question__input`, `__label` | O botão de opção ou a caixa, e o texto da opção. |
| `.uc-question__actions`, `__check` | A linha do botão e o botão "Verificar". |
| `.uc-question__feedback`, `--none`, `--empty`, `--incorrect`, `--correct` | A zona da mensagem e o seu estado. |
| `.uc-question__message`, `__explanation` | A mensagem e a explicação. |

`theme.css`:

```css
/* Perguntas com fundo cinzento, para se distinguirem dos exercícios. */
.uc-question { background: var(--uc-color-surface-muted); }

/* Enunciado em letra normal. */
.uc-question__prompt { font-weight: 400; }
```

## Acessibilidade

### O que o componente faz

As opções são `<input type="radio">` ou `type="checkbox"` nativos, cada um com o seu `<label>`, num `<fieldset>` cujo nome é o enunciado. A mensagem fica numa região `aria-live="polite"`. O estado certo não depende só da cor: há a mensagem "Certo!" com um ícone, e as opções certas ganham um visto.

### O que cabe a quem escreve

Um enunciado curto que se entenda lido em voz alta (é o nome do grupo), opções que façam sentido sozinhas e, numa pergunta com `multiple`, dizer no enunciado que há várias respostas.

## Sem JavaScript

Se o kit não carregar, aparecem o enunciado, a lista de opções e a explicação como HTML normal, sem forma de responder. A explicação fica visível desde o início, por isso, se ela der a resposta, o aluno vê-a logo.

## Ver também

- [`<uc-exercise>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-exercise.md): um exercício com dicas e solução escondidas.
- [`<uc-guide>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-guide.md): o guião onde as perguntas costumam estar.
- Uso real: [uma pergunta sobre a altura de uma árvore no guião da aula 10 de Estruturas de Dados 2025/26](https://uc-design-kit.miguelrocha.dev/examples/edados-2526/guioes/aula10.html).
