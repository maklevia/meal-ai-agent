import { tool } from "ai";
import { ToolContext } from "src/modules/agent/typedefs";
import { ProductRepository } from "src/modules/product/repositories/Product.repository";
import z from "zod";

export function createGetUserProductsTool(ctx: ToolContext) {
    return tool({
        description: "Get the list of product the user currently has.",
        inputSchema: z.object({}),
        execute: async () => {
            if (!ctx.familyId) return {products: []};
            const productRepository = new ProductRepository();
            const products = await productRepository.getNotFinishedFamilyProducts(ctx.familyId);

            return {
                products: products.map((product) => ({
                    name: product.name,
                    quantity: product.details.quantity,
                    volume: product.details.volume,
                }))
            }
        }
    })
}
