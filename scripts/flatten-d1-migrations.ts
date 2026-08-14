import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const scriptsDir = dirname(fileURLToPath(import.meta.url));
const drizzleDir = join(scriptsDir, "../src/lib/server/db/migrations");
const outDir = join(scriptsDir, "../src/lib/server/db/d1");
const folderPattern = /^\d{14}_/;

const entries = await readdir(drizzleDir, { withFileTypes: true });
const folders = entries
  .filter((entry) => entry.isDirectory() && folderPattern.test(entry.name))
  .map((entry) => entry.name)
  .sort();

await mkdir(outDir, { recursive: true });

let index = 1;
for (const folder of folders) {
  const sql = await readFile(join(drizzleDir, folder, "migration.sql"), "utf8");
  const name = folder.replace(folderPattern, "");
  const dest = join(outDir, `${String(index).padStart(4, "0")}_${name}.sql`);
  await writeFile(dest, sql);
  index += 1;
}
