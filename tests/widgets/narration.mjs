#!/usr/bin/env node
/**
 * Narration snapshots (docs/plan/widgets-api.md 18.3 item 3): the sentences
 * of every widget's test input, per algorithm, in tests/widgets/narration/
 * <widget>.<lang>.txt. narration.test.mjs compares them on every PR;
 * `node tests/widgets/narration.mjs --update` rewrites them (review the diff
 * like code).
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { collect, random } from "../../widgets/src/core/engine.js";
import { loadWidgets, optionSets, LANGUAGES, format, describeOptions, ROOT } from "./helpers.mjs";

export const DIR = path.join(ROOT, "tests", "widgets", "narration");

/** { "sort.pt.txt": "…", … } for every widget and language. */
export async function narrations() {
  const files = {};
  for (const widget of await loadWidgets()) {
    for (const lang of LANGUAGES) {
      const blocks = optionSets(widget.meta).map((options) => {
        const { steps } = collect(widget.algorithm.run, widget.meta.test.input, { ...options, random: random(1) });
        const lines = steps.map((step, i) => `${String(i + 1).padStart(3)}. ${format(widget.dictionaries[lang], step.say)}`);
        return [`## ${describeOptions(options)} · input ${JSON.stringify(widget.meta.test.input)}`, ...lines].join("\n");
      });
      files[`${widget.id}.${lang}.txt`] = `${blocks.join("\n\n")}\n`;
    }
  }
  return files;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const update = process.argv.includes("--update");
  let changed = 0;
  for (const [name, content] of Object.entries(await narrations())) {
    const file = path.join(DIR, name);
    const previous = await readFile(file, "utf8").catch(() => null);
    if (previous === content) continue;
    changed += 1;
    if (update) {
      await writeFile(file, content);
      console.log(`wrote tests/widgets/narration/${name}`);
    } else {
      console.log(`differs: tests/widgets/narration/${name}`);
    }
  }
  if (!update && changed) {
    console.log("Run node tests/widgets/narration.mjs --update if the change is intended.");
    process.exitCode = 1;
  }
}
