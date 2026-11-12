// fallow-ignore-file unused-file -- Vite resolve.alias / worker-empty-stubs plugin load this into the Worker graph; fallow does not follow alias strings.
/**
 * `getBaseAdapter` dynamically imports `@better-auth/memory-adapter` only when
 * `database` is missing. This app always passes the Drizzle adapter.
 */
export const memoryAdapter = (): never => {
  throw new Error("Better Auth memory adapter is not shipped to the Worker");
};
