/*
 * Programação Imperativa 2025/26 — configuração do ano.
 *
 * Site bilingue (português e inglês): cada texto que muda com a língua é um
 * objeto { pt: "…", en: "…" }. Nas páginas, os blocos com lang="pt" ou
 * lang="en" só aparecem na língua ativa.
 *
 * Para criar o site do ano seguinte: copiar esta pasta (2526 → 2627) e
 * atualizar este ficheiro: edition, semester, deadlines, notices, team e updated.
 * As datas de cada semana são calculadas a partir de semester.start.
 */
// Site original: os PDF da avaliação (com dados de alunos) ficam lá.
const ORIGINAL = "https://www.dcc.fc.up.pt/~fds/aulas/pi/2526/";

window.UC_COURSE = {
  code: "CC1003",
  title: { pt: "Programação Imperativa", en: "Imperative Programming" },
  tagline: {
    pt: "Conceitos fundamentais de programação imperativa em C: algoritmos, modularidade, apontadores, memória dinâmica e estruturas de dados elementares.",
    en: "Fundamental concepts of imperative programming in C: algorithms, modularity, pointers, dynamic memory and basic data structures.",
  },
  edition: "2025/26",
  languages: ["pt", "en"],
  institution: { name: "DCC · FCUP", url: "https://www.dcc.fc.up.pt" },
  accentColor: "#C2410C",
  search: true,

  semester: {
    start: "2026-02-18",
    weeks: 13,
    teachingDays: [1, 5],
    breaks: [
      { start: "2026-03-30", end: "2026-04-03", label: { pt: "Férias da Páscoa", en: "Easter holidays" } },
      // Segunda, 6 de abril, ainda é férias da Páscoa; na sexta, 10, há aulas práticas (aula 6, cont.).
      { start: "2026-04-07", end: "2026-04-09", label: { pt: "Atividades FCUP", en: "FCUP activities" } },
      { start: "2026-05-04", end: "2026-05-08", label: { pt: "Semana da Queima", en: "Students' week (Queima)" } },
    ],
  },

  pages: [
    "home",
    { id: "weeks", href: "semanas.html" },
    { id: "summaries", href: "sumarios.html", label: { pt: "Sumários", en: "Summaries" } },
    { id: "assessment", href: "avaliacao.html" },
    { id: "materials", href: "materiais.html" },
    { id: "schedule", href: "horarios.html" },
    { id: "about", href: { pt: "sobre.html", en: "about.html" } },
  ],

  platforms: [
    { id: "mooshak", label: "Mooshak", url: "https://mooshak.dcc.fc.up.pt/~pi/" },
    { label: "SIGARRA", url: "https://sigarra.up.pt/fcup/" },
  ],

  team: [
    { name: "Fernando Silva", url: "https://www.dcc.fc.up.pt/~fds", role: { pt: "Co-regente", en: "Course coordinator" }, classes: ["T1", "T2"], office: "Gab. 1.25",
      officeHours: [{ day: 2, start: "14:30", end: "15:30" }, { day: 4, start: "16:00", end: "17:00" }] },
    { name: "Vanessa Silva", url: "https://www.dcc.fc.up.pt/~vanessa.silva/", role: { pt: "Co-regente", en: "Course coordinator" }, classes: ["T1", "T2", "PL2", "PL6"], office: "Gab. 0.09",
      officeHours: [{ day: 3, start: "11:00", end: "12:00" }, { day: 4, start: "09:30", end: "10:30" }] },
    { name: "Ricardo Pereira", role: "assistant", classes: ["PL1"] },
    { name: "Tadeu Freitas", role: "assistant", classes: ["PL3", "PL5"] },
    { name: "Pedro D'Orey", role: "assistant", classes: ["PL4", "PL7"] },
    { name: "Bernardo Portela", role: "assistant", classes: ["PL8"] },
  ],

  // Horário: uma entrada por aula semanal. Os docentes de cada turma vêm de team[].classes.
  schedule: [
    { type: "lecture", class: "T1", day: 2, start: "12:00", end: "13:00", room: "FC1 0.03" },
    { type: "lecture", class: "T1", day: 4, start: "12:00", end: "13:00", room: "FC1 0.03" },
    { type: "lecture", class: "T2", day: 2, start: "11:00", end: "12:00", room: "FC1 0.07" },
    { type: "lecture", class: "T2", day: 4, start: "11:00", end: "12:00", room: "FC1 0.07" },
    { type: "lab", class: "PL4", day: 1, start: "09:00", end: "11:00", room: "FC6 1.84" },
    { type: "lab", class: "PL7", day: 1, start: "11:00", end: "13:00", room: "FC6 1.55" },
    { type: "lab", class: "PL5", day: 1, start: "14:00", end: "16:00", room: "FC6 1.55" },
    { type: "lab", class: "PL2", day: 2, start: "14:00", end: "16:00", room: "FC6 1.82" },
    { type: "lab", class: "PL1", day: 3, start: "09:00", end: "11:00", room: "FC6 1.65" },
    { type: "lab", class: "PL6", day: 3, start: "09:00", end: "11:00", room: "FC6 1.63" },
    { type: "lab", class: "PL3", day: 4, start: "14:00", end: "16:00", room: "FC6 1.63" },
    { type: "lab", class: "PL8", day: 5, start: "09:00", end: "11:00", room: "FC6 1.82" },
  ],

  deadlines: [
    {
      id: "ap1",
      title: { pt: "Avaliação Prática 1", en: "Practical evaluation 1" },
      date: "2026-04-22",
      time: "14:15",
      kind: "assessment",
      duration: 105,
      shifts: [{ time: "14:15", end: "16:05" }, { time: "16:15", end: "18:05" }],
      location: {
        pt: `Laboratórios do DCC · <a href="${ORIGINAL}evaluation/Aval1_Labs_Turnos1e2.pdf">turno e laboratório de cada estudante</a>`,
        en: `DCC labs · <a href="${ORIGINAL}evaluation/Aval1_Labs_Turnos1e2.pdf">shift and lab for each student</a>`,
      },
      note: { pt: "No Mooshak", en: "On Mooshak" },
      url: "praticas/teste_pratico1.html",
      links: [
        { label: { pt: "Resultados", en: "Results" }, url: ORIGINAL + "evaluation/PI2526_aval1_22Abril.pdf" },
      ],
    },
    {
      id: "ap2",
      title: { pt: "Avaliação Prática 2", en: "Practical evaluation 2" },
      date: "2026-05-27",
      time: "14:10",
      kind: "assessment",
      duration: 120,
      shifts: [{ time: "14:10", end: "16:05" }, { time: "16:10", end: "18:05" }],
      location: {
        pt: `Laboratórios do DCC · <a href="${ORIGINAL}evaluation/Aval2_Labs_Turnos1e2.pdf">turno e laboratório de cada estudante</a>`,
        en: `DCC labs · <a href="${ORIGINAL}evaluation/Aval2_Labs_Turnos1e2.pdf">shift and lab for each student</a>`,
      },
      note: { pt: "No Mooshak", en: "On Mooshak" },
      url: "praticas/teste_pratico2.html",
      links: [
        // No site original, este link aponta para um ficheiro com o prefixo do ano anterior (PI2425_…).
        { label: { pt: "Resultados", en: "Results" }, url: ORIGINAL + "evaluation/PI2526_avalprat_1jun2026.pdf" },
      ],
    },
    {
      id: "exam",
      title: { pt: "Exame, época normal", en: "Exam, regular period" },
      date: "2026-06-12",
      time: "09:00",
      kind: "exam",
      duration: 120,
      location: { pt: "Salas no SIGARRA", en: "Rooms on SIGARRA" },
      links: [
        { label: { pt: "Salas", en: "Rooms" }, url: "https://sigarra.up.pt/fcup/pt/exa_geral.mapa_de_exames?p_ocorr_id=570322" },
        { label: { pt: "Exame modelo", en: "Model exam (PT)" }, url: ORIGINAL + "evaluation/exame_modelo.pdf" },
        { label: { pt: "Exame modelo (EN)", en: "Model exam" }, url: ORIGINAL + "evaluation/exam_model_en.pdf" },
      ],
    },
    {
      id: "resit",
      title: { pt: "Exame, época de recurso", en: "Exam, resit period" },
      date: "2026-07-07",
      time: "09:00",
      kind: "exam",
      duration: 120,
      location: { pt: "Salas no SIGARRA", en: "Rooms on SIGARRA" },
      links: [{ label: { pt: "Salas", en: "Rooms" }, url: "https://sigarra.up.pt/fcup/pt/exa_geral.mapa_de_exames?p_ocorr_id=570322" }],
    },
    // Prazos de submissão dos problemas de cada aula prática (Mooshak).
    {
      id: "aula03",
      title: { pt: "Problemas da aula 3", en: "Problems of class 3" },
      date: "2026-03-17",
      kind: "submission",
      note: { pt: "No Mooshak", en: "On Mooshak" },
      url: "praticas/problems/index.html#aula-3",
    },
    {
      id: "aula04",
      title: { pt: "Problemas da aula 4", en: "Problems of class 4" },
      date: "2026-03-24",
      kind: "submission",
      note: { pt: "No Mooshak", en: "On Mooshak" },
      url: "praticas/problems/index.html#aula-4",
    },
    {
      id: "aula05",
      title: { pt: "Problemas da aula 5", en: "Problems of class 5" },
      date: "2026-03-31",
      kind: "submission",
      note: { pt: "No Mooshak", en: "On Mooshak" },
      url: "praticas/problems/index.html#aula-5",
    },
    {
      id: "aula06",
      title: { pt: "Problemas da aula 6", en: "Problems of class 6" },
      date: "2026-04-14",
      kind: "submission",
      note: { pt: "No Mooshak", en: "On Mooshak" },
      url: "praticas/problems/index.html#aula-6",
    },
    {
      id: "aula07",
      title: { pt: "Problemas da aula 7", en: "Problems of class 7" },
      date: "2026-04-25",
      kind: "submission",
      note: { pt: "No Mooshak", en: "On Mooshak" },
      url: "praticas/problems/index.html#aula-7",
    },
    {
      id: "aula08",
      title: { pt: "Problemas da aula 8", en: "Problems of class 8" },
      date: "2026-05-09",
      kind: "submission",
      note: { pt: "No Mooshak", en: "On Mooshak" },
      url: "praticas/problems/index.html#aula-8",
    },
    {
      id: "aula09",
      title: { pt: "Problemas da aula 9", en: "Problems of class 9" },
      date: "2026-05-23",
      kind: "submission",
      note: { pt: "No Mooshak", en: "On Mooshak" },
      url: "praticas/problems/index.html#aula-9",
    },
    {
      id: "aula10",
      title: { pt: "Problemas da aula 10", en: "Problems of class 10" },
      date: "2026-06-11",
      kind: "submission",
      note: { pt: "No Mooshak", en: "On Mooshak" },
      url: "praticas/problems/index.html#aula-10",
    },
    {
      id: "aula11",
      title: { pt: "Problemas da aula 11", en: "Problems of class 11" },
      date: "2026-06-15",
      kind: "submission",
      note: { pt: "No Mooshak", en: "On Mooshak" },
      url: "praticas/problems/index.html#aula-11",
    },
    {
      id: "aula12",
      title: { pt: "Problemas da aula 12", en: "Problems of class 12" },
      date: "2026-06-15",
      kind: "submission",
      note: { pt: "No Mooshak", en: "On Mooshak" },
      url: "praticas/problems/index.html#aula-12",
    },
  ],

  // Avisos: um aviso com data futura só aparece a partir desse dia.
  // Os PDF com resultados, salas e presenças têm dados de alunos: ficam no site original.
  notices: [
    {
      date: "2026-07-16",
      text: {
        pt: `<a href="${ORIGINAL}evaluation/PI2526_aval_epoca_recurso.pdf">Resultados do exame da época de recurso</a>`,
        en: `<a href="${ORIGINAL}evaluation/PI2526_aval_epoca_recurso.pdf">Exam results (resit period)</a>`,
      },
    },
    {
      date: "2026-06-21",
      text: {
        pt: `<a href="${ORIGINAL}evaluation/PI2526_Correcao_Normal.pdf">Correção do exame da época normal</a>`,
        en: `<a href="${ORIGINAL}evaluation/PI2526_Correcao_Normal.pdf">Regular exam: solutions</a>`,
      },
    },
    {
      date: "2026-06-20",
      text: {
        pt: `<a href="${ORIGINAL}evaluation/PI2526_aval_epoca_normal.pdf">Resultados do exame da época normal</a>`,
        en: `<a href="${ORIGINAL}evaluation/PI2526_aval_epoca_normal.pdf">Exam results (regular period)</a>`,
      },
    },
    {
      date: "2026-06-12",
      text: {
        pt: `<a href="${ORIGINAL}evaluation/PI2526_avalprat_12jun2026.pdf">Resultados finais da avaliação prática</a>`,
        en: `<a href="${ORIGINAL}evaluation/PI2526_avalprat_12jun2026.pdf">Final results of the practical evaluation</a>`,
      },
    },
    {
      date: "2026-06-09",
      text: {
        pt: `<a href="${ORIGINAL}evaluation/PI2526_salas_exame.pdf">Salas do exame</a>`,
        en: `<a href="${ORIGINAL}evaluation/PI2526_salas_exame.pdf">Exam rooms</a>`,
      },
      details: {
        pt: "Cada estudante tem de ir à sala que lhe foi atribuída.",
        en: "Each student must go to the allocated exam room.",
      },
    },
    {
      date: "2026-06-01",
      text: {
        pt: `<a href="${ORIGINAL}evaluation/exame_modelo.pdf">Exame modelo de Programação Imperativa</a>`,
        en: `<a href="${ORIGINAL}evaluation/exam_model_en.pdf">Model exam for Imperative Programming</a>`,
      },
    },
    {
      date: "2026-06-01",
      text: {
        pt: `<a href="${ORIGINAL}evaluation/PI2526_avalprat_1jun2026.pdf">Resultados das avaliações práticas</a>`,
        en: `<a href="${ORIGINAL}evaluation/PI2526_avalprat_1jun2026.pdf">Results of the practical evaluations</a>`,
      },
    },
    {
      date: "2026-05-21",
      text: {
        pt: 'Avaliação Prática 2: <a href="praticas/teste_pratico2.html">informação e treino</a>',
        en: 'Practical evaluation 2: <a href="praticas/teste_pratico2.html">information and practice</a>',
      },
    },
    {
      date: "2026-04-26",
      text: {
        pt: `<a href="${ORIGINAL}evaluation/PI2526_aval1_22Abril.pdf">Resultados da Avaliação Prática 1</a>`,
        en: `<a href="${ORIGINAL}evaluation/PI2526_aval1_22Abril.pdf">Results of practical evaluation 1</a>`,
      },
    },
    {
      date: "2026-04-18",
      text: {
        pt: 'Avaliação Prática 1: turnos e laboratórios de cada estudante e presenças nas aulas práticas, em <a href="avaliacao.html#progresso">Avaliação</a>',
        en: 'Practical evaluation 1: shift and lab for each student, and attendance in practical classes, in <a href="avaliacao.html#progresso">Assessment</a>',
      },
    },
    {
      date: "2026-04-01",
      text: {
        pt: 'Foram atualizadas as <a href="avaliacao.html#progresso">estatísticas da resolução de problemas</a> no Mooshak',
        en: 'You can now check the <a href="avaliacao.html#progresso">evaluation progress</a> of the Mooshak exercises',
      },
    },
    {
      date: "2026-04-01",
      text: {
        pt: 'Avaliação Prática 1: <a href="praticas/teste_pratico1.html">informação e treino</a>',
        en: 'Practical evaluation 1: <a href="praticas/teste_pratico1.html">information and practice</a>',
      },
    },
    {
      date: "2026-02-28",
      text: { pt: "Mooshak: login e password enviados por email", en: "Mooshak: login and password sent by email" },
      details: {
        pt: "Se não encontrares a mensagem, vê a pasta de SPAM ou pede-a ao docente da tua aula prática.",
        en: "If you can't find it, check your SPAM folder or ask the lecturer of your practical class.",
      },
    },
    {
      date: "2026-02-13",
      text: {
        pt: "As aulas teóricas e práticas começam na semana de 18 de fevereiro.",
        en: "Lectures and practical classes start on the week of 18 February.",
      },
    },
  ],

  source: {
    author: { pt: "Fernando Silva e Vanessa Silva (DCC/FCUP)", en: "Fernando Silva and Vanessa Silva (DCC/FCUP)" },
    url: "https://www.dcc.fc.up.pt/~fds/aulas/pi/2526/",
  },

  footer: "© 2026 Fernando Silva · DCC, Faculdade de Ciências da Universidade do Porto",
  updated: "2026-02-16",
  // Demonstração: congela "hoje" na semana 7, antes da Avaliação Prática 1.
  // Num site real, apagar esta linha.
  today: "2026-04-16",
};
