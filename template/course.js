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
