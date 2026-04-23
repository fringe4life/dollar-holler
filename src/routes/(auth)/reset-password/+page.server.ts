import { fail, redirect } from "@sveltejs/kit";
import { ArkErrors } from "arktype";
import { resolve } from "$app/paths";
import { resetPasswordSchema } from "$features/auth/schemas.server";
import { auth } from "$lib/auth.server";
import { tryCatch } from "$lib/utils/try-catch";
import type { Actions } from "./$types";
export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const entries = Object.fromEntries(formData.entries());

    const token = new URL(request.url).searchParams.get("token") ?? "";
    const result = resetPasswordSchema({ ...entries, token });
    if (result instanceof ArkErrors) {
      return fail(400, { error: result.summary ?? "Invalid input" });
    }

    const { newPassword } = result;

    const { data, error } = await tryCatch(() =>
      auth.api.resetPassword({
        body: {
          newPassword,
          token,
        },
        headers: request.headers,
      })
    );
    if (!data || error) {
      console.error("Reset password error:", error);
      return fail(400, { error: "Failed to reset password" });
    }
    throw redirect(303, resolve("/invoices"));
  },
};
