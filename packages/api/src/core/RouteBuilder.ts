import { Router, Request, Response, RequestHandler } from "express";
import { AuthUseCase } from "src/core/AuthUseCase.base";
import { UseCase } from "src/core/UseCase.base";
import { authMiddleware } from "src/middlewares/auth.middleware";
import { validate } from "src/middlewares/validate.middleware";
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
  middlewares?: RequestHandler[];
  validators?: {
    body?: z.ZodSchema;
    params?: z.ZodSchema;
    query?: z.ZodSchema;
    cookies?: z.ZodSchema;
  };

  useCase: UseCaseFactory<TOptions, TResult>;
  map: RequestMapper<TOptions>;
  respond?: ResponseMapper<TResult>;
}

export function registerRoute<TOptions, TResult>(
  router: Router,
  config: RouteConfig<TOptions, TResult>,
): void {
    const handlers: RequestHandler[] = [];

    if (config.auth) handlers.push(authMiddleware);
    if (config.middlewares) handlers.push(...config.middlewares);
    if (config.validators) handlers.push(validate(config.validators));

    const handler: RequestHandler = async (req, res, next) => {
        try {
            const useCase = config.useCase();

            if (config.auth && useCase instanceof AuthUseCase) {
                useCase.setAuthUser(req.user);
            }

            const options = config.map(req);
            const result = await useCase.execute(options);

            const respond = config.respond ?? defaultResponseMapper;
            respond(result, res);
        } catch (err) {
            next(err);
        }
    }

    handlers.push(handler);
    router[config.method](config.path, ...handlers);
}
