import fs from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";

type ImportsBridge = {
  /** Bare name after stripping `#` (`styled-system`, `lib`, …). */
  bare: string;
  /** Project-relative directory or file target without leading `./`. */
  dest: string;
  /** True when the `imports` key was `#bare/*`. */
  star: boolean;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const readImportsBridges = (root: string): ImportsBridge[] => {
  const pkgPath = path.join(root, "package.json");
  const parsed: unknown = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  if (!isRecord(parsed)) {
    throw new Error(`${pkgPath} must be a JSON object`);
  }
  const importsField = parsed.imports;
  if (importsField === undefined) {
    return [];
  }
  if (!isRecord(importsField)) {
    throw new Error(`${pkgPath} "imports" must be an object when present`);
  }
  const bridges: ImportsBridge[] = [];
  for (const [key, value] of Object.entries(importsField)) {
    if (typeof value !== "string" || !key.startsWith("#")) {
      continue;
    }
    const dest = value.replace(/^\.\//, "").replace(/\/\*$/, "");
    if (key.endsWith("/*")) {
      bridges.push({ bare: key.slice(1, -2), dest, star: true });
      continue;
    }
    bridges.push({ bare: key.slice(1), dest, star: false });
  }
  return bridges;
};

const resolveBridgeId = (
  id: string,
  bridges: ImportsBridge[],
  root: string
): string | undefined => {
  for (const { bare, dest, star } of bridges) {
    if (id === bare) {
      return path.resolve(root, dest);
    }
    if (star && id.startsWith(`${bare}/`)) {
      return path.resolve(root, dest, id.slice(bare.length + 1));
    }
  }
  return undefined;
};

const shouldSkipBareId = (id: string): boolean =>
  id.startsWith("\0") || id.startsWith("virtual:") || id.startsWith("#");

const matchesImportsBridge = (id: string, bridges: ImportsBridge[]): boolean =>
  bridges.some(
    ({ bare, star }) => id === bare || (star && id.startsWith(`${bare}/`))
  );

/** Only remap from ogygia’s virtual island modules (where `#` collapses). */
const isOgygiaVirtualImporter = (importer: string | undefined): boolean =>
  typeof importer === "string" && importer.includes("virtual:ogygia/");

/**
 * Vite `resolveId` bridge used from `vite.config.ts` (pin-comment lives there).
 * Remaps bare names derived from `package.json` `"imports"` so ogygia island
 * resolve can find them when `#` was dropped or never applied.
 */
export const ogygiaNodeImportsBridge = (): Plugin => {
  let root = process.cwd();
  let bridges: ImportsBridge[] = [];

  return {
    name: "ogygia-node-imports-bridge",
    enforce: "pre",
    configResolved(config) {
      root = config.root;
      bridges = readImportsBridges(root);
    },
    async resolveId(id, importer) {
      if (
        !isOgygiaVirtualImporter(importer) ||
        shouldSkipBareId(id) ||
        !matchesImportsBridge(id, bridges)
      ) {
        return undefined;
      }
      // Prefer re-attaching `#` so Vite's native imports map can win.
      const viaHash = await this.resolve(`#${id}`, undefined, {
        skipSelf: true,
      });
      return viaHash ?? resolveBridgeId(id, bridges, root);
    },
  };
};
