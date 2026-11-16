# Browsers e limites

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/referencia/browsers.html

Onde o kit funciona, o que muda quando uma página é aberta do disco ou sem rede, e o que fica deliberadamente de fora.

## Browsers suportados

As versões atuais de Chrome, Edge, Firefox e Safari, no computador e no telemóvel. O kit usa CSS e JavaScript recentes sem alternativas para browsers antigos; as funcionalidades mais exigentes são estas:

| Funcionalidade | Para quê | Chrome / Edge | Firefox | Safari |
| --- | --- | --- | --- | --- |
| `color-mix()` | As variantes da cor de destaque | 111 | 113 | 16.2 |
| *Container queries* | As duas colunas do `<uc-guide>` | 105 | 110 | 16 |
| `:has()` | A opção escolhida no `<uc-question>` | 105 | 121 | 15.4 |
| *Custom elements*, `:where()` | Todos os componentes; especificidade zero | 88 | 78 | 14 |

Todas estas versões são de 2023 ou anteriores. Os testes automáticos do repositório correm em Chromium, no computador (1280 px) e num telemóvel (390 px), mais uma verificação a 360 px de largura.

## Sem JavaScript

O conteúdo escrito pelo professor está no HTML, por isso lê-se sempre. Sem JavaScript (ou se o kit não carregar) perde-se o que o kit calcula: a navegação e o cabeçalho do `<uc-page>`, as datas das semanas, os prazos e avisos do `course.js`, os botões. Cada página de componente tem uma secção "Sem JavaScript" com o que se vê nesse caso; o verificador de páginas confirma que cada página continua a mostrar conteúdo.

## Abrir do disco (`file://`)

As páginas funcionam abertas diretamente do disco, sem servidor: o kit é um script clássico, não um módulo, e não pede ficheiros locais com `fetch`. As exceções:

| O quê | Em `file://` |
| --- | --- |
| `<uc-this-week>` | Mostra as datas, os prazos e a ligação, mas não a matéria da semana: o browser não deixa uma página ler outra do disco. Ver [a página de semanas](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-this-week.md#pagina-de-semanas). |
| Pré-carregar a letra | Só funciona com o endereço absoluto `https://…` do kit, nunca com um caminho relativo. |
| Língua escolhida e exercícios feitos | Guardados no `localStorage`, como por HTTP, mas separados dos do site publicado. |

## Sem rede

- Com o kit carregado de `https://uc-design-kit.miguelrocha.dev`, uma página sem rede não tem estilos nem componentes. Para dar aulas offline, copie a pasta `kit/v1/` para junto do site e use caminhos relativos.
- O realce de cor dos blocos de código vem do highlight.js no cdnjs. Sem ele, o código aparece sem cores, com os mesmos botões.
- "Executar" precisa do serviço configurado (por omissão, o Codapi público) para todas as linguagens menos JavaScript, que corre no browser.

## Fora de âmbito

O kit é estático de propósito: um site é uma pasta de ficheiros que qualquer servidor serve e que se copia de um ano para o outro. Por isso não inclui, nem vai incluir na versão 1:

- Funcionalidades de servidor: autenticação, formulários que guardam respostas, notas, pesquisa no servidor.
- Tema escuro (os tokens tornam-no possível mais tarde).
- Motores no browser para outras linguagens além de JavaScript (Pyodide, CheerpJ). Podem ser acrescentados como [runners](https://uc-design-kit.miguelrocha.dev/docs/pt/referencia/runners.md).
- Um passo de compilação para o professor. As ferramentas do repositório (testes, minificação) são só para quem mantém o kit.

## Ver também

- [Acessibilidade](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/acessibilidade.md): o que o kit garante.
- [Publicar](https://uc-design-kit.miguelrocha.dev/docs/pt/publicar.md): servidor do DCC, GitHub Pages, Cloudflare.
- [Versões](https://uc-design-kit.miguelrocha.dev/docs/pt/referencia/versoes.md).
