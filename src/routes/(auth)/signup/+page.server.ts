import { auth } from "$lib/auth";
import { signupSchema } from "$lib/validators";
import { fail, isRedirect, redirect } from "@sveltejs/kit";
import { ArkErrors } from "arktype";
import type { Actions } from "./$types";

export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const validationResult = signupSchema(formData);

    if (validationResult instanceof ArkErrors) {
      return fail(400, { error: validationResult.summary ?? "Invalid input" });
    }

    try {
      const result = await auth.api.signUpEmail({
        body: {
          email: validationResult.email,
          password: validationResult.password,
          name: validationResult.name,
        },
        headers: request.headers,
      });

      if ("error" in result) {
        return fail(400, {
          error: "Something went wrong please try again later",
        });
      }
      throw redirect(303, "/login");
    } catch (error) {
      if (isRedirect(error)) throw error;
      return fail(400, { error: "Signup failed" });
    }
  },
};
