import { defineRelations } from "drizzle-orm";
import { schemaTables } from "./schema";
export const tableRelations = defineRelations(schemaTables, (relations) => ({
  account: {
    user: relations.one.user({
      from: relations.account.userId,
      to: relations.user.id,
    }),
  },
  clients: {
    invoices: relations.many.invoices(),
    user: relations.one.user({
      from: relations.clients.userId,
      to: relations.user.id,
    }),
  },
  invoices: {
    client: relations.one.clients({
      from: relations.invoices.clientId,
      to: relations.clients.id,
    }),
    lineItems: relations.many.lineItems(),
    user: relations.one.user({
      from: relations.invoices.userId,
      to: relations.user.id,
    }),
  },
  lineItems: {
    invoice: relations.one.invoices({
      from: relations.lineItems.invoiceId,
      to: relations.invoices.id,
    }),
    user: relations.one.user({
      from: relations.lineItems.userId,
      to: relations.user.id,
    }),
  },
  session: {
    user: relations.one.user({
      from: relations.session.userId,
      to: relations.user.id,
    }),
  },
  settings: {
    user: relations.one.user({
      from: relations.settings.userId,
      to: relations.user.id,
    }),
  },
  user: {
    accounts: relations.many.account(),
    clients: relations.many.clients(),
    invoices: relations.many.invoices(),
    lineItems: relations.many.lineItems(),
    sessions: relations.many.session(),
    settings: relations.one.settings({
      from: relations.user.id,
      to: relations.settings.userId,
    }),
  },
  verification: {},
}));
