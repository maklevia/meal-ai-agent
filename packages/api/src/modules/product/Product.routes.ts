import { Router } from "express";
import { registerRoutes } from "src/core/RouteBuilder";
import { addProductsRoute } from "src/modules/product/endpoints/addProducts.endpoint";
import { getProductsRoute } from "src/modules/product/endpoints/getProducts.endpoint";
import { markProductFinishedRoute } from "src/modules/product/endpoints/markProductFinished.endpoint";

const router = Router();

registerRoutes(router, [
  addProductsRoute,
  getProductsRoute,
  markProductFinishedRoute,
]);

export { router as productRouter };
