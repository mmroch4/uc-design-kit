/**
 * The step validator (docs/plan/widgets-api.md 18.3 item 2), for every widget
 * and algorithm on its meta.json test input: JSON steps, a mark-free first
 * step, the five states only, pseudocode line ids that exist in pt and en
 * (the same ids), say/predict keys in pt and en, at most MAX_STEPS steps.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { collect, random, MAX_STEPS, STATES } from "../../widgets/src/core/engine.js";
import { loadWidgets, optionSets, splitInput, LANGUAGES, format, describeOptions } from "./helpers.mjs";

const widgets = await loadWidgets();

for (const widget of widgets) {
  test(`${widget.id}: pt and en have the same keys`, () => {
    const [pt, en] = LANGUAGES.map((lang) => Object.keys(widget.dictionaries[lang]).sort());
    assert.deepEqual(pt, en);
  });

  for (const set of optionSets(widget.meta)) {
    const { input, options } = splitInput(widget.meta, set);
    test(`${widget.id} ${describeOptions(options)} ${JSON.stringify(input).slice(0, 60)}: steps are valid`, () => {
      const { steps } = collect(widget.algorithm.run, input, { ...options, random: random(1) });
      assert.ok(steps.length >= 2 && steps.length <= MAX_STEPS, "number of steps");
      assert.deepEqual(JSON.parse(JSON.stringify(steps)), steps, "steps are JSON");
      assert.deepEqual(steps[0].marks || {}, {}, "the first step has no marks");
      // The pseudocode of a step: the block it names in step.code (an operation), else the algorithm's.
      const lineIds = (block) => {
        const ids = {};
        for (const lang of LANGUAGES) {
          const code = widget.dictionaries[lang][`widget.${widget.id}.code.${block}`] || widget.dictionaries[lang][`widget.${widget.id}.code`] || [];
          assert.ok(Array.isArray(code), `pseudocode ${block} is a list of lines`);
          ids[lang] = code.flatMap((line) => line.split("|")[0].split(" ")).filter(Boolean);
        }
        assert.deepEqual(ids.pt, ids.en, `pseudocode line ids of ${block} are the same in pt and en`);
        return ids.pt;
      };
      for (const step of steps) {
        for (const state of Object.values(step.marks || {})) assert.ok(STATES.includes(state), `state ${state}`);
        const ids = lineIds(step.code || options.algorithm);
        for (const line of [].concat(step.line ?? [])) assert.ok(ids.includes(line), `pseudocode line "${line}" in ${step.code || options.algorithm}`);
        for (const lang of LANGUAGES) {
          const dictionary = widget.dictionaries[lang];
          assert.ok(format(dictionary, step.say), `${lang}: ${step.say[0]}`);
          assert.ok(!/\{\w+\}/.test(format(dictionary, step.say)), `${lang}: every placeholder of ${step.say[0]} is filled`);
          if (step.predict) {
            format(dictionary, step.predict.ask);
            step.predict.options.forEach((option) => format(dictionary, option));
            assert.ok(step.predict.answer >= 0 && step.predict.answer < step.predict.options.length, "predict answer");
          }
        }
      }
    });
  }
}
