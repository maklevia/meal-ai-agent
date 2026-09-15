import { ThreadUseCase } from "src/core/useCases/ThreadUseCase.base";

type LeaveThreadOptions = { threadId: number };

export class LeaveThreadUseCase extends ThreadUseCase<
  LeaveThreadOptions,
  void
> {
  async executeThread(): Promise<void> {}
}
