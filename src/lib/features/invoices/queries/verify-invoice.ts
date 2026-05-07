import { db } from "$lib/server/db";
import type { InvoiceStatus } from "$lib/server/db/types";
import type { CursorId, Maybe } from "$lib/types";
import { tryCatch } from "$lib/utils/try-catch";
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

export const verifyInvoiceStatus = async (
  userId: string,
  invoiceId: CursorId
): Promise<
  Maybe<{ id: Maybe<CursorId>; invoiceStatus: Maybe<InvoiceStatus> }>
> => {
  const { data: invoice } = await tryCatch(() =>
    db.query.invoices.findFirst({
      where: { id: { eq: invoiceId }, userId: { eq: userId } },
      columns: { id: true, invoiceStatus: true },
    })
  );
  return { id: invoice?.id, invoiceStatus: invoice?.invoiceStatus };
};
