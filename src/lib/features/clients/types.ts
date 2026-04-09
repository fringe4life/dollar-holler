import type {
  clientInsertSchema,
  clientSelectSchema,
  clientUpdateSchema,
} from "$lib/validators";

export type ClientInsert = typeof clientInsertSchema.infer;
export type ClientSelect = typeof clientSelectSchema.infer;
export type ClientUpdate = typeof clientUpdateSchema.infer;

// List view: only what ClientRow needs (received + balance)
export type ClientListResponse = ClientSelect & {
  received: number; // sum of paid invoice totals (cents)
  balance: number; // sum of unpaid invoice totals (cents)
};

/** Invoice client `<select>`: id + name only (GET /api/clients/options). */
export type ClientPickerOption = Pick<ClientSelect, "id" | "name">;

export type ClientPickerOptionsResponse = {
  options: ClientPickerOption[];
};
