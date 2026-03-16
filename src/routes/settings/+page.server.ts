import { auth } from "$lib/auth";
import { tryCatch } from "$lib/utils/try-catch";
import { changePasswordSchema } from "$lib/validators";
import { fail, redirect } from "@sveltejs/kit";
import { ArkErrors } from "arktype";
import { toast } from "svelte-sonner";
import type { Actions } from "./$types";

export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const email = formData.get("email") as string | undefined;
    const entries = Object.fromEntries(formData.entries());

    const validationResult = changePasswordSchema(entries);
    if (validationResult instanceof ArkErrors) {
      return fail(400, {
        error: validationResult.summary ?? "Invalid input",
        email,
      });
    }

    const { currentPassword, newPassword } = validationResult;

    const { data, error } = await tryCatch(() =>
      auth.api.changePassword({
        body: {
          currentPassword,
          newPassword,
        },
        headers: request.headers,
      })
    );

    if (error || !data) {
      return fail(400, { error: "Failed to change password", email });
    }
    toast.success("Password changed successfully");
    throw redirect(303, "/settings");
  },
};
