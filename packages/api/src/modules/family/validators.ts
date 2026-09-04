import z from "zod";

export const createInvitationLinkBodySchema = z.object({
    invitedUserEmail: z.string().email()
})

export type CreateInvitationLinkBody = z.infer<typeof createInvitationLinkBodySchema>;
