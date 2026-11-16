Modelo de site do UC Design Kit
===============================

Um site mínimo de unidade curricular: página inicial, semanas, avaliação e
"sobre". Não é preciso instalar nada: são ficheiros HTML que carregam o kit
de https://uc-design-kit.miguelrocha.dev/kit/v1/.

Cinco passos para começar

1. Mudar o nome da pasta para o ano letivo (por exemplo 2627).
2. Abrir index.html no browser (duplo clique). É preciso Internet para
   carregar o kit.
3. Editar course.js: código, título, edição, início do semestre, equipa,
   prazos e avisos. Guardar e recarregar a página.
4. Escrever as semanas em semanas.html (uma <uc-week> por semana) e o texto
   de avaliacao.html e sobre.html.
5. Publicar: copiar a pasta para o servidor (por exemplo ~/public_html/),
   para o GitHub Pages ou para o Cloudflare Pages.

Ficheiros

  course.js       configuração do curso (o que muda todos os anos)
  theme.css       estilos próprios (opcional)
  index.html      página inicial: esta semana, avisos, próximas datas
  semanas.html    calendário semana a semana
  avaliacao.html  regras e datas de avaliação
  sobre.html      objetivos, programa e equipa

Documentação: https://uc-design-kit.miguelrocha.dev/docs/pt/criar-site.html
Licença do kit: MIT. O conteúdo que escrever é seu.
