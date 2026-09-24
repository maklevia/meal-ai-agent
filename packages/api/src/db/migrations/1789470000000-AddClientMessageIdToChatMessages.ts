import { MigrationInterface, QueryRunner } from "typeorm";

export class AddClientMessageIdToChatMessages1789470000000
  implements MigrationInterface
{
  name = "AddClientMessageIdToChatMessages1789470000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "chat_messages" ADD "client_message_id" uuid`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_chat_messages_thread_client_message_id" ON "chat_messages" ("thread_id", "client_message_id") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."UQ_chat_messages_thread_client_message_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chat_messages" DROP COLUMN "client_message_id"`,
    );
  }
}
