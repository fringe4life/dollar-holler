import { command, query } from "$app/server";
import {
  requireUser,
  requireUserMutation,
} from "#features/auth/require-user.server.ts";
import {
  fetchSettings,
  insertSettings,
  patchSettings,
} from "#features/settings/queries/settings.server.ts";
import {
  settingsInsertSchema,
  settingsUpdateSchema,
} from "#features/settings/schemas.server.ts";

export const getSettings = query(async () => {
  const user = requireUser();
  return fetchSettings(user.id);
});

export const createSettings = command(settingsInsertSchema, async (body) => {
  const user = await requireUserMutation();
  const created = await insertSettings(user.id, body);
  getSettings().set(created);
  return created;
});

export const updateSettings = command(settingsUpdateSchema, async (body) => {
  const user = await requireUserMutation();
  const updated = await patchSettings(user.id, body);
  getSettings().set(updated);
  return updated;
});
