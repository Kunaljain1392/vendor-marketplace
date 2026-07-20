import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    firstName: z.string().min(2, "First name is required (min 2 chars)"),
    lastName: z.string().min(2, "Last name is required (min 2 chars)"),
    role: z.enum(['CUSTOMER', 'VENDOR', 'ADMIN']).optional(),
  })
});

// Register schema ke theek niche isko add karein:
export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required"), // Yahan min 6 check karne ki zaroorat nahi, bas check karna hai ki khali na ho
  })
});

export const changePasswordSchema = z.object({
  body: z.object({
    oldPassword: z.string().min(1, "Old password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters long"),
  })
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
  })
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, "Token is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters long"),
  })
});

export const verifyEmailSchema = z.object({
  body: z.object({
    token: z.string().min(1, "Verification token is required"),
  })
});

export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>['body'];

export type VerifyEmailSchema = z.infer<typeof verifyEmailSchema>['body'];

export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>['body'];

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>['body'];

export type LoginInput = z.infer<typeof loginSchema>['body'];

export type RegisterInput = z.infer<typeof registerSchema>['body'];