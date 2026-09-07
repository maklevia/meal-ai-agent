import { GenerateFamilyInvitationLinkUseCase } from "src/modules/family/useCases/GenerateFamilyInvitationLink.useCase";
import { Request, Response } from "express";
import { CreateFamilyBody, JoinFamilyBody } from "src/modules/family/validators";
import { CreateFamilyUseCase } from "src/modules/family/useCases/CreateFamily.useCase";
import { GetFamilyInvitationLinkUseCase } from "src/modules/family/useCases/GetFamilyInvitationLink.useCase";
import { JoinFamilyByInvitationLinkUseCase } from "src/modules/family/useCases/JoinFamilyByInvitationLink.useCase";

export class FamilyController {
  private readonly generateInvitationLinkUseCase: GenerateFamilyInvitationLinkUseCase =
    new GenerateFamilyInvitationLinkUseCase();
  private readonly createFamilyUseCase: CreateFamilyUseCase =
    new CreateFamilyUseCase();
  private readonly getFamilyInvitationLinkUseCase: GetFamilyInvitationLinkUseCase =
    new GetFamilyInvitationLinkUseCase();
  private readonly joinFamilyByInvitationLinkUseCase: JoinFamilyByInvitationLinkUseCase =
    new JoinFamilyByInvitationLinkUseCase();

  generateInvitationLink = async (
    req: Request<unknown, unknown>,
    res: Response,
  ) => {
    const userId = req.userId;

    const { invitationLink } = await this.generateInvitationLinkUseCase.execute({userId});

    res.status(201).json({ invitationLink });
  };

  getInvitationLink = async (req: Request, res: Response) => {
    const userId = req.userId;

    const { invitationLink } =
      await this.getFamilyInvitationLinkUseCase.execute({ userId });

    res.status(200).json({ invitationLink });
  };

  createFamily = async (
    req: Request<unknown, unknown, CreateFamilyBody>,
    res: Response,
  ) => {
    const userId = req.userId;
    const { familyName } = req.body;

    await this.createFamilyUseCase.execute({ userId, familyName });

    res.status(201).json({ message: `Family ${familyName} was created.` });
  };

  joinFamily = async (req: Request<unknown, unknown, JoinFamilyBody>, res: Response) => {
    const { invitationToken } = req.body;
    const userId = req.userId;

    await this.joinFamilyByInvitationLinkUseCase.execute({
      userId,
      invitationToken,
    });

    res.status(204).send();
  };
}
