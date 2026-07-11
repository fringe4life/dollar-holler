// Auth form validation schemas using ArkType directly
// fallow-ignore-file
import { type } from "arktype";

const passwordSchema = type("string >= 6");
const emailSchema = type("string.email");
const nameSchema = type("string >= 1");

export const loginSchema = type({
  email: emailSchema,
  _password: passwordSchema,
});

export const forgotPasswordSchema = type({
  email: emailSchema,
});

const updatePasswordSchema = type({
  _confirmPassword: passwordSchema,
  _newPassword: passwordSchema,
});

export const signupSchema = type({
  _confirmPassword: passwordSchema,
  name: nameSchema,
})
  .merge(loginSchema)
  .narrow((data, context) => {
    if (data._password === data._confirmPassword) {
      return true;
    }
    return context.reject({
      actual: "",
      expected: "identical to password",
      path: ["_confirmPassword"],
    });
  });

export const resetPasswordSchema = type({
  token: "string >= 1",
})
  .merge(updatePasswordSchema)
  .narrow((data, context) => {
    if (data._newPassword === data._confirmPassword) {
      return true;
    }
    return context.reject({
      actual: "New Password and Confirm Password are not identical",
      expected: "New Password and Confirm Password must be identical",
      path: ["_confirmPassword"],
    });
  });

export const changePasswordSchema = type({
  _currentPassword: passwordSchema,
  email: emailSchema,
})
  .merge(updatePasswordSchema)
  .narrow((data, context) => {
    if (data._newPassword === data._confirmPassword) {
      return true;
    }
    return context.reject({
      actual: "New Password and Confirm Password are not identical",
      expected: "New Password and Confirm Password must be identical",
      path: ["_confirmPassword"],
    });
  });
