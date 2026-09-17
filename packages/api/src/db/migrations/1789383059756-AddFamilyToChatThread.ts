import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFamilyToChatThread1789383059756 implements MigrationInterface {
    name = 'AddFamilyToChatThread1789383059756'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chat_threads" ADD "family_id" integer`);
        await queryRunner.query(`ALTER TABLE "chat_threads" DROP CONSTRAINT "FK_093072e9060bf3b8fddd2fcd6e4"`);
        await queryRunner.query(`ALTER TABLE "chat_threads" ALTER COLUMN "user_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "chat_threads" ADD CONSTRAINT "CHK_thread_owner" CHECK (("user_id" IS NOT NULL AND "family_id" IS NULL) OR ("user_id" IS NULL AND "family_id" IS NOT NULL))`);
        await queryRunner.query(`ALTER TABLE "chat_threads" ADD CONSTRAINT "FK_093072e9060bf3b8fddd2fcd6e4" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chat_threads" ADD CONSTRAINT "FK_b4d98612b59ef5ef8eff2d6cfba" FOREIGN KEY ("family_id") REFERENCES "families"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chat_threads" DROP CONSTRAINT "FK_b4d98612b59ef5ef8eff2d6cfba"`);
        await queryRunner.query(`ALTER TABLE "chat_threads" DROP CONSTRAINT "FK_093072e9060bf3b8fddd2fcd6e4"`);
        await queryRunner.query(`ALTER TABLE "chat_threads" DROP CONSTRAINT "CHK_thread_owner"`);
        await queryRunner.query(`ALTER TABLE "chat_threads" ALTER COLUMN "user_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "chat_threads" ADD CONSTRAINT "FK_093072e9060bf3b8fddd2fcd6e4" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chat_threads" DROP COLUMN "family_id"`);
    }

}
