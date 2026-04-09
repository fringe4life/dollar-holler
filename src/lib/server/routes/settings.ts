/* eslint-disable new-cap */
import { db } from "$lib/db";
import { settings as settingsTable } from "$lib/db/schema";
import { settingsPutBodySchema } from "$lib/features/settings/schemas/schemas";
import { apiErrorBodySchema } from "$lib/server/api-response-schemas";
import { settingsSelectSchema } from "$lib/validators";
import { eq } from "drizzle-orm";
import { Elysia, status } from "elysia";
import { betterAuthPlugin } from "../auth-plugin";

export const settingsRoutes = new Elysia({ prefix: "/settings" })
  .use(betterAuthPlugin)
  // GET /api/settings - Get user settings (requires auth)
  .get(
    "/",
    async ({ user }) => {
      try {
        const userSettings = await db.query.settings.findFirst({
          where: { userId: user.id },
        });

        if (!userSettings) {
          return status(404, { message: "Not found" });
        }

        return userSettings;
      } catch (error) {
        console.error("Error loading settings:", error);
        return status(500, { message: "Failed to load settings" });
      }
    },
    {
      auth: true,
      response: {
        200: settingsSelectSchema,
        401: apiErrorBodySchema,
        404: apiErrorBodySchema,
        500: apiErrorBodySchema,
      },
    }
  )
  // PUT /api/settings - Update or create user settings (requires auth)
  .put(
    "/",
    async ({ user, body }) => {
      try {
        const existing = await db.query.settings.findFirst({
          where: { userId: user.id },
        });

        if (existing) {
          const [updated] = await db
            .update(settingsTable)
            .set({
              ...body,
              userId: user.id,
              updatedAt: new Date(),
            })
            .where(eq(settingsTable.userId, user.id))
            .returning();

          return updated;
        }
        const [created] = await db
          .insert(settingsTable)
          .values({
            ...body,
            userId: user.id,
          })
          .returning();

        return created;
      } catch (error) {
        console.error("Error updating settings:", error);
        return status(500, { message: "Failed to update settings" });
      }
    },
    {
      auth: true,
      body: settingsPutBodySchema,
      response: {
        200: settingsSelectSchema,
        401: apiErrorBodySchema,
        500: apiErrorBodySchema,
      },
    }
  );
