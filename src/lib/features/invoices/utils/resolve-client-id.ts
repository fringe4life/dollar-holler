import type { ClientInsert } from "#features/clients/types.ts";
import type { CursorId, Maybe } from "#lib/types.ts";
import { err, ok, type Result } from "#lib/utils/result.ts";

interface ResolveClientIdInput {
  createClient: (client: ClientInsert) => Promise<Maybe<CursorId>>;
  existingClientId?: CursorId | null;
  isNewClient: boolean;
  newClient: ClientInsert;
}

export type ResolveClientIdResult = Result<{ clientId: CursorId }>;

export const resolveClientId = async ({
  isNewClient,
  newClient,
  existingClientId,
  createClient,
}: ResolveClientIdInput): Promise<ResolveClientIdResult> => {
  if (isNewClient) {
    const clientId = await createClient(newClient);
    if (!clientId) {
      return err({ message: "Failed to create client" });
    }
    return ok({ clientId });
  }

  if (!existingClientId) {
    return err({ message: "Client is required" });
  }

  return ok({ clientId: existingClientId });
};
