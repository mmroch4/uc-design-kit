# Criar o meu site

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/criar-site.html

Do zero a um site publicado em seis passos, a partir do modelo. Cada passo mostra o que se escreve e o que se deve ver. Conta com 15 minutos para ter o esqueleto pronto; o resto é escrever o conteúdo da cadeira.

## Antes de começar

Basta um editor de texto (VS Code, Sublime, vim…) e um browser. Não se instala nada: as páginas carregam o kit de `https://uc-design-kit.miguelrocha.dev/kit/v1/`, por isso é preciso Internet também quando se abre o site do disco.

## 1. Descarregar o modelo

O modelo é um site mínimo mas completo, com quatro páginas e comentários curtos a dizer o que mudar.

[Descarregar uc-template.zip](https://uc-design-kit.miguelrocha.dev/docs/downloads/uc-template.zip)

Descompacta-se e dá-se à pasta o nome do ano letivo. O [mesmo modelo está no GitHub](https://github.com/mmroch4/uc-design-kit/tree/main/template), para quem preferir copiar os ficheiros.

```sh
unzip uc-template.zip
mv uc-template 2627
```

| Ficheiro | Para quê |
| --- | --- |
| `course.js` | Configuração do curso: título, semestre, equipa, prazos, avisos. É o que muda todos os anos. |
| `index.html` | Página inicial com [`<uc-hero>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-hero.md), [`<uc-this-week>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-this-week.md), [`<uc-notices>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-notices.md), [`<uc-deadlines>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-deadlines.md) e [`<uc-team>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-team.md). |
| `semanas.html` | Calendário com [`<uc-weeks>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-weeks.md) e três semanas de exemplo. |
| `avaliacao.html` | Cartões, chamada e a tabela de datas das provas. |
| `sobre.html` | Objetivos, programa, horário em tabela e equipa. |
| `theme.css` | Estilos próprios, vazio com um exemplo comentado. |
| `README.txt` | Estes passos, em resumo. |
| `uc-site.py` | Verifica o site depois de cada alteração e reescreve o índice da pesquisa: `python3 uc-site.py`. Ver [Manter o site](https://uc-design-kit.miguelrocha.dev/docs/pt/manter.md). |
| `search-index.js` | O índice da [pesquisa no site](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-page.md#pesquisa) (o botão «Pesquisar» do cabeçalho), gerado pelo `uc-site.py`. Não se edita. Para tirar a pesquisa, apaga-se o ficheiro e a linha `search: true` do `course.js`. |
| `AGENTS.md` | As regras do kit para assistentes de programação (Claude Code, Codex). Ver [O ficheiro AGENTS.md](https://uc-design-kit.miguelrocha.dev/docs/pt/migrar.md#agents). |

## 2. Abrir no browser

Abre-se o `index.html` com duplo clique. O resultado deve ser este, com o nome de exemplo:

![Página inicial do modelo: cabeçalho com Nome da Unidade Curricular 2026/27, navegação à esquerda com Início, Semanas, Avaliação e Sobre a UC, cartão Esta semana com a semana 2, avisos e próximas datas.](https://uc-design-kit.miguelrocha.dev/docs/assets/img/template-home.webp)

Aberto do disco (`file://`), o cartão "Esta semana" mostra as datas e os prazos mas não a matéria da semana: o browser não deixa uma página ler outra do disco (ver [A página de semanas](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-this-week.md#pagina-de-semanas)). Para ver tudo como no servidor, serve-se a pasta localmente:

```sh
cd 2627
python3 -m http.server 8000
# abrir http://localhost:8000/
```

Se a página aparecer sem estilos, o kit não carregou: confirmar a ligação à Internet e os três endereços do `<head>` (ver [Estrutura de um site](https://uc-design-kit.miguelrocha.dev/docs/pt/estrutura.md#head)).

## 3. Editar o course.js

Primeiro os dados da cadeira. Estes são os campos a mudar logo; os outros têm valores razoáveis e explicam-se em [O ficheiro course.js](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md).

`course.js`:

```js
window.UC_COURSE = {
  code: "AP0001",
  title: "Algoritmos e Programação",
  tagline: "Um curso fictício usado nas demonstrações da documentação do UC Design Kit.",
  edition: "2025/26",
  institution: { name: "Universidade Exemplo" },

  semester: {
    start: "2025-09-15",       // primeiro dia de aulas
    weeks: 12,
    breaks: [{ start: "2025-10-27", end: "2025-10-31", label: "Semana de estudo" }],
  },

  deadlines: [
    { id: "t2", title: "Entrega do trabalho 2", kind: "submission",
      date: "2025-11-28", time: "23:59", note: "Pela plataforma de entregas" },
    { id: "teste", title: "Teste prático", kind: "assessment",
      date: "2025-12-10", time: "14:00", note: "Laboratórios 1 e 2" },
    { id: "exame", title: "Exame, época normal", kind: "exam", date: "2026-01" },
  ],
};
```

Guarda-se e recarrega-se a página. O título vem do `course.js` e os prazos aparecem por ordem, só os que ainda não passaram:

Exemplo (título e próximos prazos a partir do course.js), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/getting-started/course.html):

```html
<uc-hero></uc-hero>
<uc-deadlines>
  <a href="#">Regras de avaliação</a>
</uc-deadlines>
```

Se algo não aparecer, abrir a consola do browser (F12): o kit avisa, com mensagens começadas por `[uc-kit]`, quando falta um campo ou uma data não é válida. Os erros mais comuns estão em [Erros comuns](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md#erros-comuns).

## 4. Escrever a primeira semana

Em `semanas.html` cada semana é uma [`<uc-week>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-week.md) com o número e o título. As datas não se escrevem: calculam-se a partir de `semester.start`. Dentro, o HTML é livre; um `<dl>` aparece como linhas de etiqueta e valor.

Exemplo (primeira semana, vista durante essa semana), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/getting-started/first-week.html?today=2025-09-17):

```html
<uc-week n="1" title="Apresentação e primeiros programas">
  <dl>
    <dt>Teóricas</dt>
    <dd>Funcionamento da cadeira, avaliação · <a href="#">slides 1</a></dd>
    <dt>Prática</dt>
    <dd><a href="#">Guião 1: instalar as ferramentas</a></dd>
  </dl>
  <p>Tragam o portátil para a primeira aula prática.</p>
</uc-week>
```

A demonstração está fixada em 17 de setembro de 2025, por isso a semana 1 é a atual e aparece aberta. Para ver o site noutro dia sem esperar por ele, acrescenta-se `?today=AAAA-MM-DD` ao endereço, por exemplo `semanas.html?today=2025-11-27`. As outras páginas (avaliação, sobre) são HTML com os [blocos do kit](https://uc-design-kit.miguelrocha.dev/docs/pt/index.md#o-que-inclui); o modelo traz exemplos de cartões, chamadas e tabelas.

## 5. Ver no browser

Antes de publicar, vale a pena percorrer o site com três verificações rápidas:

- **Datas.** Com `?today=` num dia de cada mês do semestre, a semana certa abre e "Esta semana" mostra os prazos certos.
- **Telemóvel.** No modo de dispositivo das ferramentas do browser (Ctrl+Shift+M), a navegação passa a um menu e as tabelas deslizam na horizontal.
- **Consola.** Sem avisos `[uc-kit]`.

Os links e imagens partidos, os erros no `course.js` e as permissões encontram-se de uma vez com `python3 uc-site.py` na pasta do site (ver [Manter o site](https://uc-design-kit.miguelrocha.dev/docs/pt/manter.md)). O mesmo comando reescreve o índice da pesquisa, por isso corre-se depois de cada alteração: até lá, a pesquisa ainda mostra o texto do modelo.

## 6. Publicar

O site é uma pasta de ficheiros estáticos: publica-se copiando-a para um servidor web. No servidor do departamento é uma cópia para o `~/public_html`:

```sh
scp -r 2627 utilizador@servidor:public_html/aulas/minha-uc/
```

Os detalhes, o GitHub Pages e o Cloudflare Pages estão em [Publicar](https://uc-design-kit.miguelrocha.dev/docs/pt/publicar.md).

## Próximos passos

- [Estrutura de um site](https://uc-design-kit.miguelrocha.dev/docs/pt/estrutura.md): páginas em subpastas, o `<head>` de cada página e os links.
- [O ficheiro course.js](https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.md): todos os campos, com tipos e valores por omissão.
- [Línguas](https://uc-design-kit.miguelrocha.dev/docs/pt/linguas.md): um site em português e inglês.
- [Novo ano letivo](https://uc-design-kit.miguelrocha.dev/docs/pt/novo-ano.md): o que mudar quando se copia a pasta.
