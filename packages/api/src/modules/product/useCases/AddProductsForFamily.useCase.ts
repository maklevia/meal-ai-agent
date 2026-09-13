import { FamilyUseCase } from "src/core/AuthUseCase.base";
import { Product } from "src/modules/product/entities/Product.entity";
import { ProductRepository } from "src/modules/product/repositories/Product.repository";
import { DeepPartial } from "typeorm";

type AddProductsOptions = {
  products: DeepPartial<Product>[];
};

type AddProductsResult = void;

export class AddProductsForFamily extends FamilyUseCase<
  AddProductsOptions,
  AddProductsResult
> {
  private readonly productRepository: ProductRepository =
    new ProductRepository();

  async executeAuth(options: AddProductsOptions): Promise<AddProductsResult> {
    const { products } = options;

    await this.productRepository.addProductsToFamily({
      familyId: this.user.family.id,
      products,
    });
  }
}
