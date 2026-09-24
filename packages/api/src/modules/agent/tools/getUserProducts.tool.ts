import { tool } from "ai";
import { ToolContext, ToolDependencies } from "src/modules/agent/typedefs";
import z from "zod";

export function createGetUserProductsTool(ctx: ToolContext, dependencies: ToolDependencies) {
    return tool({
        description: "Get the list of products the user currently has.",
        inputSchema: z.object({}),
        execute: async () => {
            if (!ctx.familyId) return {products: []};
            const products = await dependencies.products.getNotFinishedFamilyProducts(ctx.familyId);

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
