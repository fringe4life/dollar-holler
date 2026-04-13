import { db } from "$lib/db";
import type { CursorId, Maybe } from "$lib/types";
import { tryCatch } from "$lib/utils/try-catch";

const verifyInvoice = async (
  invoiceId: CursorId,
  userId?: string
): Promise<Maybe<CursorId>> => {
  const { data: invoice } = await tryCatch(() =>
    db.query.invoices.findFirst({
      where: { id: { eq: invoiceId }, userId: { eq: userId } },
      columns: { id: true },
    })
  );
  return invoice?.id;
};

export { verifyInvoice };
