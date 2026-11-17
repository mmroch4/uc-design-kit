# Cor

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/cor.html

Cinzentos neutros, uma cor de destaque e três cores de estado. A cor de destaque é a única que uma cadeira costuma mudar; as outras derivam dela ou ficam como estão.

## A paleta

Quase tudo numa página do kit é preto, cinzento ou branco. A cor aparece onde há uma ação ou um estado: um link, a semana atual, um prazo de avaliação, uma resposta certa. Com tão pouca cor, a que aparece chama a atenção.

Cada cor é um token. Os valores abaixo são lidos do `uc-kit.css` quando a página abre; sem JavaScript mostram-se os valores por omissão.

## Neutras

Quatro tons de texto, do mais forte ao mais discreto, uma cor de borda e três superfícies.

- Texto `--uc-color-text` #18181B
- Texto secundário `--uc-color-text-secondary` #3F3F46
- Texto discreto `--uc-color-text-muted` #52525B
- Texto subtil `--uc-color-text-subtle` #6E6E77
- Borda `--uc-color-border` #E4E4E7
- Superfície `--uc-color-surface` #FFFFFF
- Superfície cinzenta `--uc-color-surface-muted` #F4F4F5
- Superfície rebaixada `--uc-color-surface-sunken` #FAFAFA

O texto principal usa `text`; os parágrafos de introdução e o conteúdo das semanas usam `text-secondary`, um pouco mais leve; datas e metadados usam `text-muted`. O `text-subtle` fica para rótulos curtos sobre fundo branco.

## Cor de destaque

- Destaque `--uc-color-accent` #1D4ED8
- Destaque forte `--uc-color-accent-strong` #143797
- Destaque suave `--uc-color-accent-soft` #EDF1FC
- Realce `--uc-color-highlight` #F4F6FD
- Texto sobre o destaque `--uc-color-on-accent` #FFFFFF

A cor de destaque marca links, o item ativo da navegação, os botões principais, a borda de `uc-card--accent` e o anel de foco. Muda-se no `course.js`:

`course.js`:

```js
window.UC_COURSE = {
  title: "Algoritmos e Programação",
  accentColor: "#0F766E",
  // …
};
```

O kit põe o valor em `--uc-color-accent`. As variantes não se escrevem à mão: o `uc-kit.css` calcula-as com `color-mix()`, por isso acompanham qualquer cor de destaque.

`uc-kit.css`:

```css
--uc-color-accent-strong: color-mix(in srgb, var(--uc-color-accent) 70%, #000);
--uc-color-accent-soft: color-mix(in srgb, var(--uc-color-accent) 8%, #fff);
--uc-color-highlight: color-mix(in srgb, var(--uc-color-accent) 5%, #fff);
```

Com `accentColor: "#0F766E"`:

Exemplo (outra cor de destaque), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/styles/accent.html):

```html
<p>Os <a href="#">links</a>, os botões principais, as etiquetas de destaque e a borda do cartão seguem a cor de destaque.</p>
<p>
  <a class="uc-button uc-button--primary" href="#">Enunciado</a>
  <a class="uc-button" href="#">Testes</a>
  <span class="uc-tag uc-tag--accent">Novo</span>
</p>
<div class="uc-card uc-card--accent">
  <strong>Projeto 2</strong>
  <span class="uc-muted">Entrega a 9 de janeiro.</span>
</div>
```

Uma variante também se pode fixar no `theme.css` (`--uc-color-accent-soft: #E6F4F1`), mas deixa de acompanhar o destaque. Para experimentar cores e ver o contraste, ver o [Personalizador de tema](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/tema.md).

## Cores de estado

- Aviso: texto `--uc-color-warning-text` #92400E
- Aviso: fundo `--uc-color-warning-bg` #FEF3C7
- Aviso: painel `--uc-color-warning-surface` #FFFBEB
- Aviso: borda `--uc-color-warning-border` #FDE68A
- Sucesso: texto `--uc-color-success-text` #166534
- Sucesso: fundo `--uc-color-success-bg` #DCFCE7
- Erro: texto `--uc-color-danger-text` #991B1B
- Erro: fundo `--uc-color-danger-bg` #FEE2E2

- **Aviso** (âmbar): avaliação e novidades. Avaliação é `uc-tag--warning`; os painéis de [`<uc-event>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-event.md) e `uc-callout--warning` usam `warning-surface` e `warning-border`.
- **Sucesso** (verde): respostas certas em [`<uc-question>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-question.md), exercícios marcados como feitos, testes que passam. Feito é `uc-tag--success`.
- **Erro** (vermelho): testes que falham e erros de execução em [`<uc-code>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-code.md).

As cores de estado nunca são o único sinal: uma etiqueta tem texto, um teste que falha tem uma marca e uma mensagem. Quem não distingue verde de vermelho lê o mesmo.

## Contraste

Texto normal precisa de um contraste de pelo menos **4,5:1** com o fundo (WCAG 2.1, nível AA). Todos os pares de texto do kit cumprem. A tabela calcula o contraste com as cores desta página:

| Amostra | Texto sobre fundo | Onde | Contraste | 4,5:1 |
| --- | --- | --- | --- | --- |
| Aa | `text` sobre `surface` | Texto principal | 17,72:1 | Cumpre |
| Aa | `text-secondary` sobre `surface` | Parágrafos | 10,44:1 | Cumpre |
| Aa | `text-muted` sobre `surface` | Metadados | 7,73:1 | Cumpre |
| Aa | `text-muted` sobre `surface-sunken` | Cabeçalhos de tabela | 7,41:1 | Cumpre |
| Aa | `text-subtle` sobre `surface` | Rótulos da navegação | 4,83:1 | Cumpre |
| Aa | `text-subtle` sobre `surface-muted` | Texto subtil sobre cinzento (evitar) | 4,40:1 | Não cumpre |
| Aa | `accent` sobre `surface` | Links | 6,70:1 | Cumpre |
| Aa | `accent` sobre `accent-soft` | Item ativo, `uc-tag--accent` | 5,93:1 | Cumpre |
| Aa | `on-accent` sobre `accent` | Botão principal | 6,70:1 | Cumpre |
| Aa | `on-accent` sobre `accent-strong` | Botão principal ao passar o rato | 10,38:1 | Cumpre |
| Aa | `warning-text` sobre `warning-bg` | `uc-tag--warning` | 6,37:1 | Cumpre |
| Aa | `success-text` sobre `success-bg` | `uc-tag--success` | 6,49:1 | Cumpre |
| Aa | `danger-text` sobre `surface` | Erros em `<uc-code>` | 8,31:1 | Cumpre |
| Aa | `danger-text` sobre `danger-bg` | Erro sobre o seu fundo | 6,80:1 | Cumpre |

O que isto pede a quem muda cores:

- A cor de destaque tem de ter 4,5:1 sobre branco, porque é a cor dos links. Cores claras (amarelo, verde-lima, azul-céu) não servem; escurece-se a cor até cumprir.
- O texto dos botões principais é `--uc-color-on-accent` (branco). Uma cor de destaque que cumpre sobre branco também cumpre com texto branco por cima.
- O `text-subtle` não chega a 4,5:1 sobre `surface-muted`: sobre fundos cinzentos usa-se `text-muted`.

Mais em [Acessibilidade](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/acessibilidade.md).
