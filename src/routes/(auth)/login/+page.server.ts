import { auth } from "$lib/auth";
import { loginSchema } from "$lib/validators";
import { fail, isRedirect, redirect } from "@sveltejs/kit";
import { ArkErrors } from "arktype";
import type { Actions } from "./$types";

export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const entries = Object.fromEntries(formData.entries());

    // Validate input with ArkType
    const validationResult = loginSchema(entries);
    if (validationResult instanceof ArkErrors) {
      return fail(400, { error: validationResult.summary ?? "Invalid input" });
    }

    try {
      const result = await auth.api.signInEmail({
        body: {
          email: validationResult.email,
          password: validationResult.password,
        },
        headers: request.headers,
      });

      if ("error" in result) {
        return fail(400, { error: (result as any).error.message });
      }

      throw redirect(303, "/invoices");
    } catch (error) {
      if (isRedirect(error)) throw error;
      console.error("Login error:", error);
      return fail(400, { error: "Login failed" });
    }
  },
};
