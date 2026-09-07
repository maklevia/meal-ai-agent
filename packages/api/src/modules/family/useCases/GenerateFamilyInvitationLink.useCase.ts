import { randomUUID } from "node:crypto";
import { AuthUseCase } from "src/core/AuthUseCase.base";
import { NotFoundError } from "src/errors/http/NotFoundError";
import { Family } from "src/modules/family/entities/Family.entity";
import { FamilyService } from "src/modules/family/Family.service";
import { FamilyRepository } from "src/modules/family/repositories/Family.repository";

type GenerateFamilyInvitationLinkOptions = {
  userId: number;
};

type GenerateFamilyInvitationLinkResult = {
  invitationLink: string;
};

export class GenerateFamilyInvitationLinkUseCase extends AuthUseCase<
  GenerateFamilyInvitationLinkOptions,
  GenerateFamilyInvitationLinkResult
> {
  private readonly familyRepository: FamilyRepository = new FamilyRepository();
  private readonly familyService: FamilyService = new FamilyService();

  async executeAuth(
    options: GenerateFamilyInvitationLinkOptions,
  ): Promise<GenerateFamilyInvitationLinkResult> {
    const { userId } = options;

    const family = await this.familyRepository.findFamilyByUser(userId);

    if (!family) {
      throw new NotFoundError("User does not have a family")
    }

    const invitationToken = randomUUID();
    await this.familyRepository.setInvitationToken({
      familyId: family.id,
      invitationToken,
    });

    const invitationLink =
      this.familyService.createFamilyInvitationLink(invitationToken);
    return { invitationLink };
  }
}
