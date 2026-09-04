import { CreateFamilyInvitationLinkUseCase } from "src/modules/family/useCases/CreateFamilyInvitationLink.useCase";
import { Request, Response } from "express";

export class FamilyController {
  private readonly createInvitationLinkUseCase: CreateFamilyInvitationLinkUseCase =
    new CreateFamilyInvitationLinkUseCase();

  createInvitationLink = async (req: Request, res: Response) => {
    const userId = req.userId;
    const { invitedUserEmail } = req.body;

    const { invitationLink } = await this.createInvitationLinkUseCase.execute({
      userId,
      invitedUserEmail,
    });

    res.status(201).json({ invitationLink });
  };
}
