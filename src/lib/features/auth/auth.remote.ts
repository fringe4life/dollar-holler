import { resolve } from "$app/paths";
import { form, getRequestEvent } from "$app/server";
import { invalid, redirect } from "@sveltejs/kit";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
} from "$features/auth/schemas.server";
import { auth } from "$lib/auth.server";
import { tryCatch } from "$lib/utils/try-catch";

export const login = form(loginSchema, async (data) => {
  const { request } = getRequestEvent();

  const { data: result, error } = await tryCatch(() =>
    auth.api.signInEmail({
      body: {
        email: data.email,
        password: data._password,
      },
      headers: request.headers,
    })
  );

  if (!result || error) {
    invalid("Login failed");
  }

  redirect(303, resolve("/invoices"));
});

export const signup = form(signupSchema, async (data) => {
  const { request } = getRequestEvent();

  const { data: result, error } = await tryCatch(() =>
    auth.api.signUpEmail({
      body: {
        email: data.email,
        name: data.name,
        password: data._password,
      },
      headers: request.headers,
    })
  );

  if (!result?.user) {
    invalid("Signup failed");
  }

  if (error) {
    invalid("Something went wrong please try again later");
  }

  redirect(303, resolve("/login"));
});

export const forgotPassword = form(forgotPasswordSchema, async (data) => {
  const { request } = getRequestEvent();

  const { data: passwordReset, error } = await tryCatch(() =>
    auth.api.requestPasswordReset({
      body: { email: data.email },
      headers: request.headers,
    })
  );

  if (error || !passwordReset?.status) {
    invalid("Failed to send reset email");
  }

  return { success: true as const };
});

export const resetPassword = form(resetPasswordSchema, async (data) => {
  const { request } = getRequestEvent();

  const { data: result, error } = await tryCatch(() =>
    auth.api.resetPassword({
      body: {
        newPassword: data._newPassword,
        token: data.token,
      },
      headers: request.headers,
    })
  );

  if (!result || error) {
    invalid("Failed to reset password");
  }

  redirect(303, resolve("/invoices"));
});

export const changePassword = form(changePasswordSchema, async (data) => {
  const { request } = getRequestEvent();

  const { data: result, error } = await tryCatch(() =>
    auth.api.changePassword({
      body: {
        currentPassword: data._currentPassword,
        newPassword: data._newPassword,
      },
      headers: request.headers,
    })
  );

  if (error || !result) {
    invalid("Failed to change password");
  }

  return { success: true as const };
});
