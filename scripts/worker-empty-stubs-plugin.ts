import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { Plugin } from "vite";

const stubFile = (file: string): string =>
  fileURLToPath(new URL(`./worker-empty-stubs/${file}`, import.meta.url));

const GENERATE_SCHEMA_STUB = readFileSync(
  stubFile("generate-drizzle-schema.ts"),
  "utf8"
);
const CSSFILTER_STUB = readFileSync(stubFile("cssfilter.ts"), "utf8");

const posixId = (id: string): string =>
  id.split("?")[0]?.replaceAll("\\", "/") ?? id;

const isGenerateSchema = (id: string): boolean =>
  posixId(id).includes("generate-drizzle-schema") &&
  !posixId(id).includes("worker-empty-stubs");

const isCssfilter = (id: string): boolean => {
  const path = posixId(id);
  return (
    path === "cssfilter" ||
    (path.includes("/cssfilter") && !path.includes("worker-empty-stubs"))
  );
};

/** Bun unit-test preload / `bun:test` must not enter the Worker graph. */
const isBunTest = (id: string): boolean => {
  const path = posixId(id);
  return path === "bun:test" || path.endsWith("/app-env-preload.ts");
};

/**
 * Stub unused Better Auth codegen and xss cssfilter in the Worker graph.
 *
 * Vite SSR default-externalizes those packages; Alchemy then rebundles them
 * without aliases. Pair this plugin with `ssr.noExternal` so Vite sees them.
 *
 * Relative hashed imports skip string aliases (Rolldown `builtin:vite-alias`
 * does `find.replace(importee, replacement)` and leaves a `../` prefix —
 * rolldown#5417). `resolveId`/`load` on the resolved path is the same seam
 * as Cloudflare agents' turndown stub and open-seo's load-on-resolved-path.
 * Not an OpenTelemetry stub.
 */
export const workerEmptyStubs = (): Plugin => ({
  enforce: "pre",
  name: "worker-empty-stubs",
  resolveId: {
    filter: {
      id: /generate-drizzle-schema|cssfilter|^bun:test$|app-env-preload/,
    },
    handler(source: string) {
      const id = posixId(source);
      if (isBunTest(id)) {
        return "\0worker-empty:bun-test";
      }
      if (isCssfilter(id)) {
        return stubFile("cssfilter.ts");
      }
      if (isGenerateSchema(id)) {
        return stubFile("generate-drizzle-schema.ts");
      }
      return null;
    },
  },
  load: {
    filter: {
      id: /generate-drizzle-schema|cssfilter|^bun:test$|app-env-preload|\0worker-empty:bun-test/,
    },
    handler(id: string) {
      if (isBunTest(id) || id === "\0worker-empty:bun-test") {
        return "export {}";
      }
      if (isGenerateSchema(id)) {
        return GENERATE_SCHEMA_STUB;
      }
      if (isCssfilter(id) || posixId(id).endsWith("/cssfilter.ts")) {
        return CSSFILTER_STUB;
      }
      return null;
    },
  },
});
