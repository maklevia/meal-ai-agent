import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveFamilyInvitationAndAddToken1788775608640
  implements MigrationInterface
{
  name = "RemoveFamilyInvitationAndAddToken1788775608640";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "family_invitation" DROP CONSTRAINT "UQ_8a8a68fdb2bdb3679222c1a8da6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "family_invitation" DROP CONSTRAINT "FK_8a8a68fdb2bdb3679222c1a8da6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "family_invitation" DROP CONSTRAINT "FK_25c369ed52e5d24ca97d5fdbb92"`,
    );
    await queryRunner.query(`DROP TABLE "family_invitation"`);
    await queryRunner.query(`ALTER TABLE "families" ADD "invitation_token" uuid`);
    await queryRunner.query(
      `ALTER TABLE "families" ADD CONSTRAINT "UQ_families_invitation_token" UNIQUE ("invitation_token")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "families" DROP CONSTRAINT "UQ_families_invitation_token"`,
    );
    await queryRunner.query(`ALTER TABLE "families" DROP COLUMN "invitation_token"`);
    await queryRunner.query(
      `CREATE TABLE "family_invitation" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT 'NOW()', "family_id" integer, "invited_by_id" integer, CONSTRAINT "PK_4fb559e55d6f1fb8216caabb157" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "family_invitation" ADD CONSTRAINT "UQ_8a8a68fdb2bdb3679222c1a8da6" UNIQUE ("family_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "family_invitation" ADD CONSTRAINT "FK_8a8a68fdb2bdb3679222c1a8da6" FOREIGN KEY ("family_id") REFERENCES "families"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "family_invitation" ADD CONSTRAINT "FK_25c369ed52e5d24ca97d5fdbb92" FOREIGN KEY ("invited_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }
}
