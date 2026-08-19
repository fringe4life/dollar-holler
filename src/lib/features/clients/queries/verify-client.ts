import { db } from "#lib/server/db/index.ts";
import type { CursorId } from "#lib/schemas/cursor-id.ts";
import type { Maybe } from "#lib/types.ts";

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
