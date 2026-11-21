/**
 * Frozen releases: kit/vX.Y.Z/ and widgets/vX.Y.Z/ folders made by
 * scripts/snapshot.mjs (both carry package.json's version,
 * docs/architecture/widgets-api.md 2.2).
 *
 * A release is served with `Cache-Control: immutable` for a year (see
 * _headers), so its files must never change once published. Each release
 * holds a SHA256SUMS file and `npm run build:check` fails if a file was
 * edited, added or removed.
 */
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const KIT = path.join(ROOT, "kit");
export const WIDGETS = path.join(ROOT, "widgets");
export const CHECKSUMS = "SHA256SUMS";
export const RELEASE_NAME = /^v\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/;

/** Folder names of the releases in `base` (kit/ or widgets/), e.g. ["v1.0.0"]. */
export async function listReleases(base = KIT) {
  const entries = await readdir(base, { withFileTypes: true }).catch(() => []);
  return entries
    .filter((entry) => entry.isDirectory() && RELEASE_NAME.test(entry.name))
    .map((entry) => entry.name)
    .sort();
}

/** Relative paths of every file below `dir`, sorted, with "/" separators. */
export async function listFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true, recursive: true });
  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => path.relative(dir, path.join(entry.parentPath ?? entry.path, entry.name)).split(path.sep).join("/"))
    .sort();
}

export async function sha256(file) {
  return createHash("sha256").update(await readFile(file)).digest("hex");
}

/** Contents of SHA256SUMS for `dir` (sha256sum format: "<hash>  <path>"). */
export async function checksums(dir) {
  const files = (await listFiles(dir)).filter((file) => file !== CHECKSUMS);
  const lines = await Promise.all(files.map(async (file) => `${await sha256(path.join(dir, file))}  ${file}`));
  return `${lines.join("\n")}\n`;
}

/** Returns a list of problems; empty when the release is intact. */
export async function verifyRelease(name, base = KIT) {
  const dir = path.join(base, name);
  const expected = await readFile(path.join(dir, CHECKSUMS), "utf8").catch(() => null);
  if (expected === null) return [`${CHECKSUMS} is missing`];
  const actual = await checksums(dir);
  if (expected === actual) return [];
  const parse = (text) => new Map(text.trim().split("\n").map((line) => line.split(/\s+/).reverse()));
  const want = parse(expected);
  const have = parse(actual);
  const problems = [];
  for (const [file, hash] of want) {
    if (!have.has(file)) problems.push(`${file} was removed`);
    else if (have.get(file) !== hash) problems.push(`${file} was modified`);
  }
  for (const file of have.keys()) if (!want.has(file)) problems.push(`${file} was added`);
  problems.push("published releases are immutable: publish a new version instead");
  return problems;
}
