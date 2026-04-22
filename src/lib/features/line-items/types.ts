import type {
  lineItemEditRowSchema,
  lineItemInsertSchema,
  lineItemSelectSchema,
  lineItemUpdateSchema,
} from "./schemas.server";
import type { BitsButton, CursorId, List } from "$lib/types";
import type { InvoiceSelect } from "../invoices/types";

export type LineItemInsert = typeof lineItemInsertSchema.infer;
export type LineItemEditRow = typeof lineItemEditRowSchema.infer;
export type LineItemSelect = typeof lineItemSelectSchema.infer;
export type LineItemUpdate = Omit<typeof lineItemUpdateSchema.infer, "id">;

/** Used by LineItemRows / LineItemRow (including public invoice view). */
export type LineItemsSectionMode = "edit" | "create" | "view";

export type UIKey = number;

export type Key = UIKey | CursorId;

export type NewLineItemWithId = Omit<LineItemInsert, "id"> & {
  id: Key;
};

type InvoiceFormPanel = {
  closePanel: () => void;
};

type InvoiceFormEditProps = InvoiceFormPanel & {
  mode: "edit";
  invoiceEdit: InvoiceSelect;
};

type InvoiceFormCreateProps = InvoiceFormPanel & {
  mode: "create";
  invoiceEdit?: undefined;
};

export type InvoiceFormProps = InvoiceFormEditProps | InvoiceFormCreateProps;

/** Line-item table: view mode has no mutation callbacks. */
type LineItemRowsViewProps = {
  mode: "view";
  lineItems: List<LineItemEditRow>;
  discount: number;
};

type LineItemRowsEditProps = {
  mode: "edit" | "create";
  lineItems: List<LineItemEditRow | NewLineItemWithId>;
  discount: number;
  updateLineItem: (id: Key, patch: LineItemUpdate) => void;
  setDiscount: (value: number) => void;
  addLineItem: BitsButton;
  removeLineItem: (id: Key) => void;
};

export type LineItemRowsProps = LineItemRowsViewProps | LineItemRowsEditProps;

type LineItemRowBase = {
  lineItem: LineItemEditRow | NewLineItemWithId;
  canDelete: boolean;
  isRequired: boolean;
};

type LineItemRowViewProps = {
  mode: "view";
};

type LineItemRowEditProps = {
  mode: "edit" | "create";
  updateLineItem: (id: Key, patch: LineItemUpdate) => void;
  removeLineItem: (id: Key) => void;
};

export type LineItemRowProps = LineItemRowBase &
  (LineItemRowViewProps | LineItemRowEditProps);
