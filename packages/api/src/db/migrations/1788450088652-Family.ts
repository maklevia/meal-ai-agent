import { MigrationInterface, QueryRunner } from "typeorm";

export class Family1788450088652 implements MigrationInterface {
    name = 'Family1788450088652'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "password_reset_codes" DROP CONSTRAINT "FK_password_reset_codes_user_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_password_reset_codes_code_hash"`);
        await queryRunner.query(`CREATE TABLE "family_invitation" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT 'NOW()', "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "email" character varying(255) NOT NULL, "family_id" integer, "invited_by_id" integer, CONSTRAINT "PK_4fb559e55d6f1fb8216caabb157" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "password_reset_codes" ALTER COLUMN "created_at" SET DEFAULT 'NOW()'`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_f7e3fb91eefd70c2a466acf383" ON "password_reset_codes" ("code_hash") `);
        await queryRunner.query(`ALTER TABLE "password_reset_codes" ADD CONSTRAINT "FK_421ca49f5a7b180365035267ca6" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "family_invitation" ADD CONSTRAINT "FK_8a8a68fdb2bdb3679222c1a8da6" FOREIGN KEY ("family_id") REFERENCES "families"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "family_invitation" ADD CONSTRAINT "FK_25c369ed52e5d24ca97d5fdbb92" FOREIGN KEY ("invited_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "family_invitation" DROP CONSTRAINT "FK_25c369ed52e5d24ca97d5fdbb92"`);
        await queryRunner.query(`ALTER TABLE "family_invitation" DROP CONSTRAINT "FK_8a8a68fdb2bdb3679222c1a8da6"`);
        await queryRunner.query(`ALTER TABLE "password_reset_codes" DROP CONSTRAINT "FK_421ca49f5a7b180365035267ca6"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f7e3fb91eefd70c2a466acf383"`);
        await queryRunner.query(`ALTER TABLE "password_reset_codes" ALTER COLUMN "created_at" SET DEFAULT '2026-08-28 17:56:13.847358+00'`);
        await queryRunner.query(`DROP TABLE "family_invitation"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_password_reset_codes_code_hash" ON "password_reset_codes" ("code_hash") `);
        await queryRunner.query(`ALTER TABLE "password_reset_codes" ADD CONSTRAINT "FK_password_reset_codes_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
