import { randomUUID } from "crypto";
import e from "express";
import { Service } from "src/core/Service.base";
import { Agent } from "src/modules/agent/Agent";
import { AgentContextBuilder } from "src/modules/agent/AgentContextBuilder";
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
};

export class AgentService extends Service {
  constructor(
    private readonly notifier: ChatRealtimeNotifier = getChatRealtimeNotifier(),
    private readonly messageRepository: ChatMessageRepository = new ChatMessageRepository(),
    private readonly threadRepository: ChatThreadRepository = new ChatThreadRepository(),
    private readonly agentContext = new AgentContextBuilder(),
    private readonly agent = new Agent(),
  ) {
    super();
  }

  startReply(options: StartAgentReplyOptions): string {
    const requestId = randomUUID();

    this.runGeneration(options, requestId).catch((error) => {
      console.error(`Agent generation ${requestId} unhandled error:`, error);
    });

    return requestId;
  }

  private async runGeneration(
    options: StartAgentReplyOptions,
    requestId: string,
  ): Promise<void> {
    try {
      this.notifier.agentStarted({ thread: options.thread, requestId });
      const agentInput = await this.agentContext.build(
        options.user,
        options.thread.id,
      );

      for await (const event of this.agent.stream(agentInput)) {
        switch (event.type) {
          case "delta":
            this.notifier.agentDelta({
              thread: options.thread,
              requestId,
              delta: event.delta,
            });
            break;

          case "finish":
            const savedMessage =
              await this.messageRepository.saveAssistantMessage({
                threadId: options.thread.id,
                content: event.text,
                tokenCount: event.completionTokens,
              });

            await this.threadRepository.touchThread(options.thread.id);

            this.notifier.agentCompleted({
              thread: options.thread,
              requestId,
              message: savedMessage,
            });
            break;
        }
      }
    } catch (error) {
      const reason = error instanceof Error ? error.message : "Unknow error";
      this.notifier.agentFailed({ thread: options.thread, requestId, reason });
    }
  }
}
