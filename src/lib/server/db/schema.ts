import { sql } from "drizzle-orm";
import {
  index,
  integer,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import type { CursorId } from "#lib/schemas/cursor-id.ts";
import type { SanitizedHTML } from "#lib/schemas/sanitized-html.server.ts";
import { createId } from "../utils/create-id";

export const clientStatuses = ["active", "archive"] as const;
export const invoiceStatuses = ["draft", "sent", "paid"] as const;

/** Better Auth / Drizzle sqlite default: unix epoch ms. */
const unixEpochMs = sql`(cast(unixepoch('subsecond') * 1000 as integer))`;

const timestampMs = (name: string) =>
  integer(name, { mode: "timestamp_ms" }).default(unixEpochMs).notNull();

const timestampMsUpdated = (name: string) =>
  integer(name, { mode: "timestamp_ms" })
    .default(unixEpochMs)
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull();

// better auth tables (from `auth generate`, indexes/cascades preserved)
export const user = sqliteTable("user", {
  createdAt: timestampMs("created_at"),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .default(false)
    .notNull(),
  id: text("id").primaryKey(),
  image: text("image"),
  name: text("name").notNull(),
  updatedAt: timestampMsUpdated("updated_at"),
});

export const session = sqliteTable(
  "session",
  {
    createdAt: timestampMs("created_at"),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    id: text("id").primaryKey(),
    ipAddress: text("ip_address"),
    token: text("token").notNull().unique(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)]
);

export const account = sqliteTable(
  "account",
  {
    accessToken: text("access_token"),
    accessTokenExpiresAt: integer("access_token_expires_at", {
      mode: "timestamp_ms",
    }),
    createdAt: timestampMs("created_at"),
    id: text("id").primaryKey(),
    idToken: text("id_token"),
    /** Synthetic issuer, e.g. `local:credential` for email/password. */
    issuer: text("issuer").notNull(),
    /** Subject within issuer; credentials use the linked user id. */
    accountId: text("account_id").notNull(),
    password: text("password"),
    providerId: text("provider_id").notNull(),
    refreshToken: text("refresh_token"),
    refreshTokenExpiresAt: integer("refresh_token_expires_at", {
      mode: "timestamp_ms",
    }),
    scope: text("scope"),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [
    uniqueIndex("account_issuer_accountId_uidx").on(
      table.issuer,
      table.accountId
    ),
    index("account_userId_idx").on(table.userId),
  ]
);

export const verification = sqliteTable(
  "verification",
  {
    createdAt: timestampMs("created_at"),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    updatedAt: timestampMsUpdated("updated_at"),
    value: text("value").notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)]
);

// Clients table
export const clients = sqliteTable(
  "clients",
  {
    city: text("city").notNull(),
    clientStatus: text("client_status", { enum: clientStatuses })
      .default("active")
      .notNull(),
    createdAt: timestampMs("created_at"),
    email: text("email").notNull(),
    id: text("id")
      .$defaultFn(() => createId())
      .$type<CursorId>()
      .primaryKey(),
    name: text("name").notNull(),
    state: text("state").notNull(),
    street: text("street").notNull(),
    updatedAt: timestampMsUpdated("updated_at"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    zip: text("zip").notNull(),
  },
  (table) => [index("clients_userId_id_idx").on(table.userId, table.id)]
);

// Invoices table
export const invoices = sqliteTable(
  "invoices",
  {
    clientId: text("client_id")
      .notNull()
      .$type<CursorId>()
      .references(() => clients.id, { onDelete: "cascade" }),
    createdAt: timestampMs("created_at"),
    discount: real("discount").notNull().default(0),
    dueDate: integer("due_date", { mode: "timestamp_ms" }).notNull(),
    id: text("id")
      .$defaultFn(() => createId())
      .$type<CursorId>()
      .primaryKey(),
    invoiceNumber: text("invoice_number").notNull(),
    invoiceStatus: text("invoice_status", { enum: invoiceStatuses }).default(
      "draft"
    ),
    issueDate: integer("issue_date", { mode: "timestamp_ms" }).notNull(),
    notes: text("notes"),
    notesHtml: text("notes_html").$type<SanitizedHTML>(),
    subject: text("subject").notNull(),
    terms: text("terms"),
    termsHtml: text("terms_html").$type<SanitizedHTML>(),
    updatedAt: timestampMsUpdated("updated_at"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("invoices_userId_id_idx").on(table.userId, table.id),
    index("invoices_userId_clientId_id_idx").on(
      table.userId,
      table.clientId,
      table.id
    ),
  ]
);

// Line items table
export const lineItems = sqliteTable(
  "line_items",
  {
    amount: real("amount").notNull(),
    createdAt: timestampMs("created_at"),
    description: text("description").notNull(),
    id: text("id")
      .$defaultFn(() => createId())
      .$type<CursorId>()
      .primaryKey(),
    invoiceId: text("invoice_id")
      .notNull()
      .$type<CursorId>()
      .references(() => invoices.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull().default(1),
    updatedAt: timestampMsUpdated("updated_at"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("line_items_invoiceId_idx").on(table.invoiceId)]
);

// Settings table
export const settings = sqliteTable("settings", {
  city: text("city").notNull(),
  createdAt: timestampMs("created_at"),
  email: text("email").notNull(),
  myName: text("my_name").notNull(),
  state: text("state").notNull(),
  street: text("street").notNull(),
  updatedAt: timestampMsUpdated("updated_at"),
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  zip: text("zip").notNull(),
});

// complete schema tables
export const schemaTables = {
  account,
  clients,
  invoices,
  lineItems,
  session,
  settings,
  user,
  verification,
};
