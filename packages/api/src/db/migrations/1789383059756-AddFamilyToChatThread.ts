import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFamilyToChatThread1789383059756 implements MigrationInterface {
    name = 'AddFamilyToChatThread1789383059756'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "families" DROP CONSTRAINT "FK_4d23afa6d34074476e54edbd4ea"`);
        await queryRunner.query(`CREATE TABLE "products" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "details" jsonb NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), "finished_at" TIMESTAMP WITH TIME ZONE, "family_id" integer NOT NULL, CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "families" DROP CONSTRAINT "REL_4d23afa6d34074476e54edbd4e"`);
        await queryRunner.query(`ALTER TABLE "families" DROP COLUMN "products_inventory_id"`);
        await queryRunner.query(`ALTER TABLE "chat_threads" ADD "family_id" integer`);
        await queryRunner.query(`ALTER TABLE "chat_threads" DROP CONSTRAINT "FK_093072e9060bf3b8fddd2fcd6e4"`);
        await queryRunner.query(`ALTER TABLE "chat_threads" ALTER COLUMN "user_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "password_reset_codes" ALTER COLUMN "created_at" SET DEFAULT 'NOW()'`);
        await queryRunner.query(`ALTER TABLE "chat_threads" ADD CONSTRAINT "CHK_thread_owner" CHECK (("user_id" IS NOT NULL AND "family_id" IS NULL) OR ("user_id" IS NULL AND "family_id" IS NOT NULL))`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_78bbdb337649eeefd5ef00a7b92" FOREIGN KEY ("family_id") REFERENCES "families"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chat_threads" ADD CONSTRAINT "FK_093072e9060bf3b8fddd2fcd6e4" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chat_threads" ADD CONSTRAINT "FK_b4d98612b59ef5ef8eff2d6cfba" FOREIGN KEY ("family_id") REFERENCES "families"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chat_threads" DROP CONSTRAINT "FK_b4d98612b59ef5ef8eff2d6cfba"`);
        await queryRunner.query(`ALTER TABLE "chat_threads" DROP CONSTRAINT "FK_093072e9060bf3b8fddd2fcd6e4"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_78bbdb337649eeefd5ef00a7b92"`);
        await queryRunner.query(`ALTER TABLE "chat_threads" DROP CONSTRAINT "CHK_thread_owner"`);
        await queryRunner.query(`ALTER TABLE "password_reset_codes" ALTER COLUMN "created_at" SET DEFAULT '2026-09-07 09:55:29.772143+00'`);
        await queryRunner.query(`ALTER TABLE "chat_threads" ALTER COLUMN "user_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "chat_threads" ADD CONSTRAINT "FK_093072e9060bf3b8fddd2fcd6e4" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chat_threads" DROP COLUMN "family_id"`);
        await queryRunner.query(`ALTER TABLE "families" ADD "products_inventory_id" integer`);
        await queryRunner.query(`ALTER TABLE "families" ADD CONSTRAINT "REL_4d23afa6d34074476e54edbd4e" UNIQUE ("products_inventory_id")`);
        await queryRunner.query(`DROP TABLE "products"`);
        await queryRunner.query(`ALTER TABLE "families" ADD CONSTRAINT "FK_4d23afa6d34074476e54edbd4ea" FOREIGN KEY ("products_inventory_id") REFERENCES "products_inventories"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

}
