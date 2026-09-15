import { Router } from "express";
import { registerRoutes } from "src/core/RouteBuilder";
import { addProductsRoute } from "src/modules/product/routes/addProducts.route";
import { getProductsRoute } from "src/modules/product/routes/getProducts.route";
import { markProductFinishedRoute } from "src/modules/product/routes/markProductFinished.route";

const router = Router();

registerRoutes(router, [
  addProductsRoute,
  getProductsRoute,
  markProductFinishedRoute,
]);

export { router as productRouter };
