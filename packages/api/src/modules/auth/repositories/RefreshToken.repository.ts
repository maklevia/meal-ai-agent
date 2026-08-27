import { AppDataSource } from "src/db/data-source";
import { RefreshToken } from "src/modules/auth/entities/RefreshToken.entity";
import { User } from "src/modules/user/User.entity";

type StoreTokenOptions = {
    userId: number,
    refreshToken: string,
    expiresAt: Date,
}

export class RefreshTokenRepository{
    private readonly repo = AppDataSource.getRepository(RefreshToken)

    async storeToken(options: StoreTokenOptions): Promise<void> {
        const {userId, refreshToken, expiresAt} = options;

        const newRecord = new RefreshToken();
        newRecord.refreshToken = refreshToken;
        newRecord.user = {id: userId} as User;
        newRecord.expiresAt = expiresAt;

        await this.repo.save(newRecord);
    }

    async deleteToken(userId: number): Promise<void> {
        const record = await this.repo.findOneBy({user: {id: userId}});

        if (record) {
            await this.repo.remove(record);
        }
    }

    async findByToken(token: string): Promise<RefreshToken | null> {
        const record = await this.repo.findOneBy({refreshToken: token});

        return record;
    }
}