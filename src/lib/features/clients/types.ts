import type {
  clientInsertSchema,
  clientListRowSchema,
  clientPickerOptionSchema,
  clientPickerOptionsResponseSchema,
  clientSelectSchema,
  clientUpdateSchema,
} from "./schemas.server";
export type ClientInsert = typeof clientInsertSchema.infer;
export type ClientSelect = typeof clientSelectSchema.infer;
export type ClientUpdate = typeof clientUpdateSchema.infer;

// List view: only what ClientRow needs (received + balance)
export type ClientListResponse = typeof clientListRowSchema.infer;

export type ClientPickerOptionsResponse =
  typeof clientPickerOptionsResponseSchema.infer;

/** Invoice client `<select>`: id + name only (`clientPickerOptions` query). */
export type ClientPickerOption = typeof clientPickerOptionSchema.infer;
