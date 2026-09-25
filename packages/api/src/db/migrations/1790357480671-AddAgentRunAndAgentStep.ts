import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAgentRunAndAgentStep1790357480671 implements MigrationInterface {
    name = 'AddAgentRunAndAgentStep1790357480671'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "agent_steps" ("id" SERIAL NOT NULL, "step_number" integer NOT NULL, "finish_reason" character varying(32), "raw_finish_reason" character varying(64), "usage" jsonb NOT NULL, "response_messages" jsonb NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), "agent_run_id" integer NOT NULL, CONSTRAINT "UQ_agent_steps_run_id_step_number" UNIQUE ("agent_run_id", "step_number"), CONSTRAINT "PK_8b98d514603983a4aab90a73f79" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."agent_runs_status_enum" AS ENUM('started', 'completed', 'failed', 'aborted')`);
        await queryRunner.query(`CREATE TABLE "agent_runs" ("id" SERIAL NOT NULL, "total_token_count" integer NOT NULL DEFAULT '0', "request_id" uuid NOT NULL, "status" "public"."agent_runs_status_enum" NOT NULL, "model_provider" character varying(64), "model_id" character varying(128), "step_count" integer NOT NULL DEFAULT '0', "error" jsonb, "finish_reason" character varying(32), "raw_finish_reason" character varying(64), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), "agent_message_id" integer, "user_message_id" integer NOT NULL, CONSTRAINT "UQ_ec33ddd99635a44908d25b5c096" UNIQUE ("request_id"), CONSTRAINT "REL_212a134afb76d1ea263b3599c2" UNIQUE ("agent_message_id"), CONSTRAINT "REL_db2cfd7281dbe92a5d1c874fc0" UNIQUE ("user_message_id"), CONSTRAINT "PK_442f7e0ec4ae860cf17edc57825" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "agent_steps" ADD CONSTRAINT "FK_agent_steps_agent_run_id" FOREIGN KEY ("agent_run_id") REFERENCES "agent_runs"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "agent_runs" ADD CONSTRAINT "FK_agent_runs_agent_message_id" FOREIGN KEY ("agent_message_id") REFERENCES "chat_messages"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "agent_runs" ADD CONSTRAINT "FK_agent_runs_user_message_id" FOREIGN KEY ("user_message_id") REFERENCES "chat_messages"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "agent_runs" DROP CONSTRAINT "FK_agent_runs_user_message_id"`);
        await queryRunner.query(`ALTER TABLE "agent_runs" DROP CONSTRAINT "FK_agent_runs_agent_message_id"`);
        await queryRunner.query(`ALTER TABLE "agent_steps" DROP CONSTRAINT "FK_agent_steps_agent_run_id"`);
        await queryRunner.query(`DROP TABLE "agent_runs"`);
        await queryRunner.query(`DROP TYPE "public"."agent_runs_status_enum"`);
        await queryRunner.query(`DROP TABLE "agent_steps"`);
    }

}
