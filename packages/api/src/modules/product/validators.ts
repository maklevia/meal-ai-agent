import { z } from "zod";

export const addProductsBodySchema = z.object({
  products: z.array(
    z.object({
      name: z.string(),
      details: z.object({
        volume: z.number().optional(),
        quantity: z.number().optional(),
      }).optional(),
    })
  ),
});

export const markProductParamsSchema = z.object({
  productId: z.string().transform(Number),
});
