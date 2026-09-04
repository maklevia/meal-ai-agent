import { BaseRepository } from "src/db/BaseRepository";
import { PasswordResetCode } from "src/modules/auth/entities/PasswordResetCode.entity";
import { User } from "src/modules/user/entities/User.entity";
import { EntityManager } from "typeorm";

interface CreatePasswordResetCodeOptions {
    userId: number,
    expiresAt: Date,
    codeHash: string,
}

export class PasswordResetCodeRepository extends BaseRepository<PasswordResetCode> {
    constructor(manager?: EntityManager) {
        super(manager);
    }

    protected get entity() {
        return PasswordResetCode;
    }

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
