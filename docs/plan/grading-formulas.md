# Plano: avaliação configurável com várias fórmulas (`<uc-grading>`)

Estado: **aprovado pelo Miguel a 17 nov 2026, 15:25**, com a opção recomendada
em cada decisão (D6 fica para o professor). O contrato de implementação é
[`grading-api.md`](grading-api.md) (fase G0). **Implementado** nas fases G0 a
G4 (17 nov 2026); D6 continua com o professor.

Pedido (17 nov 2026): o método e a fórmula de avaliação mudam de cadeira para
cadeira, e há cadeiras com mais do que uma fórmula. Exemplo: EDados 2026/27,

```
CF = Max(0.75*E + 0.2*P + 0.05*R ; 0.65*E + 0.3*P + 0.05*R)
Aprovação: E ≥ 4.9 e CF ≥ 9.5
```

## 1. O que existe hoje

O kit já tem `<uc-grading>` (`kit/src/components/uc-grading.js`, api.md 3.6),
usado em `examples/{edados-2526,ip-2526,pc-2627,pi-2526}`. É **HTML-first**: o
docente escreve uma lista de componentes e o peso de cada uma num `<data>`; o
kit gera a fórmula, a barra de proporções, a tabela e (com `calculator`) o
simulador.

| Suporta hoje | Não suporta |
| --- | --- |
| Uma fórmula **linear** (soma pesada, pesos normalizados) | Várias fórmulas, `max`/`min` entre elas |
| Subcomponentes (P = P1 + P2; CE = 30/30/40 na PC) | Pesos que variam (P vale 4 **ou** 6 valores) |
| Mínimo por componente (`data-min`) e nota de aprovação (`pass`) | Requisitos sobre expressões (`0.7*EX/5 ≥ 4.9`) |
| Bónus (`data-bonus="10%"`) | Requisitos só de texto mostrados como requisitos ("2 de 3 concursos") |
| Simulador com mínimo e aprovação | Mostrar qual das fórmulas conta |

Orçamento: `uc-kit.js` está em **46,8 KB gzip de 48 KB**. `uc-grading` sozinho
pesa cerca de 3 KB gzip. Não há espaço para um interpretador de fórmulas no
núcleo.

## 2. Proposta em resumo

1. **Continua HTML-first** (recomendado): a fórmula fica escrita pelo docente,
   tal como aparece no diapositivo, dentro de `<uc-grading>`. Lê-se sem
   JavaScript e não há nada a sincronizar com o `course.js`.
2. **Fórmulas escritas como texto**, numa lista `data-formulas`, com uma
   linguagem pequena e segura (números, siglas, `+ - * /`, parênteses,
   `max`, `min`). Sem `eval`.
3. **Requisitos de aprovação** numa lista `data-rules`: cada um tem uma
   condição (`E >= 4.9`) ou só texto ("Comparecer a 2 dos 3 concursos"). Os
   que têm condição são verificados pelo simulador; os outros aparecem como
   "não verificado".
4. **Retrocompatível**: sem `data-formulas`, tudo funciona como hoje (pesos no
   `<data>`, `data-min`, `pass`). As páginas existentes não mudam.
5. **`uc-grading` sai do núcleo** para um módulo carregado só nas páginas que o
   usam (`kit/v1/uc-grading.js`, como já se faz com `uc-search.js`). Liberta
   ~3 KB em `uc-kit.js` e dá espaço ao interpretador.

## 3. Sintaxe proposta (HTML)

### 3.1 EDados 2026/27 (o diapositivo)

```html
<uc-grading scale="20" calculator>
  <ul>
    <li data-code="P">Prática de resolução de problemas.
      <span>Duas avaliações práticas individuais, cada uma com pelo menos 1 h 45 min.</span></li>
    <li data-code="R">Exercícios propostos no Mooshak.</li>
    <li data-code="E">Exame final.</li>
  </ul>

  <ol data-formulas>
    <li><code>CF = max(0.75*E + 0.2*P + 0.05*R; 0.65*E + 0.3*P + 0.05*R)</code>
      Conta a fórmula mais favorável.</li>
  </ol>

  <ul data-rules>
    <li><code>E >= 4.9</code> Exame com pelo menos 4,9 valores.</li>
    <li><code>CF >= 9.5</code> Nota final com pelo menos 9,5 valores.</li>
  </ul>

  <p>Os quizzes do Mooshak servem só para estudo autónomo e não contam para a nota.</p>
</uc-grading>
```

Cada componente é avaliada de 0 a 20 (`scale`, por omissão), como o
diapositivo sugere (0,75 × 20 = 15 valores, 0,2 × 20 = 4, etc.).

**O que o kit mostra:**

> **Como é calculada a nota**
>
> CF = máx(0,75 × E + 0,2 × P + 0,05 × R; 0,65 × E + 0,3 × P + 0,05 × R)
> Conta a fórmula mais favorável.
>
> | Componente | Fórmula 1 | Fórmula 2 | Mínimo |
> | --- | --- | --- | --- |
> | **P** Prática de resolução de problemas… | 4 valores · 20 % | 6 valores · 30 % | — |
> | **R** Exercícios no Mooshak | 1 valor · 5 % | 1 valor · 5 % | — |
> | **E** Exame final | 15 valores · 75 % | 13 valores · 65 % | 4,9 em 20 |
>
> **Para aprovar:** E ≥ 4,9 · CF ≥ 9,5

- Uma barra de proporções por fórmula (duas barras finas, legendadas
  "Fórmula 1" e "Fórmula 2"), `aria-hidden` como hoje: a tabela tem a mesma
  informação.
- A coluna **Mínimo** vem das regras simples do tipo `SIGLA >= número`. Regras
  mais complexas aparecem só na lista "Para aprovar".
- Os pesos por fórmula são calculados pelo kit: em cada ramo linear de
  `max`/`min`, o coeficiente de cada sigla × a sua escala. Se a fórmula não for
  "máximo/mínimo de somas pesadas" (por exemplo, tiver produtos entre siglas),
  a tabela mostra só componentes e mínimos, sem colunas de peso.

**Simulador** (com `calculator`): um campo por componente (P, R, E, de 0 a 20) e
o resultado assim:

> Fórmula 1: 12,6 · Fórmula 2: 13,1
> **Nota final (CF): 13,1 valores** (conta a Fórmula 2)
> ✓ E ≥ 4,9 · ✓ CF ≥ 9,5
> **Aprovado nesta simulação.**
> Simulação. A nota oficial é a publicada no SIGARRA.

Os requisitos levam ✓/✗ em texto (não só cor); o resultado é anunciado uma vez
300 ms depois de parar de escrever, como hoje.

**Uma dúvida no diapositivo, a confirmar com o professor:** "Minimum score of
4.9 points (35% of 14)" vinha do esquema antigo, em que E valia 14. Se agora E
é de 0 a 20, 4,9 é 24,5 % do exame. O kit aceita qualquer das leituras
(`E >= 4.9` ou `E >= 7`), mas a página deve dizer a certa.

### 3.2 Linguagem das fórmulas

- **Siglas**: as `data-code` das componentes (letras, dígitos, `_`), e os nomes
  de fórmulas anteriores (`A = …`, `B = …`, `CF = max(A; B)`).
- **Números**: `0.75` ou `0,75`. Separador de argumentos: `;` (como no
  diapositivo e nas folhas de cálculo em PT). Uma vírgula seguida de espaço
  também separa argumentos (`max(A, B)`); seguida de dígito é decimal.
- **Operadores**: `+ - * / ( )`; `×` e `·` valem como `*`. Comparações só nas
  regras: `>= > <= < =`, e também `≥ ≤`.
- **Funções**: `max(…)`, `min(…)`, com dois ou mais argumentos. Mais nenhuma
  na v1 (ver decisão D4).
- **Resultado**: a última fórmula é a nota final, salvo `result="CF"` no
  elemento. A nota é limitada a `[0, scale]` e o bónus soma-se no fim, como
  hoje.
- **Erros**: uma fórmula que não se percebe (sigla desconhecida, parêntese a
  mais) dá um aviso na consola com a posição do erro, mostra o texto do
  docente tal como está e desliga o simulador. Nunca se executa código.
- **Apresentação**: o kit reescreve a fórmula com a tipografia da língua
  (`0,75 × E`, "máx"/"max"), mas o texto original fica no HTML.

Implementação: um analisador descendente recursivo (~1 KB gzip) que produz uma
árvore; a mesma árvore serve para calcular, para extrair os pesos de cada ramo
e para escrever a fórmula bonita.

### 3.3 Regras de aprovação

```html
<ul data-rules>
  <li><code>E >= 4.9</code> Exame com pelo menos 4,9 valores.</li>
  <li><code>CF >= 9.5</code></li>
  <li>Comparecer a pelo menos 2 dos 3 concursos.</li>
</ul>
```

- Com `<code>`: condição verificada pelo simulador. Sem texto, o kit escreve a
  condição por extenso ("E ≥ 4,9").
- Sem `<code>`: só texto, mostrado na lista e marcado no simulador como "não
  verificado pelo simulador".
- `data-min="4.9"` e `pass="9.5"` continuam a funcionar e passam a ser atalhos
  para `E >= 4.9` e `CF >= 9.5`.

### 3.4 Alternativa: tudo no `course.js` (decisão D1)

O mesmo modelo, se o Miguel preferir o método na configuração:

```js
grading: {
  scale: 20,
  components: [
    { code: "P", name: "Prática de resolução de problemas" },
    { code: "R", name: "Exercícios propostos no Mooshak" },
    { code: "E", name: "Exame final" },
  ],
  formulas: ["CF = max(0.75*E + 0.2*P + 0.05*R; 0.65*E + 0.3*P + 0.05*R)"],
  rules: ["E >= 4.9", "CF >= 9.5"],
},
```

e na página `<uc-grading source="course" calculator></uc-grading>`.

**Recomendo não fazer isto na v1.** A avaliação aparece numa só página, os
textos ao lado de cada componente (duração, regras, notas) são HTML livre, e
sem JavaScript o bloco do `course.js` não se vê. A sintaxe HTML já é
configuração: o docente muda a fórmula numa linha. Se mais tarde a mesma
avaliação tiver de aparecer em várias páginas, acrescenta-se `source="course"`
sem mudar o resto (o modelo interno é o mesmo).

## 4. As outras cadeiras no mesmo esquema

**IP 2025/26** (uma fórmula linear): **não muda nada.** A página atual, com os
pesos 0,1/0,2/0,2/0,5 nos `<data>`, continua a gerar
"Nota = 0,1 × A + 0,2 × T1 + 0,2 × T2 + 0,5 × E". A regra "pode melhorar um
dos testes práticos" fica como texto; no simulador o estudante escreve a nota
melhor.

**PC 2026/27** (percentagens, subcomponentes, bónus): **não muda nada** na
fórmula (SI 25 %, CE 50 % com concursos 30/30/40, PDC 25 %, bónus até 10 %).
Ganha um requisito só de texto:

```html
<ul data-rules>
  <li>Participar em pelo menos 2 dos 3 concursos. Caso contrário, RFC (falta de componente).</li>
</ul>
```

**PI 2025/26** (fórmula escrita com componentes de 0 a 100): pode ficar como
está (pesos 70/25/5) ou ser escrita literalmente:

```html
<uc-grading scale="20" calculator>
  <ul>
    <li data-code="WP" data-scale="100">Problemas semanais no Mooshak (aulas 3 a 12).</li>
    <li data-code="PA" data-scale="100">Duas avaliações práticas no Mooshak.</li>
    <li data-code="EX" data-scale="100">Exame escrito (época normal e recurso).</li>
  </ul>
  <ol data-formulas>
    <li><code>CF = (0.7*EX + 0.25*PA + 0.05*WP) / 5</code></li>
  </ol>
  <ul data-rules>
    <li><code>0.7*EX/5 >= 4.9</code> Exame com pelo menos 4,9 valores (35 % de 14).</li>
    <li><code>CF >= 9.5</code></li>
  </ul>
</uc-grading>
```

Aqui as regras sobre expressões resolvem uma ambiguidade do original (EX é
cotado de 0 a 100, mas o mínimo está em valores de 14).

**EDados 2025/26** (página atual): não muda. A página de 2026/27 usa o exemplo
da secção 3.1.

## 5. Acessibilidade

- A fórmula é texto num `<p>`; a sigla de cada componente está ligada ao nome
  na tabela. `máx` é escrito por extenso para leitores de ecrã
  (`<abbr title="máximo">máx</abbr>`).
- Tabela com `<caption>` escondida, `<th scope>` em linhas e colunas; as
  colunas "Fórmula 1/2" têm o texto da fórmula num `aria-describedby`.
- Barras `aria-hidden`; nada só por cor (✓/✗ e "Aprovado"/"Não aprovado"
  escritos).
- Simulador: `<fieldset>`/`<legend>`, `inputmode="decimal"`, erro ligado por
  `aria-describedby`, resultado num `<output>` anunciado uma vez.
- Sem JavaScript: a lista do docente, a fórmula e as regras como escritas.
- O teste de regressão de acessibilidade (axe + snapshot ARIA) cobre os quatro
  casos.

## 6. Tamanho e carregamento

- Novo ficheiro `kit/v1/uc-grading.js`, com orçamento próprio de **6 KB gzip**
  (estimativa: componente atual ~3 KB + analisador ~1 KB + fórmulas, regras e
  simulador ~1,5 KB).
- Em `uc-kit.js` fica só um carregador genérico (~0,3 KB): quando a página tem
  `<uc-grading>`, carrega `uc-grading.js` ao lado de `uc-kit.js`. O mesmo
  carregador serve para outros blocos pesados no futuro.
- `uc-kit.js` desce de ~46,8 KB para ~44 KB, o que dá folga ao núcleo.
- Até o módulo chegar, a lista do docente está visível (é o conteúdo sem
  JavaScript). Para evitar salto de layout, o carregador junta-se à espera que
  `uc-page` já faz antes de mostrar a página (até 300 ms, como as fontes).

## 7. Fases

Cada fase numa thread nova, com handoff em `docs/plan/grading-phase-N-handoff.md`,
PR fundido com CI verde.

| Fase | Conteúdo | Critério de fim |
| --- | --- | --- |
| **G0** | Especificação final em `docs/plan/grading-api.md` (este plano + decisões), casos de teste em tabela (fórmulas válidas, inválidas, resultados esperados). | Doc fundido. |
| **G1** | Carregador de módulos e `uc-grading` movido para `kit/v1/uc-grading.js`, **sem mudar comportamento**. Orçamentos no `build.mjs`. | Testes atuais de `uc-grading` e das 4 páginas de exemplo iguais; `uc-kit.js` ≤ 45 KB. |
| **G2** | Analisador de fórmulas, `data-formulas`, `data-rules`, tabela por fórmula, barras, apresentação na língua. | Testes unitários do analisador; snapshot ARIA do exemplo EDados 26/27; axe sem erros. |
| **G3** | Simulador com várias fórmulas e regras (qual fórmula conta, ✓/✗, regras só de texto). | Testes do simulador (casos da secção 3.1 e PI); anúncio único. |
| **G4** | Documentação (guia PT "Avaliação", api.md 3.6, demos, `llms.txt`, AGENTS.md do modelo), exemplos: página de avaliação 2026/27 da EDados, regra de texto na PC, fórmula literal na PI (se D3). | `check-docs`, `check-pages` e links verdes. |

## 8. Decisões para o Miguel

| # | Pergunta | Recomendação |
| --- | --- | --- |
| **D1** | Onde vive o método de avaliação: no HTML da página ou no `course.js`? | **HTML** (secção 3.4). `source="course"` fica para depois, se for preciso. |
| D2 | Mover `uc-grading` para um módulo carregado à parte? | Sim (secção 6). É a única forma de caber no orçamento. |
| D3 | Reescrever a PI com a fórmula literal (`/5`, escala 100)? | Sim: mostra a fórmula como está na ficha e resolve a ambiguidade do mínimo. |
| D4 | Funções na v1: só `max` e `min`? | Sim. `round`, `if` ou "melhor de N" ficam para quando uma cadeira precisar. |
| D5 | Regimes alternativos (por exemplo "melhoria de nota: só exame, 100 %") como segunda lista `data-formulas` com `data-label`, e o simulador com escolha do regime? | Fica fora da v1; hoje escreve-se como texto. É uma extensão natural se o Miguel quiser. |
| D6 | Mínimo do exame na EDados 26/27: 4,9 em 20 ou 35 % (7 em 20)? | Confirmar com o professor; o kit suporta as duas. |
