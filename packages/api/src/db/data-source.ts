import "reflect-metadata";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DataSource } from "typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import { env } from "src/config/env";
import { User } from "src/modules/user/entities/User.entity";
import { UserPreferences } from "src/modules/userPreferences/entities/UserPreferences.entity";
import { Family } from "src/modules/family/entities/Family.entity";
import { MealHistory } from "src/modules/mealHistory/entities/MealHistory.entity";
import { ProductsInventory } from "src/modules/productsInventory/entities/ProductsInventory.entity";
import { ChatThread } from "src/modules/chatThread/entities/ChatThread.entity";
import { ChatMessage } from "src/modules/chatMessage/entities/ChatMessage.entity";
import { RefreshToken } from "src/modules/auth/entities/RefreshToken.entity";
import { RegistrationInvitation } from "src/modules/auth/entities/RegistrationInvitation.entity";
import { PasswordResetCode } from "src/modules/auth/entities/PasswordResetCode.entity";
import { FamilyInvitation } from "src/modules/family/entities/FamilyInvitation.entity";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: env.DB_HOST,
  port: env.DB_PORT,
  username: env.DB_USERNAME,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  synchronize: env.DB_SYNCHRONIZE,
  logging: env.DB_LOGGING,
  namingStrategy: new SnakeNamingStrategy(),
  entities: [
    User,
    UserPreferences,
    Family,
    MealHistory,
    ProductsInventory,
    ChatThread,
    ChatMessage,
    RefreshToken,
    RegistrationInvitation,
    PasswordResetCode,
    FamilyInvitation,
  ],
  migrations: [
    path.join(
      fileURLToPath(new URL("./migrations", import.meta.url)),
      "*{.ts,.js}",
    ),
  ],
});
