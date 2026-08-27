import { Request, Response, NextFunction } from "express"
import { AppError } from "src/errors/AppError"

export const errorMiddleware = (err: unknown, r_eq: Request, res: Response, _next: NextFunction) => {
    if (err instanceof AppError) {
        res.status(err.statusCode).json({error: err.message});
        return;
    }

    console.log("API: Uncaught error: ", err);
    res.status(500).json({error: "Internal server error"});
}
