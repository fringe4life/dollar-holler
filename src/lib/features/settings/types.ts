import type {
  settingsInsertSchema,
  settingsSelectSchema,
  settingsUpdateSchema,
} from "$lib/validators";

export type SettingsInsert = typeof settingsInsertSchema.infer;
export type SettingsSelect = typeof settingsSelectSchema.infer;
export type SettingsUpdate = typeof settingsUpdateSchema.infer;
