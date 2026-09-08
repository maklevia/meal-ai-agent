import { BaseRepository } from "src/db/BaseRepository";
import { Family } from "src/modules/family/entities/Family.entity";
import { User } from "src/modules/user/entities/User.entity";
import { EntityManager } from "typeorm";

type UpdateFamilyOwnerOptions = {
  familyId: number;
  newOwnerId: number;
};

type CreateFamilyOptions = {
  name: string;
  ownerId: number;
};

type SetInvitationTokenOptions = {
  familyId: number;
  invitationToken: string;
};

export class FamilyRepository extends BaseRepository<Family> {
  constructor(manager?: EntityManager) {
    super(manager);
  }

  protected get entity() {
    return Family;
  }

  async createFamily(options: CreateFamilyOptions): Promise<Family> {
    const { name, ownerId } = options;
    const newFamily = new Family();
    newFamily.name = name;
    newFamily.owner = { id: ownerId } as User;

    const createdFamily = await this.repo.save(newFamily);
    return createdFamily;
  }

  async findFamilyByUser(userId: number): Promise<Family | null> {
    const family = await this.repo.findOne({
      where: {
        users: { id: userId },
      },
      relations: ["owner", "users"],
    });

    return family;
  }

  async setInvitationToken(options: SetInvitationTokenOptions): Promise<void> {
    const { familyId, invitationToken } = options;
    await this.repo.update({ id: familyId }, { invitationToken });
  }

  async findInvitationByToken(token: string): Promise<Family | null> {
    const foundFamily = await this.repo.findOne({
      where: {
        invitationToken: token,
      },
    });

    return foundFamily;
  }

  async deleteFamilyById(familyId: number): Promise<void> {
    await this.repo.delete({ id: familyId });
  }

  async updateFamilyOwner(options: UpdateFamilyOwnerOptions): Promise<void> {
    const { familyId, newOwnerId } = options;
    await this.repo.update({ id: familyId }, { owner: { id: newOwnerId } });
  }
}
