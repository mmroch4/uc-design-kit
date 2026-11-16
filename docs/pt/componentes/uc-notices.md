# `<uc-notices>`

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-notices.html

Os avisos da UC, do mais recente para o mais antigo. Os avisos dos últimos dias levam a etiqueta "Novo", os mais antigos ficam recolhidos e um aviso com data futura só aparece nesse dia.

Exemplo (avisos do curso de demonstração), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-notices/basic.html):

```html
<uc-notices></uc-notices>
```

A demonstração usa um curso fictício em que hoje é 27 de novembro de 2025. Há seis avisos com data até hoje: os cinco mais recentes aparecem na lista e o sexto fica em "Avisos anteriores (1)". O aviso de 25 de novembro tem menos de sete dias e leva a etiqueta "Novo". O aviso de 1 de dezembro ainda não aparece.

## Utilização

O elemento fica vazio na página. Os avisos escrevem-se no `course.js`, cada um com a data e o texto, e opcionalmente uma segunda linha em `details`.

`index.html`:

```html
<uc-notices></uc-notices>
```

`course.js`:

```js
window.UC_COURSE = {
  title: "Algoritmos e Programação",
  notices: [
    { date: "2025-12-01", text: "Salas do teste prático afixadas" },
    { date: "2025-11-25",
      text: "Enunciado do trabalho 2 corrigido: ver a alínea 3",
      details: "A função pedida devolve uma lista, não um vetor." },
    { date: "2025-11-06",
      text: 'Notas do trabalho 1 disponíveis em <a href="avaliacao.html">Avaliação</a>' },
  ],
};
```

A ordem no ficheiro não importa: o kit ordena os avisos por data. O texto pode ter HTML simples (ligações, `<strong>`, `<code>`). As ligações dentro dos avisos são relativas à página que os mostra, não ao `course.js`; como os avisos costumam estar na página inicial, na raiz do site, isso raramente faz diferença (ver [Páginas em subpastas](https://uc-design-kit.miguelrocha.dev/docs/pt/estrutura.md#subpastas)).

## Exemplos

### Limite

`limit` diz quantos avisos aparecem na lista. Os restantes ficam em "Avisos anteriores (n)", que abre e fecha. Com `limit="0"`, todos os avisos ficam recolhidos.

Exemplo (três avisos e os restantes recolhidos), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-notices/limit.html):

```html
<uc-notices limit="3"></uc-notices>
```

### Avisos novos

`new-days` diz durante quantos dias um aviso leva a etiqueta "Novo", contando o próprio dia. Com `new-days="14"`, o aviso de 20 de novembro também é novo; com `new-days="0"`, nenhum é.

Exemplo (avisos novos nos últimos 14 dias), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-notices/new-days.html):

```html
<uc-notices limit="3" new-days="14"></uc-notices>
```

### Aviso escrito com antecedência

Um aviso com data futura fica escondido até esse dia. Pode escrever-se na sexta-feira o aviso de segunda e publicar o site de uma vez. Esta demonstração tem o mesmo `limit="3"` dos exemplos anteriores, mas abre a 2 de dezembro com `?today=2025-12-02`: o aviso de 1 de dezembro aparece no topo, com a etiqueta "Novo".

Exemplo (aviso de 1 de dezembro visível a 2 de dezembro), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-notices/future.html?today=2025-12-02):

```html
<uc-notices limit="3"></uc-notices>
```

### Título e conteúdo extra

`heading` muda o título da secção; `heading="none"` tira-o, quando a página já tem um título por cima. O que se escrever dentro do elemento fica por baixo da lista, por exemplo ligações para as regras de avaliação ou para o fórum.

Exemplo (título próprio e ligações por baixo da lista), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-notices/heading-extra.html):

```html
<uc-notices heading="Últimas notícias" limit="2">
  <a href="#">Regras de avaliação</a>
  <a href="#">Fórum da UC</a>
</uc-notices>
```

## Atributos

| Atributo | Tipo | Por omissão | Descrição |
| --- | --- | --- | --- |
| `limit` | número | `5` | Quantos avisos aparecem na lista. Os mais antigos ficam em "Avisos anteriores (n)", fechado. |
| `new-days` | número | `7` | Um aviso com menos de este número de dias leva a etiqueta "Novo". Um aviso de hoje conta como 0 dias. |
| `heading` | texto ou `none` | "Avisos" | Título da secção, num `<h2>`. Com `none`, a secção fica sem título. |
| `heading-level` | `2` a `6` | `2` | Nível do título gerado: `3` dá um `<h3>`, para quando o componente está dentro de uma secção que já tem um `<h2>`. O aspeto não muda; muda só a estrutura que os leitores de ecrã usam para navegar. |

## Configuração usada

Campos do `course.js` que o componente lê. Sem `notices`, mostra "Ainda não há avisos.".

| Campo | Para quê |
| --- | --- |
| [`notices`](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#avisos) | Os avisos: `date`, `text` e, opcional, `details`. |
| [`today`](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#campos-avancado) | Fixar o dia de hoje (demonstrações, capturas). O endereço `?today=AAAA-MM-DD` tem prioridade. |

A referência completa dos campos está em [O ficheiro course.js](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#avisos).

## Datas e ordem

- **Ordem**: do mais recente para o mais antigo, seja qual for a ordem no `course.js`.
- **Avisos futuros**: um aviso cuja data ainda não chegou não aparece nem conta para o `limit`. Aparece sozinho no próprio dia, sem voltar a publicar o site.
- **Novo**: a etiqueta aparece enquanto o aviso tiver menos de `new-days` dias. Com o valor por omissão, um aviso de quinta-feira é novo até à quarta-feira seguinte.
- **Data**: mostra-se curta, na língua ativa ("25 nov"). Um aviso com data inválida é mostrado no fim, sem data, e o kit deixa um aviso na consola.

## Personalizar

Estas classes são estáveis na versão 1 e podem ser usadas num `theme.css`. As regras do kit têm especificidade zero, por isso qualquer regra do professor ganha. O método está em [Nível 2: CSS livre](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/css.md); para mudar só cores, cantos ou letra em todo o site bastam os [tokens](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/tokens.md).

| Classe | Elemento |
| --- | --- |
| `.uc-notices` | O próprio `<uc-notices>`. |
| `.uc-notices__section`, `__heading` | A secção e o seu título. |
| `.uc-notices__list`, `__item` | A lista e cada aviso. |
| `.uc-notices__item--new` | Um aviso com a etiqueta "Novo". |
| `.uc-notices__date` | A data, à esquerda. |
| `.uc-notices__body`, `__text`, `__details` | O texto do aviso e a segunda linha. |
| `.uc-notices__badge` | A etiqueta "Novo". |
| `.uc-notices__earlier`, `__summary` | O bloco "Avisos anteriores (n)" e a linha que o abre. |
| `.uc-notices__more` | O conteúdo escrito dentro do elemento. |
| `.uc-notices__empty` | A frase "Ainda não há avisos.". |

`theme.css`:

```css
/* Avisos novos com uma barra à esquerda. */
.uc-notices__item--new {
  box-shadow: inset 3px 0 0 var(--uc-color-accent);
  padding-left: var(--uc-space-3);
}

/* Texto dos avisos em letra normal e a segunda linha mais pequena. */
.uc-notices__text { font-weight: 400; }
.uc-notices__details { font-size: var(--uc-font-size-body-sm); }
```

A etiqueta "Novo" usa `--uc-color-warning-text` e `--uc-color-warning-bg`, os mesmos tokens das etiquetas de avaliação.

## Acessibilidade

### O que o componente faz

Gera uma `<section>` com o nome do título, uma lista `<ul>` e as datas num `<time datetime>`. "Novo" é texto, não só cor. Os avisos anteriores usam `<details>` nativo, que abre com Enter ou Espaço e anuncia se está aberto.

### O que cabe a quem escreve

Avisos de uma linha que se percebam sozinhos, ligações com texto que diga para onde vão e, com `heading="none"`, um título na página logo antes do elemento.

## Sem JavaScript

Os avisos vêm do `course.js` e só aparecem com o kit. Sem JavaScript, fica visível apenas o que estiver escrito dentro do elemento. Se um aviso for indispensável (uma mudança de sala no dia do exame), convém repeti-lo no HTML da página.

## Ver também

- [`<uc-deadlines>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-deadlines.md): as próximas datas, normalmente ao lado dos avisos na página inicial.
- [`<uc-hero>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-hero.md): o título do curso, por cima dos avisos.
- [Avisos no course.js](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#avisos): os campos de cada aviso.
- Uso real: [a página inicial de Estruturas de Dados 2025/26](https://uc-design-kit.miguelrocha.dev/examples/edados-2526/index.html).
