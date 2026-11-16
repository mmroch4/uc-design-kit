#!/usr/bin/env node
/**
 * Freezes the current build of kit/v1 as kit/v<version>/, where <version> is
 * the "version" in package.json. Run it when releasing, after updating the
 * version (package.json and kit/src/core/namespace.js) and running
 * `npm run build`.
 *
 * The release is served with `Cache-Control: immutable` for a year, so it is
 * never modified afterwards (`npm run build:check` enforces this). Course
 * sites that load kit/vX.Y.Z/ get the fastest repeat visits and never change
 * behaviour during the semester; kit/v1/ keeps following the latest 1.x.
 *
 * Usage: node scripts/snapshot.mjs
 */
import { cp, readFile, writeFile, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { KIT, CHECKSUMS, RELEASE_NAME, checksums } from "./releases.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function fail(message) {
  console.error(message);
  process.exit(1);
}

const { version } = JSON.parse(await readFile(path.join(ROOT, "package.json"), "utf8"));
const name = `v${version}`;
if (!RELEASE_NAME.test(name)) fail(`package.json version "${version}" is not a valid version.`);
if (/-dev\b/.test(version)) fail(`"${version}" is a development version: set the release version first.`);

const major = version.split(".")[0];
const source = path.join(KIT, `v${major}`);
const target = path.join(KIT, name);

if (await access(target).then(() => true, () => false)) {
  fail(`kit/${name} already exists. Releases are immutable: bump the version.`);
}
const built = await readFile(path.join(source, "uc-kit.js"), "utf8").catch(() => "");
if (!built.includes(`UC Design Kit ${version} `)) {
  fail(`kit/v${major}/uc-kit.js was not built for ${version}. Run: npm run build`);
}
if (!built.includes(`version:"${version}"`)) {
  fail(`UC.version in kit/src/core/namespace.js is not "${version}".`);
}
const headers = await readFile(path.join(ROOT, "_headers"), "utf8");
if (!headers.includes(`/kit/v${major}.*`)) {
  fail(`_headers has no "/kit/v${major}.*" rule: add one so the release is cached as immutable.`);
}

await cp(source, target, { recursive: true });
await writeFile(path.join(target, CHECKSUMS), await checksums(target));
console.log(`kit/${name} created. Commit it together with the version bump and tag ${name}.`);
