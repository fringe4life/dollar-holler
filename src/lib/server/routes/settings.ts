/* eslint-disable new-cap */
import { db } from "$lib/server/db";
import { settings as settingsTable } from "$lib/server/db/schema";
import {
  apiErrorBodySchema,
  settingsInsertSchema,
  settingsSelectSchema,
  settingsUpdateSchema,
} from "$lib/server/schemas";
import { eq } from "drizzle-orm";
import { Elysia } from "elysia";
import { protectedApiPlugin } from "../plugins/auth-plugin";
import { InternalServerError, NotFoundError } from "../utils/errors";

export const settingsRoutes = new Elysia({ prefix: "/settings" })
  .use(protectedApiPlugin)
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
          throw new NotFoundError("Not found");
        }

        return userSettings;
      } catch (error) {
        if (error instanceof NotFoundError) throw error;
        console.error("Error loading settings:", error);
        throw new InternalServerError("Failed to load settings");
      }
    },
    {
      auth: true,
      detail: {
        operationId: "getSettings",
        summary: "Get settings",
        description:
          "Returns the authenticated user's settings row. If no row exists yet, responds with 404.",
      },
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
          throw new NotFoundError("Not found");
        }
        return updated;
      } catch (error) {
        if (error instanceof NotFoundError) throw error;
        console.error("Error updating settings:", error);
        throw new InternalServerError("Failed to update settings");
      }
    },
    {
      authMutation: true,
      body: settingsUpdateSchema,
      detail: {
        operationId: "updateSettings",
        summary: "Update settings",
        description:
          "Patches fields on the user's settings. Returns 404 if no settings row exists for the user.",
      },
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
        return created;
      } catch (error) {
        console.error("Error creating settings:", error);
        throw new InternalServerError("Failed to create settings");
      }
    },
    {
      authMutation: true,
      body: settingsInsertSchema,
      detail: {
        operationId: "createSettings",
        summary: "Create settings",
        description:
          "Creates the settings row for the authenticated user with the provided fields.",
      },
      response: {
        200: settingsSelectSchema,
        401: apiErrorBodySchema,
        500: apiErrorBodySchema,
      },
    }
  );
