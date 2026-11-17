/*
 * Competitive Programming 2026/27 — configuration of the year.
 *
 * The original site is in English only, so this example is too
 * (languages: ["en"]). To make next year's site: copy this folder
 * (2627 → 2728) and update this file: edition, semester, deadlines,
 * notices and updated. Week dates are computed from semester.start.
 */
window.UC_COURSE = {
  code: "CC3032",
  title: "Competitive Programming",
  tagline: "Algorithms and data structures for programming contests: weekly problem sets, on-site contests and problem creation.",
  edition: "2026/27",
  languages: ["en"],
  institution: { name: "DCC · FCUP", url: "https://www.dcc.fc.up.pt" },
  // Navy, close to the bars of the original site.
  accentColor: "#1E3A6E",

  semester: {
    start: "2026-09-15",
    // One class a week, on Tuesday.
    teachingDays: [2, 2],
    weeks: 11,
    breaks: [
      { start: "2026-10-26", end: "2026-10-30", label: "FCUP Activities Week" },
      // Two Tuesday holidays in a row (1 and 8 Dec): one break covers both.
      { start: "2026-12-01", end: "2026-12-08", label: "National holidays" },
    ],
  },

  pages: [
    "home",
    { id: "weeks", href: "classes.html", label: "Classes" },
    { id: "problems", href: "problems/index.html", label: "Problems" },
    { id: "assessment", href: "evaluation.html", label: "Evaluation" },
    { id: "rankings", href: "rankings.html", label: "Lists and rankings" },
    { id: "materials", href: "materials.html", label: "Study material" },
  ],

  platforms: [
    { label: "Mooshak", url: "https://mooshak.dcc.fc.up.pt/~pc/" },
    { label: "CodeForces", url: "https://codeforces.com/" },
    { label: "Discord", url: "https://discord.com/app" },
    { label: "SIGARRA", url: "https://sigarra.up.pt/fcup/pt/UCURR_GERAL.FICHA_UC_VIEW?pv_ocorrencia_id=589591" },
  ],

  team: [
    { name: "Pedro Ribeiro", url: "https://www.dcc.fc.up.pt/~pribeiro/", role: "coordinator" },
  ],

  deadlines: [
    // TODO: one deadline per weekly problem set (kind "submission"); the dates are on the ps01–ps06 pages, which could not be read yet.
    {
      id: "contest1",
      title: "1st Contest",
      date: "2026-10-20",
      kind: "assessment",
      note: "In class, individual, ICPC style · 30% of CE",
      url: "https://www.dcc.fc.up.pt/~pribeiro/aulas/pc2627/contest1.html",
    },
    {
      id: "contest2",
      title: "2nd Contest",
      date: "2026-12-15",
      kind: "assessment",
      note: "In class, individual, partial scoring · 30% of CE",
    },
    {
      id: "contest3",
      title: "3rd Contest",
      // TODO: the original site says "Jan ?"; only the month is known.
      date: "2027-01",
      kind: "assessment",
      note: "Format to be defined · 40% of CE",
    },
    {
      id: "problem-creation",
      title: "Problem creation (PC)",
      // TODO: the original site says "deadline: Jan ?".
      date: "2027-01",
      kind: "submission",
      note: "Statement, solution, editorial, inputs/outputs and generator",
      url: "evaluation.html#pdc",
    },
    {
      id: "code-presentation",
      title: "Code presentation (CQ)",
      // TODO: the original site says "deadline: Jan ?".
      date: "2027-01",
      kind: "assessment",
      note: "Discuss the code you submitted with the professor",
      url: "evaluation.html#pdc",
    },
  ],

  // A notice with a future date only appears from that day on.
  notices: [
    {
      date: "2026-09-15",
      text: 'Questions and answers on <a href="https://discord.com/app">Discord</a>.',
      details: "The invite for the server was sent by email.",
    },
  ],

  footer: '<a href="https://www.dcc.fc.up.pt/~pribeiro/">Pedro Ribeiro</a> · <a href="https://www.dcc.fc.up.pt/">DCC</a>/<a href="https://www.fc.up.pt/">FCUP</a>',
  updated: "2026-11-10",
  // Demo: freezes "today" at the date the original site was captured
  // (week 9, class #07). On a real site, delete this line.
  today: "2026-11-17",
};
