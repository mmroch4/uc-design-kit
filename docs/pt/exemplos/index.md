# Exemplos

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/exemplos/index.html

Sites reais de unidades curriculares do DCC/FCUP, refeitos com o kit a partir dos sites originais. Cada um mostra uma forma diferente de organizar uma cadeira: guiões com código executável, problem sets semanais com concursos, ou aulas práticas com centenas de problemas.

> O conteúdo destes exemplos é dos docentes de cada cadeira e foi copiado dos sites originais só para demonstrar o kit. Não está abrangido pela licença MIT: cada pasta tem um `NOTICE.md`. Use-os como referência de estrutura, não como conteúdo a copiar.

## Os sites

- [**Estruturas de Dados 2025/26**: Em português. Guiões com código Java que corre no browser, testes práticos, 65 enunciados e o código das aulas. Usa um componente próprio.](https://uc-design-kit.miguelrocha.dev/docs/pt/exemplos/edados.md)
- [**Competitive Programming 2026/27**: Só em inglês. Uma aula por semana com um problem set e prazo, concursos presenciais, avaliação com várias componentes e 52 problemas de vários juízes.](https://uc-design-kit.miguelrocha.dev/docs/pt/exemplos/pc.md)
- [**Introduction to Programming 2025/26**: Só em inglês. Teóricas com sumários, onze aulas práticas, dois testes, 107 problemas no Mooshak com filtros e marcação de resolvidos.](https://uc-design-kit.miguelrocha.dev/docs/pt/exemplos/ip.md)

## O que cada um mostra

|   | EDados | PC | IP |
| --- | --- | --- | --- |
| Línguas | PT | EN | EN |
| Semanas | `<uc-weeks>`, 12 semanas, e `<uc-summaries>` | `<uc-weeks>`, 11 aulas à terça, duas interrupções | `<uc-weeks>`, 13 semanas, e `<uc-summaries>` para as teóricas |
| Aulas práticas | `<uc-guide>` com `<uc-code>` executável | Páginas migradas em `uc-content` | `<uc-guide>` com `<uc-exercise>` |
| Problemas | `<uc-problems>` e 65 enunciados migrados | `<uc-problems>` com filtro por juiz | `<uc-problems>` com filtro por tipo |
| Avaliação | Blocos CSS e `<uc-deadlines>` | `<uc-grading>` com subcomponentes e simulador | `<uc-grading>` e `<uc-assessment-info>` |
| Personalização | Níveis 0, 2, 3 e 4 | Níveis 0, 2 e 4 | Níveis 0, 2 e 4 |

## Ver também

- [Padrões de página](https://uc-design-kit.miguelrocha.dev/docs/pt/exemplos/padroes.md): as mesmas estruturas, com o curso fictício, prontas a copiar.
- [Migrar um site existente](https://uc-design-kit.miguelrocha.dev/docs/pt/migrar.md): como estes sites foram migrados, com um assistente de programação.
