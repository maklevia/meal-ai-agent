import { EntityManager, EntityTarget, ObjectLiteral, Repository } from "typeorm";

export type TransactionalRepository<T> = new (manager: EntityManager) => T;

export class TxContext {
  constructor(private readonly em: EntityManager) {}

  get manager(): EntityManager {
    return this.em;
  }

  get<T>(Repo: TransactionalRepository<T>): T {
    return new Repo(this.em);
  }

  repo<E extends ObjectLiteral>(target: EntityTarget<E>): Repository<E> {
    return this.em.getRepository(target);
  }
}
