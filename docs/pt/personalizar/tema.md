# Personalizador de tema

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/tema.html

Escolher a cor de destaque, os cantos, o tamanho e o tipo de letra e a largura do conteúdo, ver o resultado no curso de demonstração e copiar o que se cola no `course.js` e no `theme.css`.

Cada controlo muda um ou mais [tokens](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/tokens.md) do kit; a pré-visualização é o curso fictício da documentação com esses tokens aplicados. A cor de destaque vai para o [`course.js`](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/course-js.md) (nível 0); o resto vai para o `theme.css` (nível 1), que só leva os valores diferentes dos do kit.

O personalizador precisa de JavaScript. Sem ele, o `theme.css` escreve-se à mão: há um exemplo em [Sem JavaScript](#sem-javascript).

Cor de destaque

Escolher a cor num seletor

Código hexadecimal da cor

Cores sugeridas

Seis dígitos hexadecimais, por exemplo `#0F766E`. As oito cores sugeridas têm contraste suficiente com o branco.

: Ligações e botões (destaque sobre branco, branco sobre destaque) 7.2:1 AA
: Item ativo da navegação (destaque sobre o fundo suave) 6.5:1 AA

Cantos (px)

0

4

6

8

12

Tamanho da letra (px)

15

16

17

Tipo de letra

Inter

Do sistema

Largura do conteúdo (px)

960

1080

1200

1320

Página

Início

Semanas

Avaliação

Ecrã

Computador

Telemóvel

Curso fictício num ecrã de 1280 px, reduzido para caber na página.

## Resultado

Exemplo:

## O que cada controlo muda

| Controlo | Tokens | Onde se nota |
| --- | --- | --- |
| Cor de destaque | `--uc-color-accent` (por omissão `#1D4ED8`) | Ligações, item ativo da navegação, botões principais, semana atual, anel de foco. As variantes `-strong`, `-soft` e `--uc-color-highlight` são calculadas a partir dela. |
| Cantos | `--uc-radius-sm`, `-md`, `-lg` | Cartões, blocos de código e painéis (`-lg`); botões e navegação (`-md`); etiquetas e código em linha (`-sm`). |
| Tamanho da letra | `--uc-font-size-base` (16 px) | Toda a escala tipográfica, que está em `rem`. |
| Tipo de letra | `--uc-font-sans` (Inter) | Todo o texto exceto código, datas e códigos, que usam `--uc-font-mono`. A letra do sistema dispensa o download da Inter. |
| Largura do conteúdo | `--uc-content-max` (1200 px) | Largura máxima do cabeçalho, da navegação e do conteúdo de `<uc-page>`. Só se nota em ecrãs mais largos do que o valor escolhido. |

O controlo dos cantos escolhe o raio maior; os outros dois guardam a proporção do kit (6, 8 e 12 px): `-md` é dois terços e `-sm` metade, arredondados.

| Cantos | `--uc-radius-sm` | `--uc-radius-md` | `--uc-radius-lg` |
| --- | --- | --- | --- |
| 0 | 0 | 0 | 0 |
| 4 | 2px | 3px | 4px |
| 6 | 3px | 4px | 6px |
| 8 | 4px | 5px | 8px |
| 12 (por omissão) | 6px | 8px | 12px |

Os restantes tokens (neutros, cores de aviso, espaçamento) estão na página [Tokens](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/tokens.md) de Estilos; mudam-se no mesmo `theme.css`, à mão.

## Contraste

A cor de destaque é cor de texto (ligações, item ativo) e fundo de texto branco (botões principais), por isso precisa de um contraste de pelo menos 4.5:1 com o branco, o mínimo do WCAG para texto normal (nível AA). O personalizador calcula a razão com a luminância relativa do WCAG e mostra duas:

- **Ligações e botões**: destaque sobre branco, que é a mesma razão que branco sobre destaque.
- **Item ativo da navegação**: destaque sobre `--uc-color-accent-soft` (8% da cor misturada com branco), um pouco abaixo da primeira.

Abaixo de 4.5:1 aparece um aviso, também anunciado por leitores de ecrã. A página [Cor](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/cor.md) explica a paleta e as variantes calculadas.

## Aplicar o resultado

O separador **course.js** dá a linha `accentColor`, que substitui a do `course.js` (ver [Nível 0: course.js](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/course-js.md)). O separador **theme.css** dá o ficheiro com os tokens que mudaram (ver [Nível 1: tokens](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/tokens.md)); "Descarregar theme.css" guarda-o pronto a pôr na pasta do site, no lugar do `theme.css` do modelo.

O `theme.css` também inclui `--uc-color-accent` quando a cor muda, mas o `accentColor` do `course.js` prevalece sobre ele: o kit aplica-o diretamente no elemento `<html>`. Basta escolher um dos dois sítios; o modelo traz `accentColor` no `course.js`.

## Partilhar uma combinação

O endereço da página guarda as escolhas depois de `#`, por isso pode ser copiado e enviado. Por exemplo, verde-azulado, cantos de 4 px, letra do sistema e conteúdo de 1080 px:

```text
tema.html#accent=0F766E&radius=4&size=16&font=system&width=1080
```

Valores fora das opções são ignorados. "Repor" volta aos valores do kit e limpa o endereço.

## Sem JavaScript

Os controlos, a pré-visualização e o resultado precisam de JavaScript. Sem ele, o mesmo resultado escreve-se à mão: este `theme.css` corresponde ao exemplo acima, com o `accentColor: "#0F766E"` no `course.js`.

`theme.css`:

```css
:root {
  --uc-radius-sm: 2px;
  --uc-radius-md: 3px;
  --uc-radius-lg: 4px;
  --uc-font-sans: system-ui, sans-serif;
  --uc-content-max: 1080px;
}
```

## Ver também

- [Nível 1: tokens](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/tokens.md): o `theme.css` e a ordem de carregamento.
- [Nível 0: course.js](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/course-js.md): o que se muda sem CSS.
- [Tokens](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/tokens.md): a lista completa, com valores por omissão.
- [Cor](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/cor.md): a paleta e as regras de contraste.
