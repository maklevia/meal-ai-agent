import z from "zod";

export const createFamilyBodySchema = z.object({
    familyName: z.string().trim().min(1).max(100),
});

export type CreateFamilyBody = z.infer<typeof createFamilyBodySchema>;

export const joinFamilyBodySchema = z.object({
    invitationToken: z.string().uuid(),
});

export type JoinFamilyBody = z.infer<typeof joinFamilyBodySchema>;
