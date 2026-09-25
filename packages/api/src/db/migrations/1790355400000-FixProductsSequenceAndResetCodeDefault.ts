import { MigrationInterface, QueryRunner } from "typeorm";

export class FixProductsSequenceAndResetCodeDefault1790355400000
  implements MigrationInterface
{
  name = "FixProductsSequenceAndResetCodeDefault1790355400000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER SEQUENCE "products_inventories_id_seq" RENAME TO "products_id_seq"`,
    );
    await queryRunner.query(
      `ALTER TABLE "password_reset_codes" ALTER COLUMN "created_at" SET DEFAULT NOW()`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "password_reset_codes" ALTER COLUMN "created_at" SET DEFAULT '2026-09-07 09:55:29.772143+00'`,
    );
    await queryRunner.query(
      `ALTER SEQUENCE "products_id_seq" RENAME TO "products_inventories_id_seq"`,
    );
  }
}
