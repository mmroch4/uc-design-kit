# Publicar

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/publicar.html

O site é uma pasta de ficheiros estáticos, sem passo de compilação: publica-se copiando-a para qualquer servidor web. Aqui ficam três opções, do servidor do departamento a serviços gratuitos.

## Antes de publicar

- Não há `today` no `course.js` (fixa o dia de "hoje" para toda a gente).
- A consola do browser não mostra avisos `[uc-kit]`.
- Os links são relativos e com `.html` (ver [Links e ficheiros](https://uc-design-kit.miguelrocha.dev/docs/pt/estrutura.md#links)).
- O `updated` do `course.js` tem a data de hoje.
- `python3 uc-site.py` termina sem erros (ver [Manter o site](https://uc-design-kit.miguelrocha.dev/docs/pt/manter.md)).
- Os links externos funcionam (ver [Links partidos](#links-partidos)).

## Servidor do departamento (~/public_html)

No DCC, como em muitos departamentos, cada conta tem uma pasta `~/public_html` servida em `https://www.dcc.fc.up.pt/~utilizador/`. Uma pasta `~/public_html/aulas/minha-uc/2627/` fica em `https://www.dcc.fc.up.pt/~utilizador/aulas/minha-uc/2627/`.

A cópia faz-se por SSH a partir do computador onde se edita o site. Nos exemplos, `utilizador@servidor` é a conta e a máquina de acesso por SSH do departamento (a mesma que se usa para entrar remotamente).

### Primeira vez: copiar a pasta

```sh
ssh utilizador@servidor "mkdir -p ~/public_html/aulas/minha-uc"
scp -r 2627 utilizador@servidor:public_html/aulas/minha-uc/
```

### Atualizar: só o que mudou

O `rsync` envia só os ficheiros alterados. Com `--delete` também apaga no servidor o que foi apagado localmente; o `--dry-run` mostra o que faria sem fazer nada.

```sh
rsync -av --delete --dry-run 2627/ utilizador@servidor:public_html/aulas/minha-uc/2627/
rsync -av --delete 2627/ utilizador@servidor:public_html/aulas/minha-uc/2627/
```

A barra no fim de `2627/` importa: copia o conteúdo da pasta para dentro da pasta de destino, em vez de criar `2627/2627`. Quem preferir uma interface gráfica pode usar um cliente SFTP (FileZilla, Cyberduck, WinSCP) com os mesmos dados.

### Permissões

O servidor web só mostra ficheiros que todos podem ler. Se uma página der "Forbidden" (erro 403), `python3 uc-site.py --fix-permissions` corrige as do site (ver [Manter o site](https://uc-design-kit.miguelrocha.dev/docs/pt/manter.md#permissoes)); sem Python, dá-se permissão de leitura a tudo e de passagem às pastas:

```sh
ssh utilizador@servidor "chmod -R a+rX ~/public_html/aulas/minha-uc"
```

A pasta pessoal e a `public_html` também precisam de permissão de passagem (`chmod a+x ~ ~/public_html`). Ficheiros que não devem ser públicos (enunciados de testes por sair, notas) não se põem na pasta, porque tudo o que lá está pode ser descarregado por quem souber o endereço.

## GitHub Pages

Útil quando o site já está num repositório, por exemplo para ter histórico de alterações ou vários professores a editar.

1. Criar um repositório público com as pastas dos anos na raiz (`2526/`, `2627/`) ou só a pasta do ano.
2. Em **Settings → Pages**, escolher **Deploy from a branch**, o ramo `main` e a pasta `/ (root)`.
3. O site fica em `https://utilizador.github.io/repositorio/2627/`, e atualiza-se a cada `git push`, em cerca de um minuto.

Convém acrescentar à raiz do repositório um ficheiro vazio chamado `.nojekyll`: diz ao GitHub para servir os ficheiros como estão, sem os processar com o Jekyll.

```sh
touch .nojekyll
git add . && git commit -m "Site 2026/27" && git push
```

## Cloudflare Pages

Gratuito, rápido em qualquer país e com um endereço de pré-visualização para cada alteração. Há duas formas:

- **Sem Git.** Em **Workers & Pages → Create → Pages → Upload assets**, arrasta-se a pasta do site. Para atualizar, cria-se um novo deployment com a pasta nova.
- **Com Git.** **Connect to Git**, escolhe-se o repositório e deixa-se o comando de build vazio e a pasta de saída `/`. Cada `git push` publica.

O site fica em `https://projeto.pages.dev/` e pode ter um domínio próprio. O Cloudflare Pages redireciona `pagina.html` para `pagina`; os links com `.html` continuam a funcionar (o redirecionamento custa uma fração de segundo) e mantêm o site portável para outros servidores. A pesquisa também funciona: o Cloudflare responde ao pedido `HEAD` com que o kit confirma que o `search-index.js` existe.

## Pesquisa no site

Com `search: true` no `course.js`, o `search-index.js` publica-se com o resto da pasta. Gera-se antes de copiar, com `python3 uc-site.py`, ou no próprio servidor, depois de copiar (ver [O índice da pesquisa](https://uc-design-kit.miguelrocha.dev/docs/pt/manter.md#indice)). Se não estiver no servidor, o botão «Pesquisar» simplesmente não aparece.

O índice só é descarregado quando um aluno abre a pesquisa. Os servidores costumam enviá-lo comprimido, o que o reduz a cerca de um quarto. Se o servidor do departamento não o fizer (nas ferramentas do browser, separador Rede, a resposta do `search-index.js` não tem `Content-Encoding: gzip`), um ficheiro `.htaccess` na pasta do site, com esta linha, liga a compressão num servidor Apache. É opcional: sem ela, a primeira pesquisa só demora um pouco mais.

`.htaccess`:

```text
AddOutputFilterByType DEFLATE text/javascript application/javascript
```

## Versão do kit

As páginas carregam o kit de `https://uc-design-kit.miguelrocha.dev/kit/v1/`. Há duas formas de escolher a versão:

| Endereço | O que se recebe | Quando usar |
| --- | --- | --- |
| `kit/v1/` | Sempre a versão 1 mais recente. Recebe correções e novidades sem mudar nada, e nunca muda de forma incompatível. | Por omissão. É o que o modelo usa. |
| `kit/v1.1.0/` | Uma versão exata, que nunca muda. O browser guarda-a durante um ano sem voltar a perguntar, por isso as visitas seguintes são as mais rápidas. | Para ter o mesmo kit durante todo o semestre. Atualiza-se no início do ano (ver [Novo ano letivo](https://uc-design-kit.miguelrocha.dev/docs/pt/novo-ano.md#kit)). |

Para fixar a versão troca-se `v1` pelo número nos três endereços do `<head>` (o `preload` da letra, o CSS e o JavaScript). As versões publicadas e o que mudou em cada uma estão no [CHANGELOG](https://github.com/mmroch4/uc-design-kit/blob/main/CHANGELOG.md).

## Links partidos

Os links para fora do site (enunciados noutros servidores, juízes online, outras cadeiras) deixam de funcionar sem aviso. O [W3C Link Checker](https://validator.w3.org/checklink) verifica-os sem instalar nada: indica-se o endereço do site publicado, marca-se "Check linked documents recursively" com profundidade 1 ou 2, e ele lista os links que respondem com erro. Os links com `data-auth` (pautas, SIGARRA) aparecem como erro de autenticação, o que é normal.

O repositório do kit verifica uma vez por semana os links externos dos exemplos e da documentação e abre uma *issue* com os que falharem.

## Data de atualização

O rodapé diz "Atualizado a …" com o `updated` do `course.js`. Uma página com `<uc-page updated="auto">` mostra a data do próprio ficheiro, que o servidor envia no cabeçalho `Last-Modified`. O servidor do DCC e o GitHub Pages enviam-no; se o servidor não o enviar, a página não mostra data. Com `rsync -a` a data é a da última alteração no computador, não a da cópia.

## Cache

- **O kit** (`kit/v1/`) fica guardado no browser durante 5 minutos e depois é verificado em segundo plano: uma correção ao kit chega aos alunos na visita seguinte, sem que esperem por ela.
- **Os ficheiros do site** (`course.js`, páginas) seguem as regras do servidor onde estão. Os servidores de departamento costumam fazer o browser confirmar se houve alterações, por isso um aviso novo aparece ao recarregar. Se um aluno vir uma versão antiga, Ctrl+F5 (ou Cmd+Shift+R) força a atualização.
