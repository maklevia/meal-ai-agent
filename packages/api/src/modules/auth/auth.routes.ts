import { Router } from "express";
import { registerRoutes } from "src/core/RouteBuilder";
import * as authEndpoints from "./endpoints";

export const authRouter = Router();

registerRoutes(authRouter, Object.values(authEndpoints));
