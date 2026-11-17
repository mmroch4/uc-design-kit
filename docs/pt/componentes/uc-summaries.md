# `<uc-summaries>`

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-summaries.html

Os sumários das aulas, a partir da lista numerada que o professor já escreve: cada aula com o dia da semana, a ligação para a sua semana, as interrupções do semestre no sítio certo, a última aula dada e as aulas previstas. Com `search`, uma pesquisa que ignora maiúsculas e acentos.

Exemplo (doze sumários com pesquisa, uma interrupção e duas aulas previstas), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-summaries/basic.html):

```html
<uc-summaries search>
  <ol start="13">
    <li><time datetime="2025-10-20">20 out</time> <strong>Listas e fatias</strong>
      <p>Índices, fatias e cópia de listas. Listas de listas.</p></li>
    <li><time datetime="2025-10-22">22 out</time> <strong>Complexidade e notação O</strong>
      <p>Contar operações; melhor e pior caso; crescimento das funções.</p></li>
    <li><time datetime="2025-11-03">3 nov</time> <strong>Recursão</strong>
      <p>Caso base e chamada recursiva. A pilha de chamadas.</p></li>
    <li><time datetime="2025-11-05">5 nov</time> <strong>Recursão em listas</strong>
      <p>Soma, máximo e inversão de uma lista, de forma recursiva.</p></li>
    <li><time datetime="2025-11-10">10 nov</time> <strong>Ordenação por seleção e por inserção</strong>
      <p>Invariantes de ciclo e número de comparações.</p></li>
    <li><time datetime="2025-11-12">12 nov</time> <strong>Pesquisa binária</strong>
      <p>Pesquisa num vetor ordenado; análise da complexidade.</p></li>
    <li><time datetime="2025-11-17">17 nov</time> <strong>Ordenação por fusão</strong>
      <p>Dividir para conquistar; a função de fusão.</p></li>
    <li><time datetime="2025-11-19">19 nov</time> <strong>Quicksort</strong>
      <p>Escolha do pivô, partição e caso médio.</p></li>
    <li><time datetime="2025-11-24">24 nov</time> <strong>Dicionários</strong>
      <p>Tabelas de dispersão: chaves, colisões e custo médio.</p></li>
    <li><time datetime="2025-11-26">26 nov</time> <strong>Conjuntos e dicionários na prática</strong>
      <p>Contar palavras de um texto; agrupar por chave.</p></li>
    <li><time datetime="2025-12-01">1 dez</time> <strong>Árvores binárias</strong>
      <p>Nós, altura e percursos em profundidade.</p></li>
    <li><time datetime="2025-12-03">3 dez</time> <strong>Revisões para o teste</strong></li>
  </ol>
</uc-summaries>
```

Na demonstração, hoje é 27 de novembro: a aula de 26 de novembro é a "Última aula", as duas de dezembro são "Previstas" e a semana de estudo aparece entre 22 de outubro e 3 de novembro. Ao escrever "arvores" na pesquisa, ficam só os sumários que falam de árvores.

## Utilização

Escreve-se a lista dos sumários dentro do elemento, um `<li>` por aula. A data de cada aula é o primeiro `<time datetime="AAAA-MM-DD">` do item; o resto do item é texto livre (título, parágrafos, ligações, código). Sem JavaScript, a lista aparece tal como está escrita.

`sumarios.html`:

```html
<uc-summaries search>
  <ol>
    <li><time datetime="2025-09-16">16 set</time> <strong>Apresentação; Introdução ao Java</strong>
      <p>Programa, bibliografia, funcionamento e avaliação.</p></li>
    <li><time datetime="2025-09-19">19 set</time> <strong>Tipos básicos e operadores</strong></li>
  </ol>
</uc-summaries>
```

Com JavaScript, cada item ganha:

- **A data com o dia da semana** ("terça-feira, 16 set"), na língua ativa, numa coluna à esquerda. A data vem do `datetime`; o texto escrito ("16 set") só se vê sem JavaScript, por isso um site bilingue escreve cada data uma vez.
- **A ligação para a semana** ("Semana 7"), que abre a página `weeks` do `course.js` em `#week-7`. Não aparece quando não há página `weeks` ou a data está fora do semestre.
- **O estado**: a aula mais recente até hoje leva "Última aula"; as aulas depois de hoje levam "Prevista" e ficam mais claras. A mesma lista serve, por isso, de plano das aulas, com as datas futuras já escritas.

O número de cada aula é a sua posição na lista (ou a partir de `start` no `<ol>`) e não muda com as interrupções nem com `order="desc"`. Os itens sem `<time>` aparecem como foram escritos, sem semana nem estado.

## Exemplos

### Interrupções

Entre duas aulas que ficam de um lado e do outro de uma interrupção de `semester.breaks` aparece uma linha sem número: "Interrupção: Semana de estudo (27–31 out)". Duas interrupções seguidas dão duas linhas. Com `no-breaks` não aparecem; durante uma pesquisa ficam escondidas.

### Pesquisa

Com `search`, aparece um campo "Pesquisar nos sumários" por cima da lista. A pesquisa ignora maiúsculas e acentos ("arvores" encontra "Árvores"), realça o que encontrou e anuncia quantos sumários ficaram ("2 de 12 sumários"). Esc limpa o campo. Num site bilingue, só se procura no texto da língua ativa.

### Mais recentes primeiro

Com `order="desc"`, a aula mais recente fica no topo e os números mantêm-se. Esta demonstração tem também um título próprio e não liga às semanas (`no-weeks`).

Exemplo (sumários do mais recente para o mais antigo, com título próprio), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-summaries/desc.html):

```html
<uc-summaries order="desc" no-weeks heading="Últimas aulas">
  <ol start="19">
    <li><time datetime="2025-11-19">19 nov</time> <strong>Quicksort</strong></li>
    <li><time datetime="2025-11-24">24 nov</time> <strong>Dicionários</strong></li>
    <li><time datetime="2025-11-26">26 nov</time> <strong>Conjuntos e dicionários na prática</strong></li>
    <li><time datetime="2025-12-01">1 dez</time> <strong>Árvores binárias</strong></li>
  </ol>
</uc-summaries>
```

### Sumários em duas línguas

Um item pode ter `lang`, como qualquer elemento: só os itens da língua ativa contam para a numeração, para a "Última aula" e para a pesquisa. Também se pode traduzir dentro do item, com `<span lang="pt">` e `<span lang="en">`; a data, essa, escreve-se uma vez.

```html
<li><time datetime="2025-11-25">25 nov</time>
  <strong lang="pt">Árvores binárias de pesquisa</strong>
  <strong lang="en">Binary search trees</strong></li>
```

## Atributos

| Atributo | Tipo | Por omissão | Descrição |
| --- | --- | --- | --- |
| `search` | booleano | ausente | Acrescenta o campo de pesquisa. |
| `order` | `asc` ou `desc` | `asc` | Com `desc`, a aula mais recente aparece primeiro; os números não mudam. |
| `no-breaks` | booleano | ausente | Não mostra as interrupções. |
| `no-weeks` | booleano | ausente | Não liga cada aula à sua semana. |
| `heading` | texto ou `none` | "Sumários" | Título da secção. Com `none`, não há título visível. |
| `heading-level` | `2` a `6` | `2` | Nível do título gerado. |

## Configuração usada

| Campo | Para quê |
| --- | --- |
| `semester` | A semana de cada aula ("Semana 7") e as interrupções entre aulas ([semestre](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#campos-semestre)). |
| `pages` | A página `weeks`, destino das ligações "Semana 7" ([páginas](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#paginas)). |
| `today` | Fixar o dia de hoje, que decide a "Última aula" e as "Previstas"; `?today=AAAA-MM-DD` no endereço tem prioridade ([avançado](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#campos-avancado)). |

## Personalizar

Estas classes são estáveis na versão 1 e podem ser usadas num `theme.css`. As regras do kit têm especificidade zero, por isso qualquer regra do professor ganha. O método está em [Nível 2: CSS livre](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/css.md).

| Classe | Elemento |
| --- | --- |
| `.uc-summaries` | O componente (o próprio `<uc-summaries>`). |
| `.uc-summaries__section`, `__heading` | A secção e o seu título. |
| `.uc-summaries__search` | O parágrafo com o rótulo e o campo de pesquisa. |
| `.uc-summaries__list` | A lista escrita pelo professor. |
| `.uc-summaries__item`, `--last`, `--planned` | Cada aula; a última dada e as previstas. |
| `.uc-summaries__aside`, `__body` | A coluna da data e o resto do item. |
| `.uc-summaries__number` | O número da aula. |
| `.uc-summaries__date` | A data (o `<time>` do professor). |
| `.uc-summaries__week` | A ligação "Semana 7". |
| `.uc-summaries__state` | As etiquetas "Última aula" e "Prevista". |
| `.uc-summaries__break` | A linha de uma interrupção. |
| `.uc-summaries__mark` | O texto realçado pela pesquisa. |
| `.uc-summaries__empty` | A linha "Nenhum sumário encontrado." |

`theme.css`:

```css
/* Coluna da data mais larga, para datas em inglês com o ano. */
uc-summaries { --uc-summaries-date-width: 12rem; }
```

## Acessibilidade

### O que o componente faz

A lista continua a ser uma lista, com as datas em `<time>`. Os estados são texto ("Última aula", "Prevista"), não só cor, e as aulas previstas ficam mais claras sem perder contraste. O campo de pesquisa tem rótulo visível, filtrar não lhe tira o foco e o número de resultados é anunciado quando se para de escrever.

### O que cabe a quem escreve

Pôr o `datetime` em todas as datas e começar cada item pelo título da aula, num `<strong>`, para que a lista se leia bem também sem JavaScript.

## Sem JavaScript

Aparece a lista numerada tal como foi escrita, com as datas como texto. Não há dia da semana, semanas, estados, interrupções nem pesquisa.

## Ver também

- [`<uc-weeks>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-weeks.md): as semanas do semestre, também numa vista compacta.
- [`<uc-week>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-week.md): o destino das ligações "Semana 7".
