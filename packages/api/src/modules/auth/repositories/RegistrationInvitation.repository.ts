import { BaseRepository } from "src/db/BaseRepository";
import { RegistrationInvitation } from "src/modules/auth/entities/RegistrationInvitation.entity";
import { UserRole } from "src/modules/user/typedefs";
import { User } from "src/modules/user/entities/User.entity";
import { EntityManager } from "typeorm";

type CreateInvitationOptions = {
  email: string;
  role: UserRole;
  expiresAt: Date;
  invitedByUserId: number;
};

export class RegistrationInvitationRepository extends BaseRepository<RegistrationInvitation> {
  constructor(manager?: EntityManager) {
    super(manager);
  }

  protected get entity() {
    return RegistrationInvitation;
  }

  async createInvitation(options: CreateInvitationOptions): Promise<string> {
    const { email, role, expiresAt, invitedByUserId } = options;

    const newInvitation = new RegistrationInvitation();
    newInvitation.email = email;
    newInvitation.role = role;
    newInvitation.expiresAt = expiresAt;
    newInvitation.invitedBy = {id: invitedByUserId} as User;

    const createdInvitation = await this.repo.save(newInvitation);
    return createdInvitation.id;
  }

  async findByValidInvitation(invitationCode: string): Promise<RegistrationInvitation | null> {
    const validInvitation = await this.repo.findOneBy({id: invitationCode});

    if (!validInvitation || validInvitation.expiresAt < new Date()) {
      return null;
    }

    return validInvitation;
  }

  async deleteInvitation(invitationCode: string): Promise<void> {
    await this.repo.delete({id: invitationCode});
  }
}
