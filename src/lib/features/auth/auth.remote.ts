import { resolve } from "$app/paths";
import { form, getRequestEvent } from "$app/server";
import { invalid, redirect } from "@sveltejs/kit";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
} from "#features/auth/schemas.ts";
import { getAuth } from "#lib/auth.server.ts";
import { tryCatch } from "#lib/utils/try-catch.ts";

/**
 * Workaround: call `.for($props.id())` on auth remotes for a per-mount instance —
 * Kit caches the imported `form()`, so values/issues/result survive SPA nav
 * (login → logout → login still filled). Underscore fields are redacted from
 * the response (#17128) but still stay in the DOM when JS runs; redaction does
 * not clear client inputs.
 *
 * @remarks
 * Still required on `@sveltejs/kit@3.0.0`.
 * Drop when upstream ships a fix; re-verify before deleting.
 *
 * @see https://github.com/sveltejs/kit/issues/14802 — open: values persist after nav
 * @see https://github.com/sveltejs/kit/issues/14210 — open: no `form.reset()` / `clear()`
 *   (reset PR #14779 closed — prefer fixing native reset handler)
 * @see https://github.com/sveltejs/kit/pull/14815 — open: form factory
 * @see https://github.com/fringe4life/dollar-holler/issues/105 — tracking
 */
export const login = form(loginSchema, async (data) => {
  const { request } = getRequestEvent();

  const { data: result, error } = await tryCatch(() =>
    getAuth().api.signInEmail({
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

  redirect(303, resolve("invoices"));
}).preflight(loginSchema);

export const signup = form(signupSchema, async (data) => {
  const { request } = getRequestEvent();

  const { data: result, error } = await tryCatch(() =>
    getAuth().api.signUpEmail({
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

  redirect(303, resolve("login"));
}).preflight(signupSchema);

export const forgotPassword = form(forgotPasswordSchema, async (data) => {
  const { request } = getRequestEvent();

  const { data: passwordReset, error } = await tryCatch(() =>
    getAuth().api.requestPasswordReset({
      body: { email: data.email },
      headers: request.headers,
    })
  );

  if (error || !passwordReset?.status) {
    invalid("Failed to send reset email");
  }

  return { success: true as const };
}).preflight(forgotPasswordSchema);

export const resetPassword = form(resetPasswordSchema, async (data) => {
  const { request } = getRequestEvent();

  const { data: result, error } = await tryCatch(() =>
    getAuth().api.resetPassword({
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

  redirect(303, resolve("invoices"));
}).preflight(resetPasswordSchema);

export const logout = form(async () => {
  const { request } = getRequestEvent();
  const { error } = await tryCatch(() =>
    getAuth().api.signOut({ headers: request.headers })
  );
  if (error) {
    invalid("Logout failed");
  }
  redirect(303, resolve("login"));
});

export const changePassword = form(changePasswordSchema, async (data) => {
  const { request } = getRequestEvent();

  const { data: result, error } = await tryCatch(() =>
    getAuth().api.changePassword({
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
}).preflight(changePasswordSchema);
