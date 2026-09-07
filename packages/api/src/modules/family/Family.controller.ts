import { GenerateFamilyInvitationLinkUseCase } from "src/modules/family/useCases/GenerateFamilyInvitationLink.useCase";
import { Request, Response } from "express";
import {
  CreateFamilyBody,
  JoinFamilyBody,
  KickMemberParams,
  LeaveFamilyBody,
} from "src/modules/family/validators";
import { CreateFamilyUseCase } from "src/modules/family/useCases/CreateFamily.useCase";
import { GetFamilyInvitationLinkUseCase } from "src/modules/family/useCases/GetFamilyInvitationLink.useCase";
import { JoinFamilyByInvitationLinkUseCase } from "src/modules/family/useCases/JoinFamilyByInvitationLink.useCase";
import { KickFamilyMemberUseCase } from "src/modules/family/useCases/KickFamilyMember.useCase";
import { LeaveFamilyUseCase } from "src/modules/family/useCases/LeaveFamily.useCase";

export class FamilyController {
  private readonly generateInvitationLinkUseCase: GenerateFamilyInvitationLinkUseCase =
    new GenerateFamilyInvitationLinkUseCase();
  private readonly createFamilyUseCase: CreateFamilyUseCase =
    new CreateFamilyUseCase();
  private readonly getFamilyInvitationLinkUseCase: GetFamilyInvitationLinkUseCase =
    new GetFamilyInvitationLinkUseCase();
  private readonly joinFamilyByInvitationLinkUseCase: JoinFamilyByInvitationLinkUseCase =
    new JoinFamilyByInvitationLinkUseCase();
  private readonly kickFamilyMemberUseCase: KickFamilyMemberUseCase =
    new KickFamilyMemberUseCase();
  private readonly leaveFamilyUseCase: LeaveFamilyUseCase = new LeaveFamilyUseCase();

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

  kickMember = async (req: Request<KickMemberParams>, res: Response) => {
    const { email } = req.params;
    const userId = req.userId;

    await this.kickFamilyMemberUseCase.execute({ userId, memberEmail: email });

    res.status(204).send();
  };

  leaveFamily = async (req: Request<unknown, unknown, LeaveFamilyBody>, res: Response) => {
    const {newOwnerEmail} = req.body;
    const userId = req.userId;

    await this.leaveFamilyUseCase.execute({userId, newOwnerEmail});

    res.status(204).send()
  }
}
