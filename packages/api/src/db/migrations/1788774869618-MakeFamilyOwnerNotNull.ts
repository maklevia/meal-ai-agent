import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeFamilyOwnerNotNull1788774869618 implements MigrationInterface {
    name = 'MakeFamilyOwnerNotNull1788774869618'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "families" DROP CONSTRAINT "FK_8868f8a4d2f4ca0c9082c793b39"`);
        await queryRunner.query(`ALTER TABLE "families" ALTER COLUMN "owner_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "password_reset_codes" ALTER COLUMN "created_at" SET DEFAULT 'NOW()'`);
        await queryRunner.query(`ALTER TABLE "family_invitation" ALTER COLUMN "created_at" SET DEFAULT 'NOW()'`);
        await queryRunner.query(`ALTER TABLE "families" ADD CONSTRAINT "FK_8868f8a4d2f4ca0c9082c793b39" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "families" DROP CONSTRAINT "FK_8868f8a4d2f4ca0c9082c793b39"`);
        await queryRunner.query(`ALTER TABLE "family_invitation" ALTER COLUMN "created_at" SET DEFAULT '2026-09-04 11:50:18.031053+00'`);
        await queryRunner.query(`ALTER TABLE "password_reset_codes" ALTER COLUMN "created_at" SET DEFAULT '2026-09-04 11:50:18.031053+00'`);
        await queryRunner.query(`ALTER TABLE "families" ALTER COLUMN "owner_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "families" ADD CONSTRAINT "FK_8868f8a4d2f4ca0c9082c793b39" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

}
