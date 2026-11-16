# Versões

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/referencia/versoes.html

O kit segue o [versionamento semântico](https://semver.org/) e publica cada versão principal num endereço próprio. Um site feito com a versão 1 continua a funcionar enquanto existir `kit/v1/`, mesmo que o kit evolua.

## Dois tipos de endereço

| Endereço | Conteúdo | Cache no browser |
| --- | --- | --- |
| `kit/v1/` | A versão 1 mais recente. Recebe correções e novidades no mesmo endereço. | 5 minutos; depois usa a cópia que tem e confirma em segundo plano se há uma nova. |
| `kit/v1.2.3/` | Uma versão exata, congelada: os ficheiros nunca mudam. | Um ano, sem voltar a perguntar (`immutable`). |

O mesmo endereço serve os três ficheiros (`uc-kit.css`, `uc-kit.js` e a letra pré-carregada), por isso mudar de versão é mudar a pasta nas três linhas do `<head>` de cada página, uma pesquisa e substituição. Como e quando fazê-lo num site publicado está em [Publicar: versão do kit](https://uc-design-kit.miguelrocha.dev/docs/pt/publicar.md#versao) e em [Novo ano letivo](https://uc-design-kit.miguelrocha.dev/docs/pt/novo-ano.md#kit).

As versões exatas são criadas quando há um lançamento e ficam listadas no [CHANGELOG](https://github.com/mmroch4/uc-design-kit/blob/main/CHANGELOG.md). Enquanto uma versão exata não aparecer lá, só `kit/v1/` existe. A versão carregada numa página lê-se na consola com `UC.version`.

## O que pode mudar

O contrato é o [docs/api.md](https://github.com/mmroch4/uc-design-kit/blob/main/docs/api.md). Tudo o que lá está não muda de forma incompatível dentro da versão 1.

| Alteração | Exemplos | Versão |
| --- | --- | --- |
| Correção | Um erro corrigido, um ajuste de espaçamento, uma melhoria de acessibilidade, uma tradução. | `1.0.1` |
| Novidade compatível | Um componente, atributo, campo do `course.js`, token ou classe novos; uma língua nova. | `1.1.0` |
| Alteração incompatível | Remover ou mudar o nome de um componente, atributo, campo, token, classe estável ou membro de `UC`; mudar o significado de um valor. | `2.0.0`, em `kit/v2/` |

Ficam fora do contrato e podem mudar numa correção: as [classes internas](https://uc-design-kit.miguelrocha.dev/docs/pt/referencia/classes.md#internas), a estrutura exata do HTML gerado, `UC.internal` e os valores visuais que não são tokens. Um `theme.css` que só usa tokens e classes estáveis atravessa todas as versões 1.

## Uma nova versão principal

Uma versão 2 vive em `kit/v2/`, ao lado de `kit/v1/`, que deixa de receber novidades mas continua publicada. Os sites antigos não mudam; cada professor passa para a v2 quando copiar a pasta para um ano novo, com as notas de migração do CHANGELOG.

## Registo de alterações

O [CHANGELOG.md](https://github.com/mmroch4/uc-design-kit/blob/main/CHANGELOG.md) segue o formato [Keep a Changelog](https://keepachangelog.com/en/1.1.0/): as alterações ainda não lançadas ficam em *Unreleased* e passam para a secção da versão quando ela é publicada. Cada lançamento tem também uma etiqueta `vX.Y.Z` no GitHub.

Os ficheiros publicados estão minificados e têm *source maps* (`uc-kit.js.map`, `uc-kit.css.map`) com o código original: as ferramentas do browser mostram os ficheiros de `kit/src/`, legíveis.

## Espelho no jsDelivr

Cada versão exata também está disponível no jsDelivr, que serve qualquer etiqueta de um repositório público do GitHub. Só vale a pena usá-lo se o domínio do kit estiver indisponível:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/mmroch4/uc-design-kit@v1.0.0/kit/v1.0.0/uc-kit.css">
<script src="https://cdn.jsdelivr.net/gh/mmroch4/uc-design-kit@v1.0.0/kit/v1.0.0/uc-kit.js" defer></script>
```

## Ver também

- [Publicar: cache](https://uc-design-kit.miguelrocha.dev/docs/pt/publicar.md#cache).
- [Contribuir: lançar uma versão](https://uc-design-kit.miguelrocha.dev/docs/pt/referencia/contribuir.md#lancar).
