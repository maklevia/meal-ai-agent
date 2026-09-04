import { TxContext } from "src/core/TxContext";

export interface IUnitOfWork {
  run<T>(work: (tx: TxContext) => Promise<T>): Promise<T>;
}
