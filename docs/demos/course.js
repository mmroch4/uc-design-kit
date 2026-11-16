/*
 * Configuration of the documentation demos: a fictional course,
 * "Algoritmos e Programação 2025/26". Every demo page loads this file.
 *
 * `today` is frozen so that "this week", past/future weeks and deadlines
 * always show something; ?today=YYYY-MM-DD in a demo's URL overrides it.
 * Teaching weeks: week 1 starts on 15 Sep 2025, the week of 27 Oct is a
 * break, so 27 Nov 2025 falls in week 10 (24–28 Nov).
 */
window.UC_COURSE = {
  code: "AP0001",
  title: "Algoritmos e Programação",
  tagline: "Um curso fictício usado nas demonstrações da documentação do UC Design Kit.",
  edition: "2025/26",
  languages: ["pt"],
  institution: { name: "Universidade Exemplo" },
  today: "2025-11-27",

  semester: {
    start: "2025-09-15",
    weeks: 12,
    teachingDays: [1, 5],
    breaks: [{ start: "2025-10-27", end: "2025-10-31", label: { pt: "Semana de estudo", en: "Study week" } }],
  },

  pages: [
    "home",
    { id: "weeks", href: "semanas.html" },
    { id: "assessment", href: "avaliacao.html" },
    { id: "about", href: "sobre.html" },
  ],

  platforms: [
    { label: "Plataforma de entregas", url: "https://example.org/entregas" },
    { label: "Fórum da UC", url: "https://example.org/forum" },
  ],

  team: [
    { name: "Ana Ribeiro", role: "coordinator", email: "ana.ribeiro@example.org", classes: ["T1"], office: "Gab. 2.14" },
    { name: "Bruno Matos", role: "lecturer", classes: ["T2", "TP1"], office: "Gab. 2.09" },
    { name: "Carla Nunes", role: "assistant", classes: ["PL1", "PL3"] },
    { name: "Diogo Teixeira", role: "assistant", classes: ["PL2", "PL4"] },
  ],

  deadlines: [
    {
      id: "t2",
      title: { pt: "Entrega do trabalho 2", en: "Project 2 due" },
      date: "2025-11-28",
      time: "23:59",
      kind: "submission",
      note: { pt: "Pela plataforma de entregas", en: "Through the submission platform" },
    },
    {
      id: "teste",
      title: { pt: "Teste prático", en: "Practical test" },
      date: "2025-12-10",
      time: "14:00",
      kind: "assessment",
      note: { pt: "Laboratórios 1 e 2", en: "Labs 1 and 2" },
    },
    { id: "exame", title: { pt: "Exame, época normal", en: "Final exam" }, date: "2026-01", kind: "exam" },
  ],

  // Newest first on the page; the one dated after "today" stays hidden until that day.
  notices: [
    { date: "2025-12-01", text: { pt: "Salas do teste prático afixadas", en: "Practical test rooms posted" } },
    {
      date: "2025-11-25",
      text: { pt: "Enunciado do trabalho 2 corrigido: ver a alínea 3", en: "Project 2 statement corrected: see item 3" },
      details: { pt: "A função pedida devolve uma lista, não um vetor.", en: "The function returns a list, not an array." },
    },
    { date: "2025-11-20", text: { pt: "Aula teórica de 21 de novembro passa para o anfiteatro 2", en: "21 November lecture moves to lecture hall 2" } },
    { date: "2025-11-06", text: { pt: "Notas do trabalho 1 disponíveis", en: "Project 1 grades available" } },
    { date: "2025-10-20", text: { pt: "Sem aulas na semana de estudo (27 a 31 de outubro)", en: "No classes during study week (27–31 October)" } },
    { date: "2025-10-02", text: { pt: "Turnos das aulas práticas definidos", en: "Lab groups assigned" } },
    { date: "2025-09-15", text: { pt: "Bem-vindos a Algoritmos e Programação", en: "Welcome to Algorithms and Programming" } },
  ],

  footer: { pt: "© 2025 Universidade Exemplo · curso fictício", en: "© 2025 Universidade Exemplo · fictional course" },
  updated: "2025-11-27",
};
