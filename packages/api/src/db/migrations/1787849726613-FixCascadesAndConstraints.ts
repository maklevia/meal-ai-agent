import { MigrationInterface, QueryRunner } from "typeorm";

export class FixCascadesAndConstraints1787849726613 implements MigrationInterface {
    name = 'FixCascadesAndConstraints1787849726613'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "family" DROP CONSTRAINT "FK_03625ae8e9ba306aca987b23d30"`);
        await queryRunner.query(`ALTER TABLE "meal_history" DROP CONSTRAINT "FK_0a3cd5cfcf35410114443a96012"`);
        await queryRunner.query(`ALTER TABLE "chat_message" DROP CONSTRAINT "FK_fe101e1c385ec7a4fe243782adf"`);
        await queryRunner.query(`ALTER TABLE "chat_thread" DROP CONSTRAINT "FK_726481ffcef9bfa305f31d5ef6f"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_4297bd2956479e6f89190923170"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_899d5e902915e5c1ad1201b0099"`);
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "user_preferences_id" TO "role"`);
        await queryRunner.query(`CREATE TABLE "refresh_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "refresh_token" character varying(500) NOT NULL, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "user_id" integer NOT NULL, CONSTRAINT "UQ_068c1346f603dca1702fb893c01" UNIQUE ("refresh_token"), CONSTRAINT "CHK_dbc29b1f3ea49e7cf8809cacaa" CHECK ("expires_at" > "created_at"), CONSTRAINT "PK_7d8bee0204106019488c4c50ffa" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_ba3bd69c8ad1e799c0256e9e50" ON "refresh_tokens" ("expires_at") `);
        await queryRunner.query(`CREATE TYPE "public"."invitations_role_enum" AS ENUM('admin', 'member')`);
        await queryRunner.query(`CREATE TABLE "invitations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying(255) NOT NULL, "role" "public"."invitations_role_enum" NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "invited_by_id" integer, CONSTRAINT "CHK_539b0c58588fddd096783e1a87" CHECK ("expires_at" > "created_at"), CONSTRAINT "PK_5dec98cfdfd562e4ad3648bbb07" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_97ab59cb592c7cec109741b592" ON "invitations" ("email") `);
        await queryRunner.query(`ALTER TABLE "user_preferences" ADD "user_id" integer`);
        await queryRunner.query(`ALTER TABLE "user_preferences" ADD CONSTRAINT "UQ_458057fa75b66e68a275647da2e" UNIQUE ("user_id")`);
        await queryRunner.query(`ALTER TABLE "meal_history" ALTER COLUMN "user_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "chat_message" ALTER COLUMN "thread_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "chat_thread" ALTER COLUMN "user_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "role"`);
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('admin', 'member')`);
        await queryRunner.query(`ALTER TABLE "user" ADD "role" "public"."user_role_enum" NOT NULL DEFAULT 'member'`);
        await queryRunner.query(`ALTER TABLE "user_preferences" ADD CONSTRAINT "FK_458057fa75b66e68a275647da2e" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "family" ADD CONSTRAINT "FK_03625ae8e9ba306aca987b23d30" FOREIGN KEY ("products_inventory_id") REFERENCES "products_inventory"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "meal_history" ADD CONSTRAINT "FK_0a3cd5cfcf35410114443a96012" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chat_message" ADD CONSTRAINT "FK_fe101e1c385ec7a4fe243782adf" FOREIGN KEY ("thread_id") REFERENCES "chat_thread"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chat_thread" ADD CONSTRAINT "FK_726481ffcef9bfa305f31d5ef6f" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD CONSTRAINT "FK_3ddc983c5f7bcf132fd8732c3f4" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_899d5e902915e5c1ad1201b0099" FOREIGN KEY ("family_id") REFERENCES "family"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invitations" ADD CONSTRAINT "FK_d4de0403dd012cf87b430af70ef" FOREIGN KEY ("invited_by_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invitations" DROP CONSTRAINT "FK_d4de0403dd012cf87b430af70ef"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_899d5e902915e5c1ad1201b0099"`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_3ddc983c5f7bcf132fd8732c3f4"`);
        await queryRunner.query(`ALTER TABLE "chat_thread" DROP CONSTRAINT "FK_726481ffcef9bfa305f31d5ef6f"`);
        await queryRunner.query(`ALTER TABLE "chat_message" DROP CONSTRAINT "FK_fe101e1c385ec7a4fe243782adf"`);
        await queryRunner.query(`ALTER TABLE "meal_history" DROP CONSTRAINT "FK_0a3cd5cfcf35410114443a96012"`);
        await queryRunner.query(`ALTER TABLE "family" DROP CONSTRAINT "FK_03625ae8e9ba306aca987b23d30"`);
        await queryRunner.query(`ALTER TABLE "user_preferences" DROP CONSTRAINT "FK_458057fa75b66e68a275647da2e"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "role"`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "role" integer`);
        await queryRunner.query(`ALTER TABLE "chat_thread" ALTER COLUMN "user_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "chat_message" ALTER COLUMN "thread_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "meal_history" ALTER COLUMN "user_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_preferences" DROP CONSTRAINT "UQ_458057fa75b66e68a275647da2e"`);
        await queryRunner.query(`ALTER TABLE "user_preferences" DROP COLUMN "user_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_97ab59cb592c7cec109741b592"`);
        await queryRunner.query(`DROP TABLE "invitations"`);
        await queryRunner.query(`DROP TYPE "public"."invitations_role_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ba3bd69c8ad1e799c0256e9e50"`);
        await queryRunner.query(`DROP TABLE "refresh_tokens"`);
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "role" TO "user_preferences_id"`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_899d5e902915e5c1ad1201b0099" FOREIGN KEY ("family_id") REFERENCES "family"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_4297bd2956479e6f89190923170" FOREIGN KEY ("user_preferences_id") REFERENCES "user_preferences"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chat_thread" ADD CONSTRAINT "FK_726481ffcef9bfa305f31d5ef6f" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chat_message" ADD CONSTRAINT "FK_fe101e1c385ec7a4fe243782adf" FOREIGN KEY ("thread_id") REFERENCES "chat_thread"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "meal_history" ADD CONSTRAINT "FK_0a3cd5cfcf35410114443a96012" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "family" ADD CONSTRAINT "FK_03625ae8e9ba306aca987b23d30" FOREIGN KEY ("products_inventory_id") REFERENCES "products_inventory"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
