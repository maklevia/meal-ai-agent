import { ThreadUseCase } from "src/core/useCases/ThreadUseCase.base";
import { ChatMessage } from "src/modules/chat/entities/ChatMessage.entity";
import { ChatMessageRepository } from "src/modules/chat/repositories/ChatMessage.repository";

type GetThreadHistoryOptions = {
  threadId: number;
  beforeId?: number;
  limit: number;
};

type GetThreadHistoryResult = {
  messages: ChatMessage[];
  nextCursor: number | null;
};

export class GetThreadHistoryUseCase extends ThreadUseCase<
  GetThreadHistoryOptions,
  GetThreadHistoryResult
> {
  private readonly messageRepository: ChatMessageRepository =
    new ChatMessageRepository();

  async executeThread(
    options: GetThreadHistoryOptions,
  ): Promise<GetThreadHistoryResult> {
    const { threadId, beforeId, limit } = options;

    const rows = await this.messageRepository.getThreadMessages({
      threadId,
      beforeId,
      limit: limit + 1,
    });

    const hasMore = rows.length > limit;
    const page = hasMore ? rows.slice(0, limit) : rows;
    const oldest = page[page.length - 1];

    return {
      messages: [...page].reverse(),
      nextCursor: hasMore && oldest ? oldest.id : null,
    };
  }
}
