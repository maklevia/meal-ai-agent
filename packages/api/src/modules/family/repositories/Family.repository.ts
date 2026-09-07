import { BaseRepository } from "src/db/BaseRepository";
import { Family } from "src/modules/family/entities/Family.entity";
import { User } from "src/modules/user/entities/User.entity";
import { EntityManager } from "typeorm";

export class FamilyRepository extends BaseRepository<Family> {
  constructor(manager?: EntityManager) {
    super(manager);
  }

  protected get entity() {
    return Family;
  }

  async createFamily(name: string, ownerId: number): Promise<Family> {
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
      relations: ["owner"],
    });

    return family;
  }

  async setInvitationToken(
    familyId: number,
    invitationToken: string,
  ): Promise<void> {
    await this.repo.update(
      { id: familyId },
      { invitationToken },
    );
  }

  async findInvitationByToken(token: string): Promise<Family | null> {
    const foundFamily = await this.repo.findOne({
      where: {
        invitationToken: token
      },
    })

    return foundFamily;
  }
}
