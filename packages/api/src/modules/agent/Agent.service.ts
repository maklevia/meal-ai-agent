import { Service } from "src/core/Service.base";
import { Agent } from "src/modules/agent/Agent";
import { AgentContextBuilder } from "src/modules/agent/AgentContextBuilder";
import { AgentGenerationRegistry } from "src/modules/agent/AgentGenerationRegistry";
import { getChatRealtimeNotifier } from "src/modules/chat/realtime/chatNotifier";
import {
  ChatRealtimeNotifier,
  ThreadRef,
} from "src/modules/chat/realtime/ChatRealtimeNotifier";
import { ChatMessageRepository } from "src/modules/chat/repositories/ChatMessage.repository";
import { ChatThreadRepository } from "src/modules/chat/repositories/ChatThread.repository";
import { User } from "src/modules/user/entities/User.entity";

type StartAgentReplyOptions = {
  thread: ThreadRef;
  user: User;
  requestId: string;
};

export class AgentService extends Service {
  constructor(
    private readonly notifier: ChatRealtimeNotifier = getChatRealtimeNotifier(),
    private readonly messageRepository: ChatMessageRepository = new ChatMessageRepository(),
    private readonly threadRepository: ChatThreadRepository = new ChatThreadRepository(),
    private readonly agentContext = new AgentContextBuilder(),
    private readonly agent = new Agent(),
    private readonly registry = new AgentGenerationRegistry(),
  ) {
    super();
  }

  startReply(options: StartAgentReplyOptions): void {
    const { requestId } = options;

    this.runGeneration(options).catch((error) => {
      console.error(`Agent generation ${requestId} unhandled error:`, error);
    });
  }

  private async runGeneration(options: StartAgentReplyOptions): Promise<void> {
    const { user, thread, requestId } = options;
    const signal = this.registry.getByRequest(requestId)?.abort.signal;

    try {
      this.notifier.agentStarted({ thread, requestId });

      const agentInput = await this.agentContext.build(user, thread);

      for await (const event of this.agent.stream(agentInput, signal)) {
        switch (event.type) {
          case "delta":
            this.registry.appendDelta(requestId, event.delta);
            this.notifier.agentDelta({
              thread,
              requestId,
              delta: event.delta,
            });
            break;

          case "finish":
            const savedMessage =
              await this.messageRepository.saveAssistantMessage({
                threadId: thread.id,
                content: event.text,
                tokenCount: event.completionTokens,
                generationRequestId: requestId,
              });

            await this.threadRepository.touchThread(thread.id);
            this.registry.finish(requestId, "completed");
            this.notifier.agentCompleted({
              thread,
              requestId,
              message: savedMessage,
            });
            break;
        }
      }
    } catch (error) {
      this.registry.finish(requestId, "failed");
      const reason = error instanceof Error ? error.message : "Unknow error";
      this.notifier.agentFailed({
        thread,
        requestId,
        reason,
      });
    }
  }
}
