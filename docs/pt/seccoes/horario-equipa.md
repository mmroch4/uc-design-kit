# Horário e equipa

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/seccoes/horario-equipa.html

Quando e onde são as aulas, quando há atendimento e quem dá a cadeira. Tudo vem do `course.js`: a secção só escolhe a forma.

Tema das pré-visualizações

Padrão

Compacto (compact)

Com serifa (serif)

Alto contraste (high-contrast)

O código copiado é o mesmo em todos: o tema escolhe-se uma vez, no [course.js](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/criar-tema.md#temas-prontos).

## Horário

Uma tabela por tipo de aula, ou uma lista por dia da semana.

### Por tipo de aula, com escolha de turma

Exemplo (horário com escolha de turma), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/sections/timetable-filter.html):

```html
<uc-timetable type="lecture lab" class-filter>
  <p class="uc-muted">As salas podem mudar: confirma no <a href="https://example.org/sigarra" data-auth="SIGARRA">horário oficial</a>.</p>
</uc-timetable>
```

### Por dia da semana

Exemplo (horário por dia), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/sections/timetable-days.html):

```html
<uc-timetable view="days" heading="Horário da semana">
  <p class="uc-muted">Horário completo no <a href="https://example.org/sigarra" data-auth="SIGARRA">SIGARRA</a>.</p>
</uc-timetable>
```

- Com `class-filter`, cada aluno escolhe a sua turma e a escolha fica guardada no browser.
- O parágrafo de dentro aparece por baixo do horário e é o que fica sem JavaScript: ponha lá a ligação para o horário oficial.
- Componente: [`<uc-timetable>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-timetable.md).

## Atendimento

As horas de atendimento de cada docente, com uma frase sobre o que fazer fora delas.

Exemplo (atendimento), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/sections/office-hours.html):

```html
<section class="uc-section" aria-labelledby="atendimento">
  <h2 id="atendimento">Atendimento</h2>
  <p class="uc-prose">Para dúvidas fora das aulas. Fora destas horas, escreve no fórum da UC.</p>
  <uc-timetable type="office-hours" heading="none"></uc-timetable>
</section>
```

- As horas escrevem-se em `officeHours` de cada docente da `team`; o cartão da equipa também as mostra.

## Equipa

Os docentes com o papel, as turmas e o contacto.

### Em cartões

Exemplo (equipa em cartões), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/sections/team-cards.html):

```html
<uc-team>
  <p class="uc-muted">Dúvidas sobre a matéria: no <a href="https://example.org/forum">fórum da UC</a>, para todos verem a resposta.</p>
</uc-team>
```

### Em tabela

Exemplo (equipa em tabela), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/sections/team-table.html):

```html
<uc-team view="table" heading="Docentes">
  <p class="uc-muted">Atendimento por marcação, por email.</p>
</uc-team>
```

- `role="assistant"` mostra só um papel; útil para separar as práticas das teóricas.
- Componente: [`<uc-team>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-team.md).
