import { forgotPassword } from "$features/auth/schemas.server";
import { auth } from "$lib/auth.server";
import { tryCatch } from "$lib/utils/try-catch";
import { fail } from "@sveltejs/kit";
import { ArkErrors } from "arktype";
import type { Actions } from "./$types";
export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const result = forgotPassword(Object.fromEntries(formData.entries()));
    if (result instanceof ArkErrors) {
      return fail(400, {
        error: result.summary ?? "Invalid input",
        email: (formData.get("email") as string | undefined) ?? "",
      });
    }

    const { data: passwordReset, error } = await tryCatch(() =>
      auth.api.requestPasswordReset({
        body: { email: result.email },
        headers: request.headers,
      })
    );
    if (error) {
      return fail(400, {
        error: "Failed to send reset email",
        email: result.email,
      });
    }

    if (!passwordReset?.status) {
      return fail(400, {
        error: "Failed to send reset email",
        email: result.email,
      });
    }

    return { success: true, email: result.email };
  },
};
