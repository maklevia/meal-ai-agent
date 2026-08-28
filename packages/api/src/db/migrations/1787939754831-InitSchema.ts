import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1787939754831 implements MigrationInterface {
    name = 'InitSchema1787939754831'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."user_preferences_special_diet_enum" AS ENUM('vegan', 'vegetarian', 'pescatarian', 'halal', 'kosher', 'glutenFree', 'dairyFree', 'none')`);
        await queryRunner.query(`CREATE TABLE "user_preferences" ("id" SERIAL NOT NULL, "height" integer NOT NULL, "weight" integer NOT NULL, "age" integer NOT NULL, "kcal_per_day" integer NOT NULL, "special_diet" "public"."user_preferences_special_diet_enum" NOT NULL DEFAULT 'none', "user_id" integer, CONSTRAINT "REL_458057fa75b66e68a275647da2" UNIQUE ("user_id"), CONSTRAINT "CHK_kcal_positive" CHECK ("kcal_per_day" > 0), CONSTRAINT "CHK_weight_positive" CHECK ("weight" > 0), CONSTRAINT "CHK_height_range" CHECK ("height" > 0 AND "height" < 300), CONSTRAINT "CHK_age_range" CHECK ("age" > 14 AND "age" < 99), CONSTRAINT "PK_e8cfb5b31af61cd363a6b6d7c25" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "products_inventories" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "details" jsonb NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), "finished_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_7919a9d14d3e307268c953a41e6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "families" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), "products_inventory_id" integer, CONSTRAINT "REL_4d23afa6d34074476e54edbd4e" UNIQUE ("products_inventory_id"), CONSTRAINT "PK_70414ac0c8f45664cf71324b9bb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "meal_histories" ("id" SERIAL NOT NULL, "score" smallint NOT NULL, "name" character varying(255) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), "user_id" integer NOT NULL, CONSTRAINT "CHK_score_range" CHECK ("score" >= 1 AND "score" <= 5), CONSTRAINT "PK_a2e8446ea8adcdfdcf317e478de" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."chat_messages_role_enum" AS ENUM('user', 'assistant', 'system')`);
        await queryRunner.query(`CREATE TABLE "chat_messages" ("id" SERIAL NOT NULL, "role" "public"."chat_messages_role_enum" NOT NULL, "content" text NOT NULL, "token_count" integer NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), "thread_id" integer NOT NULL, CONSTRAINT "CHK_token_count_positive" CHECK ("token_count" >= 0), CONSTRAINT "PK_40c55ee0e571e268b0d3cd37d10" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."chat_threads_status_enum" AS ENUM('active', 'archived')`);
        await queryRunner.query(`CREATE TABLE "chat_threads" ("id" SERIAL NOT NULL, "title" character varying(255) NOT NULL, "status" "public"."chat_threads_status_enum" NOT NULL DEFAULT 'active', "metadata" jsonb, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), "user_id" integer NOT NULL, CONSTRAINT "PK_973a81c0adb9b18a5ea3ef95bf8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "refresh_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "refresh_token" character varying(500) NOT NULL, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "user_id" integer NOT NULL, CONSTRAINT "UQ_068c1346f603dca1702fb893c01" UNIQUE ("refresh_token"), CONSTRAINT "CHK_dbc29b1f3ea49e7cf8809cacaa" CHECK ("expires_at" > "created_at"), CONSTRAINT "PK_7d8bee0204106019488c4c50ffa" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_ba3bd69c8ad1e799c0256e9e50" ON "refresh_tokens" ("expires_at") `);
        await queryRunner.query(`CREATE TABLE "reset_password_codes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code_hash" character varying(255) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT 'NOW()', "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "user_id" integer, CONSTRAINT "PK_73f29a51bd675d2dccdf1161655" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_8c45859a5d1f8c7f4ecea5ec76" ON "reset_password_codes" ("code_hash") `);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'member')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "name" character varying(25) NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'member', "email" character varying(255) NOT NULL, "password_hash" character varying(255) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), "family_id" integer, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."invitations_role_enum" AS ENUM('admin', 'member')`);
        await queryRunner.query(`CREATE TABLE "invitations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying(255) NOT NULL, "role" "public"."invitations_role_enum" NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "invited_by_id" integer, CONSTRAINT "CHK_539b0c58588fddd096783e1a87" CHECK ("expires_at" > "created_at"), CONSTRAINT "PK_5dec98cfdfd562e4ad3648bbb07" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_97ab59cb592c7cec109741b592" ON "invitations" ("email") `);
        await queryRunner.query(`ALTER TABLE "user_preferences" ADD CONSTRAINT "FK_458057fa75b66e68a275647da2e" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "families" ADD CONSTRAINT "FK_4d23afa6d34074476e54edbd4ea" FOREIGN KEY ("products_inventory_id") REFERENCES "products_inventories"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "meal_histories" ADD CONSTRAINT "FK_fb6b1b3928c46cc5f8cd5a7376f" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chat_messages" ADD CONSTRAINT "FK_0b7e57fe586503d477a8d5adaed" FOREIGN KEY ("thread_id") REFERENCES "chat_threads"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chat_threads" ADD CONSTRAINT "FK_093072e9060bf3b8fddd2fcd6e4" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD CONSTRAINT "FK_3ddc983c5f7bcf132fd8732c3f4" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reset_password_codes" ADD CONSTRAINT "FK_eecdf777f0c9bccf92739e8fec6" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_dcf95a539efe14635e1f80496a1" FOREIGN KEY ("family_id") REFERENCES "families"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invitations" ADD CONSTRAINT "FK_d4de0403dd012cf87b430af70ef" FOREIGN KEY ("invited_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invitations" DROP CONSTRAINT "FK_d4de0403dd012cf87b430af70ef"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_dcf95a539efe14635e1f80496a1"`);
        await queryRunner.query(`ALTER TABLE "reset_password_codes" DROP CONSTRAINT "FK_eecdf777f0c9bccf92739e8fec6"`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_3ddc983c5f7bcf132fd8732c3f4"`);
        await queryRunner.query(`ALTER TABLE "chat_threads" DROP CONSTRAINT "FK_093072e9060bf3b8fddd2fcd6e4"`);
        await queryRunner.query(`ALTER TABLE "chat_messages" DROP CONSTRAINT "FK_0b7e57fe586503d477a8d5adaed"`);
        await queryRunner.query(`ALTER TABLE "meal_histories" DROP CONSTRAINT "FK_fb6b1b3928c46cc5f8cd5a7376f"`);
        await queryRunner.query(`ALTER TABLE "families" DROP CONSTRAINT "FK_4d23afa6d34074476e54edbd4ea"`);
        await queryRunner.query(`ALTER TABLE "user_preferences" DROP CONSTRAINT "FK_458057fa75b66e68a275647da2e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_97ab59cb592c7cec109741b592"`);
        await queryRunner.query(`DROP TABLE "invitations"`);
        await queryRunner.query(`DROP TYPE "public"."invitations_role_enum"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8c45859a5d1f8c7f4ecea5ec76"`);
        await queryRunner.query(`DROP TABLE "reset_password_codes"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ba3bd69c8ad1e799c0256e9e50"`);
        await queryRunner.query(`DROP TABLE "refresh_tokens"`);
        await queryRunner.query(`DROP TABLE "chat_threads"`);
        await queryRunner.query(`DROP TYPE "public"."chat_threads_status_enum"`);
        await queryRunner.query(`DROP TABLE "chat_messages"`);
        await queryRunner.query(`DROP TYPE "public"."chat_messages_role_enum"`);
        await queryRunner.query(`DROP TABLE "meal_histories"`);
        await queryRunner.query(`DROP TABLE "families"`);
        await queryRunner.query(`DROP TABLE "products_inventories"`);
        await queryRunner.query(`DROP TABLE "user_preferences"`);
        await queryRunner.query(`DROP TYPE "public"."user_preferences_special_diet_enum"`);
    }

}
