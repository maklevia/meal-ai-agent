import { Request, Response, NextFunction } from "express";
import { ValidationError } from "src/errors/AppError";
import { z } from "zod";

interface ValidationSchemas {
  body?: z.ZodType;
  params?: z.ZodType;
  cookies?: z.ZodType;
  query?: z.ZodType;
}

export const validate =
  (schemas: ValidationSchemas) =>
  (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
      }
      if (schemas.cookies) {
        req.cookies = schemas.cookies.parse(req.cookies);
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query);
      }

      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        const details = err.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        }));
        next(new ValidationError("Invalid request", details));
        return;
      }
      next(err);
    }
  };
