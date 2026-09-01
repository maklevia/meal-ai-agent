import { AppDataSource } from "src/db/data-source.js";
import { PasswordResetCode } from "src/modules/auth/entities/PasswordResetCode.entity.js";
import { User } from "src/modules/user/entities/User.entity.js";

interface CreatePasswordResetCodeOptions {
    userId: number,
    expiresAt: Date,
    codeHash: string,
}

export class PasswordResetCodeRepository {
    private readonly repo = AppDataSource.getRepository(PasswordResetCode);

    async createPasswordResetCode(options: CreatePasswordResetCodeOptions): Promise<PasswordResetCode> {
        const { userId, expiresAt, codeHash } = options;

        const newRecord = new PasswordResetCode();
        newRecord.codeHash = codeHash;
        newRecord.user = {id: userId} as User;
        newRecord.expiresAt = expiresAt;

        const createdRecord = await this.repo.save(newRecord);
        return createdRecord;
    }

    async findResetCode(codeHash: string): Promise<PasswordResetCode | null> {
        const codeRecord = await this.repo.findOne({
            where: { codeHash },
            relations: { user: true },
        });

        return codeRecord;
    }

    async deleteAllUserResetCodes(userId: number): Promise<void> {
        await this.repo.delete({user: {id: userId}});
    }
}
