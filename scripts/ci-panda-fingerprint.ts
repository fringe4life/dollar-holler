/**
 * Fail CI when Panda's full runtime fingerprint reappears in production output.
 * @see https://github.com/fringe4life/dollar-holler/issues/232
 */
import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";

const FINGERPRINT = "createSerializeCss";

/** Must exist after `bun run build` (adapter-cloudflare). */
const REQUIRED_ROOTS = [
  ".svelte-kit/output/client",
  ".svelte-kit/cloudflare",
] as const;

/** Present on full Kit builds; fail loudly if missing after a successful adapt. */
const OPTIONAL_ROOTS = [".svelte-kit/output/server"] as const;

const isJsOrMap = (name: string): boolean =>
  name.endsWith(".js") || name.endsWith(".js.map") || name.endsWith(".mjs");

const walkFiles = async (dir: string): Promise<string[]> => {
  const entries = await readdir(dir, { withFileTypes: true });
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

const requireDir = async (root: string): Promise<void> => {
  const info = await stat(root).catch(() => null);
  if (!info?.isDirectory()) {
    throw new Error(
      `Panda fingerprint: required build output missing: ${root} (run bun run build first)`
    );
  }
};

for (const root of REQUIRED_ROOTS) {
  await requireDir(root);
}

const rootsToScan: string[] = [...REQUIRED_ROOTS];
for (const root of OPTIONAL_ROOTS) {
  const info = await stat(root).catch(() => null);
  if (info?.isDirectory()) {
    rootsToScan.push(root);
  }
}

const hits: string[] = [];
let scanned = 0;
for (const root of rootsToScan) {
  for (const file of await walkFiles(root)) {
    scanned += 1;
    const text = await Bun.file(file).text();
    if (text.includes(FINGERPRINT)) {
      hits.push(file);
    }
  }
}

if (scanned === 0) {
  throw new Error(
    `Panda fingerprint: no JS under ${rootsToScan.join(", ")} — build output empty`
  );
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

console.log(
  `OK: scanned ${scanned} files; no "${FINGERPRINT}" under ${rootsToScan.join(", ")}`
);
