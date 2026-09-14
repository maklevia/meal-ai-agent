import { randomUUID } from "node:crypto";
import { FamilyUseCase } from "src/core/FamilyUseCase.base";
import { FamilyService } from "src/modules/family/Family.service";
import { FamilyRepository } from "src/modules/family/repositories/Family.repository";

type GenerateFamilyInvitationLinkResult = {
  invitationLink: string;
};

export class GenerateFamilyInvitationLinkUseCase extends FamilyUseCase<
  void,
  GenerateFamilyInvitationLinkResult
> {
  private readonly familyService: FamilyService = new FamilyService();
  private readonly familyRepository: FamilyRepository = new FamilyRepository();

  async executeFamily(): Promise<GenerateFamilyInvitationLinkResult> {
    const invitationToken = randomUUID();

    await this.familyRepository.setInvitationToken({
      familyId: this.user.family.id,
      invitationToken,
    });

    const invitationLink =
      this.familyService.createFamilyInvitationLink(invitationToken);

    return { invitationLink };
  }
}
