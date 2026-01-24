import { db } from "$lib/db";
import { settings as settingsTable } from "$lib/db/schema";
import { eq } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { betterAuthPlugin } from "../auth-plugin";

// Settings validation schema - userId comes from auth context, not request body
const settingsSchema = t.Object({
  id: t.Optional(t.String()),
  userId: t.Optional(t.String()), // Optional in request, will be set from auth
  myName: t.String(),
  email: t.String(),
  street: t.String(),
  city: t.String(),
  state: t.String(),
  zip: t.String(),
  createdAt: t.Optional(t.Any()), // Allow dates to pass through
  updatedAt: t.Optional(t.Any()), // Allow dates to pass through
});

export const settingsRoutes = new Elysia({ prefix: "/settings" })
  .use(betterAuthPlugin)
  // GET /api/settings - Get user settings (requires auth)
  .get(
    "/",
    async ({ user, set }) => {
      try {
        if (!user) {
          set.status = 401;
          return { error: "Unauthorized" };
        }

        const userSettings = await db.query.settings.findFirst({
          where: (s, { eq }) => eq(s.userId, user.id),
        });

        if (!userSettings) {
          set.status = 404;
          return { error: "Not found" };
        }

        return userSettings;
      } catch (error) {
        console.error("Error loading settings:", error);
        set.status = 500;
        return { error: "Failed to load settings" };
      }
    },
    {
      auth: true, // Require authentication
    }
  )
  // PUT /api/settings - Update or create user settings (requires auth)
  .put(
    "/",
    async ({ user, body, set }) => {
      try {
        if (!user) {
          set.status = 401;
          return { error: "Unauthorized" };
        }

        // Check if settings exist
        const existing = await db.query.settings.findFirst({
          where: (s, { eq }) => eq(s.userId, user.id),
        });

        if (existing) {
          // Update existing settings
          const [updated] = await db
            .update(settingsTable)
            .set({
              ...body,
              userId: user.id, // Ensure userId matches authenticated user
              updatedAt: new Date(),
            })
            .where(eq(settingsTable.id, existing.id))
            .returning();

          return updated;
        } else {
          // Create new settings
          const [created] = await db
            .insert(settingsTable)
            .values({
              ...body,
              userId: user.id,
            })
            .returning();

          return created;
        }
      } catch (error) {
        console.error("Error updating settings:", error);
        set.status = 500;
        return { error: "Failed to update settings" };
      }
    },
    {
      auth: true, // Require authentication
      body: settingsSchema,
    }
  );
