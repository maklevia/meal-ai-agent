import { FamilyUseCase } from "src/core/useCases/FamilyUseCase.base";
import { ProductRepository } from "src/modules/product/repositories/Product.repository";

type MarkProductOptions = {
  productId: number;
};

type MarkProductResult = void;

export class MarkProductsAsFinishedUseCase extends FamilyUseCase<
  MarkProductOptions,
  MarkProductResult
> {
  private readonly productRepository: ProductRepository =
    new ProductRepository();

  async executeFamily(options: MarkProductOptions): Promise<MarkProductResult> {
    const { productId } = options;

    await this.productRepository.markProductAsFinished({
      productId,
      familyId: this.user.family.id,
      finishedAt: new Date(),
    });
  }
}
