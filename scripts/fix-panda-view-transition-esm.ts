/**
 * Workaround for @pandacss 2.0 beta codegen gaps around viewTransition.
 *
 * Fresh `panda build` emits JS-only artifacts (index.js + view-transition.js).
 * Older panda versions also left .mjs barrels in styled-system/; Vite prefers
 * index.mjs when present, and that barrel historically omitted viewTransition.
 *
 * This script:
 * 1. Ensures view-transition.js is re-exported from the active css barrel
 * 2. Removes stale view-transition-less index.mjs so Vite uses index.js
 *
 * Remove once panda emits correct ESM barrels (or drop leftover .mjs entirely).
 */
import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const cssDir = join(root, "styled-system", "css");
const vtJsPath = join(cssDir, "view-transition.js");
const indexJsPath = join(cssDir, "index.js");
const indexMjsPath = join(cssDir, "index.mjs");
const vtMjsPath = join(cssDir, "view-transition.mjs");

if (!existsSync(vtJsPath)) {
  console.info("[fix-panda-view-transition-esm] no view-transition.js — skip");
  process.exit(0);
}

const exportLineJs = "export * from './view-transition';\n";
const exportLineMjs = "export * from './view-transition.mjs';\n";

const ensureExport = (path: string, line: string): void => {
  if (!existsSync(path)) {
    return;
  }
  let source = readFileSync(path, "utf8");
  if (source.includes("view-transition")) {
    return;
  }
  if (!source.endsWith("\n")) {
    source += "\n";
  }
  writeFileSync(path, `${source}${line}`);
  console.info(`[fix-panda-view-transition-esm] added export to ${path}`);
};

ensureExport(indexJsPath, exportLineJs);

// Stale .mjs from older panda: either patch or delete so Vite won't prefer a
// barrel that omits viewTransition.
if (existsSync(indexMjsPath)) {
  const mjs = readFileSync(indexMjsPath, "utf8");
  if (mjs.includes("view-transition")) {
    // Keep if already correct (and ensure sibling .mjs exists for the export).
    if (!existsSync(vtMjsPath) && existsSync(vtJsPath)) {
      const js = readFileSync(vtJsPath, "utf8");
      writeFileSync(
        vtMjsPath,
        js.replace(/from ['"]\.\.\/helpers['"]/, "from '../helpers.mjs'")
      );
    }
  } else if (existsSync(indexJsPath)) {
    unlinkSync(indexMjsPath);
    if (existsSync(vtMjsPath)) {
      unlinkSync(vtMjsPath);
    }
    console.info(
      "[fix-panda-view-transition-esm] removed stale index.mjs (use index.js)"
    );
  } else {
    ensureExport(indexMjsPath, exportLineMjs);
  }
}

console.info("[fix-panda-view-transition-esm] done");
