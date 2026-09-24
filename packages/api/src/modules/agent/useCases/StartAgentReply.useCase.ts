import { randomUUID } from "crypto";
import { AgentService } from "src/modules/agent/Agent.service";
import { getAgentGenerationRegistry } from "src/modules/agent/AgentGenerationRegistry";
import { ThreadRef } from "src/modules/chat/realtime/ChatRealtimeNotifier";
import { User } from "src/modules/user/entities/User.entity";

export type ReservationResult =
  | { acquired: true; requestId: string }
  | { acquired: false; activeRequestId: string };

type StartReservedOptions = {
  thread: ThreadRef;
  user: User;
  requestId: string;
  messageId: number;
};

export class StartAgentReplyUseCase {
  constructor(
    private readonly agentService: AgentService = new AgentService(),
    private readonly registry = getAgentGenerationRegistry(),
  ) {}

  reserveThread(threadId: number): ReservationResult {
    const requestId = randomUUID();
    const admission = this.registry.tryAcquire({ threadId, requestId });

    if (!admission.acquired) {
      return { acquired: false, activeRequestId: admission.active.requestId };
    }
    return { acquired: true, requestId };
  }

  releaseReservation(requestId: string): void {
    this.registry.release(requestId);
  }

  start(options: StartReservedOptions): void {
    const { thread, user, requestId, messageId } = options;

    this.registry.attachMessage(requestId, messageId);

    try {
      this.agentService.startReply({ thread, user, requestId, messageId });
    } catch (error) {
      this.releaseReservation(requestId);
      throw error;
    }
  }
}
