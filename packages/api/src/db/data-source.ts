import 'reflect-metadata';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { env } from 'src/config/env.js';
import { User } from 'src/modules/user/entities/User.entity.js';
import { UserPreferences } from 'src/modules/userPreferences/entities/UserPreferences.entity.js';
import { Family } from 'src/modules/family/entities/Family.entity.js';
import { MealHistory } from 'src/modules/mealHistory/entities/MealHistory.entity.js';
import { ProductsInventory } from 'src/modules/productsInventory/entities/ProductsInventory.entity.js';
import { ChatThread } from 'src/modules/chatThread/entities/ChatThread.entity.js';
import { ChatMessage } from 'src/modules/chatMessage/entities/ChatMessage.entity.js';
import { RefreshToken } from 'src/modules/auth/entities/RefreshToken.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: env.DB_HOST,
  port: env.DB_PORT,
  username: env.DB_USERNAME,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  synchronize: env.DB_SYNCHRONIZE,
  logging: env.DB_LOGGING,
  namingStrategy: new SnakeNamingStrategy(),
  entities: [User, UserPreferences, Family, MealHistory, ProductsInventory, ChatThread, ChatMessage, RefreshToken],
  migrations: [
    path.join(fileURLToPath(new URL('./migrations', import.meta.url)), '*{.ts,.js}'),
  ],
});
