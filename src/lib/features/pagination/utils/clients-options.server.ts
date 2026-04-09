import { db } from "$lib/db";
import { clients as clientsTable } from "$lib/db/schema";
import type { CursorId } from "$lib/types";
import { asc, eq } from "drizzle-orm";

/**
 * All clients for the user as id + name only (invoice client picker).
 * No aggregates; no pagination.
 */
const fetchClientPickerOptions = async (
  userId: string
): Promise<
  Array<{
    id: CursorId;
    name: string;
  }>
> => {
  return await db
    .select({
      id: clientsTable.id,
      name: clientsTable.name,
    })
    .from(clientsTable)
    .where(eq(clientsTable.userId, userId))
    .orderBy(asc(clientsTable.name));
};
export { fetchClientPickerOptions };
