/**
 * The step engine: pure helpers, no DOM and no `UC`, so the algorithms and
 * the Node tests can import them (docs/plan/widgets-api.md 6).
 */

/** Most steps one run may emit (6.3). */
export const MAX_STEPS = 2000;

/** The five visual states of an element (13.1); unlisted elements are "default". */
export const STATES = ["current", "compared", "swapped", "visited", "done"];

/** Invalid input: `key` is an i18n key, `params` its placeholders (10.4). */
export class InputError extends Error {
  constructor(key, params = {}) {
    super(key);
    this.name = "InputError";
    this.key = key;
    this.params = params;
  }
}

/** The algorithm went past MAX_STEPS. */
export class TooManySteps extends Error {
  constructor() {
    super(`more than ${MAX_STEPS} steps`);
    this.name = "TooManySteps";
  }
}

/**
 * Runs `run(input, options, emit)` and returns { steps, result }. `emit`
 * stores a deep copy of each step, so the algorithm may keep mutating its
 * own arrays, and throws TooManySteps past the cap.
 */
export function collect(run, input, options = {}) {
  const steps = [];
  const emit = (step) => {
    if (steps.length >= MAX_STEPS) throw new TooManySteps();
    steps.push(clone(step));
  };
  const result = run(input, options, emit);
  return { steps, result };
}

/** Deep copy of plain data (the step format is JSON). */
export function clone(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

/** [from, from + 1, …, to - 1]. */
export function range(from, to) {
  return Array.from({ length: Math.max(0, to - from) }, (_, i) => from + i);
}

/** `{ "0": state, "1": state, … }` for the given indexes. */
export function marksOf(indexes, state, into = {}) {
  for (const index of indexes) into[String(index)] = state;
  return into;
}

/**
 * Seeded generator (mulberry32, 16.4): the same seed gives the same numbers
 * in the browser and in the tests. Never Math.random.
 */
export function random(seed = 1) {
  let state = (Number(seed) | 0) >>> 0;
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const int = (min, max) => min + Math.floor(next() * (max - min + 1));
  return {
    next,
    int,
    pick: (array) => array[int(0, array.length - 1)],
    shuffle(array) {
      const copy = array.slice();
      for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = int(0, i);
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    },
  };
}
