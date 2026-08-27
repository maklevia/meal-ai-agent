import { Request, Response } from "express";
import { ValidationError } from "src/errors/AppError.js";
import { CreateInvitationUseCase } from "src/modules/invitation/useCases/CreateInvitation.useCase.js";
import { ValidateInvitationUseCase } from "src/modules/invitation/useCases/ValidateInvitation.useCase.js";

export class InvitationController {
  private readonly createInvitationUseCase: CreateInvitationUseCase =
    new CreateInvitationUseCase();
  private readonly validateInvitationUseCase: ValidateInvitationUseCase =
    new ValidateInvitationUseCase();

  createInvitation = async (req: Request, res: Response) => {
    const { email, role } = req.body;
    const invitedByUserId = req.userId;

    const { invitationLink } = await this.createInvitationUseCase.execute({
      email,
      role,
      invitedByUserId,
    });

    res.status(201).json(invitationLink);
  };

  validateInvitation = async (req: Request, res: Response) => {
    const { invitationCode } = req.params;

    if (typeof invitationCode !== "string" || !invitationCode) {
      throw new ValidationError("Invitation code is required.");
    }

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(invitationCode)) {
      throw new ValidationError("Invalid invitation code format.");
    }

    const result = await this.validateInvitationUseCase.execute({
      invitationCode,
    });

    res.status(200).json(result);
  };
}

