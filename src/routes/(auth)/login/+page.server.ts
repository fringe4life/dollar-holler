import { auth } from "$lib/auth";
import { loginSchema } from "$lib/features/auth/schemas";
import { fail, redirect } from "@sveltejs/kit";
import { ArkErrors } from "arktype";
import type { Actions } from "./$types";
import { tryCatch } from "$lib/utils/try-catch";
import { resolve } from "$app/paths";

export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const email = (formData?.get("email") as string | undefined) ?? "";
    // Validate input with ArkType
    const validationResult = loginSchema(
      Object.fromEntries(formData.entries())
    );
    if (validationResult instanceof ArkErrors) {
      return fail(400, {
        error: validationResult.summary ?? "Invalid input",
        email,
      });
    }

    const { data, error } = await tryCatch(() =>
      auth.api.signInEmail({
        body: validationResult,
        headers: request.headers,
      })
    );
    if (!data || error) {
      console.error("error ", error);
      return fail(400, { error: "Login failed", email });
    }

    throw redirect(303, resolve("/invoices"));
  },
};
