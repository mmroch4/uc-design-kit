/**
 * Shared helpers of the widget tests (docs/architecture/widgets-api.md 18.3): load
 * every widget's algorithm, strings and meta.json, flatten the dictionaries
 * like UC.addTranslations and format a step's sentence like UC.t.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { strings as coreStrings } from "../../widgets/src/core/i18n.js";
import { decimals } from "../../widgets/src/core/engine.js";
import { widgetNames } from "../../scripts/build-widgets.mjs";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
export const LANGUAGES = ["pt", "en"];

function flatten(source, prefix, target = {}) {
  for (const [key, value] of Object.entries(source)) {
    const name = `${prefix}.${key}`;
    if (value && typeof value === "object" && !Array.isArray(value)) flatten(value, name, target);
    else target[name] = value;
  }
  return target;
}

/** Every widget: { name, id, meta, algorithm module, dictionaries per language }. */
export async function loadWidgets() {
  const widgets = [];
  for (const id of await widgetNames()) {
    const folder = path.join(ROOT, "widgets", "src", id);
    const meta = JSON.parse(await readFile(path.join(folder, "meta.json"), "utf8"));
    const module = await import(pathToFileURL(path.join(folder, "algorithm.js")).href);
    // A widget whose inputs are hard to write as JSON (graphs) gives a fixture.js that turns meta.json's form into run()'s.
    const fixture = await import(pathToFileURL(path.join(folder, "fixture.js")).href).catch((error) => (error.code === "ERR_MODULE_NOT_FOUND" ? null : Promise.reject(error)));
    const algorithm = fixture ? { ...module, run: (input, options, emit) => module.run(fixture.input(input, id), options, emit) } : module;
    const { strings } = await import(pathToFileURL(path.join(folder, "i18n.js")).href);
    const dictionaries = {};
    for (const lang of LANGUAGES) {
      dictionaries[lang] = { ...flatten(coreStrings[lang], "widget.core"), ...flatten(strings[lang], `widget.${id}`) };
    }
    // input(meta form) → run()'s input, for hooks such as trace's lineIds(input).
    widgets.push({ id, meta, algorithm, dictionaries, input: (value) => (fixture ? fixture.input(value, id) : value) });
  }
  return widgets;
}

/** The option sets to test for a widget: one per algorithm, plus meta.test.options. */
export function optionSets(meta) {
  return [...meta.algorithms.map((algorithm) => ({ algorithm })), ...(meta.test?.options || [])];
}

/** The options and input of one option set (an option set may bring its own `input`). */
export function splitInput(meta, { input, ...options }) {
  return { input: input ?? meta.test.input, options };
}

/** UC.t for a [key, params] pair in one dictionary; with `lang`, decimals as the core shows them. */
export function format(dictionary, pair, lang = null) {
  const [key, params = {}] = pair;
  const value = dictionary[key];
  if (typeof value !== "string") throw new Error(`missing string ${key}`);
  const text = value.replace(/\{(\w+)\}/g, (match, name) => (name in params ? String(params[name]) : match));
  return lang ? decimals(text, lang) : text;
}

export const describeOptions = (options) => Object.entries(options).filter(([k]) => k !== "input").map(([k, v]) => `${k}=${v}`).join(" ");
