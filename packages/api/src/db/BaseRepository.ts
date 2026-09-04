import { AppDataSource } from "src/db/data-source";
import {
  EntityManager,
  EntityTarget,
  ObjectLiteral,
  Repository,
} from "typeorm";

export abstract class BaseRepository<TEntity extends ObjectLiteral> {
  constructor(protected readonly manager?: EntityManager) {}

  protected abstract get entity(): EntityTarget<TEntity>;

  protected get repo(): Repository<TEntity> {
    if (this.manager) {
      return this.manager.getRepository(this.entity);
    }
    return AppDataSource.getRepository(this.entity);
  }
}
