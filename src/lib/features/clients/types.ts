import type { InferOutput } from "valibot";
import type {
  clientListRowSchema,
  clientPickerOptionSchema,
  clientPickerOptionsResponseSchema,
  clientSelectSchema,
  clientUpdateSchema,
} from "./schemas.server";
import type { clientInsertSchema } from "./schemas.server";

export type ClientInsert = InferOutput<typeof clientInsertSchema>;
export type ClientSelect = InferOutput<typeof clientSelectSchema>;
export type ClientUpdate = InferOutput<typeof clientUpdateSchema>;

// List view: only what ClientRow needs (received + balance)
export type ClientListResponse = InferOutput<typeof clientListRowSchema>;

export type ClientPickerOptionsResponse = InferOutput<
  typeof clientPickerOptionsResponseSchema
>;

/** Invoice client `<select>`: id + name only (`clientPickerOptions` query). */
export type ClientPickerOption = InferOutput<typeof clientPickerOptionSchema>;
