# Contribuir

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/referencia/contribuir.html

Para quem mantém o kit ou quer propor uma alteração: como o repositório está organizado, como construir e testar, como documentar e como lançar uma versão. O texto de referência é o [CONTRIBUTING.md](https://github.com/mmroch4/uc-design-kit/blob/main/CONTRIBUTING.md), em inglês.

## Princípios

1. **Nada a instalar para quem usa.** Um professor usa o kit com duas linhas no `<head>`. As ferramentas (testes, minificação) são só para quem mantém.
2. **O contrato primeiro.** O `docs/api.md` define componentes, atributos, campos, tokens, classes e a API JavaScript. Muda-se num pull request próprio, antes do código que depende dele.
3. **Um componente, um ficheiro.** `kit/src/components/uc-<nome>.js`, `kit/src/css/components/uc-<nome>.css` e uma página de teste em `tests/pages/` com todos os estados.
4. **Light DOM e scripts clássicos**, para o CSS da página se aplicar e tudo funcionar a partir de `file://`.
5. **Acessível por omissão:** WCAG 2.1 AA, teclado, foco visível, alvos de 44 px, nada transmitido só pela cor.
6. **Nunca partir uma versão publicada.** Ver [Versões](https://uc-design-kit.miguelrocha.dev/docs/pt/referencia/versoes.md).

## O repositório

| Pasta | Conteúdo |
| --- | --- |
| `kit/src/` | O código do kit: `core/`, `components/`, `css/`, `i18n/`. A ordem de junção está em `manifest.json`. |
| `kit/v1/` | O kit construído (minificado, com *source maps*). Gerado, mas guardado no repositório: o site não tem passo de compilação. |
| `docs/` | O contrato (`api.md`) e esta documentação: `pt/`, `demos/`, `assets/`, `nav.json`. |
| `examples/`, `template/` | O site real de Estruturas de Dados e o modelo inicial. |
| `tests/pages/` | Uma página por componente com todos os estados. |
| `scripts/` | Construção, verificações e lançamentos. |

## Construir e testar

```sh
npm ci                          # Playwright, axe-core and esbuild (maintainers only)
npm run build                   # kit/v1, generated docs parts, search index, template zip
npm test                        # check-docs --strict, then check-pages
npm test -- uc-week             # only the pages whose path contains "uc-week"
npm run test:update-screenshots # also writes tests/screenshots/*.png
```

| Verificação | O que confirma |
| --- | --- |
| `build:check` | O kit, as partes geradas da documentação, o índice de pesquisa e o zip do modelo correspondem às fontes; nenhuma versão congelada foi alterada. |
| `check-docs` | Navegação, títulos, links e âncoras; e cobertura: cada componente, atributo, campo do `course.js`, bloco, token, membro e evento da API, runner incluído e classe que o kit gera está na página certa. |
| `check-pages` | Em cada página (testes, exemplos, modelo, documentação e demonstrações): sem erros na consola por HTTP e em `file://`, sem ficheiros em falta, sem deslocamento horizontal a 360 px, sem violações graves do axe (WCAG 2.1 AA), conteúdo visível sem JavaScript. |

As páginas são verificadas com a data fixa de 27 de novembro de 2025 (`TEST_TODAY` muda-a). O GitHub Actions corre `build:check` e `npm test` em cada pull request; o Cloudflare Pages publica uma pré-visualização.

## Documentar uma alteração

A documentação é HTML escrito à mão, com partes geradas entre marcadores `<!-- docs:… -->` (cabeçalho, barra lateral, "Nesta página", anterior/seguinte, demonstrações e tabelas de classes) que o `npm run build` preenche. Nunca se edita dentro desses marcadores.

### Um componente novo

1. Acrescentar o componente e os atributos ao `docs/api.md`, secção 3.
2. Copiar `docs/pt/componentes/uc-week.html` para `uc-<nome>.html` e seguir o mesmo modelo: demonstração, utilização, exemplos, atributos, configuração, personalizar, acessibilidade, sem JavaScript, ver também.
3. Criar as demonstrações em `docs/demos/uc-<nome>/`, com o código marcado entre `<!-- demo:start -->` e `<!-- demo:end -->`, e usá-las com `<!-- docs:demo src="…" title="…" height="…" -->`.
4. Acrescentar a página ao `docs/nav.json` (com `"component"`), à visão geral dos componentes, e um bloco `docs:classes` em [Classes CSS estáveis](https://uc-design-kit.miguelrocha.dev/docs/pt/referencia/classes.md).
5. `npm run build` e `npm test`. O `check-docs` falha enquanto faltar a página, um atributo ou uma classe.

### Outras alterações

- Um atributo, campo do `course.js`, token ou membro da API novo: primeiro no `api.md`, depois na tabela da página correspondente. O teste diz qual.
- Uma classe nova gerada pelo kit: na tabela "Personalizar" do componente se for estável, senão na lista [Internas](https://uc-design-kit.miguelrocha.dev/docs/pt/referencia/classes.md#internas).
- Uma página nova: copiar uma página do mesmo grupo e acrescentá-la ao `nav.json`. Entra sozinha na pesquisa.
- As convenções de escrita (português europeu, ids sem acentos, links com `index.html` explícito) estão em `docs/plan/phase-1-handoff.md`.

## Pull requests

- Código, identificadores, comentários e mensagens de commit em inglês.
- Uma linha no `CHANGELOG.md`, em *Unreleased*.
- `npm test` verde antes de abrir o pull request; capturas do antes e depois quando o aspeto muda.

## Lançar uma versão

1. Mudar a versão em `package.json` e em `kit/src/core/namespace.js` (`UC.version`), e passar as notas de *Unreleased* para a nova versão no `CHANGELOG.md`.
2. `npm run build` e depois `npm run snapshot`, que copia `kit/v1/` para `kit/vX.Y.Z/` e escreve o seu `SHA256SUMS`.
3. Fundir em `main` (publicado automaticamente) e criar a etiqueta `vX.Y.Z`.
4. Voltar a pôr a versão seguinte com `-dev`.

Os pormenores de publicação (cabeçalhos de cache, domínio, espelho no jsDelivr) estão em [docs/deployment.md](https://github.com/mmroch4/uc-design-kit/blob/main/docs/deployment.md).

## Ver também

- [Versões](https://uc-design-kit.miguelrocha.dev/docs/pt/referencia/versoes.md).
- [Classes CSS estáveis](https://uc-design-kit.miguelrocha.dev/docs/pt/referencia/classes.md).
- [Questões no GitHub](https://github.com/mmroch4/uc-design-kit/issues), para reportar um problema ou propor uma ideia.
