import { Router } from "express";
import { registerRoutes } from "src/core/RouteBuilder";
import * as chatRoutes from "./routes";

export const chatRouter = Router();

registerRoutes(chatRouter, Object.values(chatRoutes));
