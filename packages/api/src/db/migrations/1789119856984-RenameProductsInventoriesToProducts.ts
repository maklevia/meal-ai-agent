import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameProductsInventoriesToProducts1789119856984 implements MigrationInterface {
    name = 'RenameProductsInventoriesToProducts1789119856984'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "families" DROP CONSTRAINT "FK_4d23afa6d34074476e54edbd4ea"`);
        await queryRunner.query(`ALTER TABLE "products_inventories" RENAME TO "products"`);
        await queryRunner.query(`ALTER TABLE "products" RENAME CONSTRAINT "PK_7919a9d14d3e307268c953a41e6" TO "PK_products"`);
        await queryRunner.query(`ALTER TABLE "families" RENAME COLUMN "products_inventory_id" TO "product_id"`);
        await queryRunner.query(`ALTER TABLE "families" RENAME CONSTRAINT "REL_4d23afa6d34074476e54edbd4e" TO "REL_families_product_id"`);
        await queryRunner.query(`ALTER TABLE "families" ADD CONSTRAINT "FK_families_product_id" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "families" DROP CONSTRAINT "FK_families_product_id"`);
        await queryRunner.query(`ALTER TABLE "families" RENAME CONSTRAINT "REL_families_product_id" TO "REL_4d23afa6d34074476e54edbd4e"`);
        await queryRunner.query(`ALTER TABLE "families" RENAME COLUMN "product_id" TO "products_inventory_id"`);
        await queryRunner.query(`ALTER TABLE "products" RENAME CONSTRAINT "PK_products" TO "PK_7919a9d14d3e307268c953a41e6"`);
        await queryRunner.query(`ALTER TABLE "products" RENAME TO "products_inventories"`);
        await queryRunner.query(`ALTER TABLE "families" ADD CONSTRAINT "FK_4d23afa6d34074476e54edbd4ea" FOREIGN KEY ("products_inventory_id") REFERENCES "products_inventories"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }
}
