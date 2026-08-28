import { z } from "zod";

export const loginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type LoginBody = z.infer<typeof loginBodySchema>;

export const registerBodySchema = z.object({
  invitationCode: z.string().uuid(),
  password: z.string().min(8),
  name: z.string(),
});

export type RegisterBody = z.infer<typeof registerBodySchema>;

export const refreshCookiesSchema = z.object({
  refreshToken: z.string().min(1),
});

export type RefreshCookies = z.infer<typeof refreshCookiesSchema>;
