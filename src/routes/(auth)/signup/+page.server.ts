import { auth } from "$lib/auth";
import { signupSchema } from "$lib/validators";
import { fail, redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";

export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData();

    // Validate input with ArkType
    const validationResult = signupSchema(formData);
    
    if (validationResult instanceof Error) {
      return fail(400, { 
        error: "Invalid input data",
        details: validationResult.message 
      });
    }

    // Type guard to ensure we have valid data
    if (!('email' in validationResult) || !('password' in validationResult) || !('name' in validationResult)) {
      return fail(400, { 
        error: "Invalid input data",
        details: "Missing required fields" 
      });
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

      if ('error' in result) {
        return fail(400, { error: "Something went wrong please try again later" });
      }

      throw redirect(303, "/login");
    } catch (error) {
      console.error("Signup error:", error);
      return fail(400, { error: "Signup failed" });
    }
  },
};
