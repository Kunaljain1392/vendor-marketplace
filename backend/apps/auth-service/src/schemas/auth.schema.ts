import { z } from "zod";

/**
 * Password Policy
 * - Minimum 8 characters
 * - One uppercase
 * - One lowercase
 * - One number
 * - One special character
 */
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
    "Password must contain uppercase, lowercase, number and special character"
  );

/* -------------------------------------------------------------------------- */
/*                               Register Schema                              */
/* -------------------------------------------------------------------------- */

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),

    password: passwordSchema,

    firstName: z
      .string()
      .trim()
      .min(2, "First name must be at least 2 characters"),

    lastName: z
      .string()
      .trim()
      .min(2, "Last name must be at least 2 characters"),

    role: z
      .enum(["CUSTOMER", "VENDOR", "ADMIN"])
      .optional(),
  }),
});

/* -------------------------------------------------------------------------- */
/*                                 Login Schema                               */
/* -------------------------------------------------------------------------- */

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),

    password: z.string().min(1, "Password is required"),
  }),
});

/* -------------------------------------------------------------------------- */
/*                          Change Password Schema                            */
/* -------------------------------------------------------------------------- */

export const changePasswordSchema = z.object({
  body: z.object({
    oldPassword: z.string().min(1, "Old password is required"),

    newPassword: passwordSchema,
  }),
});

/* -------------------------------------------------------------------------- */
/*                         Forgot Password Schema                             */
/* -------------------------------------------------------------------------- */

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
  }),
});

/* -------------------------------------------------------------------------- */
/*                          Reset Password Schema                             */
/* -------------------------------------------------------------------------- */

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, "Reset token is required"),

    newPassword: passwordSchema,
  }),
});

/* -------------------------------------------------------------------------- */
/*                          Verify Email Schema                               */
/* -------------------------------------------------------------------------- */

export const verifyEmailSchema = z.object({
  body: z.object({
    token: z.string().min(1, "Verification token is required"),
  }),
});

/* -------------------------------------------------------------------------- */
/*                           Refresh Token Schema                             */
/* -------------------------------------------------------------------------- */

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, "Refresh token is required"),
  }),
});

/* -------------------------------------------------------------------------- */
/*                              Logout Schema                                 */
/* -------------------------------------------------------------------------- */

export const logoutSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, "Refresh token is required"),
  }),
});

/* -------------------------------------------------------------------------- */
/*                                   DTOs                                     */
/* -------------------------------------------------------------------------- */

export type RegisterDTO = z.infer<typeof registerSchema>["body"];

export type LoginDTO = z.infer<typeof loginSchema>["body"];

export type ChangePasswordDTO = z.infer<
  typeof changePasswordSchema
>["body"];

export type ForgotPasswordDTO = z.infer<
  typeof forgotPasswordSchema
>["body"];

export type ResetPasswordDTO = z.infer<
  typeof resetPasswordSchema
>["body"];

export type VerifyEmailDTO = z.infer<
  typeof verifyEmailSchema
>["body"];

export type RefreshTokenDTO = z.infer<
  typeof refreshTokenSchema
>["body"];

export type LogoutDTO = z.infer<
  typeof logoutSchema
>["body"];