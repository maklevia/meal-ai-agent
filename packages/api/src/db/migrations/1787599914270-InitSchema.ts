import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1787599914270 implements MigrationInterface {
    name = 'InitSchema1787599914270'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."user_preferences_special_diet_enum" AS ENUM('vegan', 'vegetarian', 'pescatarian', 'halal', 'kosher', 'glutenFree', 'dairyFree', 'none')`);
        await queryRunner.query(`CREATE TABLE "user_preferences" ("id" SERIAL NOT NULL, "height" integer NOT NULL, "weight" integer NOT NULL, "age" integer NOT NULL, "kcal_per_day" integer NOT NULL, "special_diet" "public"."user_preferences_special_diet_enum" NOT NULL DEFAULT 'none', CONSTRAINT "CHK_kcal_positive" CHECK ("kcal_per_day" > 0), CONSTRAINT "CHK_weight_positive" CHECK ("weight" > 0), CONSTRAINT "CHK_height_range" CHECK ("height" > 0 AND "height" < 300), CONSTRAINT "CHK_age_range" CHECK ("age" > 14 AND "age" < 99), CONSTRAINT "PK_e8cfb5b31af61cd363a6b6d7c25" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "products_inventory" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "details" jsonb NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), "finished_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_834b52ac77bc55fc5d0eb014ae2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "family" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), "products_inventory_id" integer, CONSTRAINT "REL_03625ae8e9ba306aca987b23d3" UNIQUE ("products_inventory_id"), CONSTRAINT "PK_ba386a5a59c3de8593cda4e5626" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "meal_history" ("id" SERIAL NOT NULL, "score" smallint NOT NULL, "name" character varying(255) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), "user_id" integer, CONSTRAINT "CHK_score_range" CHECK ("score" >= 1 AND "score" <= 5), CONSTRAINT "PK_f2339a6f27b66b348d897da59a4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."chat_message_role_enum" AS ENUM('user', 'assistant', 'system')`);
        await queryRunner.query(`CREATE TABLE "chat_message" ("id" SERIAL NOT NULL, "role" "public"."chat_message_role_enum" NOT NULL, "content" text NOT NULL, "token_count" integer NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), "thread_id" integer, CONSTRAINT "CHK_token_count_positive" CHECK ("token_count" >= 0), CONSTRAINT "PK_3cc0d85193aade457d3077dd06b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."chat_thread_status_enum" AS ENUM('active', 'archived')`);
        await queryRunner.query(`CREATE TABLE "chat_thread" ("id" SERIAL NOT NULL, "title" character varying(255) NOT NULL, "status" "public"."chat_thread_status_enum" NOT NULL DEFAULT 'active', "metadata" jsonb, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), "user_id" integer, CONSTRAINT "PK_2a32fb7e7a1fd831651101fedc3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "name" character varying(25) NOT NULL, "email" character varying(255) NOT NULL, "password_hash" character varying(255) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), "user_preferences_id" integer, "family_id" integer, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "REL_4297bd2956479e6f8919092317" UNIQUE ("user_preferences_id"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "family" ADD CONSTRAINT "FK_03625ae8e9ba306aca987b23d30" FOREIGN KEY ("products_inventory_id") REFERENCES "products_inventory"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "meal_history" ADD CONSTRAINT "FK_0a3cd5cfcf35410114443a96012" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chat_message" ADD CONSTRAINT "FK_fe101e1c385ec7a4fe243782adf" FOREIGN KEY ("thread_id") REFERENCES "chat_thread"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chat_thread" ADD CONSTRAINT "FK_726481ffcef9bfa305f31d5ef6f" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_4297bd2956479e6f89190923170" FOREIGN KEY ("user_preferences_id") REFERENCES "user_preferences"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_899d5e902915e5c1ad1201b0099" FOREIGN KEY ("family_id") REFERENCES "family"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_899d5e902915e5c1ad1201b0099"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_4297bd2956479e6f89190923170"`);
        await queryRunner.query(`ALTER TABLE "chat_thread" DROP CONSTRAINT "FK_726481ffcef9bfa305f31d5ef6f"`);
        await queryRunner.query(`ALTER TABLE "chat_message" DROP CONSTRAINT "FK_fe101e1c385ec7a4fe243782adf"`);
        await queryRunner.query(`ALTER TABLE "meal_history" DROP CONSTRAINT "FK_0a3cd5cfcf35410114443a96012"`);
        await queryRunner.query(`ALTER TABLE "family" DROP CONSTRAINT "FK_03625ae8e9ba306aca987b23d30"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "chat_thread"`);
        await queryRunner.query(`DROP TYPE "public"."chat_thread_status_enum"`);
        await queryRunner.query(`DROP TABLE "chat_message"`);
        await queryRunner.query(`DROP TYPE "public"."chat_message_role_enum"`);
        await queryRunner.query(`DROP TABLE "meal_history"`);
        await queryRunner.query(`DROP TABLE "family"`);
        await queryRunner.query(`DROP TABLE "products_inventory"`);
        await queryRunner.query(`DROP TABLE "user_preferences"`);
        await queryRunner.query(`DROP TYPE "public"."user_preferences_special_diet_enum"`);
    }

}
