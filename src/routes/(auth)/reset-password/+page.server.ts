import { auth } from "$lib/auth";
import { resetPasswordSchema } from "$lib/validators";
import { fail, isRedirect, redirect } from "@sveltejs/kit";
import { ArkErrors } from "arktype";
import type { Actions } from "./$types";

export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const entries = Object.fromEntries(formData.entries());

    const token = new URL(request.url).searchParams.get("token") ?? "";
    const result = resetPasswordSchema({...entries, token});
    if (result instanceof ArkErrors) {
      return fail(400, { error: result.summary ?? "Invalid input" });
    }

    const { newPassword } = result;

    try {
      await auth.api.resetPassword({
        body: {
          newPassword,
          token,
        },
        headers: request.headers,
      });

      throw redirect(303, "/invoices");
    } catch (error) {
      if (isRedirect(error)) throw error;
      console.error("Reset password error:", error);
      return fail(400, { error: "Failed to reset password" });
    }
  },
};
