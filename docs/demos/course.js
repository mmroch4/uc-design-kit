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

  pages: ["home", { id: "weeks", href: "semanas.html" }],

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
};
