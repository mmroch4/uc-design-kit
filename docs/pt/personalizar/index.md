# Visão geral

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/index.html

O kit pode ser adaptado em cinco níveis, do mais simples (mudar um campo no `course.js`) ao mais livre (escrever HTML próprio). Cada nível dá mais controlo e pede mais manutenção. Usa-se sempre o nível mais baixo que resolve o problema.

## Os cinco níveis

1. 0 [course.js](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/course-js.md)Cor, logótipo, páginas, línguas.
2. 1 [Tokens no theme.css](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/tokens.md)Cores, cantos, tipo de letra.
3. 2 [CSS livre no theme.css](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/css.md)Regras sobre as classes estáveis e classes próprias.
4. 3 [Componentes próprios](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/componentes.md)Um elemento novo em `extensions/`.
5. 4 [HTML livre](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/html.md)Qualquer HTML dentro das páginas.

Os níveis somam-se: um site típico usa o nível 0 e um `theme.css` com algumas regras dos níveis 1 e 2. A tabela resume onde fica cada um e o que custa.

| Nível | Onde | Exemplo | Quando usar | O que custa |
| --- | --- | --- | --- | --- |
| [0](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/course-js.md) | `course.js` | `accentColor: "#0F766E"` | Cor do curso, logótipo, ordem e nomes das páginas, línguas. | Nada: os campos fazem parte do contrato da versão 1 e passam de ano para ano com a pasta. |
| [1](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/tokens.md) | `theme.css`, em `:root` | `--uc-radius-lg: 4px` | Mudar o aspeto de todo o site de uma vez: cantos, letra, cores de estado. | Quase nada: os tokens são públicos e estáveis na versão 1. Cada cor nova tem de manter o contraste. |
| [2](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/css.md) | `theme.css` | `.uc-week__title { font-weight: 500; }` | Mudar uma parte de um componente, ou dar estilo a classes próprias. | Depende das classes estáveis de cada componente. Regras sobre classes internas ou sobre a estrutura do HTML gerado podem deixar de funcionar numa versão nova. |
| [3](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/componentes.md) | `extensions/*.js` e `.css` | `UC.define("uc-bst-traversal", …)` | Algo interativo que o kit não tem: uma animação, um simulador, um exercício especial. | Código JavaScript a manter pelo professor: textos nas línguas do curso, acessibilidade, alternativa sem JavaScript. |
| [4](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/html.md) | As páginas | `<div class="uc-content">…</div>` | Conteúdo que já existe em HTML, ou uma página com um aspeto muito próprio. | Perde-se o comportamento automático: datas, semana atual, prazos e textos traduzidos ficam à mão. |

Uma regra de precedência a ter presente: `accentColor` do `course.js` é aplicado diretamente no elemento `<html>` e ganha sempre a um `--uc-color-accent` escrito no `theme.css`. A cor do curso muda-se no `course.js`; quem a quiser controlar no `theme.css` tem de apagar o campo `accentColor` (o modelo traz-o preenchido).

## Que nível escolher

Começa-se pelo nível mais baixo e só se sobe quando ele não chega. Um ajuste num nível alto custa mais a manter: um campo no `course.js` continua a funcionar em todas as versões 1 do kit, uma regra CSS sobre uma classe interna não.

| Para… | Nível |
| --- | --- |
| Usar a cor da faculdade ou do departamento | [0: `accentColor`](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/course-js.md#cor) |
| Mostrar o logótipo do curso, ou nenhum | [0: `logo`](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/course-js.md#logotipo) |
| Uma página nova na navegação, ou outro nome para uma página | [0: `pages`](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/course-js.md#paginas) |
| Cantos menos redondos, outro tipo de letra, outro verde para "certo" | [1: tokens](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/tokens.md) |
| A semana atual com outro destaque, títulos noutro peso | [2: classes estáveis](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/css.md) |
| Cartões próprios (horários, componentes da nota) | [2: classes próprias com tokens](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/css.md#exemplo-classes-proprias) |
| Uma animação ou um exercício interativo de uma aula | [3: componente próprio](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/componentes.md) |
| Executar código noutro serviço (Codapi próprio, Judge0) | [Execução de código](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/execucao.md) (níveis 0 e 3) |
| Aproveitar páginas do site antigo | [4: HTML livre](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/html.md) |

Para experimentar cores, cantos e letra sem escrever CSS, o [Personalizador de tema](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/tema.md) mostra o resultado e gera o `theme.css`.

## O que o kit garante

Dentro da versão 1 (`kit/v1/`) não muda de forma incompatível nada do que está documentado:

- os campos do [`course.js`](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md);
- os atributos de cada componente e os [tokens](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/tokens.md);
- as classes listadas na secção "Personalizar" da página de cada componente e as classes de blocos (`uc-card`, `uc-table`…), descritas em [Estilos](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/index.md) e reunidas em [Classes CSS estáveis](https://uc-design-kit.miguelrocha.dev/docs/pt/referencia/classes.md);
- a [API JavaScript](https://uc-design-kit.miguelrocha.dev/docs/pt/referencia/api-js.md) usada pelos componentes próprios (`UC.define`, `UC.Element`, `UC.t`…) e o contrato dos [runners](https://uc-design-kit.miguelrocha.dev/docs/pt/referencia/runners.md).

O resto pode mudar numa versão 1 mais recente: classes que não estão nas tabelas, a estrutura do HTML que os componentes geram, o que está em `UC.internal`. Quem fixa uma versão exata (`kit/v1.0.0/`, ver [Versão do kit](https://uc-design-kit.miguelrocha.dev/docs/pt/publicar.md#versao)) só vê mudanças quando a troca. A política completa está em [Versões](https://uc-design-kit.miguelrocha.dev/docs/pt/referencia/versoes.md).

## Um caso real

O [site de Estruturas de Dados](https://uc-design-kit.miguelrocha.dev/examples/edados-2526/index.html) mostra até onde se chega sem personalizar: o `course.js` dá a cor, as páginas e os prazos, e as páginas, com HTML livre dentro de `<uc-page>`, usam só componentes e classes do kit (o [`theme.css`](https://uc-design-kit.miguelrocha.dev/examples/edados-2526/theme.css) está vazio). O componente próprio `<uc-bst-traversal>` foi escrito para esse site antes de existir o widget `<uc-widget-bst>` e ficou como [demonstração do nível 3](https://uc-design-kit.miguelrocha.dev/docs/demos/customize/bst-traversal.html). A página do [exemplo Estruturas de Dados](https://uc-design-kit.miguelrocha.dev/docs/pt/exemplos/edados.md) mostra o que cada página usa.

## Ver também

- [O ficheiro course.js](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md): todos os campos.
- [Princípios de design](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/index.md) e [Tokens](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/tokens.md).
- [Componentes](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/index.md): cada página tem uma secção "Personalizar" com as classes estáveis.
- [Execução de código](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/execucao.md): trocar o serviço que executa `<uc-code run>`.
