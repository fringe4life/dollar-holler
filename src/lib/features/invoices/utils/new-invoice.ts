import { today } from "#lib/utils/dateHelpers";
import type { NewInvoice } from "../types";

export const newInvoice = (): NewInvoice => ({
  clientId: undefined,
  discount: 0,
  dueDate: today,
  invoiceNumber: "",
  invoiceStatus: "draft",
  issueDate: today,
  notes: null,
  subject: "",
  terms: null,
});
