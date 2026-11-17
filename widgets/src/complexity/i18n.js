/**
 * Strings of <uc-widget-complexity>, `widget.complexity.*`. The functions
 * are written the same in every language (LABELS in ./algorithm.js); there
 * is no pseudocode (the panel is hidden).
 */
import { LABELS } from "./algorithm.js";

export const strings = {
  pt: {
    caption: { growth: "Crescimento de funções" },
    code: { growth: [] },
    name: "{f}",
    aux: LABELS,
    edit: "Funções (1 log sqrt n nlogn n2 n3 2n fact)",
    linear: "escala linear",
    log: "escala logarítmica",
    measured: "medido",
    describe: "Gráfico de {list}, de n = 1 a {max}, em {scale}.",
    describeDots: "Pontos medidos ({stat}, n: valor): {list}.",
    added: "Novo ponto medido: n = {n}, {count} ({stat}).",
    column: { function: "Função", value: "Valor em n = {n}" },
    start: "{k} funções de n, de n = 1 a {max}. Passo a passo, n cresce e vê-se qual cresce mais depressa.",
    at: "n = {n}: {list}.",
    overtake: "n = {n}: {list}. {a} passa à frente de {b}.",
    end: "Em n = {n}: {chain}.",
    predict: "Em n = {n}, qual é maior: {a} ou {b}?",
    error: {
      max: "max vai de 2 a {max}.",
      function: "função desconhecida «{name}»; use {list}.",
      repeat: "repita cada função uma só vez, até 8.",
      point: "o ponto «{pair}» deve ser n:valor (por exemplo 8:28).",
    },
  },
  en: {
    caption: { growth: "Growth of functions" },
    code: { growth: [] },
    name: "{f}",
    aux: LABELS,
    edit: "Functions (1 log sqrt n nlogn n2 n3 2n fact)",
    linear: "linear scale",
    log: "logarithmic scale",
    measured: "measured",
    describe: "Chart of {list}, from n = 1 to {max}, on a {scale}.",
    describeDots: "Measured points ({stat}, n: value): {list}.",
    added: "New measured point: n = {n}, {count} ({stat}).",
    column: { function: "Function", value: "Value at n = {n}" },
    start: "{k} functions of n, from n = 1 to {max}. Step by step n grows and you see which grows fastest.",
    at: "n = {n}: {list}.",
    overtake: "n = {n}: {list}. {a} overtakes {b}.",
    end: "At n = {n}: {chain}.",
    predict: "At n = {n}, which is larger: {a} or {b}?",
    error: {
      max: "max goes from 2 to {max}.",
      function: "unknown function “{name}”; use {list}.",
      repeat: "give each function once, at most 8.",
      point: "the point “{pair}” must be n:value (for example 8:28).",
    },
  },
};
