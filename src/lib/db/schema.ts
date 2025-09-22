import { relations } from "drizzle-orm";
import { boolean, pgTable, real, text, timestamp } from "drizzle-orm/pg-core";
import { cuidPk, timestamps } from "./columns.helpers";

// Better Auth tables (using standard names for Better Auth compatibility)
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  ...timestamps,
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  username: text("username").unique(),
  displayUsername: text("display_username"),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  ...timestamps,
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
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
  ...timestamps,
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  ...timestamps,
});

// Clients table
export const clients = pgTable("clients", {
  id: cuidPk(),
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
    "active",
  ),
  ...timestamps,
}).enableRLS();

// Invoices table
export const invoices = pgTable("invoices", {
  id: cuidPk(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  invoiceNumber: text("invoice_number").notNull(),
  clientId: text("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  subject: text("subject"),
  issueDate: text("issue_date").notNull(),
  dueDate: text("due_date").notNull(),
  discount: real("discount").default(0),
  notes: text("notes"),
  terms: text("terms"),
  invoiceStatus: text("invoice_status", {
    enum: ["draft", "sent", "paid"],
  }).default("draft"),
  ...timestamps,
}).enableRLS();

// Line items table
export const lineItems = pgTable("line_items", {
  id: cuidPk(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  invoiceId: text("invoice_id")
    .notNull()
    .references(() => invoices.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  quantity: real("quantity").notNull().default(1),
  amount: real("amount").notNull(),
  ...timestamps,
}).enableRLS();

// Settings table
export const settings = pgTable("settings", {
  id: cuidPk(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  myName: text("my_name").notNull(),
  email: text("email").notNull(),
  street: text("street").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zip: text("zip").notNull(),
  ...timestamps,
}).enableRLS();

// Relations
export const userRelations = relations(user, ({ many, one }) => ({
  settings: one(settings),
  clients: many(clients),
  invoices: many(invoices),
  lineItems: many(lineItems),
  sessions: many(session),
  accounts: many(account),
}));

export const settingsRelations = relations(settings, ({ one }) => ({
  user: one(user, { fields: [settings.userId], references: [user.id] }),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  user: one(user, { fields: [clients.userId], references: [user.id] }),
  invoices: many(invoices),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  user: one(user, { fields: [invoices.userId], references: [user.id] }),
  client: one(clients, {
    fields: [invoices.clientId],
    references: [clients.id],
  }),
  lineItems: many(lineItems),
}));

export const lineItemsRelations = relations(lineItems, ({ one }) => ({
  user: one(user, { fields: [lineItems.userId], references: [user.id] }),
  invoice: one(invoices, {
    fields: [lineItems.invoiceId],
    references: [invoices.id],
  }),
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

export type InvoiceStatus = (typeof InvoiceStatus)[keyof typeof InvoiceStatus];
export type ClientStatus = (typeof ClientStatus)[keyof typeof ClientStatus];

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
