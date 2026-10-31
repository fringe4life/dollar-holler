/**
 * Fail CI when Panda's full runtime fingerprint reappears in production output.
 * @see https://github.com/fringe4life/dollar-holler/issues/232
 */
import { readdir } from "node:fs/promises";
import { join } from "node:path";

const FINGERPRINT = "createSerializeCss";

const ROOTS = [
  ".svelte-kit/output/client",
  ".svelte-kit/output/server",
  ".svelte-kit/cloudflare",
] as const;

const isJsOrMap = (name: string): boolean =>
  name.endsWith(".js") || name.endsWith(".js.map") || name.endsWith(".mjs");

const walkFiles = async (dir: string): Promise<string[]> => {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => null);
  if (!entries) {
    return [];
  }
  const files: string[] = [];
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkFiles(path)));
      continue;
    }
    if (entry.isFile() && isJsOrMap(entry.name)) {
      files.push(path);
    }
  }
  return files;
};

const hits: string[] = [];
for (const root of ROOTS) {
  for (const file of await walkFiles(root)) {
    const text = await Bun.file(file).text();
    if (text.includes(FINGERPRINT)) {
      hits.push(file);
    }
  }
}

if (hits.length > 0) {
  console.error(
    `Panda fingerprint "${FINGERPRINT}" found in production output (${hits.length}):`
  );
  for (const hit of hits) {
    console.error(`  ${hit}`);
  }
  process.exit(1);
}

console.log(`OK: no "${FINGERPRINT}" under ${ROOTS.join(", ")}`);
