Modelo de site do UC Design Kit
===============================

Um site mínimo de unidade curricular: página inicial, semanas, avaliação e
"sobre". Não é preciso instalar nada: são ficheiros HTML que carregam o kit
de https://uc-design-kit.miguelrocha.dev/kit/v1/.

Seis passos para começar

1. Mudar o nome da pasta para o ano letivo (por exemplo 2627).
2. Abrir index.html no browser (duplo clique). É preciso Internet para
   carregar o kit.
3. Editar course.js: código, título, edição, início do semestre, equipa,
   prazos e avisos. Guardar e recarregar a página.
4. Escrever as semanas em semanas.html (uma <uc-week> por semana) e o texto
   de avaliacao.html e sobre.html.
5. Verificar: python3 uc-site.py (links, imagens, course.js, permissões).
   Com search: true no course.js (já vem ligado), o mesmo comando reescreve
   o índice da pesquisa. Repetir depois de cada alteração.
6. Publicar: copiar a pasta para o servidor (por exemplo ~/public_html/),
   para o GitHub Pages ou para o Cloudflare Pages.

Ficheiros

  course.js       configuração do curso (o que muda todos os anos)
  theme.css       estilos próprios (opcional)
  index.html      página inicial: esta semana, avisos, próximas datas
  semanas.html    calendário semana a semana
  avaliacao.html  regras e datas de avaliação
  sobre.html      objetivos, programa e equipa
  uc-site.py      verifica o site e, com search: true no course.js, gera o
                  índice da pesquisa (python3 uc-site.py; precisa de Python 3.8+)
  search-index.js índice da pesquisa (botão «Pesquisar»), gerado pelo
                  uc-site.py: não se edita à mão. Para deixar parte de uma
                  página fora da pesquisa: data-search-ignore. Um campo de
                  pesquisa dentro de uma página: <uc-search>.
  AGENTS.md       instruções para assistentes de IA (Claude Code, Codex…)

Migrar um site antigo com um assistente de IA:
https://uc-design-kit.miguelrocha.dev/docs/pt/migrar.html

Manter o site com o uc-site.py:
https://uc-design-kit.miguelrocha.dev/docs/pt/manter.html

Documentação: https://uc-design-kit.miguelrocha.dev/docs/pt/criar-site.html
Licença do kit: MIT. O conteúdo que escrever é seu.
