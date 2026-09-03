import { AppDataSource } from "src/db/data-source";
import { Family } from "src/modules/family/entities/Family.entity";

type CreateFamilyOptions = {
  userId: number;
  name: string;
};

export class FamilyRepository {
  private readonly repo = AppDataSource.getRepository(Family);


  async findFamilyByUser(userId: number): Promise<Family | null> {
    const family = await this.repo.findOne({where: {
      users: {id: userId}
    }})

    return family;
  }
}
