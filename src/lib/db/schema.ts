/* eslint-disable sonarjs/arrow-function-convention */
/* eslint-disable no-inline-comments */
import { createId } from "@paralleldrive/cuid2";
import { defineRelations } from "drizzle-orm";
import {
  boolean,
  index,
  pgTable,
  real,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

// Better Auth tables (using standard names for Better Auth compatibility)
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)]
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)]
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)]
);

// Clients table
export const clients = pgTable("clients", {
  id: text("id")
    .$defaultFn(() => createId())
    .primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email"),
  street: text("street"),
  city: text("city"),
  state: text("state"),
  zip: text("zip"),
  clientStatus: text("client_status", { enum: ["active", "archive"] }).default(
    "active"
  ),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

// Invoices table
export const invoices = pgTable("invoices", {
  id: text("id")
    .$defaultFn(() => createId())
    .primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  invoiceNumber: text("invoice_number").notNull(),
  clientId: text("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  subject: text("subject"),
  issueDate: timestamp("issue_date").notNull(),
  dueDate: timestamp("due_date").notNull(),
  discount: real("discount").default(0),
  notes: text("notes"),
  terms: text("terms"),
  invoiceStatus: text("invoice_status", {
    enum: ["draft", "sent", "paid"],
  }).default("draft"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

// Line items table
export const lineItems = pgTable("line_items", {
  id: text("id")
    .$defaultFn(() => createId())
    .primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  invoiceId: text("invoice_id")
    .notNull()
    .references(() => invoices.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  quantity: real("quantity").notNull().default(1),
  amount: real("amount").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

// Settings table
export const settings = pgTable("settings", {
  id: text("id")
    .$defaultFn(() => createId())
    .primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  myName: text("my_name").notNull(),
  email: text("email").notNull(),
  street: text("street").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zip: text("zip").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

// Relations (Drizzle Relations v2 - defineRelations)
export const schemaTables = {
  user,
  session,
  account,
  verification,
  clients,
  invoices,
  lineItems,
  settings,
};

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

// Export enums for use in the application
export const InvoiceStatus = {
  DRAFT: "draft",
  SENT: "sent",
  PAID: "paid",
} as const;

export const ClientStatus = {
  ACTIVE: "active",
  ARCHIVE: "archive",
} as const;

export type InvoiceStatusType =
  (typeof InvoiceStatus)[keyof typeof InvoiceStatus];
export type ClientStatusType = (typeof ClientStatus)[keyof typeof ClientStatus];

// Export types for use in the application
export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;
export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;
export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;
export type LineItem = typeof lineItems.$inferSelect;
export type NewLineItem = typeof lineItems.$inferInsert;
export type Settings = typeof settings.$inferSelect;
export type NewSettings = typeof settings.$inferInsert;
