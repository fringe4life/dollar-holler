import { auth } from "$lib/auth";
import { signupSchema } from "$lib/features/auth/schemas";
import { fail, redirect } from "@sveltejs/kit";
import { ArkErrors } from "arktype";
import type { Actions } from "./$types";
import { tryCatch } from "$lib/utils/try-catch";
import { resolve } from "$app/paths";
export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const validationResult = signupSchema(
      Object.fromEntries(formData.entries())
    );
    if (validationResult instanceof ArkErrors) {
      return fail(400, { error: validationResult.summary ?? "Invalid input" });
    }

    const { data: result, error } = await tryCatch(() =>
      auth.api.signUpEmail({
        body: {
          email: validationResult.email,
          password: validationResult.password,
          name: validationResult.name,
        },
        headers: request.headers,
      })
    );
    if (!result?.user) {
      return fail(400, { error: "Signup failed" });
    }
    if (error) {
      console.log({ error });
      return fail(400, {
        error: "Something went wrong please try again later",
      });
    }

    throw redirect(303, resolve("/login"));
  },
};
