import { BaseRepository } from "src/db/BaseRepository";
import { UserPreferences } from "src/modules/user/entities/UserPreferences.entity";
import { EntityManager } from "typeorm";

export class UserPreferencesRepository extends BaseRepository<UserPreferences> {
  constructor(manager?: EntityManager) {
    super(manager);
  }

  protected get entity() {
    return UserPreferences;
  }

  async findPreferencesByUserId(
    userId: number,
  ): Promise<UserPreferences | null> {
    const result = await this.repo.findOne({
      where: {
        user: { id: userId },
      },
    });

    return result;
  }
}
