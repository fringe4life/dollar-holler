import { db } from "$lib/db";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ locals }) => {
  try {
    const user = locals.user;
    if (!user) return json({ error: "Unauthorized" }, { status: 401 });

    const userSettings = await db.query.settings.findFirst({
      where: (s, { eq }) => eq(s.userId, user.id),
    });

    if (!userSettings) return json({ error: "Not found" }, { status: 404 });
    return json(userSettings);
  } catch (error) {
    console.error("Error loading settings:", error);
    return json({ error: "Failed to load settings" }, { status: 500 });
  }
};


