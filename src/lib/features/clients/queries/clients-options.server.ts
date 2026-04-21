import type { ClientPickerOption } from "$lib/features/clients/types";
import { db } from "$lib/server/db";
import { tryCatch } from "$lib/utils/try-catch";

/**
 * All clients for the user as id + name only (invoice client picker).
 * No aggregates; no pagination.
 */
const fetchClientPickerOptions = async (
  userId: string
): Promise<Array<ClientPickerOption>> => {
  const { data: clients } = await tryCatch(() =>
    db.query.clients.findMany({
      where: { userId: { eq: userId } },
      columns: { id: true, name: true },
      orderBy: { name: "asc" },
    })
  );
  return clients ?? [];
};
export { fetchClientPickerOptions };
