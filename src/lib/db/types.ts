import type { clientStatusEnum, invoiceStatusEnum } from "./schema";

export type ClientStatus = (typeof clientStatusEnum.enumValues)[number];
export type InvoiceStatus = (typeof invoiceStatusEnum.enumValues)[number];
