import { UseCase } from "src/core/UseCase.base";

type PingResult = { pong: true; at: string };

export class PingUseCase extends UseCase<void, PingResult> {
  async execute(): Promise<PingResult> {
    return { pong: true, at: new Date().toISOString() };
  }
}
