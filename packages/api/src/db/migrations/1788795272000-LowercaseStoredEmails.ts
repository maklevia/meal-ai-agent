import { MigrationInterface, QueryRunner } from "typeorm";

export class LowercaseStoredEmails1788795272000 implements MigrationInterface {
    name = 'LowercaseStoredEmails1788795272000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`UPDATE "users" SET "email" = LOWER("email") WHERE "email" <> LOWER("email")`);
        await queryRunner.query(`UPDATE "registration_invitations" SET "email" = LOWER("email") WHERE "email" <> LOWER("email")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Data migration: original casing cannot be restored.
    }

}
