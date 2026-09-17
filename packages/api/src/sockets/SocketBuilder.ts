import { Socket } from "socket.io";
import { AuthUseCase } from "src/core/useCases/AuthUseCase.base";
import { FamilyUseCase } from "src/core/useCases/FamilyUseCase.base";
import { UseCase } from "src/core/UseCase.base";
import { AuthenticationError, AuthErrorMessages } from "src/errors";
import { serializeAppError } from "src/sockets/error";
import { AppSocket, AppSocketServer, SocketAck } from "src/sockets/typedefs";
import { ZodType } from "zod";
import { User } from "src/modules/user/entities/User.entity";

export interface SocketContext {
  socket: AppSocket;
  user: User;
}

export interface SocketEventConfig<TPayload, TOptions, TResult> {
  event: string;
  auth?: boolean;
  family?: boolean;
  schema?: ZodType<TPayload>;
  useCase: () => UseCase<TOptions, TResult>;
  map: (payload: TPayload, ctx: SocketContext) => TOptions;
  onSuccess?: (
    result: TResult,
    payload: TPayload,
    ctx: SocketContext,
  ) => void | Promise<void>;
}

export function defineSocketEvent<TPayload, TOptions, TResult>(
  config: SocketEventConfig<TPayload, TOptions, TResult>,
): SocketEventConfig<TPayload, TOptions, TResult> {
  return config;
}

export function registerSocketEvents(
  io: AppSocketServer,
  events: SocketEventConfig<any, any, any>[],
): void {
  for (const config of events) {
    const probe = config.useCase();
    if (probe instanceof FamilyUseCase && !config.family) {
      throw new Error(
        `Socket event "${config.event}" uses a FamilyUseCase but does not set "family: true".`,
      );
    }
    if (probe instanceof AuthUseCase && config.auth === false) {
      throw new Error(
        `Socket event "${config.event}" uses an AuthUseCase but sets "auth: false".`,
      );
    }
  }

  io.on("connection", (socket) => {
    const untypedSocket = socket as unknown as Socket;

    for (const config of events) {
      untypedSocket.on(config.event, async (...args: unknown[]) => {
        const ack =
          typeof args[args.length - 1] === "function"
            ? (args.pop() as (response: SocketAck<unknown>) => void)
            : undefined;

        const rawPayload = args[0];

        console.log(rawPayload);

        try {
          if (config.auth !== false && !socket.data.user) {
            throw new AuthenticationError(AuthErrorMessages.NOT_AUTHENTICATED);
          }

          const payload = config.schema
            ? config.schema.parse(rawPayload)
            : rawPayload;

            console.log(payload);

          const useCase = config.useCase();
          if (useCase instanceof AuthUseCase) {
            useCase.setAuthUser(socket.data.user);
          }

          const ctx = { socket, user: socket.data.user };
          const result = await useCase.execute(config.map(payload, ctx));
          await config.onSuccess?.(result, payload, ctx);

          if (typeof ack === "function") {
            ack({ ok: true, data: result ?? null });
          }
        } catch (err) {
          if (typeof ack === "function") {
            ack({ ok: false, error: serializeAppError(err) });
          }
        }
      });
    }
  });
}
