import { MigrationInterface, QueryRunner } from "typeorm";

export class FamilyOwnerAndInvitationUnique1788531860280 implements MigrationInterface {
    name = 'FamilyOwnerAndInvitationUnique1788531860280'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "family_invitation" DROP COLUMN "expires_at"`);
        await queryRunner.query(`ALTER TABLE "families" ADD "owner_id" integer`);
        await queryRunner.query(`ALTER TABLE "family_invitation" DROP CONSTRAINT "FK_8a8a68fdb2bdb3679222c1a8da6"`);
        await queryRunner.query(`ALTER TABLE "family_invitation" ADD CONSTRAINT "UQ_8a8a68fdb2bdb3679222c1a8da6" UNIQUE ("family_id")`);
        await queryRunner.query(`ALTER TABLE "families" ADD CONSTRAINT "FK_8868f8a4d2f4ca0c9082c793b39" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "family_invitation" ADD CONSTRAINT "FK_8a8a68fdb2bdb3679222c1a8da6" FOREIGN KEY ("family_id") REFERENCES "families"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "family_invitation" DROP CONSTRAINT "FK_8a8a68fdb2bdb3679222c1a8da6"`);
        await queryRunner.query(`ALTER TABLE "families" DROP CONSTRAINT "FK_8868f8a4d2f4ca0c9082c793b39"`);
        await queryRunner.query(`ALTER TABLE "family_invitation" DROP CONSTRAINT "UQ_8a8a68fdb2bdb3679222c1a8da6"`);
        await queryRunner.query(`ALTER TABLE "family_invitation" ADD CONSTRAINT "FK_8a8a68fdb2bdb3679222c1a8da6" FOREIGN KEY ("family_id") REFERENCES "families"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "families" DROP COLUMN "owner_id"`);
        await queryRunner.query(`ALTER TABLE "family_invitation" ADD "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL`);
    }

}
