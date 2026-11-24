/*
 * Configuração do site da unidade curricular.
 *
 * Tudo o que muda de ano para ano, ou aparece em mais de uma página, fica
 * aqui: título, semestre, equipa, prazos e avisos. O resto é HTML nas páginas.
 * Referência de todos os campos:
 *   https://uc-design-kit.miguelrocha.dev/docs/pt/course-js.html
 *
 * Num ano novo: copiar a pasta (2627 → 2728) e rever edition, semester,
 * deadlines, notices, team e updated.
 */
window.UC_COURSE = {
  // Código, nome e frase de apresentação (aparecem no cabeçalho e em <uc-hero>).
  code: "CC0000",
  title: "Nome da Unidade Curricular",
  tagline: "Uma frase sobre a unidade curricular: o que se aprende e com que ferramentas.",
  edition: "2026/27",

  // Línguas do site; a primeira é a de omissão. Com duas aparece o seletor.
  languages: ["pt"],

  institution: { name: "Departamento · Faculdade", url: "https://www.example.org" },

  // Cor de destaque (links, semana atual, botões). Contraste mínimo 4.5:1 com branco.
  accentColor: "#1D4ED8",

  // Ícone antes do nome no cabeçalho: um ficheiro ("logo.svg", "logo.png"),
  // um '<svg …>' ou null para nenhum. Sem este campo aparece o ícone do kit.
  // logo: "logo.svg",

  // Tema: "classic" é o aspeto do kit (não descarrega nada). Os temas que só
  // mudam letra e espaços juntam-se numa lista: ["classic", "compact"].
  // O theme.css do site continua a ganhar sobre o tema.
  theme: "classic",
  // theme: ["classic", "compact"],        // letra mais pequena, menos espaço
  // theme: ["classic", "serif"],          // letra com serifa
  // theme: ["classic", "high-contrast"],  // mais contraste, para projetar
  // theme: "modern",                     // Moderno: navegação no topo, cartões com sombra
  // theme: "institutional",              // Institucional: faixa da cor do curso
  // theme: "handbook",                   // Manual: três colunas com "Nesta página"
  // theme: "editorial",                  // Editorial: centrado, letra com serifa

  // Navegação: "sidebar" (barra lateral, a do tema "classic"), "top" (barra
  // por baixo do cabeçalho, a do tema "modern"), "banner" (faixa da cor do
  // curso, a do tema "institutional"), "docs" (três colunas com "Nesta
  // página", a do tema "handbook"), "centered" (centrado, a do tema
  // "editorial"), "panel" (barra de altura total com o nome, a navegação e
  // o horário), "aside" (blocos à direita em todas as páginas) ou "full"
  // (sem navegação). Se estiver aqui, ganha ao layout do tema; uma página
  // pode mudar com <uc-page layout="…">.
  // layout: "top",
  // aside: ["deadlines", "notices"],     // blocos do layout "aside"; também "this-week", "office-hours", "platforms"
  // panel: false,                        // layout "panel" sem o horário no fundo da barra

  // Pesquisa no site: o botão «Pesquisar» aparece quando existe o search-index.js,
  // que o uc-site.py reescreve. Correr python3 uc-site.py depois de cada alteração.
  search: true,

  // Semanas de aulas: a semana 1 é a que contém start. As interrupções não contam.
  semester: {
    start: "2026-09-14",
    weeks: 12,
    teachingDays: [1, 5], // dias com aulas: 1 = segunda … 5 = sexta
    breaks: [
      { start: "2026-11-02", end: "2026-11-06", label: "Semana de estudo" },
    ],
  },

  // Navegação, por esta ordem. Os nomes dos ficheiros são relativos a este ficheiro.
  pages: [
    "home",
    { id: "weeks", href: "semanas.html" },
    { id: "assessment", href: "avaliacao.html" },
    { id: "about", href: "sobre.html" },
  ],

  // Ligações externas, listadas em "Plataformas" na navegação.
  platforms: [
    { label: "Moodle", url: "https://www.example.org/moodle" },
  ],

  // role: "coordinator", "lecturer", "assistant" ou um texto próprio.
  team: [
    { name: "Nome do Regente", role: "coordinator", classes: ["T1"], email: "regente@example.org", office: "Gab. 1.01" },
    { name: "Nome do Assistente", role: "assistant", classes: ["PL1", "PL2"] },
  ],

  // Prazos: aparecem na página inicial, na semana certa e na avaliação.
  // kind: "assessment", "exam", "quiz", "submission" ou "other".
  // date: "AAAA-MM-DD", "AAAA-MM" (só o mês) ou null (a marcar).
  deadlines: [
    { id: "t1", title: "Entrega do trabalho 1", date: "2026-10-23", time: "23:59", kind: "submission", note: "Pela plataforma de entregas" },
    { id: "teste", title: "Teste prático", date: "2026-11-25", time: "14:00", kind: "assessment", note: "Laboratórios 1 e 2" },
    { id: "exame", title: "Exame, época normal", date: "2027-01", kind: "exam" },
  ],

  // Avisos: o mais recente primeiro. Um aviso com data futura só aparece nesse dia.
  notices: [
    { date: "2026-09-14", text: "Bem-vindos! As aulas começam a 14 de setembro. Consultem a página <a href=\"semanas.html\">Semanas</a>." },
  ],

  footer: "© 2026 Nome do Regente · Departamento, Faculdade",
  updated: "2026-09-14",

  // Outros anos: com um editions.js na pasta acima desta (lista de todas as
  // edições), o cabeçalho mostra "Outros anos". Tirar o // quando existir.
  // editions: "../editions.js",
};
