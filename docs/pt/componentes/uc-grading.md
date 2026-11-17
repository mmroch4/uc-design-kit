# `<uc-grading>`

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-grading.html

Como se calcula a nota, a partir da lista que o professor já escreve: uma fórmula gerada, uma barra com o peso de cada componente, uma tabela de pesos e mínimos e, se se quiser, um simulador da nota final.

Exemplo (componentes da nota com partes e bónus), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-grading/basic.html):

```html
<uc-grading>
  <ul>
    <li data-code="Q"><data value="10">10 %</data> Quizzes semanais</li>
    <li data-code="T"><data value="30">30 %</data> Trabalho prático
      <ul>
        <li data-code="T1"><data value="40">40 %</data> Primeira entrega</li>
        <li data-code="T2"><data value="60">60 %</data> Entrega final e apresentação</li>
      </ul>
    </li>
    <li data-code="E" data-min="8"><data value="60">60 %</data> Exame final. <span>Sem consulta.</span></li>
    <li data-code="B" data-bonus="1">Desafios extra</li>
  </ul>
</uc-grading>
```

A demonstração tem quatro componentes: quizzes, um trabalho com duas entregas, o exame (com mínimo de 8) e um bónus até 1 valor. A fórmula e as percentagens são calculadas a partir dos pesos escritos na lista.

## Utilização

Escreve-se a lista das componentes dentro do elemento, um `<li>` por componente. O peso vai num `<data>`: o `value` é o número que o componente usa e o texto é o que se lê. Sem JavaScript, a lista aparece tal como está escrita.

`avaliacao.html`:

```html
<uc-grading scale="20" pass="9.5" calculator>
  <ul>
    <li data-code="E" data-scale="14" data-min="4.9"><data value="14">14 valores</data> Exame final.
      <span>Teórico-prático, sem consulta.</span></li>
    <li data-code="AP" data-scale="5"><data value="5">5 valores</data> Avaliações práticas</li>
    <li data-code="P" data-scale="1"><data value="1">1 valor</data> Exercícios das aulas práticas</li>
  </ul>
</uc-grading>
```

Os pesos são relativos entre si: `14/5/1`, `0,1/0,2/0,2/0,5` e `25%/50%/25%` dão o mesmo tipo de resultado, e não precisam de somar 1 nem 100. Aceita-se vírgula ou ponto decimal e um `%` no fim.

Cada item pode ter estes atributos:

| Atributo do item | Descrição |
| --- | --- |
| `data-code` | Nome curto usado na fórmula, na tabela e no simulador: `E`, `AP`, `T1`. |
| `data-scale` | Escala em que a componente é classificada. Por omissão é a `scale` do elemento (numa parte, a da componente de cima). Com `data-scale="14"`, o exame é dado de 0 a 14 e entra na fórmula sem coeficiente. |
| `data-min` | Nota mínima, na escala da própria componente ("4,9 em 14"). |
| `data-bonus` | Faz do item um bónus, que não entra nos pesos: soma até este número de valores (`2`) ou esta percentagem da escala (`10%`). A nota final nunca passa da escala. Não precisa de `<data>`. |

A tabela mostra o texto do item; o que estiver num `<span>` aparece em cinzento, como descrição, e fica fora do rótulo do simulador.

## Exemplos

### Simular a nota

Com `calculator`, aparece um campo por componente. A nota final é calculada enquanto se escreve e o resultado diz se a simulação passa, com `pass` e os mínimos (`data-min`). Nada fica guardado, e uma nota explica que a nota oficial é a do SIGARRA.

Exemplo (simulador da nota com mínimo no exame), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-grading/calculator.html):

```html
<uc-grading scale="20" pass="9.5" calculator>
  <ul>
    <li data-code="E" data-scale="14" data-min="4.9"><data value="14">14 valores</data> Exame final. <span>Teórico-prático, sem consulta.</span></li>
    <li data-code="AP" data-scale="5"><data value="5">5 valores</data> Avaliações práticas</li>
    <li data-code="P" data-scale="1"><data value="1">1 valor</data> Exercícios das aulas práticas</li>
  </ul>
</uc-grading>
```

Um valor fora da escala ("21") ou que não é um número mostra uma mensagem de erro junto ao campo e a nota não é calculada. Um bónus vazio conta como 0.

### Componentes com partes

Uma lista dentro de um item divide essa componente em partes, com pesos relativos a ela. Na demonstração do início, o trabalho (30 %) tem duas entregas de 40 % e 60 %, que a tabela mostra como "12 % (40 % de T)" e "18 % (60 % de T)". A nota da componente é a média pesada das partes.

### Pesos decimais, sem fórmula

Com pesos decimais todas as componentes têm a escala da nota final, e a fórmula seria "Nota = 0,1 × A + 0,2 × T1 + 0,2 × T2 + 0,5 × E". Com `no-formula` a fórmula não aparece; o texto escrito depois da lista fica por baixo da tabela.

Exemplo (pesos decimais sem fórmula e com uma nota), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-grading/decimal.html):

```html
<uc-grading heading="Fórmula" no-formula>
  <ol>
    <li data-code="A"><data value="0,1">0,1</data> Atividades semanais</li>
    <li data-code="T1"><data value="0,2">0,2</data> Teste 1</li>
    <li data-code="T2"><data value="0,2">0,2</data> Teste 2</li>
    <li data-code="E"><data value="0,5">0,5</data> Exame</li>
  </ol>
  <p class="uc-muted">O teste com nota mais baixa pode ser repetido na época de recurso.</p>
</uc-grading>
```

## Atributos

| Atributo | Tipo | Por omissão | Descrição |
| --- | --- | --- | --- |
| `scale` | número | `20` | Escala da nota final. |
| `pass` | número | ausente | Nota para aprovar, na escala final. Usada pelo simulador. |
| `calculator` | booleano | ausente | Acrescenta o simulador da nota. |
| `no-formula` | booleano | ausente | Esconde a fórmula gerada. |
| `heading` | texto ou `none` | "Como é calculada a nota" | Título da secção. Com `none`, não há título visível. |
| `heading-level` | `2` a `6` | `2` | Nível do título gerado. |

## Configuração usada

Nenhuma: tudo vem do HTML. O componente está no ficheiro `uc-grading.js`, ao lado do `uc-kit.js`, que o kit só descarrega nas páginas com um `<uc-grading>`; não é preciso acrescentar nada ao `<head>`. Os textos gerados ("Como é calculada a nota", "Simular a nota", a nota sobre o SIGARRA) vêm dos dicionários do kit e podem ser mudados com [`UC.addTranslations`](https://uc-design-kit.miguelrocha.dev/docs/pt/referencia/api-js.md), por exemplo para outra instituição.

## Personalizar

Estas classes são estáveis na versão 1 e podem ser usadas num `theme.css`. As regras do kit têm especificidade zero, por isso qualquer regra do professor ganha. O método está em [Nível 2: CSS livre](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/css.md).

| Classe | Elemento |
| --- | --- |
| `.uc-grading` | O componente (o próprio `<uc-grading>`). |
| `.uc-grading__section`, `__heading` | A secção e o seu título. |
| `.uc-grading__formula` | A fórmula ("Nota = E + AP + P"). |
| `.uc-grading__bar`, `__segment` | A barra das proporções e cada segmento (largura = peso). |
| `.uc-grading__table` | A tabela das componentes. |
| `.uc-grading__sub` | As linhas das partes de uma componente, recolhidas. |
| `.uc-grading__calculator`, `__fields`, `__field`, `__error` | O simulador, os campos, cada campo e a sua mensagem de erro. |
| `.uc-grading__result`, `__status` | A nota simulada e a linha do estado ("Aprovado nesta simulação"). |

`theme.css`:

```css
/* Barra mais alta, com a cor de destaque mais suave. */
uc-grading { --uc-grading-bar-height: 20px; }
.uc-grading__segment { background: var(--uc-color-accent-soft); color: var(--uc-color-accent); }
```

## Acessibilidade

### O que o componente faz

A informação está numa tabela com legenda e cabeçalhos; a barra é decorativa e não é lida. No simulador, cada campo tem um rótulo visível com a escala, os erros são texto ligado ao campo (`aria-describedby`, `aria-invalid`) e o resultado é anunciado uma vez, quando se para de escrever.

### O que cabe a quem escreve

Dar a cada componente um `data-code` curto e um nome claro. Escrever o peso no `<data>` como se lê ("14 valores", "25 %"), porque é esse o texto sem JavaScript.

## Sem JavaScript

Aparece a lista tal como foi escrita, com os pesos dentro de cada item. Não há fórmula, tabela nem simulador. O mesmo acontece se o `uc-grading.js` não puder ser descarregado.

## Ver também

- [`<uc-assessment-info>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-assessment-info.md): o cartão de cada teste ou exame.
- [`<uc-deadlines>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-deadlines.md): todas as datas de avaliação numa tabela.
