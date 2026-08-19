import {
  email,
  forward,
  minLength,
  object,
  partialCheck,
  pipe,
  string,
} from "valibot";

const passwordSchema = pipe(string(), minLength(6));
const emailSchema = pipe(string(), email());
const nameSchema = pipe(string(), minLength(1));

export const loginSchema = object({
  email: emailSchema,
  _password: passwordSchema,
});

export const forgotPasswordSchema = object({
  email: emailSchema,
});

export const signupSchema = pipe(
  object({
    _confirmPassword: passwordSchema,
    _password: passwordSchema,
    email: emailSchema,
    name: nameSchema,
  }),
  forward(
    partialCheck(
      [["_password"], ["_confirmPassword"]],
      (input) => input._password === input._confirmPassword,
      "identical to password"
    ),
    ["_confirmPassword"]
  )
);

export const resetPasswordSchema = pipe(
  object({
    _confirmPassword: passwordSchema,
    _newPassword: passwordSchema,
    token: pipe(string(), minLength(1)),
  }),
  forward(
    partialCheck(
      [["_newPassword"], ["_confirmPassword"]],
      (input) => input._newPassword === input._confirmPassword,
      "New Password and Confirm Password must be identical"
    ),
    ["_confirmPassword"]
  )
);

export const changePasswordSchema = pipe(
  object({
    _confirmPassword: passwordSchema,
    _currentPassword: passwordSchema,
    _newPassword: passwordSchema,
    email: emailSchema,
  }),
  forward(
    partialCheck(
      [["_newPassword"], ["_confirmPassword"]],
      (input) => input._newPassword === input._confirmPassword,
      "New Password and Confirm Password must be identical"
    ),
    ["_confirmPassword"]
  )
);
