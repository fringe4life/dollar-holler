import { schemaTables } from "./schema";
import { defineRelations } from "drizzle-orm";
export const tableRelations = defineRelations(schemaTables, (relations) => ({
  user: {
    settings: relations.one.settings({
      from: relations.user.id,
      to: relations.settings.userId,
    }),
    clients: relations.many.clients(),
    invoices: relations.many.invoices(),
    lineItems: relations.many.lineItems(),
    sessions: relations.many.session(),
    accounts: relations.many.account(),
  },
  settings: {
    user: relations.one.user({
      from: relations.settings.userId,
      to: relations.user.id,
    }),
  },
  clients: {
    user: relations.one.user({
      from: relations.clients.userId,
      to: relations.user.id,
    }),
    invoices: relations.many.invoices(),
  },
  invoices: {
    user: relations.one.user({
      from: relations.invoices.userId,
      to: relations.user.id,
    }),
    client: relations.one.clients({
      from: relations.invoices.clientId,
      to: relations.clients.id,
    }),
    lineItems: relations.many.lineItems(),
  },
  lineItems: {
    user: relations.one.user({
      from: relations.lineItems.userId,
      to: relations.user.id,
    }),
    invoice: relations.one.invoices({
      from: relations.lineItems.invoiceId,
      to: relations.invoices.id,
    }),
  },
  session: {
    user: relations.one.user({
      from: relations.session.userId,
      to: relations.user.id,
    }),
  },
  account: {
    user: relations.one.user({
      from: relations.account.userId,
      to: relations.user.id,
    }),
  },
  verification: {},
}));
