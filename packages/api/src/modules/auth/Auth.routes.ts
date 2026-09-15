import { Router } from "express";
import { registerRoutes } from "src/core/RouteBuilder";
import * as authRoutes from "./routes";

export const authRouter = Router();

registerRoutes(authRouter, Object.values(authRoutes));