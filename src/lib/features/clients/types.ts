import type {
  clientInsertSchema,
  clientSelectSchema,
  clientUpdateSchema,
} from "$lib/server/schemas";
import type {
  clientListRowSchema,
  clientPickerOptionSchema,
  clientPickerOptionsResponseSchema,
  clientReceivedBalanceSchema,
} from "./schemas";
export type ClientInsert = typeof clientInsertSchema.infer;
export type ClientSelect = typeof clientSelectSchema.infer;
export type ClientUpdate = typeof clientUpdateSchema.infer;

// List view: only what ClientRow needs (received + balance)
export type ClientListResponse = typeof clientListRowSchema.infer;

export type ClientPickerOptionsResponse =
  typeof clientPickerOptionsResponseSchema.infer;

/** Invoice client `<select>`: id + name only (GET /api/clients/options). */
export type ClientPickerOption = typeof clientPickerOptionSchema.infer;

export type ClientReceivedBalance = typeof clientReceivedBalanceSchema.infer;
