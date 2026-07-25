import type { clientStatuses, invoiceStatuses } from "./schema";

export type ClientStatus = (typeof clientStatuses)[number];
export type InvoiceStatus = (typeof invoiceStatuses)[number];
