/*
 * Estruturas de Dados 2025/26 — configuração do ano.
 *
 * Para criar o site do ano seguinte: copiar esta pasta (2526 → 2627) e
 * atualizar este ficheiro: edition, semester, deadlines, notices, team e updated.
 * As datas de cada semana são calculadas a partir de semester.start.
 */
window.UC_COURSE = {
  code: "CC1007",
  title: "Estruturas de Dados",
  tagline: "Programação orientada a objetos em Java, estruturas de dados fundamentais e análise da complexidade de algoritmos.",
  edition: "2025/26",
  languages: ["pt"],
  institution: { name: "DCC · FCUP", url: "https://www.dcc.fc.up.pt" },
  accentColor: "#1D4ED8",
  search: true,

  semester: {
    start: "2025-09-16",
    weeks: 12,
    teachingDays: [2, 5],
    breaks: [{ start: "2025-10-27", end: "2025-10-31", label: "Atividades FCUP II" }],
  },

  pages: [
    "home",
    { id: "weeks", href: "semanas.html" },
    { id: "summaries", href: "sumarios.html", label: "Sumários" },
    { id: "assessment", href: "avaliacao.html" },
    { id: "materials", href: "materiais.html" },
    { id: "schedule", href: "horarios.html" },
    { id: "about", href: "sobre.html" },
  ],

  platforms: [
    { id: "mooshak", label: "Mooshak", url: "https://mooshak.dcc.fc.up.pt/~edados/" },
    { id: "sigarra", label: "SIGARRA", url: "https://sigarra.up.pt/fcup/" },
  ],

  team: [
    { name: "Fernando Silva", url: "https://www.dcc.fc.up.pt/~fds", role: "coordinator", classes: ["T1", "T2"], office: "Gab. 1.25",
      // Atendimento a estudantes: aparece em horarios.html e no cartão da equipa.
      officeHours: [
        { day: 2, start: "16:00", end: "18:00" },
        // No site original aparece "61:30"; confirmar a hora com o docente.
        { day: 4, start: "16:30", end: "18:00", note: "Hora a confirmar" },
      ] },
    { name: "Eduardo R. B. Marques", url: "https://www.dcc.fc.up.pt/~edrdo/", role: "assistant", classes: ["PL1", "PL5", "PL7"] },
    { name: "Joana Leite", role: "assistant", classes: ["PL2", "PL3"] },
    { name: "Duarte Nóbrega", role: "assistant", classes: ["PL4", "PL8"] },
    { name: "Maria Pedroto", role: "assistant", classes: ["PL6"] },
  ],

  // Horário das aulas (horarios.html). Os docentes de cada turma vêm de team[].classes.
  schedule: [
    { type: "lecture", class: "T1", day: 2, start: "14:00", end: "15:00", room: "FC4 0.41" },
    { type: "lecture", class: "T1", day: 4, start: "14:00", end: "15:00", room: "FC4 0.41" },
    { type: "lecture", class: "T2", day: 2, start: "15:00", end: "16:00", room: "FC6 0.29" },
    { type: "lecture", class: "T2", day: 4, start: "15:00", end: "16:00", room: "FC6 0.29" },
    { type: "lab", class: "PL2", day: 2, start: "16:00", end: "18:00", room: "FC6 1.65" },
    { type: "lab", class: "PL7", day: 2, start: "16:00", end: "18:00", room: "FC6 0.08" },
    { type: "lab", class: "PL8", day: 3, start: "11:00", end: "13:00", room: "FC6 1.57" },
    { type: "lab", class: "PL6", day: 3, start: "14:00", end: "16:00", room: "FC6 1.84" },
    { type: "lab", class: "PL4", day: 4, start: "16:00", end: "18:00", room: "FC6 1.63" },
    { type: "lab", class: "PL5", day: 4, start: "16:00", end: "18:00", room: "FC6 1.57" },
    { type: "lab", class: "PL1", day: 5, start: "16:00", end: "18:00", room: "FC6 1.57" },
    { type: "lab", class: "PL3", day: 5, start: "16:00", end: "18:00", room: "FC6 1.55" },
  ],

  // Quizzes: date = dia em que abre (19:00), end = dia em que fecha.
  deadlines: [
    { id: "quiz1", title: "Quiz #01", date: "2025-09-23", end: "2025-09-30", kind: "quiz", note: "Introdução ao Java I · fecha às 21:00, no Mooshak" },
    { id: "quiz2", title: "Quiz #02", date: "2025-09-30", end: "2025-10-07", kind: "quiz", note: "Introdução ao Java II · fecha às 21:00, no Mooshak" },
    { id: "quiz3", title: "Quiz #03", date: "2025-10-07", end: "2025-10-14", kind: "quiz", note: "Introdução ao Java III · fecha às 21:00, no Mooshak" },
    { id: "quiz4", title: "Quiz #04", date: "2025-10-14", end: "2025-10-21", kind: "quiz", note: "TADs I · fecha às 21:00, no Mooshak" },
    { id: "quiz5", title: "Quiz #05", date: "2025-10-21", end: "2025-10-28", kind: "quiz", note: "TADs II e listas I · fecha às 21:00, no Mooshak" },
    { id: "quiz6", title: "Quiz #06", date: "2025-11-04", end: "2025-11-11", kind: "quiz", note: "Listas II · fecha às 21:00, no Mooshak" },
    { id: "quiz7", title: "Quiz #07", date: "2025-11-11", end: "2025-11-18", kind: "quiz", note: "Complexidade I · fecha às 21:00, no Mooshak" },
    { id: "quiz8", title: "Quiz #08", date: "2025-11-18", end: "2025-11-25", kind: "quiz", note: "Complexidade II e recursividade · fecha às 21:00, no Mooshak" },
    {
      id: "ap1",
      title: "Avaliação Prática 1",
      date: "2025-11-12",
      time: "16:00",
      kind: "assessment",
      duration: 100,
      shifts: [{ time: "16:00" }, { time: "18:00" }],
      location: "Laboratórios do DCC (FC6)",
      url: "guioes/teste-pratico-1.html",
      links: [
        { label: "Turnos", url: "https://www.dcc.fc.up.pt/~fds/aulas/EDados/2526/evaluation/turnos_avalpratica1_2526.pdf" },
        { label: "Resultados", url: "https://www.dcc.fc.up.pt/~fds/aulas/EDados/2526/evaluation/avalpratica1_2526.pdf" },
      ],
    },
    { id: "quiz9", title: "Quiz #09", date: "2025-11-25", end: "2025-12-02", kind: "quiz", note: "Árvores binárias · fecha às 21:00, no Mooshak" },
    { id: "quiz10", title: "Quiz #10", date: "2025-12-02", end: "2025-12-09", kind: "quiz", note: "Árvores binárias de pesquisa · fecha às 21:00, no Mooshak" },
    { id: "quiz11", title: "Quiz #11", date: "2025-12-09", end: "2025-12-16", kind: "quiz", note: "Dicionários e filas de prioridade · fecha às 21:00, no Mooshak" },
    {
      id: "ap2",
      title: "Avaliação Prática 2",
      date: "2025-12-16",
      time: "14:00",
      kind: "assessment",
      duration: 110,
      shifts: [{ time: "14:00" }, { time: "16:00" }],
      location: "Laboratórios do DCC (FC6)",
      url: "guioes/teste-pratico-2.html",
      links: [
        { label: "Turnos", url: "https://www.dcc.fc.up.pt/~fds/aulas/EDados/2526/evaluation/turnos_avalpratica2_2526.pdf" },
        { label: "Treino 2", url: "guioes/teste-pratico-2.html" },
      ],
    },
    {
      id: "exam",
      title: "Exame, época normal",
      date: "2026-01",
      kind: "exam",
      note: "Salas no SIGARRA",
      links: [{ label: "Exame modelo", url: "https://www.dcc.fc.up.pt/~fds/aulas/EDados/2526/evaluation/exame_modelo.pdf" }],
    },
    { id: "resit", title: "Exame, época de recurso", date: null, kind: "exam", note: "Salas no SIGARRA" },
    // Exercícios das aulas práticas: prazo de submissão no Mooshak de cada aula (aparece no guião, no Início e em Semanas).
    { id: "sub02", title: "Exercícios da aula 2", date: "2025-10-07", kind: "submission", url: "guioes/aula02.html#submissao", note: "No Mooshak" },
    { id: "sub03", title: "Exercícios da aula 3", date: "2025-10-14", kind: "submission", url: "guioes/aula03.html#submissao", note: "No Mooshak" },
    { id: "sub04", title: "Exercícios da aula 4", date: "2025-10-28", kind: "submission", url: "guioes/aula04.html#submissao", note: "No Mooshak" },
    { id: "sub05", title: "Exercícios da aula 5", date: "2025-11-04", kind: "submission", url: "guioes/aula05.html#submissao", note: "No Mooshak" },
    { id: "sub06", title: "Exercícios da aula 6", date: "2025-11-11", kind: "submission", url: "guioes/aula06.html#submissao", note: "No Mooshak" },
    { id: "sub07", title: "Exercícios da aula 7", date: "2025-11-20", kind: "submission", url: "guioes/aula07.html#submissao", note: "No Mooshak" },
    { id: "sub08", title: "Exercícios da aula 8", date: "2025-11-24", kind: "submission", url: "guioes/aula08.html#submissao", note: "No Mooshak" },
    { id: "sub09", title: "Exercícios da aula 9", date: "2025-11-30", kind: "submission", url: "guioes/aula09.html#submissao", note: "No Mooshak" },
    { id: "sub10", title: "Exercícios da aula 10", date: "2025-12-08", kind: "submission", url: "guioes/aula10.html#submissao", note: "No Mooshak" },
    { id: "sub11", title: "Exercícios da aula 11", date: "2025-12-15", kind: "submission", url: "guioes/aula11.html#submissao", note: "No Mooshak" },
    { id: "sub12", title: "Exercícios da aula 12", date: "2025-12-30", kind: "submission", url: "guioes/aula12.html#submissao", note: "No Mooshak" },
  ],

  // Avisos: um aviso com data futura só aparece a partir desse dia.
  notices: [
    { date: "2026-02-10", text: '<a href="https://www.dcc.fc.up.pt/~fds/aulas/EDados/2526/evaluation/resultados_exame_28jan2026.pdf">Resultados da época de recurso</a>' },
    { date: "2026-01-18", text: '<a href="https://www.dcc.fc.up.pt/~fds/aulas/EDados/2526/evaluation/resultados_edados_5jan2026.pdf">Resultados da época normal</a>' },
    { date: "2025-12-19", text: '<a href="https://www.dcc.fc.up.pt/~fds/aulas/EDados/2526/evaluation/exame_modelo.pdf">Exame modelo</a>' },
    { date: "2025-12-19", text: '<a href="https://www.dcc.fc.up.pt/~fds/aulas/EDados/2526/evaluation/avalpratica_2526.pdf">Avaliação prática e frequência</a>' },
    { date: "2025-12-08", text: 'Avaliação Prática 2: <a href="https://www.dcc.fc.up.pt/~fds/aulas/EDados/2526/evaluation/turnos_avalpratica2_2526.pdf">turnos e laboratórios</a> · <a href="guioes/teste-pratico-2.html">Treino 2</a>' },
    {
      date: "2025-11-27",
      text: '<a href="https://www.dcc.fc.up.pt/~fds/aulas/EDados/2526/evaluation/quizzes_2526_27nov2025.pdf">Número de respostas aos quizzes</a>',
      details: "Confirma se já tens os 6 quizzes necessários para a frequência.",
    },
    { date: "2025-11-15", text: '<a href="https://www.dcc.fc.up.pt/~fds/aulas/EDados/2526/evaluation/avalpratica1_2526.pdf">Resultados da Avaliação Prática 1</a>' },
    { date: "2025-11-10", text: 'Avaliação Prática 1: <a href="https://www.dcc.fc.up.pt/~fds/aulas/EDados/2526/evaluation/turnos_avalpratica1_2526.pdf">turnos e laboratórios</a>' },
    { date: "2025-10-31", text: 'Avaliação Prática 1: <a href="guioes/teste-pratico-1.html">informação</a> e exercícios de treino no Mooshak (Treino 1)' },
    { date: "2025-10-29", text: 'Disponível a <a href="guioes/aula07.html">aula prática 7</a>' },
    { date: "2025-09-16", text: "As aulas teóricas e práticas começam a 16 de setembro." },
  ],

  footer: "© 2025 Fernando Silva · DCC, Faculdade de Ciências da Universidade do Porto",
  updated: "2025-11-27",
  // Demonstração: congela "hoje" no estado do design aprovado (semana 10).
  // Num site real, apagar esta linha.
  today: "2025-11-27",
};
