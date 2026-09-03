import { UserRole } from "src/modules/user/typedefs";
import { z } from "zod";

export const createInvitationBodySchema = z.object({
  email: z.string().email(),
  role: z.nativeEnum(UserRole),
});

export type CreateInvitationBody = z.infer<typeof createInvitationBodySchema>;

export const validateInvitationParamsSchema = z.object({
  invitationCode: z.string().uuid(),
});

export type ValidateInvitationParams = z.infer<
  typeof validateInvitationParamsSchema
>;
