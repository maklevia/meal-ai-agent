import { FamilyUseCase } from "src/core/FamilyUseCase.base";
import { Product } from "src/modules/product/entities/Product.entity";
import { ProductRepository } from "src/modules/product/repositories/Product.repository";

type GetNotFinishedProductsResult = {
  products: Product[];
} | null;

export class GetNotFinishedFamilyProducts extends FamilyUseCase<
  void,
  GetNotFinishedProductsResult
> {
  private readonly productRepository: ProductRepository =
    new ProductRepository();

  async executeFamily(): Promise<GetNotFinishedProductsResult> {
    const products = await this.productRepository.getNotFinishedFamilyProducts(
      this.user.family.id,
    );

    if (products.length === 0) {
      return null;
    }

    return { products };
  }
}
