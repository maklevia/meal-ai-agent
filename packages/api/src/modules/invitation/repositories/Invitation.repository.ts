import { AppDataSource } from "src/db/data-source";
import { Invitation } from "src/modules/invitation/entities/Invitation.entity";
import { UserRole } from "src/modules/user/typedefs";
import { User } from "src/modules/user/entities/User.entity";

type CreateInvitationOptions = {
  email: string;
  role: UserRole;
  expiresAt: Date;
  invitedByUserId: number;
};

export class InvitationRepository {
  private readonly repo = AppDataSource.getRepository(Invitation)

  async createInvitation(options: CreateInvitationOptions): Promise<string> {
    const { email, role, expiresAt, invitedByUserId } = options;

    const newInvitation = new Invitation();
    newInvitation.email = email;
    newInvitation.role = role;
    newInvitation.expiresAt = expiresAt;
    newInvitation.invitedBy = {id: invitedByUserId} as User;

    const createdInvitation = await this.repo.save(newInvitation);
    return createdInvitation.id;
  }

  async findByValidInvitation(invitationCode: string): Promise<Invitation | null> {
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
