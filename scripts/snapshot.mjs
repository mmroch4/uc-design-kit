#!/usr/bin/env node
/**
 * Freezes the current build of kit/v1 as kit/v<version>/, where <version> is
 * the "version" in package.json. Run it when releasing, after updating the
 * version in package.json and running `npm run build` (which copies it into
 * kit/src/core/namespace.js, widgets/src/core/version.js and uc-site.py).
 *
 * The release is served with `Cache-Control: immutable` for a year, so it is
 * never modified afterwards (`npm run build:check` enforces this). Course
 * sites that load kit/vX.Y.Z/ get the fastest repeat visits and never change
 * behaviour during the semester; kit/v1/ keeps following the latest 1.x.
 *
 * With --widgets it freezes widgets/v1 as widgets/v<version>/ instead, where
 * <version> is VERSION in widgets/src/core/version.js (the same version,
 * written there by the build; docs/architecture/widgets-api.md 2.2). A widgets release needs a kit
 * release that satisfies KIT_MIN to exist first (kit/vX.Y.Z/).
 *
 * Usage: node scripts/snapshot.mjs [--widgets]
 */
import { cp, readFile, writeFile, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { KIT, WIDGETS, CHECKSUMS, RELEASE_NAME, checksums, listReleases } from "./releases.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function fail(message) {
  console.error(message);
  process.exit(1);
}

const exists = (file) => access(file).then(() => true, () => false);

if (process.argv.includes("--widgets")) {
  await snapshotWidgets();
  process.exit(0);
}

const { version } = JSON.parse(await readFile(path.join(ROOT, "package.json"), "utf8"));
const name = `v${version}`;
if (!RELEASE_NAME.test(name)) fail(`package.json version "${version}" is not a valid version.`);
if (/-dev\b/.test(version)) fail(`"${version}" is a development version: set the release version first.`);

const major = version.split(".")[0];
const source = path.join(KIT, `v${major}`);
const target = path.join(KIT, name);

if (await exists(target)) {
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

/** widgets/v1 → widgets/v<VERSION>/ (docs/architecture/widgets-api.md 2.2 and 19). */
async function snapshotWidgets() {
  const { VERSION, KIT_MIN } = await import(pathToFileURL(path.join(WIDGETS, "src", "core", "version.js")).href);
  const name = `v${VERSION}`;
  if (!RELEASE_NAME.test(name)) fail(`widgets/src/core/version.js: "${VERSION}" is not a valid version.`);
  if (/-dev\b/.test(VERSION)) fail(`widgets "${VERSION}" is a development version: set VERSION in widgets/src/core/version.js first.`);

  // The widgets need a released kit (KIT_MIN = "major.minor") to point teachers at.
  const [kitMajor, kitMinor] = KIT_MIN.split(".").map(Number);
  const kitReleases = (await listReleases(KIT)).filter((release) => {
    if (release.includes("-")) return false;
    const [major, minor] = release.slice(1).split(".").map(Number);
    return major === kitMajor && minor >= kitMinor;
  });
  if (!kitReleases.length) fail(`The widgets need kit ${KIT_MIN} or later, and there is no kit/v${KIT_MIN}.x/ release yet. Release the kit first.`);

  const major = VERSION.split(".")[0];
  const source = path.join(WIDGETS, `v${major}`);
  const target = path.join(WIDGETS, name);
  if (await exists(target)) fail(`widgets/${name} already exists. Releases are immutable: bump the version.`);
  const core = await readFile(path.join(source, "uc-widget-core.js"), "utf8").catch(() => "");
  if (!core.includes(`UC Design Kit widgets ${VERSION} `)) fail(`widgets/v${major}/ was not built for ${VERSION}. Run: npm run build`);
  const catalog = JSON.parse(await readFile(path.join(source, "catalog.json"), "utf8"));
  const unstable = catalog.widgets.filter((widget) => widget.status !== "stable").map((widget) => widget.name);
  if (unstable.length) fail(`Not stable yet (meta.json "status"): ${unstable.join(", ")}.`);
  const headers = await readFile(path.join(ROOT, "_headers"), "utf8");
  if (!headers.includes(`/widgets/v${major}.*`)) {
    fail(`_headers has no "/widgets/v${major}.*" rule: add one so the release is cached as immutable.`);
  }

  await cp(source, target, { recursive: true });
  await writeFile(path.join(target, CHECKSUMS), await checksums(target));
  console.log(`widgets/${name} created. Commit it together with the version bump and tag widgets-${name}.`);
}
