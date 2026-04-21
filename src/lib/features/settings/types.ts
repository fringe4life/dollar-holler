import type {
  settingsInsertSchema,
  settingsSelectSchema,
  settingsUpdateSchema,
} from "$lib/server/schemas";

export type SettingsInsert = typeof settingsInsertSchema.infer;
export type SettingsSelect = typeof settingsSelectSchema.infer;
export type SettingsUpdate = typeof settingsUpdateSchema.infer;

/** Invoice-details fields edited on the settings page (exclude ids and timestamps). */
export const SETTINGS_EDITABLE_KEYS = [
  "myName",
  "email",
  "street",
  "city",
  "state",
  "zip",
] as const;

type SettingsEditableKey = (typeof SETTINGS_EDITABLE_KEYS)[number];

export type SettingsEditableSnapshot = Pick<
  SettingsSelect,
  SettingsEditableKey
>;
