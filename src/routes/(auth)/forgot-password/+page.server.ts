import { auth } from "$lib/auth";
import { forgotPassword } from "$lib/validators";
import { fail, isRedirect } from "@sveltejs/kit";
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

    try {
      const passwordReset = await auth.api.requestPasswordReset({
        body: { email: result.email },
        headers: request.headers,
      });

      if (!passwordReset.status) {
        return fail(400, {
          error: "Failed to send reset email",
          email: result.email,
        });
      }

      return { success: true, email: result.email };
    } catch (error) {
      if (isRedirect(error)) {
        throw error;
      }
      return fail(400, {
        error: "Failed to send reset email",
        email: result.email,
      });
    }
  },
};
