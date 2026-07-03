import type {
  LineItemEditRow,
  LineItemInsert,
} from "$features/line-items/types";
import type { CursorId, List, Maybe } from "$lib/types";
import { err, ok, type Result } from "$lib/utils/result";
import type { InvoiceUpdate } from "../types";

interface PersistInvoiceEditsInput {
  delta: InvoiceUpdate;
  invoiceId: CursorId;
  invoiceUnchanged: boolean;
  lineItemsUnchanged: boolean;
  normalizedLineItems: LineItemInsert[];
  updateInvoice: (
    id: CursorId,
    patch: InvoiceUpdate
  ) => Promise<Maybe<CursorId>>;
  updateLineItems: (
    invoiceId: CursorId,
    items: LineItemInsert[]
  ) => Promise<List<LineItemEditRow>>;
}

type PersistInvoiceEditsResult = Result<
  { effectiveInvoiceId: CursorId },
  { message?: string }
>;

export const persistInvoiceEdits = async ({
  invoiceId,
  delta,
  invoiceUnchanged,
  lineItemsUnchanged,
  normalizedLineItems,
  updateInvoice,
  updateLineItems,
}: PersistInvoiceEditsInput): Promise<PersistInvoiceEditsResult> => {
  let effectiveInvoiceId = invoiceId;

  if (!invoiceUnchanged) {
    const updatedId = await updateInvoice(invoiceId, delta);
    if (!updatedId) {
      return err({ message: "Failed to update invoice" });
    }
    effectiveInvoiceId = updatedId;
  }

  if (!lineItemsUnchanged) {
    const lineResult = await updateLineItems(
      effectiveInvoiceId,
      normalizedLineItems
    );
    if (lineResult === null) {
      return err({});
    }
  }

  return ok({ effectiveInvoiceId });
};
