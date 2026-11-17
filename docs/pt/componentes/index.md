# Visão geral

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/index.html

Os 14 componentes do kit, agrupados pela função que têm num site de unidade curricular. Cada um tem uma página com demonstração, código, atributos, configuração que lê e acessibilidade.

Os componentes são elementos HTML próprios (`<uc-…>`) que se escrevem diretamente nas páginas. Trabalham no DOM da página, sem shadow DOM: o conteúdo escrito pelo professor continua a ser HTML normal, o CSS do `theme.css` aplica-se a tudo e, sem JavaScript, o texto continua legível. Os que mostram datas, prazos, avisos ou a equipa leem os dados do [`course.js`](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md), por isso esses valores escrevem-se uma vez e aparecem em todas as páginas.

## Estrutura

A moldura de cada página e o título do curso.

- [**`<uc-page>`**: Cabeçalho, navegação entre páginas, rodapé e seletor de língua, tudo a partir do course.js.](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-page.md)
- [**`<uc-hero>`**: Código, título e descrição do curso no topo da página inicial.](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-hero.md)
- [**`<uc-search>`**: Um campo de pesquisa no meio da página, sobre o índice do site.](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-search.md)

## Datas e avisos

O que muda durante o semestre, escrito uma vez no course.js.

- [**`<uc-notices>`**: Avisos do mais recente para o mais antigo, com a etiqueta Novo e os antigos recolhidos.](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-notices.md)
- [**`<uc-deadlines>`**: Próximas datas em lista, ou todas numa tabela com o estado de cada uma.](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-deadlines.md)
- [**`<uc-date>`**: Uma data no meio do texto, formatada na língua ativa ou lida de um prazo.](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-date.md)

## Calendário

As semanas e as aulas do semestre, com datas calculadas.

- [**`<uc-weeks>`**: Contentor das semanas: interrupções, prazos no fim e Ir para esta semana.](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-weeks.md)
- [**`<uc-week>`**: Uma semana que abre e fecha, destacada quando é a atual.](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-week.md)
- [**`<uc-event>`**: Uma avaliação ou prazo destacado dentro ou entre semanas.](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-event.md)
- [**`<uc-this-week>`**: O cartão Esta semana da página inicial, com os prazos próximos.](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-this-week.md)
- [**`<uc-summaries>`**: Os sumários das aulas com dia da semana, ligação à semana, interrupções, aulas previstas e pesquisa.](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-summaries.md)

## Pessoas

Quem dá a cadeira, e quando.

- [**`<uc-team>`**: A equipa docente em cartões ou numa tabela, com turmas, contactos e atendimento.](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-team.md)
- [**`<uc-timetable>`**: O horário semanal por tipo de aula ou por dia, com A minha turma e o atendimento.](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-timetable.md)

## Guiões e código

Aulas práticas com exercícios, código executável e perguntas.

- [**`<uc-guide>`**: Guião de aula prática com índice, ligação à semana e progresso dos exercícios.](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-guide.md)
- [**`<uc-exercise>`**: Exercício numerado com nível, dicas, solução e Marcar como feito.](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-exercise.md)
- [**`<uc-code>`**: Código com realce, copiar e descarregar, edição e execução com testes.](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-code.md)
- [**`<uc-question>`**: Pergunta de escolha múltipla com resposta imediata e explicação.](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-question.md)

## Avaliação

Como se calcula a nota e o que é preciso saber de cada prova.

- [**`<uc-grading>`**: A fórmula, os pesos e os mínimos da nota, com um simulador opcional.](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-grading.md)
- [**`<uc-assessment-info>`**: O cartão de um teste ou exame: data, turnos, duração, local, estado e calendário.](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-assessment-info.md)

## Materiais e problemas

O que os estudantes descarregam e resolvem, a partir das listas que o professor já escreve.

- [**`<uc-materials>`**: Os materiais de cada aula, com o tipo de cada link, a data da última alteração e Novo.](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-materials.md)
- [**`<uc-problems>`**: Problemas por séries com juiz, tipo e prazo, filtros e Resolvido guardado no browser.](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-problems.md)
- [**`<uc-problem>`**: O cabeçalho de um enunciado: juiz e código, prazo, Submeter e Resolvido.](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-problem.md)

## Regras comuns

- **Atributos** em minúsculas, separados por hífen. Os booleanos valem pela presença (`open`, `no-breaks`).
- **O conteúdo escrito dentro** de um componente nunca se perde: o componente envolve-o ou acrescenta-lhe coisas, e o que não reconhece mostra tal como está.
- **Mudar de língua** volta a desenhar todos os componentes; os textos gerados ("Esta semana", "Próximas datas") vêm dos dicionários do kit, e os do professor usam `lang` (ver [Línguas](https://uc-design-kit.miguelrocha.dev/docs/pt/linguas.md)).
- **Hoje** é a data real, ou `today` no `course.js`, ou `?today=AAAA-MM-DD` no endereço. As demonstrações desta documentação fixam 27 de novembro de 2025, na semana 10 de um curso fictício.
- **As classes CSS** `uc-<componente>__…` listadas em cada página são estáveis na versão 1 e podem ser usadas num `theme.css`.
