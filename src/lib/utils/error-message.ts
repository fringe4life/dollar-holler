/** Cursor list + CRUD copy: which noun phrase (singular vs plural) and HTTP-ish verb. */
export const StoreOperation = {
  loadMany: "loadMany",
  loadOne: "loadOne",
  createMany: "createMany",
  createOne: "createOne",
  updateMany: "updateMany",
  updateOne: "updateOne",
  deleteMany: "deleteMany",
  deleteOne: "deleteOne",
} as const;

export type StoreOperation =
  (typeof StoreOperation)[keyof typeof StoreOperation];

const OP_TO_VERB: Record<
  StoreOperation,
  "load" | "create" | "update" | "delete"
> = {
  loadMany: "load",
  loadOne: "load",
  createMany: "create",
  createOne: "create",
  updateMany: "update",
  updateOne: "update",
  deleteMany: "delete",
  deleteOne: "delete",
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
