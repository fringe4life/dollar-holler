import type { InferOutput } from "valibot";
import type {
  settingsInsertSchema,
  settingsSelectSchema,
  settingsUpdateSchema,
} from "./schemas.server";

export type SettingsInsert = InferOutput<typeof settingsInsertSchema>;
export type SettingsSelect = InferOutput<typeof settingsSelectSchema>;
export type SettingsUpdate = InferOutput<typeof settingsUpdateSchema>;
