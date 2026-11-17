# Estruturas de Dados 2025/26

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/exemplos/edados.html

O site completo de Estruturas de Dados (CC1007, DCC/FCUP), refeito com o kit a partir do site original: seis páginas principais, catorze guiões, 65 enunciados de problemas e o código das aulas. É o caso real que serviu para desenhar o kit e que o testa a cada alteração.

[Abrir o site](https://uc-design-kit.miguelrocha.dev/examples/edados-2526/index.html) [Ver o código](https://github.com/mmroch4/uc-design-kit/tree/main/examples/edados-2526)

> O conteúdo deste exemplo (textos, guiões, enunciados, slides e código das aulas) é do Prof. Fernando Silva e foi copiado do [site original](https://www.dcc.fc.up.pt/~fds/aulas/EDados/2526/) só para demonstrar o kit. Não está abrangido pela licença MIT: ver o [NOTICE.md](https://github.com/mmroch4/uc-design-kit/blob/main/examples/edados-2526/NOTICE.md). Use-o como referência de estrutura, não como conteúdo a copiar.

## O site

![Página inicial de Estruturas de Dados: título do curso, cartão Esta semana com a semana 10, avisos e próximas datas.](https://uc-design-kit.miguelrocha.dev/docs/assets/img/edados-home.webp)

*Início: `<uc-hero>`, `<uc-this-week>`, `<uc-notices>` e `<uc-deadlines>`.*

![Página de semanas: doze semanas com datas calculadas e a interrupção de 27 a 31 de outubro.](https://uc-design-kit.miguelrocha.dev/docs/assets/img/edados-weeks.webp)

*Semanas: datas calculadas a partir do `course.js`.*

![Página de avaliação: fórmula da nota, cartões das componentes e lista de datas.](https://uc-design-kit.miguelrocha.dev/docs/assets/img/edados-assessment.webp)

*Avaliação: blocos CSS e estilos próprios no `theme.css`.*

![Enunciado do problema ED088, Jogo da Vida, com o texto migrado do site original.](https://uc-design-kit.miguelrocha.dev/docs/assets/img/edados-problem.webp)

*Um enunciado migrado: HTML antigo dentro de `uc-content`.*

## Páginas e o que usam

| Página | Componentes | Blocos e notas |
| --- | --- | --- |
| [`index.html`](https://uc-design-kit.miguelrocha.dev/examples/edados-2526/index.html) | `<uc-hero>`, `<uc-this-week>`, `<uc-notices>`, `<uc-deadlines>`, `<uc-team>` | `uc-split` para as duas colunas, `uc-shortcuts` para os atalhos. |
| [`semanas.html`](https://uc-design-kit.miguelrocha.dev/examples/edados-2526/semanas.html) | `<uc-weeks>`, `<uc-week>` | Um `<uc-week>` por semana, com os sumários e links para os guiões e slides. |
| [`avaliacao.html`](https://uc-design-kit.miguelrocha.dev/examples/edados-2526/avaliacao.html) | `<uc-deadlines view="table">` | `uc-grid`, `uc-card`, `uc-callout`, `uc-checklist`, `uc-table`. |
| [`materiais.html`](https://uc-design-kit.miguelrocha.dev/examples/edados-2526/materiais.html) | — | Tabela de slides com botões PT/EN (`uc-button--sm`), `uc-links`, cartões da bibliografia. |
| [`horarios.html`](https://uc-design-kit.miguelrocha.dev/examples/edados-2526/horarios.html) | `<uc-team view="table">` | Cartões das turmas, `uc-tag`, `uc-table`. |
| [`sobre.html`](https://uc-design-kit.miguelrocha.dev/examples/edados-2526/sobre.html) | — | Programa numerado, `uc-bullets`, `uc-tag`. |
| [`guioes/aula01–12.html`](https://uc-design-kit.miguelrocha.dev/examples/edados-2526/guioes/aula10.html) | `<uc-guide>`, `<uc-exercise>`, `<uc-code>`, `<uc-question>` | Dicas e soluções (`uc-hint`, `uc-solution`), código que corre na página com testes; a aula 10 usa o componente próprio `<uc-bst-traversal>`. |
| [`guioes/teste-pratico-*.html`](https://uc-design-kit.miguelrocha.dev/examples/edados-2526/guioes/teste-pratico-1.html) | `<uc-guide>`, `<uc-exercise>` | Os enunciados dos testes práticos de anos anteriores. |
| [`problemas/`](https://uc-design-kit.miguelrocha.dev/examples/edados-2526/problemas/index.html) | — | 65 enunciados migrados dentro de `uc-content`, com `<pre data-copy>` na maioria dos exemplos de entrada e saída. |
| `codigo/` | `<uc-code collapsible>` | Uma página por aula com o código das teóricas e os ficheiros `.java` para descarregar. |

Todas as páginas usam `<uc-page>`. As que não estão na navegação (guiões, problemas, código) dizem qual é o item ativo com `current`: ver [páginas em subpastas](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-page.md#subpastas).

## O `course.js`

Num único ficheiro, [`course.js`](https://github.com/mmroch4/uc-design-kit/blob/main/examples/edados-2526/course.js), estão o que muda todos os anos e o que aparece em várias páginas:

- Identificação: `code`, `title`, `tagline`, `edition`, `institution` e `accentColor: "#1D4ED8"`.
- O semestre (início, 12 semanas, a semana de estudo de 27 a 31 de outubro), de onde saem as datas de todas as semanas.
- Seis páginas na navegação e duas plataformas (Mooshak e SIGARRA).
- A equipa (cinco pessoas, com turmas e gabinete), mostrada no início e nos horários.
- Os prazos (testes, entregas, exame) e os avisos, que aparecem no início, na avaliação e dentro das semanas certas.

Para o ano seguinte, copia-se a pasta e muda-se sobretudo este ficheiro: ver [Novo ano letivo](https://uc-design-kit.miguelrocha.dev/docs/pt/novo-ano.md).

## Personalização

O exemplo usa quatro dos cinco [níveis de personalização](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/index.md):

| Nível | No exemplo |
| --- | --- |
| 0: `course.js` | A cor de destaque, as páginas e as plataformas. |
| 2: CSS livre | O [`theme.css`](https://github.com/mmroch4/uc-design-kit/blob/main/examples/edados-2526/theme.css) tem estilos próprios por página (fórmula da avaliação, programa numerado, navegação entre guiões), escritos só com tokens, por isso mudam de cor com `accentColor`. |
| 3: componentes próprios | [`extensions/uc-bst-traversal.js`](https://github.com/mmroch4/uc-design-kit/tree/main/examples/edados-2526/extensions): uma demonstração interativa dos percursos numa árvore binária, na aula 10. Ver [o caso real do nível 3](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/componentes.md#caso-real). |
| 4: HTML livre | Os enunciados, as páginas de ajuda e o código das aulas: HTML do site antigo dentro de `<uc-page>` (ver [abaixo](#migracao)). |

Há mais sobre estas escolhas em [Personalizar: o caso real](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/index.md#caso-real).

## Migrar um site antigo

O site original tinha dezenas de páginas em HTML simples. Em vez de as reescrever, os enunciados, as páginas de ajuda e o código das aulas foram copiados quase como estavam para dentro de `<uc-page>` e de um `<div class="uc-content">`, que dá espaçamento e tipografia a HTML sem classes. Só as páginas que os estudantes usam todas as semanas (início, semanas, guiões) foram reescritas com componentes. Ver [Nível 4: HTML livre](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/html.md#uc-content).

Os resultados, presenças e turnos da avaliação, com dados de alunos, não foram copiados: as páginas ligam ao site original.

Para fazer o mesmo com um assistente de programação, ver [Migrar um site existente](https://uc-design-kit.miguelrocha.dev/docs/pt/migrar.md).

## Ver também

- [Todos os exemplos](https://uc-design-kit.miguelrocha.dev/docs/pt/exemplos/index.md), incluindo [Competitive Programming](https://uc-design-kit.miguelrocha.dev/docs/pt/exemplos/pc.md) e [Introduction to Programming](https://uc-design-kit.miguelrocha.dev/docs/pt/exemplos/ip.md).
- [Padrões de página](https://uc-design-kit.miguelrocha.dev/docs/pt/exemplos/padroes.md): as mesmas estruturas, com o curso fictício, prontas a copiar.
- [Criar o meu site](https://uc-design-kit.miguelrocha.dev/docs/pt/criar-site.md) a partir do modelo.
