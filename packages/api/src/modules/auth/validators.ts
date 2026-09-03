import { z } from "zod";

export const loginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type LoginBody = z.infer<typeof loginBodySchema>;

export const registerBodySchema = z.object({
  invitationCode: z.string().uuid(),
  password: z.string().min(8),
  name: z.string().trim().min(1).max(25),
});

export type RegisterBody = z.infer<typeof registerBodySchema>;

export const tokenCookiesSchema = z.object({
  refreshToken: z.string().min(1),
});

export type TokenCookies = z.infer<typeof tokenCookiesSchema>;

export const changePasswordBodySchema = z
  .object({
    oldPassword: z.string().min(8),
    newPassword: z.string().min(8),
  })
  .refine((data) => data.oldPassword !== data.newPassword, {
    message: "New password must differ from the old password",
    path: ["newPassword"],
  });

export type ChangePasswordBody = z.infer<typeof changePasswordBodySchema>;

export const createPasswordResetLinkBodySchema = z.object({
  email: z.string().email(),
});

export type CreatePasswordResetLinkBody = z.infer<
  typeof createPasswordResetLinkBodySchema
>;

export const validatePasswordResetCodeParamsSchema = z.object({
  resetCode: z.string().uuid(),
})

export type ValidatePasswordResetCodeParams = z.infer<typeof validatePasswordResetCodeParamsSchema>;

export const resetPasswordUsingLinkBodySchema = z.object({
  newPassword: z.string().min(8),
  resetCode: z.string().uuid(),
});

export type ResetPasswordUsingLinkBody = z.infer<
  typeof resetPasswordUsingLinkBodySchema
>;

export const bootstrapAdminBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().trim().min(1).max(25),
});

export type BootstrapAdminBody = z.infer<typeof bootstrapAdminBodySchema>;
