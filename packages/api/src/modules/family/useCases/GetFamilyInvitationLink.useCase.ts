import { FamilyUseCase } from "src/core/FamilyUseCase.base";
import { FamilyErrorMessages } from "src/errors";
import { NotFoundError } from "src/errors/http/NotFoundError";
import { FamilyService } from "src/modules/family/Family.service";

type GetFamilyInvitationLinkResult = {
  invitationLink: string;
};

export class GetFamilyInvitationLinkUseCase extends FamilyUseCase<
  void,
  GetFamilyInvitationLinkResult
> {
  private readonly familyService: FamilyService = new FamilyService();

  async executeFamily(): Promise<GetFamilyInvitationLinkResult> {
    const { invitationToken } = this.user.family;

    if (!invitationToken) {
      throw new NotFoundError(FamilyErrorMessages.FAMILY_INVITATION_NOT_FOUND);
    }

    const invitationLink =
      this.familyService.createFamilyInvitationLink(invitationToken);

    return { invitationLink };
  }
}
