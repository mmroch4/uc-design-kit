# Perguntas e contactos

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/seccoes/perguntas.html

As respostas às dúvidas de todos os semestres e a quem perguntar o resto.

Tema das pré-visualizações

Clássico (padrão)

Moderno (modern)

Institucional (institutional)

Manual (handbook)

Editorial (editorial)

Compacto (compact)

Com serifa (serif)

Alto contraste (high-contrast)

O código copiado é o mesmo em todos: o tema escolhe-se uma vez, no [course.js](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/criar-tema.md#temas-prontos).

## Perguntas frequentes

Cada pergunta abre a sua resposta, para a lista caber num ecrã.

### Que abrem

Exemplo (perguntas frequentes), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/sections/faq-details.html):

```html
<section class="uc-section" aria-labelledby="perguntas">
  <h2 id="perguntas">Perguntas frequentes</h2>
  <details class="uc-details">
    <summary>Posso mudar de turma prática?</summary>
    <p>Sim, até ao fim da segunda semana, se houver vagas. Pede a troca no fórum da UC.</p>
  </details>
  <details class="uc-details">
    <summary>Os trabalhos podem ser feitos em grupo?</summary>
    <p>Não. Os trabalhos são individuais; podes discutir ideias, mas o código tem de ser teu.</p>
  </details>
  <details class="uc-details">
    <summary>Tenho estatuto de trabalhador-estudante. O que muda?</summary>
    <p>Ficas dispensado da presença nas aulas práticas. A avaliação é a mesma.</p>
  </details>
</section>
```

### Em cartões

Exemplo (perguntas em cartões), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/sections/faq-cards.html):

```html
<section class="uc-section" aria-labelledby="perguntas">
  <h2 id="perguntas">Antes de perguntar</h2>
  <div class="uc-grid" style="--uc-grid-min: 240px">
    <div class="uc-card">
      <h3>Onde entrego?</h3>
      <p>Na plataforma de entregas, até às 23:59 do dia do prazo.</p>
    </div>
    <div class="uc-card">
      <h3>Falto a uma aula. E agora?</h3>
      <p>Os guiões e as soluções ficam na página da semana.</p>
    </div>
    <div class="uc-card">
      <h3>Que linguagem usamos?</h3>
      <p>Python 3.12, no computador do laboratório ou no teu.</p>
    </div>
  </div>
</section>
```

- `details.uc-details` funciona sem JavaScript; os cartões servem para três a seis perguntas curtas.
- Os cartões usam `--uc-grid-min` para a largura mínima de cada coluna.

## Contactos

Quem contactar para cada assunto, com uma nota sobre o tempo de resposta.

Exemplo (contactos), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/sections/contacts.html):

```html
<section class="uc-section" aria-labelledby="contactos">
  <h2 id="contactos">Contactos</h2>
  <div class="uc-split">
    <dl class="uc-facts">
      <dt>Coordenação</dt>
      <dd><a href="mailto:ana.ribeiro@example.org">Ana Ribeiro</a>, Gab. 2.14</dd>
      <dt>Dúvidas da matéria</dt>
      <dd>No <a href="#">fórum da UC</a>, para todos verem a resposta.</dd>
      <dt>Assuntos pessoais</dt>
      <dd>Por email, com "[AP]" no assunto.</dd>
    </dl>
    <div class="uc-callout">
      <p>Respondemos no fórum em dois dias úteis. Antes de perguntar, vê as perguntas frequentes.</p>
    </div>
  </div>
</section>
```

- Bloco `uc-facts`: etiqueta à esquerda, valor à direita, empilhados no telemóvel.
