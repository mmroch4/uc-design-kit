# Avisos e datas

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/seccoes/avisos.html

O que os alunos procuram primeiro: o que mudou, o que há esta semana e os próximos prazos.

Tema das pré-visualizações

Padrão

Compacto (compact)

Com serifa (serif)

Alto contraste (high-contrast)

O código copiado é o mesmo em todos: o tema escolhe-se uma vez, no [course.js](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/criar-tema.md#temas-prontos).

## Avisos e próximas datas

As duas listas lado a lado nos ecrãs largos, uma por baixo da outra no telemóvel. Os avisos e as datas escrevem-se só no `course.js`.

Exemplo (avisos e próximas datas), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/sections/news-split.html):

```html
<div class="uc-split">
  <uc-notices></uc-notices>
  <uc-deadlines>
    <a href="#">Regras de avaliação</a>
  </uc-deadlines>
</div>
```

- O conteúdo dentro de `<uc-deadlines>` aparece por baixo da lista: aqui, a ligação para as regras.
- Componentes: [`<uc-notices>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-notices.md), [`<uc-deadlines>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-deadlines.md).

## Esta semana, com um aviso

Um aviso que não pode passar despercebido por cima do cartão da semana atual.

Exemplo (esta semana com aviso), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/sections/news-this-week.html):

```html
<div class="uc-stack">
  <div class="uc-callout uc-callout--warning">
    <h2>Mudança de sala</h2>
    <p>A aula teórica de sexta-feira passa para o anfiteatro 2.</p>
  </div>
  <uc-this-week></uc-this-week>
</div>
```

- Tire o aviso quando deixar de ser preciso; o cartão atualiza-se sozinho todas as semanas.
- Componente: [`<uc-this-week>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-this-week.md); bloco `uc-callout--warning`.

## Aviso fixo

Para informação que fica semanas na página, como as inscrições nas turmas. A ligação com `data-auth` avisa que é preciso entrar no sistema.

Exemplo (aviso fixo), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/sections/news-banner.html):

```html
<div class="uc-callout">
  <h2>Inscrição nas turmas práticas</h2>
  <p>As inscrições abrem a 15 de setembro, às 10:00, no sistema de inscrições. Quem não se inscrever até dia 19 é colocado numa turma com vagas.</p>
  <p><a class="uc-button uc-button--sm" href="#" data-auth="SIGARRA">Inscrever-me</a></p>
</div>
```

- `uc-callout` é cinzento; `uc-callout--warning` é âmbar, para o que é urgente.
