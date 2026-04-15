/* eslint-disable new-cap */
import { db } from "$lib/db";
import { settings as settingsTable } from "$lib/db/schema";
import { apiErrorBodySchema } from "$lib/server/api-response-schemas";
import {
  settingsInsertSchema,
  settingsSelectSchema,
  settingsUpdateSchema,
} from "$lib/validators";
import { eq } from "drizzle-orm";
import { Elysia, status } from "elysia";
import { betterAuthPlugin } from "../auth-plugin";

export const settingsRoutes = new Elysia({ prefix: "/settings" })
  .use(betterAuthPlugin)
  .guard({
    detail: {
      tags: ["Settings"],
    },
  })
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
  // PATCH /api/settings - Update settings
  .patch(
    "/",
    async ({ user, body }) => {
      try {
        const [updated] = await db
          .update(settingsTable)
          .set({
            ...body,
            userId: user.id,
          })
          .where(eq(settingsTable.userId, user.id))
          .returning();
        if (!updated) {
          return status(404, { message: "Not found" });
        }
        return updated;
      } catch (error) {
        console.error("Error updating settings:", error);
        return status(500, { message: "Failed to update settings" });
      }
    },
    {
      authMutation: true,
      body: settingsUpdateSchema,
      response: {
        200: settingsSelectSchema,
        401: apiErrorBodySchema,
        404: apiErrorBodySchema,
        500: apiErrorBodySchema,
      },
    }
  )
  // POST /api/settings - Create
  .post(
    "/",
    async ({ user, body }) => {
      try {
        const [created] = await db
          .insert(settingsTable)
          .values({
            ...body,
            userId: user.id,
          })
          .returning();
        if (!created) {
          throw new Error("Failed to create settings");
        }
        return created;
      } catch (error) {
        console.error("Error creating settings:", error);
        return status(500, { message: "Failed to create settings" });
      }
    },
    {
      authMutation: true,
      body: settingsInsertSchema,
      response: {
        200: settingsSelectSchema,
        401: apiErrorBodySchema,
        500: apiErrorBodySchema,
      },
    }
  );
