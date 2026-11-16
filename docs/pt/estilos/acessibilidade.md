# Acessibilidade

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/acessibilidade.html

O kit tem como objetivo o nível AA das WCAG 2.1: tudo funciona com teclado, o foco vê-se, as cores têm contraste suficiente e o conteúdo lê-se sem JavaScript. O que o kit não pode fazer é escrever bem o conteúdo: textos alternativos, títulos, ligações e ficheiros cabem a quem faz o site.

## O objetivo e como é testado

O alvo são as [WCAG 2.1](https://www.w3.org/TR/WCAG21/), nível AA, a norma de referência para os sites do setor público na União Europeia, incluindo as universidades públicas. Cada alteração ao kit passa por um teste automático que abre todas as páginas do repositório (o exemplo, o modelo, esta documentação e as suas demonstrações) num navegador e verifica:

- que o [axe-core](https://github.com/dequelabs/axe-core) não encontra violações graves ou críticas das regras WCAG 2.1 A e AA;
- que não há deslocamento horizontal numa janela de 360 px;
- que o conteúdo continua lá com o JavaScript desligado;
- que não há erros na consola nem ficheiros em falta.

Um segundo teste percorre as demonstrações de cada componente, o exemplo e o modelo como uma pessoa que usa o teclado:

- o axe-core volta a correr com todas as secções abertas, e conta também as violações moderadas e ligeiras;
- a tecla Tab chega a todos os controlos, cada um mostra o contorno de foco e nenhum prende o foco;
- o nome acessível de cada botão contém o texto que se vê nele;
- não há deslocamento horizontal a 320 px de largura nem com o texto a 200%;
- com "reduzir movimento" não há transições;
- copiar mantém o foco no botão e anuncia "Copiado"; abrir e fechar, marcar como feito, responder a uma pergunta, o menu do telemóvel e a troca de língua atualizam o estado e não perdem o foco.

Um teste automático encontra só parte dos problemas. O resto (se o texto alternativo descreve a imagem, se os títulos fazem sentido) depende do conteúdo e verifica-se à mão.

## O que o kit garante

### Teclado e foco

Tudo o que reage ao rato reage ao teclado: menus, semanas, dicas, perguntas, botões de copiar e de executar. Ligações, botões e campos mostram um contorno de 2 px na cor do curso quando recebem foco pelo teclado (`--uc-focus-ring`). O menu do telemóvel fecha com Escape e devolve o foco ao botão que o abriu.

### Estrutura da página

[`<uc-page>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-page.md) cria as regiões `header`, `nav`, `main` e `footer`, uma ligação "Saltar para o conteúdo" como primeiro elemento focável e marca a página atual na navegação com `aria-current="page"`. [`<uc-hero>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-hero.md) dá o `<h1>` da página inicial.

### Contraste

Com as cores por omissão, todo o texto tem pelo menos 4,5:1 sobre o seu fundo; o mais claro, `--uc-color-text-subtle`, tem 4,8:1 sobre branco. As etiquetas, os avisos e as caixas de sucesso e de erro também. A informação nunca está só na cor: a semana atual tem a etiqueta "Esta semana", os prazos dizem o estado por extenso.

### Sem JavaScript

O conteúdo escrito no HTML vê-se sempre, mesmo que o kit não carregue. Perde-se o que é gerado: cabeçalho, navegação, datas calculadas, prazos e avisos do `course.js`. Cada página de componente tem uma secção "Sem JavaScript" com os pormenores.

### Ecrãs pequenos e zoom

Os tamanhos de letra são em `rem` e acompanham o tamanho escolhido no navegador. Nenhuma página do kit desliza para o lado a 360 px: tabelas e blocos de código largos deslizam dentro da sua caixa, que o teclado consegue deslocar (ver [Blocos: elementos](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/elementos.md)). Os botões têm 44 px de altura (`--uc-target-min`), exceto os compactos, com 32 px.

### Movimento reduzido

Com "reduzir movimento" ligado no sistema, as transições e animações do kit passam a instantâneas e o deslocamento suave do índice dos guiões deixa de o ser.

### Anúncios

Mudanças que não se veem onde está o foco são anunciadas aos leitores de ecrã: "Copiado" depois de copiar código, a correção de uma [pergunta](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-question.md). Os botões só com ícone têm nome acessível, e as ligações que o kit gera para outros sites (plataformas, Mooshak) dizem "(site externo)".

### Língua

O kit põe no `<html lang>` a língua ativa, para os leitores de ecrã escolherem a pronúncia, e os textos que gera ("Esta semana", "Próximas datas") vêm nessa língua.

## O que cabe a quem escreve

### Texto alternativo

Cada `<img>` tem `alt`. Numa figura com informação (um diagrama, um gráfico), o `alt` diz o que a figura mostra; se for longa, a explicação vai no texto. Uma imagem só decorativa leva `alt=""`, para ser ignorada.

### Títulos por ordem

Um `<h1>` por página, depois `<h2>` para as secções e `<h3>` dentro delas, sem saltar níveis. Os leitores de ecrã navegam pelos títulos; um título escolhido pelo tamanho da letra estraga esse índice. O tamanho muda-se com CSS.

### Texto das ligações

O texto de cada ligação diz para onde vai, mesmo lido fora da frase: "Guião 10", "Enunciado do trabalho 2 (PDF)". "Aqui", "ver" ou o endereço completo não ajudam. Ligações repetidas ("PDF", "Ler") completam-se com `uc-visually-hidden`.

### Tabelas

Só para dados, não para alinhar a página (para isso há [uc-grid e uc-split](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/layout.md)). Cada tabela tem `<caption>` e cabeçalhos `<th scope="col">` ou `scope="row"`.

### Passagens noutra língua

Uma citação ou um termo noutra língua leva `lang`: `<span lang="en">`. Num site com várias línguas no `course.js`, o kit esconde os elementos com `lang` de outra língua configurada; para manter uma citação visível acrescenta-se `data-uc-keep-lang` (ver [Línguas](https://uc-design-kit.miguelrocha.dev/docs/pt/linguas.md)).

### PDF e outros ficheiros

O kit não toca nos ficheiros ligados. Slides e enunciados em PDF devem ter texto selecionável (não digitalizações), títulos e ordem de leitura; os vídeos, legendas. Na ligação, indicar o formato e o tamanho ajuda quem está no telemóvel.

### A cor do curso

O kit não verifica o `accentColor`. Como é a cor das ligações sobre branco e o fundo do texto branco dos botões principais, precisa de pelo menos 4,5:1 de contraste com branco. O azul por omissão tem 6,7:1. Ver [Cor](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/cor.md).

### Cor e posição

Nada se indica só pela cor ("os exercícios a vermelho são obrigatórios") nem só pela posição ("o botão à direita"). Uma [etiqueta](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/elementos.md) com texto ou uma palavra no próprio texto resolvem.

## Lista de verificação

Antes de publicar uma página nova, ou no início de cada ano:

- Cada imagem tem `alt`; as decorativas têm `alt=""`.
- A página tem um só `<h1>` e os títulos seguem a ordem, sem saltar níveis.
- Cada ligação faz sentido lida sozinha; nenhuma diz só "aqui".
- Cada tabela tem `<caption>` e `<th scope>`, e está dentro de um `uc-table`.
- O `<html lang>` está certo e as passagens noutra língua têm `lang`.
- Os PDF têm texto selecionável e os vídeos têm legendas.
- O `accentColor`, se mudou, tem pelo menos 4,5:1 de contraste com branco.
- Nenhuma instrução depende só da cor ou da posição.
- Percorrida só com a tecla Tab, a página mostra sempre onde está o foco e chega a todas as ligações.
- Com o zoom do navegador a 200%, nada fica cortado nem tapado.

## Como verificar

Três verificações rápidas apanham a maior parte dos problemas de conteúdo:

- **Teclado**: pôr o rato de lado e percorrer a página com Tab, Shift+Tab, Enter e Espaço.
- **Ferramentas do navegador**: o Lighthouse do Chrome ou a extensão axe DevTools listam imagens sem `alt`, títulos fora de ordem e contraste insuficiente.
- **Leitor de ecrã**: o NVDA (Windows) ou o VoiceOver (macOS, iOS) a ler a lista de títulos e de ligações mostra se a página se percebe sem a ver.

## Ver também

- [Cor](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/cor.md): os tokens de cor e o contraste.
- [Blocos: elementos](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/elementos.md): tabelas com teclado, `uc-visually-hidden`.
- [Línguas](https://uc-design-kit.miguelrocha.dev/docs/pt/linguas.md): páginas e passagens em mais de uma língua.
- [Componentes](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/index.md): cada página tem uma secção de acessibilidade própria.
