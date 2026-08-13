import { error } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { db } from "#lib/server/db";
import { settings as settingsTable } from "#lib/server/db/schema";
import type { SettingsInsert, SettingsSelect, SettingsUpdate } from "../types";

const omitMeta = (row: typeof settingsTable.$inferSelect): SettingsSelect => {
  const { createdAt: _c, updatedAt: _u, userId: _userId, ...rest } = row;
  return rest;
};

export const fetchSettings = async (
  userId: string
): Promise<SettingsSelect | null> => {
  const row = await db.query.settings.findFirst({
    where: { userId: { eq: userId } },
  });
  return row ? omitMeta(row) : null;
};

export const insertSettings = async (
  userId: string,
  body: SettingsInsert
): Promise<SettingsSelect> => {
  const [created] = await db
    .insert(settingsTable)
    .values({
      ...body,
      userId,
    })
    .returning();
  if (!created) {
    error(500, "Failed to create settings");
  }
  return omitMeta(created);
};

export const patchSettings = async (
  userId: string,
  body: SettingsUpdate
): Promise<SettingsSelect> => {
  const [updated] = await db
    .update(settingsTable)
    .set({
      ...body,
      userId,
    })
    .where(eq(settingsTable.userId, userId))
    .returning();
  if (!updated) {
    error(404, "Not found");
  }
  return omitMeta(updated);
};
