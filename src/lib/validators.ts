import { generic, Hkt, type } from "arktype";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-arktype";
import {
  account,
  clients,
  invoices,
  lineItems,
  session,
  settings,
  user,
  verification,
} from "./db/schema";

// Custom ArkType for parsed dates from API responses
export const ParsedDate = type("string.date.parse");

// Generic parser that adds date parsing to any Drizzle schema with timestamps
const WithParsedDates = generic(["T", "object"])(
  (args) =>
    args.T.merge({
      createdAt: ParsedDate,
      updatedAt: ParsedDate,
    }),
  class WithParsedDatesHkt extends Hkt<[object]> {
    declare body: this[0] & { createdAt: Date; updatedAt: Date };
  },
);

// Better Auth schemas
export const userInsertSchema = createInsertSchema(user);
export const userSelectSchema = createSelectSchema(user);
export const userUpdateSchema = createUpdateSchema(user);

export const sessionInsertSchema = createInsertSchema(session);
export const sessionSelectSchema = createSelectSchema(session);

export const accountInsertSchema = createInsertSchema(account);
export const accountSelectSchema = createSelectSchema(account);

export const verificationInsertSchema = createInsertSchema(verification);
export const verificationSelectSchema = createSelectSchema(verification);

// Business logic schemas
export const clientInsertSchema = createInsertSchema(clients);
export const clientSelectSchema = createSelectSchema(clients);
export const clientUpdateSchema = createUpdateSchema(clients);

export const invoiceInsertSchema = createInsertSchema(invoices);
export const invoiceSelectSchema = createSelectSchema(invoices);
export const invoiceUpdateSchema = createUpdateSchema(invoices);

export const lineItemInsertSchema = createInsertSchema(lineItems);
export const lineItemSelectSchema = createSelectSchema(lineItems);
export const lineItemUpdateSchema = createUpdateSchema(lineItems);

export const settingsInsertSchema = createInsertSchema(settings);
export const settingsSelectSchema = createSelectSchema(settings);
export const settingsUpdateSchema = createUpdateSchema(settings);

// Create schemas with parsed dates for API responses
export const clientSelectWithDatesSchema = WithParsedDates(clientSelectSchema);
export const invoiceSelectWithDatesSchema =
  WithParsedDates(invoiceSelectSchema);
export const lineItemSelectWithDatesSchema =
  WithParsedDates(lineItemSelectSchema);
export const settingsSelectWithDatesSchema =
  WithParsedDates(settingsSelectSchema);

// Auth form validation schemas using ArkType directly

export const loginSchema = type({
  email: "string.email",
  password: "string >= 6",
});

export const signupSchema = type({
  email: "string.email",
  password: "string >= 6",
  confirmPassword: "string >= 6",
  name: "string >= 1",
}).narrow((data, ctx) => {
  if (data.password === data.confirmPassword) {
    return true;
  }
  return ctx.reject({
    expected: "identical to password",
    actual: "",
    path: ["confirmPassword"],
  });
});

export const resetPasswordSchema = type({
  newPassword: "string >= 6",
  confirmPassword: "string >= 6",
  token: "string >= 1",
}).narrow((data, ctx) => {
  if (data.newPassword === data.confirmPassword) return true;
  return ctx.reject({
    expected: "identical to newPassword",
    actual: "",
    path: ["confirmPassword"],
  });
});

// API Response validation schemas for stores using composition
// Enhance Drizzle-derived select schemas with date parsing using generic parser
const clientSelectWithDates = WithParsedDates(clientSelectSchema);
const invoiceSelectWithDates = WithParsedDates(invoiceSelectSchema);
const lineItemSelectWithDates = WithParsedDates(lineItemSelectSchema);

export const clientWithInvoicesResponseSchema = type({
  "...": clientSelectWithDates,
  invoices: type({
    "...": invoiceSelectWithDates,
    lineItems: lineItemSelectWithDates.array(),
  }).array(),
});

export const invoiceWithRelationsResponseSchema = type({
  "...": invoiceSelectWithDates,
  client: clientSelectWithDates,
  lineItems: lineItemSelectWithDates.array(),
});

export const settingsResponseSchema = WithParsedDates(settingsSelectSchema);

// Type exports for TypeScript inference
export type UserInsert = typeof userInsertSchema.infer;
export type UserSelect = typeof userSelectSchema.infer;
export type UserUpdate = typeof userUpdateSchema.infer;

export type ClientInsert = typeof clientInsertSchema.infer;
export type ClientSelect = typeof clientSelectSchema.infer;
export type ClientUpdate = typeof clientUpdateSchema.infer;

export type InvoiceInsert = typeof invoiceInsertSchema.infer;
export type InvoiceSelect = typeof invoiceSelectSchema.infer;
export type InvoiceUpdate = typeof invoiceUpdateSchema.infer;

export type LineItemInsert = typeof lineItemInsertSchema.infer;
export type LineItemSelect = typeof lineItemSelectSchema.infer;
export type LineItemUpdate = typeof lineItemUpdateSchema.infer;

export type SettingsInsert = typeof settingsInsertSchema.infer;
export type SettingsSelect = typeof settingsSelectSchema.infer;
export type SettingsUpdate = typeof settingsUpdateSchema.infer;

export type LoginData = typeof loginSchema.infer;
export type SignupData = typeof signupSchema.infer;
export type ResetPasswordData = typeof resetPasswordSchema.infer;

// API Response types
export type ClientWithInvoicesResponse =
  typeof clientWithInvoicesResponseSchema.infer;
export type InvoiceWithRelationsResponse =
  typeof invoiceWithRelationsResponseSchema.infer;
export type SettingsResponse = typeof settingsResponseSchema.infer;
