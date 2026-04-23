import type { BitsButton, CursorId, List } from "$lib/types";
import type { InvoiceSelect } from "../invoices/types";
import type {
  lineItemEditRowSchema,
  lineItemInsertSchema,
  lineItemUpdateSchema,
} from "./schemas.server";

export type LineItemInsert = typeof lineItemInsertSchema.infer;
export type LineItemEditRow = typeof lineItemEditRowSchema.infer;
export type LineItemUpdate = Omit<typeof lineItemUpdateSchema.infer, "id">;

export type UIKey = number;

export type Key = UIKey | CursorId;

export type NewLineItemWithId = Omit<LineItemInsert, "id"> & {
  id: Key;
};

interface InvoiceFormPanel {
  closePanel: () => void;
}

interface InvoiceFormEditProps extends InvoiceFormPanel {
  invoiceEdit: InvoiceSelect;
  mode: "edit";
}

type InvoiceFormCreateProps = InvoiceFormPanel & {
  mode: "create";
  invoiceEdit?: undefined;
};

export type InvoiceFormProps = InvoiceFormEditProps | InvoiceFormCreateProps;

/** Line-item table: view mode has no mutation callbacks. */
interface LineItemRowsViewProps {
  discount: number;
  lineItems: List<LineItemEditRow>;
  mode: "view";
}

interface LineItemRowsEditProps {
  addLineItem: BitsButton;
  discount: number;
  lineItems: List<LineItemEditRow | NewLineItemWithId>;
  mode: "edit" | "create";
  removeLineItem: (id: Key) => void;
  setDiscount: (value: number) => void;
  updateLineItem: (id: Key, patch: LineItemUpdate) => void;
}

export type LineItemRowsProps = LineItemRowsViewProps | LineItemRowsEditProps;

interface LineItemRowBase {
  canDelete: boolean;
  isRequired: boolean;
  lineItem: LineItemEditRow | NewLineItemWithId;
}

interface LineItemRowViewProps {
  mode: "view";
}

interface LineItemRowEditProps {
  mode: "edit" | "create";
  removeLineItem: (id: Key) => void;
  updateLineItem: (id: Key, patch: LineItemUpdate) => void;
}

export type LineItemRowProps = LineItemRowBase &
  (LineItemRowViewProps | LineItemRowEditProps);
