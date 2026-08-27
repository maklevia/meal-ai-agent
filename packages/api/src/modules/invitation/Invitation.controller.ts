import { Request, Response } from "express";
import { CreateInvitationUseCase } from "src/modules/invitation/useCases/CreateInvitation.useCase";
import { ValidateInvitationUseCase } from "src/modules/invitation/useCases/ValidateInvitation.useCase";

export class InvitationController {
    private readonly createInvitationUseCase: CreateInvitationUseCase = new CreateInvitationUseCase();
    private readonly validateInvitationUseCase: ValidateInvitationUseCase = new ValidateInvitationUseCase();

    createInvitation = async (req: Request, res: Response) => {
        const {email, role} = req.body;
        const invitedByUserId = req.userId;

        const { invitationLink } = await this.createInvitationUseCase.execute({email, role, invitedByUserId});

        res.status(201).json(invitationLink);
    }

    validateInvitation = async (req: Request, res: Response) => {
        const {invitationCode} = req.body;

        const result = await this.validateInvitationUseCase.execute({invitationCode});

        res.status(200).json(result);
    }
}
