import { auth } from "$lib/auth";
import { loginSchema } from "$lib/validators";
import { fail, redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";

export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Validate input with ArkType
    const validationResult = loginSchema({ email, password });
    
    if (validationResult instanceof Error) {
      return fail(400, { 
        error: "Invalid input data",
        details: validationResult.message 
      });
    }

    // Type guard to ensure we have valid data
    if (!('email' in validationResult) || !('password' in validationResult)) {
      return fail(400, { 
        error: "Invalid input data",
        details: "Missing required fields" 
      });
    }

    try {
      const result = await auth.api.signInEmail({
        body: {
          email: validationResult.email,
          password: validationResult.password,
        },
        headers: request.headers,
      });

      if ('error' in result) {
        return fail(400, { error: (result as any).error.message });
      }

      throw redirect(303, "/invoices");
    } catch (error) {
      console.error("Login error:", error);
      return fail(400, { error: "Login failed" });
    }
  },
};
