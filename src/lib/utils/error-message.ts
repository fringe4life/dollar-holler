/** Cursor list + CRUD copy: which noun phrase (singular vs plural) and HTTP-ish verb. */
export const StoreOperation = {
  createMany: "createMany",
  createOne: "createOne",
  deleteMany: "deleteMany",
  deleteOne: "deleteOne",
  loadMany: "loadMany",
  loadOne: "loadOne",
  updateMany: "updateMany",
  updateOne: "updateOne",
} as const;

export type StoreOperation =
  (typeof StoreOperation)[keyof typeof StoreOperation];

const OP_TO_VERB: Record<
  StoreOperation,
  "load" | "create" | "update" | "delete"
> = {
  createMany: "create",
  createOne: "create",
  deleteMany: "delete",
  deleteOne: "delete",
  loadMany: "load",
  loadOne: "load",
  updateMany: "update",
  updateOne: "update",
};

/** User-facing "Failed to {verb} {singular|plural}" for store operations. */
export function resourceOperationFallback(
  op: StoreOperation,
  singular: string,
  plural: string
): string {
  const noun = op === "loadMany" || op.endsWith("Many") ? plural : singular;
  const verb = OP_TO_VERB[op];
  return `Failed to ${verb} ${noun}`;
}

export function isAbortError(err: unknown): boolean {
  if (err === null || typeof err !== "object") {
    return false;
  }
  const name = "name" in err ? (err as { name: unknown }).name : undefined;
  return typeof name === "string" && name === "AbortError";
}

export function getErrorMessage(err: unknown, fallbackMessage: string): string {
  return err instanceof Error ? err.message : fallbackMessage;
}
