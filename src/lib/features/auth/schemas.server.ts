// Auth form validation schemas using ArkType directly
// fallow-ignore-file
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

const updatePasswordSchema = type({
  confirmPassword: passwordSchema,
  newPassword: passwordSchema,
});

export const signupSchema = type({
  confirmPassword: passwordSchema,
  name: nameSchema,
})
  .merge(loginSchema)
  .narrow((data, context) => {
    if (data.password === data.confirmPassword) {
      return true;
    }
    return context.reject({
      actual: "",
      expected: "identical to password",
      path: ["confirmPassword"],
    });
  });
export const resetPasswordSchema = type({
  token: "string >= 1",
})
  .merge(updatePasswordSchema)
  .narrow((data, context) => {
    if (data.newPassword === data.confirmPassword) {
      return true;
    }
    return context.reject({
      actual: "New Password and Confirm Password are not identical",
      expected: "New Password and Confirm Password must be identical",
      path: ["confirmPassword"],
    });
  });

export const changePasswordSchema = type({
  currentPassword: passwordSchema,
  email: emailSchema,
})
  .merge(updatePasswordSchema)
  .narrow((data, context) => {
    if (data.newPassword === data.confirmPassword) {
      return true;
    }
    return context.reject({
      actual: "New Password and Confirm Password are not identical",
      expected: "New Password and Confirm Password must be identical",
      path: ["confirmPassword"],
    });
  });
