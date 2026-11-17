/**
 * Interface strings of <uc-grading> (docs/plan/grading-api.md 2.1 and 11),
 * part of uc-grading.js. Added with UC.internal.addDefaults, so strings a
 * site already set with UC.addTranslations win.
 */
(function (UC) {
  "use strict";
  if (!UC) return;

  UC.internal.addDefaults("pt", {
    grading: {
      heading: "Como é calculada a nota",
      caption: "Componentes da nota",
      column: { component: "Componente", weight: "Peso", minimum: "Mínimo" },
      formula: "Nota",
      formulaN: "Fórmula {n}",
      max: "máx",
      maxTitle: "máximo",
      min: "mín",
      minTitle: "mínimo",
      rules: "Para aprovar",
      minimumOf: "{min} em {scale}",
      shareOf: "{share} de {parent}",
      bonus: "Bónus · até {max}",
      point: "{n} valor",
      points: "{n} valores",
      calculator: {
        legend: "Simular a nota",
        field: "{code}: {name} (0 a {scale})",
        invalid: "Escreve um número entre 0 e {scale}.",
        result: "Nota final: {grade} valores",
        incomplete: "Preenche todas as componentes para ver a nota.",
        pass: "Aprovado nesta simulação",
        belowMin: "Abaixo do mínimo em {code} ({min} em {scale})",
        belowPass: "Abaixo de {pass}",
        disclaimer: "Simulação. A nota oficial é a publicada no SIGARRA.",
      },
    },
  });
  UC.internal.addDefaults("en", {
    grading: {
      heading: "How the grade is calculated",
      caption: "Grade components",
      column: { component: "Component", weight: "Weight", minimum: "Minimum" },
      formula: "Grade",
      formulaN: "Formula {n}",
      max: "max",
      maxTitle: "maximum",
      min: "min",
      minTitle: "minimum",
      rules: "To pass",
      minimumOf: "{min} out of {scale}",
      shareOf: "{share} of {parent}",
      bonus: "Bonus · up to {max}",
      point: "{n} point",
      points: "{n} points",
      calculator: {
        legend: "Simulate your grade",
        field: "{code}: {name} (0 to {scale})",
        invalid: "Enter a number between 0 and {scale}.",
        result: "Final grade: {grade}",
        incomplete: "Fill in every component to see the grade.",
        pass: "Pass in this simulation",
        belowMin: "Below the minimum in {code} ({min} out of {scale})",
        belowPass: "Below {pass}",
        disclaimer: "Simulation only. The official grade is the one published on SIGARRA.",
      },
    },
  });
})(window.UC);
