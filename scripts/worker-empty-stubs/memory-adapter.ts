/**
 * `getBaseAdapter` dynamically imports `@better-auth/memory-adapter` only when
 * `database` is missing. This app always passes the Drizzle adapter.
 */
export const memoryAdapter = (): never => {
  throw new Error("Better Auth memory adapter is not shipped to the Worker");
};
