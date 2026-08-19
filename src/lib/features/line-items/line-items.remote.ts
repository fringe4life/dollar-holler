import { query } from "$app/server";
import { requireUser } from "#features/auth/require-user.server.ts";
import { cursorSchema } from "#lib/schemas/cursor-id.ts";
import { fetchLineItemsForEdit } from "#features/line-items/queries/line-items.server.ts";

export const listLineItemsForEdit = query(cursorSchema, async (invoiceId) => {
  const user = requireUser();
  return fetchLineItemsForEdit(user.id, invoiceId);
});
