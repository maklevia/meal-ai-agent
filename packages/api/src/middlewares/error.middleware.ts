import { Request, Response, NextFunction } from "express";
import { AppError, ValidationError } from "src/errors/AppError";

export const errorMiddleware = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof AppError) {
    const body: Record<string, unknown> = { error: err.message };

    if (err instanceof ValidationError && err.details) {
      body.details = err.details;
    }

    res.status(err.statusCode).json(body);
    return;
  }

  console.error("API: Uncaught error: ", err);
  res.status(500).json({ error: "Internal server error" });
};