import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { env } from '../config/env.js';
import { User } from '../modules/user/User.entity.js';
import { UserPreferences } from '../modules/userPreferences/UserPreferences.entity.js';
import { Family } from '../modules/family/Family.entity.js';
import { MealHistory } from '../modules/mealHistory/MealHistory.entity.js';
import { ProductsInventory } from '../modules/productsInventory/ProductsInventory.entity.js';

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
  entities: [User, UserPreferences, Family, MealHistory, ProductsInventory],
  migrations: [new URL('./migrations/*{.ts,.js}', import.meta.url).pathname],
});
