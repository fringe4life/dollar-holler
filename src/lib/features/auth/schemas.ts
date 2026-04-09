// Auth form validation schemas using ArkType directly

import { type } from "arktype";

const passwordSchema = type("string >= 6");
const emailSchema = type("string.email");
const nameSchema = type("string >= 1");

export const loginSchema = type({
  email: emailSchema,
  password: passwordSchema,
});

export const forgotPassword = type({
  email: emailSchema,
});

export const signupSchema = type({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: passwordSchema,
  name: nameSchema,
}).narrow((data, context) => {
  if (data.password === data.confirmPassword) {
    return true;
  }
  return context.reject({
    expected: "identical to password",
    actual: "",
    path: ["confirmPassword"],
  });
});

export const resetPasswordSchema = type({
  newPassword: passwordSchema,
  confirmPassword: passwordSchema,
  token: "string >= 1",
}).narrow((data, context) => {
  if (data.newPassword === data.confirmPassword) return true;
  return context.reject({
    expected: "identical to newPassword",
    actual: "",
    path: ["confirmPassword"],
  });
});

export const changePasswordSchema = type({
  email: emailSchema,
  currentPassword: passwordSchema,
  newPassword: passwordSchema,
  confirmPassword: passwordSchema,
}).narrow((data, context) => {
  if (data.newPassword === data.confirmPassword) return true;
  return context.reject({
    expected: "identical to newPassword",
    actual: "",
    path: ["confirmPassword"],
  });
});

export type LoginData = typeof loginSchema.infer;
export type SignupData = typeof signupSchema.infer;
export type ResetPasswordData = typeof resetPasswordSchema.infer;
export type ChangePasswordData = typeof changePasswordSchema.infer;
