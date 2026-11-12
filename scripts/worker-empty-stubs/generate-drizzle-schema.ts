/**
 * Better Auth drizzle-adapter `createSchema` is CLI codegen. It dynamically
 * imports this module (`node:fs` / `node:path`) even though the Worker never
 * calls it. Vite aliases the hashed generate-drizzle-schema chunk here so
 * workerd does not ship the generator.
 */
export const generateDrizzleSchema = async (): Promise<never> => {
  throw new Error("Drizzle schema codegen is not shipped to the Worker");
};
