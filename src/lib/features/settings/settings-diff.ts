import { stripNullishEntries } from "$lib/utils/strip-nullish-entries";
import {
  SETTINGS_EDITABLE_KEYS,
  type SettingsEditableSnapshot,
  type SettingsSelect,
  type SettingsUpdate,
} from "./types";

export const pickSettingsEditableSnapshot = (
  settings: SettingsSelect
): SettingsEditableSnapshot => ({
  myName: settings.myName,
  email: settings.email,
  street: settings.street,
  city: settings.city,
  state: settings.state,
  zip: settings.zip,
});

/** Keys whose values differ between baseline and current (invoice-details fields only). */
export const computeSettingsEditableDelta = (
  baseline: SettingsEditableSnapshot,
  current: SettingsEditableSnapshot
): SettingsUpdate => {
  const raw: Record<string, unknown> = Object.fromEntries(
    SETTINGS_EDITABLE_KEYS.flatMap((key) =>
      baseline[key] === current[key] ? [] : [[key, current[key]] as const]
    )
  );
  return stripNullishEntries(raw);
};
