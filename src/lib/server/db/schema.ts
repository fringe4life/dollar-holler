import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import type { CursorId, SanitizedHTML } from "../../types";
import { createId } from "../utils/create-id";

export const clientStatusEnum = pgEnum("client_status", ["active", "archive"]);

export const invoiceStatusEnum = pgEnum("invoice_status", [
  "draft",
  "sent",
  "paid",
]);
// better auth tables
export const user = pgTable("user", {
  createdAt: timestamp("created_at", { precision: 6, withTimezone: true })
    .defaultNow()
    .notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  id: uuid("id").primaryKey(),
  image: text("image"),
  name: text("name").notNull(),
  updatedAt: timestamp("updated_at", { precision: 6, withTimezone: true })
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    createdAt: timestamp("created_at", { precision: 6, withTimezone: true })
      .defaultNow()
      .notNull(),
    expiresAt: timestamp("expires_at", {
      precision: 6,
      withTimezone: true,
    }).notNull(),
    id: uuid("id").primaryKey(),
    ipAddress: text("ip_address"),
    token: varchar("token", { length: 255 }).notNull().unique(),
    updatedAt: timestamp("updated_at", { precision: 6, withTimezone: true })
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    userAgent: text("user_agent"),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)]
);

export const account = pgTable(
  "account",
  {
    accessToken: text("access_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      precision: 6,
      withTimezone: true,
    }),
    accountId: text("account_id").notNull(),
    createdAt: timestamp("created_at", {
      precision: 6,
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    id: uuid("id").primaryKey(),
    idToken: text("id_token"),
    password: text("password"),
    providerId: text("provider_id").notNull(),
    refreshToken: text("refresh_token"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      precision: 6,
      withTimezone: true,
    }),
    scope: text("scope"),
    updatedAt: timestamp("updated_at", {
      precision: 6,
      withTimezone: true,
    })
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("account_userId_idx").on(table.userId)]
);

export const verification = pgTable(
  "verification",
  {
    createdAt: timestamp("created_at", {
      precision: 6,
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    expiresAt: timestamp("expires_at", {
      precision: 6,
      withTimezone: true,
    }).notNull(),
    id: uuid("id").primaryKey(),
    identifier: text("identifier").notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 6,
      withTimezone: true,
    })
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    value: text("value").notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)]
);

// Clients table
export const clients = pgTable(
  "clients",
  {
    city: varchar("city", { length: 255 }).notNull(),
    clientStatus: clientStatusEnum("client_status").default("active").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    id: uuid("id")
      .$defaultFn(() => createId())
      .$type<CursorId>()
      .primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    state: varchar("state", { length: 255 }).notNull(),
    street: varchar("street", { length: 255 }).notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => /* @__PURE__ */ new Date()),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    zip: varchar("zip", { length: 255 }).notNull(),
  },
  (table) => [index("clients_userId_id_idx").on(table.userId, table.id)]
);

// Invoices table
export const invoices = pgTable(
  "invoices",
  {
    clientId: uuid("client_id")
      .notNull()
      .$type<CursorId>()
      .references(() => clients.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    discount: real("discount").notNull().default(0),
    dueDate: timestamp("due_date").notNull(),
    id: uuid("id")
      .$defaultFn(() => createId())
      .$type<CursorId>()
      .primaryKey(),
    invoiceNumber: text("invoice_number").notNull(),
    invoiceStatus: invoiceStatusEnum("invoice_status").default("draft"),
    issueDate: timestamp("issue_date").notNull(),
    notes: text("notes"),
    notesHtml: text("notes_html").$type<SanitizedHTML>(),
    subject: text("subject").notNull(),
    terms: text("terms"),
    termsHtml: text("terms_html").$type<SanitizedHTML>(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => /* @__PURE__ */ new Date()),
    userId: uuid("user_id")
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
export const lineItems = pgTable(
  "line_items",
  {
    amount: real("amount").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    description: text("description").notNull(),
    id: uuid("id")
      .$defaultFn(() => createId())
      .$type<CursorId>()
      .primaryKey(),
    invoiceId: uuid("invoice_id")
      .notNull()
      .$type<CursorId>()
      .references(() => invoices.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull().default(1),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => /* @__PURE__ */ new Date()),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("line_items_invoiceId_idx").on(table.invoiceId)]
);

// Settings table
export const settings = pgTable("settings", {
  city: varchar("city", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  myName: varchar("my_name", { length: 255 }).notNull(),
  state: varchar("state", { length: 255 }).notNull(),
  street: varchar("street", { length: 255 }).notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => /* @__PURE__ */ new Date()),
  userId: uuid("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  zip: varchar("zip", { length: 255 }).notNull(),
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
