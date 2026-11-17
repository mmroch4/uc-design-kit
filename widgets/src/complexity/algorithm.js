/**
 * Growth functions of <uc-widget-complexity>, as step lists
 * (docs/architecture/widgets-api.md 6.4). Pure: no DOM, no UC, no Math.random.
 *
 * Input: { functions: ["1", "log", …], max }. One step per n from 1 to max:
 * state { n, values } (every function at n, numbers). Marks are function
 * ids: the two functions whose order changes at n are "swapped". The last
 * step lists the functions in increasing order at max. log is base 2.
 */
import { InputError } from "../core/engine.js";

export const ALGORITHMS = ["growth"];
export const MAX_N = 32;

const FACT = [1];
for (let i = 1; i <= MAX_N; i += 1) FACT.push(FACT[i - 1] * i);

/** Every function the widget knows, slowest growth first. */
export const FUNCTIONS = {
  1: () => 1,
  log: (n) => Math.log2(n),
  sqrt: (n) => Math.sqrt(n),
  n: (n) => n,
  nlogn: (n) => n * Math.log2(n),
  n2: (n) => n * n,
  n3: (n) => n * n * n,
  "2n": (n) => 2 ** n,
  fact: (n) => FACT[n],
};
export const ORDER = Object.keys(FUNCTIONS);
/** How each function is written: the same in every language. */
export const LABELS = { 1: "1", log: "log n", sqrt: "√n", n: "n", nlogn: "n log n", n2: "n²", n3: "n³", "2n": "2ⁿ", fact: "n!" };
export const DEFAULT = ["1", "log", "n", "nlogn", "n2", "2n"];
/** Grows faster than any polynomial: left out of the linear scale's height. */
export const EXPONENTIAL = ["2n", "fact"];

/** A value as text: integers as they are, one decimal otherwise, ×10^k when huge. */
export function show(value) {
  if (value >= 1e9) {
    const k = Math.floor(Math.log10(value));
    const sup = String(k).replace(/\d/g, (d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[d]);
    return `${(value / 10 ** k).toFixed(1)}·10${sup}`;
  }
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

/** "1 log n nlogn" → ids, in the order given; throws InputError for an unknown name or a repeat. */
export function parseFunctions(text) {
  const names = String(text ?? "").trim().split(/[\s,]+/).filter(Boolean);
  const list = names.length ? names : DEFAULT;
  for (const name of list) if (!ORDER.includes(name)) throw new InputError("widget.complexity.error.function", { name, list: ORDER.join(" ") });
  if (new Set(list).size !== list.length || list.length > 8) throw new InputError("widget.complexity.error.repeat");
  return list;
}

export function run({ functions = DEFAULT, max = 16 }, { algorithm = "growth" } = {}, emit) {
  if (!ALGORITHMS.includes(algorithm)) throw new Error(`unknown algorithm ${algorithm}`);
  const name = (id) => ["widget.complexity.name", { f: LABELS[id] }];
  const at = (n) => Object.fromEntries(functions.map((id) => [id, FUNCTIONS[id](n)]));
  const list = (values) => functions.map((id) => `${LABELS[id]} = ${show(values[id])}`);
  emit({ state: { n: 0, values: {} }, marks: {}, line: null, say: ["widget.complexity.start", { k: functions.length, max }], code: algorithm });

  // The last strict order of every pair: +1 when the first is larger.
  const sign = {};
  let values = {};
  for (let n = 1; n <= max; n += 1) {
    values = at(n);
    const marks = {};
    let overtake = null;
    for (let i = 0; i < functions.length; i += 1) {
      for (let j = i + 1; j < functions.length; j += 1) {
        const [a, b] = [functions[i], functions[j]];
        const s = Math.sign(values[a] - values[b]);
        const key = `${a} ${b}`;
        if (!s) continue;
        if (sign[key] && sign[key] !== s) {
          marks[a] = marks[b] = "swapped";
          overtake = overtake || (s > 0 ? [a, b] : [b, a]);
        }
        sign[key] = s;
      }
    }
    const aux = Object.fromEntries(functions.map((id) => [id, show(values[id])]));
    const step = { state: { n, values }, marks, line: null, code: algorithm, aux, say: ["widget.complexity.at", { n, list: list(values).join(", ") }] };
    if (overtake) {
      const [a, b] = overtake;
      step.say = ["widget.complexity.overtake", { n, list: list(values).join(", "), a: LABELS[a], b: LABELS[b] }];
      const options = [a, b].sort((x, y) => ORDER.indexOf(x) - ORDER.indexOf(y));
      step.predict = { ask: ["widget.complexity.predict", { n, a: LABELS[options[0]], b: LABELS[options[1]] }], options: options.map(name), answer: options.indexOf(a) };
    }
    emit(step);
  }
  const ranked = functions.slice().sort((a, b) => values[a] - values[b] || ORDER.indexOf(a) - ORDER.indexOf(b));
  const chain = ranked.map((id, i) => (i ? `${values[id] === values[ranked[i - 1]] ? " = " : " < "}${LABELS[id]}` : LABELS[id])).join("");
  emit({
    state: { n: max, values },
    marks: {},
    line: null,
    code: algorithm,
    aux: Object.fromEntries(functions.map((id) => [id, show(values[id])])),
    say: ["widget.complexity.end", { n: max, chain }],
  });
  return ranked;
}
