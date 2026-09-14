import { Router, Request, Response, RequestHandler } from "express";
import { AuthUseCase } from "src/core/AuthUseCase.base";
import { FamilyUseCase } from "src/core/FamilyUseCase.base";
import { UseCase } from "src/core/UseCase.base";
import { authMiddleware } from "src/middlewares/auth.middleware";
import { requireFamily } from "src/middlewares/requireFamily.middleware";
import { requireFamilyOwner } from "src/middlewares/requireFamilyOwner.middleware";
import { validate } from "src/middlewares/validate.middleware";
import z from "zod";

type UseCaseFactory<TOptions, TResult> = () => UseCase<TOptions, TResult>;
type ResponseMapper<TResult> = (result: TResult, res: Response) => void;

function defaultResponseMapper<TResult>(result: TResult, res: Response): void {
  if (result === undefined || result === null) {
    res.status(204).send();
    return;
  }
  res.status(200).json(result);
}

/**
 * Routes declare their requirements:
 * - `AuthUseCase`   -> `auth: true`   -> `authMiddleware` sets `req.user`
 * - `FamilyUseCase` -> `family: true` -> `requireFamily` guarantees a family
 */
type RouteRequirements<TUseCase> = TUseCase extends FamilyUseCase<any, any>
  ? { auth: true; family: true }
  : TUseCase extends AuthUseCase<any, any>
    ? { auth: true }
    : { auth?: boolean; family?: boolean };

export interface RouteConfig {
  method: "get" | "post" | "put" | "patch" | "delete";
  path: string;
  auth?: boolean;
  family?: boolean;
  owner?: boolean;
  middlewares?: RequestHandler[];
  validators?: {
    body?: z.ZodTypeAny;
    params?: z.ZodTypeAny;
    query?: z.ZodTypeAny;
    cookies?: z.ZodTypeAny;
  };
  useCase: () => UseCase<unknown, unknown>;
  map?: (req: any) => unknown;
  respond?: (result: any, res: Response) => void;
}

export interface RouteDefinition<
  TOptions,
  TResult,
  TParams = unknown,
  TBody = unknown,
  TQuery = unknown,
  TCookies = unknown,
  TUseCase extends UseCase<TOptions, TResult> = UseCase<TOptions, TResult>,
> extends RouteConfig {
  validators?: {
    body?: z.ZodType<TBody, z.ZodTypeDef, unknown>;
    params?: z.ZodType<TParams, z.ZodTypeDef, unknown>;
    query?: z.ZodType<TQuery, z.ZodTypeDef, unknown>;
    cookies?: z.ZodType<TCookies, z.ZodTypeDef, unknown>;
  };
  useCase: () => TUseCase;
  map?: (
    req: Request<TParams, unknown, TBody, TQuery> & { cookies: TCookies },
  ) => TOptions;
  respond?: ResponseMapper<TResult>;
}

export function defineRoute<
  TOptions,
  TResult,
  TParams = unknown,
  TBody = unknown,
  TQuery = unknown,
  TCookies = unknown,
  TUseCase extends UseCase<TOptions, TResult> = UseCase<TOptions, TResult>,
>(
  config: Omit<
    RouteDefinition<TOptions, TResult, TParams, TBody, TQuery, TCookies>,
    "useCase"
  > & {
    useCase: UseCaseFactory<TOptions, TResult> & (() => TUseCase);
  } & RouteRequirements<TUseCase>,
): RouteDefinition<TOptions, TResult, TParams, TBody, TQuery, TCookies> {
  return config;
}

export function registerRoutes(router: Router, routes: RouteConfig[]): void {
  for (const config of routes) {
    const handlers: RequestHandler[] = [];
    const requiresFamily = Boolean(config.family || config.owner);

    const useCaseForGuard = config.useCase();
    if (useCaseForGuard instanceof FamilyUseCase && !config.family) {
      throw new Error(
        `Route "${config.method.toUpperCase()} ${config.path}" uses a FamilyUseCase but does not set "family: true".`,
      );
    }
    if (useCaseForGuard instanceof AuthUseCase && !config.auth) {
      throw new Error(
        `Route "${config.method.toUpperCase()} ${config.path}" uses an AuthUseCase but does not set "auth: true".`,
      );
    }

    if (config.auth) handlers.push(authMiddleware);
    if (requiresFamily) handlers.push(requireFamily);
    if (config.owner) handlers.push(requireFamilyOwner);
    if (config.middlewares) handlers.push(...config.middlewares);
    if (config.validators) handlers.push(validate(config.validators));

    const handler: RequestHandler = async (req, res, next) => {
      try {
        const useCase = config.useCase();

        if (useCase instanceof AuthUseCase) {
          useCase.setAuthUser(req.user);
        }

        const options = config.map?.(req);
        const result = await useCase.execute(options);

        const respond = config.respond ?? defaultResponseMapper;
        respond(result, res);
      } catch (err) {
        next(err);
      }
    };

    handlers.push(handler);
    router[config.method](config.path, ...handlers);
  }
}
