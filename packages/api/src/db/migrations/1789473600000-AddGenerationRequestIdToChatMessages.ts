import { MigrationInterface, QueryRunner } from "typeorm";

export class AddGenerationRequestIdToChatMessages1789473600000
  implements MigrationInterface
{
  name = "AddGenerationRequestIdToChatMessages1789473600000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "chat_messages" ADD "generation_request_id" uuid`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "chat_messages" DROP COLUMN "generation_request_id"`,
    );
  }
}
