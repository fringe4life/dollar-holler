import { db } from "$lib/db";
import type { CursorId, Maybe } from "$lib/types";

export const verifyInvoice = async (
  userId: string,
  invoiceId: CursorId
): Promise<Maybe<CursorId>> => {
  const invoice = await db.query.invoices.findFirst({
    where: { id: { eq: invoiceId }, userId: { eq: userId } },
    columns: { id: true },
  });
  return invoice?.id;
};
