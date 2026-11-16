/**
 * Packs template/ into docs/downloads/uc-template.zip, the starter site that
 * the documentation offers for download ("Criar o meu site").
 *
 * The archive is written by hand (no dependency): files are stored without
 * compression, in sorted order, under one folder ("uc-template/") and with a
 * fixed timestamp, so the same files always give the same bytes and
 * `npm run build:check` can tell when the committed zip is out of date.
 * The template is a few kilobytes of text, so compression would save little.
 *
 * Run by scripts/build.mjs.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { ROOT, walk } from "./docs.mjs";

const SOURCE = path.join(ROOT, "template");
export const TEMPLATE_ZIP = path.join(ROOT, "docs/downloads/uc-template.zip");
const FOLDER = "uc-template/";
// 2026-01-01 00:00 in MS-DOS format (the zip format's local time).
const DOS_TIME = 0;
const DOS_DATE = ((2026 - 1980) << 9) | (1 << 5) | 1;
const UTF8_NAMES = 1 << 11;

/* ---------- CRC-32 (IEEE 802.3), as required by the zip format ---------- */

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

/* ---------- zip writer (stored entries, no zip64) ---------- */

/**
 * Builds a zip archive from entries `{ name, data }` (name with "/" separators,
 * data a Buffer). Returns a Buffer.
 */
export function createZip(entries) {
  const locals = [];
  const centrals = [];
  let offset = 0;
  for (const { name, data } of entries) {
    const nameBytes = Buffer.from(name, "utf8");
    const crc = crc32(data);

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0); // local file header signature
    local.writeUInt16LE(20, 4); // version needed to extract (2.0)
    local.writeUInt16LE(UTF8_NAMES, 6);
    local.writeUInt16LE(0, 8); // method: stored
    local.writeUInt16LE(DOS_TIME, 10);
    local.writeUInt16LE(DOS_DATE, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(data.length, 18); // compressed size
    local.writeUInt32LE(data.length, 22); // uncompressed size
    local.writeUInt16LE(nameBytes.length, 26);
    local.writeUInt16LE(0, 28); // extra field length
    locals.push(local, nameBytes, data);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0); // central directory header signature
    central.writeUInt16LE((3 << 8) | 20, 4); // made by: Unix, zip 2.0
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(UTF8_NAMES, 8);
    central.writeUInt16LE(0, 10);
    central.writeUInt16LE(DOS_TIME, 12);
    central.writeUInt16LE(DOS_DATE, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(data.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(nameBytes.length, 28);
    // extra length, comment length, disk number, internal attributes: 0
    central.writeUInt32LE((0o100644 << 16) >>> 0, 38); // external attributes: rw-r--r--
    central.writeUInt32LE(offset, 42);
    centrals.push(central, nameBytes);

    offset += local.length + nameBytes.length + data.length;
  }
  const directory = Buffer.concat(centrals);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); // end of central directory signature
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(directory.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, directory, end]);
}

/**
 * Writes docs/downloads/uc-template.zip from template/. Returns the number of
 * problems (1 when, in check mode, the committed zip is out of date).
 */
export async function buildTemplateZip({ check = false } = {}) {
  const files = (await walk(SOURCE))
    .map((file) => path.relative(SOURCE, file).split(path.sep).join("/"))
    .filter((name) => !name.split("/").some((part) => part.startsWith(".")))
    .sort();
  const entries = await Promise.all(
    files.map(async (name) => ({ name: FOLDER + name, data: await readFile(path.join(SOURCE, name)) })),
  );
  const zip = createZip(entries);
  const previous = await readFile(TEMPLATE_ZIP).catch(() => null);
  if (previous && previous.equals(zip)) return 0;
  const name = path.relative(ROOT, TEMPLATE_ZIP).split(path.sep).join("/");
  if (check) {
    console.error(`${name} is out of date. Run: npm run build`);
    return 1;
  }
  await mkdir(path.dirname(TEMPLATE_ZIP), { recursive: true });
  await writeFile(TEMPLATE_ZIP, zip);
  console.log(`wrote ${name} (${(zip.length / 1024).toFixed(1)} KB, ${entries.length} files)`);
  return 0;
}
