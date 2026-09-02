import { AppDataSource } from "src/db/data-source.js";
import { RefreshToken } from "src/modules/auth/entities/RefreshToken.entity.js";
import { User } from "src/modules/user/entities/User.entity.js";

type StoreTokenOptions = {
  userId: number;
  refreshToken: string;
  expiresAt: Date;
};

export class RefreshTokenRepository {
  private readonly repo = AppDataSource.getRepository(RefreshToken);

  async storeToken(options: StoreTokenOptions): Promise<void> {
    const { userId, refreshToken, expiresAt } = options;

    const newRecord = new RefreshToken();
    newRecord.refreshToken = refreshToken;
    newRecord.user = { id: userId } as User;
    newRecord.expiresAt = expiresAt;

    await this.repo.save(newRecord);
  }

  async deleteTokensIfExist(userId: number): Promise<void> {
    await this.repo.delete({user: {id: userId}});
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    const record = await this.repo.findOne({
      where: { refreshToken: token },
      relations: { user: true },
    });

    return record;
  }
}
