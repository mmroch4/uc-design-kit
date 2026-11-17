# `<uc-materials>`

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-materials.html

A lista de materiais de cada aula ou capítulo, a partir da lista que o professor já escreve: cada link passa a um botão com o tipo reconhecido (PDF, notebook, GitHub, vídeo…), a data da última alteração aparece como "Atualizado a 24 nov", o que mudou há poucos dias leva "Novo" e as aulas sem material dizem "Sem material".

Exemplo (seis capítulos com diapositivos, notebook, GitHub, vídeo e código), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-materials/basic.html):

```html
<uc-materials>
  <ol>
    <li><time datetime="2025-09-15">15 set</time> Introdução e primeiros programas
      <a href="#" data-type="slides">Diapositivos</a> · <a href="https://colab.research.google.com/">Notebook</a></li>
    <li><time datetime="2025-10-06">6 out</time> Listas e fatias
      <a href="#" data-type="pdf">PDF</a> · <a href="https://github.com/">Exemplos</a></li>
    <li><time datetime="2025-10-20">20 out</time> Complexidade
      <a href="#" data-type="pdf">PDF</a> · <a href="https://www.youtube.com/">Aula gravada</a></li>
    <li>Revisões para o teste</li>
    <li><time datetime="2025-11-10">10 nov</time> Ordenação
      <a href="#" data-type="pdf">PDF</a> · <a href="#" data-type="archive">Código</a></li>
    <li><time datetime="2025-11-24">24 nov</time> Dicionários
      <a href="#" data-type="pdf">PDF</a> · <a href="#" data-type="code">Exemplo</a></li>
  </ol>
</uc-materials>
```

Na demonstração, hoje é 27 de novembro: o capítulo atualizado a 24 de novembro leva "Novo" e as revisões, sem links, dizem "Sem material".

## Utilização

Escreve-se a lista dos materiais dentro do elemento, um `<li>` por aula ou capítulo: primeiro o título, depois os links. A data da última alteração, se houver, é um `<time datetime="AAAA-MM-DD">` no início do item. Sem JavaScript, a lista aparece tal como está escrita, com links normais.

`materiais.html`:

```html
<uc-materials>
  <ol>
    <li><time datetime="2025-11-18">18 nov</time> Árvores binárias
      <a href="slides/7_arvores.pdf">Diapositivos</a> · <a href="codigo/arvores/">Código</a></li>
    <li>Revisões para o 1.º teste</li>
  </ol>
</uc-materials>
```

Com JavaScript, cada item ganha:

- **O título**: o texto antes do primeiro link. Num `<ol>`, o número da posição fica à esquerda.
- **"Atualizado a 18 nov"**, por baixo do título, na língua ativa. A data vem do `datetime`; o texto escrito ("18 nov") só se vê sem JavaScript.
- **"Novo"**, quando a data é de há menos de 7 dias (`new-days` muda o número; `0` desliga). Uma data no futuro nunca é nova.
- **Os links como botões**, à direita (por baixo, num telemóvel), cada um com um ícone do seu tipo. O texto que só separa os links ("·", "|", ",") desaparece.
- **"Sem material"**, quando o item não tem links: a aula fica na lista, sem botões.

## Exemplos

### Tipos de material

O tipo de cada link vem do endereço. Quando o endereço não diz o que é (uma página, um `#`), escreve-se `data-type` no link; o tipo calculado também é escrito em `data-type`, por isso o `theme.css` pode dar-lhe estilo.

| Tipo | Reconhecido por |
| --- | --- |
| `pdf` | `.pdf` |
| `notebook` | `.ipynb`, `colab.research.google.com` |
| `github` | `github.com`, `gitlab.com` |
| `video` | `youtube.com`, `youtu.be`, `vimeo.com`, `.mp4` |
| `archive` | `.zip`, `.tar.gz`, `.tgz` |
| `code` | `.java`, `.py`, `.c`, `.cpp`, `.h`, `.hs`, `.ml`, `.js` |
| `slides` | só com `data-type="slides"` (os diapositivos costumam ser PDF) |
| `link` | tudo o resto |

```html
<li>Grafos
  <a href="slides/10_grafos.pdf" data-type="slides">Diapositivos</a>
  <a href="https://colab.research.google.com/drive/…">Notebook</a></li>
```

### Materiais em duas línguas

Um link ou um item pode ter `lang`, como qualquer elemento, por isso os diapositivos em português e em inglês podem estar na mesma lista: cada estudante vê os da língua ativa. Um item sem links na língua ativa diz "Sem material".

```html
<li><time datetime="2025-11-26">26 nov</time>
  <span lang="pt">Tabelas de dispersão</span><span lang="en">Hash tables</span>
  <a href="slides/9_hash.pdf" lang="pt">Diapositivos</a>
  <a href="slides/9_hash_en.pdf" lang="en">Slides</a></li>
```

## Atributos

| Atributo | Tipo | Por omissão | Descrição |
| --- | --- | --- | --- |
| `new-days` | número | `7` | Durante quantos dias depois da data um item leva "Novo". `0` desliga. |
| `heading` | texto ou `none` | "Materiais" | Título da secção. Com `none`, não há título visível. |
| `heading-level` | `2` a `6` | `2` | Nível do título gerado. |

Nos links, `data-type` escolhe o tipo (ver [Tipos de material](#tipos)).

## Configuração usada

| Campo | Para quê |
| --- | --- |
| `languages` | Que links e itens se mostram num site bilingue ([Línguas](https://uc-design-kit.miguelrocha.dev/docs/pt/linguas.md)). |
| `today` | Fixar o dia de hoje, que decide o "Novo"; `?today=AAAA-MM-DD` no endereço tem prioridade ([avançado](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#campos-avancado)). |

## Personalizar

Estas classes são estáveis na versão 1 e podem ser usadas num `theme.css`. As regras do kit têm especificidade zero, por isso qualquer regra do professor ganha. O método está em [Nível 2: CSS livre](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/css.md).

| Classe | Elemento |
| --- | --- |
| `.uc-materials` | O componente (o próprio `<uc-materials>`). |
| `.uc-materials__section`, `__heading` | A secção e o seu título. |
| `.uc-materials__list` | A lista escrita pelo professor. |
| `.uc-materials__item` | Cada aula ou capítulo. |
| `.uc-materials__main`, `__title` | A coluna do título e o título. |
| `.uc-materials__meta`, `__updated`, `__date` | A linha "Atualizado a 24 nov" e a data (o `<time>` do professor). |
| `.uc-materials__new` | A etiqueta "Novo". |
| `.uc-materials__links`, `__link` | Os botões; cada um tem `data-type`. |
| `.uc-materials__empty` | O texto "Sem material". |

`theme.css`:

```css
/* Notebooks em destaque. */
.uc-materials__link[data-type="notebook"] { border-color: var(--uc-color-accent); }
```

## Acessibilidade

### O que o componente faz

Os ícones são decorativos; o tipo entra no nome acessível de cada botão depois do texto visível ("Diapositivos (PDF)"), a não ser que o texto já o diga ("PDF"). Os botões têm 44 px de altura. "Novo" e "Sem material" são texto, não só cor.

### O que cabe a quem escreve

Dar a cada link um texto que diga o que é ("Diapositivos", "Código do capítulo"), e não "aqui" ou "link", e pôr o `datetime` nas datas.

## Sem JavaScript

Aparece a lista tal como foi escrita, com as datas como texto e os links normais. Não há ícones, "Novo" nem "Sem material".

## Ver também

- [`<uc-problems>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-problems.md): as listas de problemas, por séries.
- [`<uc-summaries>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-summaries.md): os sumários das aulas.
