import { Router } from "express";
import { registerRoutes } from "src/core/RouteBuilder";
import * as familyRoutes from "./routes";

export const familyRouter = Router();

registerRoutes(familyRouter, Object.values(familyRoutes));
