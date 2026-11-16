# Usar com uma LLM

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/llm.html

Um assistente como o ChatGPT, o Claude ou o Gemini consegue construir ou atualizar o site de uma cadeira com o kit, desde que leia esta documentação. O site publica-a em texto simples, num formato pensado para modelos de linguagem, e esta página tem o pedido inicial pronto a copiar.

## A documentação em texto

| Ficheiro | O que tem | Quando usar |
| --- | --- | --- |
| [`llms-full.txt`](https://uc-design-kit.miguelrocha.dev/llms-full.txt) | Toda a documentação num ficheiro de Markdown (cerca de 450 KB, uns 120 mil *tokens*), pela ordem da barra lateral, mais o contrato `docs/api.md`. | Para construir um site de raiz. Dá-se o endereço ao assistente, ou descarrega-se e anexa-se se ele não puder abrir páginas. |
| [`llms.txt`](https://uc-design-kit.miguelrocha.dev/llms.txt) | O índice, no formato [llms.txt](https://llmstxt.org/): o que é o kit, as regras abaixo e uma ligação por página. | Para assistentes que navegam sozinhos e leem só as páginas de que precisam. |
| Uma página em Markdown | Cada página desta documentação tem uma versão `.md`, com a ligação "Markdown" no fim da página. | Para uma tarefa pequena: "acrescenta um `<uc-question>` a este guião". |

Os três ficheiros são gerados a partir destas páginas pelo `npm run build`, por isso dizem sempre o mesmo que a documentação. Os exemplos de código incluem o código de cada demonstração.

## Passo a passo

1. Juntar a informação da cadeira: nome, código, ano letivo, início do semestre e interrupções, equipa, avaliação e prazos, programa, avisos. O site antigo também serve: pode colar-se o HTML ou o texto.
2. Abrir uma conversa nova e colar o [pedido inicial](#pedido), com a informação no fim. Se o assistente não abrir ligações, anexar o `llms-full.txt`.
3. Guardar os ficheiros que o assistente devolve numa pasta, ao lado uns dos outros, com os nomes que ele indicar.
4. [Verificar](#verificar) o resultado no browser e pedir correções na mesma conversa, uma de cada vez.

## Pedido inicial

Copiar, completar as partes entre parênteses retos e colar no assistente:

`pedido.txt`:

```text
Vais construir o site da unidade curricular [nome da cadeira] com o UC Design Kit.

1. Lê a documentação do kit: https://uc-design-kit.miguelrocha.dev/llms-full.txt
   (ou o ficheiro em anexo). Segue as regras da secção "Regras" do início.
2. Parte do modelo inicial descrito em "Criar o meu site": course.js, index.html,
   semanas.html, avaliacao.html, sobre.html e theme.css.
3. Põe no course.js tudo o que muda de ano para ano (datas, equipa, prazos,
   avisos, páginas) e nas páginas o resto do conteúdo.
4. Usa só os elementos, atributos, campos do course.js e classes CSS que estão
   na documentação. Se faltar uma informação, escreve um comentário
   <!-- TODO: … --> em vez de a inventar.
5. Entrega cada ficheiro completo, num bloco de código com o nome do ficheiro.

Informação da cadeira:
[colar aqui: código, ano letivo, início do semestre, interrupções, equipa,
avaliação e prazos, programa, avisos, ou o texto do site antigo]
```

Para alterar um site que já existe, basta trocar os pontos 2 e 5: "Vou colar o `course.js` e a página X. Faz esta alteração e devolve só os ficheiros que mudaram."

## Regras

O assistente tem de seguir estas regras, que também estão no início do `llms.txt` e do `llms-full.txt`.

1. **Site estático.** Só HTML, CSS e JavaScript em ficheiros. Sem frameworks, sem npm, sem passo de compilação, sem módulos ES: scripts clássicos, para as páginas funcionarem abertas do disco (`file://`).
2. **O `<head>` de cada página**, por esta ordem: `uc-kit.css` do kit, `theme.css`, `course.js` sem `defer`, `uc-kit.js` com `defer`, e só depois os scripts próprios com `defer`. O kit carrega do endereço absoluto `https://uc-design-kit.miguelrocha.dev/kit/v1/`.
3. **Uma página é um `<uc-page>`** com todo o conteúdo dentro e um único `<h1>`. As páginas que não estão na navegação dizem qual fica ativa com `current`.
4. **O que muda todos os anos vai para o `course.js`**: `semester`, `team`, `deadlines`, `notices`, `pages`. Datas em ISO (`AAAA-MM-DD`). As datas das semanas nunca se escrevem: o kit calcula-as a partir de `semester.start`, e cada `<uc-week>` só leva `n` e `title`.
5. **Só o que está documentado.** Nenhum elemento, atributo, campo do `course.js` ou classe `uc-…` inventado. Para um comportamento que o kit não tem, um componente próprio em `extensions/` com `UC.define` e `UC.Element` (Nível 3).
6. **Light DOM.** Os componentes do kit e os próprios não usam shadow DOM; o conteúdo escrito pelo professor fica no HTML, legível sem JavaScript.
7. **Personalizar por níveis**: `accentColor` no `course.js`; tokens `--uc-…` no `theme.css`; regras com as classes estáveis. Nunca editar nem copiar os ficheiros do kit, e nunca usar `!important` (as regras do kit têm especificidade zero).
8. **Blocos antes de CSS novo.** Para dar forma ao conteúdo, primeiro `uc-section`, `uc-stack`, `uc-grid`, `uc-card`, `uc-callout`, `uc-table`, `uc-button`, `uc-tag`; HTML antigo sem classes vai dentro de `uc-content`.
9. **Links relativos com o nome do ficheiro** (`semanas.html`, `guioes/aula01.html`), nunca `/` no início, para o site funcionar em qualquer servidor e do disco.
10. **Acessível**: texto alternativo nas imagens, títulos sem saltar níveis, texto de ligação que diga para onde vai, tabelas com cabeçalhos.
11. **Línguas**: para um site bilingue, `languages` no `course.js` e o mesmo conteúdo duas vezes com `lang="pt"` e `lang="en"`, ou um ficheiro por língua.
12. **Sem dados de estudantes**: notas, números ou listas de turnos ficam fora do site público.

## Verificar o resultado

- Abrir `index.html` no browser, a partir do disco. Se a página aparecer sem estilos, o `<head>` está errado.
- Abrir a consola do browser (F12): os avisos `[uc-kit]` apontam campos do `course.js` em falta ou inválidos.
- Acrescentar `?today=2026-10-15` ao endereço para ver o site como num dia do semestre: a semana atual, os prazos e os avisos mudam.
- Comparar os atributos usados com as tabelas "Atributos" das páginas dos componentes. Um atributo que não está lá não faz nada.
- Publicar só depois: ver [Publicar](https://uc-design-kit.miguelrocha.dev/docs/pt/publicar.md).

## Ver também

- [Migrar um site existente](https://uc-design-kit.miguelrocha.dev/docs/pt/migrar.md): o pedido para um assistente que trabalha com ficheiros, como o Claude Code ou o Codex.
- [Criar o meu site](https://uc-design-kit.miguelrocha.dev/docs/pt/criar-site.md): o mesmo caminho, feito à mão.
- [Padrões de página](https://uc-design-kit.miguelrocha.dev/docs/pt/exemplos/padroes.md): o que um bom resultado deve parecer.
- [O ficheiro course.js](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md).
