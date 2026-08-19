import { form, query } from "$app/server";
import {
  requireUser,
  requireUserMutation,
} from "#features/auth/require-user.server.ts";
import {
  fetchSettings,
  insertSettings,
  patchSettings,
} from "#features/settings/queries/settings.server.ts";
import { settingsFormSchema } from "#features/settings/schemas.ts";

export const getSettings = query(async () => {
  const user = requireUser();
  return fetchSettings(user.id);
});

export const saveSettings = form(settingsFormSchema, async (data) => {
  const user = await requireUserMutation();
  const existing = await fetchSettings(user.id);
  const saved = existing
    ? await patchSettings(user.id, data)
    : await insertSettings(user.id, data);
  getSettings().set(saved);
  return saved;
}).preflight(settingsFormSchema);
