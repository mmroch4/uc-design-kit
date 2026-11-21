# Avaliação

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/seccoes/avaliacao.html

Como se calcula a nota, quando e onde são as provas e as regras, prontos a colar na página de avaliação.

Tema das pré-visualizações

Padrão

Compacto (compact)

Com serifa (serif)

Alto contraste (high-contrast)

O código copiado é o mesmo em todos: o tema escolhe-se uma vez, no [course.js](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/criar-tema.md#temas-prontos).

## Fórmula da nota

Os pesos escrevem-se em `<data>`; o kit gera a fórmula e uma barra com as proporções.

### Simples

Exemplo (fórmula da nota), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/sections/grading-simple.html):

```html
<uc-grading heading="Como é calculada a nota">
  <ul>
    <li data-code="T"><data value="40">40 %</data> Trabalhos práticos</li>
    <li data-code="E" data-min="8"><data value="60">60 %</data> Exame final</li>
  </ul>
</uc-grading>
```

### Com simulador

Exemplo (fórmula da nota com simulador), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/sections/grading-calculator.html):

```html
<uc-grading heading="Como é calculada a nota" calculator>
  <ul>
    <li data-code="Q"><data value="10">10 %</data> Quizzes semanais</li>
    <li data-code="T"><data value="30">30 %</data> Trabalho prático</li>
    <li data-code="E" data-min="8"><data value="60">60 %</data> Exame final. <span>Sem consulta.</span></li>
  </ul>
</uc-grading>
```

- `data-min` marca a nota mínima de uma componente; `calculator` acrescenta o simulador.
- Componente: [`<uc-grading>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-grading.md), que também aceita subcomponentes e várias fórmulas.

## Cartão de uma prova

A data, a duração, os turnos e as salas vêm do prazo `teste` do `course.js`; dentro escrevem-se as regras da prova.

Exemplo (cartão de prova), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/sections/assessment-card.html):

```html
<uc-assessment-info deadline="teste" calendar>
  <ul class="uc-bullets">
    <li>Sem consulta; traz o cartão de estudante.</li>
    <li>Matéria: semanas 1 a 10.</li>
  </ul>
</uc-assessment-info>
```

- Mude `deadline="teste"` para o `id` do seu prazo.
- Componente: [`<uc-assessment-info>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-assessment-info.md).

## Datas e regras

A tabela de todas as provas com o estado de cada uma, ao lado das regras gerais.

Exemplo (datas e regras de avaliação), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/sections/assessment-dates.html):

```html
<div class="uc-split">
  <uc-deadlines view="table" heading="Datas"></uc-deadlines>
  <section class="uc-section" aria-labelledby="regras">
    <h2 id="regras">Regras</h2>
    <ul class="uc-checklist">
      <li>Os trabalhos são individuais.</li>
      <li>Entregas fora do prazo não são aceites.</li>
      <li>O recurso substitui apenas a nota do exame.</li>
    </ul>
  </section>
</div>
```

- Componente: [`<uc-deadlines>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-deadlines.md) com `view="table"`; bloco `uc-checklist`.
