import { AppDataSource } from "src/db/data-source";
import { RefreshToken } from "src/modules/auth/entities/RefreshToken.entity";
import { User } from "src/modules/user/entities/User.entity";
import { Not } from "typeorm";

type StoreTokenOptions = {
  userId: number;
  refreshToken: string;
  expiresAt: Date;
};

type DeleteAllTokensExceptOptions = {
  userId: number;
  tokenToKeep: string;
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
    await this.repo.delete({ user: { id: userId } });
  }

  async deleteTokenForUser(userId: number, token: string): Promise<void> {
    await this.repo.delete({ user: { id: userId }, refreshToken: token });
  }

  async deleteAllUserTokensExcept(
    options: DeleteAllTokensExceptOptions,
  ): Promise<void> {
    const { userId, tokenToKeep } = options;

    await this.repo.delete({
      user: { id: userId },
      refreshToken: Not(tokenToKeep),
    });
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    const record = await this.repo.findOne({
      where: { refreshToken: token },
      relations: { user: true },
    });

    return record;
  }
}
