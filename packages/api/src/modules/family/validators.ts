import z from "zod";
import { emailSchema } from "src/validation/schemas";

export const createFamilyBodySchema = z.object({
    familyName: z.string().trim().min(1).max(100),
});

export type CreateFamilyBody = z.infer<typeof createFamilyBodySchema>;

export const joinFamilyBodySchema = z.object({
    invitationToken: z.string().uuid(),
});

export type JoinFamilyBody = z.infer<typeof joinFamilyBodySchema>;

export const kickMemberParamsSchema = z.object({
    email: emailSchema,
});

export type KickMemberParams = z.infer<typeof kickMemberParamsSchema>;

export const leaveFamilyBodySchema = z.object({
    newOwnerEmail: z.string().email().optional(),
})

export type LeaveFamilyBody = z.infer<typeof leaveFamilyBodySchema>
