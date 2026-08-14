import { configure } from "arktype/config";

/**
 * workerd blocks `new Function` (ArkType JIT). jitless uses the interpreter.
 * Import this module before any `arktype` / `drizzle-orm/arktype` import.
 * @see https://arktype.io/docs/configuration#jitless
 */
configure({ jitless: true });

export {};
