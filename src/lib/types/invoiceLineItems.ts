import type { LineItem } from "$lib/db/schema";
import type { BitsButton, CursorId, List, Maybe } from "$lib/types";
import type { InvoiceSelect } from "$lib/validators";

/** Used by LineItemRows / LineItemRow (including public invoice view). */
export type LineItemsSectionMode = "edit" | "create" | "view";

/** Fields editable from line-item rows before save. */
export type LineItemUpdate = Partial<
  Pick<LineItem, "description" | "quantity" | "amount">
>;

export type UIKey = number;

export type Key = UIKey | CursorId;

export type NewLineItemWithId = Omit<LineItem, "id" | "invoiceId"> & {
  id: Key;
  invoiceId?: CursorId;
};

export type NormalizedLineItem = Omit<LineItem, "id" | "invoiceId"> & {
  invoiceId?: CursorId;
  id: undefined | CursorId;
};

type InvoiceFormPanel = {
  closePanel: () => void;
  userId?: Maybe<string>;
};

export type InvoiceFormEditProps = InvoiceFormPanel & {
  mode: "edit";
  invoiceEdit: InvoiceSelect;
};

export type InvoiceFormCreateProps = InvoiceFormPanel & {
  mode: "create";
  invoiceEdit?: undefined;
};

export type InvoiceFormProps = InvoiceFormEditProps | InvoiceFormCreateProps;

/** Line-item table: view mode has no mutation callbacks. */
export type LineItemRowsViewProps = {
  mode: "view";
  lineItems: List<LineItem>;
  discount: number;
};

export type LineItemRowsEditProps = {
  mode: "edit" | "create";
  lineItems: List<LineItem | NewLineItemWithId>;
  discount: number;
  updateLineItem: (id: CursorId | number, patch: LineItemUpdate) => void;
  setDiscount: (value: number) => void;
  addLineItem: BitsButton;
  removeLineItem: (id: CursorId | number) => void;
};

export type LineItemRowsProps = LineItemRowsViewProps | LineItemRowsEditProps;

type LineItemRowBase = {
  lineItem: LineItem | NewLineItemWithId;
  canDelete: boolean;
  isRequired: boolean;
};

export type LineItemRowViewProps = {
  mode: "view";
};

export type LineItemRowEditProps = {
  mode: "edit" | "create";
  updateLineItem: (id: CursorId | number, patch: LineItemUpdate) => void;
  removeLineItem: (id: CursorId | number) => void;
};

export type LineItemRowProps = LineItemRowBase &
  (LineItemRowViewProps | LineItemRowEditProps);
