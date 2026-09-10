import { Router } from "express";
import { registerRoutes } from "src/core/RouteBuilder";
import * as familyEndpoints from "./endpoints";

export const familyRouter = Router();

registerRoutes(familyRouter, Object.values(familyEndpoints));
