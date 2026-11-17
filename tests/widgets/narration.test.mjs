/** Compares the narration of every widget with its snapshot (see narration.mjs). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { narrations, DIR } from "./narration.mjs";

for (const [name, content] of Object.entries(await narrations())) {
  test(`narration ${name}`, async () => {
    const expected = await readFile(path.join(DIR, name), "utf8").catch(() => null);
    assert.ok(expected !== null, `missing snapshot; run node tests/widgets/narration.mjs --update`);
    assert.equal(content, expected, "narration changed; run node tests/widgets/narration.mjs --update and review the diff");
  });
}
