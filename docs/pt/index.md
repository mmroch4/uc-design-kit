# Introdução

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/index.html

O UC Design Kit é um conjunto de componentes e estilos para o site de uma unidade curricular. O conteúdo fica em HTML escrito à mão, os valores que mudam todos os anos ficam num único `course.js`, e o site funciona em qualquer servidor de ficheiros estáticos.

## Para que serve

Um site de UC tem quase sempre as mesmas partes: uma página inicial com avisos e próximas datas, o calendário das semanas, as regras de avaliação, os materiais, os horários e a equipa, e guiões de aulas práticas com código. O kit dá peças prontas para cada uma delas, com o mesmo aspeto e o mesmo comportamento em todas as cadeiras que o usem.

É feito para professores que sabem escrever HTML e preferem continuar a fazê-lo: não há editor, base de dados nem instalação. Copia-se uma pasta, edita-se um ficheiro de configuração e escreve-se o conteúdo.

## O problema

Todos os anos o site da cadeira é copiado do ano anterior e corrigido à mão: as datas de cada semana, os prazos repetidos em três páginas, o aviso "esta semana" que alguém se esquece de mudar. Com o tempo, cada cadeira acaba com um site diferente, difícil de ler no telemóvel e que só uma pessoa sabe manter.

- **As datas calculam-se.** As semanas são numeradas a partir do início do semestre, saltando as interrupções; a semana atual e os prazos próximos aparecem sozinhos.
- **Cada dado escreve-se uma vez.** Um prazo definido no `course.js` aparece na página inicial, na semana certa e na página de avaliação.
- **Um ano novo é uma cópia.** Copia-se a pasta (`2526` para `2627`), muda-se o início do semestre, os prazos e os avisos, e o resto acompanha.

## Princípios

- **Estático.** Só HTML, CSS e JavaScript. Funciona no `~/public_html` do departamento, no GitHub Pages ou aberto do disco, sem passo de compilação.
- **Conteúdo em HTML.** O professor escreve HTML normal com alguns elementos próprios ([`<uc-week>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-week.md), [`<uc-deadlines>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-deadlines.md)…). Sem JavaScript, o conteúdo continua legível.
- **Um ficheiro de configuração.** O `course.js` guarda o que muda de ano para ano ou aparece em mais de uma página: título, semestre, equipa, prazos, avisos.
- **Copiar a pasta.** Cada ano letivo é uma pasta independente; o kit é carregado de um endereço fixo e não se copia.
- **Bilingue quando se quer.** Uma ou mais línguas por site, na mesma página ou num ficheiro por língua.
- **Personalizável por níveis.** Da cor no `course.js` a componentes próprios, sem copiar nem alterar o kit.

## Como funciona em 30 segundos

Cada página carrega o CSS do kit, o `course.js` do curso e o JavaScript do kit, por esta ordem:

`semanas.html`:

```html
<link rel="stylesheet" href="https://uc-design-kit.miguelrocha.dev/kit/v1/uc-kit.css">
<script src="course.js"></script>
<script src="https://uc-design-kit.miguelrocha.dev/kit/v1/uc-kit.js" defer></script>
```

O `course.js` descreve o curso. Basta o título; o resto acrescenta-se quando faz falta.

`course.js`:

```js
window.UC_COURSE = {
  title: "Algoritmos e Programação",
  edition: "2025/26",
  semester: { start: "2025-09-15", weeks: 12 },
  deadlines: [
    { id: "t2", title: "Entrega do trabalho 2", date: "2025-11-28", time: "23:59", kind: "submission" },
  ],
};
```

O conteúdo é HTML com os componentes do kit. Este é o resultado de três semanas, com as datas calculadas, a semana atual aberta e o prazo do `course.js` no sítio certo:

Exemplo (três semanas: passada, atual e futura), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-week/basic.html):

```html
<uc-week n="9" title="Ordenação: mergesort e quicksort">
  <dl>
    <dt>Teóricas</dt>
    <dd>Dividir para conquistar · <a href="#">slides 8</a></dd>
    <dt>Prática</dt>
    <dd><a href="#">Guião 9: ordenar um milhão de números</a></dd>
  </dl>
</uc-week>
<uc-week n="10" title="Pesquisa binária e árvores">
  <dl>
    <dt>Teóricas</dt>
    <dd>Pesquisa binária, árvores binárias de pesquisa · <a href="#">slides 9</a></dd>
    <dt>Prática</dt>
    <dd><a href="#">Guião 10: inserir e procurar numa árvore</a></dd>
  </dl>
</uc-week>
<uc-week n="11" title="Grafos: pesquisa em largura e em profundidade">
  <dl>
    <dt>Teóricas</dt>
    <dd>Representação de grafos, BFS e DFS</dd>
  </dl>
</uc-week>
```

Normalmente as páginas ficam dentro de um [`<uc-page>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-page.md), que acrescenta o cabeçalho, a navegação entre páginas e o rodapé a partir do `course.js`. O [exemplo de Estruturas de Dados](https://uc-design-kit.miguelrocha.dev/examples/edados-2526/index.html) mostra um site completo.

## O que inclui

| Função | Componentes |
| --- | --- |
| Estrutura | [`<uc-page>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-page.md) (cabeçalho, navegação, rodapé) e [`<uc-hero>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-hero.md) (título do curso) |
| Datas e avisos | [`<uc-notices>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-notices.md), [`<uc-deadlines>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-deadlines.md), [`<uc-date>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-date.md) |
| Calendário | [`<uc-weeks>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-weeks.md), [`<uc-week>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-week.md), [`<uc-event>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-event.md), [`<uc-this-week>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-this-week.md) |
| Pessoas | [`<uc-team>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-team.md) |
| Horário e avaliação | [`<uc-timetable>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-timetable.md), [`<uc-grading>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-grading.md) (fórmula, pesos e simulador da nota), [`<uc-assessment-info>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-assessment-info.md) (data, turnos e sala de uma prova) |
| Aulas e materiais | [`<uc-summaries>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-summaries.md), [`<uc-materials>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-materials.md), [`<uc-problems>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-problems.md) (séries de problemas com filtros e "Resolvido") |
| Guiões e código | [`<uc-guide>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-guide.md), [`<uc-exercise>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-exercise.md), [`<uc-code>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-code.md) (realce, edição e execução com testes), [`<uc-question>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-question.md) |

A [visão geral dos componentes](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/index.md) mostra-os todos com uma miniatura e uma linha sobre cada um.

Além dos componentes há blocos só de CSS (cartões, tabelas ordenáveis, listas de ligações em colunas, botões, chamadas, grelhas) e tokens de design (cores, letra, espaços) que se mudam num `theme.css`. Um `editions.js` partilhado liga os sites dos vários anos da mesma cadeira.

## Quando não usar

- **Quando a cadeira vive no Moodle.** Se os alunos já encontram tudo na plataforma da faculdade, um segundo site só duplica informação.
- **Quando é preciso conteúdo por aluno.** O kit não tem contas, notas nem submissões; liga para as plataformas que as têm.
- **Quando ninguém quer editar HTML.** O kit poupa trabalho a quem escreve HTML, mas não o substitui por um editor visual.

## Próximos passos

- Criar o primeiro site a partir do modelo: [Criar o meu site](https://uc-design-kit.miguelrocha.dev/docs/pt/criar-site.md), ou pedi-lo a um assistente de IA: [Usar com uma LLM](https://uc-design-kit.miguelrocha.dev/docs/pt/llm.md).
- Ver um componente documentado por inteiro: [`<uc-week>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-week.md).
- Explorar os [exemplos](https://uc-design-kit.miguelrocha.dev/docs/pt/exemplos/index.md), sites reais feitos com o kit ([Estruturas de Dados](https://uc-design-kit.miguelrocha.dev/docs/pt/exemplos/edados.md), [Competitive Programming](https://uc-design-kit.miguelrocha.dev/docs/pt/exemplos/pc.md), [Introduction to Programming](https://uc-design-kit.miguelrocha.dev/docs/pt/exemplos/ip.md) e [Programação Imperativa](https://uc-design-kit.miguelrocha.dev/docs/pt/exemplos/pi.md), em duas línguas), ou copiar um dos [padrões de página](https://uc-design-kit.miguelrocha.dev/docs/pt/exemplos/padroes.md).
- Consultar todos os campos do `course.js` em [O ficheiro course.js](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md), e, para estender o kit, a [API JavaScript](https://uc-design-kit.miguelrocha.dev/docs/pt/referencia/api-js.md). O contrato completo está no [docs/api.md](https://github.com/mmroch4/uc-design-kit/blob/main/docs/api.md).
- Pesquisar em toda a documentação com `Ctrl K` (`⌘K` no Mac) ou `/`.
