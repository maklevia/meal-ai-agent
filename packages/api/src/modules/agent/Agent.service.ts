import e from "express";
import { Service } from "src/core/Service.base";
import { Agent } from "src/modules/agent/Agent";
import { AgentContextBuilder } from "src/modules/agent/AgentContextBuilder";
import { getChatRealtimeNotifier } from "src/modules/chat/realTime/chatNotifier";
import {
  ChatRealtimeNotifier,
  ThreadRef,
} from "src/modules/chat/realTime/ChatRealtimeNotifier";
import { ChatMessageRepository } from "src/modules/chat/repositories/ChatMessage.repository";
import { ChatThreadRepository } from "src/modules/chat/repositories/ChatThread.repository";
import { User } from "src/modules/user/entities/User.entity";

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

  async runGeneration(user: User, threadRef: ThreadRef): Promise<void> {
    try {
      // notify agent start

      const agentInput = await this.agentContext.build(user, threadRef.id);

      for await (const event of this.agent.stream(agentInput)) {
        switch (event.type) {
          case "delta":
            // this.notifier.agentDelta
            break;

          case "finish":
            const savedMessage =
              await this.messageRepository.saveAssistantMessage({
                threadId: threadRef.id,
                content: event.text,
                tokenCount: event.completionTokens,
              });

            await this.threadRepository.touchThread(threadRef.id);

            //notify generation completed
            break;
        }
      }
    } catch (error) {
      const reason = error instanceof Error ? error.message : "Unknow error";
      //notify agent failed
    }
  }
}
