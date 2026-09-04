import { BaseRepository } from "src/db/BaseRepository";
import { Family } from "src/modules/family/entities/Family.entity";
import { EntityManager } from "typeorm";

export class FamilyRepository extends BaseRepository<Family> {
  constructor(manager?: EntityManager) {
    super(manager);
  }

  protected get entity() {
    return Family;
  }

  async createFamily(): Promise<Family> {
    const newFamily = new Family();

    const createdFamily = await this.repo.save(newFamily);
    return createdFamily;
  }

  async findFamilyByUser(userId: number): Promise<Family | null> {
    const family = await this.repo.findOne({
      where: {
        users: { id: userId },
      },
    });

    return family;
  }
}
