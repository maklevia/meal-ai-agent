import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSenderToChatMessages1789477200000 implements MigrationInterface {
  name = "AddSenderToChatMessages1789477200000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "chat_messages" ADD "sender_id" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "chat_messages" ADD CONSTRAINT "FK_chat_messages_sender_id" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "chat_messages" DROP CONSTRAINT "FK_chat_messages_sender_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chat_messages" DROP COLUMN "sender_id"`,
    );
  }
}
