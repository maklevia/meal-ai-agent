import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameResetPasswordCodesToPasswordResetCodes1756475000000 implements MigrationInterface {
    name = 'RenameResetPasswordCodesToPasswordResetCodes1756475000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reset_password_codes" RENAME TO "password_reset_codes"`);
        await queryRunner.query(`ALTER INDEX "IDX_8c45859a5d1f8c7f4ecea5ec76" RENAME TO "IDX_password_reset_codes_code_hash"`);
        await queryRunner.query(`ALTER TABLE "password_reset_codes" RENAME CONSTRAINT "PK_73f29a51bd675d2dccdf1161655" TO "PK_password_reset_codes"`);
        await queryRunner.query(`ALTER TABLE "password_reset_codes" RENAME CONSTRAINT "FK_eecdf777f0c9bccf92739e8fec6" TO "FK_password_reset_codes_user_id"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "password_reset_codes" RENAME CONSTRAINT "FK_password_reset_codes_user_id" TO "FK_eecdf777f0c9bccf92739e8fec6"`);
        await queryRunner.query(`ALTER TABLE "password_reset_codes" RENAME CONSTRAINT "PK_password_reset_codes" TO "PK_73f29a51bd675d2dccdf1161655"`);
        await queryRunner.query(`ALTER INDEX "IDX_password_reset_codes_code_hash" RENAME TO "IDX_8c45859a5d1f8c7f4ecea5ec76"`);
        await queryRunner.query(`ALTER TABLE "password_reset_codes" RENAME TO "reset_password_codes"`);
    }
}
