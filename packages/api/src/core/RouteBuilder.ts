import { Router, Request, Response } from "express";
import { UseCase } from "src/core/UseCase.base";
import z from "zod";

type UseCaseFactory<TOptions, TResult> = () => UseCase<TOptions, TResult>;
type RequestMapper<TOptions> = (req: Request) => TOptions;
type ResponseMapper<TResult> = (result: TResult, res: Response) => void;

function defaultResponseMapper<TResult>(result: TResult, res: Response): void {
    if (result === undefined || result === null) {
        res.status(204).send();
        return;
    }

    res.status(200).json(result);
}

interface RouteConfig<TOptions, TResult> {
    method: "get" | "post" | "put" | "patch" | "delete";
    path: string;
    auth?: boolean;
    middlewares?: void;
    validators?: {
        body?: z.ZodSchema;
        params?: z.ZodSchema;
        query?: z.ZodSchema;
        cookies?: z.ZodSchema;
    }

    useCase: UseCaseFactory<TOptions, TResult>;
    map: RequestMapper<TOptions>;
    respond?: ResponseMapper<TResult>;
}
