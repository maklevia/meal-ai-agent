import { IUnitOfWork } from "src/core/IUnitOfWork";
import { TxContext } from "src/core/TxContext";
import { AppDataSource } from "src/db/data-source";

export class UnitOfWork implements IUnitOfWork {
  run<T>(work: (tx: TxContext) => Promise<T>): Promise<T> {
    return AppDataSource.transaction((manager) => work(new TxContext(manager)));
  }
}
