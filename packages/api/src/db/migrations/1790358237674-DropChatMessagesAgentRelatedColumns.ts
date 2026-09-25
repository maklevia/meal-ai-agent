import { MigrationInterface, QueryRunner } from "typeorm";

export class DropChatMessagesAgentRelatedColumns1790358237674 implements MigrationInterface {
    name = 'DropChatMessagesAgentRelatedColumns1790358237674'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chat_messages" DROP CONSTRAINT "CHK_token_count_positive"`);
        await queryRunner.query(`ALTER TABLE "chat_messages" DROP COLUMN "token_count"`);
        await queryRunner.query(`ALTER TABLE "chat_messages" DROP COLUMN "generation_request_id"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chat_messages" ADD "generation_request_id" uuid`);
        await queryRunner.query(`ALTER TABLE "chat_messages" ADD "token_count" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "chat_messages" ADD CONSTRAINT "CHK_token_count_positive" CHECK ((token_count >= 0))`);
    }

}
