import { BaseRepository } from "src/db/BaseRepository";
import { NotFoundError } from "src/errors/http/NotFoundError";
import { Family } from "src/modules/family/entities/Family.entity";
import { Product } from "src/modules/product/entities/Product.entity";
import { DeepPartial, EntityManager, IsNull } from "typeorm";

type AddProductsOptions = {
  products: DeepPartial<Product>[];
  familyId: number;
};

type MarkAsReadOptions = {
  productId: number;
  familyId: number;
  finishedAt: Date;
};

export class ProductRepository extends BaseRepository<Product> {
  constructor(manager?: EntityManager) {
    super(manager);
  }

  protected get entity() {
    return Product;
  }

  async getNotFinishedFamilyProducts(familyId: number): Promise<Product[]> {
    return this.repo.find({
      where: {
        family: {
          id: familyId,
        },
        finishedAt: IsNull(),
      },
      relations: { family: true },
    });
  }

  async addProductsToFamily(options: AddProductsOptions): Promise<Product[]> {
    const { products, familyId } = options;
    const productsToSave = products.map((product) => ({
      ...product,
      family: { id: familyId } as Family,
    }));

    return this.repo.save(productsToSave);
  }

  async markProductAsFinished(options: MarkAsReadOptions): Promise<void> {
    const { productId, familyId, finishedAt } = options;

    const result = await this.repo
      .createQueryBuilder()
      .update(Product)
      .set({ finishedAt, updatedAt: new Date() })
      .where("id = :productId AND familyId = :familyId", {
        productId,
        familyId,
      })
      .execute();

    if (!result.affected) {
      throw new NotFoundError("Product not found");
    }
  }
}

