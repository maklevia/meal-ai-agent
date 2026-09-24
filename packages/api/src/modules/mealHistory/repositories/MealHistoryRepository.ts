import { BaseRepository } from "src/db/BaseRepository";
import { MealHistory } from "src/modules/mealHistory/entities/MealHistory.entity";
import { MealScore } from "src/modules/mealHistory/typedefs";
import { User } from "src/modules/user/entities/User.entity";
import { EntityManager } from "typeorm";

type MealHistoryOptions = {
  name: string;
  score: MealScore;
  userId: number;
};

export class MealHistoryRepository extends BaseRepository<MealHistory> {
  constructor(manager?: EntityManager) {
    super(manager);
  }

  protected get entity() {
    return MealHistory;
  }

  async createMealHistoryRecord(
    options: MealHistoryOptions,
  ): Promise<MealHistory> {
    const { score, name, userId } = options;

    const newRecord = new MealHistory();
    newRecord.name = name;
    newRecord.score = score;
    newRecord.user = {id: userId} as User;

    return await this.repo.save(newRecord)
  }
}
