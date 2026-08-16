import type { ClientPickerOptionsResponse } from "#features/clients/types.ts";
import { db } from "#lib/server/db/index.ts";
import { tryCatch } from "#lib/utils/try-catch.ts";

/**
 * All clients for the user as id + name only (invoice client picker).
 * No aggregates; no pagination.
 */
const fetchClientPickerOptions = async (
  userId: string
): Promise<ClientPickerOptionsResponse["options"]> => {
  const { data: clients } = await tryCatch(() =>
    db.query.clients.findMany({
      columns: { id: true, name: true },
      orderBy: { name: "asc" },
      where: { userId: { eq: userId } },
    })
  );
  return clients ?? [];
};

export { fetchClientPickerOptions };
