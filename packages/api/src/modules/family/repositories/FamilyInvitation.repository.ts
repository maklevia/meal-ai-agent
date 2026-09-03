import { AppDataSource } from "src/db/data-source";
import { Family } from "src/modules/family/entities/Family.entity";
import { FamilyInvitation } from "src/modules/family/entities/FamilyInvitation.entiry";

type CreateInvitation = {
  email: string;
  familyId: number;
  expiresAt: Date;
};

export class FamilyInvitationRepository {
  private readonly repo = AppDataSource.getRepository(FamilyInvitation);

  async createInvitation(options: CreateInvitation): Promise<FamilyInvitation> {
    const { email, familyId, expiresAt } = options;

    const newInvitation = new FamilyInvitation();
    newInvitation.email = email;
    newInvitation.family = { id: familyId } as Family;
    newInvitation.expiresAt = expiresAt;

    const createdInvitation = await this.repo.save(newInvitation);

    return createdInvitation;
  }
}
