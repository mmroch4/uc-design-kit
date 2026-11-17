# `<uc-widget-hash>`

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/uc-widget-hash.html

Uma tabela de dispersão com encadeamento, sondagem linear ou sondagem quadrática: inserir, procurar e remover, o fator de carga e o crescimento da tabela.

Exemplo (seis inserções, com botões para as três estratégias), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-widget-hash/basic.html):

```html
<uc-widget-hash values="15 8 22 4 29 11" algorithm="linear" algorithms="chaining linear quadratic">
  <p>Tabela com 7 posições, h(k) = k mod 7. Com sondagem linear, 15 fica em 1, 8 em 2,
    22 em 3, 4 em 4, 29 em 5 e 11 em 6; com 6 chaves a carga passa de 0,75 e a tabela cresce para 14.</p>
</uc-widget-hash>
```

A função de dispersão é h(k) = código(k) mod m, onde m é o tamanho da tabela e código(k) é o próprio número ou, numa palavra, a soma dos códigos dos caracteres ("ana": 97 + 110 + 97 = 304). No encadeamento, cada posição tem uma lista; na sondagem linear e quadrática, uma colisão faz tentar outras posições: (h + i) mod m ou (h + i²) mod m, para i = 0, 1, 2…

## Utilização

`values` são as chaves (até 16), números inteiros ou palavras sem espaços até 6 caracteres. Com `ops`, a tabela de `values` aparece já preenchida e as operações correm passo a passo; sem `ops`, a inserção de cada chave é a demonstração. O painel mostra o fator de carga (chaves / posições) e o contador de sondagens.

```html
<script src="https://uc-design-kit.miguelrocha.dev/widgets/v1/uc-widget-hash.js" defer></script>

<uc-widget-hash values="ana rui eva ivo" size="5" algorithm="chaining">
  <p>h(k) = soma dos códigos mod 5: ana e ivo na posição 4, rui na 1, eva na 1 depois de rui.</p>
</uc-widget-hash>
```

### Operações

Separadas por `;`, com os verbos em inglês (lêem-se como código):

| Operação | Efeito |
| --- | --- |
| `insert k` | Insere k (se já existir, não muda nada). No encadeamento, no fim da lista; na sondagem, na primeira posição vazia ou apagada da sequência de tentativas. |
| `remove k` | Remove k. No encadeamento, sai da lista; na sondagem, a posição fica marcada como apagada (✕), para que as procuras de outras chaves continuem a passar por ela. Uma inserção pode reaproveitá-la. |
| `search k` | Procura k. |

## Fator de carga e crescimento

Depois de cada inserção, se o fator de carga passar de `max-load` (0,75 por omissão), a tabela duplica de tamanho e todas as chaves voltam a entrar, uma por passo, com o novo m. A tabela não passa de 16 posições: aí a demonstração avisa e continua sem crescer. Com `max-load="none"`, a tabela nunca cresce. Na sondagem quadrática, a sequência de tentativas pode não passar por todas as posições: com uma tabela pequena e cheia, a inserção pode falhar mesmo havendo lugares vazios, o que também se vê.

Exemplo (remoção com sondagem linear e posições apagadas), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/uc-widget-hash/remove.html):

```html
<uc-widget-hash algorithm="linear" size="7" max-load="none" values="10 17 3"
                ops="insert 24; remove 17; search 24; insert 31" editable>
  <p>10, 17, 3, 24 e 31 têm todos h(k) = 3. Remover 17 deixa a posição 4 marcada
    como apagada (✕): procurar 24 passa por ela, e 31 fica nela.</p>
</uc-widget-hash>
```

## Atributos

Além dos [atributos comuns](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/usar.md#atributos-comuns):

| Atributo | Tipo | Por omissão | Descrição |
| --- | --- | --- | --- |
| `values` | inteiros ou palavras, ou `random N [MIN..MAX]` | `random 5 1..99` | As chaves, até 16. |
| `ops` | operações separadas por `;` | ausente | As operações a mostrar. |
| `size` | inteiro de 1 a 16 | `7` | O número de posições m. |
| `max-load` | número entre 0 e 4, ou `none` | `0.75` | O fator de carga acima do qual a tabela duplica. |
| `algorithm` | `chaining`, `linear`, `quadratic` | `chaining` | Encadeamento, sondagem linear ou quadrática. |

Com `editable`, o aluno muda as operações. Cada lista do encadeamento tem no máximo 6 chaves.

## Linhas do pseudocódigo

Os identificadores para marcar as linhas de um `<pre data-pseudocode>` próprio (ver [Pseudocódigo próprio](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/usar.md#pseudocodigo)); use `data-algorithm` com o nome do bloco (`data-algorithm="insert"` na sondagem, `data-algorithm="chain-insert"` no encadeamento):

| Bloco | Linhas |
| --- | --- |
| `insert` | `hash`, `empty`, `next`, `found`, `add`, `full`, `grow`, `rehash` |
| `search` | `hash`, `empty`, `found`, `next`, `full` |
| `remove` | `hash`, `empty`, `next`, `found`, `full`, `mark` |
| `chain-insert` | `hash`, `next`, `found`, `end`, `add`, `grow`, `rehash` |
| `chain-search` | `hash`, `next`, `found`, `end` |
| `chain-remove` | `hash`, `next`, `found`, `end`, `unlink` |

## Acessibilidade

### O que o widget faz

Uma frase por passo ("Tentativa 1: a posição 2 tem 15; tenta a seguinte, 3."), com o cálculo de h(k) escrito; a tabela descrita em palavras, posição a posição; estados com cor, contorno e sinal, e as posições apagadas com ✕; "Vista em texto" com uma tabela posição, chaves e estado.

### O que cabe a quem escreve

Escrever dentro do elemento a função de dispersão e onde fica cada chave, e preferir tabelas de 5 a 11 posições para que se leiam num telemóvel.

## Sem JavaScript

Aparece o texto escrito dentro do elemento e o `<pre data-pseudocode>`, se houver.

## Ver também

- [Usar widgets](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/usar.md): importar, teclado, previsões, versões.
- [Catálogo](https://uc-design-kit.miguelrocha.dev/docs/pt/widgets/index.md) dos widgets.
