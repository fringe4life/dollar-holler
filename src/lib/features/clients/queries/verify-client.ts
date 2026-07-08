import { db } from "$lib/server/db";
import type { CursorId, Maybe } from "$lib/types";

export const verifyClient = async (
  userId: string,
  clientId: CursorId
): Promise<Maybe<CursorId>> => {
  const client = await db.query.clients.findFirst({
    columns: { id: true },
    where: { id: { eq: clientId }, userId: { eq: userId } },
  });
  return client?.id;
};
