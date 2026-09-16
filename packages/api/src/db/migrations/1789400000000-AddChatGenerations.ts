import { MigrationInterface, QueryRunner } from "typeorm";

export class AddChatGenerations1789400000000 implements MigrationInterface {
  name = "AddChatGenerations1789400000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."chat_generations_status_enum" AS ENUM('pending', 'streaming', 'completed', 'failed', 'cancelled')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."chat_generations_scope_enum" AS ENUM('user', 'family')`,
    );
    await queryRunner.query(
      `CREATE TABLE "chat_generations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" "public"."chat_generations_status_enum" NOT NULL DEFAULT 'pending', "scope" "public"."chat_generations_scope_enum" NOT NULL, "error" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), "started_at" TIMESTAMP WITH TIME ZONE, "finished_at" TIMESTAMP WITH TIME ZONE, "thread_id" integer NOT NULL, "requested_by_id" integer NOT NULL, "assistant_message_id" integer, CONSTRAINT "PK_chat_generations" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "chat_generations" ADD CONSTRAINT "FK_chat_generations_thread" FOREIGN KEY ("thread_id") REFERENCES "chat_threads"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "chat_generations" ADD CONSTRAINT "FK_chat_generations_requested_by" FOREIGN KEY ("requested_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "chat_generations" ADD CONSTRAINT "FK_chat_generations_assistant_message" FOREIGN KEY ("assistant_message_id") REFERENCES "chat_messages"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_chat_generations_active_thread" ON "chat_generations" ("thread_id") WHERE "status" IN ('pending', 'streaming')`,
    );

    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_chat_generations_active_user" ON "chat_generations" ("requested_by_id") WHERE "status" IN ('pending', 'streaming') AND "scope" = 'user'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."uq_chat_generations_active_user"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."uq_chat_generations_active_thread"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chat_generations" DROP CONSTRAINT "FK_chat_generations_assistant_message"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chat_generations" DROP CONSTRAINT "FK_chat_generations_requested_by"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chat_generations" DROP CONSTRAINT "FK_chat_generations_thread"`,
    );
    await queryRunner.query(`DROP TABLE "chat_generations"`);
    await queryRunner.query(`DROP TYPE "public"."chat_generations_scope_enum"`);
    await queryRunner.query(`DROP TYPE "public"."chat_generations_status_enum"`);
  }
}
