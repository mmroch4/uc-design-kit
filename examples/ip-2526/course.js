/*
 * Introduction to Programming 2025/26: configuration for the year.
 *
 * To create next year's site: copy this folder (2526 → 2627) and update
 * this file: edition, semester, deadlines, notices, team and updated.
 * The dates of each week are computed from semester.start.
 */
window.UC_COURSE = {
  code: "CC1024",
  title: "Introduction to Programming",
  tagline: "Learn to program in Python: variables and functions, lists, strings and dictionaries, recursion and files, with weekly problems submitted to Mooshak.",
  edition: "2025/26",
  languages: ["en"],
  institution: { name: "DCC · FCUP", url: "https://www.dcc.fc.up.pt" },
  accentColor: "#2B5B84",

  semester: {
    start: "2025-09-15",
    weeks: 13,
    teachingDays: [1, 5],
    breaks: [{ start: "2025-10-27", end: "2025-10-31", label: "FCUP Activities Week" }],
  },

  pages: [
    "home",
    { id: "weeks", href: "weeks.html" },
    { id: "assessment", href: "assessment.html" },
    { id: "materials", href: "materials.html" },
    { id: "about", href: "about.html", label: "General information" },
  ],

  platforms: [
    { label: "Mooshak", url: "https://mooshak.dcc.fc.up.pt/~ip/" },
    { label: "Discord", url: "https://discord.com/app/" },
    { label: "SIGARRA", url: "https://sigarra.up.pt/fcup/en/ucurr_geral.ficha_uc_view?pv_ocorrencia_id=570289" },
  ],

  team: [
    { name: "Pedro Ribeiro", url: "https://www.dcc.fc.up.pt/~pribeiro/", role: "lecturer", classes: ["T", "PL"] },
    { name: "Bernardo Portela", url: "https://sigarra.up.pt/fcup/pt/func_geral.formview?p_codigo=601816", role: "lecturer", classes: ["T", "PL"] },
    { name: "Alberto Barbosa", url: "https://sigarra.up.pt/fcup/en/func_geral.formview?p_codigo=631380", role: "assistant" },
    { name: "Miriam Santos", url: "https://sigarra.up.pt/fcup/en/func_geral.formview?p_codigo=669751", role: "assistant" },
    { name: "Pedro Moreno", url: "https://sigarra.up.pt/fcup/en/func_geral.formview?p_codigo=665692", role: "assistant" },
    { name: "Ricardo Pereira", url: "https://sigarra.up.pt/fcup/en/func_geral.formview?p_codigo=690505", role: "assistant" },
    { name: "Tadeu Freitas", url: "https://sigarra.up.pt/fcup/en/func_geral.formview?p_codigo=617210", role: "assistant" },
  ],

  deadlines: [
    // Submission deadline of each practical class (Mooshak). TODO: classes #02–#04 and #06–#11 (see MIGRACAO.md).
    { id: "p01", title: "Class #01 submissions close", date: "2025-10-11", kind: "submission", note: "IP001–IP007 · on Mooshak", url: "practical/class01.html" },
    { id: "p05", title: "Class #05 submissions close", date: "2025-11-08", kind: "submission", note: "IP045–IP058 · on Mooshak", url: "practical/class05.html" },
    {
      id: "t1",
      title: "1st Practical Test",
      date: "2025-11-05",
      time: "14:30",
      duration: 120,
      kind: "assessment",
      shifts: [{ time: "14:30" }, { time: "16:30" }],
      location: 'DCC Labs (FC6) · <a href="https://www.dcc.fc.up.pt/~pribeiro/aulas/ip2526/evaluation/turnos_teste1.pdf" data-auth>allocation to shift and room</a>',
      url: "practical/test1.html",
    },
    {
      id: "t2",
      title: "2nd Practical Test",
      date: "2025-12-17",
      kind: "assessment",
      url: "practical/test2.html",
    },
    {
      id: "exam",
      title: "Written Exam (Época Normal)",
      date: "2026-01-06",
      time: "14:00",
      duration: 120,
      kind: "exam",
      location: 'FC1 120, FC1 122, FC1 219 · <a href="https://www.dcc.fc.up.pt/~pribeiro/aulas/ip2526/evaluation/salas_jan6.pdf" data-auth>student allocation to rooms</a>',
      url: "exam.html",
    },
    { id: "improvement", title: "Improvement Test (T1 or T2)", date: null, kind: "assessment", note: "Choose which practical test to improve" },
  ],

  // Notices: a notice dated in the future only appears from that day on.
  notices: [
    { date: "2026-02-05", text: 'Grades (Época de Recurso) published: <a data-auth href="https://www.dcc.fc.up.pt/~pribeiro/aulas/ip2526/evaluation/epoca_recurso.pdf">PDF</a>' },
    { date: "2026-01-18", text: 'Grades (Época Normal) published: <a data-auth href="https://www.dcc.fc.up.pt/~pribeiro/aulas/ip2526/evaluation/epoca_normal.pdf">PDF</a>' },
    { date: "2025-12-15", text: 'Information about the <a href="exam.html">written exam</a> published (Época Normal)' },
    { date: "2025-12-10", text: 'Information about the <a href="https://www.dcc.fc.up.pt/~pribeiro/aulas/ip2526/practical/test2.html">2nd practical test</a> published' },
    { date: "2025-12-07", text: 'Practical class <a href="https://www.dcc.fc.up.pt/~pribeiro/aulas/ip2526/practical/class11.html">#11</a> made available (exceptions)' },
    { date: "2025-12-04", text: 'Lecture notebook uploaded: <a href="materials.html#lectures">#21</a> (exceptions)' },
    { date: "2025-12-01", text: 'Practical class <a href="https://www.dcc.fc.up.pt/~pribeiro/aulas/ip2526/practical/class10.html">#10</a> made available (structured programming and incremental development)' },
    { date: "2025-11-28", text: 'Lecture notebook uploaded: <a href="materials.html#lectures">#20</a> (variable scope and modules)' },
    { date: "2025-11-24", text: 'Lecture notebook uploaded: <a href="materials.html#lectures">#19</a> (structured programming)' },
    { date: "2025-11-23", text: 'Practical class <a href="https://www.dcc.fc.up.pt/~pribeiro/aulas/ip2526/practical/class09.html">#09</a> made available (recursion)' },
    { date: "2025-11-15", text: 'Lecture notebooks uploaded: <a href="materials.html#lectures">#17 and #18</a> (recursion)' },
    { date: "2025-11-15", text: 'Practical class <a href="https://www.dcc.fc.up.pt/~pribeiro/aulas/ip2526/practical/class08.html">#08</a> made available (advanced strings)' },
    { date: "2025-11-14", text: 'Lecture notebook uploaded: <a href="materials.html#lectures">#16</a> (files)' },
    { date: "2025-11-09", text: 'Lecture notebook uploaded: <a href="materials.html#lectures">#15</a> (more on strings)' },
    { date: "2025-11-09", text: 'Practical class <a href="https://www.dcc.fc.up.pt/~pribeiro/aulas/ip2526/practical/class07.html">#07</a> made available (dictionaries and sets)' },
    { date: "2025-11-06", text: 'Lecture notebook uploaded: <a href="materials.html#lectures">#14</a> (dictionaries)' },
    { date: "2025-11-02", text: 'Practical class <a href="https://www.dcc.fc.up.pt/~pribeiro/aulas/ip2526/practical/class06.html">#06</a> made available (correction and efficiency)' },
    { date: "2025-10-28", text: 'Information about the <a href="practical/test1.html">1st practical test</a> published' },
    { date: "2025-10-23", text: 'Lecture notebook uploaded: <a href="materials.html#lectures">#12</a> (algorithms)' },
    { date: "2025-10-17", text: 'Practical class <a href="practical/class05.html">#05</a> made available (lists)' },
    { date: "2025-10-17", text: 'Lecture notebook uploaded: <a href="materials.html#lectures">#11</a> (pseudo-randomness)' },
    { date: "2025-10-11", text: 'Practical class <a href="https://www.dcc.fc.up.pt/~pribeiro/aulas/ip2526/practical/class04.html">#04</a> made available (tuples and strings)' },
    { date: "2025-10-10", text: 'Lecture notebooks uploaded: <a href="materials.html#lectures">#09</a> (advanced lists) and #10 (sets)' },
    { date: "2025-10-04", text: 'Practical class <a href="https://www.dcc.fc.up.pt/~pribeiro/aulas/ip2526/practical/class03.html">#03</a> made available (functions)' },
    { date: "2025-10-03", text: 'Lecture notebooks uploaded: <a href="materials.html#lectures">#07</a> (tuples and lists) and #08 (more on lists)' },
    { date: "2025-09-29", text: 'Evaluation elements made available (authentication sent by email)' },
    { date: "2025-09-28", text: 'Practical class <a href="https://www.dcc.fc.up.pt/~pribeiro/aulas/ip2526/practical/class02.html">#02</a> made available (conditionals and program flow)' },
    { date: "2025-09-24", text: 'Lecture notebooks uploaded: <a href="materials.html#lectures">#04</a> (program flow), #05 (functions) and #06 (more on functions)' },
    { date: "2025-09-21", text: 'Practical class <a href="practical/class01.html">#01</a> made available (first programs and submissions to Mooshak)' },
    { date: "2025-09-20", text: 'Lecture notebook uploaded: <a href="materials.html#lectures">#03</a> (conditionals)' },
    { date: "2025-09-16", text: 'Lecture notebook uploaded: <a href="materials.html#lectures">#02</a> (the basics)' },
    { date: "2025-09-14", text: "Update with all core information about the course" },
    { date: "2025-09-08", text: "Website made available" },
  ],

  footer: '© 2025 <a href="https://www.dcc.fc.up.pt/~pribeiro/">Pedro Ribeiro</a> and Bernardo Portela · DCC, Faculty of Sciences, University of Porto',
  updated: "2026-02-05",
  // Demo: freezes "today" in week 10 of the semester, like the other examples.
  // In a real site, delete this line.
  today: "2025-11-27",
};
