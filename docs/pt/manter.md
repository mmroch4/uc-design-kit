# Manter o site

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/manter.html

Depois de cada alteração, um comando verifica o site inteiro: links e imagens que não existem, erros no `course.js`, ids repetidos, páginas sem o kit e permissões que o servidor web não consegue ler. Chama-se `uc-site.py`, vem com o modelo e só precisa de Python 3.

## Correr o script

O `uc-site.py` está na pasta do site, ao lado do `course.js`, e passa de ano para ano com o resto da pasta. Corre-se depois de cada alteração:

```sh
cd 2627
python3 uc-site.py
```

No servidor do departamento, por SSH, sem mudar de pasta (o script verifica sempre a pasta onde está):

```sh
ssh utilizador@servidor "python3 ~/public_html/aulas/minha-uc/2627/uc-site.py"
```

- Precisa de **Python 3.8 ou mais recente** (`python3 --version` diz qual há). Não instala nada, não usa a Internet e nunca altera o `course.js` nem as páginas.
- No Windows, o comando é `py uc-site.py`.
- Se o servidor não tiver Python 3, corre-se na cópia local antes de publicar: o resultado é o mesmo, exceto as permissões, que dependem do servidor.

Quando o `course.js` tem `search: true`, o mesmo comando escreve também o índice da pesquisa no site (ver [O índice da pesquisa](#indice)). O kit mostra então o botão «Pesquisar» no cabeçalho de todas as páginas (ver [Pesquisa no site](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-page.md#pesquisa)).

## Comandos e opções

| Comando | O que faz |
| --- | --- |
| `python3 uc-site.py` | Verifica tudo e, com a pesquisa ligada, escreve o índice. É o comando a usar depois de cada alteração. |
| `python3 uc-site.py check` | Só verifica. Não escreve nada. |
| `python3 uc-site.py index` | Só escreve o índice da pesquisa, sem verificar as páginas (só lê o `course.js`). |

| Opção | Efeito |
| --- | --- |
| `--site PASTA` | A pasta do site. Por omissão, a pasta onde está o script, seja qual for a pasta atual. |
| `--fix-permissions` | Dá permissão de leitura a todos os ficheiros e pastas do site que não a têm (ver [Permissões](#permissoes)). |
| `--quiet` | Mostra só os erros, e nada quando não há erros. Para o `cron`. |
| `--stdout` | Com `index`: mostra o índice no ecrã em vez de escrever o ficheiro. Para ferramentas que o queiram guardar noutro sítio. |
| `--lang pt` ou `--lang en` | Língua das mensagens. Por omissão, a primeira língua do `course.js` (inglês se não for `pt` nem `en`). |
| `--version` | A versão do script (a do kit com que saiu). |
| `--help` | Ajuda. |

## Ler o resultado

Uma linha por problema, agrupadas por ficheiro, com o número da linha quando se sabe, e um resumo no fim:

```text
UC Design Kit · uc-site.py 1.2.0 · Estruturas de Dados 2025/26 (CC1007)
ERRO   semanas.html:142     ligação para guioes/aula13.html: o ficheiro não existe
AVISO  guioes/aula04.html:31  imagem sem alt: imagens/heap.png (se for decorativa, use alt="")
INFO   codigo/Velho.html    nenhuma página liga para este ficheiro
116 páginas · 1 erro · 1 aviso · 1 informação
Índice: search-index.js (116 páginas, 685 secções, 290 KB)
```

- **ERRO**: algo que os alunos vão ver partido (um link que dá "Not Found", uma página sem o kit). Corrigir antes de publicar.
- **AVISO**: um problema de acessibilidade ou de manutenção que convém corrigir.
- **INFO**: só para saber, por exemplo uma página antiga que ficou esquecida.

A última linha só aparece com a pesquisa ligada. Os erros não impedem o índice de ser escrito: um link partido não deve tirar a pesquisa aos alunos.

O script termina com o código `0` quando não há erros (mesmo que haja avisos), `1` quando há pelo menos um erro (ou quando não conseguiu escrever o índice) e `2` quando o comando está mal escrito. Isto permite usá-lo em scripts: `python3 uc-site.py --quiet && rsync …` só publica um site sem erros.

## O que é verificado

| Verificação | Nível |
| --- | --- |
| O `course.js` lê-se ([só valores](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#so-valores)); tem `title`; cada página de `pages` existe; as datas são válidas (`AAAA-MM-DD`, e também `AAAA-MM` ou `null` nos prazos); os `id` dos prazos não se repetem; os links dentro dos avisos e os `url` locais existem | erro |
| Links (`href`) e ficheiros (`src`, `srcset`) locais existem, com as mesmas maiúsculas e minúsculas; um link para uma pasta precisa do `index.html` dessa pasta. Links externos (`https:`, `mailto:`…), âncoras (`#`) e caminhos fora da pasta do site não são verificados | erro |
| Cada página com `<uc-page>` carrega `uc-kit.css`, `course.js` e `uc-kit.js`. Páginas antigas sem o kit (copiadas tal como estavam) não precisam | erro |
| `id` repetido numa página; num site com duas línguas, `lang` com uma língua que o site não tem (o `lang` de um `<uc-code>` é a linguagem de programação e não conta) | erro |
| Falta `semester.start` (as semanas ficam sem datas); prazo sem `id` ou sem `title`, ou com um `kind` desconhecido | aviso |
| Imagem sem `alt` (`alt=""` numa imagem decorativa está certo); página sem `<h1>` (o `<uc-hero>` conta como `<h1>`); títulos que saltam um nível (`h2` → `h4`) | aviso |
| Link com caminho absoluto (`/~utilizador/…`), que deixa de funcionar quando a pasta muda de sítio | aviso |
| Ficheiro ou pasta que o servidor web não consegue ler | aviso |
| Página para a qual nenhuma outra página liga (e que não está em `pages`) | informação |
| Só com `check` e a pesquisa ligada: o índice ainda não existe, ou é mais antigo do que uma página | informação |

Os links externos não são verificados: o servidor pode não ter acesso à Internet, e seria lento.

## O índice da pesquisa

Com `search: true` no `course.js`, o script escreve na pasta do site o ficheiro `search-index.js`, com o texto de todas as páginas `.html` da pasta e das subpastas. É este ficheiro que a pesquisa do site lê: o browser nunca percorre o site sozinho, por isso o índice só está atualizado se o script correr depois de cada alteração.

`course.js`:

```js
search: true,
// ou, com opções:
search: {
  index: "search-index.js",          // nome do ficheiro (por omissão)
  exclude: ["rascunhos/", "velho.html"],
},
```

- **O que entra:** o título de cada página e o texto dividido em secções, uma por cada `<h2>` e `<h3>`, semana (`<uc-week>`), exercício, pergunta e item de lista ou artigo com `id`. Cada resultado da pesquisa leva diretamente à secção.
- **O que fica de fora:** o cabeçalho, a navegação e o rodapé (são do kit), os `<nav>`, scripts e estilos, e o código dentro de `<uc-code>` (só o nome do ficheiro entra). O texto alternativo das imagens entra.
- **Títulos sem `id`:** o script dá-lhes um a partir do texto (`Exercício 2` → `exercicio-2`), o mesmo que o kit lhes dá no browser. Um `id` escrito à mão nunca muda; convém escrevê-lo nos títulos para onde há links de fora.
- **Sites com duas línguas:** uma página com texto em `lang="pt"` e `lang="en"` entra uma vez por língua, e cada aluno só vê os resultados da língua que escolheu.
- O ficheiro é gerado: não se edita à mão. Fica com permissão de leitura para todos (`644`) e é escrito de uma vez, por isso um aluno nunca apanha meio índice.

Para deixar conteúdo de fora:

| O quê | Como |
| --- | --- |
| Uma pasta ou um ficheiro | `exclude` no `course.js`: caminhos relativos à pasta do site; um caminho que acaba em `/` é uma pasta inteira. As pastas cujo nome começa por `_` ou `.` ficam sempre de fora. |
| Uma página | `<uc-page search="noindex">` |
| Uma parte de uma página | `data-search-ignore` no elemento: ele e tudo o que tem dentro ficam de fora |

Um título comprido pode ter outro título nos resultados, com `data-search-title="…"` no título ou no elemento da secção.

O índice de Estruturas de Dados, com 116 páginas, tem cerca de 290 KB (75 KB comprimido pelo servidor); o de Programação Imperativa, com os 112 enunciados em duas línguas, cerca de 370 KB (100 KB comprimido). Só é descarregado quando um aluno abre a pesquisa, e uma vez por visita. Um índice maior não estraga nada: só torna mais lenta a primeira pesquisa. O script avisa acima de 1 MB; nesse caso, convém deixar de fora pastas que ninguém pesquisa (arquivos de anos anteriores, código gerado).

### Confirmar que o índice está atualizado

A janela da pesquisa mostra no rodapé a data em que o índice foi gerado («Índice de 20 nov 2025»). Se for mais antiga que a última alteração, falta correr o `python3 uc-site.py`.

Quem mantém o site também vê avisos na consola do browser (`F12`, separador Consola), começados por `[uc-kit]`. Os alunos não os veem.

| Aviso | O que fazer |
| --- | --- |
| `search-index.js is older than course.js` | O `updated` do `course.js` é mais recente que o índice. Correr `python3 uc-site.py`. |
| `search-index.js was made for "…", not for this course.js` | O índice veio de outra cadeira ou de outro ano (por exemplo, copiado com a pasta). Correr `python3 uc-site.py`. |
| `… is not a search index this kit can read` | O ficheiro foi editado à mão ou foi gerado por um `uc-site.py` mais recente que o kit. Correr o `uc-site.py` do [modelo](https://uc-design-kit.miguelrocha.dev/docs/downloads/uc-template.zip). |

## Permissões

O servidor web do departamento lê os ficheiros como outro utilizador, por isso cada ficheiro precisa de permissão de leitura para todos (`o+r`) e cada pasta de permissão de leitura e passagem (`o+rx`). Um ficheiro sem ela dá "Forbidden" (erro 403). O script avisa; com `--fix-permissions` corrige, sem tirar nenhuma permissão:

```sh
python3 uc-site.py --fix-permissions
```

Só mexe nos ficheiros e pastas do site. A pasta pessoal e a `public_html` também precisam de `o+x` (ver [Publicar](https://uc-design-kit.miguelrocha.dev/docs/pt/publicar.md#dcc-permissoes)).

## Automatizar

Com `--quiet` o script não escreve nada quando está tudo bem, por isso pode correr sozinho. Uma linha no `crontab -e` do servidor verifica o site todas as manhãs e envia um email só quando há erros:

```sh
0 7 * * * python3 ~/public_html/aulas/minha-uc/2627/uc-site.py --quiet
```

Com a pesquisa ligada, esta linha também reescreve o índice todas as manhãs, o que apanha as alterações de quem se esqueceu de correr o script.

## Atualizar o script

O script passa de ano com a pasta e não precisa de ser atualizado. Uma versão mais recente vem no [modelo](https://uc-design-kit.miguelrocha.dev/docs/downloads/uc-template.zip): basta substituir o ficheiro `uc-site.py` da pasta do site. `python3 uc-site.py --version` mostra a versão que se tem.
