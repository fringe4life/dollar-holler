import { createId } from "$features/pagination/utils/create-uuidv7.server";
import type { CursorId } from "$lib/types";
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

export const clientStatusEnum = pgEnum("client_status", ["active", "archive"]);

export const invoiceStatusEnum = pgEnum("invoice_status", [
  "draft",
  "sent",
  "paid",
]);
// better auth tables
export const user = pgTable("user", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at", { precision: 6, withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { precision: 6, withTimezone: true })
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    id: uuid("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    token: varchar("token", { length: 255 }).notNull().unique(),
    expiresAt: timestamp("expires_at", {
      precision: 6,
      withTimezone: true,
    }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { precision: 6, withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { precision: 6, withTimezone: true })
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("session_userId_idx").on(table.userId)]
);

export const account = pgTable(
  "account",
  {
    id: uuid("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      precision: 6,
      withTimezone: true,
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      precision: 6,
      withTimezone: true,
    }),
    scope: text("scope"),
    idToken: text("id_token"),
    password: text("password"),
    createdAt: timestamp("created_at", {
      precision: 6,
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 6,
      withTimezone: true,
    })
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)]
);

export const verification = pgTable(
  "verification",
  {
    id: uuid("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", {
      precision: 6,
      withTimezone: true,
    }).notNull(),
    createdAt: timestamp("created_at", {
      precision: 6,
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 6,
      withTimezone: true,
    })
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)]
);

// Clients table
export const clients = pgTable("clients", {
  id: uuid("id")
    .$defaultFn(() => createId())
    .$type<CursorId>()
    .primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  street: varchar("street", { length: 255 }).notNull(),
  city: varchar("city", { length: 255 }).notNull(),
  state: varchar("state", { length: 255 }).notNull(),
  zip: varchar("zip", { length: 255 }).notNull(),
  clientStatus: clientStatusEnum("client_status").default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => /* @__PURE__ */ new Date()),
});

// Invoices table
export const invoices = pgTable("invoices", {
  id: uuid("id")
    .$defaultFn(() => createId())
    .$type<CursorId>()
    .primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  invoiceNumber: text("invoice_number").notNull(),
  clientId: uuid("client_id")
    .notNull()
    .$type<CursorId>()
    .references(() => clients.id, { onDelete: "cascade" }),
  subject: text("subject").notNull(),
  issueDate: timestamp("issue_date").notNull(),
  dueDate: timestamp("due_date").notNull(),
  discount: real("discount").notNull().default(0),
  notes: text("notes"),
  terms: text("terms"),
  invoiceStatus: invoiceStatusEnum("invoice_status").default("draft"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => /* @__PURE__ */ new Date()),
});

// Line items table
export const lineItems = pgTable("line_items", {
  id: uuid("id")
    .$defaultFn(() => createId())
    .$type<CursorId>()
    .primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  invoiceId: uuid("invoice_id")
    .notNull()
    .$type<CursorId>()
    .references(() => invoices.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  quantity: integer("quantity").notNull().default(1),
  amount: real("amount").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => /* @__PURE__ */ new Date()),
});

// Settings table
export const settings = pgTable("settings", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  myName: varchar("my_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  street: varchar("street", { length: 255 }).notNull(),
  city: varchar("city", { length: 255 }).notNull(),
  state: varchar("state", { length: 255 }).notNull(),
  zip: varchar("zip", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => /* @__PURE__ */ new Date()),
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
