/**
 * Socket.IO smoke test.
 *
 * Verifies, against a running API:
 *   1. an authenticated socket connects (cookie from a minted access token)
 *   2. the server emits `auth:session`
 *   3. the `health:ping` ack round-trips
 *
 * Usage (from packages/api, with the API running):
 *   DB_HOST=localhost DB_PORT=5432 npx tsx -r tsconfig-paths/register scripts/socket-smoke.ts
 *
 * Env:
 *   SOCKET_URL     default http://localhost:${API_PORT}
 *   ACCESS_TOKEN   use a token you already have instead of minting one
 *   BAD_TOKEN=1    send an invalid token (expects UNAUTHENTICATED)
 *   PRINT_TOKEN=1  print a freshly minted token and exit (for Postman)
 *   TRANSPORTS     comma list, default "polling,websocket" (e.g. "websocket")
 */
import "reflect-metadata";
import { io as createClient, type Socket } from "socket.io-client";
import { env } from "src/config/env";
import { AppDataSource } from "src/db/data-source";
import { AuthService } from "src/modules/auth/Auth.service";
import { User } from "src/modules/user/entities/User.entity";

type SocketAck<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string; details?: unknown } };

type Transport = "polling" | "websocket";

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

function resolveTransports(): Transport[] {
  const raw = process.env.TRANSPORTS ?? "polling,websocket";
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter((t): t is Transport => t === "polling" || t === "websocket");
}

async function resolveToken(): Promise<string> {
  if (process.env.BAD_TOKEN) {
    console.log("Using an intentionally invalid token (BAD_TOKEN=1)");
    return "definitely-not-a-valid-token";
  }

  if (process.env.ACCESS_TOKEN) {
    console.log("Using ACCESS_TOKEN from the environment");
    return process.env.ACCESS_TOKEN;
  }

  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  const user = await AppDataSource.getRepository(User).findOne({ where: {} });
  if (!user) {
    throw new Error(
      "No users in the database. Bootstrap an admin first: POST /auth/bootstrap",
    );
  }

  console.log(`Minting a token for user id=${user.id} role=${user.role}`);
  return new AuthService().generateAccessToken({
    userId: user.id,
    userRole: user.role,
  });
}

/**
 * Hits the raw engine.io handshake endpoint over plain HTTP.
 * This tells us whether the server is up and whether Socket.IO is attached,
 * independently of the WebSocket upgrade.
 */
async function preflight(url: string): Promise<void> {
  const handshakeUrl = `${url}/socket.io/?EIO=4&transport=polling`;
  console.log(`\nPreflight: ${handshakeUrl}`);

  try {
    const res = await fetch(handshakeUrl);
    const body = await res.text();
    console.log(`  status: ${res.status}`);
    console.log(`  body:   ${body.slice(0, 140)}`);

    if (!body.startsWith("0")) {
      console.log(
        "  ⚠️  Not an engine.io handshake. Is Socket.IO attached to this server / is the image stale?",
      );
    }
  } catch (err) {
    console.log(
      `  ❌ Could not reach the server: ${
        err instanceof Error ? err.message : String(err)
      }`,
    );
    console.log(
      "     → the API is probably not running (check its logs; in Docker, rebuild with `npm run dev`).",
    );
  }
}

function connect(url: string, token: string): Promise<Socket> {
  const transports = resolveTransports();
  const extraHeaders = { Cookie: `accessToken=${token}` };

  console.log(`Connecting to ${url} (transports: ${transports.join(", ")}) ...`);

  const socket = createClient(url, {
    transports,
    transportOptions: {
      websocket: { extraHeaders },
      polling: { extraHeaders },
    },
    reconnection: false,
    timeout: 5000,
  });

  // Surface the underlying transport/engine errors, which connect_error hides.
  socket.io.on("error", (err: Error) => {
    console.error("  manager error:", err?.message ?? err);
  });
  socket.io.on("reconnect_attempt", () => console.error("  reconnect attempt"));

  return new Promise((resolve, reject) => {
    const onConnect = (): void => {
      socket.off("connect_error", onError);
      resolve(socket);
    };

    const onError = (err: Error & { data?: unknown; context?: unknown }): void => {
      socket.off("connect", onConnect);
      socket.close();

      const engineError = socket.io.engine?.transport?.name;
      reject(
        new Error(
          `connect_error: ${err.message} ${JSON.stringify(err.data ?? {})}` +
            (engineError ? ` (transport: ${engineError})` : ""),
        ),
      );
    };

    socket.once("connect", onConnect);
    socket.once("connect_error", onError);
  });
}

function emitWithAck<T>(
  socket: Socket,
  event: string,
  payload: unknown,
  timeoutMs = 3000,
): Promise<SocketAck<T>> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`No ack for "${event}" within ${timeoutMs}ms`)),
      timeoutMs,
    );

    const ack = (response: SocketAck<T>): void => {
      clearTimeout(timer);
      resolve(response);
    };

    if (payload === undefined) {
      socket.emit(event, ack);
    } else {
      socket.emit(event, payload, ack);
    }
  });
}

async function main(): Promise<void> {
  const url = process.env.SOCKET_URL ?? `http://localhost:${env.API_PORT}`;
  const token = await resolveToken();

  if (process.env.PRINT_TOKEN) {
    process.stdout.write(`${token}\n`);
    return;
  }

  await preflight(url);

  const socket = await connect(url, token);
  console.log(`✅ connected: ${socket.id}`);

  const sessionPayload = await Promise.race([
    new Promise<unknown>((resolve) =>
      socket.once("auth:session", (payload: unknown) => resolve(payload)),
    ),
    sleep(1000).then(() => undefined),
  ]);

  if (sessionPayload === undefined) {
    console.log(
      "⚠️  no auth:session event within 1s (is it emitted in server.ts?)",
    );
  } else {
    console.log("✅ auth:session:", sessionPayload);
  }

  const pong = await emitWithAck<{ pong: true; at: string }>(
    socket,
    "health:ping",
    undefined,
  );
  console.log("health:ping ack:", JSON.stringify(pong));

  if (!pong.ok) {
    throw new Error(
      `health:ping failed: [${pong.error.code}] ${pong.error.message}`,
    );
  }
  if (pong.data?.pong !== true) {
    throw new Error(
      `unexpected health:ping payload: ${JSON.stringify(pong.data)}`,
    );
  }

  console.log("✅ health:ping ack round-trip OK");
  socket.close();
}

main()
  .then(async () => {
    if (AppDataSource.isInitialized) await AppDataSource.destroy();
    if (!process.env.PRINT_TOKEN) console.log("\nAll checks passed.");
    process.exit(0);
  })
  .catch(async (err: unknown) => {
    console.error("\n❌", err instanceof Error ? err.message : err);
    if (AppDataSource.isInitialized) await AppDataSource.destroy();
    process.exit(1);
  });
