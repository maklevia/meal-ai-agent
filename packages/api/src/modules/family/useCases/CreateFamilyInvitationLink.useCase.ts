import { AuthUseCase } from "src/core/AuthUseCase.base";
import { NotFoundError } from "src/errors/http/NotFoundError";
import { FamilyRepository } from "src/modules/family/repositories/Family.repository";
import { FamilyInvitationRepository } from "src/modules/family/repositories/FamilyInvitation.repository";

type CreateFamilyInvotationLinkOptions = {
  userId: number;
  invitedUserEmail: number;
};

type CreateFamilyInvotationLinkResult = {
  invitationLink: string;
};

export class CreateFamilyInvotationLinkUseCase extends AuthUseCase<
  CreateFamilyInvotationLinkOptions,
  CreateFamilyInvotationLinkResult
> {
    private readonly familyIntivationRepository: FamilyInvitationRepository = new FamilyInvitationRepository();
    private readonly familyRepository: FamilyRepository = new FamilyRepository();

    async executeAuth(options: CreateFamilyInvotationLinkOptions): Promise<CreateFamilyInvotationLinkResult> {
        const {userId, invitedUserEmail} = options;

        const family = this.familyRepository.findFamilyByUser(userId);
        if (!family) {
            throw new NotFoundError("User's family not found");
        }

        

    }
}
