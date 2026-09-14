import { MigrationInterface, QueryRunner } from "typeorm";

export class FamilyProductsOneToMany1789135816153 implements MigrationInterface {
    name = 'FamilyProductsOneToMany1789135816153'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" ADD "family_id" integer`);
        await queryRunner.query(`UPDATE "products" SET "family_id" = "families"."id" FROM "families" WHERE "families"."product_id" = "products"."id"`);
        await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "family_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_products_family_id" FOREIGN KEY ("family_id") REFERENCES "families"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "families" DROP CONSTRAINT "FK_families_product_id"`);
        await queryRunner.query(`ALTER TABLE "families" DROP CONSTRAINT "REL_families_product_id"`);
        await queryRunner.query(`ALTER TABLE "families" DROP COLUMN "product_id"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "families" ADD "product_id" integer`);
        await queryRunner.query(`UPDATE "families" SET "product_id" = "sub"."id" FROM (SELECT DISTINCT ON ("family_id") "id", "family_id" FROM "products" ORDER BY "family_id", "id") AS "sub" WHERE "sub"."family_id" = "families"."id"`);
        await queryRunner.query(`ALTER TABLE "families" ADD CONSTRAINT "REL_families_product_id" UNIQUE ("product_id")`);
        await queryRunner.query(`ALTER TABLE "families" ADD CONSTRAINT "FK_families_product_id" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_products_family_id"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "family_id"`);
    }
}
