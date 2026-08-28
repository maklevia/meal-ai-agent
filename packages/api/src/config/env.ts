import * as dotenv from "dotenv";
import { z } from "zod";

dotenv.config({ path: new URL("../../../../.env", import.meta.url).pathname });
dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),

  DB_HOST: z.string().default("localhost"),
  DB_PORT: z.coerce.number().default(5432),
  DB_USERNAME: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),

  DB_SYNCHRONIZE: z
    .string()
    .default("false")
    .transform((v) => v === "true"),
  DB_LOGGING: z
    .string()
    .default("false")
    .transform((v) => v === "true"),

  WEB_ORIGIN: z.string().default("http://localhost:5173"),

  ACCESS_SECRET: z.string(),
  REFRESH_SECRET: z.string(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "❌ Invalid environment variables:",
    parsed.error.flatten().fieldErrors,
  );
  process.exit(1);
}

export const env = parsed.data;
